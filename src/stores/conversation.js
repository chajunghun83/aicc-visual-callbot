import { defineStore } from 'pinia'

// 대화 상태 스토어 (PRD 7장: 음성·터치 통합 슬롯)
// 슬롯(채워진 값) + 자막 로그 + WaveIndicator 상태를 관리.
// 모든 입력형 컴포넌트는 "슬롯을 채운다"로 통일되며, 음성/터치 어느 쪽으로 채워도 동일하게 처리.
export const useConversationStore = defineStore('conversation', {
  state: () => ({
    slots: {}, // { selectedStock, verifiedPhone, ... }
    captions: [], // [{ role: 'bot' | 'user', text }]
    waveStatus: 'idle', // 'idle' | 'listening' | 'speaking'
    currentSay: '', // 현재 봇 발화(오브 위 BotSpeech가 표시)
    currentSayOnce: false, // true면 한 문장씩이 아니라 전체를 한 번에 표시
  }),
  actions: {
    setWave(status) {
      this.waveStatus = status
    },
    // 봇 발화 텍스트 설정(오브 위 표시용). once=true면 전체를 한 번에 표시.
    setCurrentSay(text, once = false) {
      this.currentSayOnce = once
      this.currentSay = text
    },
    // 봇 발화 자막 추가
    pushBotCaption(text) {
      this.captions.push({ role: 'bot', text })
    },
    // 고객 발화/입력 자막 추가
    pushUserCaption(text) {
      this.captions.push({ role: 'user', text })
    },
    // 슬롯 채우기 — await 스텝의 진행 트리거
    fillSlot(name, value) {
      this.slots[name] = value
    },
    reset() {
      this.slots = {}
      this.captions = []
      this.waveStatus = 'idle'
      this.currentSay = ''
      this.currentSayOnce = false
    },
  },
})
