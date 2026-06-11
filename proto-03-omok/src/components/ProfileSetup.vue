<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ start: [nickname: string] }>()

const input = ref('')
const error = ref(false)

function onStart() {
  const val = input.value.trim()
  if (val.length < 3 || val.length > 12) { error.value = true; return }
  error.value = false
  localStorage.setItem('omok_nick', val)
  emit('start', val)
}
</script>

<template>
  <div class="profile-screen">
    <div class="profile-hero">
      <span class="profile-logo">⚫</span>
      <div class="profile-title">오목 챌린지</div>
      <div class="profile-sub">20스테이지를 클리어하고<br>랭킹 1위에 도전하세요!</div>
    </div>

    <div class="profile-form">
      <label class="input-label">닉네임</label>
      <input
        v-model="input"
        class="input-field"
        type="text"
        placeholder="닉네임을 입력하세요"
        maxlength="12"
        autocomplete="off"
        @keydown.enter="onStart"
        @input="error = false"
      />
      <div v-if="error" class="input-error">닉네임은 3~12자로 입력해주세요</div>
      <div v-else class="input-hint">3~12자, 랭킹에 공개됩니다</div>
    </div>

    <button class="btn-primary" @click="onStart">게임 시작</button>
    <div class="profile-disclaimer">기존 닉네임으로 입력하면 기록이 이어집니다</div>
  </div>
</template>
