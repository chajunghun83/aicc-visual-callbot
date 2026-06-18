<script setup>
// zone 2 — AI 파동. 두 형태를 모드로 전환한다(PRD 11장).
//   - mode 'orb'  : 글로우 오브(기본). 콘텐츠가 적은 단계에서 크게, AI 존재감 강조.
//   - mode 'wave' : SiriWave 파형. 정보가 많은 단계에서 공간을 양보하며 작게.
// lottieSrc가 있으면 orb는 Lottie 애셋으로 렌더되고, 없으면 CSS 글로우 오브로 동작한다.
import WaveOrb from './WaveOrb.vue'
import WaveSiri from './WaveSiri.vue'

defineProps({
  status: { type: String, default: 'idle' }, // idle | listening | speaking
  mode: { type: String, default: 'orb' }, // 'orb' | 'wave'
  lottieSrc: { type: String, default: '' },
  // 오버레이 텍스트의 수직 위치(오브 영역 상단 기준). 음수일수록 위로 올라감.
  textTop: { type: String, default: '-56px' },
  // compact: 작은 오브 + 멘트를 가로로(상세 화면 헤더)
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <!-- compact: 작은 오브 + 멘트 가로(말풍선) -->
  <div v-if="compact" class="flex items-center gap-2.5">
    <WaveOrb compact :status="status" :src="lottieSrc" />
    <div class="min-w-0 flex-1 rounded-2xl bg-bg px-3.5 py-2">
      <slot />
    </div>
  </div>

  <!-- 기본: 큰 오브 + 멘트 오버레이(오브 영역 상단) -->
  <div v-else class="relative flex items-center justify-center">
    <WaveOrb v-if="mode === 'orb'" :status="status" :src="lottieSrc" />
    <WaveSiri v-else :status="status" />
    <div
      v-if="$slots.default"
      class="pointer-events-none absolute inset-x-0 px-3"
      :style="{ top: textTop }"
    >
      <slot />
    </div>
  </div>
</template>
