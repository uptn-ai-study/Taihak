import { ref, computed } from 'vue'
import type { GameRecord } from '../types/game'

const STORAGE_KEY = 'dialed_color_records'

const records = ref<GameRecord[]>(loadRecords())

function loadRecords(): GameRecord[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
}

export function useStorage() {
  const totalGames = computed(() => records.value.length)

  const bestScore = computed(() => {
    if (records.value.length === 0) return 0
    return Math.max(...records.value.map(r => r.score))
  })

  const avgScore = computed(() => {
    if (records.value.length === 0) return 0
    return records.value.reduce((sum, r) => sum + r.score, 0) / records.value.length
  })

  const recentRecords = computed(() => records.value.slice(0, 3))
  const allRecords = computed(() => records.value.slice(0, 10))

  function saveRecord(record: GameRecord) {
    records.value.unshift(record)
    persist()
  }

  function clearRecords() {
    records.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    records,
    totalGames,
    bestScore,
    avgScore,
    recentRecords,
    allRecords,
    saveRecord,
    clearRecords,
  }
}
