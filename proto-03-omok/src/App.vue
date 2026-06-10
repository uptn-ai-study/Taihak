<script setup lang="ts">
import { ref } from 'vue'
import ProfileSetup from './components/ProfileSetup.vue'
import GameMain from './components/GameMain.vue'

const nickname = ref(localStorage.getItem('omok_nick') ?? '')

function onStart(nick: string) {
  nickname.value = nick
}
</script>

<template>
  <ProfileSetup v-if="!nickname" @start="onStart" />
  <div v-else class="main-screen">
    <GameMain :nickname="nickname" />
  </div>
</template>
