<script setup>
// 상황·사유 시각 안내 (auto). 봇 발화는 오브 위(BotSpeech)에서 표시되므로
// 이 카드는 정적인 시각 안내(제목/본문)만 담는다.
defineProps({
  title: { type: String, default: '' },
  body: { type: String, default: '' },
})
</script>

<template>
  <section class="rounded-xl border border-border bg-surface p-5">
    <h2 v-if="title" class="text-lg font-semibold leading-snug text-ink">{{ title }}</h2>
    <p v-if="body" class="mt-2 text-[15px] leading-relaxed text-muted">{{ body }}</p>
  </section>
</template>
