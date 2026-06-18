# 설계 문서: AICC 보이는 콜봇 데모 (1차 구현)

- **작성일:** 2026-06-15
- **출처 스펙:** [`docs/Visual Callbot_PRD.md`](../../Visual%20Callbot_PRD.md), [`docs/design.md`](../../design.md)
- **범위:** 1차 데모 시나리오("내 보유 종목 조회", 전화 인바운드) end-to-end 동작. 프론트엔드 전용, 백엔드 없음(목업).

## 1. 착수 결정 사항

브레인스토밍에서 확정한 두 가지 핵심 결정:

- **데모 진행 방식 — 하이브리드:** 봇 발화·화면 전환은 자동 재생되고, 입력 지점(종목 선택·본인인증·캡처 업로드)에서만 사용자 액션을 대기한다. 실제 세일즈 시연에 가장 그럴듯하면서도 안정적.
- **TTS — 1차는 자막만(음성 없이):** LiveCaption 자막 + WaveIndicator 애니메이션만 구현한다. 단, 발화를 `speak(text)` 함수로 일원화해 추후 Web Speech API 등 음성 연동을 함수 내부만 수정해 붙일 수 있게 둔다.

## 2. 기술 스택

- Vue 3 (`<script setup>` SFC) + Vite
- Pinia (중앙 상태 관리)
- Tailwind CSS v4 — `docs/design.md` 색 팔레트를 테마 토큰으로 등록
- 백엔드 없음: `src/mock/data.js`를 실제 API 응답 형태로 구성(향후 백엔드 전환 용이)

## 3. 폴더 구조

```
src/
├─ main.js
├─ App.vue                  # 5-zone 셸 레이아웃
├─ stores/
│  ├─ session.js            # 진입 컨텍스트 (채널/방향/고객정보)
│  ├─ conversation.js       # 슬롯 상태 + 현재 단계 + 대화 로그
│  └─ scenario.js           # 시나리오 스크립트(데이터) + 재생 엔진
├─ scenarios/
│  └─ stock-holdings.js     # 1차 시나리오 "내 보유 종목 조회" 스크립트
├─ components/
│  ├─ shell/                # TrustHeader, WaveIndicator, LiveCaption, QuickActionBar
│  ├─ palette/              # InfoMessageCard, ChoiceButtons, IdentityVerify,
│  │                        #   DataCard, FileUpload, AnalysisResult
│  └─ start/                # PhoneStartScreen, AppStartScreen
├─ mock/
│  └─ data.js               # 시세·보유·캡처 분석 결과 더미 (API 형태 모방)
└─ assets/styles/           # Tailwind 진입점 + design.md 색 토큰
```

## 4. 상태 모델

세 개의 Pinia 스토어로 PRD의 "진입 컨텍스트 + 슬롯 상태 + 시나리오 스크립트" 3덩어리를 구현한다.

- **session.js (진입 컨텍스트):** 채널(phone/app), 방향(inbound/outbound), 고객정보. `?channel=` 진입 파라미터와 기능 플래그를 보관. 컴포넌트는 이 컨텍스트를 주입받아 채널 비종속으로 동작.
- **conversation.js (대화 상태):** 슬롯 맵(채워진 값), 현재 단계 인덱스, 발화/입력 로그(LiveCaption용), WaveIndicator 상태(idle/listening/speaking).
- **scenario.js (시나리오 엔진):** 시나리오 스크립트(스텝 배열)를 로드하고 한 스텝씩 재생. 발화는 `speak(text)`를 거친다(1차엔 자막만).

## 5. 시나리오 엔진 (하이브리드 재생)

시나리오를 데이터(스텝 배열)로 정의하고 엔진이 순차 재생한다. 시나리오를 바꿔도 엔진·컴포넌트는 재사용된다.

```js
// scenarios/stock-holdings.js (개념)
[
  { type: 'auto',  say: '접속을 확인했습니다. 조회하실 종목을 선택해 주세요.',
    show: 'InfoMessageCard', props: {...} },          // 자동 재생 → 다음 스텝
  { type: 'await', say: '어떤 종목이 궁금하세요?',
    show: 'ChoiceButtons', slot: 'selectedStock' },    // 슬롯이 채워지면 다음 스텝
  // ...
]
```

- **`auto` 스텝:** 봇 발화(자막) + 컴포넌트 노출 → 짧은 딜레이 후 자동으로 다음 스텝.
- **`await` 스텝:** 컴포넌트를 띄우고 사용자가 지정된 슬롯을 채울 때까지 대기 → 채워지면 다음 스텝.
- **상태 동기화:** 발화 중 WaveIndicator 'speaking', 대기 중 'listening'/'idle'.
- **음성 분리:** 모든 발화는 `speak(text)`를 통과. 1차엔 자막만 출력하고, 추후 이 함수 안에서 음성 합성만 켜면 음성 연동 완료.

## 6. 1차 시나리오 흐름 ("내 보유 종목 조회")

전화 인바운드. PRD 12장 기준.

1. 진입·환영 — InfoMessageCard (auto)
2. 종목 선택/검색 — ChoiceButtons (await: `selectedStock`)
3. 본인인증 — 휴대폰 뒷자리 4자리, IdentityVerify (await: `verifiedPhone`)
4. 보유 종목 정보 — 현재가·등락률·평가손익, DataCard (auto)
5. 와우 연출 — "매도가 안 돼요" → 오류 캡처 업로드(FileUpload, await) → AI 분석 결과(AnalysisResult, auto)
6. (선택) 후속 액션 — 관심등록/상담사 연결, ChoiceButtons (await)

- **캡처 분석 = A안(스크립트):** 실제 Vision 인식 없음. 오류 이미지 2~3종에 각기 다른 사전 정의 결과를 매핑하고 "화면 분석 중…" 로딩 연출. 결과 문구는 이미지의 구체 요소를 짚도록 작성.
- **데이터:** 시세·보유·분석 결과 모두 `mock/data.js`의 더미.

## 7. 개발 순서 (순차)

각 단계는 독립적으로 확인 가능하게 끊는다.

| 단계 | 내용 | 완료 확인 |
| --- | --- | --- |
| 0. 스캐폴딩 | Vite+Vue+Pinia+Tailwind 세팅, design.md 색 토큰 등록 | `npm run dev` 화면 뜸 |
| 1. 5-zone 셸 | App.vue 레이아웃 + 셸 4종(더미 상태) | 모바일 세로 셸 골격 |
| 2. 시나리오 엔진 | scenario 스토어 + 엔진 + `speak()` 자막 출력 | auto/await 전환 동작 |
| 3. 팔레트 컴포넌트 | 1차 6종 구현 | 각 컴포넌트 단독 렌더 |
| 4. 1차 시나리오 E2E | stock-holdings 스크립트 연결, 진입~캡처분석 재생 | 전체 흐름 시연 |
| 5. 시작 화면 + 채널 분기 | 전화/앱 시작 화면, `?channel=` 진입 | 전화·앱 진입 연출 |

## 8. 범위 밖 (이후 확장 — YAGNI)

- 나머지 팔레트: FormInput, PaymentForm, SignaturePad, ResultCard
- 아웃바운드 시나리오, 앱 진입(App-in-App) 상세, 예외 시나리오(Timeout/Call Drop/Stuck)
- 실제 음성(TTS) 연동, 실제 Vision 분석, MSW 도입

## 9. 디자인 / 금지 사항 (design.md·CLAUDE.md 준수)

- 증권사 톤(차분/저채도), 딥블루 단일 액센트, 등락 색(상승=빨강/하락=파랑/보합=회색)
- 모바일폰 세로 기준, 태블릿 폭 제한 대응, PC 비대상
- 이모지 금지, 민감정보(카드번호 등) 직접 수집 금지, AI 티 나는 천편일률 디자인 금지
