<script setup>
// 자주 묻는 질문(추천 질문) 버튼. 첫 인사 화면에서 사용.
// 클릭 시 슬롯을 바로 채우지 않고 pick 이벤트만 emit → 하단 STT 입력칸에 채워지는
// 연출(선택 시각화) 후 전송되도록 한다.
// options: [string]
defineProps({
  options: { type: Array, default: () => [] },
})
const emit = defineEmits(['pick'])
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <button
      v-for="(opt, i) in options"
      :key="i"
      type="button"
      class="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-left text-[15px] text-ink transition-colors active:border-accent active:bg-accent/5"
      @click="emit('pick', opt)"
    >
      <svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0 text-muted" fill="none" aria-hidden="true">
        <path
          d="M4 10.5 8 14.5 16 5.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0"
        />
        <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.4" />
        <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ opt }}
    </button>
  </div>
</template>
