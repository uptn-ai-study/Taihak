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
      <!-- 타이틀 & 설명 -->
      <h1 class="intro-title">
        <span class="title-line-1">TIME</span>
        <span class="title-line-2"><span class="title-slash">//</span> SENSE CHALLENGE</span>
      </h1>
      <p class="intro-desc">
        화면에 나타나는 시간을 기억하고<br />
        그대로 재현해보세요.
      </p>

      <!-- 비주얼 이퀄라이저 -->
      <div class="intro-visual" ref="wrapRef">
        <canvas ref="canvasRef" class="equalizer-canvas" />
      </div>

      <!-- 난이도 선택 -->
      <div class="intro-section">
        <p class="intro-section-label">난이도</p>
        <div class="difficulty-cards">
          <button
            class="diff-card"
            :class="{ selected: store.difficulty === 'easy' }"
            @click="store.setDifficulty('easy')"
          >
            <span class="diff-card-icon">🌙</span>
            <span class="diff-card-body">
              <span class="diff-card-name">Easy</span>
              <span class="diff-card-desc">1~5초 범위 · 처음 해보는 분께 추천</span>
            </span>
            <span class="diff-card-check" v-if="store.difficulty === 'easy'">&#10003;</span>
          </button>
          <button
            class="diff-card"
            :class="{ selected: store.difficulty === 'hard' }"
            @click="store.setDifficulty('hard')"
          >
            <span class="diff-card-icon">⚡</span>
            <span class="diff-card-body">
              <span class="diff-card-name">Hard</span>
              <span class="diff-card-desc">2~10초 범위 · 감각을 믿어야 해요</span>
            </span>
            <span class="diff-card-check" v-if="store.difficulty === 'hard'">&#10003;</span>
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
  logicalWidth  = wrap.clientWidth || 240
  // CSS에서 실제 렌더된 높이를 읽어 반응형 캔버스 크기 설정
  logicalHeight = wrap.clientHeight || 180

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

/* ─── 콘텐츠 컨테이너 ───
   gap을 제거하고 각 자식에 margin-bottom을 개별 부여.
   이렇게 해야 요소 쌍마다 다른 간격을 해상도별로 제어할 수 있다. */
.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 32px) clamp(16px, 5vw, 24px);
  position: relative;
  z-index: 1;
}

/* ─── 비주얼 (이퀄라이저 캔버스) ─── */
.intro-visual {
  width: 100%;
  max-width: 240px;
  height: clamp(120px, 25vh, 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 비주얼 → 난이도 섹션 간격 */
  margin-bottom: clamp(14px, 3.5vh, 24px);
  flex-shrink: 0;
}

.equalizer-canvas {
  display: block;
}

/* ─── 타이틀 ───
   서브라인과의 gap은 내부에서 처리 (6px 고정) */
.intro-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  line-height: 1;
  text-align: center;
  /* 타이틀 → 설명 간격: 타이틀은 큰 요소라 설명과 거리감 확보 */
  margin-bottom: clamp(6px, 2vh, 14px);
}

.title-line-1 {
  font-size: var(--fs-2xl);
  font-weight: 800;
  letter-spacing: -1px;
  color: #FFFFFF;
}

.title-line-2 {
  font-size: clamp(11px, 3vw, 13px);
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

/* ─── 설명 텍스트 ─── */
.intro-desc {
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  letter-spacing: -0.2px;
  /* 설명 → 비주얼 간격 */
  margin-bottom: clamp(12px, 3vh, 20px);
}

/* ─── 난이도 섹션 ───
   레이블 + 필 버튼을 하나의 블록으로 묶고,
   아래 시작 버튼과의 간격은 좁게 (버튼이 연속 액션이므로) */
.intro-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 2.5vw, 14px);
  /* 난이도 → 시작버튼 간격: CTA와 가깝게 */
  margin-bottom: clamp(8px, 2.5vh, 16px);
}

/* ─── 카드형 난이도 선택 UI ─── */
.difficulty-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.diff-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 16px);
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.diff-card:active {
  transform: scale(0.98);
}

.diff-card.selected {
  background: rgba(95, 70, 255, 0.12);
  border-color: var(--primary);
  box-shadow: 0 0 16px rgba(95, 70, 255, 0.25);
}

.diff-card-icon {
  font-size: clamp(20px, 5vw, 24px);
  flex-shrink: 0;
  line-height: 1;
}

.diff-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.diff-card-name {
  font-size: var(--fs-base);
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.diff-card.selected .diff-card-name {
  color: var(--primary-light);
}

.diff-card-desc {
  font-size: var(--fs-xs);
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
  line-height: 1.3;
}

.diff-card-check {
  font-size: 14px;
  color: var(--primary);
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}

.intro-section-label {
  font-size: var(--fs-base);   /* 기존 xs → base로 크게 */
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);  /* 기존 0.35 → 0.75로 선명하게 */
  letter-spacing: -0.2px;
  text-align: center;
  /* 좌우에 짧은 선을 붙여 섹션 타이틀처럼 보이게 */
  display: flex;
  align-items: center;
  gap: 10px;
}
.intro-section-label::before,
.intro-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
}

/* ─── 시작 버튼: 마지막 요소이므로 margin 불필요 ─── */
.btn-primary {
  width: 100%;
}


/* ════════════════════════════════
   브레이크포인트별 간격 조정
   ════════════════════════════════ */

/* ── 표준 모바일 (430~680px tall): 기본값 사용 ── */

/* ── 짧은 화면 (높이 680px 이하): 전반적으로 여백 축소 ── */
@media (max-height: 680px) {
  .intro-visual {
    height: clamp(100px, 22vh, 150px);
    margin-bottom: clamp(10px, 2.5vh, 18px);
  }
  .intro-title {
    margin-bottom: clamp(4px, 1.5vh, 10px);
  }
  .intro-desc {
    margin-bottom: clamp(8px, 2vh, 14px);
  }
  .intro-section {
    margin-bottom: clamp(6px, 2vh, 12px);
  }
}

/* ── 소형 화면 (높이 600px 이하): 비주얼 최소화, 전체 justify를 위로 ── */
@media (max-height: 600px) {
  .intro-content {
    justify-content: flex-start;
    padding-top: clamp(12px, 4vh, 20px);
  }
  .intro-visual {
    height: clamp(80px, 16vh, 110px);
    margin-bottom: clamp(8px, 2vh, 14px);
  }
  .intro-title {
    margin-bottom: clamp(2px, 1vh, 8px);
    gap: 4px;
  }
  .intro-desc {
    margin-bottom: clamp(6px, 1.5vh, 10px);
  }
  .intro-section {
    margin-bottom: clamp(4px, 1.5vh, 10px);
  }
}

/* ── 좁은 화면 (너비 360px 이하): 가로 패딩 & 비주얼 조절 ── */
@media (max-width: 360px) {
  .intro-content {
    padding-left: 14px;
    padding-right: 14px;
  }
  .intro-visual {
    height: clamp(90px, 20vh, 120px);
    max-width: 180px;
  }
}

/* ── 랜드스케이프: 비주얼 최소화 & 타이틀/설명 inline 배치 ── */
@media (max-height: 500px) and (orientation: landscape) {
  .intro-content {
    justify-content: flex-start;
    padding-top: 10px;
  }
  .intro-visual {
    height: clamp(60px, 12vh, 90px);
    margin-bottom: 6px;
  }
  .intro-title {
    margin-bottom: 4px;
  }
  .intro-desc {
    margin-bottom: 6px;
  }
  .intro-section {
    margin-bottom: 6px;
  }
}
</style>
