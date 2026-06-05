<script setup lang="ts">
import type { GameColor } from '../types/game'
import { rgbToCss } from '../utils/color'
import { TOTAL_ROUNDS, COLORS_PER_ROUND } from '../composables/useGameState'

defineProps<{
  currentRound: number        // 0-based
  currentColorIndex: number   // 0-based within round
  currentTarget: GameColor
  timerSeconds: string
  timerRatio: number
}>()
</script>

<template>
  <section class="screen">
    <div class="reveal-container">
      <div class="reveal-round-badge">
        라운드 {{ currentRound + 1 }} / {{ TOTAL_ROUNDS }}
      </div>

      <div class="timer-wrapper">
        <div class="timer-countdown-large">{{ timerSeconds }}</div>
        <div class="timer-bar-container">
          <div class="timer-bar" :style="{ transform: `scaleX(${timerRatio})` }" />
        </div>
        <div class="timer-label">색상 {{ currentColorIndex + 1 }} / {{ COLORS_PER_ROUND }} — 기억하세요!</div>
      </div>

      <div class="color-grid single-tile-grid">
        <div
          class="color-tile"
          :style="{ backgroundColor: rgbToCss(currentTarget.rgb) }"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.reveal-round-badge {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-primary);
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.2);
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
}
</style>
