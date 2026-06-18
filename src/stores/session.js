import { defineStore } from 'pinia'

// 진입 컨텍스트 스토어 (PRD 7장: 단일 프론트엔드 + 채널 분기)
// 채널/방향/고객정보를 보관하고, 컴포넌트는 이를 주입받아 채널 비종속으로 동작.
// 채널 차이는 화면 복제가 아니라 "진입 파라미터 + 기능 플래그"로 분기한다.
export const useSessionStore = defineStore('session', {
  state: () => ({
    channel: 'phone', // 'phone' | 'app'
    direction: 'inbound', // 'inbound' | 'outbound'
    brand: 'ECS 증권',
    customerName: '',
    elapsedSeconds: 0,
    _timer: null,
  }),
  getters: {
    // 전화 채널은 미인증·문자 링크 진입 맥락이라 신뢰 장치(안심마크) 강조
    showTrustMark: (s) => s.channel === 'phone',
  },
  actions: {
    // URL 파라미터(?channel=phone|app)로 진입 컨텍스트 주입
    initFromQuery(search = window.location.search) {
      const params = new URLSearchParams(search)
      const channel = params.get('channel')
      const direction = params.get('direction')
      if (channel === 'phone' || channel === 'app') this.channel = channel
      if (direction === 'inbound' || direction === 'outbound') this.direction = direction
    },
    setContext(ctx = {}) {
      Object.assign(this, ctx)
    },
    startCallTimer() {
      this.stopCallTimer()
      this._timer = setInterval(() => {
        this.elapsedSeconds += 1
      }, 1000)
    },
    stopCallTimer() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    },
  },
})
