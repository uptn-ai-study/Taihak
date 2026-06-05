<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  submit: [nickname: string]
}>()

const input = ref('')
const touched = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

// 닉네임 규칙: 3~12자, 한글(자모 포함)/영문/숫자만 허용, 공백 불가
const nicknameRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]{3,12}$/
const charRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/

const isValid = computed(() => nicknameRegex.test(input.value))

const errorMessage = computed(() => {
  if (!touched.value || input.value.length === 0) return ''
  if (/\s/.test(input.value)) return '공백은 사용할 수 없습니다.'
  if (!charRegex.test(input.value)) return '한글, 영문, 숫자만 사용 가능합니다.'
  if (input.value.length < 3) return '최소 3자 이상 입력해주세요.'
  if (input.value.length > 12) return '최대 12자까지 가능합니다.'
  return ''
})

function handleSubmit() {
  touched.value = true
  if (isValid.value) {
    emit('submit', input.value.trim())
  }
}

// v-model 대신 DOM에서 직접 읽어 한글 IME 조합 중에도 실시간 반영
function syncInput() {
  if (inputEl.value) {
    input.value = inputEl.value.value
  }
  touched.value = true
}
</script>

<template>
  <section class="screen">
    <div class="nickname-container">
      <div class="nickname-icon">👋</div>
      <h1 class="main-title">
        처음 오셨군요!<br>
        <span class="highlight">닉네임을 만들어주세요</span>
      </h1>
      <p class="subtitle">
        게임 기록과 함께 표시될 닉네임입니다.
      </p>

      <div class="nickname-form glass-panel">
        <div class="input-group">
          <label class="input-label">닉네임</label>
          <input
            ref="inputEl"
            type="text"
            class="nickname-input"
            placeholder="3~12자 한글, 영문, 숫자"
            maxlength="12"
            :value="input"
            @input="syncInput"
            @compositionupdate="syncInput"
            @compositionend="syncInput"
            @keyup.enter="handleSubmit"
          >
          <div v-if="errorMessage" class="input-error">{{ errorMessage }}</div>
          <div class="input-hint">{{ input.length }} / 12</div>
        </div>
      </div>

      <button
        class="btn btn-primary btn-glow"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        시작하기
      </button>
    </div>
  </section>
</template>

<style scoped>
.nickname-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  margin: 0 auto;
}

.nickname-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

.nickname-form {
  width: 100%;
  padding: 25px;
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.input-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.nickname-input {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-main);
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  outline: none;
  transition: var(--transition-smooth);
}

.nickname-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 0.9rem;
}

.nickname-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
}

.input-error {
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 600;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
</style>
