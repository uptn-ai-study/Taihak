<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DAILY } from '../config/gameConfig'

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: '광고 시청 중',
})
const emit = defineEmits<{ done: []; close: [] }>()

const remaining = ref(DAILY.adTimerSec)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    remaining.value -= 1
    if (remaining.value <= 0) {
      if (timer) clearInterval(timer)
      timer = null
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function finish() {
  emit('done')
}
</script>

<template>
  <div class="ad-overlay fade-in">
    <div class="ad-box">
      <button class="ad-skip" :disabled="remaining > 0" @click="emit('close')">✕</button>
      <div class="ad-badge">AD</div>
      <div class="ad-visual">📺</div>
      <p class="ad-title">{{ props.title }}</p>
      <p class="ad-desc">가짜 광고입니다 (목업)</p>

      <button v-if="remaining > 0" class="btn-primary ad-cta" disabled>
        {{ remaining }}초 후 완료…
      </button>
      <button v-else class="btn-primary ad-cta" @click="finish">보상 받기</button>
    </div>
  </div>
</template>

<style scoped>
.ad-overlay {
  position: fixed;
  inset: 0;
  max-width: 390px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
}
.ad-box {
  position: relative;
  width: 100%;
  background: #1a1a1f;
  border-radius: var(--radius-xl);
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #fff;
}
.ad-skip {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
}
.ad-skip:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.ad-badge {
  align-self: flex-start;
  background: #facc15;
  color: #111;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.ad-visual {
  font-size: 64px;
  margin: 8px 0;
}
.ad-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.ad-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 12px;
}
.ad-cta {
  margin-top: 4px;
}
</style>
