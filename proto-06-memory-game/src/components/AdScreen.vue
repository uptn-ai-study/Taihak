<template>
  <div class="ad-screen">
    <div class="ad-header">
      <span class="ad-label">광고</span>
      <span class="stage-clear">{{ stage }}단계 클리어! 🎉</span>
      <button v-if="canSkip" class="skip-btn" @click="$emit('done')">건너뛰기</button>
      <div v-else class="skip-countdown">{{ countdown }}초</div>
    </div>

    <div class="ad-body">
      <div class="ad-card app-ad">
        <div class="app-icon">🧩</div>
        <div class="app-info">
          <p class="app-name">퍼즐마스터 프로</p>
          <p class="app-tagline">두뇌 훈련의 새로운 기준</p>
          <div class="app-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-count">4.8 · 리뷰 4.8만 개</span>
          </div>
        </div>
        <button class="cta-btn">무료 설치</button>
      </div>

      <div class="ad-banner">
        <div class="banner-bg">
          <div class="banner-content">
            <p class="banner-tag">SPECIAL OFFER</p>
            <p class="banner-title">기억력 부스터<br/>영양제 출시!</p>
            <p class="banner-sub">첫 구매 30% 할인</p>
            <button class="banner-cta">지금 확인 →</button>
          </div>
          <div class="banner-deco">🧠✨</div>
        </div>
      </div>

      <div class="ad-text-row">
        <span class="text-ad-icon">📱</span>
        <div class="text-ad-info">
          <p class="text-ad-title">두뇌트레이너 - 매일 10분</p>
          <p class="text-ad-url">braintrainer.app</p>
        </div>
        <button class="text-ad-cta">방문</button>
      </div>
    </div>

    <div class="ad-footer">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPct}%` }"></div>
      </div>
      <p class="next-hint">{{ stage + 1 }}단계로 이동합니다...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ stage: number }>()
const emit = defineEmits<{ done: [] }>()

const TOTAL = 5
const elapsed = ref(0)
const countdown = computed(() => TOTAL - elapsed.value)
const canSkip = computed(() => elapsed.value >= 3)
const progressPct = computed(() => (elapsed.value / TOTAL) * 100)

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    elapsed.value++
    if (elapsed.value >= TOTAL) {
      clearInterval(timer!)
      setTimeout(() => emit('done'), 200)
    }
  }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.ad-screen {
  min-height: 100vh;
  min-height: 100dvh;
  background: #F5F5F8;
  display: flex; flex-direction: column;
  padding: 0 16px calc(28px + env(safe-area-inset-bottom, 0px));
  gap: 14px;
}

@media (min-width: 400px) {
  .ad-screen { padding-left: 20px; padding-right: 20px; }
}

.ad-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 0 0;
  gap: 8px;
}
.ad-label {
  font-size: 11px; font-weight: 700; letter-spacing: 1px;
  color: #9CA3AF; border: 1px solid #E5E7EB;
  padding: 2px 8px; border-radius: 4px; background: #fff;
  flex-shrink: 0;
}
.stage-clear {
  font-size: clamp(13px, 4vw, 16px);
  font-weight: 700; color: #5F46FF;
  flex: 1; text-align: center;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.skip-btn {
  font-size: 13px; font-weight: 500; color: #6B7280;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  border-radius: 9999px; padding: 4px 12px; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  flex-shrink: 0; touch-action: manipulation;
}
.skip-countdown {
  font-size: 12px; color: #9CA3AF;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  border-radius: 9999px; padding: 4px 12px;
  white-space: nowrap; flex-shrink: 0;
}

.ad-body { flex: 1; display: flex; flex-direction: column; gap: 12px; }

.ad-card.app-ad {
  background: #FFFFFF; border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; align-items: center; gap: 12px;
}
.app-icon {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
}
.app-info { flex: 1; min-width: 0; }
.app-name { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 2px; }
.app-tagline { font-size: 12px; color: #6B7280; margin: 0 0 4px; }
.app-rating { display: flex; align-items: center; gap: 4px; }
.stars { color: #F59E0B; font-size: 11px; }
.rating-count { font-size: 11px; color: #9CA3AF; }
.cta-btn {
  height: 34px; padding: 0 14px;
  background: #5F46FF; color: #fff;
  font-size: 13px; font-weight: 700;
  border-radius: 9999px; border: none; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}

.ad-banner { border-radius: 16px; overflow: hidden; }
.banner-bg {
  background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
  padding: 20px 16px;
  display: flex; align-items: center; justify-content: space-between;
}
.banner-content { flex: 1; }
.banner-tag {
  font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
  color: #F59E0B; margin: 0 0 6px;
}
.banner-title {
  font-size: clamp(17px, 5vw, 20px);
  font-weight: 700; color: #FFFFFF;
  margin: 0 0 4px; line-height: 1.3;
}
.banner-sub { font-size: 12px; color: #9CA3AF; margin: 0 0 12px; }
.banner-cta {
  display: inline-block;
  background: #F59E0B; color: #111827;
  font-size: 13px; font-weight: 700;
  padding: 7px 16px; border-radius: 9999px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
.banner-deco { font-size: 40px; opacity: 0.25; flex-shrink: 0; }

.ad-text-row {
  background: #FFFFFF; border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; align-items: center; gap: 10px;
}
.text-ad-icon { font-size: 26px; flex-shrink: 0; }
.text-ad-info { flex: 1; min-width: 0; }
.text-ad-title {
  font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.text-ad-url { font-size: 12px; color: #6B7280; margin: 0; }
.text-ad-cta {
  font-size: 13px; font-weight: 600; color: #5F46FF;
  background: #EEEAFF; border: none;
  padding: 6px 14px; border-radius: 9999px; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  flex-shrink: 0; touch-action: manipulation;
}

.ad-footer { display: flex; flex-direction: column; gap: 8px; }
.progress-bar { height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden; }
.progress-fill {
  height: 100%; background: #5F46FF; border-radius: 2px;
  transition: width 0.9s linear;
}
.next-hint { font-size: 12px; color: #9CA3AF; text-align: center; margin: 0; }
</style>
