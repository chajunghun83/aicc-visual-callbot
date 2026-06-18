<script setup>
// zone 5 — 하단 고정 퀵바: 전역 액션(상담사 연결 / 음성 전환 / 캡처 전송). 항상 같은 자리.
const emit = defineEmits(['action'])

const actions = [
  { key: 'agent', label: '상담사 연결' },
  { key: 'voice', label: '음성으로 전환' },
  { key: 'capture', label: '캡처 전송' },
]
</script>

<template>
  <nav class="border-t border-border bg-surface px-4 py-3">
    <div class="flex items-center justify-between gap-2">
      <button
        v-for="a in actions"
        :key="a.key"
        type="button"
        class="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-ink transition-colors active:bg-bg"
        @click="emit('action', a.key)"
      >
        {{ a.label }}
      </button>
    </div>
  </nav>
</template>
