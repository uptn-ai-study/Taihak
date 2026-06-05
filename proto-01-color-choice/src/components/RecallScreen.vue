<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { hsbToRgb, rgbToCss } from '../utils/color'

const props = defineProps<{
  roundIndex: number
  totalRounds: number
  isLastRound: boolean
}>()

const emit = defineEmits<{
  submit: [h: number, s: number, b: number]
}>()

const hue = ref(180)
const sat = ref(50)
const bri = ref(50)

// 라운드 변경 시 슬라이더 초기화
watch(() => props.roundIndex, () => {
  hue.value = 180
  sat.value = 50
  bri.value = 50
})

const guessRgb = computed(() => hsbToRgb(hue.value, sat.value, bri.value))
const guessColor = computed(() => rgbToCss(guessRgb.value))

// 채도 슬라이더 그라디언트
const satGradient = computed(() => {
  const left = rgbToCss(hsbToRgb(hue.value, 0, bri.value))
  const right = rgbToCss(hsbToRgb(hue.value, 100, bri.value))
  return `linear-gradient(to right, ${left}, ${right})`
})

// 명도 슬라이더 그라디언트
const briGradient = computed(() => {
  const left = rgbToCss(hsbToRgb(hue.value, sat.value, 0))
  const right = rgbToCss(hsbToRgb(hue.value, sat.value, 100))
  return `linear-gradient(to right, ${left}, ${right})`
})

function tune(control: 'hue' | 'sat' | 'bri', dir: number) {
  if (control === 'hue') {
    let val = hue.value + dir
    if (val < 0) val = 359
    if (val >= 360) val = 0
    hue.value = val
  } else if (control === 'sat') {
    sat.value = Math.max(0, Math.min(100, sat.value + dir))
  } else {
    bri.value = Math.max(0, Math.min(100, bri.value + dir))
  }
}

function handleSubmit() {
  emit('submit', hue.value, sat.value, bri.value)
}
</script>

<template>
  <section class="screen">
    <div class="recall-container">
      <!-- 프로그레스 -->
      <div class="game-progress">
        <div class="progress-steps">
          <div
            v-for="i in totalRounds"
            :key="i"
            class="dot"
            :class="{
              active: i - 1 === roundIndex,
              completed: i - 1 < roundIndex
            }"
          />
        </div>
        <div class="progress-text">색상 {{ roundIndex + 1 }} / {{ totalRounds }}</div>
      </div>

      <!-- 비교 타일 -->
      <div class="compare-board">
        <div class="compare-tile-wrapper">
          <span class="tile-label">기억 속 색상</span>
          <div class="compare-tile target-tile">
            <span class="question-mark">?</span>
          </div>
        </div>
        <div class="compare-tile-wrapper">
          <span class="tile-label">나의 다이얼</span>
          <div class="compare-tile guess-tile" :style="{ backgroundColor: guessColor }" />
        </div>
      </div>

      <!-- 슬라이더 패널 -->
      <div class="control-panel glass-panel">
        <!-- Hue -->
        <div class="control-group">
          <div class="control-header">
            <span class="control-name">HUE (색상)</span>
            <span class="control-value">{{ hue }}&deg;</span>
          </div>
          <div class="slider-wrapper">
            <button class="tune-btn" @click="tune('hue', -1)">-</button>
            <input type="range" v-model.number="hue" class="slider slider-hue" min="0" max="360">
            <button class="tune-btn" @click="tune('hue', 1)">+</button>
          </div>
        </div>

        <!-- Saturation -->
        <div class="control-group">
          <div class="control-header">
            <span class="control-name">SATURATION (채도)</span>
            <span class="control-value">{{ sat }}%</span>
          </div>
          <div class="slider-wrapper">
            <button class="tune-btn" @click="tune('sat', -1)">-</button>
            <input type="range" v-model.number="sat" class="slider slider-sat" min="0" max="100"
              :style="{ background: satGradient }">
            <button class="tune-btn" @click="tune('sat', 1)">+</button>
          </div>
        </div>

        <!-- Brightness -->
        <div class="control-group">
          <div class="control-header">
            <span class="control-name">BRIGHTNESS (명도)</span>
            <span class="control-value">{{ bri }}%</span>
          </div>
          <div class="slider-wrapper">
            <button class="tune-btn" @click="tune('bri', -1)">-</button>
            <input type="range" v-model.number="bri" class="slider slider-bri" min="0" max="100"
              :style="{ background: briGradient }">
            <button class="tune-btn" @click="tune('bri', 1)">+</button>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-glow" @click="handleSubmit">
        {{ isLastRound ? '최종 점수 확인하기' : '색상 확정하기' }}
      </button>
    </div>
  </section>
</template>
