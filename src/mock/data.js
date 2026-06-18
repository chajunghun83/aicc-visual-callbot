// 중앙 집중 목업 데이터 (PRD 5장). 백엔드 없음 — 실제 API 응답 형태를 모방해
// 향후 백엔드 전환을 쉽게 한다. 시세/보유/분석 결과 모두 그럴듯한 더미 값.

// 보유 종목 — 선택지 + 상세(현재가·등락·평가). 등락/손익 tone은 한국 증권 관례(up=빨강/down=파랑/flat=회색).
// 시세는 2026년 대략 값을 참고한 목업(고정). 실제 API 호출 없음.
//   evalAmount/returnRate/returnTone = 종목 선택 카드(StockPicker)용 요약 필드.
export const holdings = {
  samsung: {
    id: 'samsung',
    name: '삼성전자',
    price: 336500, // 현재가
    change: 4900,
    changeRate: 1.48, // 오늘 등락률(현재가 색)
    avgPrice: '287,450원',
    quantity: '53주',
    evalAmount: '17,834,500원',
    profit: '+2,599,650원',
    returnRate: '+17.06%',
    returnTone: 'up',
    rows: [
      { label: '보유 수량', value: '53주' },
      { label: '평균 매입가', value: '287,450원' },
      { label: '평가 금액', value: '17,834,500원' },
      { label: '평가 손익', value: '+2,599,650원', tone: 'up' },
      { label: '수익률', value: '+17.06%', tone: 'up' },
    ],
  },
  skhynix: {
    id: 'skhynix',
    name: 'SK하이닉스',
    price: 2214500,
    change: -29600,
    changeRate: -1.32,
    avgPrice: '2,387,000원',
    quantity: '11주',
    evalAmount: '24,359,500원',
    profit: '-1,897,500원',
    returnRate: '-7.23%',
    returnTone: 'down',
    rows: [
      { label: '보유 수량', value: '11주' },
      { label: '평균 매입가', value: '2,387,000원' },
      { label: '평가 금액', value: '24,359,500원' },
      { label: '평가 손익', value: '-1,897,500원', tone: 'down' },
      { label: '수익률', value: '-7.23%', tone: 'down' },
    ],
  },
  kakao: {
    id: 'kakao',
    name: '카카오',
    price: 51300,
    change: 500,
    changeRate: 0.98,
    avgPrice: '48,750원',
    quantity: '77주',
    evalAmount: '3,950,100원',
    profit: '+196,350원',
    returnRate: '+5.23%',
    returnTone: 'up',
    rows: [
      { label: '보유 수량', value: '77주' },
      { label: '평균 매입가', value: '48,750원' },
      { label: '평가 금액', value: '3,950,100원' },
      { label: '평가 손익', value: '+196,350원', tone: 'up' },
      { label: '수익률', value: '+5.23%', tone: 'up' },
    ],
  },
}

// 차트용 목업 시계열 생성(결정적 — Math.random 미사용, 새로고침해도 동일).
//   end=마지막값(현재가), trendRate=전체 변화율(부호=수익 방향), n=포인트 수, vol=변동폭
function genSeries(end, trendRate, n, vol) {
  const start = Math.round(end / (1 + trendRate))
  const arr = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1)
    const base = start + (end - start) * t
    const wave = Math.sin(i * 0.8) * vol + Math.sin(i * 0.37) * vol * 0.5
    arr.push(Math.round(base + wave))
  }
  arr[n - 1] = end // 마지막 포인트 = 현재가(보유 현황과 일치)
  return arr
}

// 종목별·기간별 가격 시계열. 추세 부호는 returnTone(수익 방향)과 일치시킨다.
export const chartSeries = {
  samsung: {
    '1일': genSeries(336500, 0.0148, 24, 2500),
    '1주': genSeries(336500, 0.045, 28, 4000),
    '1달': genSeries(336500, 0.11, 30, 7000),
    '1년': genSeries(336500, 0.38, 40, 14000),
  },
  skhynix: {
    '1일': genSeries(2214500, -0.0132, 24, 16000),
    '1주': genSeries(2214500, -0.04, 28, 30000),
    '1달': genSeries(2214500, -0.09, 30, 55000),
    '1년': genSeries(2214500, -0.22, 40, 110000),
  },
  kakao: {
    '1일': genSeries(51300, 0.0098, 24, 400),
    '1주': genSeries(51300, 0.02, 28, 700),
    '1달': genSeries(51300, 0.04, 30, 1200),
    '1년': genSeries(51300, 0.08, 40, 2200),
  },
}

// 관심 종목 — 보유하지 않은 종목의 시세만 표시(3번 시나리오 "관심 종목 시세").
//   보유 개념이 없어 평가손익/수익률 대신 시세 위주 필드로 구성한다.
//   3뎁스 카드는 종목명·현재가·등락률만 1줄로 보여준다(watchOptions).
//   changeRate 부호 = 등락 색(한국 증권 관례: up=빨강/down=파랑/flat=회색).
export const watchlist = {
  naver: {
    id: 'naver',
    name: 'NAVER',
    price: 245000, // 현재가
    change: 5100, // 전일 대비 등락액
    changeRate: 2.13, // 등락률(%)
    rows: [
      { label: '전일 종가', value: '239,900원' },
      { label: '시가', value: '240,500원' },
      { label: '고가', value: '246,800원' },
      { label: '저가', value: '240,100원' },
      { label: '거래량', value: '1,082,400주' },
    ],
  },
  hyundai: {
    id: 'hyundai',
    name: '현대차',
    price: 312500,
    change: -2680,
    changeRate: -0.85,
    rows: [
      { label: '전일 종가', value: '315,180원' },
      { label: '시가', value: '314,500원' },
      { label: '고가', value: '315,000원' },
      { label: '저가', value: '311,200원' },
      { label: '거래량', value: '638,900주' },
    ],
  },
  lgensol: {
    id: 'lgensol',
    name: 'LG에너지솔루션',
    price: 408000,
    change: 5120,
    changeRate: 1.27,
    rows: [
      { label: '전일 종가', value: '402,880원' },
      { label: '시가', value: '403,500원' },
      { label: '고가', value: '410,000원' },
      { label: '저가', value: '403,000원' },
      { label: '거래량', value: '214,700주' },
    ],
  },
}

// 관심 종목 차트 시계열(추세 부호 = 등락 방향).
Object.assign(chartSeries, {
  naver: {
    '1일': genSeries(245000, 0.0213, 24, 2000),
    '1주': genSeries(245000, 0.05, 28, 3500),
    '1달': genSeries(245000, 0.1, 30, 6000),
    '1년': genSeries(245000, 0.3, 40, 12000),
  },
  hyundai: {
    '1일': genSeries(312500, -0.0085, 24, 2500),
    '1주': genSeries(312500, -0.03, 28, 4500),
    '1달': genSeries(312500, -0.07, 30, 8000),
    '1년': genSeries(312500, -0.15, 40, 16000),
  },
  lgensol: {
    '1일': genSeries(408000, 0.0127, 24, 3500),
    '1주': genSeries(408000, 0.04, 28, 6000),
    '1달': genSeries(408000, 0.09, 30, 11000),
    '1년': genSeries(408000, 0.25, 40, 22000),
  },
})

export const chartPeriods = ['1일', '1주', '1달', '1년']

// 오늘 증시 상황(2번 시나리오) — 주요 지수/환율/코인 시세 목업.
//   changeRate 부호 = 등락 색(한국 증권 관례: up=빨강/down=파랑/flat=회색).
//   icon = MarketBoard의 모노크롬 라인 아이콘 종류('index' | 'fx' | 'crypto' | 'gold' | 'oil').
export const marketIndices = [
  { name: '코스피', value: '3,245.67', change: '+12.34', changeRate: 0.38, icon: 'index' },
  { name: '코스닥', value: '1,032.18', change: '+13.28', changeRate: 1.3, icon: 'index' },
  { name: 'S&P 500', value: '7,511.20', change: '-42.94', changeRate: -0.57, icon: 'index' },
  { name: '나스닥 종합', value: '26,376.5', change: '-307.6', changeRate: -1.15, icon: 'index' },
  { name: '다우존스', value: '52,184.30', change: '+328.64', changeRate: 0.64, icon: 'index' },
  { name: '원/달러', value: '1,378.50', change: '+4.20', changeRate: 0.31, icon: 'fx' },
  { name: '금 (USD/oz)', value: '4,331.20', change: '-0.55', changeRate: -0.01, icon: 'gold' },
  { name: '비트코인', value: '95,420', change: '+1,240', changeRate: 1.32, icon: 'crypto' },
]

// 공포 & 탐욕 지수(0~100). value 위치에 마커, label은 구간 설명.
//   0–24 극단적 공포 / 25–44 공포 / 45–55 중립 / 56–75 탐욕 / 76–100 극단적 탐욕
export const fearGreed = { value: 40, label: '공포', source: 'CNN' }

// 지수 질문 매칭용 별칭(STT)
const marketAliases = {
  코스피: ['코스피', 'kospi'],
  코스닥: ['코스닥', 'kosdaq'],
  'S&P 500': ['s&p', 'sp500', '에스앤피', '스앤피', '500'],
  '나스닥 종합': ['나스닥', 'nasdaq'],
  다우존스: ['다우', 'dow'],
  '원/달러': ['환율', '원달러', '달러', '원/달러'],
  '금 (USD/oz)': ['금값', '금시세', '국제금', '금'],
  비트코인: ['비트코인', '비트', 'btc', '코인'],
}

// STT 지수 질문에 대한 간단 답변(2번 시나리오 마지막 단계). 매칭 안 되면 안내 멘트.
export function answerMarket(text) {
  const t = (text || '').toLowerCase().replace(/\s/g, '')

  // 공포 & 탐욕 지수
  if (/공포|탐욕|투자심리|심리/.test(text || '')) {
    return `투자심리(공포·탐욕) 지수는 현재 ${fearGreed.value}, '${fearGreed.label}' 구간입니다.`
  }

  for (const idx of marketIndices) {
    const aliases = marketAliases[idx.name] || [idx.name]
    if (aliases.some((a) => t.includes(a.toLowerCase().replace(/\s/g, '')))) {
      const word = idx.name.replace(/\s*\(.*\)\s*/, '') // 단위 괄호 제거
      const dir = idx.changeRate > 0 ? '상승' : idx.changeRate < 0 ? '하락' : '보합'
      const rate = `${idx.changeRate > 0 ? '+' : ''}${idx.changeRate}%`
      return `${word} 현재 ${idx.value}, 전일 대비 ${rate} ${dir}했습니다.`
    }
  }

  // 증시와 무관하거나 인식하지 못한 질문(엉뚱한 입력)
  return '죄송합니다. 말씀하신 내용은 정확히 이해하지 못했습니다. 코스피·나스닥·환율·금·비트코인 등 궁금한 지수를 말씀해 주세요.'
}

// 종목 선택 카드(StockPicker)용 요약 데이터
export const stockOptions = Object.values(holdings).map((h) => ({
  value: h.id,
  name: h.name,
  price: h.price,
  changeRate: h.changeRate,
  avgPrice: h.avgPrice,
  quantity: h.quantity,
  evalAmount: h.evalAmount,
  profit: h.profit,
  returnRate: h.returnRate,
  returnTone: h.returnTone,
}))

// 관심 종목 선택 카드(StockPicker, variant='watch')용 요약 — 종목명·현재가·등락률만.
export const watchOptions = Object.values(watchlist).map((w) => ({
  value: w.id,
  name: w.name,
  price: w.price,
  changeRate: w.changeRate,
}))

// 종목 별칭 — STT로 약칭/구어체로 말해도 매칭되도록.
const stockAliases = {
  samsung: ['삼성전자', '삼성', '005930'],
  skhynix: ['sk하이닉스', '하이닉스', 'sk', '에스케이', '000660'],
  kakao: ['카카오', '카톡', '035720'],
}

// STT 입력 텍스트에서 종목 id 찾기(별칭 부분 매칭). 보유 종목이 아니면 null.
export function matchStockId(text) {
  const t = (text || '').toLowerCase().replace(/\s/g, '')
  for (const [id, aliases] of Object.entries(stockAliases)) {
    if (aliases.some((a) => t.includes(a.toLowerCase()))) return id
  }
  return null
}

// 관심 종목 별칭 — STT 약칭/구어체 매칭.
const watchAliases = {
  naver: ['naver', '네이버', '035420'],
  hyundai: ['현대차', '현대자동차', '현대', '005380'],
  lgensol: ['lg에너지솔루션', 'lg엔솔', '엔솔', 'lg에너지', '373220'],
}

// STT 입력 텍스트에서 관심 종목 id 찾기. 목록에 없으면 null.
export function matchWatchId(text) {
  const t = (text || '').toLowerCase().replace(/\s/g, '')
  for (const [id, aliases] of Object.entries(watchAliases)) {
    if (aliases.some((a) => t.includes(a.toLowerCase()))) return id
  }
  return null
}

// 오류 캡처 샘플 — 각기 다른 분석 결과가 매핑된다(늘 같은 답이면 들킴).
export const captureSamples = [
  { id: 'order-fund', label: '매도 주문 화면' },
  { id: 'login-lock', label: '로그인 오류 화면' },
  { id: 'network', label: '네트워크 오류 화면' },
]

// STT 입력 텍스트에서 캡처 id 찾기. 못 찾으면 첫 샘플로 진행(데모 안전장치).
export function matchCaptureId(text) {
  const found = captureSamples.find((s) => text.includes(s.label))
  return found?.id ?? captureSamples[0].id
}

// 캡처 분석 결과(A안 스크립트) — 이미지의 구체 요소를 짚는 문구로 작성.
export const captureResults = {
  'order-fund': {
    summary:
      "화면 상단의 '주문가능금액 부족' 안내와 비활성화된 매도 버튼으로 보아, 매도가 아닌 매수 탭이 선택된 상태에서 주문을 시도하신 것으로 분석됩니다.",
    cause: '주문 화면이 매수 모드로 설정되어 있어, 보유 수량이 아닌 주문가능금액을 기준으로 검증되었습니다.',
    solution: [
      "주문 화면 상단의 '매도' 탭을 먼저 선택하세요.",
      '매도할 수량과 희망 가격을 입력합니다.',
      "하단의 '매도 주문' 버튼으로 주문을 확정하세요.",
    ],
  },
  'login-lock': {
    summary:
      "화면 중앙의 '비밀번호 5회 오류로 잠금' 메시지로 보아, 로그인 시도 횟수 초과로 계정이 일시 잠금된 상태입니다.",
    cause: '연속된 비밀번호 오류로 보안 잠금이 적용되었습니다.',
    solution: [
      "로그인 화면의 '비밀번호 재설정'을 선택하세요.",
      '본인인증을 거쳐 비밀번호를 재설정합니다.',
      '새 비밀번호로 다시 로그인하세요.',
    ],
  },
  network: {
    summary:
      "화면 하단의 '일시적인 연결 오류(E-503)' 표시로 보아, 서버 연결이 원활하지 않아 시세가 갱신되지 않은 상태입니다.",
    cause: '네트워크 불안정으로 실시간 시세 연결이 끊겼습니다.',
    solution: [
      'Wi-Fi 또는 데이터 연결 상태를 확인하세요.',
      '앱을 완전히 종료한 뒤 다시 실행합니다.',
      '문제가 지속되면 잠시 후 다시 시도하세요.',
    ],
  },
}
