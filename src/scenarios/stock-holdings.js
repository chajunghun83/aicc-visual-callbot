// 1차 데모 시나리오: "내 보유 종목 조회" (전화 인바운드)
// 진입 직후 본인인증부터 시작 → 종목 선택 → 보유 정보 → 와우(캡처 분석) → 후속.
// 봇 발화·화면 전환은 auto, 입력 지점은 await. say/props 함수는 채워진 슬롯(slots)을 참조한다.
import {
  holdings,
  stockOptions,
  watchlist,
  watchOptions,
  chartSeries,
  captureSamples,
  captureResults,
  matchStockId,
  matchWatchId,
  matchCaptureId,
  marketIndices,
  fearGreed,
  answerMarket,
} from '../mock/data'

// "관심 종목 시세" 의도 여부
function isWatch(slots) {
  return (slots?.intent || '').includes('관심')
}

// "오늘 증시 상황" 의도 여부
function isMarket(slots) {
  return (slots?.intent || '').includes('증시')
}

// 인사 화면 추천 질문(인사 스텝 + 확인 멘트 스텝이 동일 화면을 유지하도록 공유)
const SUGGESTIONS = ['내 보유 주식 정보 알려줘', '오늘 증시 상황 알려줘', '관심 종목 시세 알려줘']

// 한국어 조사 '은/는' — 마지막 글자 받침 유무로 선택
function eunNeun(word) {
  const c = word.charCodeAt(word.length - 1)
  if (Number.isNaN(c) || c < 0xac00 || c > 0xd7a3) return `${word}은(는)`
  return word + ((c - 0xac00) % 28 !== 0 ? '은' : '는')
}

// STT 문장에서 종목명만 대략 추려냄(거절 멘트용). 예: "아이렌이 궁금해" → "아이렌"
function cleanStockName(t) {
  let s = (t || '').trim()
  s = s.replace(
    /\s*(이|가|은|는|을|를)?\s*(정보|시세|주가)?\s*(궁금해요?|알려\s*줘요?|알려\s*주세요|보여\s*줘요?|찾아\s*줘요?|조회해?\s*줘요?|어때요?)\s*$/g,
    '',
  )
  s = s.replace(/[은는이가을를]\s*$/, '')
  return s.trim() || (t || '').trim()
}

// 인사 단계 입력(intent)에 대한 AI 확인 멘트
function ackMessage(intent = '') {
  if (intent.includes('보유')) return '보유 주식 정보를 알고 싶으시군요. 잠시만 기다려 주세요.'
  if (intent.includes('증시')) return '오늘 증시 상황을 확인해 보겠습니다. 잠시만 기다려 주세요.'
  if (intent.includes('관심')) return '관심 종목 시세를 확인해 보겠습니다. 잠시만 기다려 주세요.'
  return '확인해 보겠습니다. 잠시만 기다려 주세요.'
}

export const stockHoldingsScenario = [
  // ① 진입 + 인사 (추천 질문 버튼 + 하단 STT로 진행)
  {
    type: 'await',
    slot: 'intent',
    say: '안녕하세요? ECS 증권입니다.\n통화는 그대로 유지하면서 화면으로 함께 진행할게요.\n무엇을 도와드릴까요?',
    show: 'SuggestionButtons',
    props: { options: SUGGESTIONS },
  },

  // ② 확인 멘트 — 인사 화면(추천 버튼)을 유지한 채 응대 후 자동 진행 (한 번에 표시)
  {
    type: 'auto',
    say: (slots) => ackMessage(slots.intent),
    sayOnce: true,
    show: 'SuggestionButtons',
    props: { options: SUGGESTIONS },
    autoDelayMs: 800,
  },

  // ③ 본인인증 (증시 상황 등 인증이 불필요한 요청은 건너뜀)
  {
    type: 'await',
    slot: 'verifiedPhone',
    skipIf: (slots) => (slots.intent || '').includes('증시'),
    say: '본인 확인을 위해 휴대폰 번호 뒷자리 4자리를 입력해 주세요.',
    show: 'IdentityVerify',
    // STT로 답하면 숫자만 추려 뒷자리 4자리로
    fromText: (t) => t.replace(/\D/g, '').slice(-4),
  },

  // ④ 종목 선택 (인증 후) — 의도에 따라 보유 종목 / 관심 종목 분기. (증시 의도는 건너뜀)
  {
    type: 'await',
    slot: 'selectedStock',
    skipIf: (slots) => isMarket(slots),
    say: (slots) =>
      isWatch(slots)
        ? '본인 확인이 완료되었습니다. 관심 종목 중 어떤 종목이 궁금하세요?'
        : '본인 확인이 완료되었습니다. 어떤 종목이 궁금하세요?',
    show: 'StockPicker',
    props: (slots) =>
      isWatch(slots)
        ? { variant: 'watch', options: watchOptions }
        : { options: stockOptions },
    // STT로 답하면 종목명을 id로 매핑(목록에 없으면 null → 거절 멘트)
    fromText: (t, slots) => (isWatch(slots) ? matchWatchId(t) : matchStockId(t)),
    rejectSay: (t, slots) =>
      isWatch(slots)
        ? `${eunNeun(cleanStockName(t))} 관심 종목 목록에 없습니다. 목록에서 종목을 선택해 주세요.`
        : `${eunNeun(cleanStockName(t))} 현재 보유 주식이 아닙니다. 보유 종목을 다시 한번 확인해 주세요.`,
  },

  // ⑤ 종목 상세 (선택한 종목 기준) — 차트 + 상세. (현재 데모의 마지막 단계)
  //   보유 의도: 보유 현황 / 관심 의도: 시세 현황. (4뎁스 화면 디자인 재구성은 추후)
  {
    type: 'await',
    slot: 'holdingsConfirmed',
    skipIf: (slots) => isMarket(slots),
    say: (slots) => {
      if (isWatch(slots)) {
        const w = watchlist[slots.selectedStock] ?? {}
        const sign = (w.changeRate ?? 0) > 0 ? '+' : ''
        return `${w.name ?? '선택하신 종목'} 현재 시세입니다.\n현재가는 ${(w.price ?? 0).toLocaleString('ko-KR')}원이며, 전일 대비 ${sign}${w.changeRate}% 입니다.`
      }
      const h = holdings[slots.selectedStock] ?? {}
      return `${h.name ?? '선택하신 종목'} 보유 현황입니다.\n현재 ${h.quantity} 보유 중이며, 평가손익은 ${h.profit}(${h.returnRate})입니다.`
    },
    sayOnce: true,
    show: 'StockDetail',
    props: (slots) => {
      const src = isWatch(slots) ? watchlist[slots.selectedStock] : holdings[slots.selectedStock]
      const d = src ?? {}
      const tone = isWatch(slots)
        ? (d.changeRate ?? 0) > 0
          ? 'up'
          : (d.changeRate ?? 0) < 0
            ? 'down'
            : 'flat'
        : d.returnTone ?? 'flat'
      return {
        name: d.name ?? '',
        price: d.price ?? null,
        change: d.change ?? 0,
        changeRate: d.changeRate ?? 0,
        rows: d.rows ?? [],
        returnTone: tone,
        series: chartSeries[slots.selectedStock] ?? {},
        // continueLabel 미지정 → 다음 버튼 숨김(다음 뎁스 비활성)
      }
    },
    // 다음 뎁스가 숨겨진 상태라 STT 입력으로도 진행하지 않음
    fromText: () => null,
    // "이전/다시/뒤로/목록" 등으로 말하면 종목 선택 단계로 되돌아감
    backOn: (t) => /이전|다시|뒤로|돌아|목록|골라|선택/.test(t),
    backTo: 'selectedStock',
  },

  // ⑥ 오늘 증시 상황 (2번 시나리오 전용) — 인증/종목선택을 건너뛰고 바로 증시 보드.
  //   증시 의도가 아니면 건너뛴다. 4뎁스 없이 이 화면에서 종료(입력 대기로 화면 유지).
  {
    type: 'await',
    slot: 'marketViewed',
    skipIf: (slots) => !isMarket(slots),
    say:
      '오늘 국내 증시는 코스피·코스닥 모두 상승세로 출발했습니다.\n' +
      '반면 간밤 미국 증시는 S&P500과 나스닥이 하락 마감했고, 다우존스는 소폭 올랐습니다.\n' +
      '원/달러 환율은 1,378원으로 상승, 비트코인은 강세입니다.\n' +
      "현재 투자심리는 '공포' 구간으로 시장이 다소 위축된 모습입니다.\n" +
      '궁금한 지수를 말씀해 주시면 자세히 알려드리겠습니다.',
    sayOnce: true,
    show: 'MarketBoard',
    props: {
      indices: marketIndices,
      fearGreed,
    },
    // 마지막 단계 — 화면은 유지하고, STT 질문에는 멘트 영역에서 간단히 답한다.
    fromText: () => null,
    rejectSay: (text) => answerMarket(text),
  },

  /* ───────── 이하 뎁스는 현재 숨김(나중에 활용). 지우지 말 것. ─────────
  // 와우 전환: 고객이 오류를 호소 → 캡처 업로드 안내
  {
    type: 'auto',
    userSay: '아 그런데, 어제부터 앱에서 매도가 안 돼요.',
    say: '불편을 드려 죄송합니다. 오류가 났던 화면 캡처가 있으면 올려주세요. 바로 확인해 드리겠습니다.',
    show: 'InfoMessageCard',
    props: {
      title: '오류 화면을 확인해 드릴게요',
      body: '최근 캡처한 화면 중 오류가 발생한 화면을 선택하시면, 원인과 해결 방법을 분석해 드립니다.',
    },
    autoDelayMs: 900,
  },

  // 캡처 업로드
  {
    type: 'await',
    slot: 'errorCapture',
    say: '오류가 발생한 화면 캡처를 올려주세요.',
    show: 'FileUpload',
    props: {
      samples: captureSamples,
    },
    fromText: (t) => matchCaptureId(t),
  },

  // AI 분석 결과 (선택한 캡처 기준)
  {
    type: 'auto',
    say: '화면을 분석하고 있습니다. 잠시만 기다려 주세요.',
    show: 'AnalysisResult',
    props: (slots) => {
      const r = captureResults[slots.errorCapture] ?? {}
      return {
        summary: r.summary ?? '',
        cause: r.cause ?? '',
        solution: r.solution ?? [],
        loadingMs: 1800,
      }
    },
    autoDelayMs: 4800,
  },

  // (선택) 후속 액션
  {
    type: 'await',
    slot: 'followUp',
    say: '도움이 되셨나요? 추가로 도와드릴 내용을 선택해 주세요.',
    show: 'ChoiceButtons',
    props: {
      prompt: '다음 중 선택해 주세요.',
      options: [
        { label: '관심 종목 등록', value: 'watch' },
        { label: '상담사 연결', value: 'agent' },
        { label: '상담 종료', value: 'end' },
      ],
    },
  },
  ───────────────────────────────────────────────────────────── */
]
