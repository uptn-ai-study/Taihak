import { ref, computed } from 'vue'
import type { Board, LastMove, GameResult } from '../types'
import { createBoard, checkWin, isBoardFull, MAX_STAGE } from '../lib/gomoku'
import { getAIMove, stageDelay } from '../lib/ai'
import { upsertPlayer } from '../lib/supabase'

const LOCAL_KEY = 'omok_records'

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

  // Load saved stats
  const saved = loadLocal(nickname)
  if (saved) {
    wins.value = saved.wins
    losses.value = saved.losses
    maxStage.value = saved.max_stage
    currentStage.value = Math.min(saved.current_stage, MAX_STAGE)
  }

  const progress = computed(() => (currentStage.value / MAX_STAGE) * 100)

  function initBoard() {
    board.value = createBoard()
    lastMove.value = null
    isPlayerTurn.value = true
    gameOver.value = false
    aiThinking.value = false
    result.value = null
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

  function handlePlayerMove(r: number, c: number) {
    if (!isPlayerTurn.value || gameOver.value || aiThinking.value) return
    if (board.value[r][c] !== 0) return

    place(r, c, 1)

    if (checkWin(board.value, r, c, 1)) {
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
    if (!move) { isPlayerTurn.value = true; return }

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
  }

  function nextStage() {
    if (currentStage.value < MAX_STAGE) currentStage.value++
    else currentStage.value = 1
    initBoard()
  }

  function retry() {
    initBoard()
  }

  return {
    board, lastMove, currentStage, isPlayerTurn, gameOver,
    aiThinking, wins, losses, maxStage, result, progress,
    handlePlayerMove, nextStage, retry, initBoard,
  }
}
