import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 보이는 콜봇 데모 — 프론트엔드 전용(백엔드 없음)
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    // HMR(자동 새로고침) 비활성. 코드 변경 후 새로고침은 사용자가 직접 한다.
    hmr: false,
  },
})
