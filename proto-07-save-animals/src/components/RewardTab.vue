<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { SHOP_ITEMS, type ShopItem } from '../config/gameConfig'

const store = useGameStore()

function exchange(item: ShopItem) {
  if (store.totalMedals < item.cost) return
  const ok = store.redeem(item.cost)
  if (ok) {
    if (item.donation) {
      alert(`💚 ${item.name} 완료!\n${item.cost} 메달로 유기동물 보호에 힘을 보탰어요. (목업)`)
    } else {
      alert(`🎉 ${item.name} 교환 완료!\n실제 교환은 정식 버전에서 제공됩니다. (목업)`)
    }
  }
}
</script>

<template>
  <div class="reward-tab">
    <header class="reward-head">
      <h1 class="t-title2">메달샵</h1>
    </header>

    <!-- 보유 메달 -->
    <div class="medal-banner">
      <span class="medal-banner__label">보유 메달</span>
      <span class="medal-banner__value">🏅 {{ store.totalMedals.toLocaleString() }}</span>
    </div>

    <!-- 상품 목록 -->
    <div class="shop-list">
      <div
        v-for="item in SHOP_ITEMS"
        :key="item.id"
        class="card shop-item"
        :class="{ donation: item.donation }"
      >
        <div class="shop-thumb">{{ item.emoji }}</div>
        <div class="shop-info">
          <div class="shop-name">
            {{ item.name }}
            <span v-if="item.donation" class="donation-tag">기부</span>
          </div>
          <div class="shop-desc">{{ item.desc }}</div>
          <div class="shop-cost">🏅 {{ item.cost.toLocaleString() }} 메달</div>
        </div>
        <button
          class="btn-exchange"
          :disabled="store.totalMedals < item.cost"
          @click="exchange(item)"
        >
          {{ store.totalMedals < item.cost ? '부족' : '교환' }}
        </button>
      </div>
    </div>

    <p class="shop-note">※ 실제 상품 교환/결제는 정식 버전에서 제공됩니다.</p>
  </div>
</template>

<style scoped>
.reward-tab {
  position: absolute;
  inset: 0;
  bottom: calc(60px + env(safe-area-inset-bottom));
  overflow-y: auto;
  padding: calc(16px + env(safe-area-inset-top)) 20px 24px;
}
.reward-head {
  margin-bottom: 14px;
}
.medal-banner {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-2);
  margin-bottom: 20px;
}
.medal-banner__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}
.medal-banner__value {
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.shop-item {
  display: flex;
  align-items: center;
  gap: 14px;
}
.shop-item.donation {
  border: 1.5px solid var(--success);
}
.shop-thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--muted-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}
.shop-info {
  flex: 1;
  min-width: 0;
}
.shop-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
  display: flex;
  align-items: center;
  gap: 6px;
}
.donation-tag {
  background: var(--success);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.shop-desc {
  font-size: 13px;
  color: var(--text-2);
  margin: 2px 0 4px;
}
.shop-cost {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
}
.btn-exchange {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-exchange:active {
  background: var(--primary-dark);
}
.btn-exchange:disabled {
  background: var(--muted-bg);
  color: var(--text-3);
  cursor: not-allowed;
}
.shop-note {
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
  margin-top: 20px;
}
</style>
