<template>
  <div class="countdown-screen">
    <span class="round-indicator">{{ store.currentRound }} / {{ TOTAL_ROUNDS }}</span>
    <div class="countdown-number" :key="store.countdownValue">
      {{ store.countdownValue }}
    </div>
    <p class="countdown-hint">준비하세요</p>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { TOTAL_ROUNDS } from '../types/game'

const store = useGameStore()
</script>

<style scoped>
.countdown-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.countdown-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
