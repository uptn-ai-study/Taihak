<script setup lang="ts">
import { useStorage } from '../composables/useStorage'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; toast: [msg: string]; profileReset: [] }>()

const { nickname, totalGames, bestScore, avgScore, allRecords, clearProfile } = useStorage()
function handleClear() {
  if (confirm('프로필과 모든 도전 기록이 삭제됩니다. 정말로 초기화하시겠습니까?')) {
    clearProfile()
    emit('toast', '프로필과 전적 기록이 초기화되었습니다.')
    emit('close')
    emit('profileReset')
  }
}

function tierBadgeClass(tier: string): string {
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
  <div class="modal" :class="{ active: visible }" @click.self="$emit('close')">
    <div class="modal-content glass-panel">
      <div class="modal-header">
        <h3>내 프로필</h3>
        <button class="close-modal" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <!-- 프로필 영역 -->
        <div class="profile-section">
          <div class="profile-avatar">{{ nickname.slice(0, 1) }}</div>
          <div class="profile-name">{{ nickname }}</div>
        </div>

        <div class="stats-overview">
          <div class="stat-card">
            <span class="stat-val">{{ totalGames }}</span>
            <span class="stat-lbl">총 플레이 횟수</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">{{ bestScore.toFixed(2) }}</span>
            <span class="stat-lbl">역대 최고 점수</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">{{ avgScore.toFixed(2) }}</span>
            <span class="stat-lbl">평균 매칭 점수</span>
          </div>
        </div>
        <div class="leaderboard-section">
          <h4>전체 도전 이력 (최근 10회)</h4>
          <div class="table-container">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>일자</th>
                  <th>난이도</th>
                  <th>최종 점수</th>
                  <th>등급</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="allRecords.length === 0">
                  <td colspan="4" style="text-align: center; color: var(--text-muted);">
                    아직 도전 기록이 없습니다.
                  </td>
                </tr>
                <tr v-for="(rec, i) in allRecords" :key="i">
                  <td>{{ rec.date }}</td>
                  <td>
                    <span style="font-size:0.75rem; font-weight:800; color:var(--color-secondary);">
                      {{ rec.difficulty }}
                    </span>
                  </td>
                  <td>{{ rec.score.toFixed(2) }}</td>
                  <td>
                    <span class="rating-badge" :class="tierBadgeClass(rec.tier)"
                      style="padding:2px 8px; font-size:0.65rem;">
                      {{ rec.tier }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button class="btn btn-danger btn-sm" @click="handleClear">내 프로필 초기화</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 14px;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--text-dark);
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.profile-name {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--text-main);
}
</style>
