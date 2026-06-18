<script setup>
// 보유 종목 상세 (await). 차트 + 보유 현황 + 다음 버튼.
// 표시 수치는 3뎁스(StockPicker)와 동일하게 holdings 단일 출처를 props로 받는다.
import StockChart from './StockChart.vue'
import { chartPeriods } from '../../mock/data'

const props = defineProps({
  name: { type: String, default: '' },
  price: { type: [Number, String], default: null }, // 현재가
  change: { type: Number, default: 0 }, // 등락액
  changeRate: { type: Number, default: 0 }, // 등락률(%)
  rows: { type: Array, default: () => [] }, // 보유 상세
  returnTone: { type: String, default: 'flat' }, // 차트 색(수익 방향)
  series: { type: Object, default: () => ({}) }, // 차트 시계열
  continueLabel: { type: String, default: '' }, // 비어 있으면 다음 버튼 숨김
})
const emit = defineEmits(['submit'])

const toneClass = {
  up: 'text-up',
  down: 'text-down',
  flat: 'text-flat',
  default: 'text-ink',
}

function dir(n) {
  if (n > 0) return 'up'
  if (n < 0) return 'down'
  return 'flat'
}
function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString('ko-KR') : n
}
function signed(n) {
  return `${n > 0 ? '+' : ''}${fmt(n)}`
}
function next() {
  emit('submit', { value: true })
}
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <!-- 차트 (남는 세로 공간을 채움) -->
    <StockChart class="min-h-0 flex-1" :series="series" :periods="chartPeriods" :tone="returnTone" />

    <!-- 보유 현황 (남는 세로 공간을 채움, 행 균등 분배) -->
    <section class="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-surface px-4 py-3">
      <div class="flex items-baseline justify-between">
        <h2 class="text-sm font-semibold text-ink">{{ name }} 보유 현황</h2>
        <span class="text-xs font-medium tabular-nums" :class="toneClass[dir(change)]">
          {{ signed(change) }} ({{ signed(changeRate) }}%)
        </span>
      </div>
      <p class="mt-0.5 text-2xl font-semibold tabular-nums text-ink">
        {{ fmt(price) }}<span class="ml-1 text-base font-normal text-muted">원</span>
      </p>

      <dl class="mt-2 flex flex-1 flex-col divide-y divide-border">
        <div v-for="(r, i) in rows" :key="i" class="flex flex-1 items-center justify-between">
          <dt class="text-sm text-muted">{{ r.label }}</dt>
          <dd class="text-sm font-medium tabular-nums" :class="toneClass[r.tone || 'default']">{{ r.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- 다음 (continueLabel이 있을 때만 표시) -->
    <button
      v-if="continueLabel"
      type="button"
      class="shrink-0 w-full rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
      @click="next"
    >
      {{ continueLabel }}
    </button>
  </div>
</template>
