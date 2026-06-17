<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AssetSearchInput from './components/AssetSearchInput.vue'
import ResultCard from './components/ResultCard.vue'
import { calculateReturn } from './composables/useAssetPrice'
import type { AssetType, AssetOption, CalculationResult } from './types'

const ASSET_TYPES: { value: AssetType; label: string; icon: string; iconType: 'img' | 'svg' }[] = [
  { value: 'us-stock', label: '미국 주식', icon: 'https://flagcdn.com/us.svg', iconType: 'img' },
  { value: 'kr-stock', label: '한국 주식', icon: 'https://flagcdn.com/kr.svg', iconType: 'img' },
  {
    value: 'crypto', label: '가상 자산', iconType: 'svg',
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#F7931A"/><path d="M16.5 10.2c.2-1.4-.8-2.1-2.2-2.6l.5-1.8-1.1-.3-.4 1.7-1-.2.4-1.8-1.1-.3-.5 1.8-2.6-.6-.3 1.2s.8.2.8.2c.5.1.6.4.5.7l-1.2 4.8c-.1.2-.3.5-.7.4 0 0-.8-.2-.8-.2L7 14.9l2.5.6-.5 1.9 1.1.3.5-1.9.9.2-.5 1.9 1.1.3.5-1.9c2 .4 3.5.2 4.1-1.6.5-1.4-.1-2.2-1-2.7.7-.2 1.2-.7 1.3-1.8zm-2.4 3.4c-.4 1.4-2.9.6-3.7.5l.7-2.6c.8.2 3.4.6 3 2.1zm.4-3.4c-.3 1.3-2.4.6-3.1.5l.6-2.4c.7.2 3 .6 2.5 1.9z" fill="white"/></svg>`,
  },
]

const assetType = ref<AssetType>('us-stock')
const selectedAsset = ref<AssetOption | null>(null)
const buyDate = ref('2020-01-01')
const buyAmountRaw = ref(10000000)
const buyAmount = computed({
  get: () => buyAmountRaw.value > 0 ? buyAmountRaw.value.toLocaleString('ko-KR') : '',
  set: (v: string) => {
    const n = Number(v.replace(/[^0-9]/g, ''))
    buyAmountRaw.value = isNaN(n) ? 0 : n
  },
})
const loading = ref(false)
const error = ref('')
const result = ref<CalculationResult | null>(null)

watch(assetType, () => { selectedAsset.value = null })

const maxDate = new Date().toISOString().split('T')[0]

async function calculate() {
  if (!selectedAsset.value || !buyDate.value || buyAmountRaw.value <= 0) return
  loading.value = true
  error.value = ''
  try {
    result.value = await calculateReturn(selectedAsset.value, buyDate.value, buyAmountRaw.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '데이터를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value = null
  error.value = ''
  buyDate.value = '2020-01-01'
  buyAmountRaw.value = 10000000
  selectedAsset.value = null
}

const canSubmit = () => selectedAsset.value && buyDate.value && buyAmountRaw.value > 0
</script>

<template>
  <div class="app">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-inner">
        <div class="header-top">
          <div>
            <p class="header-greeting">투자 수익률 계산기</p>
            <h1 class="header-title">껄껄껄 <span class="emoji">😅</span></h1>
          </div>
          <div class="header-badge">그때 샀더라면</div>
        </div>
      </div>
    </header>

    <!-- 결과 화면 -->
    <div v-if="result" class="content">
      <ResultCard :result="result" @reset="reset" />
    </div>

    <!-- 입력 화면 -->
    <div v-else class="content">
      <div class="form-grid">

        <!-- 자산 종류 선택 -->
        <div class="form-card form-card--type">
          <p class="form-label">자산 종류</p>
          <div class="type-chips">
            <button
              v-for="t in ASSET_TYPES"
              :key="t.value"
              class="type-chip"
              :class="{ active: assetType === t.value }"
              @click="assetType = t.value"
            >
              <img v-if="t.iconType === 'img'" :src="t.icon" class="chip-flag" alt="" />
              <span v-else class="chip-svg" v-html="t.icon" />
              <span class="chip-label">{{ t.label }}</span>
            </button>
          </div>
        </div>

        <!-- 자산 이름 -->
        <div class="form-card form-card--search">
          <p class="form-label">자산 이름</p>
          <AssetSearchInput v-model="selectedAsset" :assetType="assetType" />
        </div>

        <!-- 매수 시점 + 금액 -->
        <div class="form-card form-card--datetime">
          <div class="row-fields">
            <div class="field">
              <p class="form-label">매수 시점</p>
              <input
                v-model="buyDate"
                type="date"
                class="input-field date-input"
                :max="maxDate"
                min="2000-01-01"
              />
            </div>
            <div class="field">
              <p class="form-label">매수 금액</p>
              <div class="input-wrap">
                <input
                  v-model="buyAmount"
                  type="text"
                  inputmode="numeric"
                  class="input-field"
                  placeholder="10,000,000"
                />
                <span class="currency-badge">{{ assetType === 'kr-stock' ? '원' : '$' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 에러 + 계산 버튼 -->
        <div class="form-footer">
          <div v-if="error" class="error-msg">
            <span class="error-icon">⚠️</span>{{ error }}
          </div>
          <button
            class="btn-primary"
            :disabled="!canSubmit() || loading"
            @click="calculate"
          >
            <span v-if="loading" class="loading-inner">
              <span class="spinner" />계산 중...
            </span>
            <span v-else>수익률 계산하기</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ══════════════════════════════════════
   앱 컨테이너
══════════════════════════════════════ */
.app {
  min-height: 100dvh;
  display: flex; flex-direction: column;
  background: var(--muted-bg);
}

/* tablet+: 중앙 카드형 */
@media (min-width: 640px) {
  .app {
    max-width: 600px;
    margin: 0 auto;
    min-height: 100dvh;
    box-shadow: 0 0 60px rgba(15,23,41,0.15);
  }
}

/* desktop: 더 넓은 단일 컬럼 */
@media (min-width: 1024px) {
  .app {
    max-width: 760px;
  }
}

/* ══════════════════════════════════════
   헤더
══════════════════════════════════════ */
.header {
  background: linear-gradient(135deg, var(--dark-card-from) 0%, var(--dark-card-mid) 50%, var(--dark-card-to) 100%);
  padding: 48px 24px 32px;
  position: relative; overflow: hidden;
}
.header::before {
  content: '';
  position: absolute; top: -60px; right: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
}
.header::after {
  content: '';
  position: absolute; bottom: -30px; left: -20px;
  width: 140px; height: 140px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.header-inner { position: relative; z-index: 1; }
.header-top { display: flex; align-items: flex-start; justify-content: space-between; }
.header-greeting { font-size: 13px; color: rgba(255,255,255,0.6); letter-spacing: 0.5px; margin-bottom: 6px; }
.header-title { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
.emoji { font-size: 28px; }
.header-badge {
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.9);
  font-size: 11px; font-weight: 600; padding: 6px 12px;
  border-radius: 20px; white-space: nowrap; letter-spacing: 0.3px;
}

@media (min-width: 1024px) {
  .header { padding: 56px 40px 40px; }
  .header-greeting { font-size: 14px; }
  .header-title { font-size: 40px; }
}

/* ══════════════════════════════════════
   콘텐츠 영역
══════════════════════════════════════ */
.content {
  flex: 1;
  padding: 16px;
}

@media (min-width: 640px) {
  .content { padding: 20px; }
}

@media (min-width: 1024px) {
  .content { padding: 28px 32px 32px; }
}

/* ══════════════════════════════════════
   폼 그리드
══════════════════════════════════════ */
.form-grid {
  display: flex; flex-direction: column; gap: 12px;
}

/* desktop: 2컬럼 그리드 */
@media (min-width: 1024px) {
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 16px;
  }
  .form-card--type     { grid-column: 1; grid-row: 1; }
  .form-card--search   { grid-column: 2; grid-row: 1; }
  .form-card--datetime { grid-column: 1 / -1; grid-row: 2; }
  .form-footer         { grid-column: 1 / -1; grid-row: 3; }
}

/* ══════════════════════════════════════
   폼 카드
══════════════════════════════════════ */
.form-card {
  background: #fff; border-radius: 20px;
  padding: 20px; box-shadow: 0 2px 16px rgba(15,23,41,0.06);
  display: flex; flex-direction: column; gap: 12px;
}
.form-footer { display: flex; flex-direction: column; gap: 10px; }
.form-label {
  font-size: 12px; font-weight: 700;
  color: var(--text-3); letter-spacing: 0.8px; text-transform: uppercase;
}

@media (min-width: 1024px) {
  .form-card { padding: 24px; border-radius: 24px; }
}

/* ══════════════════════════════════════
   자산 종류 칩
══════════════════════════════════════ */
.type-chips { display: flex; gap: 8px; }
.type-chip {
  flex: 1; height: 64px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  background: var(--muted-bg); border: 2px solid transparent;
  border-radius: 14px; cursor: pointer; font-family: inherit;
  transition: all 0.18s ease;
}
.chip-flag { width: 26px; height: 19px; border-radius: 3px; object-fit: cover; }
.chip-svg { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.chip-svg :deep(svg) { width: 26px; height: 26px; }
.chip-label { font-size: 10px; font-weight: 700; color: var(--text-2); letter-spacing: -0.1px; }
.type-chip.active { background: var(--primary-200); border-color: var(--primary); }
.type-chip.active .chip-label { color: var(--primary); }

@media (min-width: 1024px) {
  .type-chip { height: 72px; border-radius: 16px; }
  .chip-label { font-size: 11px; }
}

/* ══════════════════════════════════════
   입력 필드
══════════════════════════════════════ */
.row-fields { display: flex; gap: 12px; }
.field { flex: 1; display: flex; flex-direction: column; gap: 8px; }

.input-field {
  width: 100%; height: 48px; padding: 0 14px;
  background: var(--muted-bg); border: 2px solid transparent;
  border-radius: 12px; font-size: 14px; font-weight: 600;
  color: var(--text-1); outline: none; font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.input-field:focus { border-color: var(--primary); background: #fff; }
.date-input { cursor: pointer; }

.input-wrap { position: relative; }
.input-wrap .input-field { padding-right: 36px; }
.currency-badge {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  font-size: 12px; font-weight: 700; color: var(--text-3);
}

@media (min-width: 1024px) {
  .input-field { height: 52px; font-size: 15px; border-radius: 14px; }
  .row-fields { gap: 16px; }
}

/* ══════════════════════════════════════
   에러
══════════════════════════════════════ */
.error-msg {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 500; color: var(--error);
  background: rgba(255,92,92,0.08); padding: 12px 16px;
  border-radius: 12px; border-left: 3px solid var(--error);
}
.error-icon { font-size: 15px; }

/* ══════════════════════════════════════
   CTA 버튼
══════════════════════════════════════ */
.btn-primary {
  width: 100%; height: 56px;
  background: linear-gradient(135deg, #6B56FF 0%, var(--primary) 100%);
  color: #fff; font-size: 16px; font-weight: 700; letter-spacing: -0.2px;
  border-radius: 16px; border: none; cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 24px rgba(95,70,255,0.35);
  transition: opacity 0.15s, transform 0.15s;
}
.btn-primary:active:not(:disabled) { opacity: 0.9; transform: scale(0.99); }
.btn-primary:disabled { background: var(--border); box-shadow: none; cursor: not-allowed; color: var(--text-3); }

@media (min-width: 1024px) {
  .btn-primary { height: 60px; font-size: 17px; border-radius: 18px; }
}

.loading-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
