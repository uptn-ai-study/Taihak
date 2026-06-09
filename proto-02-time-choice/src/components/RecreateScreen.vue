<template>
  <!-- 화면 전체가 터치/클릭 영역 -->
  <div
    class="recreate-screen"
    @pointerdown.prevent="누름시작"
  >
    <div class="recreate-header">
      <span class="round-indicator">{{ store.currentRound }} / {{ TOTAL_ROUNDS }}</span>
      <span class="phase-tag">RECREATE</span>
    </div>

    <div class="canvas-wrap" ref="wrapRef">
      <!-- 이쿨라이저 바로 위 타이틀 -->
      <div class="eq-info">
        <h2 class="eq-info-title">내 기록</h2>
        <p class="eq-info-guide">누르면 시작 — 눥 때 시간이 저장돼요</p>
      </div>

      <canvas ref="canvasRef" class="waveform-canvas" />

      <!-- 중앙 안내 오버레이 (누르기 전에만 표시) -->
      <Transition name="fade">
        <div class="center-guide" v-if="!isPressing && !isSubmitted">
          <div class="guide-ring" />
          <span class="guide-text">누르세요</span>
        </div>
      </Transition>

      <!-- 힙트: 이쿨라이저 아래 -->
      <p class="recreate-hint">
        <template v-if="!isPressing && !isSubmitted">
          버튼을 누르면 타이머가 시작돼요
        </template>
        <template v-else-if="isPressing">
          목표 시간이 됨다고 생각하면 손을 때세요
        </template>
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

const wrapRef     = ref<HTMLDivElement | null>(null)
const canvasRef   = ref<HTMLCanvasElement | null>(null)
const isPressing  = ref(false)
const isSubmitted = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let logicalWidth = 320
let logicalHeight = 160
let animId      = 0
let pressStart  = 0
let 마지막시각     = 0

// 24개 채널의 세그먼트 이퀄라이저 상태 생성
const eqState = createEqualizerState(24)
// 재현 화면 고유 랜덤 시드 생성 (관찰 화면과 다른 시드로 형태 일치 방지)
const recreateSeed = Math.random() * 1000 + 5000

function 캔버스초기화() {
  const canvas = canvasRef.value
  const wrap   = wrapRef.value
  if (!canvas || !wrap) return

  const dpr  = window.devicePixelRatio || 1
  logicalWidth = wrap.clientWidth
  logicalHeight = Math.min(wrap.clientHeight, 180)

  canvas.width  = logicalWidth * dpr
  canvas.height = logicalHeight * dpr
  canvas.style.width  = `${logicalWidth}px`
  canvas.style.height = `${logicalHeight}px`

  ctx = canvas.getContext('2d')
  ctx?.scale(dpr, dpr)

  // 초기 상태 그리기 (가이드라인 및 빈 LED 격자망 표시)
  if (ctx) {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight)
    drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight, eqState, { isGhost: false })
  }
}

function 렌더링루프(현재시각: number) {
  if (!ctx) return

  if (isPressing.value && !isSubmitted.value) {
    if (마지막시각 === 0) 마지막시각 = 현재시각
    let dtMs = 현재시각 - 마지막시각
    if (dtMs < 0) dtMs = 0
    마지막시각 = 현재시각

    const 경과ms = Math.max(0, 현재시각 - pressStart)
    // 누르고 있는 동안: 물리 모션 업데이트 및 실시간 렌더링 (플레이어 테마)
    updateEqualizerState(eqState, 경과ms, dtMs, recreateSeed)
    ctx.clearRect(0, 0, logicalWidth, logicalHeight)
    drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight, eqState, { isGhost: false })
  } else if (!isSubmitted.value) {
    // 누르기 전: 움직이지 않는 기본 빈 격자 유지
    ctx.clearRect(0, 0, logicalWidth, logicalHeight)
    drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight, eqState, { isGhost: false })
  }

  animId = requestAnimationFrame(렌더링루프)
}

function 누름시작(e: PointerEvent) {
  if (isSubmitted.value || isPressing.value) return
  
  // 포인터 캡처링 설정 (전체 윈도우에서의 이탈 방어)
  // e.target이 아닌 리스너가 걸린 컨테이너(e.currentTarget)를 대상으로 캡처를 수행하여,
  // 터치 시작 시 사라지는 내부 가이드 노드 제거 시 발생할 수 있는 캡처 끊김 및 렌더링 튐 방지
  try {
    const target = e.currentTarget as HTMLElement
    if (target && typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(e.pointerId)
    }
  } catch (err) {
    console.warn('Pointer capture not supported:', err)
  }

  isPressing.value = true
  pressStart = performance.now()
  마지막시각 = pressStart

  // 윈도우 전역에 해제 리스너를 동적 부착하여, 화면 밖에서 떼더라도 100% 감지
  window.addEventListener('pointerup', 전역누름종료)
  window.addEventListener('pointercancel', 전역누름종료)
}

function 전역누름종료() {
  // 중복 실행 및 무효 상태 방어
  if (!isPressing.value || isSubmitted.value) return

  // 윈도우 리스너 해제
  window.removeEventListener('pointerup', 전역누름종료)
  window.removeEventListener('pointercancel', 전역누름종료)

  try {
    cancelAnimationFrame(animId)
  } catch (e) {
    console.error('cancelAnimationFrame error:', e)
  }

  isPressing.value  = false
  isSubmitted.value = true

  const playerMs = performance.now() - pressStart

  // 최종 프레임 고정 그리기 (마지막 시간 시뮬레이션 고정)
  try {
    if (ctx) {
      const dt = 16.67; // 평균 프레임 델타
      updateEqualizerState(eqState, playerMs, dt, recreateSeed)
      ctx.clearRect(0, 0, logicalWidth, logicalHeight)
      drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight, eqState, { isGhost: false })
    }
  } catch (e) {
    console.error('drawBarEqualizer error on release:', e)
  }

  // 게임 스토어 제출 및 화면 전환 실행 (에러 발생 시에도 중단 방지)
  try {
    store.submitRecreatation(playerMs)
  } catch (e) {
    console.error('submitRecreatation error:', e)
  }
}

onMounted(() => {
  // 브라우저가 첫 스타일과 레이아웃 계산을 마친 후에 크기를 정확히 측정하고 초기화하도록 보장하여 깜박임 방지
  requestAnimationFrame(() => {
    캔버스초기화()
    animId = requestAnimationFrame(렌더링루프)
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('pointerup', 전역누름종료)
  window.removeEventListener('pointercancel', 전역누름종료)
})
</script>

<style scoped>
.recreate-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #000000;
  padding: clamp(12px, 3vw, 16px) 0 clamp(20px, 5vw, 28px);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  overscroll-behavior: none;
}

.recreate-header {
  width: 100%;
  padding: 0 clamp(16px, 4vw, 20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.phase-tag {
  font-size: clamp(10px, 2.5vw, 11px);
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.3);
}

.canvas-wrap {
  flex: 1;
  width: 100%;
  position: relative;
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

/* 하단 가이드: 캔버스 영역 하단 25% 지점에 고정 */
.center-guide {
  position: absolute;
  /* 이쿨라이저는 캔버스 중앙 부근에 그려지므로,
     가이드는 캔버스 wrap의 아래슪에 위치시켰 */
  bottom: clamp(16px, 6%, 32px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 3vw, 14px);
  pointer-events: none;
}

.guide-ring {
  width: clamp(48px, 14vw, 64px);
  height: clamp(48px, 14vw, 64px);
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  animation: guidePulse 2.2s ease-in-out infinite;
}

.guide-text {
  font-size: var(--fs-sm);
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.35);
}

.recreate-hint {
  padding: 0 clamp(16px, 4vw, 20px);
  font-size: var(--fs-xs);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: -0.2px;
  text-align: center;
  margin-top: clamp(12px, 3vw, 16px);
  min-height: 20px;
}

/* 트랜지션 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes guidePulse {
  0%, 100% { transform: scale(1);   opacity: 0.5; }
  50%       { transform: scale(1.3); opacity: 0.15; }
}

/* ── 낙�섰세이프 모바일: 힉트를 숨겨서 캐린버스를 최대화 ── */
@media (max-height: 500px) and (orientation: landscape) {
  .recreate-hint {
    display: none;
  }
  .recreate-header {
    margin-bottom: 4px;
  }
}

/* ── 소형 화면 ── */
@media (max-height: 600px) {
  .recreate-screen {
    padding-bottom: clamp(12px, 3vh, 20px);
  }
}
/* 이쿨라이저 바로 위 타이틀+가이드 (WatchScreen과 동일) */
.eq-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: clamp(6px, 1.5vh, 10px);
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
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  letter-spacing: -0.2px;
  line-height: 1.4;
  margin: 0;
}

/* ── 소형 화면 ── */
@media (max-height: 600px) {
  .canvas-wrap { gap: 8px; }
  .eq-info-title { font-size: var(--fs-xl); }
}
</style>
