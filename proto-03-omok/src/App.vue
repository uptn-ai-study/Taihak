<script setup lang="ts">
import { ref } from 'vue'
import ProfileSetup from './components/ProfileSetup.vue'
import HomeScreen from './components/HomeScreen.vue'
import GameMain from './components/GameMain.vue'

const nickname = ref(localStorage.getItem('omok_nick') ?? '')
const screen = ref<'home' | 'game'>('home')

function onStart(nick: string) {
  nickname.value = nick
}
</script>

<template>
  <ProfileSetup v-if="!nickname" @start="onStart" />
  <div v-else class="main-screen">
    <HomeScreen v-if="screen === 'home'" :nickname="nickname" @start="screen = 'game'" />
    <GameMain v-else :nickname="nickname" @go-home="screen = 'home'" />
  </div>
</template>
