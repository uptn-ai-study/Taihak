// ─────────────────────────────────────────────────────────────
// Pinia 스토어 — 게임 상태의 단일 소스
// ─────────────────────────────────────────────────────────────

import { defineStore } from 'pinia'
import type { LatLng, RescueRecord, RescueResult, SpawnedAnimal } from '../types'
import { ATTENDANCE, DAILY, GRADES } from '../config/gameConfig'
import { loadProgress, saveProgress, today, yesterday } from '../services/storage'
import { getCurrentLocation, getLocationName } from '../services/geo'
import { getSpawnWindow, spawnAnimals } from '../services/animalSpawner'

interface AttendanceInfo {
  streakDays: number
  baseMedals: number
  isSpecial: boolean   // 7일 연속 도달
}

interface State {
  progress: ReturnType<typeof loadProgress>
  location: LatLng | null
  locationMessage: string | null
  locationLoading: boolean
  spawnWindow: number
  animals: SpawnedAnimal[]
  attendance: AttendanceInfo | null   // null 이면 출석 모달 미표시
}

export const useGameStore = defineStore('game', {
  state: (): State => ({
    progress: loadProgress(),
    location: null,
    locationMessage: null,
    locationLoading: true,
    spawnWindow: getSpawnWindow(),
    animals: [],
    attendance: null,
  }),

  getters: {
    totalMedals: (s) => s.progress.totalMedals,
    streakDays: (s) => s.progress.streakDays,
    freeRemaining: (s) => Math.max(0, DAILY.freeRescues - s.progress.freeCountUsed),
    needAd(): boolean {
      return this.freeRemaining <= 0
    },
    /** 아직 처리하지 않은(지도에 남아있는) 동물 */
    visibleAnimals: (s) =>
      s.animals.filter((a) => !s.progress.handledAnimalIds.includes(a.id)),
    rescueRecords: (s) => [...s.progress.rescueRecords].reverse(), // 최신순
  },

  actions: {
    persist() {
      saveProgress(this.progress)
    },

    /** 날짜 변경 시 무료/광고 횟수 리셋 */
    rolloverDate() {
      const t = today()
      if (this.progress.currentDate !== t) {
        this.progress.currentDate = t
        this.progress.freeCountUsed = 0
        this.progress.adCountToday = 0
        this.persist()
      }
    },

    /** 출석 체크 — 오늘 첫 접속이면 streak 갱신 + 출석 모달 대상 설정 */
    checkAttendance() {
      const t = today()
      if (this.progress.lastVisitDate === t) {
        this.attendance = null // 오늘 이미 방문
        return
      }
      // 연속/리셋 판정
      if (this.progress.lastVisitDate === yesterday()) {
        this.progress.streakDays += 1
      } else {
        this.progress.streakDays = 1
      }
      this.progress.lastVisitDate = t
      this.persist()

      this.attendance = {
        streakDays: this.progress.streakDays,
        baseMedals: ATTENDANCE.baseMedals,
        isSpecial: this.progress.streakDays >= ATTENDANCE.specialStreak,
      }
    },

    /** 출석 보너스 수령 (광고 목업 시 2배) */
    claimAttendance(doubled: boolean) {
      if (!this.attendance) return
      const gain = this.attendance.baseMedals * (doubled ? ATTENDANCE.adMultiplier : 1)
      this.progress.totalMedals += gain
      this.attendance = null
      this.persist()
    },

    /** 위치 획득 후 동물 스폰 */
    async initLocation() {
      this.locationLoading = true
      const result = await getCurrentLocation()
      this.location = result.location
      this.locationMessage = result.message
      this.refreshAnimals()
      this.locationLoading = false
    },

    /** window 재계산 + 스폰. window 가 바뀌면 처리기록 초기화 */
    refreshAnimals() {
      if (!this.location) return
      const win = getSpawnWindow()
      this.spawnWindow = win
      if (this.progress.handledWindow !== win) {
        this.progress.handledWindow = win
        this.progress.handledAnimalIds = []
        this.persist()
      }
      this.animals = spawnAnimals(this.location, win)
    },

    /**
     * 구조 판정.
     * @param viaAd  광고 목업을 시청하고 구조하는 경우 true (무료 횟수 소진 시)
     */
    async rescue(animal: SpawnedAnimal, viaAd: boolean): Promise<RescueResult> {
      // 횟수 소진 처리
      if (viaAd) {
        this.progress.adCountToday += 1
      } else {
        this.progress.freeCountUsed += 1
      }

      // 처리 완료 표시 (성공/실패 무관 — 재시도 불가)
      if (!this.progress.handledAnimalIds.includes(animal.id)) {
        this.progress.handledAnimalIds.push(animal.id)
      }

      const grade = GRADES[animal.grade]
      const success = Math.random() < grade.successRate

      let record: RescueRecord | null = null
      if (success) {
        const locationName = await getLocationName({ lat: animal.lat, lng: animal.lng })
        record = {
          id: `${animal.id}-${Date.now()}`,
          speciesId: animal.speciesId,
          grade: animal.grade,
          medalReward: grade.medalReward,
          rescuedAt: new Date().toISOString(),
          locationName,
          lat: animal.lat,
          lng: animal.lng,
        }
        this.progress.totalMedals += grade.medalReward
        this.progress.rescueRecords.push(record)
      }

      this.persist()
      return { success, medalReward: success ? grade.medalReward : 0, record }
    },

    /** 메달샵 교환 (UI 목업) */
    redeem(cost: number): boolean {
      if (this.progress.totalMedals < cost) return false
      this.progress.totalMedals -= cost
      this.persist()
      return true
    },
  },
})
