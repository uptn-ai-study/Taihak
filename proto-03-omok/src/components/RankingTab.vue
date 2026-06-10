<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PlayerRecord } from '../types'
import { fetchRanking } from '../lib/supabase'

const { nickname } = defineProps<{ nickname: string }>()

const records = ref<PlayerRecord[]>([])
const loading = ref(true)
const medals = ['🥇', '🥈', '🥉']

onMounted(async () => {
  try {
    records.value = await fetchRanking()
  } catch {
    const local = JSON.parse(localStorage.getItem('omok_records') ?? '{}') as Record<string, Omit<PlayerRecord, 'nickname'>>
    records.value = Object.entries(local)
      .map(([nick, v]) => ({ nickname: nick, ...v }))
      .sort((a, b) => (b.max_stage - a.max_stage) || (b.wins - a.wins))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="ranking-wrap">
    <div v-if="loading" class="loading-text">불러오는 중...</div>

    <template v-else-if="records.length === 0">
      <div class="empty-state">
        <div class="empty-icon">🏆</div>
        <div class="empty-text">아직 기록이 없어요</div>
        <div class="empty-sub">첫 번째 플레이어가 되어보세요!</div>
      </div>
    </template>

    <template v-else>
      <div class="ranking-section-title">전체 랭킹 — 최고 스테이지 기준</div>
      <div
        v-for="(r, i) in records"
        :key="r.nickname"
        class="rank-card"
        :class="{ me: r.nickname === nickname }"
      >
        <div class="rank-num">{{ medals[i] ?? i + 1 }}</div>
        <div class="rank-avatar">{{ r.nickname[0].toUpperCase() }}</div>
        <div class="rank-info">
          <div class="rank-name">{{ r.nickname }}{{ r.nickname === nickname ? ' 👈' : '' }}</div>
          <div class="rank-sub">{{ r.games ?? 0 }}게임 · 최고 스테이지 {{ r.max_stage ?? 1 }}</div>
        </div>
        <div class="rank-score">
          <div class="rank-wins">{{ r.wins ?? 0 }}승</div>
          <div class="rank-losses">{{ r.losses ?? 0 }}패</div>
        </div>
      </div>
    </template>
  </div>
</template>
