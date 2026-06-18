<script setup>
// AI 분석 결과 표시 (auto). 오류 화면 Vision 분석 결과(와우 포인트).
// 데모는 A안(스크립트): 실제 인식 없이 사전 정의 결과를 보여준다.
// 자체적으로 "화면 분석 중..." 로딩을 loadingMs 동안 연출한 뒤 결과로 전환(실제 처리처럼 보이게).
import { ref, onMounted } from 'vue'

const props = defineProps({
  summary: { type: String, default: '' }, // 분석 요약(이미지의 구체 요소를 짚는 문구)
  cause: { type: String, default: '' }, // 원인
  solution: { type: [String, Array], default: () => [] }, // 해결안(문자열 또는 단계 배열)
  loadingMs: { type: Number, default: 1800 },
})

const analyzing = ref(true)

const solutionSteps = () =>
  Array.isArray(props.solution) ? props.solution : props.solution ? [props.solution] : []

onMounted(() => {
  setTimeout(() => {
    analyzing.value = false
  }, props.loadingMs)
})
</script>

<template>
  <!-- 로딩 연출 -->
  <section v-if="analyzing" class="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8">
    <span class="analyze-spinner"></span>
    <p class="text-sm text-muted">화면을 분석하고 있습니다...</p>
  </section>

  <!-- 분석 결과 -->
  <section v-else class="rounded-xl border border-border bg-surface p-5">
    <div class="flex items-center gap-2">
      <span class="rounded-md bg-accent/8 px-2 py-0.5 text-xs font-medium text-accent">AI 분석 결과</span>
    </div>

    <p v-if="summary" class="mt-3 text-[15px] leading-relaxed text-ink">{{ summary }}</p>

    <div v-if="cause" class="mt-4">
      <p class="text-xs font-medium text-muted">원인</p>
      <p class="mt-1 text-sm leading-relaxed text-ink">{{ cause }}</p>
    </div>

    <div v-if="solutionSteps().length" class="mt-4">
      <p class="text-xs font-medium text-muted">해결 방법</p>
      <ol class="mt-1.5 flex flex-col gap-1.5">
        <li v-for="(s, i) in solutionSteps()" :key="i" class="flex gap-2 text-sm leading-relaxed text-ink">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">{{ i + 1 }}</span>
          <span>{{ s }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.analyze-spinner {
  height: 28px;
  width: 28px;
  border-radius: 9999px;
  border: 3px solid rgba(30, 78, 140, 0.15);
  border-top-color: #1e4e8c;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .analyze-spinner { animation-duration: 2s; }
}
</style>
