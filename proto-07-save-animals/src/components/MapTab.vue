<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useGameStore } from '../stores/game'
import { loadKakaoMaps } from '../services/kakaoMap'
import { markerHtml } from '../services/animalGraphic'
import type { SpawnedAnimal } from '../types'

const emit = defineEmits<{ select: [animal: SpawnedAnimal] }>()
const store = useGameStore()

// 카카오 SDK 는 런타임 주입이라 타입 없이 any 로 취급
const mapEl = ref<HTMLElement | null>(null)
const mapError = ref(false)
let kakao: any = null
let map: any = null
let userOverlay: any = null
const animalOverlays = new Map<string, any>()

const MAP_LEVEL = 6 // 카카오 확대 레벨 (숫자↑ = 더 넓게, 반경 3km 커버)

async function initMap() {
  if (!store.location || !mapEl.value || map) return
  const { lat, lng } = store.location

  try {
    kakao = await loadKakaoMaps()
  } catch (e) {
    console.error(e)
    mapError.value = true
    return
  }
  // 로드 대기 중 언마운트/중복 방지
  if (!mapEl.value || map) return

  map = new kakao.maps.Map(mapEl.value, {
    center: new kakao.maps.LatLng(lat, lng),
    level: MAP_LEVEL,
  })

  // 내 위치 마커
  const userContent = document.createElement('div')
  userContent.innerHTML = '<div class="user-marker"><div class="user-marker__dot"></div></div>'
  userOverlay = new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(lat, lng),
    content: userContent,
    xAnchor: 0.5,
    yAnchor: 0.5,
    zIndex: 1,
  })
  userOverlay.setMap(map)

  renderAnimals()
}

function renderAnimals() {
  if (!map || !kakao) return
  const visible = store.visibleAnimals
  const visibleIds = new Set(visible.map((a) => a.id))

  // 제거된(구조 처리된) 마커 삭제
  for (const [id, overlay] of animalOverlays) {
    if (!visibleIds.has(id)) {
      overlay.setMap(null)
      animalOverlays.delete(id)
    }
  }

  // 신규 마커 추가
  for (const animal of visible) {
    if (animalOverlays.has(animal.id)) continue
    const el = document.createElement('div')
    el.className = 'animal-marker-wrap'
    el.style.cursor = 'pointer'
    el.innerHTML = markerHtml(animal.speciesId, animal.grade)
    el.addEventListener('click', () => emit('select', animal))

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(animal.lat, animal.lng),
      content: el,
      xAnchor: 0.5,
      yAnchor: 1,
      zIndex: 2,
      clickable: true,
    })
    overlay.setMap(map)
    animalOverlays.set(animal.id, overlay)
  }
}

function recenter() {
  if (map && kakao && store.location) {
    map.setLevel(MAP_LEVEL)
    map.panTo(new kakao.maps.LatLng(store.location.lat, store.location.lng))
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
  for (const overlay of animalOverlays.values()) overlay.setMap(null)
  animalOverlays.clear()
  userOverlay?.setMap(null)
  map = null
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

    <!-- 지도 로드 실패 (예: 카카오 도메인 미등록) -->
    <div v-if="mapError" class="map-error">
      <div class="empty-icon">🗺️</div>
      <p class="empty-text">지도를 불러오지 못했어요</p>
      <p class="empty-sub">잠시 후 다시 시도해주세요</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="store.locationLoading" class="map-loading">
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
.map-empty,
.map-error {
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
/* 모두 구조 완료 — 지도 위 10% 투명 레이어 + 그 위에 안내 문구 */
.map-empty {
  inset: 0;
  background: rgba(0, 0, 0, 0.10);
  pointer-events: none;
}
.map-empty .empty-icon {
  opacity: 0.9;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}
.map-empty .empty-text {
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
}
.map-empty .empty-sub {
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
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
