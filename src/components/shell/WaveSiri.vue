<script setup>
// AI 파동 — SiriWave 파형 형태. 정보가 많은 단계에서 공간을 덜 차지하도록 작게 사용.
// status에 따라 진폭/속도를 조절해 턴테이킹 신호를 유지(말하는 중=크게).
// design.md 톤에 맞춰 단색 딥블루(style 'ios')로 절제되게 표현.
import SiriWave from 'siriwave'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  status: { type: String, default: 'idle' }, // idle | listening | speaking
})

const host = ref(null)
let sw = null

function params(s) {
  if (s === 'speaking') return { amplitude: 4, speed: 0.15 }
  if (s === 'listening') return { amplitude: 1.6, speed: 0.1 }
  return { amplitude: 0.5, speed: 0.06 }
}

onMounted(() => {
  if (!host.value) return
  const width = host.value.clientWidth || 320
  const p = params(props.status)
  sw = new SiriWave({
    container: host.value,
    width,
    height: 72,
    style: 'ios',
    color: '#1E4E8C',
    speed: p.speed,
    amplitude: p.amplitude,
    autostart: true,
  })
})

watch(
  () => props.status,
  (s) => {
    if (!sw) return
    const p = params(s)
    sw.setAmplitude(p.amplitude)
    sw.setSpeed(p.speed)
  },
)

onUnmounted(() => {
  if (sw) {
    sw.dispose()
    sw = null
  }
})
</script>

<template>
  <div ref="host" class="mx-auto w-full" style="max-width: 360px"></div>
</template>
