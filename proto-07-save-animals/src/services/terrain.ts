// ─────────────────────────────────────────────────────────────
// 지형(물) 데이터 조회 — OpenStreetMap Overpass API (무료, 키 불필요)
//
// 주변 반경의 실제 하천·호수(민물)와 해안선(바다) 좌표를 가져와,
// 수생 동물이 물 위에만 출현하도록 스포너에 넘겨준다.
//
// Overpass 는 공용 무료 API 라 요청이 잦으면 429/504 가 난다. 그래서
//  1) 위치 격자 단위로 localStorage 에 오래(7일) 캐시하고
//  2) 실패하면 미러 엔드포인트로 재시도하며
//  3) 그래도 실패하면 만료된 캐시라도 사용, 최후에는 육지 동물만 출현시킨다.
// ─────────────────────────────────────────────────────────────

import type { LatLng, WaterContext } from '../types'
import { loadWaterCache, saveWaterCache } from './storage'

export type { WaterContext }

export const EMPTY_WATER: WaterContext = { freshwater: [], sea: [], coastlines: [] }

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

/** 엔드포인트 하나당 최대 대기 — 넘으면 다음 미러 */
const FETCH_TIMEOUT_MS = 6000

/** 두 좌표 사이 거리 (m) — Haversine */
export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** 좌표가 너무 촘촘하면 솎아내기 (마커가 한 곳에 뭉치지 않도록) */
function thin(points: LatLng[], max: number): LatLng[] {
  if (points.length <= max) return points
  const step = points.length / max
  const out: LatLng[] = []
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * step)])
  return out
}

// ── 육지/바다 판별 ──────────────────────────────────────────
// 카카오 coord2RegionCode 는 연안 바다도 행정구역(예: 해운대구 우동)으로
// 반환해 육/해 판별에 쓸 수 없다. 대신 OSM 해안선의 방향 규칙을 쓴다:
// way 진행방향 기준 왼쪽이 육지, 오른쪽이 바다.

interface XY { x: number; y: number }

/** 위경도를 로컬 평면으로 (경도는 위도에 따라 축소) */
function toXY(p: LatLng, lat0: number): XY {
  return { x: p.lng * Math.cos((lat0 * Math.PI) / 180), y: p.lat }
}

/** 점과 선분 사이 거리(제곱) */
function distSqToSegment(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const cx = a.x + t * dx
  const cy = a.y + t * dy
  return (p.x - cx) ** 2 + (p.y - cy) ** 2
}

/**
 * 좌표가 바다인지 판별.
 * 가장 가까운 해안선 선분을 찾아, 그 선분의 어느 쪽에 있는지로 결정한다.
 * 해안선이 없으면(내륙) 항상 false.
 */
export function isSeaPoint(point: LatLng, coastlines: LatLng[][]): boolean {
  if (!coastlines?.length) return false
  const lat0 = point.lat
  const p = toXY(point, lat0)

  let best = Infinity
  let cross = 0
  for (const way of coastlines) {
    for (let i = 0; i < way.length - 1; i++) {
      const a = toXY(way[i], lat0)
      const b = toXY(way[i + 1], lat0)
      const d = distSqToSegment(p, a, b)
      if (d < best) {
        best = d
        // 외적 > 0 이면 진행방향 왼쪽(육지), < 0 이면 오른쪽(바다)
        cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
      }
    }
  }
  return cross < 0
}

/** 미터 → 로컬 XY 단위 (등거리 근사) */
const M_PER_UNIT = 111320

/**
 * 반경 안의 '바다' 좌표를 격자로 훑어 수집한다.
 * 해안선 근처(바닷가)부터 먼바다까지 골고루 나오도록 영역 전체를 샘플링한다.
 */
function seaGridPoints(
  center: LatLng,
  coastlines: LatLng[][],
  minR: number,
  maxR: number,
  stepM = 200,
): LatLng[] {
  const out: LatLng[] = []
  const cosLat = Math.cos((center.lat * Math.PI) / 180)
  const latStep = stepM / M_PER_UNIT
  const lngStep = stepM / (M_PER_UNIT * cosLat)
  const maxLatDeg = maxR / M_PER_UNIT
  const maxLngDeg = maxR / (M_PER_UNIT * cosLat)

  for (let dLat = -maxLatDeg; dLat <= maxLatDeg; dLat += latStep) {
    for (let dLng = -maxLngDeg; dLng <= maxLngDeg; dLng += lngStep) {
      const p: LatLng = { lat: center.lat + dLat, lng: center.lng + dLng }
      const d = distanceM(center, p)
      if (d < minR || d > maxR) continue
      if (isSeaPoint(p, coastlines)) out.push(p)
    }
  }
  return out
}

/** 위치 격자 키 (소수 2자리 ≈ 1km) — 같은 동네면 캐시 공유 */
function gridKey(center: LatLng): string {
  return `${center.lat.toFixed(2)}:${center.lng.toFixed(2)}`
}

const inflight = new Map<string, Promise<WaterContext>>()

/**
 * 주변 물(민물/바다) 좌표 조회. 캐시가 신선하면 네트워크를 타지 않는다.
 *
 * 실패 시 reject 한다. 빈 데이터로 대신하면 해안선을 몰라
 * 육지 동물이 바다 한가운데 배치되므로, 호출부가 실패를 알아야 한다.
 */
export function fetchWaterContext(
  center: LatLng,
  minRadiusM: number,
  maxRadiusM: number,
): Promise<WaterContext> {
  const key = gridKey(center)

  const cached = loadWaterCache(key)
  if (cached && !cached.stale) return Promise.resolve(cached.data)

  const running = inflight.get(key)
  if (running) return running

  const p = load(center, minRadiusM, maxRadiusM)
    .then((data) => {
      saveWaterCache(key, data)
      return data
    })
    .catch((e) => {
      // 만료된 캐시라도 있으면 그걸 쓰는 편이 낫다
      if (cached) {
        console.warn('[terrain] 조회 실패 — 이전 캐시 사용', e)
        return cached.data
      }
      console.warn('[terrain] 지형 조회 실패', e)
      throw e
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, p)
  return p
}

async function load(center: LatLng, minR: number, maxR: number): Promise<WaterContext> {
  const { lat, lng } = center
  const query = `[out:json][timeout:20];
(
  way(around:${maxR},${lat},${lng})["natural"="water"];
  way(around:${maxR},${lat},${lng})["waterway"~"^(river|stream|canal)$"];
  way(around:${maxR},${lat},${lng})["natural"="coastline"];
);
out geom 400;`

  let lastError: unknown = null
  for (const url of OVERPASS_ENDPOINTS) {
    // Overpass 가 느릴 때 앱이 로딩에 갇히지 않도록 클라이언트 타임아웃
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), FETCH_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: abort.signal,
      })
      if (!res.ok) throw new Error(`Overpass ${res.status}`)
      return parse(await res.json(), center, minR, maxR)
    } catch (e) {
      lastError = e // 다음 미러로 재시도
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError ?? new Error('Overpass 조회 실패')
}

function parse(data: any, center: LatLng, minR: number, maxR: number): WaterContext {
  const freshwater: LatLng[] = []
  const sea: LatLng[] = []
  const coastlines: LatLng[][] = []

  for (const el of data?.elements ?? []) {
    if (!el.geometry) continue
    const way: LatLng[] = el.geometry.map((g: any) => ({ lat: g.lat, lng: g.lon }))

    if (el.tags?.natural === 'coastline') {
      // 판별용 해안선은 순서(방향)를 유지해야 한다 — 반경으로 자르면 안 됨
      coastlines.push(thin(way, 200))
      continue
    }

    for (const p of way) {
      const d = distanceM(center, p)
      if (d < minR || d > maxR) continue // 게임 규칙상 반경 밖은 제외
      freshwater.push(p)
    }
  }

  const ways = coastlines.slice(0, 40)
  // 반경 내 바다 영역 전체(바닷가 + 먼바다)를 격자로 훑어 바다 지점 수집
  sea.push(...seaGridPoints(center, ways, minR, maxR))

  return {
    freshwater: thin(freshwater, 150),
    sea: thin(sea, 200),
    coastlines: ways,
  }
}
