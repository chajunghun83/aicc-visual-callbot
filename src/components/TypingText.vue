<script setup>
// 한 글자씩 표시하는 타이핑 효과 컴포넌트.
// 봇 안내 멘트가 말하듯 출력되도록 한다. 나중에 TTS와 동기화할 수 있게
// speed(글자당 ms)를 분리해 두었다(추후 발화 길이에 맞춰 조절 가능).
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  speed: { type: Number, default: 45 }, // 글자당 ms
  // 타이핑 중 깜빡이는 커서 표시
  cursor: { type: Boolean, default: true },
})
const emit = defineEmits(['done'])

const shown = ref('')
const typing = ref(false)
let timer = null

// 접근성: 모션 최소화 설정이면 즉시 전체 표시
const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function run() {
  clearInterval(timer)
  const full = props.text || ''
  if (reduceMotion || !full) {
    shown.value = full
    typing.value = false
    emit('done')
    return
  }
  shown.value = ''
  typing.value = true
  let i = 0
  timer = setInterval(() => {
    i += 1
    shown.value = full.slice(0, i)
    if (i >= full.length) {
      clearInterval(timer)
      typing.value = false
      emit('done')
    }
  }, props.speed)
}

watch(() => props.text, run)
onMounted(run)
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <span class="whitespace-pre-line">{{ shown }}<span v-if="cursor && typing" class="type-cursor">|</span></span>
</template>

<style scoped>
.type-cursor {
  margin-left: 1px;
  color: var(--color-accent);
  animation: blink 0.9s steps(1) infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
</style>
