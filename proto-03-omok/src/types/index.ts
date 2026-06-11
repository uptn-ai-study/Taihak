export type Cell = 0 | 1 | 2 // 0: empty, 1: player(black), 2: AI(white)
export type Board = Cell[][]

export interface LastMove {
  r: number
  c: number
}

export interface PlayerRecord {
  nickname: string
  wins: number
  losses: number
  games: number
  max_stage: number
  updated_at?: string
}

export type GameResult = 'win' | 'lose' | 'timeout' | 'draw'
