<script setup lang="ts">
import { useStorage } from '../composables/useStorage'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; toast: [msg: string] }>()

const { totalGames, bestScore, avgScore, allRecords, clearRecords } = useStorage()

function handleClear() {
  if (confirm('정말로 모든 도전 기록을 초기화하시겠습니까? 데이터는 복구할 수 없습니다.')) {
    clearRecords()
    emit('toast', '모든 전적 기록이 성공적으로 삭제되었습니다.')
    emit('close')
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
        <h3>나의 전적 &amp; 최고 기록</h3>
        <button class="close-modal" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
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
          <button class="btn btn-danger btn-sm" @click="handleClear">통계 데이터 초기화</button>
        </div>
      </div>
    </div>
  </div>
</template>
