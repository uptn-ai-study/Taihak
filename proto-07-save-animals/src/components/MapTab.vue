<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import { useGameStore } from '../stores/game'
import { markerHtml } from '../services/animalGraphic'
import type { SpawnedAnimal } from '../types'

const emit = defineEmits<{ select: [animal: SpawnedAnimal] }>()
const store = useGameStore()

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let userMarker: L.Marker | null = null
const animalMarkers = new Map<string, L.Marker>()

function initMap() {
  if (!store.location || !mapEl.value || map) return
  const { lat, lng } = store.location

  map = L.map(mapEl.value, {
    center: [lat, lng],
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  // 내 위치 마커
  const userIcon = L.divIcon({
    className: 'user-marker-wrap',
    html: '<div class="user-marker"><div class="user-marker__dot"></div></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
  userMarker = L.marker([lat, lng], { icon: userIcon, interactive: false }).addTo(map)

  renderAnimals()
}

function renderAnimals() {
  if (!map) return
  const visible = store.visibleAnimals
  const visibleIds = new Set(visible.map((a) => a.id))

  // 제거된(구조 처리된) 마커 삭제
  for (const [id, marker] of animalMarkers) {
    if (!visibleIds.has(id)) {
      marker.remove()
      animalMarkers.delete(id)
    }
  }

  // 신규 마커 추가
  for (const animal of visible) {
    if (animalMarkers.has(animal.id)) continue
    const icon = L.divIcon({
      className: 'animal-marker-wrap',
      html: markerHtml(animal.speciesId, animal.grade),
      iconSize: [44, 52],
      iconAnchor: [22, 48],
    })
    const marker = L.marker([animal.lat, animal.lng], { icon }).addTo(map)
    marker.on('click', () => emit('select', animal))
    animalMarkers.set(animal.id, marker)
  }
}

function recenter() {
  if (map && store.location) {
    map.setView([store.location.lat, store.location.lng], 15, { animate: true })
  }
}

// 위치 준비되면 지도 초기화
watch(
  () => store.location,
  async () => {
    await nextTick()
    initMap()
  },
)

// 지도가 남은 마커에 반응
watch(() => store.visibleAnimals, renderAnimals)

onMounted(async () => {
  await nextTick()
  initMap()
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
  animalMarkers.clear()
})
</script>

<template>
  <div class="map-tab">
    <!-- 상단 HUD -->
    <div class="hud">
      <div class="hud-item">
        <span class="hud-label">무료 구조</span>
        <span class="hud-value">{{ store.freeRemaining }}<small>/5</small></span>
      </div>
      <div class="hud-divider"></div>
      <div class="hud-item">
        <span class="hud-label">보유 메달</span>
        <span class="hud-value">🏅 {{ store.totalMedals }}</span>
      </div>
      <div class="hud-divider"></div>
      <div class="hud-item">
        <span class="hud-label">연속 출석</span>
        <span class="hud-value">🔥 {{ store.streakDays }}</span>
      </div>
    </div>

    <!-- 위치 안내 (기본값 폴백 시) -->
    <div v-if="store.locationMessage" class="loc-banner">📍 {{ store.locationMessage }}</div>

    <!-- 지도 -->
    <div ref="mapEl" class="map-canvas"></div>

    <!-- 로딩 상태 -->
    <div v-if="store.locationLoading" class="map-loading">
      <div class="spinner"></div>
      <p class="t-body2">내 주변 위기 동물을 찾는 중…</p>
    </div>

    <!-- 빈 상태 (모두 구조 완료) -->
    <div v-else-if="store.visibleAnimals.length === 0" class="map-empty">
      <div class="empty-icon">🐾</div>
      <p class="empty-text">이 지역 동물을 모두 만났어요</p>
      <p class="empty-sub">30분마다 새로운 친구들이 나타나요</p>
    </div>

    <!-- 내 위치 버튼 -->
    <button class="fab recenter" @click="recenter" aria-label="내 위치">📍</button>
  </div>
</template>

<style scoped>
.map-tab {
  position: absolute;
  inset: 0;
  bottom: calc(60px + env(safe-area-inset-bottom));
  overflow: hidden;
}
.map-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #E5E3DC;
}
.hud {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top));
  left: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2);
  padding: 10px 8px;
  backdrop-filter: blur(6px);
}
.hud-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.hud-label {
  font-size: 11px;
  color: var(--text-3);
}
.hud-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.3px;
}
.hud-value small {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
}
.hud-divider {
  width: 1px;
  height: 26px;
  background: var(--border);
}
.loc-banner {
  position: absolute;
  top: calc(74px + env(safe-area-inset-top));
  left: 12px;
  right: 12px;
  z-index: 20;
  background: #FEF3C7;
  color: #92400E;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-1);
}
.map-loading,
.map-empty {
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(245, 245, 248, 0.9);
}
.map-empty {
  background: none;
  pointer-events: none;
  top: 40%;
  bottom: auto;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--primary-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.recenter {
  position: absolute;
  right: 16px;
  bottom: 20px;
  z-index: 20;
  font-size: 20px;
  color: #fff;
}
</style>
