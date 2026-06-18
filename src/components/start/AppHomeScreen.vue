<script setup>
// 가상 ECS 증권앱 메인 화면(순수 디자인 목업, 진입 첫 페이지).
// 기능은 없다 — 모든 요소는 보여주기용 장식이며, 유일하게 동작하는 것은 우측 하단 '보이는 콜봇' 버튼뿐.
// 시세·보유·관심·지수 정보는 일부러 넣지 않는다(그 정보는 콜봇으로 보는 것이 데모의 핵심).
// 스크롤 없이 한 화면(1뷰포트)에 들어오도록 상·하단바는 고정, 가운데는 flex 비율로 배분한다.
import logoSrc from '../../../image/ecs 증권 이미지3.png'
import CobotFab from './CobotFab.vue'

defineProps({
  brand: { type: String, default: 'ECS 증권' },
  customerName: { type: String, default: '' },
})

// 콜봇 진입 — 상위(App)에서 받아 CallView로 전환
const emit = defineEmits(['enter'])

// 빠른 메뉴(장식, 시세 무관). 아이콘은 인라인 SVG path(이모지 금지).
const quickMenus = [
  { key: 'transfer', label: '이체', path: 'M4 8h13l-3-3M20 16H7l3 3' },
  { key: 'deposit', label: '입출금', path: 'M12 3v13m0 0 4-4m-4 4-4-4M5 20h14' },
  { key: 'ipo', label: '청약', path: 'M6 3h9l3 3v15H6zM9 8h6M9 12h6M9 16h4' },
  { key: 'pension', label: '연금', path: 'M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7z' },
  { key: 'card', label: '카드', path: 'M3 6h18v12H3zM3 10h18' },
  { key: 'event', label: '이벤트', path: 'M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.9l.9-5.4L4.2 8.7l5.4-.8z' },
  { key: 'cs', label: '고객센터', path: 'M5 11a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2h-1v-6h3M5 11v5a2 2 0 0 0 2 2h1v-6H5' },
  { key: 'all', label: '전체', path: 'M4 6h16M4 12h16M4 18h16' },
]

// 공지·이벤트(장식, 시세 무관)
const notices = [
  { tag: '이벤트', text: '신규 계좌 개설 시 국내주식 거래 수수료 평생 무료' },
  { tag: '이벤트', text: '해외주식 환전 우대 90%, 첫 거래 시 $10 지급' },
  { tag: '이벤트', text: '연금저축 타사 이전 시 최대 30만원 캐시백' },
  { tag: '공지', text: '시스템 정기 점검 안내 (6/22 02:00~04:00)' },
  { tag: '공지', text: '배당소득세 원천징수 세율 변경 안내' },
]
</script>

<template>
  <div class="relative mx-auto flex h-full max-w-md flex-col bg-bg">
    <!-- 상단바: 로고 + 검색·알림·프로필(장식) -->
    <header class="flex shrink-0 items-center justify-between bg-surface px-5 py-3.5">
      <img :src="logoSrc" :alt="brand" class="h-4 w-auto" />
      <div class="flex items-center gap-3.5 text-muted">
        <!-- 검색 -->
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6" />
          <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <!-- 알림 -->
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <!-- 프로필 -->
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.6" />
          <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </div>
    </header>

    <!-- 가운데: 배너 + 빠른메뉴 + 공지 (스크롤 없이 비율 배분) -->
    <main class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 py-4">
      <!-- 인사 -->
      <p class="shrink-0 text-[15px] text-muted">
        <span class="font-semibold text-ink">차정훈</span> 고객님, 안녕하세요.
      </p>

      <!-- 프로모션 배너(장식) -->
      <div class="shrink-0 overflow-hidden rounded-2xl bg-accent px-5 py-4 text-white">
        <p class="text-xs font-medium text-white/70">신규 고객 혜택</p>
        <p class="mt-1 text-lg font-semibold leading-snug">국내주식 거래 수수료<br />평생 무료</p>
      </div>

      <!-- 빠른 메뉴(장식) -->
      <section class="shrink-0 rounded-2xl border border-border bg-surface px-4 py-4">
        <div class="grid grid-cols-4 gap-y-4">
          <button
            v-for="m in quickMenus"
            :key="m.key"
            type="button"
            class="flex cursor-default flex-col items-center gap-1.5"
          >
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/5 text-accent">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  :d="m.path"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="text-xs font-medium text-ink">{{ m.label }}</span>
          </button>
        </div>
      </section>

      <!-- 공지·이벤트(장식) -->
      <section class="min-h-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-ink">공지·이벤트</span>
          <span class="text-xs text-muted">더보기</span>
        </div>
        <ul class="mt-1 divide-y divide-border">
          <li v-for="(n, i) in notices" :key="i" class="flex items-center gap-2 py-2">
            <span
              class="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
              :class="n.tag === '이벤트' ? 'bg-accent/10 text-accent' : 'bg-bg text-muted'"
            >
              {{ n.tag }}
            </span>
            <span class="truncate text-sm text-ink">{{ n.text }}</span>
          </li>
        </ul>
      </section>
    </main>

    <!-- 우측 하단 플로팅 콜봇 버튼(유일한 동작 요소). 시안은 CobotFab variant로 교체 가능.
         위치 조절: bottom-[숫자px]=하단탭바로부터 높이(작을수록 아래로), right-[숫자px]=오른쪽 여백 -->
    <div class="absolute bottom-[64px] right-3 z-10">
      <CobotFab variant="tint-light" @click="emit('enter')" />
    </div>

    <!-- 하단 탭바(장식) -->
    <nav class="flex shrink-0 items-stretch border-t border-border bg-surface">
      <button
        v-for="(t, i) in [
          { label: '홈', path: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z' },
          { label: '이벤트', path: 'M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.9l.9-5.4L4.2 8.7l5.4-.8z' },
          { label: '메뉴', path: 'M4 6h16M4 12h16M4 18h16' },
          { label: '고객센터', path: 'M5 11a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2h-1v-6h3M5 11v5a2 2 0 0 0 2 2h1v-6H5' },
          { label: 'MY', path: 'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20a7 7 0 0 1 14 0' },
        ]"
        :key="t.label"
        type="button"
        class="flex flex-1 cursor-default flex-col items-center gap-1 py-2"
        :class="i === 0 ? 'text-accent' : 'text-muted'"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
          <path
            :d="t.path"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-[11px] font-medium">{{ t.label }}</span>
      </button>
    </nav>
  </div>
</template>

