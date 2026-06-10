<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from './GameBoard.vue'
import RankingTab from './RankingTab.vue'
import ResultSheet from './ResultSheet.vue'
import { useGame } from '../composables/useGame'

const props = defineProps<{ nickname: string }>()

const activeTab = ref<'game' | 'ranking'>('game')
const {
  board, lastMove, currentStage, isPlayerTurn, gameOver,
  aiThinking, wins, losses, maxStage, result, progress,
  handlePlayerMove, nextStage, retry,
} = useGame(props.nickname)
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
      </div>
      <div class="score-row">
        <div class="score-item">
          <div class="score-num">{{ wins }}</div>
          <div class="score-label">승</div>
        </div>
        <div class="score-item">
          <div class="score-num">{{ losses }}</div>
          <div class="score-label">패</div>
        </div>
        <div class="score-item">
          <div class="score-num">{{ maxStage }}</div>
          <div class="score-label">최고</div>
        </div>
      </div>
    </div>

    <div class="restart-wrap">
      <button class="btn-gray" @click="retry()">↺ 다시 시작</button>
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
