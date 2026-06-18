import { defineStore } from 'pinia'
import { useConversationStore } from './conversation'

// 시나리오 엔진 스토어 (PRD 5장 + 설계 5장: 하이브리드 재생)
//
// 시나리오는 스텝 배열(데이터)로 정의하고 엔진이 순차 재생한다.
// 스텝 종류:
//   - type: 'auto'  → 봇 발화 + 컴포넌트 노출 후 짧은 딜레이 → 자동으로 다음 스텝
//   - type: 'await' → 컴포넌트/STT로 사용자가 지정 슬롯을 채울 때까지 대기 → 채워지면 다음 스텝
// 스텝 필드:
//   { type, say, userSay, show, props, slot, autoDelayMs, fromText, skipIf, backOn, backTo }
//   - skipIf(slots): true면 해당 스텝을 건너뛴다(조건 분기).
//   - backOn(text)/backTo: STT 입력이 backOn에 맞으면 backTo 슬롯 단계로 되돌아간다(뒤로 가기).
//   - say / props / userSay 는 값 또는 (slots) => 값 함수.
//   - userSay: 봇 발화 전 고객 자막 선노출(와우 전환 등).
//   - fromText(text, slots): STT 입력 텍스트를 해당 슬롯 값으로 변환(await 스텝). 없으면 입력 텍스트 그대로.
//     (slots는 의도별 분기용 두 번째 인자 — 기존 함수는 무시해도 됨)
//
// 봇 발화(say)는 오브 위 BotSpeech 컴포넌트가 표시하며, 표시가 끝나면 onSpeechComplete()가 호출된다.
// await 스텝은 발화가 끝나기 전이라도 사용자가 행동(submitSlot/submitText)하면 발화를 건너뛰고 진행한다.

const AUTO_DELAY_MS = 600

// 값 또는 (slots) => 값 형태를 평가
function evalMaybe(v, slots) {
  return typeof v === 'function' ? v(slots) : v
}

// 봇 발화 완료를 기다리는 resolver (모듈 스코프)
let speechResolve = null

export const useScenarioStore = defineStore('scenario', {
  state: () => ({
    steps: [],
    index: -1,
    running: false,
    currentComponent: null,
    currentProps: {},
    awaitingSlot: null,
    finished: false,
    ended: false, // 사용자가 종료 멘트로 통화를 끝낸 상태(종료 화면 표시)
  }),
  getters: {
    currentStep: (s) => (s.index >= 0 ? s.steps[s.index] : null),
  },
  actions: {
    load(steps) {
      this.steps = steps
      this.index = -1
      this.running = false
      this.finished = false
      this.currentComponent = null
      this.currentProps = {}
      this.awaitingSlot = null
      this.ended = false
    },

    async start() {
      if (this.running || this.steps.length === 0) return
      this.running = true
      await this._runStep(0)
    },

    async _runStep(i) {
      if (i >= this.steps.length) {
        this.finished = true
        this.running = false
        this.currentComponent = null
        this.awaitingSlot = null
        return
      }

      const conversation = useConversationStore()

      // 조건부 스킵: skipIf(slots)가 true면 이 스텝을 건너뛴다.
      const candidate = this.steps[i]
      if (candidate.skipIf && candidate.skipIf(conversation.slots)) {
        return this._runStep(i + 1)
      }

      this.index = i
      const step = candidate
      const slots = conversation.slots

      // 고객 자막 선노출(와우 전환 연출 등)
      const userText = evalMaybe(step.userSay, slots)
      if (userText) conversation.pushUserCaption(userText)

      // 컴포넌트 노출 (show도 (slots)=>값 함수 평가 가능 — 의도별 분기)
      this.currentComponent = evalMaybe(step.show, slots) ?? null
      this.currentProps = evalMaybe(step.props, slots) ?? {}

      const sayText = evalMaybe(step.say, slots)
      const slot = step.slot ?? null

      if (step.type === 'await') {
        // 입력을 즉시 받을 수 있게 슬롯을 먼저 연다(멘트 중에도 행동 가능 = 발화 스킵).
        this.awaitingSlot = slot
        if (sayText) {
          conversation.setCurrentSay(sayText, !!step.sayOnce)
          conversation.setWave('speaking')
          // 발화 완료를 기다리지 않음. 완료되면(스킵 안 됐으면) 듣는 상태로 전환.
          this._awaitSpeech().then(() => {
            if (this.awaitingSlot === slot) conversation.setWave('listening')
          })
        } else {
          conversation.setWave('listening')
        }
      } else {
        this.awaitingSlot = null
        if (sayText) {
          conversation.setCurrentSay(sayText, !!step.sayOnce)
          conversation.setWave('speaking')
          await this._awaitSpeech()
        }
        conversation.setWave('idle')
        await new Promise((r) => setTimeout(r, step.autoDelayMs ?? AUTO_DELAY_MS))
        await this._runStep(i + 1)
      }
    },

    _awaitSpeech() {
      return new Promise((resolve) => {
        speechResolve = resolve
      })
    },

    // 진행 중인 발화를 종료(스킵)
    _endSpeech() {
      if (speechResolve) {
        speechResolve()
        speechResolve = null
      }
    },

    // BotSpeech가 발화 표시를 끝내면 호출 → 엔진 진행 재개
    onSpeechComplete() {
      this._endSpeech()
    },

    // 어느 단계에서든 사용자가 종료 멘트를 말하면 호출 → 종료 화면으로 전환.
    // 진행 중인 발화를 끊고, 화면 컴포넌트(버튼 등)를 모두 내린 뒤 종료 멘트를 재생한다.
    async end(sayText) {
      const conversation = useConversationStore()
      this._endSpeech()
      this.awaitingSlot = null
      this.running = false // 이후 submitSlot/submitText 입력은 무시됨
      this.ended = true
      this.finished = true
      this.currentComponent = null // 첫 화면에서 버튼만 사라진 모습(오브 + 멘트만)
      this.currentProps = {}
      if (sayText) {
        conversation.setCurrentSay(sayText, true) // 한 번에 표시
        conversation.setWave('speaking')
        await this._awaitSpeech()
      }
      conversation.setWave('idle')
    },

    // await 스텝에서 화면 컴포넌트가 슬롯을 채울 때 호출. (발화 중이면 스킵하고 진행)
    async submitSlot(value, userCaption) {
      if (!this.running || this.awaitingSlot == null) return
      this._endSpeech()
      const conversation = useConversationStore()
      conversation.fillSlot(this.awaitingSlot, value)
      if (userCaption) conversation.pushUserCaption(userCaption)
      this.awaitingSlot = null
      await this._runStep(this.index + 1)
    },

    // await 스텝에서 STT(하단 텍스트 입력)로 답할 때 호출. (발화 중이면 스킵하고 진행)
    // 입력 텍스트를 그 단계의 답으로 처리(fromText로 슬롯 값 변환) + 고객 자막 노출.
    // fromText 결과가 null/undefined면 유효하지 않은 입력 → rejectSay(있으면) 발화 후 단계 유지.
    async submitText(text) {
      if (!this.running || this.awaitingSlot == null) return
      const trimmed = (text ?? '').trim()
      if (!trimmed) return
      const conversation = useConversationStore()
      const step = this.steps[this.index]

      // 이전 단계로 돌아가기 (backOn 조건 매칭 시 backTo 슬롯 단계로 이동)
      if (step.backOn && step.backOn(trimmed)) {
        const idx = this.steps.findIndex((s) => s.slot === step.backTo)
        if (idx >= 0) {
          conversation.pushUserCaption(trimmed)
          this._endSpeech()
          this.awaitingSlot = null
          await this._runStep(idx)
          return
        }
      }

      const value = step.fromText ? step.fromText(trimmed, conversation.slots) : trimmed

      if (value == null) {
        // 유효하지 않은 입력 → 거절 멘트 발화, 화면/단계는 그대로 유지(진행 안 함)
        conversation.pushUserCaption(trimmed)
        if (step.rejectSay) {
          this._endSpeech()
          conversation.setCurrentSay(step.rejectSay(trimmed, conversation.slots))
          conversation.setWave('speaking')
          this._awaitSpeech().then(() => {
            if (this.awaitingSlot != null) conversation.setWave('listening')
          })
        }
        return
      }

      this._endSpeech()
      conversation.fillSlot(this.awaitingSlot, value)
      conversation.pushUserCaption(trimmed)
      this.awaitingSlot = null
      await this._runStep(this.index + 1)
    },
  },
})
