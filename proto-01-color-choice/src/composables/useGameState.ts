import { ref, computed } from 'vue'
import type { GameScreen, GameColor, ColorScore, RoundResult } from '../types/game'
import { generateRandomColor, hsbToRgb, hsbToLab, ciede2000, calculateMatchScore, scoreToTier } from '../utils/color'
import { useStorage } from './useStorage'
import { useRanking } from './useRanking'

// 게임 설정 상수
export const TOTAL_ROUNDS = 10
export const COLORS_PER_ROUND = 2
export const REVEAL_TIME = 5000     // 색상당 5초
export const PASS_THRESHOLD = 5     // 라운드당 통과 기준 (10점 만점 중 5점)
export const ROUND_MAX = 10         // 라운드당 만점 (색상당 5점 × 2)

export function useGameState() {
  const { saveRecord, nickname } = useStorage()
  const { submitScore } = useRanking()

  // --- 게임 상태 ---
  const currentScreen = ref<GameScreen>('start')

  // 라운드 진행 상태
  const currentRound = ref(0)          // 0-based 현재 라운드 인덱스
  const currentColorIndex = ref(0)     // 0-based 현재 라운드 내 색상 인덱스

  // 현재 라운드 데이터
  const roundColors = ref<GameColor[]>([])      // 현재 라운드 정답 색상 (3개)
  const roundGuesses = ref<GameColor[]>([])     // 현재 라운드 사용자 추측
  const roundColorScores = ref<ColorScore[]>([]) // 현재 라운드 개별 점수

  // 전체 게임 데이터
  const allRoundResults = ref<RoundResult[]>([])
  const eliminated = ref(false)

  // 타이머 상태
  const timerRemaining = ref(0)
  const timerTotal = ref(0)
  let animFrameId: number | null = null
  let timerTimeoutId: number | null = null

  // 토스트 상태
  const toastMessage = ref('')
  let toastTimeoutId: number | null = null

  // --- Computed ---
  const currentTarget = computed(() => roundColors.value[currentColorIndex.value])
  const isLastColorInRound = computed(() => currentColorIndex.value >= COLORS_PER_ROUND - 1)
  const timerRatio = computed(() => timerTotal.value > 0 ? timerRemaining.value / timerTotal.value : 0)
  const timerSeconds = computed(() => (timerRemaining.value / 1000).toFixed(2))

  const cumulativeScore = computed(() => {
    return parseFloat(allRoundResults.value.reduce((sum, r) => sum + r.totalScore, 0).toFixed(2))
  })

  const roundsCleared = computed(() => {
    return allRoundResults.value.filter(r => r.passed).length
  })

  const currentRoundScore = computed(() => {
    return parseFloat(roundColorScores.value.reduce((sum, s) => sum + s.score, 0).toFixed(2))
  })

  const currentRoundPassed = computed(() => currentRoundScore.value >= PASS_THRESHOLD)

  const tier = computed(() => scoreToTier(cumulativeScore.value))

  // --- 게임 흐름 ---

  function startGame() {
    currentRound.value = 0
    currentColorIndex.value = 0
    allRoundResults.value = []
    eliminated.value = false

    startNewRound()
  }

  function startNewRound() {
    // 현재 라운드 데이터 초기화
    roundColors.value = []
    roundGuesses.value = []
    roundColorScores.value = []
    currentColorIndex.value = 0

    // 3개 색상 생성
    for (let i = 0; i < COLORS_PER_ROUND; i++) {
      roundColors.value.push(generateRandomColor())
    }

    // 첫 번째 색상 암기 시작
    startRevealPhase()
  }

  function startRevealPhase() {
    currentScreen.value = 'reveal'
    startTimer()
  }

  function startTimer() {
    const total = REVEAL_TIME
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

    roundGuesses.value.push(guess)

    // 채점
    const target = roundColors.value[currentColorIndex.value]
    const deltaE = ciede2000(target.lab, guessLab)
    const score = calculateMatchScore(deltaE)

    roundColorScores.value.push({
      score,
      deltaE,
      deltaH: h - target.hsb.h,
      deltaS: s - target.hsb.s,
      deltaB: b - target.hsb.b,
    })

    if (currentColorIndex.value < COLORS_PER_ROUND - 1) {
      // 다음 색상 암기 → 복원
      currentColorIndex.value++
      startRevealPhase()
    } else {
      // 라운드 완료 → 라운드 결과
      finishRound()
    }
  }

  function finishRound() {
    const roundTotal = parseFloat(
      roundColorScores.value.reduce((sum, s) => sum + s.score, 0).toFixed(2)
    )
    const passed = roundTotal >= PASS_THRESHOLD

    const result: RoundResult = {
      round: currentRound.value + 1,
      targetColors: [...roundColors.value],
      userGuesses: [...roundGuesses.value],
      colorScores: [...roundColorScores.value],
      totalScore: roundTotal,
      passed,
    }

    allRoundResults.value.push(result)

    if (!passed) {
      eliminated.value = true
    }

    currentScreen.value = 'round_result'
  }

  function proceedAfterRound() {
    if (eliminated.value || currentRound.value >= TOTAL_ROUNDS - 1) {
      // 탈락 또는 10라운드 완료 → 최종 결과
      finishGame()
    } else {
      // 다음 라운드
      currentRound.value++
      startNewRound()
    }
  }

  function finishGame() {
    const finalScore = cumulativeScore.value
    const finalTier = tier.value
    const cleared = roundsCleared.value

    // 개인 기록 저장
    saveRecord({
      date: new Date().toLocaleDateString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      roundsCleared: cleared,
      totalRounds: TOTAL_ROUNDS,
      score: finalScore,
      tier: finalTier,
      eliminated: eliminated.value,
    })

    currentScreen.value = 'results'

    // 랭킹 제출 (백그라운드)
    submitScore(
      nickname.value,
      'normal',
      finalScore,
      finalTier
    )
  }

  function goToHome() {
    stopTimer()
    currentRound.value = 0
    currentColorIndex.value = 0
    roundColors.value = []
    roundGuesses.value = []
    roundColorScores.value = []
    allRoundResults.value = []
    eliminated.value = false
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
    const cleared = roundsCleared.value
    const total = cumulativeScore.value

    let emojiBlock = ''
    allRoundResults.value.forEach(r => {
      emojiBlock += r.passed ? '\u{2705}' : '\u{274C}'
    })

    const status = eliminated.value
      ? `${cleared}라운드에서 탈락`
      : `${TOTAL_ROUNDS}라운드 완주!`

    const text = `COLOR // SENSE CHALLENGE\n${status}\n누적 점수: ${total.toFixed(2)} / ${TOTAL_ROUNDS * ROUND_MAX}.00\n${emojiBlock}\n\n당신의 색상 감각을 테스트해 보세요!`

    navigator.clipboard.writeText(text).then(() => {
      showToast('공유용 결과가 클립보드에 복사되었습니다!')
    }).catch(() => {
      showToast('클립보드 복사에 실패했습니다.')
    })
  }

  return {
    // State
    currentScreen,
    currentRound,
    currentColorIndex,
    roundColors,
    roundGuesses,
    roundColorScores,
    allRoundResults,
    eliminated,
    toastMessage,

    // Computed
    currentTarget,
    isLastColorInRound,
    timerRatio,
    timerSeconds,
    cumulativeScore,
    roundsCleared,
    currentRoundScore,
    currentRoundPassed,
    tier,

    // Actions
    startGame,
    submitColor,
    proceedAfterRound,
    goToHome,
    showToast,
    shareResults,
  }
}
