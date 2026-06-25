<template>
  <div class="result">
    <div class="result-card" :class="success ? 'success' : 'fail'">
      <div class="result-emoji">{{ success ? '🎉' : '💀' }}</div>
      <h2 class="result-title">{{ success ? `${stage}단계 클리어!` : '시간 초과!' }}</h2>
      <p class="result-sub">{{ success ? '모든 카드를 매칭했어요!' : '다음엔 더 빠르게 해봐요!' }}</p>

      <div v-if="success && stage >= 20" class="new-best complete">🎊 전체 클리어!</div>
      <div v-else-if="success && isNewBest" class="new-best">🏆 최고 기록 갱신!</div>
      <div v-if="success && rankPosition !== null" class="rank-notify">🥇 전체 {{ rankPosition }}위 달성!</div>
    </div>

    <div class="points-card" :class="{ show: pointsVisible }">
      <div class="points-header">
        <span class="points-title">{{ success ? '🎁 포인트 보상' : '🎮 이번 게임 획득 포인트' }}</span>
        <span v-if="success" class="points-rate">x{{ rateLabel }}%</span>
      </div>

      <div class="points-display">
        <span class="points-animated">+{{ displayedPoints.toLocaleString() }}</span>
        <span class="points-unit">P</span>
      </div>

      <div v-if="success" class="points-total-row">
        <span class="total-label">누적 포인트</span>
        <span class="total-value">{{ totalPoints.toLocaleString() }} P</span>
      </div>

      <div v-if="success" class="points-bar-wrap">
        <div class="points-bar">
          <div class="points-bar-fill" :style="{ width: barPct + '%' }"></div>
        </div>
        <div class="points-bar-labels">
          <span>{{ (stage * 50).toLocaleString() }}P</span>
          <span>{{ (stage * 100).toLocaleString() }}P</span>
        </div>
        <div class="points-indicator" :style="{ left: barPct + '%' }">
          <div class="indicator-dot"></div>
          <span class="indicator-label">{{ earnedPoints.toLocaleString() }}P</span>
        </div>
      </div>
    </div>

    <div v-if="success" class="compare-card">
      <h3 class="compare-title">내 기록 비교</h3>
      <div class="compare-row">
        <span class="compare-label">이전 최고</span>
        <span class="compare-value">{{ prevBest > 0 ? `${prevBest}단계` : '기록 없음' }}</span>
      </div>
      <div class="compare-row">
        <span class="compare-label">이번 기록</span>
        <span class="compare-value highlight">{{ stage }}단계</span>
      </div>
    </div>

    <div class="btn-group">
      <button v-if="success && stage < 20" class="btn-primary" @click="$emit('next', stage + 1)">
        {{ stage + 1 }}단계 도전하기
      </button>
      <button v-else-if="!success" class="btn-primary" @click="$emit('retry', stage)">
        다시 도전하기
      </button>
      <button class="btn-secondary" @click="$emit('home')">처음으로</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  stage: number
  success: boolean
  prevBest: number
  isNewBest: boolean
  rankPosition: number | null
  earnedPoints: number
  totalPoints: number
  rateLabel: number
}>()

defineEmits<{
  next: [stage: number]
  retry: [stage: number]
  home: []
}>()

const displayedPoints = ref(0)
const pointsVisible = ref(false)

const barPct = computed(() => {
  const min = props.stage * 50
  const max = props.stage * 100
  if (max <= min) return 0
  return Math.min(100, Math.max(0, ((props.earnedPoints - min) / (max - min)) * 100))
})

onMounted(() => {
  setTimeout(() => { pointsVisible.value = true }, 300)
  if (props.earnedPoints === 0) return
  const target = props.earnedPoints
  const duration = 1200
  const steps = 60
  const stepMs = duration / steps
  const increment = target / steps
  let current = 0
  const interval = setInterval(() => {
    current = Math.min(current + increment, target)
    displayedPoints.value = Math.floor(current)
    if (current >= target) clearInterval(interval)
  }, stepMs)
})
</script>

<style scoped>
.result {
  min-height: 100vh;
  min-height: 100dvh;
  background: #F5F5F8;
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 16px calc(32px + env(safe-area-inset-bottom, 0px));
  gap: 14px;
}

@media (min-width: 400px) {
  .result { padding-left: 20px; padding-right: 20px; }
}

.result-card {
  width: 100%;
  background: #FFFFFF; border-radius: 20px;
  padding: 28px 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  text-align: center;
}
.result-card.success { border-top: 4px solid #5F46FF; }
.result-card.fail    { border-top: 4px solid #EF4444; }
.result-emoji { font-size: 52px; }
.result-title { font-size: clamp(20px, 6vw, 26px); font-weight: 700; color: #111827; margin: 0; }
.result-sub { font-size: 14px; color: #6B7280; margin: 0; }
.new-best {
  margin-top: 4px;
  background: #5F46FF; color: #fff;
  font-size: 14px; font-weight: 700;
  padding: 8px 18px; border-radius: 9999px;
}
.new-best.complete {
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  font-size: 16px;
}
.rank-notify {
  background: #FFF7ED; color: #D97706;
  font-size: 14px; font-weight: 700;
  padding: 8px 18px; border-radius: 9999px;
  border: 1px solid #FDE68A;
}

.points-card {
  width: 100%;
  background: #FFFFFF; border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 12px;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.points-card.show { opacity: 1; transform: translateY(0); }

.points-header { display: flex; justify-content: space-between; align-items: center; }
.points-title { font-size: 15px; font-weight: 700; color: #111827; }
.points-rate {
  font-size: 12px; font-weight: 700; color: #fff;
  background: #10B981; padding: 3px 10px; border-radius: 9999px;
}

.points-display { display: flex; align-items: baseline; gap: 4px; }
.points-animated {
  font-size: clamp(32px, 10vw, 40px);
  font-weight: 700; color: #5F46FF;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}
.points-unit { font-size: 18px; font-weight: 700; color: #5F46FF; }

.points-fail-msg { font-size: 13px; color: #9CA3AF; margin: 0; text-align: center; padding: 6px 0; }

.points-total-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #F5F5F8; border-radius: 10px; padding: 10px 14px;
}
.total-label { font-size: 13px; color: #6B7280; }
.total-value { font-size: 14px; font-weight: 700; color: #111827; }

.points-bar-wrap { position: relative; padding-bottom: 28px; }
.points-bar { height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; }
.points-bar-fill {
  height: 100%; background: linear-gradient(90deg, #5F46FF, #10B981);
  border-radius: 4px;
  transition: width 1.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.points-bar-labels {
  display: flex; justify-content: space-between;
  margin-top: 4px; font-size: 11px; color: #9CA3AF;
}
.points-indicator {
  position: absolute; top: -2px;
  transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  pointer-events: none;
  transition: left 1.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.indicator-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: #5F46FF; border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(95,70,255,0.4);
}
.indicator-label {
  font-size: 11px; font-weight: 700; color: #5F46FF;
  background: #fff; border: 1px solid #E5E7EB;
  padding: 1px 6px; border-radius: 4px; white-space: nowrap;
}

.compare-card {
  width: 100%;
  background: #FFFFFF; border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 10px;
}
.compare-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0; }
.compare-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid #F3F4F6;
}
.compare-row:last-child { border-bottom: none; }
.compare-label { font-size: 14px; color: #6B7280; }
.compare-value { font-size: 15px; font-weight: 700; color: #111827; }
.compare-value.highlight { color: #5F46FF; }

.btn-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.btn-primary {
  width: 100%; height: 56px;
  background: #5F46FF; color: #FFFFFF;
  font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
.btn-primary:active { background: #4A35E0; }
.btn-secondary {
  width: 100%; height: 48px;
  background: #F2F0FF; color: #5F46FF;
  font-size: 15px; font-weight: 700;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
</style>
