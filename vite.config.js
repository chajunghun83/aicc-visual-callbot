import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 보이는 콜봇 데모 — 프론트엔드 전용(백엔드 없음)
// GitHub Pages 배포는 프로젝트 서브경로(/aicc-visual-callbot/)에서 동작하므로
// 빌드 시에만 base를 설정한다(개발 서버는 루트 '/' 유지).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/aicc-visual-callbot/' : '/',
  plugins: [vue(), tailwindcss()],
  server: {
    // HMR(자동 새로고침) 비활성. 코드 변경 후 새로고침은 사용자가 직접 한다.
    hmr: false,
  },
}))
