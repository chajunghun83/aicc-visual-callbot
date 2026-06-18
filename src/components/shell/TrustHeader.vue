<script setup>
// zone 1 — 신뢰 헤더: 브랜드·안심마크·통화 상태·타이머
// 전화 채널에서 특히 강조(보이스피싱 우려 대응). 진입 컨텍스트는 props로 주입(채널 비종속).
// 브랜드 로고 이미지(루트 image/ 폴더). 롤백 시 이 import와 템플릿의 <img>를 제거하고 텍스트 span 주석을 해제.
import logoSrc from '../../../image/ecs 증권 이미지3.png'

defineProps({
  brand: { type: String, default: '증권' },
  customerName: { type: String, default: '' },
  // 통화 경과 시간(초) — 단계 1에서는 더미 값
  elapsedSeconds: { type: Number, default: 0 },
  // 안심마크 표시 여부(전화 채널에서 true)
  verified: { type: Boolean, default: true },
  // 이미 통화가 종료된 상태면 종료 버튼을 숨긴다
  callEnded: { type: Boolean, default: false },
})

// 통화 종료 버튼 클릭 → 상위에서 종료 처리
const emit = defineEmits(['end-call'])

// 초 → mm:ss
function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <header class="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
    <div class="flex items-center gap-2.5">
      <!-- 브랜드 로고(이미지). 롤백: 아래 img 줄을 지우고 다음 span 주석을 해제하면 텍스트로 복귀 -->
      <img :src="logoSrc" :alt="brand" class="h-4 w-auto" />
      <!-- <span class="text-base font-semibold tracking-tight text-ink">{{ brand }}</span> -->
      <!-- 안심마크: 발신/브랜드 검증 표기 -->
      <span
        v-if="verified"
        class="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-xs font-medium text-accent"
      >
        <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" aria-hidden="true">
          <path
            d="M8 1.5 13 3.5v4c0 3.2-2.1 5.7-5 6.9-2.9-1.2-5-3.7-5-6.9v-4L8 1.5Z"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linejoin="round"
          />
          <path d="m5.8 8 1.6 1.6L10.4 6.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        안심통화
      </span>
    </div>

    <div class="flex items-center gap-2 text-sm text-muted">
      <span class="whitespace-nowrap">{{ customerName ? customerName + '님 통화 중' : '통화 중' }}</span>
      <span class="tabular-nums text-ink">{{ fmt(elapsedSeconds) }}</span>
      <!-- 통화 종료 버튼: 빨간 포인트 + 라운드. 종료 후에는 숨김 -->
      <button
        v-if="!callEnded"
        type="button"
        class="whitespace-nowrap rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-danger/90 active:bg-danger/80"
        @click="emit('end-call')"
      >
        통화 종료
      </button>
    </div>
  </header>
</template>
