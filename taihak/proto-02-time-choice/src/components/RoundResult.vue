<template>
  <div class="round-result-screen" v-if="store.currentRoundResult">

    <!-- 라운드 진행 배지 -->
    <div class="round-badge">
      <span class="round-badge-label">ROUND</span>
      <span class="round-badge-num">{{ store.currentRound }}</span>
      <span class="round-badge-sep">/</span>
      <span class="round-badge-total">{{ TOTAL_ROUNDS }}</span>
      <div class="round-dots">
        <span
          v-for="n in TOTAL_ROUNDS"
          :key="n"
          class="round-dot"
          :class="{
            'dot-done':    n < store.currentRound,
            'dot-current': n === store.currentRound,
            'dot-future':  n > store.currentRound,
          }"
        />
      </div>
    </div>

    <!-- 점수 카드 -->
    <div class="score-card">
      <p class="score-card-label">이번 점수</p>
      <div class="score-card-value">
        <span class="score-num">{{ result.score.toFixed(1) }}</span>
        <span class="score-max">/ 10</span>
      </div>
      <p class="delta-label" :class="deltaClass">{{ deltaLabel }}</p>
    </div>

    <!-- 시간 비교 카드 -->
    <div class="compare-card">
      <!-- 목표 시간 행 -->
      <div class="compare-row">
        <div class="compare-row-header">
          <span class="compare-dot ghost-dot"></span>
          <span class="compare-row-label">목표</span>
          <span class="compare-row-value ghost-value">{{ (result.targetMs / 1000).toFixed(2) }}s</span>
        </div>
        <div class="compare-bar-track">
          <div
            class="compare-bar-fill ghost-fill"
            :style="{ width: targetBarWidth }"
          ></div>
        </div>
      </div>

      <!-- 내 기록 행 -->
      <div class="compare-row">
        <div class="compare-row-header">
          <span class="compare-dot player-dot"></span>
          <span class="compare-row-label">내 기록</span>
          <span class="compare-row-value player-value">{{ (result.playerMs / 1000).toFixed(2) }}s</span>
        </div>
        <div class="compare-bar-track">
          <div
            class="compare-bar-fill player-fill"
            :style="{ width: playerBarWidth }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 다음 버튼 -->
    <button class="btn-primary" @click="store.nextRound()">
      {{ isLast ? '결과 보기 →' : '다음 →' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { TOTAL_ROUNDS } from '../types/game'

const store = useGameStore()
const result = computed(() => store.currentRoundResult || { score: 0, targetMs: 0, playerMs: 0 })
const isLast = computed(() => store.currentRound >= TOTAL_ROUNDS)

// 오차 계산
const deltaMs = computed(() => result.value.playerMs - result.value.targetMs)
const deltaLabel = computed(() => {
  const ms = Math.abs(deltaMs.value)
  if (ms < 80) return '거의 완벽해요! 🎯'
  const sign = deltaMs.value > 0 ? '+' : '-'
  return `${sign}${(ms / 1000).toFixed(2)}s 차이`
})
const deltaClass = computed(() => {
  const ms = Math.abs(deltaMs.value)
  if (ms < 100) return 'delta-great'
  if (ms < 400) return 'delta-good'
  return 'delta-miss'
})

// 비교 바: 긴 쪽을 100% 기준으로 비율 계산
const maxMs = computed(() =>
  Math.max(result.value.targetMs, result.value.playerMs, 1)
)
const targetBarWidth = computed(() =>
  `${(result.value.targetMs / maxMs.value) * 100}%`
)
const playerBarWidth = computed(() =>
  `${(result.value.playerMs / maxMs.value) * 100}%`
)
</script>

<style scoped>
.round-result-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 4vh, 28px);
  padding: clamp(20px, 5vw, 32px) clamp(16px, 4vw, 24px);
  background: #000000;
}

/* ── 점수 카드 ── */
.score-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.5vh, 10px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: clamp(20px, 5vw, 28px) clamp(16px, 4vw, 24px);
  animation: fadeUp 0.4s ease both;
}

.score-card-label {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.score-card-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.score-num {
  font-size: clamp(52px, 16vw, 72px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
  background: linear-gradient(135deg, #FFFFFF 0%, #C4B5FD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-max {
  font-size: clamp(18px, 5vw, 24px);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
}

/* ── 오차 레이블 ── */
.delta-label {
  font-size: var(--fs-base);
  font-weight: 600;
  letter-spacing: -0.2px;
}
.delta-great { color: #10B981; }
.delta-good  { color: #F59E0B; }
.delta-miss  { color: rgba(255, 255, 255, 0.4); }

/* ── 시간 비교 카드 ── */
.compare-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vh, 18px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: clamp(16px, 4vw, 24px);
  animation: fadeUp 0.4s ease 0.1s both;
}

.compare-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compare-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compare-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ghost-dot {
  background: rgba(255, 120, 200, 0.8);
  box-shadow: 0 0 6px rgba(255, 120, 200, 0.5);
}

.player-dot {
  background: #00f0ff;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.6);
}

.compare-row-label {
  font-size: var(--fs-sm);
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  flex: 1;
}

.compare-row-value {
  font-size: clamp(16px, 4.5vw, 20px);
  font-weight: 700;
  letter-spacing: -0.5px;
}

.ghost-value  { color: rgba(255, 180, 220, 0.9); }
.player-value { color: #FFFFFF; }

/* 바 트랙 */
.compare-bar-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 99px;
  overflow: hidden;
}

.compare-bar-fill {
  height: 100%;
  border-radius: 99px;
  /* 마운트 시 0→실제 너비로 애니메이션 */
  transition: width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ghost-fill {
  background: linear-gradient(90deg, rgba(255, 120, 200, 0.4), rgba(255, 120, 200, 0.8));
}

.player-fill {
  background: linear-gradient(90deg, var(--primary), #00f0ff);
}

/* ── 버튼 ── */
.btn-primary {
  width: 100%;
  animation: fadeUp 0.4s ease 0.2s both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 소형 화면 ── */
@media (max-height: 600px) {
  .round-result-screen {
    justify-content: flex-start;
    gap: 10px;
    padding-top: clamp(10px, 3vh, 16px);
  }
  .score-card {
    padding: 14px 16px;
  }
  .compare-card {
    padding: 12px 16px;
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .compare-row-value {
    font-size: 15px;
  }
}
/* ── 라운드 배지 ── */
.round-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  padding: 8px 16px;
  animation: fadeUp 0.3s ease both;
}

.round-badge-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
}

.round-badge-num {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary-light);
  letter-spacing: -0.5px;
  line-height: 1;
}

.round-badge-sep {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  font-weight: 400;
}

.round-badge-total {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: -0.3px;
}

.round-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 6px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.round-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.dot-done {
  background: rgba(255, 255, 255, 0.4);
}

.dot-current {
  background: var(--primary);
  box-shadow: 0 0 8px rgba(95, 70, 255, 0.7);
  transform: scale(1.2);
}

.dot-future {
  background: rgba(255, 255, 255, 0.12);
}
</style>
