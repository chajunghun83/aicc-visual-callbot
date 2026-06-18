<script setup>
// 본인인증 (await). 데모 한정 간이 방식: 휴대폰 뒷자리 4자리 입력.
// 봇 안내문은 오브 위(BotSpeech)에서 표시되므로, 카드는 입력 UI만 담는다.
// sttSignal(하단 STT 입력)이 오면 입력칸을 한 자리씩 채우는 애니메이션 후 자동 제출한다.
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  label: { type: String, default: '휴대폰 뒷자리 4자리' },
  // { value, seq } — 하단 STT 입력 신호(매번 새 객체)
  sttSignal: { type: Object, default: null },
})
const emit = defineEmits(['submit'])

const digits = ref('')
const filling = ref(false)
const valid = computed(() => /^\d{4}$/.test(digits.value))
let timer = null

function onInput(e) {
  if (filling.value) return
  digits.value = e.target.value.replace(/\D/g, '').slice(0, 4)
}

function submit() {
  if (!valid.value) return
  emit('submit', { value: digits.value, caption: '본인인증 완료' })
}

// STT로 받은 값을 입력칸에 한 자리씩 채우고(애니메이션) 자동 제출
function fillFromStt(text) {
  const nums = (text || '').replace(/\D/g, '').slice(-4)
  if (!nums) return
  clearInterval(timer)
  filling.value = true
  digits.value = ''
  let i = 0
  timer = setInterval(() => {
    i += 1
    digits.value = nums.slice(0, i)
    if (i >= nums.length) {
      clearInterval(timer)
      filling.value = false
      setTimeout(submit, 450) // 다 채운 뒤 잠깐 보여주고 진행
    }
  }, 160)
}

watch(
  () => props.sttSignal,
  (sig) => {
    if (sig && sig.value) fillFromStt(sig.value)
  },
)

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section class="rounded-xl border border-border bg-surface px-5 py-4">
    <label class="block">
      <span class="text-xs font-medium text-muted">{{ label }}</span>
      <input
        :value="digits"
        inputmode="numeric"
        autocomplete="off"
        placeholder="0000"
        :readonly="filling"
        class="mt-1 w-full rounded-lg border bg-bg px-4 py-2 text-center text-xl tracking-[0.4em] tabular-nums text-ink outline-none transition-colors focus:border-accent"
        :class="filling ? 'border-accent' : 'border-border'"
        maxlength="4"
        @input="onInput"
      />
    </label>

    <button
      type="button"
      :disabled="!valid"
      class="mt-3 w-full rounded-xl bg-accent px-4 py-2.5 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
      @click="submit"
    >
      확인
    </button>
  </section>
</template>
