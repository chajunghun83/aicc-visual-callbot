<script setup>
// 종목 선택 (await). variant에 따라 카드 모양이 달라진다.
//   variant='holdings'(기본): 보유 종목 — 시세 + 평가손익 3행
//     1행: 종목명 · 평균매입가 · 평가금액 / 2행: 보유수량 · 현재가 · 평가손익 / 3행: (우측) 수익률
//   variant='watch': 관심 종목 — 종목명(좌) · 현재가 + 등락률(우) 1줄
// 현재가/평가손익/수익률/등락률 색은 한국 증권 관례(up=빨강 / down=파랑 / flat=회색).
// options(holdings): [{ value, name, price, changeRate, avgPrice, quantity, evalAmount, profit, returnRate, returnTone }]
// options(watch):    [{ value, name, price, changeRate }]
const props = defineProps({
  options: { type: Array, default: () => [] },
  variant: { type: String, default: 'holdings' }, // 'holdings' | 'watch'
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

// 등락률을 부호 포함 퍼센트로(예: +2.13% / -0.85%)
function signedRate(n) {
  if (typeof n !== 'number') return n
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
}

function choose(opt) {
  emit('submit', { value: opt.value, caption: opt.name })
}
</script>

<template>
  <!-- 관심 종목: 종목명(좌) · 현재가 + 등락률(우) 1줄 -->
  <div v-if="variant === 'watch'" class="flex flex-col gap-2.5">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-4 text-left transition-colors active:border-accent active:bg-accent/5"
      @click="choose(opt)"
    >
      <span class="text-[15px] font-semibold text-ink">{{ opt.name }}</span>
      <span class="flex items-baseline gap-2">
        <span class="text-[15px] font-semibold tabular-nums text-ink">{{ fmt(opt.price) }}원</span>
        <span class="text-sm font-medium tabular-nums" :class="toneClass[dir(opt.changeRate)]">
          {{ signedRate(opt.changeRate) }}
        </span>
      </span>
    </button>
  </div>

  <!-- 보유 종목: 시세 + 평가손익 3행 -->
  <div v-else class="flex flex-col gap-2.5">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="grid w-full grid-cols-3 gap-x-2 rounded-xl border border-border bg-surface px-4 py-3.5 text-left transition-colors active:border-accent active:bg-accent/5"
      @click="choose(opt)"
    >
      <!-- 1행: 종목명 · 평균매입가 · 평가금액 -->
      <span class="text-[15px] font-semibold text-ink">{{ opt.name }}</span>
      <span class="text-right text-sm tabular-nums text-muted">{{ opt.avgPrice }}</span>
      <span class="text-right text-[15px] font-semibold tabular-nums text-ink">{{ opt.evalAmount }}</span>

      <!-- 2행: 보유수량 · 현재가 · 평가손익 -->
      <span class="mt-0.5 text-xs text-muted">{{ opt.quantity }}</span>
      <span class="mt-0.5 text-right text-sm font-medium tabular-nums" :class="toneClass[dir(opt.changeRate)]">
        {{ fmt(opt.price) }}원
      </span>
      <span class="mt-0.5 text-right text-sm font-medium tabular-nums" :class="toneClass[opt.returnTone || 'default']">
        {{ opt.profit }}
      </span>

      <!-- 3행: (우측) 수익률 -->
      <span class="text-right text-xs font-medium tabular-nums" :class="toneClass[opt.returnTone || 'default']" style="grid-column: 3">
        ({{ opt.returnRate }})
      </span>
    </button>
  </div>
</template>
