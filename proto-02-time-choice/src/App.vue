<template>
  <div class="game-shell">
    <IntroScreen    v-if="store.screen === 'intro'" />
    <CountdownScreen v-else-if="store.screen === 'countdown'" />
    <WatchScreen    v-else-if="store.screen === 'watch'" />
    <RecreateScreen v-else-if="store.screen === 'recreate'" />
    <RoundResult    v-else-if="store.screen === 'roundResult'" />
    <TotalResult    v-else-if="store.screen === 'totalResult'" />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from './stores/gameStore'
import IntroScreen from './components/IntroScreen.vue'
import CountdownScreen from './components/CountdownScreen.vue'
import WatchScreen from './components/WatchScreen.vue'
import RecreateScreen from './components/RecreateScreen.vue'
import RoundResult from './components/RoundResult.vue'
import TotalResult from './components/TotalResult.vue'

const store = useGameStore()
</script>

<style scoped>
.game-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000000;
}
</style>
