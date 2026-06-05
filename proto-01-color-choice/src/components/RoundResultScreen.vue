<script setup lang="ts">
import type { GameColor, ColorScore } from '../types/game'
import { rgbToCss } from '../utils/color'
import { PASS_THRESHOLD, TOTAL_ROUNDS, ROUND_MAX } from '../composables/useGameState'

const props = defineProps<{
  currentRound: number
  roundColors: GameColor[]
  roundGuesses: GameColor[]
  roundColorScores: ColorScore[]
  roundScore: number
  passed: boolean
  eliminated: boolean
  cumulativeScore: number
}>()

defineEmits<{ proceed: [] }>()

const isLastRound = props.currentRound >= TOTAL_ROUNDS - 1

function buttonText(): string {
  if (!props.passed) return '최종 결과 확인'
  if (isLastRound) return '최종 결과 확인'
  return `라운드 ${props.currentRound + 2} 도전하기`
}
</script>

<template>
  <section class="screen">
    <div class="round-result-container">
      <!-- 통과/탈락 배너 -->
      <div class="result-banner" :class="passed ? 'banner-pass' : 'banner-fail'">
        <div class="banner-icon">{{ passed ? '✅' : '❌' }}</div>
        <div class="banner-text">
          <span class="banner-title">라운드 {{ currentRound + 1 }} {{ passed ? '통과!' : '탈락' }}</span>
          <span class="banner-score">
            {{ roundScore.toFixed(2) }} / {{ ROUND_MAX }}.00
            <span class="banner-threshold">(기준: {{ PASS_THRESHOLD }}점)</span>
          </span>
        </div>
      </div>

      <!-- 색상별 비교 -->
      <div class="color-compare-list">
        <div v-for="(score, idx) in roundColorScores" :key="idx" class="color-compare-row">
          <span class="cc-label">#{{ idx + 1 }}</span>
          <div class="cc-tiles">
            <div class="cc-tile" :style="{ backgroundColor: rgbToCss(roundColors[idx].rgb) }" />
            <span class="cc-arrow">→</span>
            <div class="cc-tile" :style="{ backgroundColor: rgbToCss(roundGuesses[idx].rgb) }" />
          </div>
          <span class="cc-score" :class="score.score >= 2.5 ? 'score-good' : 'score-bad'">
            {{ score.score.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- 누적 점수 -->
      <div class="cumulative-info glass-panel">
        <div class="cumul-row">
          <span class="cumul-label">누적 점수</span>
          <span class="cumul-value">{{ cumulativeScore.toFixed(2) }}</span>
        </div>
        <div class="cumul-row">
          <span class="cumul-label">진행 라운드</span>
          <span class="cumul-value">{{ currentRound + 1 }} / {{ TOTAL_ROUNDS }}</span>
        </div>
      </div>

      <button class="btn btn-primary btn-glow" @click="$emit('proceed')">
        {{ buttonText() }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.round-result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.result-banner {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.banner-pass {
  background: rgba(0, 230, 118, 0.08);
  border: 1px solid rgba(0, 230, 118, 0.25);
}

.banner-fail {
  background: rgba(255, 82, 82, 0.08);
  border: 1px solid rgba(255, 82, 82, 0.25);
}

.banner-icon { font-size: 2rem; flex-shrink: 0; }
.banner-text { display: flex; flex-direction: column; gap: 4px; }
.banner-title { font-size: 1.15rem; font-weight: 800; color: var(--text-main); }
.banner-score {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.banner-threshold { font-size: 0.75rem; color: var(--text-muted); }

/* 색상 비교 */
.color-compare-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-compare-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.cc-label {
  font-weight: 800;
  font-size: 0.8rem;
  color: var(--text-muted);
  width: 24px;
  flex-shrink: 0;
}

.cc-tiles {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cc-tile {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cc-arrow { color: var(--text-muted); font-size: 0.8rem; }

.cc-score {
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  font-size: 0.9rem;
  width: 50px;
  text-align: right;
  flex-shrink: 0;
}

.score-good { color: var(--color-accent); }
.score-bad { color: var(--color-danger); }

/* 누적 정보 */
.cumulative-info {
  width: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cumul-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cumul-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.cumul-value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  font-weight: bold;
  color: var(--text-main);
}

@media (max-width: 480px) {
  .result-banner { padding: 16px; gap: 10px; }
  .banner-icon { font-size: 1.6rem; }
  .banner-title { font-size: 1rem; }
  .cc-tile { width: 30px; height: 30px; }
  .cc-score { font-size: 0.8rem; }
}

@media (max-width: 360px) {
  .result-banner { padding: 12px; }
  .banner-title { font-size: 0.9rem; }
  .cc-tile { width: 26px; height: 26px; }
}
</style>
