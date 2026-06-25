<template>
  <div class="bs-overlay" @click.self="$emit('close')">
    <div class="bs-sheet" :class="{ open: isOpen }">
      <div class="bs-handle"></div>
      <div class="bs-header">
        <span class="bs-title">닉네임 설정</span>
        <button class="bs-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">랭킹과 기록에 사용할 닉네임을 입력해 주세요.</p>
        <div class="input-wrap">
          <input
            v-model="inputValue"
            class="input-field"
            type="text"
            placeholder="닉네임 (3~12자)"
            maxlength="12"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            inputmode="text"
            @keyup.enter="confirm"
            ref="inputRef"
          />
          <span class="char-count">{{ inputValue.length }}/12</span>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>
      <button class="btn-primary" @click="confirm">확인</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps<{ current: string }>()
const emit = defineEmits<{
  confirm: [nickname: string]
  close: []
}>()

const inputValue = ref(props.current)
const error = ref('')
const isOpen = ref(false)
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  nextTick(() => {
    isOpen.value = true
    setTimeout(() => inputRef.value?.focus(), 350)
  })
})

function confirm() {
  const v = inputValue.value.trim()
  if (v.length < 3) { error.value = '닉네임은 3자 이상이어야 해요.'; return }
  if (v.length > 12) { error.value = '닉네임은 12자 이하여야 해요.'; return }
  emit('confirm', v)
}
</script>

<style scoped>
.bs-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.50);
  display: flex; align-items: flex-end;
  z-index: 200;
}
.bs-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  padding: 12px 20px calc(32px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -4px 24px rgba(0,0,0,0.10);
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.32,1,.55,1);
}
.bs-sheet.open { transform: translateY(0); }
.bs-handle { width: 36px; height: 4px; background: #E5E7EB; border-radius: 2px; }
.bs-header {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%;
}
.bs-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: #111827; }
.bs-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: #F5F5F8; border: 1px solid #E5E7EB;
  font-size: 13px; color: #6B7280; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  touch-action: manipulation;
}
.modal-body { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.modal-desc { font-size: 14px; color: #6B7280; margin: 0; }
.input-wrap { position: relative; }
.input-field {
  width: 100%; height: 52px;
  padding: 0 52px 0 16px;
  background: #FFFFFF; border: 1.5px solid #E5E7EB;
  border-radius: 12px; font-size: 16px; color: #111827; outline: none;
  box-sizing: border-box;
  font-family: 'SUIT Variable', sans-serif;
  -webkit-appearance: none;
}
.input-field:focus { border: 2px solid #5F46FF; }
.input-field::placeholder { color: #9CA3AF; }
.char-count {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 12px; color: #9CA3AF; pointer-events: none;
}
.error-msg { font-size: 13px; color: #EF4444; margin: 0; }
.btn-primary {
  width: 100%; height: 56px;
  background: #5F46FF; color: #FFFFFF;
  font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: 'SUIT Variable', sans-serif;
  touch-action: manipulation;
}
.btn-primary:active { background: #4A35E0; }
</style>
