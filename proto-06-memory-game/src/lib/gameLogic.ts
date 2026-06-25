import type { Card } from '../types'

const SYMBOLS = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅',
  '🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌',
  '🐞','🐜','🐢','🐍','🦎','🐙','🦑','🦐','🦀','🐡',
  '🐠','🐟','🐬','🐳','🦈','🐊','🐘','🦛','🦏','🦒',
  '🦘','🦬','🐃','🐄','🐎','🐑','🦙','🐐','🦌','🐕',
  '🐈','🦃','🦚','🦜','🕊️','🐇','🦝','🦨','🦡','🦫',
  '🦦','🦥','🐁','🐀','🐿️','🦔','🌵','🌲','🌴','🌸',
]

export function getGridSize(stage: number): number {
  if (stage <= 4)  return 3   // 3×3
  if (stage <= 10) return 4   // 4×4
  if (stage <= 17) return 5   // 5×5
  if (stage <= 25) return 6   // 6×6
  if (stage <= 33) return 7   // 7×7
  if (stage <= 40) return 8   // 8×8
  return 9                    // 9×9
}

// 그리드 크기에 따라 제한 시간 (초)
export function getTimeLimit(stage: number): number {
  const n = getGridSize(stage)
  if (n <= 3) return 30
  if (n === 4) return 35
  if (n === 5) return 40
  return 45
}

// 단계별 ⭐ 카드 수 (10단계 이전은 홀수 그리드 기본 1개만)
export function getFreeCardCount(stage: number): number {
  const n = getGridSize(stage)
  if (stage <= 10) return n % 2 !== 0 ? 1 : 0  // 난이도 조절 별카드 미적용
  if (n === 5) {
    if (stage <= 13) return 5               // 11~13단계: 10쌍
    if (stage <= 16) return 3               // 14~16단계: 11쌍
    return 1                                // 17단계: 12쌍
  }
  if (n === 6) return stage <= 19 ? 4 : 0  // 18~19단계: 16쌍, 20단계: 18쌍
  return n % 2 !== 0 ? 1 : 0
}

export function getPairsForStage(stage: number): number {
  const n = getGridSize(stage)
  const freeCount = getFreeCardCount(stage)
  return (n * n - freeCount) / 2
}

export function buildCards(stage: number): Card[] {
  const n = getGridSize(stage)
  const total = n * n
  const freeCount = getFreeCardCount(stage)
  const pairCount = (total - freeCount) / 2

  // ⭐ 위치를 랜덤하게 선택
  const allPositions = Array.from({ length: total }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
  const freePositions = new Set(allPositions.slice(0, freeCount))

  // 나머지 위치에 쌍 심볼 배치
  const symbols = SYMBOLS.slice(0, pairCount)
  const pairedSymbols = [...symbols, ...symbols].sort(() => Math.random() - 0.5)

  let symbolIdx = 0
  return Array.from({ length: total }, (_, idx) => {
    if (freePositions.has(idx)) {
      return { id: idx, symbol: '⭐', isFlipped: true, isMatched: true, isFree: true }
    }
    return { id: idx, symbol: pairedSymbols[symbolIdx++], isFlipped: false, isMatched: false, isFree: false }
  })
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
