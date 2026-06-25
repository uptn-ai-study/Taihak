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

// 단계별 ⭐ 카드 수
// - 홀수 그리드: 기본 1개, 구간 초반엔 추가
// - 짝수 그리드: 기본 0개, 구간 초반엔 추가
export function getFreeCardCount(stage: number): number {
  const n = getGridSize(stage)
  if (n === 3) return stage <= 2 ? 3 : 1   // 1~2단계: 3쌍, 3~4단계: 4쌍
  if (n === 4) return stage <= 7 ? 2 : 0   // 5~7단계: 7쌍, 8~10단계: 8쌍
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

  const symbols = SYMBOLS.slice(0, pairCount)
  const doubled = [...symbols, ...symbols].sort(() => Math.random() - 0.5)

  const cards: Card[] = doubled.map((symbol, idx) => ({
    id: idx,
    symbol,
    isFlipped: false,
    isMatched: false,
    isFree: false,
  }))

  // ⭐ 카드를 균등 간격으로 삽입
  if (freeCount > 0) {
    const step = Math.floor(total / (freeCount + 1))
    for (let i = freeCount; i >= 1; i--) {
      const pos = step * i
      const freeCard: Card = {
        id: total - i,
        symbol: '⭐',
        isFlipped: true,
        isMatched: true,
        isFree: true,
      }
      cards.splice(pos, 0, freeCard)
    }
  }

  return cards
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
