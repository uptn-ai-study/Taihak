<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { RankingEntry } from '../types/game'
import { useRanking } from '../composables/useRanking'
import { useStorage } from '../composables/useStorage'

const { getDailyRanking, loadRanking, isLoading } = useRanking()
const { nickname } = useStorage()

const ranking = computed<RankingEntry[]>(() => {
  return getDailyRanking('normal')
})

const hasEntries = computed(() => ranking.value.length > 0)

onMounted(() => {
  loadRanking('normal')
})

// 오늘 날짜 포맷 (표시용)
const todayFormatted = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
})

function medalEmoji(index: number): string {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}`
}

function isMe(entry: RankingEntry): boolean {
  return entry.nickname === nickname.value
}

function tierClass(tier: string): string {
  switch (tier) {
    case 'S': return 'tier-s'
    case 'A': return 'tier-a'
    case 'B': return 'tier-b'
    case 'C': return 'tier-c'
    default: return ''
  }
}
</script>

<template>
  <div class="daily-ranking glass-panel">
    <div class="ranking-header">
      <h4 class="ranking-title">오늘의 랭킹</h4>
      <span class="ranking-date">{{ todayFormatted }}</span>
    </div>

    <!-- 랭킹 목록 -->
    <div class="ranking-list">
      <div v-if="isLoading" class="ranking-empty">
        랭킹을 불러오는 중...
      </div>
      <div v-else-if="!hasEntries" class="ranking-empty">
        아직 오늘의 기록이 없습니다.<br>
        첫 번째 도전자가 되어보세요!
      </div>

      <div
        v-for="(entry, index) in ranking.slice(0, 10)"
        :key="entry.id"
        class="ranking-row"
        :class="{ 'is-me': isMe(entry), 'is-top3': index < 3 }"
      >
        <div class="rank-position">
          <span v-if="index < 3" class="rank-medal">{{ medalEmoji(index) }}</span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>
        <div class="rank-user">
          <span class="rank-nickname" :class="{ 'my-nickname': isMe(entry) }">
            {{ entry.nickname }}
          </span>
          <span v-if="isMe(entry)" class="rank-me-badge">ME</span>
        </div>
        <div class="rank-score-area">
          <span class="rank-score">{{ entry.score.toFixed(2) }}</span>
          <span class="rank-tier rating-badge" :class="tierClass(entry.tier)"
            style="padding: 1px 6px; font-size: 0.6rem;">
            {{ entry.tier }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-ranking {
  width: 100%;
  margin-top: 20px;
  padding: 20px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.ranking-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.ranking-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: 'Share Tech Mono', monospace;
}

/* 난이도 탭 */
.ranking-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.ranking-tab {
  flex: 1;
  padding: 8px 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.ranking-tab:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-main);
}

.ranking-tab.active {
  background: rgba(0, 242, 254, 0.08);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 랭킹 리스트 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
  overflow-y: auto;
}

.ranking-empty {
  text-align: center;
  padding: 24px 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.6;
}

/* 랭킹 행 */
.ranking-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: var(--transition-smooth);
}

.ranking-row.is-top3 {
  background: rgba(255, 255, 255, 0.02);
}

.ranking-row.is-me {
  background: rgba(0, 242, 254, 0.06);
  border: 1px solid rgba(0, 242, 254, 0.15);
}

.rank-position {
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.rank-medal {
  font-size: 1.1rem;
}

.rank-number {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-muted);
  font-family: 'Share Tech Mono', monospace;
}

.rank-user {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.rank-nickname {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-nickname.my-nickname {
  color: var(--color-primary);
}

.rank-me-badge {
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--color-primary);
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.25);
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.rank-score-area {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.rank-score {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-main);
}

/* 반응형 */
@media (max-width: 480px) {
  .daily-ranking { padding: 16px; margin-top: 16px; }
  .ranking-title { font-size: 0.8rem; }
  .ranking-tab { padding: 6px 0; font-size: 0.65rem; letter-spacing: 1px; }
  .ranking-row { gap: 8px; padding: 8px 10px; }
  .rank-nickname { font-size: 0.8rem; }
  .rank-score { font-size: 0.8rem; }
  .rank-medal { font-size: 1rem; }
  .ranking-list { max-height: 280px; }
}

@media (max-width: 360px) {
  .daily-ranking { padding: 14px; }
  .ranking-tab { font-size: 0.6rem; border-radius: 6px; }
  .ranking-row { gap: 6px; padding: 7px 8px; }
  .rank-position { width: 24px; }
  .rank-nickname { font-size: 0.75rem; }
  .rank-score { font-size: 0.75rem; }
  .rank-me-badge { font-size: 0.5rem; padding: 1px 4px; }
}
</style>
