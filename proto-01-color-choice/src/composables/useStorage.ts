import { ref, computed } from 'vue'
import type { GameRecord } from '../types/game'

const RECORDS_KEY = 'dialed_color_records'
const NICKNAME_KEY = 'dialed_color_nickname'

const records = ref<GameRecord[]>(loadRecords())
const nickname = ref<string>(loadNickname())

function loadRecords(): GameRecord[] {
  const data = localStorage.getItem(RECORDS_KEY)
  return data ? JSON.parse(data) : []
}

function loadNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) || ''
}

function persistRecords() {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records.value))
}

export function useStorage() {
  const hasNickname = computed(() => nickname.value.length > 0)

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

  function setNickname(name: string) {
    nickname.value = name
    localStorage.setItem(NICKNAME_KEY, name)
  }

  function saveRecord(record: GameRecord) {
    records.value.unshift(record)
    persistRecords()
  }

  function clearProfile() {
    records.value = []
    nickname.value = ''
    localStorage.removeItem(RECORDS_KEY)
    localStorage.removeItem(NICKNAME_KEY)
  }

  return {
    nickname,
    hasNickname,
    records,
    totalGames,
    bestScore,
    avgScore,
    recentRecords,
    allRecords,
    setNickname,
    saveRecord,
    clearProfile,
  }
}
