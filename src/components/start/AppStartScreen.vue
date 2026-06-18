<script setup>
// 앱 시작 화면 (PRD 10장). 자사 앱 화면에서 '보이는 상담' 버튼 → 탭 → 화면 연결.
// 이미 로그인된 신뢰 환경이라 별도 신뢰 장치는 최소화하고 바로 본론으로 진입.
defineProps({
  brand: { type: String, default: 'ECS 증권' },
  customerName: { type: String, default: '홍길동' },
})
const emit = defineEmits(['enter'])
</script>

<template>
  <div class="mx-auto flex h-full max-w-md flex-col bg-bg">
    <!-- 자사 앱 상단바(로그인 상태) -->
    <header class="flex items-center justify-between bg-surface px-5 py-3.5">
      <span class="text-base font-semibold text-ink">{{ brand }}</span>
      <span class="text-sm text-muted">{{ customerName }}님</span>
    </header>

    <!-- 앱 홈 콘텐츠(간단 모형) -->
    <div class="flex-1 overflow-y-auto px-5 py-5">
      <div class="rounded-xl border border-border bg-surface p-5">
        <p class="text-xs font-medium text-muted">내 계좌 평가금액</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-ink">9,492,000<span class="ml-1 text-base font-normal text-muted">원</span></p>
        <p class="mt-1 text-sm font-medium tabular-nums text-up">+287,000원 (+3.12%)</p>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2.5 text-center text-sm text-ink">
        <div class="rounded-xl border border-border bg-surface py-4">주문</div>
        <div class="rounded-xl border border-border bg-surface py-4">잔고</div>
        <div class="rounded-xl border border-border bg-surface py-4">이체</div>
      </div>
    </div>

    <!-- 보이는 상담 진입 버튼 -->
    <div class="border-t border-border bg-surface px-5 py-4">
      <button
        type="button"
        class="w-full rounded-xl bg-accent px-4 py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        @click="emit('enter')"
      >
        AI 상담사와 화면 상담 시작
      </button>
    </div>
  </div>
</template>
