<template>
  <div class="watch-screen">
    <div class="watch-header">
      <span class="round-indicator">{{ store.currentRound }} / {{ TOTAL_ROUNDS }}</span>
      <span class="phase-tag">WATCH</span>
    </div>

    <!-- 캐린버스 래퍼: 타이틀 + 이쿨라이저 + 힌트 -->
    <div class="canvas-wrap" ref="wrapRef">
      <!-- 이쿨라이저 바로 위 타이틀 -->
      <div class="eq-info">
        <h2 class="eq-info-title">목표 시간</h2>
        <p class="eq-info-guide">파형이 끝나는 순간을 기억하세요</p>
      </div>
      <canvas ref="canvasRef" class="waveform-canvas" />
      <!-- 힘트: 이쿨라이저 아래 -->
      <p class="watch-hint" :class="{ done: isDone }">
        {{ isDone ? '기억하셨나요?' : '이 시간을 기억하세요' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { TOTAL_ROUNDS } from '../types/game'
import { createEqualizerState, updateEqualizerState, drawBarEqualizer } from '../utils/wave'

const store = useGameStore()

const wrapRef   = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDone    = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let logicalWidth = 320
let logicalHeight = 160
let 현재진행도     = 0
let animId         = 0
let 시작시각       = 0
let 마지막시각     = 0

// 24개 채널의 세그먼트 이퀄라이저 상태 생성
const eqState = createEqualizerState(24)
// 관찰 화면 고유 랜덤 시드 생성 (시간 유추 및 매칭 원천 차단)
const watchSeed = Math.random() * 1000

function 캔버스초기화() {
  const canvas = canvasRef.value
  const wrap   = wrapRef.value
  if (!canvas || !wrap) return

  const dpr  = window.devicePixelRatio || 1
  logicalWidth = wrap.clientWidth
  logicalHeight = Math.min(wrap.clientHeight, 180) // 세로는 180px로 제한

  canvas.width  = logicalWidth * dpr
  canvas.height = logicalHeight * dpr
  canvas.style.width  = `${logicalWidth}px`
  canvas.style.height = `${logicalHeight}px`

  ctx = canvas.getContext('2d')
  ctx?.scale(dpr, dpr)
}

function 렌더링루프(현재시각: number) {
  if (!ctx) return

  if (마지막시각 === 0) 마지막시각 = 현재시각
  let dtMs = 현재시각 - 마지막시각
  if (dtMs < 0) dtMs = 0
  마지막시각 = 현재시각

  // 시간에 비례한 진행도 (0 → 1)
  const 경과ms = Math.max(0, 현재시각 - 시작시각)
  현재진행도 = Math.min(경과ms / store.targetMs, 1)

  // 물리 시뮬레이션 상태 갱신 및 렌더링 (목표 시간이므로 분홍빛 Ghost 테마 적용)
  updateEqualizerState(eqState, 경과ms, dtMs, watchSeed)
  ctx.clearRect(0, 0, logicalWidth, logicalHeight)
  drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight, eqState, { isGhost: true })

  if (현재진행도 < 1) {
    animId = requestAnimationFrame(렌더링루프)
  } else {
    // 완료: 마지막 프레임 고정 후 다음 화면으로
    isDone.value = true
    setTimeout(() => store.onWatchDone(), 1000)
  }
}

onMounted(() => {
  // 브라우저가 첫 스타일과 레이아웃 계산을 마친 후에 크기를 정확히 측정하고 초기화하도록 보장하여 깜박임 방지
  requestAnimationFrame(() => {
    캔버스초기화()
    시작시각 = performance.now()
    마지막시각 = 시작시각
    animId = requestAnimationFrame(렌더링루프)
  })
})
onUnmounted(() => cancelAnimationFrame(animId))
</script>

<style scoped>
.watch-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #000000;
  padding: clamp(12px, 3vw, 16px) 0 clamp(20px, 5vw, 28px);
  overscroll-behavior: none;
}

.watch-header {
  width: 100%;
  padding: 0 clamp(16px, 4vw, 20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  flex-shrink: 0;
}

.phase-tag {
  font-size: clamp(10px, 2.5vw, 11px);
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(180, 140, 255, 0.65);
}

/* 캔버스 래퍼: 남은 공간을 모두 점유, 내부 요소를 column 렬더 */
.canvas-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 clamp(12px, 3vw, 16px);
  min-height: 0;
  gap: clamp(12px, 3vh, 20px);
}

.waveform-canvas {
  display: block;
}

/* 이쿨라이저 바로 위 타이틀+가이드 */
.eq-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: clamp(6px, 1.5vh, 10px);
  /* 상단에 그룹화하지 않고 이쿨라이저와 민접하게 */
}

.eq-info-title {
  font-size: var(--fs-2xl);
  font-weight: 800;
  letter-spacing: -1px;
  color: #FFFFFF;
  line-height: 1;
  margin: 0;
}

.eq-info-guide {
  font-size: var(--fs-sm);
  color: rgba(180, 150, 255, 0.75);
  font-weight: 500;
  letter-spacing: -0.2px;
  line-height: 1.4;
  margin: 0;
}

.watch-hint {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: -0.2px;
  text-align: center;
  transition: color 0.5s ease;
}
.watch-hint.done {
  color: rgba(180, 150, 255, 0.65);
}

/* ── 소형 화면 ── */
@media (max-height: 600px) {
  .watch-screen {
    padding-bottom: clamp(12px, 3vh, 20px);
  }
  .canvas-wrap {
    gap: 8px;
  }
  .eq-info-title {
    font-size: var(--fs-xl);
  }
}
</style>
