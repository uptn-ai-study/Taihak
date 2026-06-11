<script setup lang="ts">
import { computed } from 'vue'
import { MAX_STAGE } from '../lib/gomoku'

const props = defineProps<{ nickname: string }>()
const emit = defineEmits<{ start: [] }>()

const LOCAL_KEY = 'omok_records'

const record = computed(() => {
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<string, {
    wins: number; losses: number; games: number; max_stage: number
  }>
  return all[props.nickname] ?? null
})

const rules = [
  { icon: '⚫', color: '#1a1a1a', bg: '#f3f4f6', title: '5목 승리', desc: '흑돌 5개를 연속으로 놓으면 승리' },
  { icon: '🚫', color: '#b91c1c', bg: '#fee2e2', title: '렌주룰', desc: '삼삼·사사·장목 금수 적용' },
  { icon: '⏱️', color: '#c2410c', bg: '#fff7ed', title: '10초 제한', desc: '1수당 10초 안에 착수 필요' },
  { icon: '🏆', color: '#92400e', bg: '#fef9c3', title: '20 스테이지', desc: '단계별 AI 강도 상승' },
]
</script>

<template>
  <div class="home-screen">

    <!-- Hero -->
    <div class="home-hero">
      <div class="home-logo">⚫</div>
      <h1 class="home-title">오목 챌린지</h1>
      <p class="home-sub">렌주룰 기반 · 20스테이지 AI 대전</p>
    </div>

    <!-- 기록 카드 (플레이 이력 있을 때) -->
    <div v-if="record" class="home-record-card">
      <div class="home-record-item">
        <div class="home-record-num">{{ record.wins }}</div>
        <div class="home-record-label">총 승리</div>
      </div>
      <div class="home-record-divider"></div>
      <div class="home-record-item">
        <div class="home-record-num">{{ record.max_stage }}<span class="home-record-unit">/{{ MAX_STAGE }}</span></div>
        <div class="home-record-label">최고 스테이지</div>
      </div>
      <div class="home-record-divider"></div>
      <div class="home-record-item">
        <div class="home-record-num">{{ record.games }}</div>
        <div class="home-record-label">총 게임</div>
      </div>
    </div>

    <!-- 게임 규칙 그리드 -->
    <div class="home-rules-section">
      <p class="home-rules-label">게임 규칙</p>
      <div class="home-rules-grid">
        <div v-for="rule in rules" :key="rule.title" class="home-rule-card">
          <div class="home-rule-icon-wrap" :style="{ background: rule.bg }">
            <span class="home-rule-icon">{{ rule.icon }}</span>
          </div>
          <div class="home-rule-title">{{ rule.title }}</div>
          <div class="home-rule-desc">{{ rule.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="home-footer">
      <div class="home-player">
        <div class="home-avatar">{{ nickname[0].toUpperCase() }}</div>
        <span class="home-player-name">{{ nickname }}</span>
      </div>
      <button class="btn-primary" @click="emit('start')">게임 시작</button>
    </div>

  </div>
</template>
