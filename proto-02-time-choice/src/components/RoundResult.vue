<template>
  <div class="round-result-screen" v-if="store.currentRoundResult">
    <span class="round-indicator">{{ store.currentRound }} / {{ TOTAL_ROUNDS }}</span>

    <!-- 병렬 파동 비교 캔버스 -->
    <div class="canvas-wrap" ref="wrapRef">
      <canvas ref="canvasRef" class="spiral-canvas" />
      <!-- 점수 오버레이 -->
      <div class="score-overlay">
        <span class="score-num">{{ result.score.toFixed(1) }}</span>
        <span class="score-max">/ 10</span>
      </div>
    </div>

    <!-- 시간 비교 정보 -->
    <div class="time-compare">
      <div class="time-row ghost">
        <span class="time-dot" />
        <span class="time-label">목표</span>
        <span class="time-value">{{ (result.targetMs / 1000).toFixed(2) }}s</span>
      </div>
      <div class="time-row player">
        <span class="time-dot" />
        <span class="time-label">내 기록</span>
        <span class="time-value">{{ (result.playerMs / 1000).toFixed(2) }}s</span>
      </div>
    </div>

    <!-- 오차 메시지 -->
    <p class="delta-label" :class="deltaClass">{{ deltaLabel }}</p>

    <!-- 다음 버튼 -->
    <button class="btn-primary" @click="store.nextRound()">
      {{ isLast ? '결과 보기 →' : '다음 →' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { TOTAL_ROUNDS } from '../types/game'
import { createEqualizerState, updateEqualizerState, drawBarEqualizer } from '../utils/wave'

const store = useGameStore()
// result가 null일 경우 템플릿의 프로퍼티 접근 크래시를 예방하기 위한 디폴트 객체 폴백 적용
const result = computed(() => store.currentRoundResult || { score: 0, targetMs: 0, playerMs: 0 })
const isLast = computed(() => store.currentRound >= TOTAL_ROUNDS)

const wrapRef   = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let logicalWidth = 320
let logicalHeight = 160
let animId = 0
let 시작시각 = 0
let 마지막시각 = 0

// 상단(목표) 및 하단(플레이어) 세그먼트 이퀄라이저 상태
const targetEqState = createEqualizerState(24)
const playerEqState = createEqualizerState(24)

// 결과 화면 고정 시드값 (움직임 결이 일정하도록 상수로 제어)
const targetSeed = 111
const playerSeed = 888

// 두 시간 중 더 긴 쪽을 기준으로 하되, 최소 4초(4000ms) 가이드로 횡단 기준선 확보
const maxMs = computed(() => {
  return Math.max(result.value.targetMs, result.value.playerMs, 4000)
})

const targetProgress = computed(() => result.value.targetMs / maxMs.value)
const playerProgress = computed(() => result.value.playerMs / maxMs.value)

// 오차 레이블
const deltaMs = computed(() => {
  return result.value.playerMs - result.value.targetMs
})
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

function 캔버스초기화() {
  const canvas = canvasRef.value
  const wrap   = wrapRef.value
  if (!canvas || !wrap) return

  const dpr  = window.devicePixelRatio || 1
  logicalWidth = wrap.clientWidth
  logicalHeight = Math.min(wrap.clientHeight, 180) // 세로 높이 180px 제한

  canvas.width  = logicalWidth * dpr
  canvas.height = logicalHeight * dpr
  canvas.style.width  = logicalWidth + 'px'
  canvas.style.height = logicalHeight + 'px'

  ctx = canvas.getContext('2d')
  ctx?.scale(dpr, dpr)
}

function 렌더링루프(현재시각: number) {
  if (!ctx) return

  if (시작시각 === 0) 시작시각 = 현재시각
  if (마지막시각 === 0) 마지막시각 = 현재시각
  const dtMs = 현재시각 - 마지막시각
  마지막시각 = 현재시각

  const 경과ms = 현재시각 - 시작시각

  // 물리 시뮬레이션 상태 업데이트
  updateEqualizerState(targetEqState, 경과ms, dtMs, targetSeed)
  updateEqualizerState(playerEqState, 경과ms, dtMs, playerSeed)

  ctx.clearRect(0, 0, logicalWidth, logicalHeight)

  // 상단 채널: 목표 시간 (자홍색/분홍색 Ghost 세그먼트, targetProgress 비례 렌더링)
  drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight * 0.46, targetEqState, {
    isGhost: true,
    progressLimit: targetProgress.value
  })

  // 하단 채널: 플레이어 기록 (청록색/보라색 active 세그먼트, playerProgress 비례 렌더링)
  drawBarEqualizer(ctx, 0, logicalHeight * 0.54, logicalWidth, logicalHeight * 0.46, playerEqState, {
    isGhost: false,
    progressLimit: playerProgress.value
  })

  // ── 두 이퀄라이저 사이의 아주 희미한 경계선 ──
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, logicalHeight * 0.5)
  ctx.lineTo(logicalWidth, logicalHeight * 0.5)
  ctx.stroke()
  ctx.restore()

  animId = requestAnimationFrame(렌더링루프)
}

// 캔버스 엘리먼트 로드 및 데이터 로드 시점 감시
watch(
  [() => store.currentRoundResult, canvasRef],
  ([res, canvas]) => {
    if (res && canvas) {
      nextTick(() => {
        캔버스초기화()
        cancelAnimationFrame(animId)
        시작시각 = 0
        마지막시각 = 0
        animId = requestAnimationFrame(렌더링루프)
      })
    }
  },
  { immediate: true }
)

onMounted(() => {
  nextTick(() => {
    캔버스초기화()
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<style scoped>
.round-result-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px 20px;
  background: #000000;
}

/* ── 캔버스 ── */
.canvas-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.spiral-canvas {
  display: block;
}

/* 점수를 오른쪽 상단에 오버레이 */
.score-overlay {
  position: absolute;
  top: -12px;
  right: 16px;
  display: flex;
  align-items: baseline;
  gap: 4px;
  pointer-events: none;
}

.score-num {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1;
  background: linear-gradient(135deg, #FFFFFF 0%, #C4B5FD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-max {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
}

/* ── 시간 비교 ── */
.time-compare {
  display: flex;
  gap: 24px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.time-row.ghost .time-dot {
  background: rgba(255, 120, 200, 0.65);
}

.time-row.player .time-dot {
  background: #00f0ff;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
}

.time-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

.time-value {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #FFFFFF;
}

.time-row.ghost .time-value {
  color: rgba(255, 180, 220, 0.85);
  font-size: 16px;
}

/* ── 오차 ── */
.delta-label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.2px;
}
.delta-great { color: #10B981; }
.delta-good  { color: #F59E0B; }
.delta-miss  { color: rgba(255, 255, 255, 0.4); }

/* ── 버튼 ── */
.btn-primary {
  width: 100%;
  margin-top: 4px;
}
</style>
