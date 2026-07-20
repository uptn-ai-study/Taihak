// ─────────────────────────────────────────────────────────────
// 데이터 모델 (나중에 Supabase 테이블로 그대로 이식 가능하도록 설계)
// ─────────────────────────────────────────────────────────────

/** 1=일반, 2=멸종위기 II급, 3=멸종위기 I급 (환경부 지정 기준) */
export type Grade = 1 | 2 | 3

/** 분류군 */
export type Taxon = '포유류' | '조류' | '양서·파충류'

/** 보호 등급 상태 */
export type ConservationStatus = 'common' | 'endangered2' | 'endangered1'

/** 서식지 — 출현 위치를 결정 (바다 / 강·호수 / 육지) */
export type Habitat = 'sea' | 'freshwater' | 'land'

/** 동물 종류 정의 (마스터 데이터) */
export interface AnimalSpecies {
  id: string
  name: string          // 예: '길고양이', '수달'
  imageSlot: string     // 이미지 경로 (초기엔 placeholder)
  emoji: string         // 이미지 로드 실패 시 폴백용 임시 그래픽
  grade: Grade          // 멸종위기 등급과 연동 — 출현율·구조 난이도 결정
  taxon: Taxon
  status: ConservationStatus
  habitat: Habitat      // 이 서식지에 해당하는 좌표에만 출현
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

/** 주변 물 좌표 — 서식지별 동물 배치에 사용 */
export interface WaterContext {
  freshwater: LatLng[]    // 강·호수 위의 좌표
  sea: LatLng[]           // 바다(해안선) 좌표 — 바다 동물 배치용
  /**
   * 해안선 (방향이 있는 선). OSM 규칙상 way 진행방향 기준 왼쪽=육지, 오른쪽=바다.
   * 어떤 좌표가 바다인지 판별하는 데 사용.
   */
  coastlines: LatLng[][]
}

/** 구조 판정 결과 */
export interface RescueResult {
  success: boolean
  medalReward: number
  record: RescueRecord | null
}
