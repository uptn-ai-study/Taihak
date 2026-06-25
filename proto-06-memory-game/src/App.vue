<template>
  <div id="app">
    <HomeScreen
      v-if="screen === 'home'"
      :nickname="nickname"
      :myRecords="myRecords"
      @startGame="handleStartGame"
      @editNickname="showNicknameModal = true"
    />

    <GamePlay
      v-else-if="screen === 'game'"
      :stage="currentStage"
      @success="handleSuccess"
      @fail="handleFail"
      @quit="handleQuit"
    />

    <AdScreen
      v-else-if="screen === 'ad'"
      :stage="clearedStage"
      @done="goToGame"
    />

    <GameResult
      v-else-if="screen === 'result'"
      :stage="resultStage"
      :success="resultSuccess"
      :prevBest="prevBest"
      :isNewBest="isNewBest"
      :rankPosition="rankPosition"
      :earnedPoints="earnedPoints"
      :totalPoints="totalPointsDisplay"
      :rateLabel="rewardRate"
      @next="handleNextStage"
      @retry="startStage"
      @home="goHome"
    />

    <NicknameModal
      v-if="showNicknameModal"
      :current="nickname"
      @confirm="handleNicknameConfirm"
      @close="showNicknameModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Screen, LocalRecord } from './types'
import HomeScreen from './components/HomeScreen.vue'
import GamePlay from './components/GamePlay.vue'
import AdScreen from './components/AdScreen.vue'
import GameResult from './components/GameResult.vue'
import NicknameModal from './components/NicknameModal.vue'
import { getNickname, saveNickname, getMyRecords, addMyRecord, getBestStage, getTotalPoints, addPoints } from './lib/localStorage'
import { saveRanking, fetchAllTimeRanking } from './lib/supabase'

const screen = ref<Screen | 'ad'>('home')
const nickname = ref('')
const myRecords = ref<LocalRecord[]>([])
const showNicknameModal = ref(false)

const currentStage = ref(1)
const clearedStage = ref(4)
const sessionBestStage = ref(0)
const sessionPoints = ref(0)
const resultStage = ref(1)
const resultSuccess = ref(false)
const prevBest = ref(0)
const isNewBest = ref(false)
const rankPosition = ref<number | null>(null)
const earnedPoints = ref(0)
const totalPointsDisplay = ref(0)
const rewardRate = ref(50)

onMounted(() => {
  const saved = getNickname()
  if (saved) {
    nickname.value = saved
  } else {
    showNicknameModal.value = true
  }
  myRecords.value = getMyRecords()
})

function handleNicknameConfirm(name: string) {
  nickname.value = name
  saveNickname(name)
  showNicknameModal.value = false
}

function handleStartGame() {
  if (!nickname.value) { showNicknameModal.value = true; return }
  sessionBestStage.value = 0
  sessionPoints.value = 0
  startStage(1)
}

function startStage(stage: number) {
  currentStage.value = stage
  screen.value = 'game'
}

async function handleSuccess(stage: number) {
  sessionBestStage.value = stage

  const best = getBestStage()
  prevBest.value = best
  isNewBest.value = stage > best

  rankPosition.value = await getRankPosition(stage)

  const n = Math.floor(Math.random() * 51) + 50   // 50~100%
  const pts = Math.round(stage * n / 100)          // stage * 0.5~1.0
  rewardRate.value = n
  earnedPoints.value = pts
  addPoints(pts)
  sessionPoints.value += pts
  totalPointsDisplay.value = sessionPoints.value

  resultStage.value = stage
  resultSuccess.value = true

  screen.value = 'result'
}

function handleNextStage(nextStage: number) {
  if (nextStage > 20) return
  clearedStage.value = nextStage - 1
  currentStage.value = nextStage
  screen.value = 'ad'
}

function goToGame() {
  screen.value = 'game'
}

async function handleFail(stage: number) {
  if (sessionBestStage.value > 0) {
    addMyRecord(sessionBestStage.value)
    myRecords.value = getMyRecords()
    await saveRanking(nickname.value, sessionBestStage.value)
    sessionBestStage.value = 0
  }
  prevBest.value = getBestStage()
  isNewBest.value = false
  rankPosition.value = null
  earnedPoints.value = sessionPoints.value
  totalPointsDisplay.value = sessionPoints.value
  rewardRate.value = 0
  resultStage.value = stage
  resultSuccess.value = false
  screen.value = 'result'
}

async function getRankPosition(stage: number): Promise<number | null> {
  const ranking = await fetchAllTimeRanking(100)
  const idx = ranking.findIndex(r => r.stage <= stage)
  return idx >= 0 ? idx + 1 : null
}

async function handleQuit() {
  if (sessionBestStage.value > 0) {
    addMyRecord(sessionBestStage.value)
    await saveRanking(nickname.value, sessionBestStage.value)
    sessionBestStage.value = 0
  }
  goHome()
}

function goHome() {
  screen.value = 'home'
  myRecords.value = getMyRecords()
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

html {
  height: 100%;
  overflow-x: hidden;
}

body {
  margin: 0; padding: 0;
  font-family: 'SUIT Variable', 'SUIT', -apple-system, sans-serif;
  background: #E8E8EE;
  min-height: 100%;
  min-height: 100dvh;
  overscroll-behavior-y: none;
}

#app {
  min-height: 100vh;
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  background: #F5F5F8;
  position: relative;
  box-shadow: 0 0 40px rgba(0,0,0,0.08);
}

/* iOS safe-area 대응 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  #app { padding-bottom: env(safe-area-inset-bottom); }
}
</style>
