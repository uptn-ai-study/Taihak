import type { Board, Cell } from '../types'
import { BOARD_SIZE, checkWin } from './gomoku'

function lineScore(board: Board, r: number, c: number, dr: number, dc: number, player: Cell): number {
  const opp = (player === 1 ? 2 : 1) as Cell
  let cnt = 1, openA = 0, openB = 0
  for (let d = 1; d <= 4; d++) {
    const nr = r + dr * d, nc = c + dc * d
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] === opp) break
    if (board[nr][nc] === 0) { openA = 1; break }
    cnt++
  }
  for (let d = 1; d <= 4; d++) {
    const nr = r - dr * d, nc = c - dc * d
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] === opp) break
    if (board[nr][nc] === 0) { openB = 1; break }
    cnt++
  }
  const opens = openA + openB
  if (cnt >= 5) return 100_000
  if (opens === 0) return 0
  const base = [0, 5, 50, 500, 5000][Math.min(cnt, 4)]
  return opens === 2 ? base * 2 : base
}

function cellScore(board: Board, r: number, c: number, player: Cell): number {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  return dirs.reduce((s, [dr, dc]) => s + lineScore(board, r, c, dr, dc, player), 0)
}

function hasNeighbor(board: Board, r: number, c: number, dist = 2): boolean {
  for (let dr = -dist; dr <= dist; dr++)
    for (let dc = -dist; dc <= dist; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc]) return true
    }
  return false
}

function candidates(board: Board): [number, number][] {
  const empty: [number, number][] = []
  let hasStones = false
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (board[r][c]) { hasStones = true; break }
  if (!hasStones) {
    const mid = Math.floor(BOARD_SIZE / 2)
    return [[mid, mid]]
  }
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (!board[r][c] && hasNeighbor(board, r, c)) empty.push([r, c])
  return empty
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  const cells = candidates(board)
  if (depth === 0 || cells.length === 0) {
    let score = 0
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === 2) score += cellScore(board, r, c, 2) * 0.5
        else if (board[r][c] === 1) score -= cellScore(board, r, c, 1) * 0.5
      }
    return score
  }
  if (maximizing) {
    let best = -Infinity
    for (const [r, c] of cells) {
      board[r][c] = 2
      if (checkWin(board, r, c, 2)) { board[r][c] = 0; return 900_000 }
      const val = minimax(board, depth - 1, alpha, beta, false)
      board[r][c] = 0
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const [r, c] of cells) {
      board[r][c] = 1
      if (checkWin(board, r, c, 1)) { board[r][c] = 0; return -900_000 }
      const val = minimax(board, depth - 1, alpha, beta, true)
      board[r][c] = 0
      best = Math.min(best, val)
      beta = Math.min(beta, val)
      if (beta <= alpha) break
    }
    return best
  }
}

export function getAIMove(board: Board, stage: number): [number, number] | null {
  const cells = candidates(board)
  if (!cells.length) return null

  // Stage 1: random
  if (stage === 1) return cells[Math.floor(Math.random() * cells.length)]

  // Immediate win
  for (const [r, c] of cells) {
    board[r][c] = 2
    const win = checkWin(board, r, c, 2)
    board[r][c] = 0
    if (win) return [r, c]
  }

  // Block player win (stage 3+)
  if (stage >= 3) {
    for (const [r, c] of cells) {
      board[r][c] = 1
      const playerWin = checkWin(board, r, c, 1)
      board[r][c] = 0
      if (playerWin) return [r, c]
    }
  }

  if (stage === 2) return cells[Math.floor(Math.random() * cells.length)]

  // Minimax for high stages
  const mmDepth = stage >= 18 ? 3 : stage >= 15 ? 2 : stage >= 13 ? 1 : 0

  if (mmDepth > 0) {
    let best = -Infinity
    let bestCell = cells[0]
    for (const [r, c] of cells) {
      board[r][c] = 2
      const val = minimax(board, mmDepth, -Infinity, Infinity, false)
      board[r][c] = 0
      if (val > best) { best = val; bestCell = [r, c] }
    }
    return bestCell
  }

  // Score-based
  const atkW = 0.3 + stage * 0.065
  const noise = Math.max(0, 0.6 - stage * 0.06)
  let best = -Infinity
  let bestCells: [number, number][] = []

  for (const [r, c] of cells) {
    board[r][c] = 2
    const atk = cellScore(board, r, c, 2)
    board[r][c] = 0
    board[r][c] = 1
    const def = cellScore(board, r, c, 1)
    board[r][c] = 0

    let score = atk * atkW + def + Math.random() * noise * 1000

    if (score > best) { best = score; bestCells = [[r, c]] }
    else if (score === best) bestCells.push([r, c])
  }

  return bestCells[Math.floor(Math.random() * Math.min(bestCells.length, 3))]
}

export function stageDelay(stage: number): number {
  if (stage <= 2) return 400
  if (stage <= 8) return 400 + stage * 30
  if (stage <= 14) return 600 + stage * 20
  return 800 + stage * 30
}
