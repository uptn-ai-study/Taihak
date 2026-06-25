<template>
  <div class="home">
    <header class="home-header">
      <div class="logo">🧠</div>
      <h1 class="game-title">기억력 테스트</h1>
      <p class="game-desc">같은 그림 카드를 찾아 모두 매칭하세요!<br/>제한 시간 30초 안에 클리어하면 다음 단계로!</p>
    </header>

    <div class="nickname-row">
      <span class="nickname-label">내 닉네임</span>
      <button class="nickname-btn" @click="$emit('editNickname')">
        <span class="nickname-value">{{ nickname }}</span>
        <span class="edit-icon">✏️</span>
      </button>
    </div>

    <button class="btn-primary start-btn" @click="$emit('startGame')">
      게임 시작하기
    </button>

    <section class="section">
      <div class="section-header">
        <h2 class="section-title">내 기록</h2>
        <span v-if="sortedMyRecords.length > 0" class="section-sub best-chip">
          최고 {{ sortedMyRecords[0].stage }}단계
        </span>
      </div>
      <div v-if="myRecords.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <span class="empty-text">아직 기록이 없어요</span>
      </div>
      <div v-else class="record-list">
        <div v-for="(rec, i) in sortedMyRecords.slice(0, 10)" :key="i" class="record-item">
          <div class="record-rank">
            <span v-if="i === 0" class="rank-badge best">BEST</span>
            <span v-else class="rank-num">{{ i + 1 }}</span>
          </div>
          <div class="record-info">
            <span class="record-stage">{{ rec.stage }}단계까지 클리어</span>
            <span class="record-date">{{ formatDate(rec.achievedAt) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2 class="section-title">전체 랭킹</h2>
        <div class="tab-bar">
          <button class="tab-item" :class="{ active: rankTab === 'all' }" @click="rankTab = 'all'">전체</button>
          <button class="tab-item" :class="{ active: rankTab === 'today' }" @click="rankTab = 'today'">오늘</button>
        </div>
      </div>
      <div v-if="loadingRanking" class="empty-state">
        <span class="empty-text">불러오는 중...</span>
      </div>
      <div v-else-if="displayedRanking.length === 0" class="empty-state">
        <span class="empty-icon">🏆</span>
        <span class="empty-text">아직 랭킹이 없어요</span>
      </div>
      <div v-else class="record-list">
        <div v-for="(entry, i) in displayedRanking" :key="entry.id" class="record-item"
          :class="{ mine: entry.nickname === nickname }">
          <div class="record-rank">
            <span v-if="i === 0" class="rank-badge gold">1위</span>
            <span v-else-if="i === 1" class="rank-badge silver">2위</span>
            <span v-else-if="i === 2" class="rank-badge bronze">3위</span>
            <span v-else class="rank-num">{{ i + 1 }}</span>
          </div>
          <div class="record-info">
            <span class="record-nickname">{{ entry.nickname }}</span>
            <span class="record-stage">{{ entry.stage }}단계</span>
            <span class="record-date">{{ formatDate(entry.achieved_at) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { LocalRecord, RankingEntry } from '../types'
import { fetchAllTimeRanking, fetchTodayRanking } from '../lib/supabase'
import { formatDate } from '../lib/gameLogic'

const props = defineProps<{
  nickname: string
  myRecords: LocalRecord[]
}>()

defineEmits<{
  startGame: []
  editNickname: []
}>()

const rankTab = ref<'all' | 'today'>('all')
const allRanking = ref<RankingEntry[]>([])
const todayRanking = ref<RankingEntry[]>([])
const loadingRanking = ref(false)

const sortedMyRecords = computed(() =>
  [...props.myRecords].sort((a, b) => b.stage - a.stage)
)

const displayedRanking = computed(() =>
  rankTab.value === 'all' ? allRanking.value : todayRanking.value
)

onMounted(async () => {
  loadingRanking.value = true
  const [all, today] = await Promise.all([fetchAllTimeRanking(), fetchTodayRanking()])
  allRanking.value = all
  todayRanking.value = today
  loadingRanking.value = false
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  min-height: 100dvh;
  background: #F5F5F8;
  padding: 0 16px calc(32px + env(safe-area-inset-bottom, 0px));
  display: flex; flex-direction: column; gap: 16px;
}

@media (min-width: 400px) {
  .home { padding-left: 20px; padding-right: 20px; }
}

.home-header {
  text-align: center;
  padding: 40px 0 4px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.logo { font-size: 52px; }
.game-title {
  font-size: clamp(22px, 6vw, 28px);
  font-weight: 700; letter-spacing: -0.3px;
  color: #111827; margin: 0;
}
.game-desc {
  font-size: clamp(13px, 3.5vw, 14px);
  color: #6B7280; margin: 0; line-height: 1.6;
}

.nickname-row {
  display: flex; align-items: center; justify-content: space-between;
  background: #FFFFFF; border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.nickname-label { font-size: 14px; color: #6B7280; }
.nickname-btn {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; padding: 0;
  touch-action: manipulation;
}
.nickname-value { font-size: 15px; font-weight: 700; color: #5F46FF; }
.edit-icon { font-size: 14px; }

.btn-primary {
  width: 100%; height: 56px;
  background: #5F46FF; color: #FFFFFF;
  font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
.btn-primary:active { background: #4A35E0; }
.start-btn { flex-shrink: 0; }

.section {
  background: #FFFFFF; border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 14px;
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
}
.section-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
.section-sub { font-size: 12px; color: #9CA3AF; }
.best-chip {
  background: #EEEAFF; color: #5F46FF;
  font-size: 12px; font-weight: 700;
  padding: 3px 10px; border-radius: 9999px;
}

.tab-bar { display: flex; gap: 4px; }
.tab-item {
  padding: 4px 12px; height: 30px;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  border-radius: 9999px; font-size: 13px; font-weight: 500;
  color: #6B7280; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
.tab-item.active {
  background: #5F46FF; color: #FFFFFF; border-color: #5F46FF;
  font-weight: 700;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 20px 0; gap: 8px;
}
.empty-icon { font-size: 32px; opacity: .35; }
.empty-text { font-size: 14px; color: #9CA3AF; }

.record-list { display: flex; flex-direction: column; gap: 8px; }
.record-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: #F5F5F8; border-radius: 10px;
}
.record-item.mine { background: #EEEAFF; }

.record-rank { width: 38px; flex-shrink: 0; display: flex; justify-content: center; }
.rank-badge {
  font-size: 10px; font-weight: 700;
  padding: 3px 7px; border-radius: 6px; color: #fff;
}
.rank-badge.best   { background: #5F46FF; }
.rank-badge.gold   { background: #F59E0B; }
.rank-badge.silver { background: #9CA3AF; }
.rank-badge.bronze { background: #CD7C2F; }
.rank-num { font-size: 14px; font-weight: 700; color: #6B7280; }

.record-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.record-nickname {
  font-size: 14px; font-weight: 600; color: #111827;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.record-stage { font-size: 14px; font-weight: 700; color: #5F46FF; }
.record-date { font-size: 11px; color: #9CA3AF; }
</style>
