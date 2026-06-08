import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  type Difficulty,
  type GameScreen,
  type RoundData,
  DIFFICULTY_CONFIG,
  TOTAL_ROUNDS,
  SCORE_MESSAGES,
} from '../types/game'

function randomMs(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100
}

function calcScore(targetMs: number, playerMs: number): number {
  const error = Math.abs(targetMs - playerMs) / targetMs
  return Math.max(0, 10 * (1 - error))
}

export const useGameStore = defineStore('game', () => {
  // ── State ──────────────────────────────────────────────
  const screen = ref<GameScreen>('intro')
  const difficulty = ref<Difficulty>('easy')
  const currentRound = ref(1)
  const rounds = ref<RoundData[]>([])
  const targetMs = ref(0)          // 현재 라운드 목표 시간
  const countdownValue = ref(3)

  // ── Getters ────────────────────────────────────────────
  const totalScore = computed(() =>
    rounds.value.reduce((sum, r) => sum + r.score, 0)
  )

  const scoreMessage = computed(() => {
    const total = totalScore.value
    return (
      SCORE_MESSAGES.find((m) => total >= m.min && total <= m.max)?.message ?? ''
    )
  })

  const currentRoundResult = computed(() =>
    rounds.value[rounds.value.length - 1] ?? null
  )

  // ── Actions ────────────────────────────────────────────

  /** 게임 전체 초기화 */
  function startGame() {
    rounds.value = []
    currentRound.value = 1
    _loadNextTarget()
    screen.value = 'countdown'
    _runCountdown()
  }

  /** 현재 라운드 목표 시간 설정 */
  function _loadNextTarget() {
    const { minMs, maxMs } = DIFFICULTY_CONFIG[difficulty.value]
    targetMs.value = randomMs(minMs, maxMs)
  }

  /** 카운트다운 실행 */
  function _runCountdown() {
    countdownValue.value = 3
    const tick = () => {
      if (countdownValue.value > 1) {
        countdownValue.value--
        setTimeout(tick, 900)
      } else {
        screen.value = 'watch'
      }
    }
    setTimeout(tick, 900)
  }

  /** 관찰 화면 → 재현 화면 */
  function onWatchDone() {
    screen.value = 'recreate'
  }

  /** 플레이어가 재현 완료 */
  function submitRecreatation(playerMs: number) {
    const score = calcScore(targetMs.value, playerMs)
    rounds.value.push({
      targetMs: targetMs.value,
      playerMs,
      score,
    })
    screen.value = 'roundResult'
  }

  /** 다음 라운드로 진행 */
  function nextRound() {
    if (currentRound.value >= TOTAL_ROUNDS) {
      screen.value = 'totalResult'
    } else {
      currentRound.value++
      _loadNextTarget()
      screen.value = 'countdown'
      _runCountdown()
    }
  }

  /** 게임 재시작 */
  function restartGame() {
    screen.value = 'intro'
  }

  /** 난이도 변경 */
  function setDifficulty(d: Difficulty) {
    difficulty.value = d
  }

  return {
    screen,
    difficulty,
    currentRound,
    rounds,
    targetMs,
    countdownValue,
    totalScore,
    scoreMessage,
    currentRoundResult,
    startGame,
    onWatchDone,
    submitRecreatation,
    nextRound,
    restartGame,
    setDifficulty,
  }
})
