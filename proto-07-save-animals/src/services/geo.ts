// ─────────────────────────────────────────────────────────────
// 위치 관련 유틸 — 현재 위치 획득 + 간단한 지역명 표기
// ─────────────────────────────────────────────────────────────

import type { LatLng } from '../types'
import { DEFAULT_LOCATION } from '../config/gameConfig'

export interface LocationResult {
  location: LatLng
  isDefault: boolean   // 기본값(서울 시청)으로 폴백했는지
  message: string | null
}

/** 브라우저 Geolocation 으로 현재 위치 획득. 실패 시 기본값(서울 시청) */
export function getCurrentLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({
        location: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
        isDefault: true,
        message: '위치 기능을 지원하지 않아 서울 시청 기준으로 표시해요.',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          isDefault: false,
          message: null,
        })
      },
      () => {
        resolve({
          location: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
          isDefault: true,
          message: '위치 권한이 없어 서울 시청 기준으로 표시해요.',
        })
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}

/** 좌표 기반 간단 지역명. Nominatim(무료) 성공 시 동네명, 실패 시 좌표 부근 표기 */
export async function getLocationName(coord: LatLng): Promise<string> {
  const fallback = `${coord.lat.toFixed(3)}, ${coord.lng.toFixed(3)} 부근`
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${coord.lat}&lon=${coord.lng}&zoom=16&accept-language=ko`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return fallback
    const data = await res.json()
    const a = data.address ?? {}
    const name =
      a.neighbourhood || a.suburb || a.quarter || a.city_district || a.town || a.village || a.city
    return name ? `${name} 부근` : fallback
  } catch {
    return fallback
  }
}
