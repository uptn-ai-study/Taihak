<script setup lang="ts">
import { computed } from 'vue'
import type { CalculationResult } from '../types'

const props = defineProps<{ result: CalculationResult }>()
const emit = defineEmits<{ reset: [] }>()

const rate = computed(() => props.result.returnRate)
const isProfit = computed(() => rate.value >= 0)

const reaction = computed(() => {
  if (rate.value >= 200) return { emoji: '🚀', label: '전설이다 전설!', sub: '대박 중의 대박' }
  if (rate.value >= 100) return { emoji: '🤑', label: '두 배 달성!', sub: '원금을 넘어섰어요' }
  if (rate.value >= 50)  return { emoji: '🎉', label: '대박났다!', sub: '훌륭한 투자였어요' }
  if (rate.value >= 20)  return { emoji: '😊', label: '잘 됐네요!', sub: '좋은 선택이었어요' }
  if (rate.value >= 5)   return { emoji: '🙂', label: '나쁘지 않아요', sub: '소소한 수익이에요' }
  if (rate.value >= 0)   return { emoji: '😐', label: '본전은 했어요', sub: '잃지 않았으니 다행' }
  if (rate.value >= -10) return { emoji: '😅', label: '조금 아쉽네요', sub: '다음엔 더 잘 될 거예요' }
  if (rate.value >= -30) return { emoji: '😢', label: '많이 아프네요', sub: '시간이 해결해줄 거예요' }
  if (rate.value >= -50) return { emoji: '😭', label: '힘드셨겠어요', sub: '투자는 인생이에요' }
  return { emoji: '💀', label: '껄껄껄...', sub: '잊어버리는 게 나을지도' }
})

function fmt(n: number, currency: string) {
  if (currency === 'KRW') return n.toLocaleString('ko-KR') + '원'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtRate(r: number) {
  return (r >= 0 ? '+' : '') + r.toFixed(2) + '%'
}
function formatDate(d: string) {
  return d.replace(/-/g, '.')
}
</script>

<template>
  <div class="result-wrap">

    <!-- 히어로 카드 (다크 그라디언트) -->
    <div class="hero-card" :class="isProfit ? 'hero-profit' : 'hero-loss'">
      <div class="hero-deco" />
      <div class="hero-deco2" />
      <div class="hero-inner hero-inner--grow">
        <div class="hero-top">
          <span class="hero-asset-name">{{ result.asset.name }}</span>
          <span class="hero-date">{{ formatDate(result.buyDate) }}</span>
        </div>
        <div class="hero-rate">{{ fmtRate(rate) }}</div>
        <div class="hero-amounts">
          <div class="hero-amount-item">
            <span class="hero-amount-label">매수 금액</span>
            <span class="hero-amount-value">{{ fmt(result.buyAmount, result.currency) }}</span>
          </div>
          <div class="hero-amount-divider" />
          <div class="hero-amount-item">
            <span class="hero-amount-label">현재 평가</span>
            <span class="hero-amount-value highlight">{{ fmt(result.currentAmount, result.currency) }}</span>
          </div>
        </div>
      </div>
      <!-- 수익 곡선 장식 -->
      <svg class="hero-wave" viewBox="0 0 320 60" fill="none" preserveAspectRatio="none">
        <path d="M0 40 Q40 10 80 30 Q120 50 160 25 Q200 0 240 20 Q280 40 320 15 L320 60 L0 60 Z"
              fill="rgba(255,255,255,0.06)" />
        <path d="M0 45 Q60 20 120 38 Q180 55 240 30 Q280 15 320 28"
              stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none" />
      </svg>
    </div>

    <!-- 반응 배너 -->
    <div class="reaction-card">
      <span class="reaction-emoji">{{ reaction.emoji }}</span>
      <div class="reaction-text">
        <span class="reaction-label">{{ reaction.label }}</span>
        <span class="reaction-sub">{{ reaction.sub }}</span>
      </div>
      <div class="reaction-badge" :class="isProfit ? 'badge-profit' : 'badge-loss'">
        {{ isProfit ? '수익' : '손실' }}
      </div>
    </div>

    <!-- 상세 정보 카드 -->
    <div class="info-card">
      <p class="info-card-title">상세 내역</p>
      <div class="info-list">
        <div class="info-row">
          <span class="info-label">매수 당시 가격</span>
          <span class="info-value">{{ fmt(result.buyPrice, result.currency) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">현재 가격</span>
          <span class="info-value">{{ fmt(result.currentPrice, result.currency) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">손익 금액</span>
          <span class="info-value" :class="isProfit ? 'text-profit' : 'text-loss'">
            {{ isProfit ? '+' : '' }}{{ fmt(result.currentAmount - result.buyAmount, result.currency) }}
          </span>
        </div>
        <div class="info-row info-row-highlight">
          <span class="info-label">수익률</span>
          <span class="info-value info-rate" :class="isProfit ? 'text-profit' : 'text-loss'">
            {{ fmtRate(rate) }}
          </span>
        </div>
      </div>
    </div>

    <button class="btn-reset" @click="emit('reset')">
      ← 다시 계산하기
    </button>
  </div>
</template>

<style scoped>
.result-wrap { display: flex; flex-direction: column; gap: 12px; padding-bottom: 32px; }

@media (min-width: 1024px) {
  .result-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 16px;
    padding-bottom: 0;
    align-items: start;
  }
  .hero-card     { grid-column: 1; grid-row: 1 / 4; align-self: stretch; }
  .reaction-card { grid-column: 2; grid-row: 1; }
  .info-card     { grid-column: 2; grid-row: 2; }
  .btn-reset     { grid-column: 2; grid-row: 3; }
}

/* ── 히어로 카드 ── */
.hero-card {
  border-radius: 24px;
  padding: 28px 24px 0;
  position: relative; overflow: hidden;
  min-height: 200px;
  display: flex; flex-direction: column;
}
.hero-inner--grow { flex: 1; }
.hero-profit {
  background: linear-gradient(135deg, #1A1F5E 0%, #2D1F7A 50%, #3D2D8A 100%);
}
.hero-loss {
  background: linear-gradient(135deg, #2D0A0A 0%, #5C1A1A 50%, #7A2020 100%);
}
.hero-deco {
  position: absolute; top: -50px; right: -30px;
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
}
.hero-deco2 {
  position: absolute; bottom: 20px; left: -40px;
  width: 120px; height: 120px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.hero-inner { position: relative; z-index: 1; }
.hero-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.hero-asset-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); }
.hero-date { font-size: 12px; color: rgba(255,255,255,0.4); }
.hero-rate {
  font-size: 48px; font-weight: 800; color: #fff;
  letter-spacing: -2px; line-height: 1.1; margin-bottom: 24px;
}
.hero-amounts {
  display: flex; align-items: center; gap: 0;
  background: rgba(255,255,255,0.08);
  border-radius: 14px; padding: 14px 18px;
  margin-bottom: 0;
}
.hero-amount-item { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.hero-amount-label { font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 500; }
.hero-amount-value { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.9); }
.hero-amount-value.highlight { color: #7FFFCE; }
.hero-amount-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); margin: 0 16px; }

.hero-wave {
  display: block; width: 100%; height: 60px;
  margin-top: 16px; margin-left: -24px;
  width: calc(100% + 48px);
}

/* ── 반응 카드 ── */
.reaction-card {
  background: #fff; border-radius: 20px;
  padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 16px rgba(15,23,41,0.06);
}
.reaction-emoji { font-size: 36px; flex-shrink: 0; }
.reaction-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.reaction-label { font-size: 16px; font-weight: 700; color: var(--text-1); letter-spacing: -0.3px; }
.reaction-sub { font-size: 12px; color: var(--text-3); }
.reaction-badge {
  font-size: 11px; font-weight: 700; padding: 5px 12px;
  border-radius: 20px; flex-shrink: 0;
}
.badge-profit { background: rgba(0,196,140,0.12); color: #00C48C; }
.badge-loss   { background: rgba(255,92,92,0.12);  color: #FF5C5C; }

/* ── 상세 카드 ── */
.info-card {
  background: #fff; border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 16px rgba(15,23,41,0.06);
}
.info-card-title {
  font-size: 12px; font-weight: 700; color: var(--text-3);
  letter-spacing: 0.8px; text-transform: uppercase;
  margin-bottom: 16px;
}
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
}
.info-row:last-child { border-bottom: none; }
.info-row-highlight { padding: 16px 0; }
.info-label { font-size: 14px; color: var(--text-2); }
.info-value { font-size: 14px; font-weight: 600; color: var(--text-1); }
.info-rate { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
.text-profit { color: #00C48C; }
.text-loss   { color: #FF5C5C; }

/* ── 리셋 버튼 ── */
.btn-reset {
  width: 100%; height: 52px;
  background: #fff; color: var(--primary);
  font-size: 15px; font-weight: 700;
  border-radius: 16px;
  border: 2px solid var(--primary-light);
  cursor: pointer; font-family: inherit;
  box-shadow: 0 2px 12px rgba(95,70,255,0.1);
  transition: background 0.15s;
}
.btn-reset:active { background: var(--primary-200); }
</style>
