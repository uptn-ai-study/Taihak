<script setup lang="ts">
import { ref } from 'vue'
import { useGameState } from './composables/useGameState'
import { useStorage } from './composables/useStorage'
import AppHeader from './components/AppHeader.vue'
import NicknameSetup from './components/NicknameSetup.vue'
import StartScreen from './components/StartScreen.vue'
import RevealScreen from './components/RevealScreen.vue'
import RecallScreen from './components/RecallScreen.vue'
import RoundResultScreen from './components/RoundResultScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import StatsModal from './components/StatsModal.vue'
import ToastNotification from './components/ToastNotification.vue'

const { hasNickname, setNickname } = useStorage()

const {
  currentScreen,
  currentRound,
  currentColorIndex,
  roundColors,
  roundGuesses,
  roundColorScores,
  allRoundResults,
  eliminated,
  toastMessage,
  currentTarget,
  isLastColorInRound,
  timerRatio,
  timerSeconds,
  cumulativeScore,
  roundsCleared,
  currentRoundScore,
  currentRoundPassed,
  tier,
  startGame,
  submitColor,
  proceedAfterRound,
  goToHome,
  showToast,
  shareResults,
} = useGameState()

const showStats = ref(false)

function handleNicknameSubmit(name: string) {
  setNickname(name)
}

function handleProfileReset() {
  goToHome()
}
</script>

<template>
  <div class="bg-glow" />

  <div class="app-container">
    <AppHeader
      v-if="hasNickname"
      @go-home="goToHome"
      @open-stats="showStats = true"
    />

    <main class="app-main">
      <NicknameSetup
        v-if="!hasNickname"
        @submit="handleNicknameSubmit"
      />

      <template v-else>
        <StartScreen
          v-if="currentScreen === 'start'"
          @start="startGame"
        />

        <RevealScreen
          v-if="currentScreen === 'reveal' && currentTarget"
          :current-round="currentRound"
          :current-color-index="currentColorIndex"
          :current-target="currentTarget"
          :timer-seconds="timerSeconds"
          :timer-ratio="timerRatio"
        />

        <RecallScreen
          v-if="currentScreen === 'recall'"
          :current-round="currentRound"
          :current-color-index="currentColorIndex"
          :is-last-color-in-round="isLastColorInRound"
          @submit="submitColor"
        />

        <RoundResultScreen
          v-if="currentScreen === 'round_result'"
          :current-round="currentRound"
          :round-colors="roundColors"
          :round-guesses="roundGuesses"
          :round-color-scores="roundColorScores"
          :round-score="currentRoundScore"
          :passed="currentRoundPassed"
          :eliminated="eliminated"
          :cumulative-score="cumulativeScore"
          @proceed="proceedAfterRound"
        />

        <ResultsScreen
          v-if="currentScreen === 'results'"
          :cumulative-score="cumulativeScore"
          :tier="tier"
          :rounds-cleared="roundsCleared"
          :eliminated="eliminated"
          :all-round-results="allRoundResults"
          @restart="startGame"
          @share="shareResults"
        />
      </template>
    </main>

    <StatsModal
      :visible="showStats"
      @close="showStats = false"
      @toast="showToast"
      @profile-reset="handleProfileReset"
    />

    <footer class="app-footer">
      <p>COLOR // SENSE CHALLENGE &copy; 2026.</p>
    </footer>
  </div>

  <ToastNotification :message="toastMessage" />
</template>
