<script setup>
// AI 파동 — 글로우 오브 형태. Lottie 애셋(src)이 연결되면 화려한 Lottie 오브를,
// 없으면 기존 CSS 글로우 오브를 fallback으로 렌더한다.
// status에 따라 재생 속도를 조절(말하는 중=빠르게)해 턴테이킹 신호를 유지한다.
import { computed } from 'vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const props = defineProps({
  status: { type: String, default: 'idle' }, // idle | listening | speaking
  src: { type: String, default: '' }, // .lottie / .json URL (없으면 CSS fallback)
  compact: { type: Boolean, default: false }, // 작은 오브(상세 화면 헤더용)
})

const speed = computed(() =>
  props.status === 'speaking' ? 1.6 : props.status === 'listening' ? 1.1 : 0.7,
)
const hasLottie = computed(() => !!props.src)
// compact면 작은 고정 크기로 오버라이드
const orbStyle = computed(() => (props.compact ? { height: '48px', width: '48px' } : {}))
</script>

<template>
  <!-- Lottie 애셋 연결 시 -->
  <DotLottieVue
    v-if="hasLottie"
    :src="src"
    autoplay
    loop
    :speed="speed"
    class="lottie-orb"
    :style="orbStyle"
  />

  <!-- 애셋 미연결 시: CSS 글로우 오브 fallback -->
  <div v-else class="orb-stage" :class="`is-${status}`" :style="orbStyle">
    <span class="ripple ripple-1"></span>
    <span class="ripple ripple-2"></span>
    <span class="halo"></span>
    <span class="orb"></span>
  </div>
</template>

<style scoped>
/* 오브 크기: 최대 400px, 화면이 작으면 높이(40vh)·너비(82vw)에 맞춰 축소 → 세로 스크롤 방지 */
.lottie-orb {
  height: min(440px, 46vh, 86vw);
  width: min(440px, 46vh, 86vw);
}

.orb-stage {
  position: relative;
  display: grid;
  place-items: center;
  height: min(440px, 46vh, 86vw);
  width: min(440px, 46vh, 86vw);
}
.orb-stage > * {
  grid-area: 1 / 1;
}

.orb {
  position: relative;
  height: 144px;
  width: 144px;
  border-radius: 9999px;
  background: radial-gradient(circle at 34% 28%, #6c97d6 0%, #2c5fa3 42%, #1e4e8c 70%, #163b69 100%);
  box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.28), 0 6px 22px rgba(22, 59, 105, 0.38);
  z-index: 2;
}
.halo {
  height: 162px;
  width: 162px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(30, 78, 140, 0.22) 0%, rgba(30, 78, 140, 0) 68%);
  z-index: 1;
}
.ripple {
  height: 104px;
  width: 104px;
  border-radius: 9999px;
  border: 2px solid rgba(30, 78, 140, 0.35);
  opacity: 0;
  z-index: 0;
}

.is-idle .orb { animation: breathe 3.8s ease-in-out infinite; }
.is-idle .halo { animation: halo-soft 3.8s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes halo-soft { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.08); } }

.is-listening .orb { animation: breathe 2s ease-in-out infinite; }
.is-listening .halo {
  background: radial-gradient(circle, rgba(46, 125, 91, 0.22) 0%, rgba(46, 125, 91, 0) 68%);
  animation: listen-halo 2s ease-out infinite;
}
@keyframes listen-halo {
  0% { opacity: 0.7; transform: scale(0.92); }
  70% { opacity: 0.25; transform: scale(1.18); }
  100% { opacity: 0; transform: scale(1.25); }
}

.is-speaking .orb { animation: pulse 1.05s ease-in-out infinite; }
.is-speaking .halo { animation: halo-soft 1.05s ease-in-out infinite; }
.is-speaking .ripple-1 { animation: ripple-out 1.6s ease-out infinite; }
.is-speaking .ripple-2 { animation: ripple-out 1.6s ease-out infinite; animation-delay: 0.8s; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
@keyframes ripple-out { 0% { opacity: 0.55; transform: scale(1); } 100% { opacity: 0; transform: scale(2.6); } }

@media (prefers-reduced-motion: reduce) {
  .orb-stage * { animation: none !important; }
}
</style>
