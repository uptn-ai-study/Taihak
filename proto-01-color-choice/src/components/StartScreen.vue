<script setup lang="ts">
import { TOTAL_ROUNDS, COLORS_PER_ROUND, PASS_THRESHOLD, ROUND_MAX } from '../composables/useGameState'
import { useStorage } from '../composables/useStorage'
import DailyRanking from './DailyRanking.vue'

defineEmits<{ start: [] }>()

const { recentRecords } = useStorage()
</script>

<template>
  <section class="screen">
    <div class="intro-container">
      <h1 class="main-title">
        당신의 색감 인지력을<br>
        <span class="highlight">측정해 보세요</span>
      </h1>
      <p class="subtitle">
        매 라운드 {{ COLORS_PER_ROUND }}개의 색상을 기억하고 HSB 슬라이더로 재현하세요.<br>
        라운드 점수 {{ PASS_THRESHOLD }}점 이상이면 통과, 미달 시 탈락!<br>
        최대 {{ TOTAL_ROUNDS }}라운드까지 도전할 수 있습니다.
      </p>

      <!-- 게임 규칙 카드 -->
      <div class="config-card glass-panel">
        <h3 class="card-title">게임 규칙</h3>
        <div class="rules-list">
          <div class="rule-item">
            <span class="rule-icon">🎯</span>
            <span class="rule-text">라운드당 {{ COLORS_PER_ROUND }}색상 암기 → 복원 (색상당 5초)</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">✅</span>
            <span class="rule-text">라운드 {{ PASS_THRESHOLD }}점 이상 → 다음 라운드 진행 (만점 {{ ROUND_MAX }}점)</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">❌</span>
            <span class="rule-text">{{ PASS_THRESHOLD }}점 미달 → 탈락</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">🏆</span>
            <span class="rule-text">{{ TOTAL_ROUNDS }}라운드 완주 시 최대 {{ TOTAL_ROUNDS * ROUND_MAX }}점</span>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-glow" @click="$emit('start')">
        도전 시작하기
      </button>

      <div v-if="recentRecords.length > 0" class="recent-records glass-panel">
        <h4 class="records-title">최근 기록</h4>
        <div class="records-list">
          <div v-for="(rec, i) in recentRecords" :key="i" class="record-row">
            <span class="record-date">{{ rec.date }}</span>
            <span class="record-diff">{{ rec.roundsCleared }}/{{ rec.totalRounds }}R</span>
            <span class="record-score">{{ rec.score.toFixed(2) }}점 ({{ rec.tier }})</span>
          </div>
        </div>
      </div>

      <DailyRanking />
    </div>
  </section>
</template>

<style scoped>
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.rule-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.rule-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

@media (max-width: 480px) {
  .rule-text { font-size: 0.8rem; }
  .rule-icon { font-size: 1rem; }
}
</style>
