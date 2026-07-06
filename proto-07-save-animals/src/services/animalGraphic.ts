// ─────────────────────────────────────────────────────────────
// 임시 그래픽 헬퍼 — 등급별 색상 원 + 이모지.
// 실제 AI 일러스트(imageSlot)가 준비되면 <img> 로 교체, 실패 시 이 폴백 사용.
// ─────────────────────────────────────────────────────────────

import { GRADES, getSpecies } from '../config/gameConfig'
import type { Grade } from '../types'

/** Leaflet divIcon 용 HTML 마커 (등급 색 링 + 종 이모지) */
export function markerHtml(speciesId: string, grade: Grade): string {
  const g = GRADES[grade]
  const s = getSpecies(speciesId)
  return `
    <div class="animal-marker" style="--g:${g.color}">
      <div class="animal-marker__pin">
        <span class="animal-marker__emoji">${s.emoji}</span>
      </div>
      <div class="animal-marker__grade">${g.emoji}</div>
    </div>`
}
