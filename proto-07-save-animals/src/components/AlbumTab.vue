<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { GRADE_LIST, GRADES, getSpecies } from '../config/gameConfig'
import type { RescueRecord } from '../types'
import AnimalAvatar from './AnimalAvatar.vue'

const store = useGameStore()

type Filter = { key: string; label: string }
const filters = computed<Filter[]>(() => [
  { key: 'all', label: '전체' },
  ...GRADE_LIST.map((g) => ({ key: `grade:${g.id}`, label: g.name })),
])

const active = ref('all')

const filtered = computed<RescueRecord[]>(() => {
  const records = store.rescueRecords
  if (active.value === 'all') return records
  if (active.value.startsWith('grade:')) {
    const g = Number(active.value.split(':')[1])
    return records.filter((r) => r.grade === g)
  }
  return records
})

const selected = ref<RescueRecord | null>(null)
const sheetOpen = ref(false)
function openDetail(r: RescueRecord) {
  selected.value = r
  requestAnimationFrame(() => (sheetOpen.value = true))
}
function closeDetail() {
  sheetOpen.value = false
  setTimeout(() => (selected.value = null), 260)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<template>
  <div class="album-tab">
    <header class="album-head">
      <h1 class="t-title2">구조 앨범</h1>
      <span class="album-count">총 {{ store.rescueRecords.length }}마리</span>
    </header>

    <!-- 필터 칩 -->
    <div class="chip-row">
      <button
        v-for="f in filters"
        :key="f.key"
        class="chip"
        :class="{ active: active === f.key }"
        @click="active = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- 리스트 -->
    <div v-if="filtered.length" class="album-list">
      <button
        v-for="r in filtered"
        :key="r.id"
        class="list-item album-item"
        @click="openDetail(r)"
      >
        <AnimalAvatar :species-id="r.speciesId" :grade="r.grade" :size="48" />
        <div class="list-info">
          <div class="album-title-row">
            <span class="list-title">{{ getSpecies(r.speciesId).name }}</span>
            <span class="mini-badge" :style="{ background: GRADES[r.grade].color }">
              {{ GRADES[r.grade].name }}
            </span>
          </div>
          <div class="list-sub">{{ formatDate(r.rescuedAt) }} · {{ r.locationName }}</div>
        </div>
        <span class="list-medal">+{{ r.medalReward }}</span>
      </button>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📖</div>
      <p class="empty-text">{{ active === 'all' ? '아직 구조한 동물이 없어요' : '해당 등급 기록이 없어요' }}</p>
      <p class="empty-sub" v-if="active === 'all'">지도에서 위기 동물을 구조해보세요</p>
    </div>
  </div>

  <!-- 상세 바텀시트 -->
  <div v-if="selected" class="bs-overlay" @click.self="closeDetail">
    <div class="bs-sheet" :class="{ open: sheetOpen }">
      <div class="bs-handle"></div>
      <div class="bs-header">
        <span class="bs-title">구조 기록</span>
        <button class="bs-close" @click="closeDetail">✕</button>
      </div>

      <AnimalAvatar :species-id="selected.speciesId" :grade="selected.grade" :size="80" />
      <div class="detail-name">
        <span class="t-title3">{{ getSpecies(selected.speciesId).name }}</span>
        <span class="mini-badge" :style="{ background: GRADES[selected.grade].color }">
          {{ GRADES[selected.grade].emoji }} {{ GRADES[selected.grade].name }}
        </span>
      </div>

      <div class="detail-rows">
        <div class="info-row-card">
          <span class="info-row-label">획득 메달</span>
          <span class="info-row-value">🏅 {{ selected.medalReward }}</span>
        </div>
        <div class="info-row-card">
          <span class="info-row-label">구조 일시</span>
          <span class="info-row-value">{{ formatDate(selected.rescuedAt) }}</span>
        </div>
        <div class="info-row-card">
          <span class="info-row-label">구조 지역</span>
          <span class="info-row-value">{{ selected.locationName }}</span>
        </div>
      </div>

      <button class="btn-primary" @click="closeDetail">닫기</button>
    </div>
  </div>
</template>

<style scoped>
.album-tab {
  position: absolute;
  inset: 0;
  bottom: calc(60px + env(safe-area-inset-bottom));
  overflow-y: auto;
  padding: calc(16px + env(safe-area-inset-top)) 0 20px;
}
.album-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 20px;
}
.album-count {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 600;
}
.chip-row {
  display: flex;
  gap: 8px;
  padding: 14px 20px 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.chip-row::-webkit-scrollbar {
  display: none;
}
.album-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px 0;
}
.album-item {
  width: 100%;
  border: none;
  text-align: left;
  cursor: pointer;
}
.album-item:active {
  background: var(--muted-bg);
}
.album-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mini-badge {
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.list-medal {
  font-size: 15px;
  font-weight: 800;
  color: var(--primary);
  flex-shrink: 0;
}
.detail-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
</style>
