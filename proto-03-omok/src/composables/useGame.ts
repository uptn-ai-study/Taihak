import { ref, computed } from 'vue'
import type { Board, LastMove, GameResult } from '../types'
import { createBoard, checkWin, isBoardFull, isOverline, isDoubleThree, isDoubleFour, MAX_STAGE } from '../lib/gomoku'
import { getAIMove, stageDelay } from '../lib/ai'
import { upsertPlayer } from '../lib/supabase'

const LOCAL_KEY = 'omok_records'
const TURN_TIME = 10

function loadLocal(nickname: string) {
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<string, {
    wins: number; losses: number; games: number; max_stage: number; current_stage: number
  }>
  return all[nickname] ?? null
}

function saveLocal(nickname: string, data: { wins: number; losses: number; games: number; max_stage: number; current_stage: number }) {
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}')
  all[nickname] = data
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
}

export function useGame(nickname: string) {
  const board = ref<Board>(createBoard())
  const lastMove = ref<LastMove | null>(null)
  const currentStage = ref(1)
  const isPlayerTurn = ref(true)
  const gameOver = ref(false)
  const aiThinking = ref(false)
  const wins = ref(0)
  const losses = ref(0)
  const maxStage = ref(1)
  const result = ref<GameResult | null>(null)
  const timeLeft = ref(TURN_TIME)

  let timerInterval: ReturnType<typeof setInterval> | null = null

  const saved = loadLocal(nickname)
  if (saved) {
    wins.value = saved.wins
    losses.value = saved.losses
    maxStage.value = saved.max_stage
    currentStage.value = Math.min(saved.current_stage, MAX_STAGE)
  }

  const progress = computed(() => (currentStage.value / MAX_STAGE) * 100)

  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function startTimer() {
    stopTimer()
    timeLeft.value = TURN_TIME
    timerInterval = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        stopTimer()
        gameOver.value = true
        losses.value++
        result.value = 'timeout'
        persist()
      }
    }, 1000)
  }

  function initBoard() {
    stopTimer()
    board.value = createBoard()
    lastMove.value = null
    isPlayerTurn.value = true
    gameOver.value = false
    aiThinking.value = false
    result.value = null
    startTimer()
  }

  function persist() {
    const data = {
      wins: wins.value,
      losses: losses.value,
      games: wins.value + losses.value,
      max_stage: maxStage.value,
      current_stage: currentStage.value,
    }
    saveLocal(nickname, data)
    upsertPlayer({ nickname, ...data }).catch(() => {})
  }

  function place(r: number, c: number, player: 1 | 2) {
    board.value[r][c] = player
    lastMove.value = { r, c }
  }

  function isForbidden(r: number, c: number): boolean {
    return isOverline(board.value, r, c) ||
           isDoubleThree(board.value, r, c) ||
           isDoubleFour(board.value, r, c)
  }

  const forbiddenCells = computed<[number, number][]>(() => {
    if (!isPlayerTurn.value || gameOver.value) return []
    const res: [number, number][] = []
    for (let r = 0; r < 15; r++)
      for (let c = 0; c < 15; c++)
        if (board.value[r][c] === 0 && isForbidden(r, c))
          res.push([r, c])
    return res
  })

  function handlePlayerMove(r: number, c: number) {
    if (!isPlayerTurn.value || gameOver.value || aiThinking.value) return
    if (board.value[r][c] !== 0) return
    if (isForbidden(r, c)) return

    stopTimer()
    place(r, c, 1)

    if (checkWin(board.value, r, c, 1, true)) {
      gameOver.value = true
      wins.value++
      maxStage.value = Math.max(maxStage.value, currentStage.value)
      result.value = 'win'
      persist()
      return
    }
    if (isBoardFull(board.value)) {
      gameOver.value = true
      result.value = 'draw'
      return
    }

    isPlayerTurn.value = false
    aiThinking.value = true
    setTimeout(() => runAI(), stageDelay(currentStage.value))
  }

  function runAI() {
    const move = getAIMove(board.value, currentStage.value)
    aiThinking.value = false
    if (!move) { isPlayerTurn.value = true; startTimer(); return }

    const [r, c] = move
    place(r, c, 2)

    if (checkWin(board.value, r, c, 2)) {
      gameOver.value = true
      losses.value++
      result.value = 'lose'
      persist()
      return
    }
    if (isBoardFull(board.value)) {
      gameOver.value = true
      result.value = 'draw'
      return
    }

    isPlayerTurn.value = true
    startTimer()
  }

  function nextStage() {
    if (currentStage.value < MAX_STAGE) currentStage.value++
    else currentStage.value = 1
    initBoard()
  }

  function retry() {
    initBoard()
  }

  function resetAll() {
    wins.value = 0
    losses.value = 0
    maxStage.value = 1
    currentStage.value = 1
    localStorage.removeItem(LOCAL_KEY)
    initBoard()
  }

  // 초기 타이머 시작
  startTimer()

  return {
    board, lastMove, currentStage, isPlayerTurn, gameOver,
    aiThinking, wins, losses, maxStage, result, progress, forbiddenCells,
    timeLeft,
    handlePlayerMove, nextStage, retry, initBoard, resetAll,
  }
}
