<script setup>
// 종목 차트 (SVG 자체 구현). 데이터는 목업 시계열.
// 기간 탭(1일/1주/1달/1년) + 확대/축소/새로고침. 라인 색은 수익 방향(tone)과 일치.
import { ref, computed } from 'vue'

const props = defineProps({
  series: { type: Object, default: () => ({}) }, // { '1일': number[], ... }
  periods: { type: Array, default: () => ['1일', '1주', '1달', '1년'] },
  tone: { type: String, default: 'flat' }, // up | down | flat
})

const colors = { up: '#D14343', down: '#2F6FD0', flat: '#6B7480' }
const color = computed(() => colors[props.tone] || colors.flat)

const period = ref(props.periods[0])
const ratio = ref(1) // 표시 구간 비율(1=전체, 작을수록 확대)
const refreshTick = ref(0)

// SVG 좌표계
const W = 320
const H = 120
const PAD = 10

const raw = computed(() => props.series[period.value] || [])

// 새로고침 시 위상을 바꿔 라인 모양을 소폭 변형(마지막 값=현재가는 고정)
const shifted = computed(() => {
  const r = raw.value
  if (!r.length) return []
  const amp = ((Math.max(...r) - Math.min(...r)) || 1) * 0.04
  return r.map((v, i) =>
    i === r.length - 1 ? v : Math.round(v + Math.sin(i * 0.9 + refreshTick.value * 1.3) * amp),
  )
})

// 줌: 뒤쪽 구간만 표시
const view = computed(() => {
  const s = shifted.value
  const start = Math.floor(s.length * (1 - ratio.value))
  return s.slice(start)
})

const bounds = computed(() => {
  const d = view.value
  if (!d.length) return { min: 0, max: 1 }
  const min = Math.min(...d)
  const max = Math.max(...d)
  return { min, max: max === min ? min + 1 : max }
})

function xy(v, i, len) {
  const { min, max } = bounds.value
  const x = PAD + (len < 2 ? 0 : (i / (len - 1)) * (W - 2 * PAD))
  const y = PAD + (1 - (v - min) / (max - min)) * (H - 2 * PAD)
  return [x, y]
}

const linePoints = computed(() => {
  const d = view.value
  return d.map((v, i) => xy(v, i, d.length).map((n) => n.toFixed(1)).join(',')).join(' ')
})

const areaPoints = computed(() => {
  if (!linePoints.value) return ''
  return `${PAD},${H - PAD} ${linePoints.value} ${W - PAD},${H - PAD}`
})

const last = computed(() => {
  const d = view.value
  if (!d.length) return null
  const [x, y] = xy(d[d.length - 1], d.length - 1, d.length)
  return { x, y, v: d[d.length - 1] }
})

const fmt = (n) => n.toLocaleString('ko-KR')

function selectPeriod(p) {
  period.value = p
  ratio.value = 1
}
function zoomIn() {
  ratio.value = Math.max(0.3, +(ratio.value * 0.6).toFixed(3))
}
function zoomOut() {
  ratio.value = Math.min(1, +(ratio.value / 0.6).toFixed(3))
}
function refresh() {
  refreshTick.value += 1
}
</script>

<template>
  <section class="flex flex-col rounded-xl border border-border bg-surface p-3">
    <!-- 상단: 기간 탭 + 컨트롤 -->
    <div class="flex items-center justify-between">
      <div class="flex gap-1">
        <button
          v-for="p in periods"
          :key="p"
          type="button"
          class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
          :class="p === period ? 'bg-accent text-white' : 'text-muted active:bg-bg'"
          @click="selectPeriod(p)"
        >
          {{ p }}
        </button>
      </div>
      <div class="flex gap-0.5 text-muted">
        <button type="button" class="rounded-md p-1 active:bg-bg" aria-label="확대" @click="zoomIn">
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M13 13l3.5 3.5M9 6.8v4.4M6.8 9h4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="rounded-md p-1 active:bg-bg" aria-label="축소" @click="zoomOut">
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M13 13l3.5 3.5M6.8 9h4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="rounded-md p-1 active:bg-bg" aria-label="새로고침" @click="refresh">
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none">
            <path d="M15.5 6.5A6 6 0 1 0 16 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <path d="M15.8 3.5v3.2h-3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 차트 (카드 높이에 맞춰 채움) -->
    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-2 min-h-0 w-full flex-1" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.18" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polygon v-if="areaPoints" :points="areaPoints" :fill="`url(#chartArea)`" />
      <polyline
        v-if="linePoints"
        :points="linePoints"
        fill="none"
        :stroke="color"
        stroke-width="1.8"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
      <circle v-if="last" :cx="last.x" :cy="last.y" r="2.8" :fill="color" vector-effect="non-scaling-stroke" />
    </svg>

    <!-- 현재가 라벨 -->
    <div v-if="last" class="mt-1 text-right text-sm font-semibold tabular-nums" :style="{ color }">
      {{ fmt(last.v) }}원
    </div>
  </section>
</template>
