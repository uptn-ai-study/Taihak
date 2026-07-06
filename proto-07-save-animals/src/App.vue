<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from './stores/game'
import BottomNav, { type TabKey } from './components/BottomNav.vue'
import MapTab from './components/MapTab.vue'
import AlbumTab from './components/AlbumTab.vue'
import RewardTab from './components/RewardTab.vue'
import RescueSheet from './components/RescueSheet.vue'
import AttendanceModal from './components/AttendanceModal.vue'
import type { SpawnedAnimal } from './types'

const store = useGameStore()
const tab = ref<TabKey>('map')
const selectedAnimal = ref<SpawnedAnimal | null>(null)

onMounted(() => {
  store.rolloverDate()
  store.checkAttendance()
  store.initLocation()
})

function onSelect(animal: SpawnedAnimal) {
  selectedAnimal.value = animal
}
function closeSheet() {
  selectedAnimal.value = null
}
</script>

<template>
  <div class="app-shell">
    <!-- 탭 콘텐츠 (지도는 Leaflet 상태 유지를 위해 v-show) -->
    <MapTab v-show="tab === 'map'" @select="onSelect" />
    <AlbumTab v-if="tab === 'album'" />
    <RewardTab v-if="tab === 'reward'" />

    <BottomNav :active="tab" @change="tab = $event" />

    <!-- 구조 바텀시트 -->
    <RescueSheet v-if="selectedAnimal" :animal="selectedAnimal" @close="closeSheet" />

    <!-- 출석 보너스 모달 -->
    <AttendanceModal />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
</style>
