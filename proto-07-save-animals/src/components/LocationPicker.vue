<script setup lang="ts">
// 테스트용 위치 이동 — 지형(바다/강/육지)에 따라 출현 동물이 달라지는지 확인하는 용도
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { TEST_LOCATIONS, type TestLocation } from '../config/gameConfig'

const emit = defineEmits<{ close: [] }>()
const store = useGameStore()

const open = ref(false)
onMounted(() => requestAnimationFrame(() => (open.value = true)))

function close() {
  open.value = false
  setTimeout(() => emit('close'), 260)
}

async function move(loc: TestLocation) {
  close()
  await store.setLocation({ lat: loc.lat, lng: loc.lng }, `테스트 위치: ${loc.name} (${loc.desc})`)
}

async function useMyLocation() {
  close()
  await store.initLocation()
}
</script>

<template>
  <div class="bs-overlay" @click.self="close">
    <div class="bs-sheet picker" :class="{ open }">
      <div class="bs-handle"></div>
      <div class="bs-header">
        <span class="bs-title">테스트 위치</span>
        <button class="bs-close" @click="close">✕</button>
      </div>

      <p class="picker-note">
        지형에 따라 출현하는 동물이 달라져요. 바다에선 바다 동물이, 강가에선 물 동물이 나타납니다.
      </p>

      <div class="loc-list">
        <button v-for="loc in TEST_LOCATIONS" :key="loc.id" class="loc-item" @click="move(loc)">
          <span class="loc-emoji">{{ loc.emoji }}</span>
          <span class="loc-info">
            <span class="loc-name">{{ loc.name }}</span>
            <span class="loc-desc">{{ loc.desc }}</span>
          </span>
          <span class="list-arrow">›</span>
        </button>
      </div>

      <button class="btn-gray my-loc" @click="useMyLocation">📍 내 실제 위치로 돌아가기</button>
    </div>
  </div>
</template>

<style scoped>
.picker {
  max-height: 88dvh;
  overflow-y: auto;
}
.picker-note {
  width: 100%;
  margin: 0;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 12.5px;
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-align: left;
}
.loc-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.loc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  text-align: left;
}
.loc-item:active {
  background: var(--muted-bg);
}
.loc-emoji {
  font-size: 24px;
  flex-shrink: 0;
}
.loc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.loc-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}
.loc-desc {
  font-size: 12.5px;
  color: var(--text-2);
}
.my-loc {
  width: 100%;
  flex: none;
}
</style>
