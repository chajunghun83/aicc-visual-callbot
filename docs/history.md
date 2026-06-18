# 작업 히스토리 (Claude 작업 재개용 메모)

> 목적: 다음 세션에서 어디까지 했는지 빠르게 파악. 사용자 열람용이 아니라 Claude용 메모.
> 규칙: 작업 세션마다 `## YYYY-MM-DD` 헤더로 구분해 기록한다. 최신 날짜가 위로.

---

## 2026-06-18

### 한 일 (추가: 종료 화면)

- **종료 화면**: 어느 단계에서든 STT로 종료 멘트("종료할게", "이제 더 필요한 거 없어" 등)를 말하면 첫 화면 레이아웃(orb 모드)에서 버튼·하단 입력바만 사라지고 AI 종료 멘트만 표시.
- **scenario.js**: `ended` 상태 + `end(sayText)` 액션 신설. 진행 중 발화 끊고 `running=false`(이후 입력 무시), `currentComponent=null`(버튼 등 내림), 종료 멘트 재생(speaking→idle). `load`/리셋 시 `ended=false`.
- **CallView.vue**: `onStt` 맨 앞에서 `END_RE`(넓은 종료 키워드)로 감지 → `scenario.end(END_SAY)` 호출(다른 처리보다 우선). `ended`면 `<LiveCaption>` v-if로 숨김. 종료 멘트는 표준 안내형.
- 화면 컴포넌트 없이 구현(activeComponent=null → 첫 화면에서 버튼만 빠진 모습).
- **BotSpeech.vue**: 기본(비-compact) `<p>`에 `whitespace-pre-line` 추가 — oneShot 멘트의 `\n` 줄바꿈이 렌더되도록(종료 멘트 2줄 표시).
- **헤더 통화 종료 버튼**: TrustHeader에 타이머 우측 빨간(`bg-danger`) 라운드 버튼 추가. `end-call` emit → CallView `onEndCall`이 `scenario.end(END_SAY)` 호출(STT 종료와 동일). `callEnded` prop true면 버튼 숨김.
- **헤더 로고**: TrustHeader 브랜드 텍스트 → `image/ecs 증권 이미지3.png`(여백 제거판) 이미지로 교체(`h-4 w-auto`, gap-2.5). 통화 상태 문구 "AI 상담사와 통화 중" → "통화 중"으로 축약. (롤백용 텍스트 span 주석 보존)

### 한 일 (추가: 증권앱 메인 진입 화면)

- **진입 흐름 변경**: 기존엔 App.vue가 바로 CallView 마운트 → 이제 **가상 ECS 증권앱 메인(AppHomeScreen) 먼저** 표시, 우측 하단 '보이는 콜봇' 버튼 클릭 시 CallView로 전환.
- **AppHomeScreen.vue 신설**(`src/components/start/`): 순수 디자인 목업(콜봇 버튼만 동작). 상단바(로고+검색/알림/프로필 SVG) + 프로모션 배너 + 빠른메뉴 8개 그리드 + 공지·이벤트 리스트 + 하단 탭바 5개. **시세·보유·관심·지수 정보는 의도적으로 배제**(콜봇으로 보는 게 데모 핵심). 스크롤 없이 1뷰포트(`h-full flex-col`, 가운데 `flex-1`). 우측 하단 플로팅 콜봇 버튼=글로우 오브(WaveOrb 글로우 축소 CSS)+"AI 상담" 라벨, `emit('enter')`.
- **App.vue**: `ref entered`로 `v-if` 분기(AppHomeScreen ↔ CallView). `@enter`로 전환. CallView는 v-else 마운트 시 기존 `scenario.start()` 그대로 실행(타이밍 변경 없음). brand/customerName props 주입.
- **콜봇 진입 버튼(FAB) 컴포넌트화**: `CobotFab.vue` 신설 — `variant` prop으로 디자인 시안 전환(세로 카드 계열 `white`/`tint-light`/`tint`/`tint-strong`/`accent-border`/`neutral` + 참고용 `solid`/`orb`). 아이콘은 WaveOrb(compact). 위치는 사용처가 결정. **최종 채택: `tint-light`**(배경 `#F5F8FC`, `border-accent/10`). 라벨은 "AI 콜"(챗봇 느낌의 'AI 상담' 대신, STS 콜 기반 강조). AppHomeScreen 우측 하단 wrapper `absolute bottom-[64px] right-3`. (시안 비교용 `FabCompare.vue`는 결정 후 삭제 완료)
- **AppHomeScreen 디테일**: 공지·이벤트 5건으로 보강(시세 무관 문구), 좌상단 인사 "차정훈 고객님, 안녕하세요."(이름 굵게, 하드코딩).

---

## 2026-06-17

### 한 일 (추가: 2번 시나리오 "오늘 증시 상황" 3뎁스)

- **증시 흐름 분기**(`isMarket` = intent에 '증시'): 인사 → 확인멘트 → (인증 skipIf) → (종목선택·상세 skipIf) → **⑥ 증시 보드에서 종료**(4뎁스 없음). ④종목선택·⑤상세에 `skipIf:isMarket` 추가, ⑥ MarketBoard 스텝 신설(`skipIf:!isMarket`, await로 마지막 화면 유지).
- **MarketBoard.vue 신설**(compact 레이아웃, `COMPACT_COMPONENTS`에 추가): 상단 작은 오브+멘트("오늘 증시 상황을 알려드립니다."), 아래 **2열 바둑판 지수 카드** + 하단 **공포&탐욕 게이지**. 등락 색 한국 관례(▲빨강/▼파랑, 기하문자), **모노크롬 라인 아이콘**(index/fx/crypto inline SVG, 이모지 미사용). 게이지는 저채도 그라데이션 + ink 마커.
- **데이터**(`mock/data.js`): `marketIndices` **8개**(코스피·코스닥·S&P500·나스닥·다우존스·원/달러·금·비트코인, 2026 목업), `fearGreed`(40 공포, CNN). 아이콘 5종(index/fx/crypto/gold/oil). ※ 원유 2종은 스크롤 방지로 제거.
- **엔진(scenario.js) 확장**: `show`도 `(slots)=>값` 함수 평가 지원(`evalMaybe`) — 의도별 컴포넌트 분기용. 하위호환(문자열 그대로).
- **첫 멘트**: 전체 지수 요약(5문장, 길게). **compact BotSpeech 2줄 고정 + 자동 스크롤**(`overflow-hidden` + `watch(shown)→scrollTop`) — 긴 멘트가 잘리지 않고 위로 흐름. 영역 높이 고정이라 지수 블럭이 안 밀림. (StockDetail 4뎁스도 동일 적용)
- **지수 Q&A**: 마지막 단계(`marketViewed`)에서 `fromText:()=>null` + `rejectSay:answerMarket(text)` → STT로 지수 질문하면 단계 유지한 채 멘트 영역에서 간단히 답변(`mock/data.js`의 `answerMarket`, 별칭 매칭 + 공포탐욕). 매칭 실패(엉뚱한 입력)는 "이해하지 못했습니다" fallback.
- **증시 UI 다듬기(후속)**:
  - 지수 **8개로 정착**(원유 2종 제거 — 세로 스크롤 방지). 첫 멘트 **5문장 + 자동 스크롤**. `DETAIL_CHAR_MS` 40→**55**(느리게).
  - **공포&탐욕 게이지 밝은 톤**(빨강#ef6f6f→노랑#f4bd52→초록#57c08a). **CNN 표기 제거**. **값 라벨('40 공포')이 마커 위치를 따라감** — `labelStyle`(left=value%, 가장자리 ≤12%/≥88%에서 정렬 보정으로 박스 안 넘침). 라벨↔게이지 간격(`mt-1.5`).
  - **Q&A 답변 후 STT 입력칸 자동 비움**: CallView `onStt`에서 현재 컴포넌트가 MarketBoard면 `liveCaptionClear`++(단계 유지라 자동 clear 미발동 보완).
- **멘트 교정(1~3번 시나리오 공통)**: '기다려주세요'→'기다려 주세요', '증시 상황 확인해'→'증시 상황을 확인해', '본인확인이'→'본인 확인이', 공포탐욕 답변 '40로'→'40,'. (관심종목 상세 '% 입니다' 공백은 사용자 요청으로 미수정 보류)
- 참고 시안 대비 톤다운(차분/저채도 컨셉).

### 한 일 (추가: 3번 시나리오 "관심 종목 시세" 3뎁스)

- **의도(intent) 분기 도입**: 1·2뎁스(인사·인증)는 공유, 3뎁스(종목선택)·4뎁스(상세)를 `slots.intent`에 '관심' 포함 여부로 분기(`isWatch` 헬퍼, `stock-holdings.js`). 보유 흐름은 미변경.
- **관심 종목 데이터**(`mock/data.js`): `watchlist` 3종목(NAVER 245,000 +2.13% / 현대차 312,500 -0.85% / LG에너지솔루션 408,000 +1.27%, 보유 아님 → 시세 위주 rows: 전일종가·시가·고가·저가·거래량). `watchOptions`(종목명·현재가·등락률), `chartSeries`에 watch 3종목 `Object.assign`, `matchWatchId`+`watchAliases`(STT 매칭).
- **StockPicker `variant` prop**: `variant='watch'`면 **1줄 카드**(좌 종목명 / 우 현재가+등락률, `signedRate`). 기본='holdings' 3행 카드 유지. 등락 색 한국 관례.
- **엔진(scenario.js) 최소 확장**: `fromText(text, slots)`·`rejectSay(text, slots)`에 `conversation.slots` 2번째 인자 전달(기존 함수 무시 가능, 하위호환). intent별 매칭/거절 멘트 분기에 사용.
- **4뎁스**: 기존 StockDetail 재활용(데이터만 연결). 관심이면 시세 톤 멘트 + `watchlist` 참조 + returnTone=등락방향. ⚠️ StockDetail의 "OO 보유 현황" 문구는 관심종목엔 어색 — 4뎁스 화면 재구성은 다음 작업.

### 한 일

- **3뎁스 종목 선택 카드화**: `StockPicker`(시세+평가손익 3행 카드 — 종목명/평균매입가/평가금액, 보유수량/현재가/평가손익, 수익률). mock 시세를 2026 현실값 + 끝자리 현실화. 종목 **별칭 매칭**(삼성/하이닉스/SK/카카오 약칭, `stockAliases`). **미보유 종목 거절**: `matchStockId`가 null → 엔진이 `rejectSay` 발화 후 단계 유지(조사 `eunNeun`, 종목명 추출 `cleanStockName`).
- **인사 + 확인 멘트 + 추천 버튼**: 첫 화면 `SuggestionButtons`(추천 질문 3개) → 선택/입력 시 STT 입력칸에 **즉시 채움**(`fillSignal`) → 인사화면 유지한 채 **확인 멘트**(auto, `ackMessage`) → 다음. 발화 텍스트는 단계 전환 시까지 유지(`clearSignal`).
- **인증 스킵**: '오늘 증시 상황'은 `skipIf`로 인증 단계 건너뜀(증시 전용 페이지는 미구현).
- **4뎁스 상세 재구성**: `StockChart`(SVG 라인 + 기간탭 1일/1주/1달/1년 + 확대/축소/새로고침) + `StockDetail`(차트+보유현황+다음). **compact 레이아웃**(작은 오브 + 멘트 가로 말풍선) — `WaveOrb/WaveIndicator/BotSpeech`에 `compact` prop, CallView `COMPACT_COMPONENTS=['StockDetail']`. **파형(SiriWave) 제거**(WAVE_COMPONENTS에서 DataCard 빠짐). `chartSeries`(마지막=현재가, 색=returnTone). **3뎁스↔4뎁스 데이터 일치**(둘 다 holdings 단일 출처).
- **멘트 표시 정교화**: 확인 멘트·4뎁스 요약은 **한 번에**(`sayOnce`→BotSpeech `oneShot`). 인사 첫 문장 묶기(\n 기준 분리). compact 멘트 **최대 3줄 + 마침표 뒤 줄바꿈**(`\n`, `whitespace-pre-line`, `line-clamp-3`). 4뎁스 타이핑 속도 `DETAIL_CHAR_MS=40`(기본 8).
- **STT 영역**: 마이크 아이콘 → **음파 파형(이퀄라이저 막대)**. 발화량 따라 **유동 높이(최대 3줄)** textarea.
- **4뎁스 마무리**: 다음 버튼 제거(`continueLabel` 없으면 숨김). 뒤 뎁스(와우/캡처/분석/후속) **주석으로 숨김**(보존). **뒤로 가기**: STT "이전/다시/목록" → `backOn`/`backTo`로 종목 선택 단계 복귀.
- **기타**: 브랜드 '한울증권' → **'ECS 증권'**. 인사 멘트 "안녕하세요?" 물음표. **HMR off**(`vite.config.js` `server.hmr:false`, 자동 새로고침 금지 — CLAUDE.md에도 명시).

### 현재 상태 스냅샷 (최신)

```
src/
├─ App.vue              바로 CallView (채널 컨텍스트 주입)
├─ components/
│  ├─ CallView.vue      셸+엔진. isCompact(['StockDetail','MarketBoard'])면 compact. WAVE_COMPONENTS=['AnalysisResult']. DETAIL_CHAR_MS=55. MarketBoard에서 STT 전송 시 입력칸 비움.
│  ├─ BotSpeech.vue     봇 발화(오버레이/ compact). oneShot/charMs/줄바꿈. compact는 2줄 고정+자동스크롤(overflow-hidden).
│  ├─ shell/            TrustHeader, WaveIndicator(+WaveOrb compact, WaveSiri), LiveCaption(음파파형+유동입력), QuickActionBar(미사용)
│  ├─ palette/          InfoMessageCard, ChoiceButtons, IdentityVerify, DataCard, FileUpload, AnalysisResult,
│  │                    SuggestionButtons, StockPicker(variant: holdings|watch), StockChart, StockDetail, MarketBoard (+index.js)
│  └─ start/            PhoneStartScreen, AppStartScreen  ※ 미사용(보관)
├─ stores/              session, conversation(currentSay·currentSayOnce·waveStatus), scenario(엔진)
├─ scenarios/stock-holdings.js  (intent 분기: isWatch/isMarket)
├─ lib/speech.js, components/TypingText.vue  ※ 미사용(보관)
└─ mock/data.js         holdings, stockOptions, watchlist/watchOptions, chartSeries, chartPeriods, marketIndices, fearGreed,
                        captureSamples/Results, matchStockId/matchWatchId/matchCaptureId, answerMarket
public/lottie/ai-orb.lottie
```

- **의도(intent)별 시나리오 분기** (단일 배열 + skipIf/함수평가로 분기):
  - **보유**: 인사 → 확인멘트 → 인증 → 종목선택(StockPicker holdings) → 보유상세(StockDetail).
  - **관심**: 보유와 동일하되 종목선택(StockPicker watch, 1줄카드)·상세를 `isWatch`로 분기(watchlist 참조).
  - **증시**: 인사 → 확인멘트 → (인증·종목선택·상세 skipIf) → **MarketBoard(8지수+공포탐욕, Q&A)에서 종료**.
- **엔진 기능**: `type auto/await`, `say/props/userSay/show/fromText`(함수, show·fromText는 slots 인자), `sayOnce`, `skipIf`, `rejectSay(text,slots)`(거절·답변+단계유지), `backOn/backTo`. 발화는 `currentSay`+BotSpeech 완료 동기화.
- **데이터 일치**: StockPicker(3뎁스)·StockDetail(4뎁스)·chartSeries — 보유=holdings / 관심=watchlist 단일 출처.
- **HMR off**: 코드 변경 후 사용자가 직접 새로고침.

### 다음 할 일(미구현)

- **관심종목 4뎁스 화면 재구성**: 현재 StockDetail 재활용이라 "OO 보유 현황" 문구가 어색 → 관심종목용 시세 현황 화면 필요.
- 숨긴 뒤 뎁스(와우→캡처→분석→후속) 재활성 시 보유상세 `continueLabel`/`fromText` 복구 + 주석 해제.
- 나머지 팔레트(PaymentForm·SignaturePad·ResultCard 등), 아웃바운드/앱 진입/예외 케이스.
- 실제 TTS·Vision 연동.
- (완료) 증시 상황·관심 종목 시세 의도별 분기 — 보유 흐름과 별도 화면으로 구현됨.

---

## 2026-06-15

### 한 일

- PRD에서 디자인 요소 분리 → `docs/design.md`. 설계 문서 작성(`docs/superpowers/specs/2026-06-15-visual-callbot-demo-design.md`).
- 스캐폴딩: Vue3 + Vite + Pinia + Tailwind v4(`@theme` 색 토큰 = design.md 팔레트 hex). Pretendard 폰트.
- 5-zone 셸 → 시나리오 엔진 → 팔레트 6종 → 1차 시나리오 E2E 까지 구현. `npm run build` 통과.
- 사용자 요청 반영:
  - 시작화면 제거(App이 바로 CallView). 시나리오 순서 변경: **인증 먼저** → 종목선택 (환영 멘트는 인증 안내문에 통합).
  - 안내 멘트 타이핑 효과(TypingText). LiveCaption은 고객 발화만 좁게.
  - 파동을 Lottie+SiriWave 하이브리드로. Lottie 오브 애셋 연결(`public/lottie/ai-orb.lottie`). 오브를 콘텐츠와 함께 세로 중앙 정렬.
  - 보유정보(DataCard)를 await로(수동 '다음' 버튼). `continueLabel` prop.
  - 화면 구성 개편: 오브 크기 340px. **봇 발화를 오브 위 BotSpeech에서 한 문장씩 표시**(나타남→유지→사라짐, 마지막 유지). 카드 컴포넌트의 안내문 제거(설명 일원화). LiveCaption에 **STT 텍스트 입력창** 추가 → `scenario.submitText`로 그 단계 답 처리(스텝 `fromText`로 슬롯값 변환: 인증=숫자, 종목/캡처=mock 매칭). 엔진: `conversation.currentSay` + 발화완료 대기(`onSpeechComplete`)로 발화-화면 동기화.
  - 미사용 전환: `lib/speech.js`, `components/TypingText.vue` (삭제 안 함, 보관).
  - UI 다듬기(후반):
    - 봇 발화를 **오브 영역 상단에 오버레이**(WaveIndicator에 slot + `textTop` prop). 위치 조절은 CallView의 `ORB_TEXT_TOP`(현재 `-40px`, 음수 클수록 위로). 가독: BotSpeech에 `font-bold` + 흰 `text-shadow` + `break-keep`(어절 단위 줄바꿈).
    - 타이핑: setTimeout 최소지연(~4ms) 회피 위해 한 틱(16ms)에 여러 글자 그림. 속도 = `BotSpeech.charMs`(현재 8). 텍스트 영역 높이 2줄 고정(`h-[4.5rem]`, items-end)로 오브 안 밀림.
    - 오브 크기 반응형 `min(440px, 46vh, 86vw)`(세로 스크롤 방지).
    - IdentityVerify 세로 컴팩트화 + **STT 입력 시 입력칸 채우기 애니메이션**(`sttSignal` prop → 한 자리씩 채우고 자동 제출). CallView가 인증 단계에서만 sttSignal 전달.
    - LiveCaption = **입력 전용**(발화 이력 미표시, 엔터로 전송). **QuickActionBar 제거**(미사용 보관).
  - 시나리오 변경: 맨 앞 **인사 페이지 추가**(slot `intent`). 인증/종목 멘트 수정. 컴포넌트 없는 단계는 카드 영역 숨김(placeholder 제거).
  - 인사 페이지에 **추천 질문 버튼 3개**(SuggestionButtons): '내 보유 주식 정보 알려줘'/'오늘 증시 상황 알려줘'/'관심 종목 시세 알려줘'. 버튼 클릭 → `@pick` → CallView `liveCaptionFill` → LiveCaption 입력칸에 한 글자씩 채운 뒤 자동 전송(선택 시각화) → 진행. ※ 현재 단일 시나리오라 3개 모두 같은 흐름(인증→보유종목)으로 진행됨. 의도별 분기는 미구현.

### 현재 상태 스냅샷

스택: Vue3+Vite+Pinia+Tailwind v4 / `@lottiefiles/dotlottie-vue` / `siriwave` / Pretendard.
취약점 경고 3건 = dev용 esbuild, 무시(프로덕션 무관).

```
src/
├─ App.vue              시작화면 없이 바로 CallView (채널 컨텍스트만 주입)
├─ components/
│  ├─ CallView.vue      셸 + 엔진 연결. 파동 모드/Lottie경로/텍스트위치(ORB_TEXT_TOP) 결정.
│  ├─ BotSpeech.vue     봇 발화 표시(오브 위 오버레이, 한 문장씩, charMs=8)
│  ├─ TypingText.vue    ※ 미사용(보관)
│  ├─ shell/            TrustHeader, WaveIndicator(+WaveOrb, WaveSiri), LiveCaption, QuickActionBar(미사용)
│  ├─ palette/          InfoMessageCard, ChoiceButtons, IdentityVerify, DataCard, FileUpload, AnalysisResult (+index.js 레지스트리)
│  └─ start/            PhoneStartScreen, AppStartScreen  ※ 현재 미사용(보관, 삭제 안 함)
├─ stores/              session(진입컨텍스트), conversation(슬롯·currentSay·waveStatus), scenario(엔진)
├─ scenarios/stock-holdings.js
├─ lib/speech.js        ※ 미사용(보관). 발화는 BotSpeech가 담당.
└─ mock/data.js         holdings, stockOptions, captureSamples, captureResults, matchStockId/matchCaptureId
public/lottie/ai-orb.lottie   사용자가 고른 Lottie 오브(LottieFiles, Lottie Simple License)
```

핵심 동작/결정:
- 엔진(scenario.js): 스텝 배열. `type:'auto'`(발화→딜레이→자동) / `type:'await'`(슬롯 채울 때까지 대기). `say`/`props`/`userSay`는 `(slots)=>값` 함수 평가 가능. await 진행 = 화면 `submitSlot` 또는 STT `submitText`(스텝 `fromText`로 입력→슬롯값 변환). 봇 발화는 `currentSay` 설정 후 BotSpeech 완료(`onSpeechComplete`)까지 대기.
- 1차 시나리오 순서: **인사(오브만+STT, slot intent)** → 인증(IdentityVerify) → 종목선택(ChoiceButtons) → 보유정보(DataCard, 수동 '다음') → 와우(고객 "매도 안돼요" userSay → FileUpload → AnalysisResult) → 후속(ChoiceButtons).
- 봇 발화 표시: BotSpeech가 오브 영역 상단에 오버레이(WaveIndicator slot, 위치=`ORB_TEXT_TOP`). 컴포넌트 안내문은 제거(설명 일원화).
- TTS: 1차는 음성 없음. BotSpeech 표시가 발화 역할. 추후 음성은 BotSpeech 문장 타이핑에 맞춰 재생.
- WaveIndicator: orb(Lottie `public/lottie/ai-orb.lottie`, 없으면 CSS fallback) / wave(SiriWave). CallView `WAVE_COMPONENTS=['DataCard','AnalysisResult']` 단계만 wave. 오브 크기 `min(440px,46vh,86vw)`.
- 캡처분석 A안: captureSamples 3종 → captureResults 매핑. AnalysisResult가 loadingMs "분석 중" 연출 후 결과.

### 다음 할 일(미구현)

- 나머지 팔레트: FormInput, PaymentForm(카드번호 직접수집 금지→PG목업), SignaturePad, ResultCard
- 아웃바운드 시나리오, 앱 진입(App-in-App) 상세, 예외 케이스(Timeout/CallDrop/Stuck)
- 실제 TTS 연동(speak), 실제 Vision 분석
- start/ 시작화면 재사용 여부 결정
- (선택) Lottie 오브 색감이 design.md 차분톤보다 화려 → 필요시 톤 조정
