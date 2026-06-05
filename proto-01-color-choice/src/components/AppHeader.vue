<script setup lang="ts">
defineEmits<{
  goHome: []
  openStats: []
}>()
</script>

<template>
  <header class="app-header">
    <div class="logo" @click="$emit('goHome')" title="홈 화면으로 이동">
      <span class="logo-accent">COLOR</span>
      <span class="logo-separator">//</span>
      <span class="logo-main">SENSE CHALLENGE</span>
    </div>
    <div class="header-actions">
      <button class="icon-button" title="통계 보기" @click="$emit('openStats')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </button>
    </div>
  </header>
</template>
