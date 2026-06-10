<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GameResult } from '../types'
import { MAX_STAGE } from '../lib/gomoku'

const props = defineProps<{
  result: GameResult | null
  stage: number
  wins: number
  maxStage: number
}>()

const emit = defineEmits<{
  retry: []
  next: []
}>()

const visible = ref(false)
const open = ref(false)

const config = {
  win:  { emoji: '🎉', title: '승리!',   sub: (s: number) => `스테이지 ${s} 클리어!` },
  lose: { emoji: '😔', title: '패배...',  sub: (s: number) => `스테이지 ${s} 실패` },
  draw: { emoji: '🤝', title: '무승부!', sub: () => '착점 불가 — 비겼습니다' },
}

watch(() => props.result, (val) => {
  if (val) {
    visible.value = true
    requestAnimationFrame(() => { open.value = true })
  }
})

function close() {
  open.value = false
  setTimeout(() => { visible.value = false }, 300)
}

function onRetry() { close(); emit('retry') }
function onNext()  { close(); emit('next') }
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="bs-overlay" :class="{ open }">
      <div class="bs-sheet">
        <div class="bs-handle"></div>
        <div class="bs-body" v-if="result">
          <div class="result-emoji">{{ config[result].emoji }}</div>
          <div class="result-title">{{ config[result].title }}</div>
          <div class="result-sub">{{ config[result].sub(stage) }}</div>

          <div class="result-stats">
            <div class="result-stat">
              <div class="result-stat-num">{{ stage }}</div>
              <div class="result-stat-label">스테이지</div>
            </div>
            <div class="result-stat">
              <div class="result-stat-num">{{ wins }}</div>
              <div class="result-stat-label">총 승리</div>
            </div>
            <div class="result-stat">
              <div class="result-stat-num">{{ maxStage }}</div>
              <div class="result-stat-label">최고 스테이지</div>
            </div>
          </div>

          <div v-if="result === 'win' && stage >= MAX_STAGE" class="completion-banner">
            <h2>🏆 전 스테이지 완주!</h2>
            <p>20개 스테이지를 모두 클리어했습니다!</p>
          </div>

          <div class="btn-row">
            <button class="btn-secondary" @click="onRetry">다시 도전</button>
            <button v-if="result === 'win'" class="btn-primary-md" @click="onNext">
              {{ stage >= MAX_STAGE ? '처음부터 다시' : `스테이지 ${stage + 1} 도전 →` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
