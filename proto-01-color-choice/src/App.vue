<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameState } from './composables/useGameState'
import { useStorage } from './composables/useStorage'
import AppHeader from './components/AppHeader.vue'
import NicknameSetup from './components/NicknameSetup.vue'
import StartScreen from './components/StartScreen.vue'
import RevealScreen from './components/RevealScreen.vue'
import RecallScreen from './components/RecallScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import StatsModal from './components/StatsModal.vue'
import ToastNotification from './components/ToastNotification.vue'

const { hasNickname, setNickname } = useStorage()

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

function handleNicknameSubmit(name: string) {
  setNickname(name)
}

function handleProfileReset() {
  goToHome()
}
</script>

<template>
  <div class="bg-glow" />

  <div class="app-container" :class="themeClass">
    <AppHeader
      v-if="hasNickname"
      @go-home="goToHome"
      @open-stats="showStats = true"
    />

    <main class="app-main">
      <!-- 닉네임 미설정 시 최초 프로필 생성 -->
      <NicknameSetup
        v-if="!hasNickname"
        @submit="handleNicknameSubmit"
      />

      <template v-else>
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
