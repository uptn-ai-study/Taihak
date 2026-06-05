<script setup lang="ts">
import { ref } from 'vue'
import type { RoundResult } from '../types/game'
import { rgbToCss, tierToLabel } from '../utils/color'
import { TOTAL_ROUNDS } from '../composables/useGameState'

defineProps<{
  cumulativeScore: number
  tier: string
  roundsCleared: number
  eliminated: boolean
  allRoundResults: RoundResult[]
}>()

defineEmits<{
  restart: []
  share: []
}>()

const expandedRounds = ref<Set<number>>(new Set())

function toggleRound(index: number) {
  if (expandedRounds.value.has(index)) {
    expandedRounds.value.delete(index)
  } else {
    expandedRounds.value.add(index)
  }
}

function tierClass(tier: string): string {
  switch (tier) {
    case 'S': return 'tier-s'
    case 'A': return 'tier-a'
    case 'B': return 'tier-b'
    case 'C': return 'tier-c'
    default: return ''
  }
}
</script>

<template>
  <section class="screen">
    <div class="results-container">
      <!-- 스코어 대시보드 -->
      <div class="score-dashboard glass-panel">
        <h2 class="dashboard-title">
          {{ eliminated ? '도전 종료' : '완주 성공!' }}
        </h2>
        <div class="grand-score">{{ cumulativeScore.toFixed(2) }}</div>
        <div class="score-max">/ {{ TOTAL_ROUNDS * 30 }}.00 만점</div>
        <div class="rounds-info">
          <span class="rounds-badge" :class="eliminated ? 'badge-eliminated' : 'badge-cleared'">
            {{ eliminated ? `${roundsCleared}라운드 탈락` : `${TOTAL_ROUNDS}라운드 완주` }}
          </span>
        </div>
        <div class="rating-badge" :class="tierClass(tier)">
          {{ tierToLabel(tier) }}
        </div>
      </div>

      <!-- 라운드별 결과 -->
      <h3 class="section-subtitle">라운드별 결과</h3>
      <div class="rounds-list">
        <div
          v-for="(result, idx) in allRoundResults"
          :key="idx"
          class="round-card glass-panel"
          :class="{ expanded: expandedRounds.has(idx) }"
        >
          <div class="round-main-info" @click="toggleRound(idx)">
            <div class="round-summary">
              <span class="round-num">R{{ result.round }}</span>
              <span class="round-status-icon">{{ result.passed ? '✅' : '❌' }}</span>
              <span class="round-score-val" :class="result.passed ? 'score-mid' : 'score-poor'">
                {{ result.totalScore.toFixed(2) }} / 30.0
              </span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" class="accordion-arrow"
              :style="{ transform: expandedRounds.has(idx) ? 'rotate(180deg)' : 'rotate(0deg)' }">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div v-if="expandedRounds.has(idx)" class="round-details-panel">
            <div v-for="(score, ci) in result.colorScores" :key="ci" class="detail-color-row">
              <div class="detail-color-tiles">
                <div class="detail-mini-tile" :style="{ backgroundColor: rgbToCss(result.targetColors[ci].rgb) }" />
                <span class="detail-arrow">→</span>
                <div class="detail-mini-tile" :style="{ backgroundColor: rgbToCss(result.userGuesses[ci].rgb) }" />
              </div>
              <div class="detail-color-info">
                <span class="detail-val">{{ score.score.toFixed(2) }}점</span>
                <span class="detail-delta">ΔE {{ score.deltaE.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼들 -->
      <div class="results-actions">
        <button class="btn btn-secondary" @click="$emit('share')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유하기
        </button>
        <button class="btn btn-primary btn-glow" @click="$emit('restart')">
          다시 도전하기
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rounds-info { margin: 12px 0 10px; }

.rounds-badge {
  display: inline-block;
  padding: 5px 14px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  border-radius: 20px;
}

.badge-cleared {
  background: rgba(0, 230, 118, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(0, 230, 118, 0.3);
}

.badge-eliminated {
  background: rgba(255, 82, 82, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(255, 82, 82, 0.3);
}

.round-status-icon { font-size: 0.9rem; }

.detail-color-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.detail-color-row:last-child { border-bottom: none; }

.detail-color-tiles {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-mini-tile {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-arrow { color: var(--text-muted); font-size: 0.7rem; }

.detail-color-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-val {
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  font-size: 0.85rem;
  color: var(--text-main);
}

.detail-delta {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: 'Share Tech Mono', monospace;
}
</style>
