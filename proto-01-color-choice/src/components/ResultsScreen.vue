<script setup lang="ts">
import { ref } from 'vue'
import type { GameColor, RoundScore } from '../types/game'
import { rgbToCss, tierToLabel } from '../utils/color'

defineProps<{
  grandScore: number
  tier: string
  targetColors: GameColor[]
  userGuesses: GameColor[]
  scores: RoundScore[]
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

function scoreClass(score: number): string {
  if (score >= 9.5) return 'score-high'
  if (score >= 8.5) return 'score-mid'
  if (score >= 7.0) return 'score-low'
  return 'score-poor'
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

function formatDelta(val: number): string {
  return val > 0 ? `+${val}` : `${val}`
}

function deltaClass(val: number): string {
  if (val === 0) return 'val-ok'
  return val > 0 ? 'val-plus' : 'val-minus'
}
</script>

<template>
  <section class="screen">
    <div class="results-container">
      <div class="score-dashboard glass-panel">
        <h2 class="dashboard-title">도전 완료!</h2>
        <div class="grand-score">{{ grandScore.toFixed(2) }}</div>
        <div class="score-max">/ 30.00 만점</div>
        <div class="rating-badge" :class="tierClass(tier)">
          {{ tierToLabel(tier) }}
        </div>
      </div>

      <h3 class="section-subtitle">라운드별 상세 결과</h3>

      <div class="rounds-list">
        <div
          v-for="(stat, idx) in scores"
          :key="idx"
          class="round-card glass-panel"
          :class="{ expanded: expandedRounds.has(idx) }"
        >
          <div class="round-main-info" @click="toggleRound(idx)">
            <div class="round-summary">
              <span class="round-num">#{{ idx + 1 }}</span>
              <div class="split-circle">
                <div class="split-left" :style="{ backgroundColor: rgbToCss(targetColors[idx].rgb) }" />
                <div class="split-right" :style="{ backgroundColor: rgbToCss(userGuesses[idx].rgb) }" />
              </div>
              <span class="round-score-val" :class="scoreClass(stat.score)">
                {{ stat.score.toFixed(2) }} / 10.0
              </span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" class="accordion-arrow"
              :style="{ transform: expandedRounds.has(idx) ? 'rotate(180deg)' : 'rotate(0deg)' }">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div v-if="expandedRounds.has(idx)" class="round-details-panel">
            <div class="detail-row">
              <span class="detail-lbl">정답 색상 (Target HSB)</span>
              <span class="detail-val">
                H:{{ targetColors[idx].hsb.h }}&deg;
                S:{{ targetColors[idx].hsb.s }}%
                B:{{ targetColors[idx].hsb.b }}%
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-lbl">나의 색상 (Your HSB)</span>
              <span class="detail-val">
                H:{{ userGuesses[idx].hsb.h }}&deg;
                S:{{ userGuesses[idx].hsb.s }}%
                B:{{ userGuesses[idx].hsb.b }}%
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-lbl">색차 분석 (CIEDE2000 &Delta;E)</span>
              <span class="detail-val">{{ stat.deltaE.toFixed(2) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-lbl">오차 세부 통계</span>
              <span class="detail-val">
                H: <span :class="deltaClass(stat.deltaH)">{{ formatDelta(stat.deltaH) }}&deg;</span> |
                S: <span :class="deltaClass(stat.deltaS)">{{ formatDelta(stat.deltaS) }}%</span> |
                B: <span :class="deltaClass(stat.deltaB)">{{ formatDelta(stat.deltaB) }}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

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
          점수 공유하기
        </button>
        <button class="btn btn-primary btn-glow" @click="$emit('restart')">
          다시 도전하기
        </button>
      </div>
    </div>
  </section>
</template>
