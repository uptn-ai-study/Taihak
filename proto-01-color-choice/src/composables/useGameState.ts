import { ref, computed } from 'vue'
import type { Difficulty, GameScreen, GameColor, RoundScore, DifficultyConfig } from '../types/game'
import { generateRandomColor, hsbToRgb, hsbToLab, ciede2000, calculateMatchScore, scoreToTier } from '../utils/color'
import { useStorage } from './useStorage'

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'EASY', description: '3라운드 / 색상당 8.00초', revealTime: 8000 },
  normal: { label: 'NORMAL', description: '3라운드 / 색상당 6.00초', revealTime: 6000 },
  hard: { label: 'HARD', description: '3라운드 / 색상당 4.00초', revealTime: 4000 },
}

const TOTAL_ROUNDS = 3

export function useGameState() {
  const { saveRecord } = useStorage()

  // 게임 상태
  const currentScreen = ref<GameScreen>('start')
  const difficulty = ref<Difficulty>('normal')
  const targetColors = ref<GameColor[]>([])
  const userGuesses = ref<GameColor[]>([])
  const scores = ref<RoundScore[]>([])
  const currentRoundIndex = ref(0)

  // 타이머 상태
  const timerRemaining = ref(0)
  const timerTotal = ref(0)
  let animFrameId: number | null = null
  let timerTimeoutId: number | null = null

  // 토스트 상태
  const toastMessage = ref('')
  let toastTimeoutId: number | null = null

  // Computed
  const revealTime = computed(() => DIFFICULTY_CONFIGS[difficulty.value].revealTime)
  const currentTarget = computed(() => targetColors.value[currentRoundIndex.value])
  const grandScore = computed(() => {
    const total = scores.value.reduce((sum, s) => sum + s.score, 0)
    return parseFloat(total.toFixed(2))
  })
  const tier = computed(() => scoreToTier(grandScore.value))
  const isLastRound = computed(() => currentRoundIndex.value >= TOTAL_ROUNDS - 1)
  const timerRatio = computed(() => timerTotal.value > 0 ? timerRemaining.value / timerTotal.value : 0)
  const timerSeconds = computed(() => (timerRemaining.value / 1000).toFixed(2))

  // 게임 흐름
  function startGame() {
    targetColors.value = []
    userGuesses.value = []
    scores.value = []
    currentRoundIndex.value = 0

    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      targetColors.value.push(generateRandomColor())
    }

    startRevealPhase(0)
  }

  function startRevealPhase(index: number) {
    currentRoundIndex.value = index
    currentScreen.value = 'reveal'
    startTimer()
  }

  function startTimer() {
    const total = revealTime.value
    const startTime = Date.now()
    timerTotal.value = total
    timerRemaining.value = total

    stopTimer()

    function tick() {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, total - elapsed)
      timerRemaining.value = remaining

      if (remaining <= 0) {
        stopTimer()
        timerTimeoutId = window.setTimeout(() => {
          currentScreen.value = 'recall'
        }, 200)
      } else {
        animFrameId = requestAnimationFrame(tick)
      }
    }

    animFrameId = requestAnimationFrame(tick)
  }

  function stopTimer() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (timerTimeoutId !== null) {
      clearTimeout(timerTimeoutId)
      timerTimeoutId = null
    }
  }

  function submitColor(h: number, s: number, b: number) {
    const guessRgb = hsbToRgb(h, s, b)
    const guessLab = hsbToLab(h, s, b)
    const guess: GameColor = { hsb: { h, s, b }, rgb: guessRgb, lab: guessLab }

    userGuesses.value.push(guess)

    const target = targetColors.value[currentRoundIndex.value]
    const deltaE = ciede2000(target.lab, guessLab)
    const score = calculateMatchScore(deltaE)

    scores.value.push({
      score,
      deltaE,
      deltaH: h - target.hsb.h,
      deltaS: s - target.hsb.s,
      deltaB: b - target.hsb.b,
    })

    if (currentRoundIndex.value < TOTAL_ROUNDS - 1) {
      startRevealPhase(currentRoundIndex.value + 1)
    } else {
      finishGame()
    }
  }

  function finishGame() {
    saveRecord({
      date: new Date().toLocaleDateString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      difficulty: difficulty.value.toUpperCase(),
      score: grandScore.value,
      tier: tier.value,
    })

    currentScreen.value = 'results'
  }

  function goToHome() {
    stopTimer()
    targetColors.value = []
    userGuesses.value = []
    scores.value = []
    currentRoundIndex.value = 0
    currentScreen.value = 'start'
  }

  function showToast(message: string) {
    toastMessage.value = message
    if (toastTimeoutId) clearTimeout(toastTimeoutId)
    toastTimeoutId = window.setTimeout(() => {
      toastMessage.value = ''
    }, 2800)
  }

  function shareResults() {
    let emojiBlock = ''
    scores.value.forEach(stat => {
      if (stat.score >= 9.5) emojiBlock += '\u{1F7E9}'
      else if (stat.score >= 8.5) emojiBlock += '\u{1F7E6}'
      else if (stat.score >= 7.0) emojiBlock += '\u{1F7E8}'
      else if (stat.score >= 5.0) emojiBlock += '\u{1F7E7}'
      else emojiBlock += '\u{1F7E5}'
    })

    const text = `DIALED // COLOR CHALLENGE (${difficulty.value.toUpperCase()})\n최종 스코어: ${grandScore.value.toFixed(2)} / 30.00 만점\n결과 분석: ${emojiBlock}\n\n당신의 색상 복원 감각을 테스트해 보세요!`

    navigator.clipboard.writeText(text).then(() => {
      showToast('공유용 분석 결과가 클립보드에 복사되었습니다!')
    }).catch(() => {
      showToast('클립보드 복사에 실패했습니다.')
    })
  }

  return {
    // State
    currentScreen,
    difficulty,
    targetColors,
    userGuesses,
    scores,
    currentRoundIndex,
    toastMessage,

    // Computed
    revealTime,
    currentTarget,
    grandScore,
    tier,
    isLastRound,
    timerRatio,
    timerSeconds,

    // Actions
    startGame,
    submitColor,
    goToHome,
    showToast,
    shareResults,

    // Constants
    TOTAL_ROUNDS,
  }
}
