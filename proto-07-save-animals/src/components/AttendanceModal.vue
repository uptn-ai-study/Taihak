<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/game'
import { ATTENDANCE } from '../config/gameConfig'
import AdModal from './AdModal.vue'

const store = useGameStore()
const showAd = ref(false)
const claimed = ref(false)
const claimedAmount = ref(0)

function claim(doubled: boolean) {
  if (!store.attendance) return
  claimedAmount.value = store.attendance.baseMedals * (doubled ? ATTENDANCE.adMultiplier : 1)
  store.claimAttendance(doubled)
  claimed.value = true
}

function onAdDone() {
  showAd.value = false
  claim(true)
}
</script>

<template>
  <div v-if="store.attendance" class="bs-overlay fade-in">
    <div class="bs-sheet open att">
      <div class="bs-handle"></div>

      <template v-if="!claimed">
        <div class="att-emoji">🎁</div>
        <h2 class="t-title2">
          {{ store.attendance.streakDays }}일 연속 출석!
        </h2>
        <p class="t-body2 att-sub">매일 접속하고 위기 동물을 구해주세요</p>

        <div class="streak-dots">
          <span
            v-for="n in ATTENDANCE.specialStreak"
            :key="n"
            class="dot"
            :class="{ on: n <= store.attendance.streakDays }"
          >{{ n <= store.attendance.streakDays ? '🐾' : '·' }}</span>
        </div>

        <div v-if="store.attendance.isSpecial" class="special">
          🔥 7일 연속 달성! 다음 버전에서 <b>희귀 동물 등장 확정</b> 보너스가 열려요 (예고)
        </div>

        <div class="att-reward">
          <span class="att-reward__num">+{{ store.attendance.baseMedals }}</span>
          <span class="att-reward__label">메달</span>
        </div>

        <button class="btn-primary" @click="claim(false)">보너스 받기</button>
        <button class="btn-text att-double" @click="showAd = true">
          📺 광고 보고 2배 받기
        </button>
      </template>

      <template v-else>
        <div class="att-emoji pop">✨</div>
        <h2 class="t-title2">+{{ claimedAmount }} 메달 획득!</h2>
        <p class="t-body2 att-sub">오늘도 좋은 하루 되세요</p>
        <button class="btn-primary" @click="store.attendance = null">시작하기</button>
      </template>
    </div>
  </div>

  <AdModal v-if="showAd" title="광고 보고 2배 받기" @done="onAdDone" @close="showAd = false" />
</template>

<style scoped>
.att { text-align: center; }
.att-emoji { font-size: 56px; }
.att-emoji.pop { animation: pop 0.5s ease both; }
.att-sub { margin: -4px 0 4px; }
.streak-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  font-size: 18px;
}
.dot { opacity: 0.3; }
.dot.on { opacity: 1; }
.special {
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 12.5px;
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  width: 100%;
}
.att-reward {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 4px 0;
}
.att-reward__num {
  font-size: 40px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -1px;
}
.att-reward__label {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-2);
}
.att-double { margin-top: -4px; }
</style>
