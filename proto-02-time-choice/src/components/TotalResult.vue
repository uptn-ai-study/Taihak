<template>
  <div class="total-result-screen">
    <!-- 총점 -->
    <div class="tr-header">
      <p class="tr-label">최종 점수</p>
      <div class="tr-score-wrap">
        <span class="score-display">{{ displayScore }}</span>
        <span class="score-max">/ 50</span>
      </div>
      <p class="tr-message">{{ store.scoreMessage }}</p>
    </div>

    <div class="divider" />

    <!-- 라운드별 점수 -->
    <div class="round-scores-grid">
      <div
        v-for="(r, i) in store.rounds"
        :key="i"
        class="round-score-cell"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <span class="round-score-num">R{{ i + 1 }}</span>
        <span class="round-score-val">{{ r.score.toFixed(1) }}</span>
      </div>
    </div>

    <div class="divider" />

    <!-- 액션 버튼 -->
    <div class="tr-actions">
      <button class="btn-secondary" @click="onShare">
        📤 공유
      </button>
      <button class="btn-primary" style="flex:2" @click="store.restartGame()">
        다시하기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'

const store = useGameStore()

// 점수 카운트업 애니메이션
const displayScore = ref('0.0')
onMounted(() => {
  const target = store.totalScore
  const duration = 1200
  const start = performance.now()

  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayScore.value = (eased * target).toFixed(1)
    if (progress < 1) requestAnimationFrame(step)
    else displayScore.value = target.toFixed(1)
  }

  requestAnimationFrame(step)
})

function onShare() {
  const text =
    `⏱️ TIME // SENSE CHALLENGE 결과\n` +
    `점수: ${store.totalScore.toFixed(1)} / 50\n` +
    store.rounds.map((r, i) => `R${i + 1}: ${r.score.toFixed(1)}`).join(' · ') +
    `\n${store.scoreMessage}`

  if (navigator.share) {
    navigator.share({ text })
  } else {
    navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사됐어요!'))
  }
}
</script>

<style scoped>
.total-result-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 28px 24px;
  overflow-y: auto;
}

.tr-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.tr-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.tr-score-wrap {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.tr-message {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: -0.2px;
  text-align: center;
}

.tr-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}
</style>
