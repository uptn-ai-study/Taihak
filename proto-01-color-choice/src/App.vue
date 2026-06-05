<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameState } from './composables/useGameState'
import AppHeader from './components/AppHeader.vue'
import StartScreen from './components/StartScreen.vue'
import RevealScreen from './components/RevealScreen.vue'
import RecallScreen from './components/RecallScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import StatsModal from './components/StatsModal.vue'
import ToastNotification from './components/ToastNotification.vue'

const {
  currentScreen,
  difficulty,
  targetColors,
  userGuesses,
  scores,
  currentRoundIndex,
  toastMessage,
  currentTarget,
  grandScore,
  tier,
  isLastRound,
  timerRatio,
  timerSeconds,
  startGame,
  submitColor,
  goToHome,
  showToast,
  shareResults,
  TOTAL_ROUNDS,
} = useGameState()

const showStats = ref(false)

const themeClass = computed(() => `theme-${difficulty.value}`)
</script>

<template>
  <div class="bg-glow" />

  <div class="app-container" :class="themeClass">
    <AppHeader
      @go-home="goToHome"
      @open-stats="showStats = true"
    />

    <main class="app-main">
      <StartScreen
        v-if="currentScreen === 'start'"
        :difficulty="difficulty"
        @update:difficulty="difficulty = $event"
        @start="startGame"
      />

      <RevealScreen
        v-if="currentScreen === 'reveal' && currentTarget"
        :round-index="currentRoundIndex"
        :total-rounds="TOTAL_ROUNDS"
        :current-target="currentTarget"
        :timer-seconds="timerSeconds"
        :timer-ratio="timerRatio"
      />

      <RecallScreen
        v-if="currentScreen === 'recall'"
        :round-index="currentRoundIndex"
        :total-rounds="TOTAL_ROUNDS"
        :is-last-round="isLastRound"
        @submit="submitColor"
      />

      <ResultsScreen
        v-if="currentScreen === 'results'"
        :grand-score="grandScore"
        :tier="tier"
        :target-colors="targetColors"
        :user-guesses="userGuesses"
        :scores="scores"
        @restart="startGame"
        @share="shareResults"
      />
    </main>

    <StatsModal
      :visible="showStats"
      @close="showStats = false"
      @toast="showToast"
    />

    <footer class="app-footer">
      <p>COLOR // SENSE CHALLENGE &copy; 2026.</p>
    </footer>
  </div>

  <ToastNotification :message="toastMessage" />
</template>
