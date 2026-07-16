<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { GRADES, getSpecies } from '../config/gameConfig'
import type { Grade, RescueRecord } from '../types'
import AnimalAvatar from './AnimalAvatar.vue'

const store = useGameStore()

interface SpeciesGroup {
  speciesId: string
  name: string
  count: number
  totalMedals: number
  maxGrade: Grade      // 대표 아바타용 — 가장 높은 등급
  records: RescueRecord[] // 최신순
}

// 종류별로 묶기 (구조 많은 순 → 이름순)
const groups = computed<SpeciesGroup[]>(() => {
  const map = new Map<string, SpeciesGroup>()
  for (const r of store.rescueRecords) {
    let g = map.get(r.speciesId)
    if (!g) {
      g = {
        speciesId: r.speciesId,
        name: getSpecies(r.speciesId).name,
        count: 0,
        totalMedals: 0,
        maxGrade: 1,
        records: [],
      }
      map.set(r.speciesId, g)
    }
    g.count += 1
    g.totalMedals += r.medalReward
    g.maxGrade = Math.max(g.maxGrade, r.grade) as Grade
    g.records.push(r)
  }
  // 각 종류의 기록은 최신순으로 정렬 (입력 순서와 무관하게 보장)
  for (const g of map.values()) {
    g.records.sort((a, b) => b.rescuedAt.localeCompare(a.rescuedAt))
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

const selectedSpecies = ref<string | null>(null)
const detail = computed<SpeciesGroup | null>(
  () => groups.value.find((g) => g.speciesId === selectedSpecies.value) ?? null,
)

function formatDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<template>
  <div class="album-tab">
    <!-- ── 종류별 컬렉션 ─────────────────────────── -->
    <template v-if="!detail">
      <header class="album-head">
        <h1 class="t-title2">구조 앨범</h1>
        <span class="album-count">{{ groups.length }}종 · 총 {{ store.rescueRecords.length }}마리</span>
      </header>

      <div v-if="groups.length" class="species-grid">
        <button
          v-for="g in groups"
          :key="g.speciesId"
          class="species-card"
          @click="selectedSpecies = g.speciesId"
        >
          <span class="species-count-badge">{{ g.count }}번</span>
          <AnimalAvatar :species-id="g.speciesId" :grade="g.maxGrade" :size="60" />
          <span class="species-name">{{ g.name }}</span>
          <span class="species-grade" :style="{ background: GRADES[g.maxGrade].color }">
            {{ GRADES[g.maxGrade].emoji }} {{ GRADES[g.maxGrade].shortName }}
          </span>
          <span class="species-medals">🏅 {{ g.totalMedals }}</span>
        </button>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📖</div>
        <p class="empty-text">아직 구조한 동물이 없어요</p>
        <p class="empty-sub">지도에서 위기 동물을 구조해보세요</p>
      </div>
    </template>

    <!-- ── 종류 상세 (구조 기록 리스트) ──────────── -->
    <template v-else>
      <header class="detail-head">
        <button class="back-btn" @click="selectedSpecies = null" aria-label="뒤로">←</button>
        <h1 class="t-title3">{{ detail.name }}</h1>
      </header>

      <div class="detail-summary card">
        <AnimalAvatar :species-id="detail.speciesId" :grade="detail.maxGrade" :size="64" />
        <div class="summary-stats">
          <div class="summary-item">
            <span class="summary-num">{{ detail.count }}</span>
            <span class="summary-label">구조 횟수</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <span class="summary-num">{{ detail.totalMedals }}</span>
            <span class="summary-label">획득 메달</span>
          </div>
        </div>
      </div>

      <p class="record-title">구조 기록</p>
      <div class="record-list">
        <div v-for="r in detail.records" :key="r.id" class="list-item record-item">
          <div class="record-grade" :style="{ background: GRADES[r.grade].color }">
            {{ GRADES[r.grade].emoji }}
          </div>
          <div class="list-info">
            <div class="record-top">
              <span class="record-grade-name">{{ GRADES[r.grade].name }}</span>
              <span class="record-medal">+{{ r.medalReward }} 메달</span>
            </div>
            <div class="list-sub">{{ formatDate(r.rescuedAt) }} · {{ r.locationName }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.album-tab {
  position: absolute;
  inset: 0;
  bottom: calc(60px + env(safe-area-inset-bottom));
  overflow-y: auto;
  padding: calc(16px + env(safe-area-inset-top)) 20px 24px;
}

/* 헤더 */
.album-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}
.album-count {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 600;
}

/* 종류별 그리드 */
.species-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.species-card {
  position: relative;
  background: var(--card-bg);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  padding: 20px 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.species-card:active {
  background: var(--muted-bg);
}
.species-count-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: var(--radius-full);
}
.species-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--text-1);
  margin-top: 2px;
}
.species-grade {
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.species-medals {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

/* 상세 헤더 */
.detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg);
  font-size: 18px;
  color: var(--text-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.back-btn:active {
  background: var(--muted-bg);
}

/* 상세 요약 카드 */
.detail-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.summary-stats {
  flex: 1;
  display: flex;
  align-items: center;
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.summary-num {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}
.summary-label {
  font-size: 12px;
  color: var(--text-2);
}
.summary-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

/* 기록 리스트 */
.record-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-2);
  margin: 0 0 10px 2px;
}
.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.record-item {
  gap: 12px;
}
.record-grade {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.record-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.record-grade-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
}
.record-medal {
  font-size: 14px;
  font-weight: 800;
  color: var(--primary);
}
</style>
