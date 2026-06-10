import type { Board, Cell } from '../types'

export const BOARD_SIZE = 15
export const MAX_STAGE = 20

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0) as Cell[])
}

export function checkWin(board: Board, r: number, c: number, player: Cell): boolean {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    let cnt = 1
    for (let d = 1; d < 5; d++) {
      const nr = r + dr * d, nc = c + dc * d
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break
      cnt++
    }
    for (let d = 1; d < 5; d++) {
      const nr = r - dr * d, nc = c - dc * d
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break
      cnt++
    }
    if (cnt >= 5) return true
  }
  return false
}

export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== 0))
}
