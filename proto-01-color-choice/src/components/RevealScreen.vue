<script setup lang="ts">
import type { GameColor } from '../types/game'
import { rgbToCss } from '../utils/color'

defineProps<{
  roundIndex: number
  totalRounds: number
  currentTarget: GameColor
  timerSeconds: string
  timerRatio: number
}>()
</script>

<template>
  <section class="screen">
    <div class="reveal-container">
      <div class="timer-wrapper">
        <div class="timer-countdown-large">{{ timerSeconds }}</div>
        <div class="timer-bar-container">
          <div class="timer-bar" :style="{ transform: `scaleX(${timerRatio})` }" />
        </div>
        <div class="timer-label">제한된 시간안에 색상을 기억하세요.</div>
      </div>

      <h2 class="section-title">라운드 {{ roundIndex + 1 }} / {{ totalRounds }}</h2>

      <div class="color-grid single-tile-grid">
        <div
          class="color-tile"
          :style="{ backgroundColor: rgbToCss(currentTarget.rgb) }"
        />
      </div>
    </div>
  </section>
</template>
