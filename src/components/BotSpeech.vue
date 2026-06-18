<script setup>
// 봇 발화 표시 — 오브 영역 위에 오버레이.
//   - 기본: 문장 단위로 표시(타이핑 → 유지 → 사라짐 → 다음, 마지막 문장은 남음).
//   - oneShot=true: 전체 문구를 한 번에(여러 줄) 타이핑하고 남김(확인 멘트 등).
// 표시가 끝나면 done emit → 엔진이 다음 단계로(또는 사용자가 먼저 행동하면 다음 텍스트로 교체되며 중단).
// ※ 추후 TTS 연동 시: 타이핑 시작에 맞춰 음성을 재생하면 자막-음성이 동기화된다.
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  oneShot: { type: Boolean, default: false }, // 전체를 한 번에 표시할지
  compact: { type: Boolean, default: false }, // 작은 폰트·좌측(상세 화면 헤더 말풍선용)
  charMs: { type: Number, default: 8 }, // 글자당 타이핑 속도
  holdMs: { type: Number, default: 1100 }, // 문장 유지 시간(문장 단위 모드, 마지막 제외)
})
const emit = defineEmits(['done'])

const shown = ref('')
const visible = ref(false)
const scroller = ref(null) // compact 멘트 스크롤 컨테이너(긴 멘트가 위로 흐르도록)
let token = 0 // text가 바뀌면 이전 재생을 무효화

// compact 모드에서 타이핑이 진행될 때마다 항상 마지막 줄이 보이도록 바닥으로 스크롤
watch(shown, async () => {
  if (!props.compact) return
  await nextTick()
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
})

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 표시 단위 분리: 줄바꿈(\n)이 있으면 줄바꿈 기준(작성자가 직접 지정),
// 없으면 마침표/물음표/느낌표 + 공백 기준.
function splitSentences(t) {
  const parts = t.includes('\n') ? t.split('\n') : t.split(/(?<=[.?!])\s+/)
  return parts.map((s) => s.trim()).filter(Boolean)
}

// 한 틱(프레임) 길이. setTimeout 최소지연(~4ms) 클램프를 피해 charMs가 작으면 한 틱에 여러 글자.
const STEP_MS = 16

async function type(full, my) {
  if (reduceMotion) {
    shown.value = full
    return
  }
  shown.value = ''
  let i = 0
  while (i < full.length) {
    if (my !== token) return
    if (props.charMs >= STEP_MS) {
      i += 1
      shown.value = full.slice(0, i)
      await sleep(props.charMs)
    } else {
      const step = Math.max(1, Math.round(STEP_MS / props.charMs))
      i = Math.min(full.length, i + step)
      shown.value = full.slice(0, i)
      await sleep(STEP_MS)
    }
  }
}

async function run(text) {
  const my = ++token
  if (!text) {
    visible.value = false
    emit('done')
    return
  }
  visible.value = true

  // 한 번에 표시
  if (props.oneShot) {
    await type(text, my)
    if (my === token) emit('done')
    return
  }

  // 문장 단위: 타이핑 → 유지 → 사라짐 → 다음. 마지막 문장은 남김.
  const sentences = splitSentences(text)
  if (!sentences.length) {
    visible.value = false
    emit('done')
    return
  }
  for (let k = 0; k < sentences.length; k++) {
    if (my !== token) return
    await type(sentences[k], my)
    if (my !== token) return
    if (k === sentences.length - 1) break
    await sleep(props.holdMs)
    if (my !== token) return
    shown.value = ''
    await sleep(220)
  }
  if (my === token) emit('done')
}

watch(
  () => props.text,
  (t) => {
    if (t) run(t)
  },
)
onMounted(() => {
  if (props.text) run(props.text)
})
</script>

<template>
  <!-- compact: 작은 폰트·좌측(상세 헤더 말풍선). 높이 2줄 고정(영역 불변 → 콘텐츠가 안 밀림).
       긴 멘트는 잘리지 않고 위로 흐른다(자동 스크롤). 마침표 뒤 줄바꿈(\n) 표시 -->
  <div ref="scroller" v-if="compact" class="h-[2.6rem] overflow-hidden">
    <p
      v-show="visible"
      class="whitespace-pre-line break-keep text-sm font-medium leading-snug text-ink"
    >
      {{ shown }}
    </p>
  </div>
  <!-- 기본: 높이 2줄분 고정 + 하단 정렬 → 텍스트가 오브 가까이(아래쪽)에서 표시됨 -->
  <div v-else class="flex h-[4.5rem] items-end justify-center px-4">
    <p
      v-show="visible"
      class="whitespace-pre-line break-keep text-center text-[1.35rem] font-bold leading-snug tracking-[-0.01em] text-ink [text-shadow:0_1px_3px_rgb(247_248_250),0_0_10px_rgb(247_248_250)]"
    >
      {{ shown }}
    </p>
  </div>
</template>
