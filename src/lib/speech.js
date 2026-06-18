// 발화(speak) 단일 진입점.
// 1차 데모는 음성 없이 자막만 출력한다. 추후 음성 연동 시 이 파일의 speak() 내부만
// 수정하면 된다(예: window.speechSynthesis 또는 사전 녹음 mp3 재생). 호출부는 그대로 유지.

// 발화 길이를 글자 수에 비례해 추정(자막 노출 시간 = '말하는 중' 유지 시간)
function estimateDurationMs(text) {
  const base = 700
  const perChar = 55 // 한국어 기준 대략치
  return Math.min(base + text.length * perChar, 6000)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// conversation 스토어를 주입받아 발화를 수행하는 speaker 생성.
// speak(text): 자막 push + WaveIndicator 'speaking' → 발화 시간 후 'idle' 복귀.
export function createSpeaker(conversation) {
  async function speak(text) {
    if (!text) return
    conversation.pushBotCaption(text)
    conversation.setWave('speaking')

    // === 음성 연동 지점 ===
    // 추후 여기서 실제 TTS를 재생하고, 재생 완료를 기다리도록 교체한다.
    // 현재는 자막만 노출하며 추정 시간만큼 '말하는 중' 상태를 유지한다.
    await sleep(estimateDurationMs(text))

    conversation.setWave('idle')
  }

  return { speak }
}
