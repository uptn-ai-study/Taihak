import type { Board, Cell } from '../types'

export const BOARD_SIZE = 15
export const MAX_STAGE = 20

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0) as Cell[])
}

// exact5=true → 정확히 5목만 승리 (흑 렌주룰), false → 5목 이상 승리 (백)
export function checkWin(board: Board, r: number, c: number, player: Cell, exact5 = false): boolean {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    let cnt = 1
    for (let d = 1; d <= 5; d++) {
      const nr = r + dr * d, nc = c + dc * d
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break
      cnt++
    }
    for (let d = 1; d <= 5; d++) {
      const nr = r - dr * d, nc = c - dc * d
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break
      cnt++
    }
    if (exact5 ? cnt === 5 : cnt >= 5) return true
  }
  return false
}

export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== 0))
}

// ===== 렌주룰 금지수 (흑 전용) =====

function getCell(board: Board, r: number, c: number, dr: number, dc: number, d: number): number {
  const nr = r + dr * d, nc = c + dc * d
  if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return -1
  const v = board[nr][nc]
  return v === 2 ? -1 : (v as number)
}

// --- 장목 (overline): 흑이 6개 이상 일렬 생성 금지 ---
export function isOverline(board: Board, r: number, c: number): boolean {
  if (board[r][c] !== 0) return false
  board[r][c] = 1
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    let cnt = 1
    for (let d = 1; d <= 5; d++) {
      const nr = r + dr * d, nc = c + dc * d
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== 1) break
      cnt++
    }
    for (let d = 1; d <= 5; d++) {
      const nr = r - dr * d, nc = c - dc * d
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== 1) break
      cnt++
    }
    if (cnt >= 6) { board[r][c] = 0; return true }
  }
  board[r][c] = 0
  return false
}

// --- 사사 (double-four): 흑이 4를 2방향 이상 동시 생성 금지 ---
function hasFourInDir(board: Board, r: number, c: number, dr: number, dc: number): boolean {
  const G = (d: number): number => getCell(board, r, c, dr, dc, d)
  const L = Array.from({ length: 9 }, (_, i) => G(i - 4))
  const ci = 4
  for (let s = Math.max(0, ci - 4); s <= ci && s + 4 <= 8; s++) {
    const w = L.slice(s, s + 5)
    if (w.some(v => v === -1)) continue
    if (w.filter(v => v === 1).length === 4 && w.filter(v => v === 0).length === 1) return true
  }
  return false
}

export function isDoubleFour(board: Board, r: number, c: number): boolean {
  if (board[r][c] !== 0) return false
  if (checkWin(board, r, c, 1, true)) return false // 5목은 예외
  board[r][c] = 1
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  let fours = 0
  for (const [dr, dc] of dirs) {
    if (hasFourInDir(board, r, c, dr, dc)) fours++
  }
  board[r][c] = 0
  return fours >= 2
}

// 해당 방향에서 열린 3이 생기는지 검사 (board에 이미 (r,c)=1이 놓인 상태)
function hasOpenThreeInDir(board: Board, r: number, c: number, dr: number, dc: number): boolean {
  const G = (d: number) => getCell(board, r, c, dr, dc, d)

  // 11칸 라인 (-5 ~ +5), 중심 인덱스 = 5
  const L = Array.from({ length: 11 }, (_, i) => G(i - 5))
  const ci = 5

  for (let s = Math.max(0, ci - 4); s <= ci && s + 4 <= 10; s++) {
    const e = s + 4
    const w = L.slice(s, e + 1)

    if (w.some(v => v === -1)) continue // 막힌 칸 포함 → 스킵

    const pCnt = w.filter(v => v === 1).length
    const eCnt = w.filter(v => v === 0).length
    if (pCnt !== 3 || eCnt !== 2) continue

    const lo = s > 0 ? L[s - 1] : -1       // 윈도우 왼쪽 바깥
    const ro = e < 10 ? L[e + 1] : -1      // 윈도우 오른쪽 바깥

    // 빈 칸 하나 채워서 열린 4(open four)가 되는지 확인
    for (let i = 0; i < 5; i++) {
      if (w[i] !== 0) continue

      const tw = [...w]; tw[i] = 1

      // 4연속 찾기
      let run = 0, runStart = -1, fourStart = -1
      for (let j = 0; j <= 4; j++) {
        if (tw[j] === 1) {
          if (run === 0) runStart = j
          run++
          if (run >= 4) { fourStart = runStart; break }
        } else { run = 0 }
      }
      if (fourStart === -1) continue

      const fs = fourStart, fe = fourStart + 3
      const leftOpen  = fs === 0 ? lo === 0 : tw[fs - 1] === 0
      const rightOpen = fe === 4 ? ro === 0 : tw[fe + 1] === 0

      if (leftOpen && rightOpen) return true // 열린 4 → 이 방향은 열린 3
    }
  }
  return false
}

// (r,c)에 흑돌을 놓았을 때 33 금수인지 검사
export function isDoubleThree(board: Board, r: number, c: number): boolean {
  if (board[r][c] !== 0) return false
  if (checkWin(board, r, c, 1, true)) return false // 정확히 5목은 예외

  board[r][c] = 1
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  let openThrees = 0
  for (const [dr, dc] of dirs) {
    if (hasOpenThreeInDir(board, r, c, dr, dc)) openThrees++
  }
  board[r][c] = 0

  return openThrees >= 2
}
