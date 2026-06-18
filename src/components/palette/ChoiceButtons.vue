<script setup>
// 선택지 제시(퀵 리플라이) (await). 선택 시 슬롯을 채운다.
// 봇 안내문은 오브 위(BotSpeech)에서 표시되므로, 카드는 선택 버튼만 담는다.
// options: [{ label, value }]  — value 미지정 시 label을 값으로 사용.
defineProps({
  options: { type: Array, default: () => [] },
})
const emit = defineEmits(['submit'])

function choose(opt) {
  const value = opt.value ?? opt.label
  emit('submit', { value, caption: opt.label })
}
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <button
      v-for="(opt, i) in options"
      :key="i"
      type="button"
      class="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-[15px] font-medium text-ink transition-colors active:border-accent active:bg-accent/5"
      @click="choose(opt)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
