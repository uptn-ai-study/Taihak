<template>
  <div class="gameplay">
    <header class="game-header">
      <button class="btn-back" @click="showQuit = true">✕</button>
      <div class="stage-info">
        <span class="stage-label">STAGE</span>
        <span class="stage-num">{{ stage }}</span>
      </div>
      <div class="timer-wrap">
        <svg class="timer-ring" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill="none" stroke="#E5E7EB" stroke-width="3"/>
          <circle cx="20" cy="20" r="17" fill="none" stroke="#5F46FF" stroke-width="3"
            stroke-dasharray="106.8"
            :stroke-dashoffset="phase === 'preview' ? 0 : 106.8 * (1 - timeLeft / timeLimit)"
            stroke-linecap="round"
            transform="rotate(-90 20 20)"
            :style="{ stroke: timeLeft <= timeLimit / 3 && phase === 'playing' ? '#EF4444' : '#5F46FF' }"
          />
        </svg>
        <span class="timer-text" :class="{ danger: timeLeft <= timeLimit / 3 && phase === 'playing' }">
          {{ phase === 'preview' ? '—' : timeLeft }}
        </span>
      </div>
    </header>

    <div class="info-row">
      <span class="pairs-text">{{ matchedPairs }} / {{ totalPairs }} 매칭</span>
      <span class="grid-label">{{ gridSize }}×{{ gridSize }}</span>
    </div>

    <!-- 미리보기 카운트다운 -->
    <transition name="fade">
      <div v-if="phase === 'preview'" class="preview-banner">
        <span class="preview-icon">👀</span>
        <span class="preview-msg">카드 위치를 기억하세요!</span>
        <span class="preview-count">{{ previewCountdown }}</span>
      </div>
    </transition>

    <div class="card-grid" :style="gridStyle">
      <button
        v-for="card in cards"
        :key="card.id"
        class="card"
        :class="{
          flipped: isCardFlipped(card),
          matched: card.isMatched,
          free: card.isFree,
        }"
        :style="cardSizeStyle"
        @click="flipCard(card)"
        :disabled="card.isMatched || isChecking || phase === 'preview'"
      >
        <div class="card-inner">
          <div class="card-back">
            <span class="card-back-icon">❓</span>
          </div>
          <div class="card-front">{{ card.symbol }}</div>
        </div>
      </button>
    </div>

    <button class="btn-restart" @click="showQuit = true">처음으로</button>

    <!-- 종료 확인 바텀시트 -->
    <div v-if="showQuit" class="bs-overlay" @click.self="showQuit = false">
      <div class="bs-sheet open">
        <div class="bs-handle"></div>
        <div class="quit-content">
          <p class="quit-title">게임을 종료할까요?</p>
          <p class="quit-desc">현재 진행 중인 기록은 저장되지 않아요.</p>
        </div>
        <div class="btn-row">
          <button class="btn-secondary" @click="showQuit = false">계속하기</button>
          <button class="btn-primary-md" @click="$emit('quit')">종료하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Card } from '../types'
import { buildCards, getPairsForStage, getGridSize, getTimeLimit } from '../lib/gameLogic'

const props = defineProps<{ stage: number }>()
const emit = defineEmits<{
  success: [stage: number]
  fail: [stage: number]
  quit: []
}>()

const cards = ref<Card[]>([])
const flipped = ref<Card[]>([])
const isChecking = ref(false)
const timeLeft = ref(30)
const showQuit = ref(false)
const viewportW = ref(Math.min(window.innerWidth, 480))
const phase = ref<'preview' | 'playing'>('preview')
const previewCountdown = ref(3)

let gameTimer: ReturnType<typeof setInterval> | null = null
let previewTimer: ReturnType<typeof setInterval> | null = null

const gridSize = computed(() => getGridSize(props.stage))
const totalPairs = computed(() => getPairsForStage(props.stage))
const timeLimit = computed(() => getTimeLimit(props.stage))
const matchedPairs = computed(() =>
  cards.value.filter(c => c.isMatched && !c.isFree).length / 2
)

const GAP = 8

const cardSizePx = computed(() => {
  const available = viewportW.value - 56  // 좌우 패딩 여유 증가
  const totalGap = (gridSize.value - 1) * GAP
  return Math.max(24, Math.floor((available - totalGap) / gridSize.value))
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridSize.value}, ${cardSizePx.value}px)`,
  gap: `${GAP}px`,
}))

const cardSizeStyle = computed(() => {
  const s = cardSizePx.value
  return {
    width: `${s}px`,
    height: `${s}px`,
    fontSize: `${Math.max(18, Math.floor(s * 0.5))}px`,  // 이모지 최소 18px 보장
  }
})

function isCardFlipped(card: Card): boolean {
  return card.isFree || card.isMatched || phase.value === 'preview' || card.isFlipped
}

function onResize() {
  viewportW.value = Math.min(window.innerWidth, 480)
}

function startGameTimer() {
  if (gameTimer) clearInterval(gameTimer)
  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(gameTimer!)
      emit('fail', props.stage)
    }
  }, 1000)
}

function startPreview() {
  if (previewTimer) clearInterval(previewTimer)
  previewCountdown.value = 3
  phase.value = 'preview'

  previewTimer = setInterval(() => {
    previewCountdown.value--
    if (previewCountdown.value <= 0) {
      clearInterval(previewTimer!)
      // 일반 카드 뒤집기
      cards.value.forEach(c => { if (!c.isFree) c.isFlipped = false })
      phase.value = 'playing'
      startGameTimer()
    }
  }, 1000)
}

function flipCard(card: Card) {
  if (card.isFlipped || card.isMatched || isChecking.value || phase.value === 'preview') return
  card.isFlipped = true
  flipped.value.push(card)

  if (flipped.value.length === 2) {
    isChecking.value = true
    const [a, b] = flipped.value
    if (a.symbol === b.symbol) {
      a.isMatched = true
      b.isMatched = true
      flipped.value = []
      isChecking.value = false
      if (cards.value.filter(c => !c.isFree).every(c => c.isMatched)) {
        clearInterval(gameTimer!)
        setTimeout(() => emit('success', props.stage), 300)
      }
    } else {
      setTimeout(() => {
        a.isFlipped = false
        b.isFlipped = false
        flipped.value = []
        isChecking.value = false
      }, 800)
    }
  }
}

watch(() => props.stage, () => {
  if (gameTimer) clearInterval(gameTimer)
  if (previewTimer) clearInterval(previewTimer)
  timeLeft.value = timeLimit.value
  flipped.value = []
  isChecking.value = false
  cards.value = buildCards(props.stage)
  startPreview()
}, { immediate: true })

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => {
  if (gameTimer) clearInterval(gameTimer)
  if (previewTimer) clearInterval(previewTimer)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.gameplay {
  min-height: 100vh;
  min-height: 100dvh;
  background: #F5F5F8;
  display: flex; flex-direction: column; align-items: center;
  padding: 0 16px calc(24px + env(safe-area-inset-bottom, 0px));
  gap: 10px;
}

.game-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0 0; flex-shrink: 0;
}
.btn-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #FFFFFF; border: 1px solid #E5E7EB;
  font-size: 14px; color: #6B7280; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; touch-action: manipulation;
}
.stage-info { display: flex; flex-direction: column; align-items: center; }
.stage-label { font-size: 11px; font-weight: 700; color: #9CA3AF; letter-spacing: 1px; }
.stage-num { font-size: 28px; font-weight: 700; color: #111827; line-height: 1.1; }

.timer-wrap { position: relative; width: 44px; height: 44px; flex-shrink: 0; }
.timer-ring { width: 44px; height: 44px; }
.timer-text {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #5F46FF;
}
.timer-text.danger { color: #EF4444; }

.info-row {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0; padding: 0 2px;
}
.pairs-text { font-size: 13px; font-weight: 600; color: #6B7280; }
.grid-label {
  font-size: 12px; font-weight: 700; color: #9CA3AF;
  background: #FFFFFF; border: 1px solid #E5E7EB;
  border-radius: 9999px; padding: 2px 10px;
}

/* 미리보기 배너 */
.preview-banner {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #5F46FF; border-radius: 12px;
  padding: 10px 20px; width: 100%; flex-shrink: 0;
}
.preview-icon { font-size: 18px; }
.preview-msg { font-size: 14px; font-weight: 700; color: #fff; }
.preview-count {
  font-size: 20px; font-weight: 700; color: #fff;
  background: rgba(255,255,255,0.2); border-radius: 50%;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 카드 그리드 */
.card-grid {
  display: grid;
  justify-content: center;
  flex: 1; align-content: center;
}

.card {
  border: none; background: none; padding: 0; cursor: pointer;
  perspective: 600px; border-radius: 8px;
  touch-action: manipulation;
}
.card:disabled { cursor: default; }

.card-inner {
  width: 100%; height: 100%;
  position: relative; transform-style: preserve-3d;
  transition: transform 0.35s ease;
  border-radius: 8px;
}
.card.flipped .card-inner { transform: rotateY(180deg); }

.card-back, .card-front {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-back {
  background: #5F46FF;
  box-shadow: 0 2px 6px rgba(95,70,255,0.25);
}
.card-back-icon { font-size: 0.8em; filter: brightness(0) invert(1); opacity: 0.6; }
.card-front {
  background: #FFFFFF;
  transform: rotateY(180deg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}
.card.matched .card-front {
  background: #EEEAFF;
  box-shadow: 0 1px 4px rgba(95,70,255,0.15);
}

/* ⭐ free 카드 */
.card.free .card-front {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  box-shadow: 0 1px 4px rgba(245,158,11,0.25);
}

/* 미리보기 중 카드 강조 없음 */

.btn-restart {
  margin-top: 4px; flex-shrink: 0;
  height: 40px; padding: 0 20px;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  color: #374151; font-size: 14px; font-weight: 500;
  border-radius: 9999px; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}

/* 바텀시트 */
.bs-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.50);
  display: flex; align-items: flex-end;
  z-index: 200;
}
.bs-sheet {
  width: 100%; background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  padding: 12px 20px calc(28px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -4px 24px rgba(0,0,0,0.10);
  display: flex; flex-direction: column; align-items: center; gap: 20px;
}
.bs-handle { width: 36px; height: 4px; background: #E5E7EB; border-radius: 2px; }
.quit-content { text-align: center; }
.quit-title { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px; }
.quit-desc { font-size: 14px; color: #6B7280; margin: 0; }
.btn-row { display: flex; gap: 10px; width: 100%; }
.btn-secondary {
  flex: 1; height: 48px; background: #F2F0FF; color: #5F46FF;
  font-size: 15px; font-weight: 700;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
}
.btn-primary-md {
  flex: 1; height: 48px; background: #5F46FF; color: #FFFFFF;
  font-size: 15px; font-weight: 600;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
.btn-primary-md:active { background: #4A35E0; }
</style>
