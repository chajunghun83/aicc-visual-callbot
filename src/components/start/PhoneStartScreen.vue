<script setup>
// 전화 시작 화면 (PRD 10장). 알림톡/문자 링크 수신 → 링크 탭 → 콜봇 화면 연결.
// 미인증·문자 링크 진입 맥락이라 신뢰(브랜드·안심마크)와 통화 연결 상태를 강조.
defineProps({
  brand: { type: String, default: 'ECS 증권' },
})
const emit = defineEmits(['enter'])
</script>

<template>
  <div class="mx-auto flex h-full max-w-md flex-col bg-bg px-5 pb-8 pt-6">
    <!-- 통화 연결 상태 강조 -->
    <div class="flex items-center justify-center gap-2 text-sm text-muted">
      <span class="h-2 w-2 animate-pulse rounded-full bg-success"></span>
      AI 상담사와 통화 중
    </div>

    <!-- 메시지(알림톡) 카드 -->
    <div class="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold text-accent">{{ brand.slice(0, 1) }}</span>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-ink">{{ brand }}</p>
            <p class="text-xs text-muted">공식 알림</p>
          </div>
        </div>
        <span class="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-xs font-medium text-accent">
          <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" aria-hidden="true">
            <path d="M8 1.5 13 3.5v4c0 3.2-2.1 5.7-5 6.9-2.9-1.2-5-3.7-5-6.9v-4L8 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
            <path d="m5.8 8 1.6 1.6L10.4 6.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          안심마크
        </span>
      </div>

      <div class="px-4 py-4">
        <p class="text-[15px] leading-relaxed text-ink">
          화면을 보면서 상담을 진행하실 수 있습니다. 아래 버튼을 누르면 상담 화면이 열립니다.
        </p>
        <p class="mt-2 text-xs text-muted">통화는 스피커폰으로 전환하시면 더 편리합니다.</p>

        <button
          type="button"
          class="mt-4 w-full rounded-xl bg-accent px-4 py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
          @click="emit('enter')"
        >
          상담 화면 열기
        </button>
      </div>
    </div>

    <p class="mt-auto text-center text-xs leading-relaxed text-muted">
      이 링크는 {{ brand }} 공식 발신번호로 전송되었습니다.<br />
      개인정보는 안전하게 보호됩니다.
    </p>
  </div>
</template>
