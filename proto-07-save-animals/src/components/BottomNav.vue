<script setup lang="ts">
export type TabKey = 'map' | 'album' | 'reward'

defineProps<{ active: TabKey }>()
const emit = defineEmits<{ change: [tab: TabKey] }>()

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'map', label: '지도', icon: '🗺️' },
  { key: 'album', label: '앨범', icon: '📖' },
  { key: 'reward', label: '보상', icon: '🎁' },
]
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="nav-item"
      :class="{ active: active === t.key }"
      @click="emit('change', t.key)"
    >
      <span class="nav-icon">{{ t.icon }}</span>
      <span class="nav-label">{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  background: #fff;
  border-top: 1px solid var(--border);
  z-index: 100;
}
.nav-item {
  flex: 1;
  border: none;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  color: var(--text-3);
}
.nav-icon {
  font-size: 22px;
  filter: grayscale(1);
  opacity: 0.5;
}
.nav-label {
  font-size: 11px;
  font-weight: 500;
}
.nav-item.active .nav-icon {
  filter: none;
  opacity: 1;
}
.nav-item.active .nav-label {
  color: var(--primary);
  font-weight: 700;
}
</style>
