<script setup>
// 콜봇 진입 버튼(FAB) 디자인 시안. variant로 스타일을 전환한다.
// 위치(absolute 등)는 포함하지 않는다 — 사용처(AppHomeScreen / 비교 갤러리)가 배치를 결정.
// 아이콘은 콜봇과 동일한 WaveOrb(compact). 클릭은 버튼이 받고 오브는 pointer-events-none.
import { computed } from 'vue'
import WaveOrb from '../shell/WaveOrb.vue'

const props = defineProps({
  variant: { type: String, default: 'white' },
})
defineEmits(['click'])

const LOTTIE_ORB_SRC = `${import.meta.env.BASE_URL}lottie/ai-orb.lottie`

// 세로 카드 계열 — 구조는 동일하고 '배경 + 보더'만 다른 후보들.
const CARD_BG = {
  white: 'bg-surface border-border', // 순수 흰
  'tint-light': 'bg-[#F5F8FC] border-accent/10', // 아주 옅은 딥블루 틴트
  tint: 'bg-[#F1F4F9] border-accent/15', // 연한 틴트(기존안)
  'tint-strong': 'bg-[#E9F0F9] border-accent/25', // 조금 진한 틴트
  'accent-border': 'bg-surface border-accent/40', // 흰 배경 + 딥블루 보더 포인트
  neutral: 'bg-bg border-border', // 페이지색(연회색) + 보더
}

const isCard = computed(() => props.variant in CARD_BG)
const cardBg = computed(() => CARD_BG[props.variant] ?? CARD_BG.white)
</script>

<template>
  <!-- 세로 카드 계열(흰/틴트 변형): 배경·보더만 다르고 구조·그림자 공통 -->
  <button
    v-if="isCard"
    type="button"
    class="flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-1.5 shadow-[0_4px_14px_rgba(22,59,105,0.15)]"
    :class="cardBg"
    @click="$emit('click')"
  >
    <WaveOrb class="pointer-events-none" compact status="idle" :src="LOTTIE_ORB_SRC" />
    <span class="text-[11px] font-semibold text-accent">AI 콜</span>
  </button>

  <!-- (참고용 비카드 시안) 솔리드 딥블루 -->
  <button
    v-else-if="variant === 'solid'"
    type="button"
    class="flex flex-col items-center gap-0.5 rounded-2xl bg-accent px-2.5 py-1.5 shadow-md"
    @click="$emit('click')"
  >
    <span class="pointer-events-none rounded-full bg-white/85 p-0.5">
      <WaveOrb compact status="idle" :src="LOTTIE_ORB_SRC" />
    </span>
    <span class="text-[11px] font-semibold text-white">AI 콜</span>
  </button>

  <!-- (참고용) 오브 단독 -->
  <button
    v-else
    type="button"
    aria-label="보이는 콜봇 연결"
    class="rounded-full bg-surface p-1.5 shadow-lg"
    @click="$emit('click')"
  >
    <WaveOrb class="pointer-events-none" compact status="idle" :src="LOTTIE_ORB_SRC" />
  </button>
</template>
