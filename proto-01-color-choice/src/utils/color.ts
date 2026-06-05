import type { RgbColor, XyzColor, LabColor, GameColor } from '../types/game'

/**
 * HSB (HSV) → RGB 변환
 */
export function hsbToRgb(h: number, s: number, b: number): RgbColor {
  const sN = s / 100
  const bN = b / 100

  const c = bN * sN
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = bN - c

  let r = 0, g = 0, bVal = 0

  if (h >= 0 && h < 60) { r = c; g = x; bVal = 0 }
  else if (h >= 60 && h < 120) { r = x; g = c; bVal = 0 }
  else if (h >= 120 && h < 180) { r = 0; g = c; bVal = x }
  else if (h >= 180 && h < 240) { r = 0; g = x; bVal = c }
  else if (h >= 240 && h < 300) { r = x; g = 0; bVal = c }
  else if (h >= 300 && h <= 360) { r = c; g = 0; bVal = x }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bVal + m) * 255),
  }
}

/**
 * RGB → XYZ (D65) 변환
 */
export function rgbToXyz(r: number, g: number, b: number): XyzColor {
  let rL = r / 255
  let gL = g / 255
  let bL = b / 255

  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92

  rL *= 100
  gL *= 100
  bL *= 100

  return {
    x: rL * 0.4124 + gL * 0.3576 + bL * 0.1805,
    y: rL * 0.2126 + gL * 0.7152 + bL * 0.0722,
    z: rL * 0.0193 + gL * 0.1192 + bL * 0.9505,
  }
}

/**
 * XYZ → CIELAB 변환
 */
export function xyzToLab(x: number, y: number, z: number): LabColor {
  const refX = 95.047
  const refY = 100.000
  const refZ = 108.883

  let vX = x / refX
  let vY = y / refY
  let vZ = z / refZ

  vX = vX > 0.008856 ? Math.pow(vX, 1 / 3) : (7.787 * vX) + (16 / 116)
  vY = vY > 0.008856 ? Math.pow(vY, 1 / 3) : (7.787 * vY) + (16 / 116)
  vZ = vZ > 0.008856 ? Math.pow(vZ, 1 / 3) : (7.787 * vZ) + (16 / 116)

  return {
    L: (116 * vY) - 16,
    a: 500 * (vX - vY),
    b: 200 * (vY - vZ),
  }
}

/**
 * HSB → CIELAB 직접 변환
 */
export function hsbToLab(h: number, s: number, b: number): LabColor {
  const rgb = hsbToRgb(h, s, b)
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b)
  return xyzToLab(xyz.x, xyz.y, xyz.z)
}

/**
 * CIEDE2000 (ΔE₀₀) 색차 계산
 */
export function ciede2000(lab1: LabColor, lab2: LabColor): number {
  const { L: L1, a: a1, b: b1 } = lab1
  const { L: L2, a: a2, b: b2 } = lab2

  const rad2deg = 180 / Math.PI
  const deg2rad = Math.PI / 180

  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const avgC = (C1 + C2) / 2

  const avgC7 = Math.pow(avgC, 7)
  const G = 0.5 * (1 - Math.sqrt(avgC7 / (avgC7 + Math.pow(25, 7))))

  const a1Prime = a1 * (1 + G)
  const a2Prime = a2 * (1 + G)

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1)
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2)
  const avgCPrime = (C1Prime + C2Prime) / 2

  let h1Prime = Math.atan2(b1, a1Prime) * rad2deg
  if (h1Prime < 0) h1Prime += 360
  let h2Prime = Math.atan2(b2, a2Prime) * rad2deg
  if (h2Prime < 0) h2Prime += 360

  let avgHPrime = (h1Prime + h2Prime) / 2
  if (Math.abs(h1Prime - h2Prime) > 180) {
    avgHPrime = (h1Prime + h2Prime + 360) / 2
  }

  const T = 1
    - 0.17 * Math.cos((avgHPrime - 30) * deg2rad)
    + 0.24 * Math.cos(2 * avgHPrime * deg2rad)
    + 0.32 * Math.cos((3 * avgHPrime + 6) * deg2rad)
    - 0.20 * Math.cos((4 * avgHPrime - 63) * deg2rad)

  let deltaHPrime = h2Prime - h1Prime
  if (Math.abs(deltaHPrime) > 180) {
    if (h2Prime <= h1Prime) deltaHPrime += 360
    else deltaHPrime -= 360
  }

  const deltaLPrime = L2 - L1
  const deltaCPrime = C2Prime - C1Prime
  const deltaHP_val = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltaHPrime / 2) * deg2rad)

  const avgLPrime = (L1 + L2) / 2
  const SL = 1 + (0.015 * Math.pow(avgLPrime - 50, 2)) / Math.sqrt(20 + Math.pow(avgLPrime - 50, 2))
  const SC = 1 + 0.045 * avgCPrime
  const SH = 1 + 0.015 * avgCPrime * T

  const deltaRo = 30 * Math.exp(-Math.pow((avgHPrime - 275) / 25, 2))
  const avgCPrime7 = Math.pow(avgCPrime, 7)
  const RC = 2 * Math.sqrt(avgCPrime7 / (avgCPrime7 + Math.pow(25, 7)))
  const RT = -Math.sin(2 * deltaRo * deg2rad) * RC

  return Math.sqrt(
    Math.pow(deltaLPrime / SL, 2) +
    Math.pow(deltaCPrime / SC, 2) +
    Math.pow(deltaHP_val / SH, 2) +
    RT * (deltaCPrime / SC) * (deltaHP_val / SH)
  )
}

/**
 * CIEDE2000 색차 → 점수 (0.00 ~ 10.00) 변환
 */
export function calculateMatchScore(deltaE: number): number {
  const rawScore = 10 * Math.exp(-0.065 * deltaE)
  return parseFloat(Math.max(0, Math.min(10, rawScore)).toFixed(2))
}

/**
 * 랜덤 게임용 색상 생성 (선명한 채도, 적절한 밝기)
 */
export function generateRandomColor(): GameColor {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(Math.random() * 35) + 55 // 55-90%
  const b = Math.floor(Math.random() * 40) + 50 // 50-90%
  const rgb = hsbToRgb(h, s, b)
  const lab = hsbToLab(h, s, b)
  return { hsb: { h, s, b }, rgb, lab }
}

/**
 * RGB를 CSS 문자열로 변환
 */
export function rgbToCss(rgb: RgbColor): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

/**
 * 점수 → 등급 변환
 */
export function scoreToTier(score: number): 'S' | 'A' | 'B' | 'C' | 'F' {
  if (score >= 28.50) return 'S'
  if (score >= 27.00) return 'A'
  if (score >= 24.00) return 'B'
  if (score >= 18.00) return 'C'
  return 'F'
}

/**
 * 등급 → 등급명 변환
 */
export function tierToLabel(tier: string): string {
  switch (tier) {
    case 'S': return 'Sensory Elite (감각의 지배자)'
    case 'A': return 'Elite Observer (초감각 인지자)'
    case 'B': return 'Accurate Observer (정밀 인지자)'
    case 'C': return 'Normal Observer (평범한 인지자)'
    default: return 'Color Obscurant (색감 훈련 요망)'
  }
}
