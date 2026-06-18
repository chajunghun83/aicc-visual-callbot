<script setup>
// zone 4 — STT 발화 영역. 실제로는 음성을 받는 자리이며, 데모에서는 텍스트로 대신 입력한다.
// 발화량(글자수)에 따라 높이가 유동적으로 늘어난다(최대 높이 제한). 엔터로 전송.
// fillSignal({text, seq})이 오면 추천 버튼이 고른 문구를 채운 뒤 자동 전송.
import { ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  fillSignal: { type: Object, default: null }, // { text, seq } — 추천 선택 시 채움
  clearSignal: { type: Number, default: 0 }, // 단계 전환 시 입력칸 비우기 트리거
})
const emit = defineEmits(['send'])

const text = ref('')
const ta = ref(null)
const filling = ref(false)
let timer = null

// 발화량에 따라 높이 유동(최대 3줄 ≈ 75px). 넘치면 내부 스크롤.
const MAX_HEIGHT = 75
function resize() {
  const el = ta.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + 'px'
}

function send() {
  const t = text.value.trim()
  if (!t) return
  emit('send', t)
  // 발화 내용은 입력칸에 유지(확인 멘트 동안 표시). 단계가 바뀌면 clearSignal로 비운다.
}

function onEnter(e) {
  if (e.isComposing) return // 한글 조합 중 엔터는 무시
  e.preventDefault()
  send()
}

function fillAndSend(str) {
  clearTimeout(timer)
  filling.value = true
  text.value = str
  nextTick(resize)
  timer = setTimeout(() => {
    filling.value = false
    send()
  }, 500)
}

watch(
  () => props.fillSignal,
  (sig) => {
    if (sig && sig.text) fillAndSend(sig.text)
  },
)

// 단계 전환 시 입력칸 비우기
watch(
  () => props.clearSignal,
  () => {
    text.value = ''
    nextTick(resize)
  },
)

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="border-t border-border bg-surface px-4 py-3">
    <div class="flex items-center gap-2.5 rounded-2xl border border-border bg-bg px-4 py-3">
      <!-- 음파 파형: STT(음성)로 듣고 있음을 시각화 -->
      <div class="voice-bars" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <textarea
        ref="ta"
        v-model="text"
        rows="1"
        :readonly="filling"
        class="flex-1 resize-none overflow-y-auto bg-transparent text-[15px] leading-relaxed text-ink outline-none"
        @input="resize"
        @keydown.enter="onEnter"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
/* 음파 파형(이퀄라이저 막대) — 듣는 중 표현 */
.voice-bars {
  display: flex;
  align-items: center;
  gap: 2.5px;
  height: 22px;
  flex-shrink: 0;
}
.voice-bars span {
  width: 3px;
  height: 20px;
  border-radius: 2px;
  background: var(--color-accent);
  transform: scaleY(0.3);
  animation: voice-bar 1s ease-in-out infinite;
}
.voice-bars span:nth-child(1) { animation-delay: 0s; }
.voice-bars span:nth-child(2) { animation-delay: 0.18s; }
.voice-bars span:nth-child(3) { animation-delay: 0.36s; }
.voice-bars span:nth-child(4) { animation-delay: 0.18s; }
.voice-bars span:nth-child(5) { animation-delay: 0s; }

@keyframes voice-bar {
  0%, 100% { transform: scaleY(0.3); opacity: 0.55; }
  50% { transform: scaleY(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .voice-bars span { animation: none; transform: scaleY(0.6); }
}
</style>

