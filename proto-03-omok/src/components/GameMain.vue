<script setup lang="ts">
import { ref, computed } from 'vue'
import GameBoard from './GameBoard.vue'
import RankingTab from './RankingTab.vue'
import ResultSheet from './ResultSheet.vue'
import { useGame } from '../composables/useGame'

const props = defineProps<{ nickname: string }>()

const activeTab = ref<'game' | 'ranking'>('game')
const {
  board, lastMove, currentStage, isPlayerTurn, gameOver,
  aiThinking, wins, losses, maxStage, result, progress, forbiddenCells,
  timeLeft, handlePlayerMove, nextStage, retry, resetAll,
} = useGame(props.nickname)

const TURN_TIME = 10
const timerDash = computed(() => {
  const r = 20
  const circ = 2 * Math.PI * r
  return `${(timeLeft.value / TURN_TIME) * circ} ${circ}`
})
</script>

<template>
  <!-- Top Bar -->
  <div class="top-bar">
    <div class="top-bar-title">오목 챌린지</div>
    <div class="top-bar-right">
      <div class="avatar">{{ nickname[0].toUpperCase() }}</div>
      <span class="nickname-chip">{{ nickname }}</span>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="tab-bar">
    <button class="tab-item" :class="{ active: activeTab === 'game' }" @click="activeTab = 'game'">게임</button>
    <button class="tab-item" :class="{ active: activeTab === 'ranking' }" @click="activeTab = 'ranking'">랭킹</button>
  </div>

  <!-- Game Tab -->
  <div v-show="activeTab === 'game'" class="tab-content">
    <div class="stage-header">
      <div class="stage-row">
        <span class="stage-label">난이도 진행</span>
        <span class="stage-badge">스테이지 {{ currentStage }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <div class="board-section">
      <GameBoard
        :board="board"
        :last-move="lastMove"
        :forbidden-cells="forbiddenCells"
        :disabled="!isPlayerTurn || gameOver || aiThinking"
        @place="handlePlayerMove"
      />
    </div>

    <div class="status-card">
      <div class="turn-info">
        <div class="turn-stone" :class="isPlayerTurn && !aiThinking ? 'stone-black' : 'stone-white'"></div>
        <span class="turn-label">
          <template v-if="gameOver">게임 종료</template>
          <template v-else-if="aiThinking">
            AI 생각 중
            <span class="dots"><span>.</span><span>.</span><span>.</span></span>
          </template>
          <template v-else-if="isPlayerTurn">내 차례 (흑)</template>
          <template v-else>AI 차례 (백)</template>
        </span>
        <div v-if="isPlayerTurn && !gameOver && !aiThinking" class="timer-ring" :class="{ urgent: timeLeft <= 3 }">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" stroke-width="3"/>
            <circle
              cx="24" cy="24" r="20" fill="none"
              :stroke="timeLeft <= 3 ? '#ef4444' : '#5F46FF'"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="timerDash"
              stroke-dashoffset="0"
              transform="rotate(-90 24 24)"
              style="transition: stroke-dasharray 0.9s linear, stroke 0.3s"
            />
            <text x="24" y="29" text-anchor="middle" font-size="14" font-weight="700"
              :fill="timeLeft <= 3 ? '#ef4444' : '#1f2937'">{{ timeLeft }}</text>
          </svg>
        </div>
      </div>
    </div>

    <div class="restart-wrap" style="display:flex;gap:8px;">
      <button class="btn-gray" @click="retry()">↺ 다시 시작</button>
      <button class="btn-gray" style="background:#fee2e2;color:#b91c1c;border-color:#fca5a5;" @click="resetAll()">처음부터 (테스트)</button>
    </div>
  </div>

  <!-- Ranking Tab -->
  <div v-show="activeTab === 'ranking'" class="tab-content">
    <RankingTab :nickname="nickname" />
  </div>

  <!-- Result Sheet -->
  <ResultSheet
    :result="result"
    :stage="currentStage"
    :wins="wins"
    :max-stage="maxStage"
    @retry="retry()"
    @next="nextStage()"
  />
</template>
