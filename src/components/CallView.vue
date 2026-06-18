<script setup>
// 보이는 콜봇 메인 화면 (5-zone 셸 + 시나리오 엔진).
// 진입 후 화면 — 전화/앱 어느 채널로 진입했든 이 화면으로 수렴(진입 컨텍스트만 주입).
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import TrustHeader from './shell/TrustHeader.vue'
import WaveIndicator from './shell/WaveIndicator.vue'
import BotSpeech from './BotSpeech.vue'
import LiveCaption from './shell/LiveCaption.vue'
import { paletteComponents } from './palette'
import { useSessionStore } from '../stores/session'
import { useConversationStore } from '../stores/conversation'
import { useScenarioStore } from '../stores/scenario'
import { stockHoldingsScenario } from '../scenarios/stock-holdings'

const session = useSessionStore()
const conversation = useConversationStore()
const scenario = useScenarioStore()

const { brand, customerName, elapsedSeconds, showTrustMark } = storeToRefs(session)
const { waveStatus, currentSay, currentSayOnce } = storeToRefs(conversation)
const { currentComponent, currentProps, ended } = storeToRefs(scenario)

// 종료 의도 감지 키워드(넓게). 어느 단계에서든 STT로 이 말이 들어오면 종료 화면으로 전환.
const END_RE =
  /종료|그만|끊을게|끊어|수고하|잘\s*있어|안녕히|더\s*(필요|없|이상)|이제\s*(됐|없|그만|끝)|괜찮(아|습니다|네)|됐(어|습니다|네|어요)|필요\s*없|없어(요|졌|$)|없습니다/

// 종료 멘트(표준 안내형)
const END_SAY = '상담을 종료합니다.\n이용해 주셔서 감사합니다.'

// 헤더의 통화 종료 버튼 클릭 → STT 종료 멘트와 동일하게 종료 화면으로 전환
function onEndCall() {
  scenario.end(END_SAY)
  liveCaptionClear.value += 1
}

const activeComponent = computed(() =>
  currentComponent.value ? paletteComponents[currentComponent.value] ?? null : null,
)

// 파동 모드: 일부 단계는 SiriWave(작게), 그 외엔 글로우 오브(크게)
const WAVE_COMPONENTS = ['AnalysisResult']
const waveMode = computed(() =>
  WAVE_COMPONENTS.includes(currentComponent.value) ? 'wave' : 'orb',
)

// compact 레이아웃 단계: 작은 오브 헤더 + 콘텐츠(정보가 많은 상세 화면)
const COMPACT_COMPONENTS = ['StockDetail', 'MarketBoard']
const isCompact = computed(() => COMPACT_COMPONENTS.includes(currentComponent.value))

// AI 멘트 타이핑 속도(ms/자). 값이 클수록 느림. 모든 단계 공통(일반·상세 동일).
const CHAR_MS = 55

// Lottie 오브 애셋 경로(public/lottie/ai-orb.lottie). 비어 있으면 CSS 글로우 오브로 동작.
const LOTTIE_ORB_SRC = `${import.meta.env.BASE_URL}lottie/ai-orb.lottie`

// ▼ 봇 텍스트 위치 조절: 오브 영역 상단 기준 오프셋(px).
//   더 작게(예: -90px) → 텍스트가 위로 올라가 오브에서 멀어짐.
//   더 크게(예: -20px) → 텍스트가 아래로 내려와 오브에 가까워짐.
const ORB_TEXT_TOP = '-40px'

function onSubmit(payload = {}) {
  scenario.submitSlot(payload.value, payload.caption)
}

// 인증 단계에서는 STT 입력값을 입력칸 채우기 애니메이션으로 보여주기 위해 신호로 전달.
const sttSignal = ref(null)
let sttSeq = 0

// 하단 STT 입력(텍스트, 엔터) → 현재 단계의 답으로 처리
function onStt(text) {
  // 어느 단계에서건 종료 멘트가 들어오면 즉시 종료 화면으로 전환(다른 처리보다 우선)
  if (END_RE.test(text)) {
    scenario.end(END_SAY)
    liveCaptionClear.value += 1
    return
  }
  if (currentComponent.value === 'IdentityVerify') {
    // IdentityVerify가 입력칸을 채우는 애니메이션 후 스스로 제출 → onSubmit으로 진행
    sttSignal.value = { value: text, seq: ++sttSeq }
  } else {
    // 증시 보드는 질문해도 단계가 유지되므로(자동 비우기 미발동), 전송 후 입력칸을 비워 다음 질문 가능하게
    const stayOnSameStep = currentComponent.value === 'MarketBoard'
    scenario.submitText(text)
    if (stayOnSameStep) liveCaptionClear.value += 1
  }
}

// 추천 질문 버튼 선택 → 하단 STT 입력칸에 문구를 채우는 신호 전달(채워진 뒤 자동 전송)
const liveCaptionFill = ref(null)
let fillSeq = 0
function onPick(text) {
  liveCaptionFill.value = { text, seq: ++fillSeq }
}

// 표시 컴포넌트(단계)가 바뀌면 STT 입력칸을 비운다(확인 멘트 단계까지는 발화 텍스트 유지).
const liveCaptionClear = ref(0)
watch(currentComponent, () => {
  liveCaptionClear.value += 1
})

function onSpeechDone() {
  scenario.onSpeechComplete()
}

onMounted(() => {
  session.startCallTimer()
  scenario.load(stockHoldingsScenario)
  scenario.start()
})

onUnmounted(() => {
  session.stopCallTimer()
})
</script>

<template>
  <div class="mx-auto flex h-full max-w-md flex-col bg-bg">
    <TrustHeader
      :brand="brand"
      :customer-name="customerName"
      :elapsed-seconds="elapsedSeconds"
      :verified="showTrustMark"
      :call-ended="ended"
      @end-call="onEndCall"
    />

    <main class="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <!-- compact 단계(상세): 작은 오브 헤더 + 콘텐츠 -->
      <template v-if="isCompact">
        <WaveIndicator compact :status="waveStatus" :lottie-src="LOTTIE_ORB_SRC">
          <BotSpeech
            compact
            :text="currentSay"
            :one-shot="currentSayOnce"
            :char-ms="CHAR_MS"
            @done="onSpeechDone"
          />
        </WaveIndicator>
        <div class="mt-3 min-h-0 flex-1">
          <component
            :is="activeComponent"
            v-bind="currentProps"
            @submit="onSubmit"
            @pick="onPick"
          />
        </div>
      </template>

      <!-- 기본 단계: 오브 중앙 + 텍스트 오버레이 + 카드 하단 -->
      <template v-else>
        <div class="flex flex-1 items-center justify-center">
          <WaveIndicator
            :status="waveStatus"
            :mode="waveMode"
            :lottie-src="LOTTIE_ORB_SRC"
            :text-top="ORB_TEXT_TOP"
          >
            <BotSpeech
              :text="currentSay"
              :one-shot="currentSayOnce"
              :char-ms="CHAR_MS"
              @done="onSpeechDone"
            />
          </WaveIndicator>
        </div>
        <div v-if="activeComponent" class="w-full shrink-0 pt-4">
          <component
            :is="activeComponent"
            v-bind="currentProps"
            :stt-signal="currentComponent === 'IdentityVerify' ? sttSignal : undefined"
            @submit="onSubmit"
            @pick="onPick"
          />
        </div>
      </template>
    </main>

    <!-- 종료 화면에서는 하단 입력바를 숨긴다(통화 종료) -->
    <LiveCaption
      v-if="!ended"
      :fill-signal="liveCaptionFill"
      :clear-signal="liveCaptionClear"
      @send="onStt"
    />
  </div>
</template>
