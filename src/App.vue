<script setup>
// 앱 컨테이너: 증권앱 메인 화면(AppHomeScreen)으로 진입 → 콜봇 버튼 클릭 시 보이는 콜봇(CallView)로 전환.
// 채널 차이는 진입 컨텍스트(?channel=phone|app)로만 분기한다(PRD 7장).
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppHomeScreen from './components/start/AppHomeScreen.vue'
import CallView from './components/CallView.vue'
import { useSessionStore } from './stores/session'

const session = useSessionStore()
const { brand, customerName } = storeToRefs(session)

// false: 증권앱 메인 화면 / true: 보이는 콜봇(CallView)
const entered = ref(false)

onMounted(() => {
  session.initFromQuery()
  // 앱 채널은 이미 로그인 상태 → 고객 정보가 주입된 맥락
  if (session.channel === 'app') session.setContext({ customerName: '홍길동' })
})
</script>

<template>
  <AppHomeScreen
    v-if="!entered"
    :brand="brand"
    :customer-name="customerName"
    @enter="entered = true"
  />
  <CallView v-else />
</template>
