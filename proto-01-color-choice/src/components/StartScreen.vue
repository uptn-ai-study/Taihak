<script setup lang="ts">
import type { Difficulty } from '../types/game'
import { DIFFICULTY_CONFIGS } from '../composables/useGameState'
import { useStorage } from '../composables/useStorage'

const props = defineProps<{
  difficulty: Difficulty
}>()

const emit = defineEmits<{
  'update:difficulty': [value: Difficulty]
  start: []
}>()

const { recentRecords } = useStorage()

const difficulties = Object.entries(DIFFICULTY_CONFIGS) as [Difficulty, typeof DIFFICULTY_CONFIGS[Difficulty]][]
</script>

<template>
  <section class="screen">
    <div class="intro-container">
      <h1 class="main-title">
        당신의 색감 인지력을<br>
        <span class="highlight">측정해 보세요</span>
      </h1>
      <p class="subtitle">
        제시되는 3개의 색상들을 기억한 뒤 HSB 슬라이더로 재현해 보세요.<br>
        사람의 눈이 느끼는 미세한 색차(CIEDE2000)를 기준으로 당신의 감각을 채점합니다.
      </p>

      <div class="config-card glass-panel">
        <h3 class="card-title">난이도 선택</h3>
        <div class="difficulty-options">
          <label v-for="[key, config] in difficulties" :key="key" class="diff-option">
            <input
              type="radio"
              name="difficulty"
              :value="key"
              :checked="props.difficulty === key"
              @change="emit('update:difficulty', key)"
            >
            <div class="diff-card">
              <span class="diff-name">{{ config.label }}</span>
              <span class="diff-desc">{{ config.description }}</span>
            </div>
          </label>
        </div>
      </div>

      <button class="btn btn-primary btn-glow" @click="emit('start')">
        도전 시작하기
      </button>

      <div v-if="recentRecords.length > 0" class="recent-records glass-panel">
        <h4 class="records-title">최근 최고 기록</h4>
        <div class="records-list">
          <div v-for="(rec, i) in recentRecords" :key="i" class="record-row">
            <span class="record-date">{{ rec.date }}</span>
            <span class="record-diff">{{ rec.difficulty }}</span>
            <span class="record-score">{{ rec.score.toFixed(2) }}점 ({{ rec.tier }}등급)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
