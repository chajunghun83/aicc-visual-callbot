<script setup>
// 구조화 정보 표시. 보유 종목 정보: 현재가·등락률·평가손익 등.
// 등락 색은 한국 증권 관례(상승=빨강 up / 하락=파랑 down / 보합=회색 flat).
// continueLabel이 주어지면 하단에 진행 버튼을 표시하고, 클릭 시 다음 단계로 넘어간다(수동 진행).
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  // 시세 요약
  price: { type: [Number, String], default: null }, // 현재가
  change: { type: Number, default: 0 }, // 등락액
  changeRate: { type: Number, default: 0 }, // 등락률(%)
  // 평가 정보: [{ label, value, tone? : 'up'|'down'|'flat'|'default' }]
  rows: { type: Array, default: () => [] },
  // 진행 버튼 라벨(없으면 버튼 미표시 = 표시 전용)
  continueLabel: { type: String, default: '' },
})
const emit = defineEmits(['submit'])

function next() {
  emit('submit', { value: true })
}

function dir(n) {
  if (n > 0) return 'up'
  if (n < 0) return 'down'
  return 'flat'
}

const priceTone = computed(() => dir(props.change))

const toneClass = {
  up: 'text-up',
  down: 'text-down',
  flat: 'text-flat',
  default: 'text-ink',
}

function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString('ko-KR') : n
}

function signed(n) {
  const s = n > 0 ? '+' : ''
  return `${s}${fmt(n)}`
}
</script>

<template>
  <section class="rounded-xl border border-border bg-surface p-5">
    <h2 v-if="title" class="text-base font-semibold text-ink">{{ title }}</h2>

    <!-- 현재가 + 등락 -->
    <div v-if="price !== null" class="mt-3 flex items-end justify-between">
      <span class="text-2xl font-semibold tabular-nums text-ink">{{ fmt(price) }}<span class="ml-1 text-base font-normal text-muted">원</span></span>
      <span class="text-sm font-medium tabular-nums" :class="toneClass[priceTone]">
        {{ signed(change) }} ({{ signed(changeRate) }}%)
      </span>
    </div>

    <!-- 평가 행 목록 -->
    <dl v-if="rows.length" class="mt-4 divide-y divide-border">
      <div v-for="(r, i) in rows" :key="i" class="flex items-center justify-between py-2.5">
        <dt class="text-sm text-muted">{{ r.label }}</dt>
        <dd class="text-sm font-medium tabular-nums" :class="toneClass[r.tone || 'default']">{{ r.value }}</dd>
      </div>
    </dl>

    <!-- 수동 진행 버튼 -->
    <button
      v-if="continueLabel"
      type="button"
      class="mt-5 w-full rounded-xl bg-accent px-4 py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
      @click="next"
    >
      {{ continueLabel }}
    </button>
  </section>
</template>
