// ─────────────────────────────────────────────────────────────
// 데이터 모델 (나중에 Supabase 테이블로 그대로 이식 가능하도록 설계)
// ─────────────────────────────────────────────────────────────

export type Grade = 1 | 2 | 3

/** 동물 종류 정의 (마스터 데이터) */
export interface AnimalSpecies {
  id: string
  name: string          // 예: '길고양이', '유기견'
  imageSlot: string     // 이미지 경로 (초기엔 placeholder)
  emoji: string         // 이미지 로드 실패 시 폴백용 임시 그래픽
  defaultGrade?: Grade  // 참고용
}

/** 지도에 스폰된 동물 인스턴스 */
export interface SpawnedAnimal {
  id: string
  speciesId: string
  grade: Grade
  lat: number
  lng: number
  spawnWindow: number   // 30분 시드값
}

/** 구조 기록 (앨범) */
export interface RescueRecord {
  id: string
  speciesId: string
  grade: Grade
  medalReward: number
  rescuedAt: string     // ISO datetime
  locationName: string  // 구조 지역
  lat: number
  lng: number
}

/** 사용자 진행 상황 (localStorage) */
export interface UserProgress {
  totalMedals: number
  streakDays: number
  lastVisitDate: string   // YYYY-MM-DD
  freeCountUsed: number
  adCountToday: number
  currentDate: string     // YYYY-MM-DD
  rescueRecords: RescueRecord[]
  /** 현재 spawnWindow에서 이미 처리(구조 시도)한 동물 id들 — 재시도 방지 */
  handledWindow: number
  handledAnimalIds: string[]
}

/** 위치 좌표 */
export interface LatLng {
  lat: number
  lng: number
}

/** 구조 판정 결과 */
export interface RescueResult {
  success: boolean
  medalReward: number
  record: RescueRecord | null
}
