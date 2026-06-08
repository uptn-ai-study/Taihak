<template>
  <div class="intro-screen">
    <!-- 배경 파티클 -->
    <div class="intro-bg-wrap">
      <div
        v-for="p in particles"
        :key="p.id"
        class="intro-particle"
        :style="p.style"
      />
    </div>

    <!-- 콘텐츠 -->
    <div class="intro-content">
      <!-- 비주얼 이퀄라이저 -->
      <div class="intro-visual" ref="wrapRef">
        <canvas ref="canvasRef" class="equalizer-canvas" />
      </div>

      <!-- 타이틀 & 설명 -->
      <h1 class="intro-title">
        <span class="title-line-1">TIME</span>
        <span class="title-line-2"><span class="title-slash">//</span> SENSE CHALLENGE</span>
      </h1>
      <p class="intro-desc">
        화면에 나타나는 시간을 기억하고<br />
        그대로 재현해보세요.
      </p>

      <!-- 난이도 선택 -->
      <div class="intro-section">
        <p class="intro-section-label">난이도</p>
        <div class="difficulty-pills">
          <button
            class="pill"
            :class="{ active: store.difficulty === 'easy' }"
            @click="store.setDifficulty('easy')"
          >
            🌙 Easy
          </button>
          <button
            class="pill"
            :class="{ active: store.difficulty === 'hard' }"
            @click="store.setDifficulty('hard')"
          >
            ⚡ Hard
          </button>
        </div>
      </div>

      <!-- 시작 버튼 -->
      <button class="btn-primary" @click="store.startGame()">
        시작하기 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { createEqualizerState, updateEqualizerState, drawBarEqualizer } from '../utils/wave'

const store = useGameStore()

const wrapRef   = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let logicalWidth = 240
let logicalHeight = 180
let animId = 0
let 시작시각 = 0
let 마지막시각 = 0

// 16개 채널의 세그먼트 이퀄라이저 상태 생성
const eqState = createEqualizerState(16)
const introSeed = 999 // 인트로 고유 시드

function 캔버스초기화() {
  const canvas = canvasRef.value
  const wrap   = wrapRef.value
  if (!canvas || !wrap) return

  const dpr  = window.devicePixelRatio || 1
  logicalWidth = wrap.clientWidth || 240
  logicalHeight = 180

  canvas.width  = logicalWidth * dpr
  canvas.height = logicalHeight * dpr
  canvas.style.width  = `${logicalWidth}px`
  canvas.style.height = `${logicalHeight}px`

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

  // 이퀄라이저 물리 엔진 업데이트 및 렌더링 (플레이어 Cyan-Purple-Magenta 테마 연동)
  updateEqualizerState(eqState, 경과ms, dtMs, introSeed)
  ctx.clearRect(0, 0, logicalWidth, logicalHeight)
  drawBarEqualizer(ctx, 0, 0, logicalWidth, logicalHeight, eqState, { isGhost: false })

  animId = requestAnimationFrame(렌더링루프)
}

// 파티클 데이터 (기존 유지)
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  style: {
    width: `${Math.random() * 8 + 4}px`,
    height: `${Math.random() * 8 + 4}px`,
    left: `${Math.random() * 100}%`,
    bottom: `${Math.random() * 30}%`,
    animationDuration: `${Math.random() * 6 + 4}s`,
    animationDelay: `${Math.random() * 4}s`,
  },
}))

onMounted(() => {
  nextTick(() => {
    캔버스초기화()
    animId = requestAnimationFrame(렌더링루프)
  })
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<style scoped>
.intro-screen {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.intro-visual {
  width: 100%;
  max-width: 240px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.equalizer-canvas {
  display: block;
}

.intro-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  line-height: 1;
  text-align: center;
}

.title-line-1 {
  font-size: 46px;
  font-weight: 800;
  letter-spacing: -1px;
  color: #FFFFFF;
}

.title-line-2 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
}

.title-slash {
  color: var(--primary);
  margin-right: 2px;
  font-weight: 800;
}

.intro-desc {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  letter-spacing: -0.2px;
}

.intro-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.intro-section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.btn-primary {
  margin-top: 4px;
}
</style>
