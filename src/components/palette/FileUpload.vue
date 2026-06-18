<script setup>
// 파일·촬영 업로드 (await). 용도: 오류 화면 캡처(와우 포인트).
// 데모 A안: 실제 인식 없이, '최근 캡처' 샘플을 고르면 해당 id를 슬롯에 채운다.
// (각 샘플에 다른 분석 결과가 매핑된다 — 늘 같은 답이면 들킴)
// 보조로 실제 파일 선택도 지원하되, 선택 시 기본 샘플로 처리한다.
import { ref } from 'vue'

const props = defineProps({
  prompt: { type: String, default: '오류가 발생한 화면의 캡처를 올려주세요.' },
  // [{ id, label, thumb? }]  thumb 미지정 시 라벨 카드로 표시
  samples: { type: Array, default: () => [] },
})
const emit = defineEmits(['submit'])

const fileInput = ref(null)

function pick(sample) {
  emit('submit', { value: sample.id, caption: sample.label })
}

function openFile() {
  fileInput.value?.click()
}

function onFile(e) {
  const f = e.target.files?.[0]
  if (!f) return
  // 데모: 실제 분석은 하지 않고 첫 샘플 결과로 처리(없으면 'uploaded')
  const fallback = props.samples[0]
  emit('submit', { value: fallback?.id ?? 'uploaded', caption: f.name })
}
</script>

<template>
  <section class="rounded-xl border border-border bg-surface p-5">
    <p class="text-xs font-medium text-muted">최근 캡처</p>
    <div class="mt-2 grid grid-cols-3 gap-2.5">
      <button
        v-for="s in samples"
        :key="s.id"
        type="button"
        class="flex flex-col overflow-hidden rounded-lg border border-border transition-colors active:border-accent"
        @click="pick(s)"
      >
        <span class="flex aspect-[3/4] items-center justify-center bg-bg">
          <img v-if="s.thumb" :src="s.thumb" :alt="s.label" class="h-full w-full object-cover" />
          <!-- 썸네일 미지정 시 캡처 자리표시(이모지 미사용) -->
          <svg v-else viewBox="0 0 24 24" class="h-7 w-7 text-muted" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="m3 16 5-4 4 3 4-5 5 6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="px-1.5 py-1.5 text-[11px] leading-tight text-muted">{{ s.label }}</span>
      </button>
    </div>

    <button
      type="button"
      class="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-ink transition-colors active:bg-bg"
      @click="openFile"
    >
      사진에서 직접 선택
    </button>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
  </section>
</template>
