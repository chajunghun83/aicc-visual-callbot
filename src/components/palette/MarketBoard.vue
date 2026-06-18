<script setup>
// 오늘 증시 상황 (2번 시나리오, await — 마지막 단계로 화면 유지).
// 주요 지수/환율/코인을 2열 바둑판으로, 하단에 공포 & 탐욕 지수 게이지.
// 등락 색은 한국 증권 관례(up=빨강 / down=파랑 / flat=회색). 아이콘은 모노크롬 라인.
import { computed } from 'vue'

const props = defineProps({
  indices: { type: Array, default: () => [] }, // [{ name, value, change, changeRate, icon }]
  fearGreed: { type: Object, default: () => ({}) }, // { value, label, source }
})

const toneClass = {
  up: 'text-up',
  down: 'text-down',
  flat: 'text-flat',
}

function dir(n) {
  if (n > 0) return 'up'
  if (n < 0) return 'down'
  return 'flat'
}

// 등락 방향 기호(이모지 아님, 기하 문자)
function arrow(n) {
  if (n > 0) return '▲'
  if (n < 0) return '▼'
  return '–'
}

function signedRate(n) {
  if (typeof n !== 'number') return n
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
}

// 공포 & 탐욕 마커 위치(%) — 0~100을 좌우 여백 안에서 클램프
const fgValue = () => Math.max(0, Math.min(100, props.fearGreed?.value ?? 0))

// 값 라벨을 마커 위치 위에 띄우되, 박스를 넘지 않도록 가장자리에서 정렬 보정.
//   왼쪽 끝(≤12%) → 왼쪽 정렬, 오른쪽 끝(≥88%) → 오른쪽 정렬, 그 외 → 중앙 정렬
const labelStyle = computed(() => {
  const v = fgValue()
  const tx = v <= 12 ? '0%' : v >= 88 ? '-100%' : '-50%'
  return { left: `${v}%`, transform: `translateX(${tx})` }
})

// 게이지 배경(공포→중립→탐욕). 밝은 톤으로 생동감 있게(빨강→노랑→초록).
const gaugeStyle = {
  background: 'linear-gradient(90deg, #ef6f6f 0%, #f4bd52 50%, #57c08a 100%)',
}
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <!-- 지수 바둑판(2열) — 남는 세로 공간을 행 균등으로 채움 -->
    <div class="grid flex-1 auto-rows-fr grid-cols-2 gap-3">
      <div
        v-for="item in indices"
        :key="item.name"
        class="flex flex-col justify-center rounded-xl border border-border bg-surface px-3.5 py-3"
      >
        <div class="flex items-center gap-1.5 text-muted">
          <!-- 모노크롬 라인 아이콘 -->
          <svg
            v-if="item.icon === 'index'"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 16l4-5 4 3 6-8" />
            <path d="M14 6h4v4" />
          </svg>
          <svg
            v-else-if="item.icon === 'fx'"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 8h13l-3-3" />
            <path d="M20 16H7l3 3" />
          </svg>
          <svg
            v-else-if="item.icon === 'crypto'"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 6v12M12 6v12" />
            <path d="M8 6h6a3 3 0 010 6H8M8 12h7a3 3 0 010 6H8" />
          </svg>
          <!-- gold: 금괴 -->
          <svg
            v-else-if="item.icon === 'gold'"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 9h12l-1.5 7h-9z" />
            <path d="M9 9l1-2.5h4L15 9" />
          </svg>
          <!-- oil: 유가(방울) -->
          <svg
            v-else
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3.5c3.2 4 4.8 6.5 4.8 9a4.8 4.8 0 11-9.6 0c0-2.5 1.6-5 4.8-9z" />
          </svg>
          <span class="truncate text-xs font-medium">{{ item.name }}</span>
        </div>

        <p class="mt-1 text-[22px] font-semibold leading-tight tabular-nums text-ink">{{ item.value }}</p>
        <p class="mt-0.5 text-[13px] font-medium tabular-nums" :class="toneClass[dir(item.changeRate)]">
          {{ arrow(item.changeRate) }} {{ item.change }} ({{ signedRate(item.changeRate) }})
        </p>
      </div>
    </div>

    <!-- 공포 & 탐욕 지수 -->
    <section class="shrink-0 rounded-xl border border-border bg-surface px-4 py-4">
      <h2 class="text-sm font-semibold text-ink">공포 &amp; 탐욕 지수</h2>

      <!-- 값 라벨: 마커 위치 위에 따라옴(가장자리에서 박스 안으로 정렬 보정) -->
      <div class="relative mt-2 h-7">
        <div
          class="absolute bottom-0 flex items-baseline gap-1 whitespace-nowrap"
          :style="labelStyle"
        >
          <span class="text-xl font-semibold tabular-nums text-ink">{{ fearGreed.value }}</span>
          <span class="text-[13px] font-medium text-muted">{{ fearGreed.label }}</span>
        </div>
      </div>

      <!-- 게이지(공포→중립→탐욕 그라데이션) + 현재 위치 마커 -->
      <div class="relative mt-1.5 h-2 rounded-full" :style="gaugeStyle">
        <span
          class="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow-sm"
          :style="{ left: fgValue() + '%' }"
        />
      </div>
      <div class="mt-1.5 flex justify-between text-[10px] text-muted">
        <span>공포</span>
        <span>중립</span>
        <span>탐욕</span>
      </div>
    </section>
  </div>
</template>
