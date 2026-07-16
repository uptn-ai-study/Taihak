<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { GRADES, HABITAT_LABEL, getSpecies } from '../config/gameConfig'
import { getSpeciesInfo } from '../config/speciesInfo'
import type { RescueResult, SpawnedAnimal } from '../types'
import AnimalAvatar from './AnimalAvatar.vue'
import AdModal from './AdModal.vue'

const props = defineProps<{ animal: SpawnedAnimal }>()
const emit = defineEmits<{ close: [] }>()

const store = useGameStore()
const species = computed(() => getSpecies(props.animal.speciesId))
const grade = computed(() => GRADES[props.animal.grade])
const info = computed(() => getSpeciesInfo(props.animal.speciesId))
const showDetail = ref(false)

type Phase = 'info' | 'judging' | 'result'
const phase = ref<Phase>('info')
const showAd = ref(false)
const result = ref<RescueResult | null>(null)

// 슬라이드업 트리거
const open = ref(false)
onMounted(() => requestAnimationFrame(() => (open.value = true)))

function onRescueClick() {
  if (store.needAd) {
    showAd.value = true
  } else {
    doRescue(false)
  }
}

function onAdDone() {
  showAd.value = false
  doRescue(true)
}

async function doRescue(viaAd: boolean) {
  phase.value = 'judging'
  // 판정 연출용 짧은 딜레이
  await new Promise((r) => setTimeout(r, 900))
  result.value = await store.rescue(props.animal, viaAd)
  phase.value = 'result'
}

function close() {
  open.value = false
  setTimeout(() => emit('close'), 260)
}
</script>

<template>
  <div class="bs-overlay" @click.self="phase !== 'judging' && close()">
    <div class="bs-sheet rescue-sheet" :class="{ open }">
      <div class="bs-handle"></div>

      <!-- 1. 동물 정보 -->
      <template v-if="phase === 'info'">
        <div class="bs-header">
          <span class="bs-title">발견!</span>
          <button class="bs-close" @click="close">✕</button>
        </div>

        <AnimalAvatar :species-id="animal.speciesId" :grade="animal.grade" :size="88" />

        <div class="name-row">
          <span class="t-title3">{{ species.name }}</span>
          <span class="grade-badge" :style="{ background: grade.color }">
            {{ grade.emoji }} {{ grade.name }}
          </span>
        </div>
        <span class="taxon-line">
          {{ species.taxon }} · {{ HABITAT_LABEL[species.habitat] }} · {{ grade.spawnLabel }}
        </span>

        <p class="species-intro">{{ info.intro }}</p>

        <div class="stat-grid">
          <div class="stat">
            <span class="stat-label">예상 보상</span>
            <span class="stat-value">🏅 {{ grade.medalReward }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">성공 확률</span>
            <span class="stat-value">{{ Math.round(grade.successRate * 100) }}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">구조 난이도</span>
            <span class="stat-value" :style="{ color: grade.color }">{{ grade.difficultyLabel }}</span>
          </div>
        </div>

        <div v-if="species.status !== 'common'" class="endangered-note" :style="{ borderColor: grade.color }">
          <b :style="{ color: grade.color }">{{ grade.name }}</b> {{ grade.desc }}
        </div>

        <!-- 학습 — 국립생태원 자료 항목(형태·생태·분포·위협요인) 기반 -->
        <button class="info-toggle" @click="showDetail = !showDetail">
          🔎 {{ species.name }} 알아보기 {{ showDetail ? '▲' : '▼' }}
        </button>
        <div v-if="showDetail" class="info-rows">
          <div class="info-row">
            <span class="info-k">생김새</span>
            <span class="info-v">{{ info.form }}</span>
          </div>
          <div class="info-row">
            <span class="info-k">사는 법</span>
            <span class="info-v">{{ info.ecology }}</span>
          </div>
          <div class="info-row">
            <span class="info-k">사는 곳</span>
            <span class="info-v">{{ info.habitat }}</span>
          </div>
          <div class="info-row">
            <span class="info-k">위험해요</span>
            <span class="info-v">{{ info.threat }}</span>
          </div>
        </div>

        <div v-if="store.needAd" class="ad-note">
          오늘 무료 구조를 모두 썼어요. 광고를 보면 계속 구조할 수 있어요.
        </div>
        <div v-else class="free-note">
          오늘 남은 무료 구조 <b>{{ store.freeRemaining }}회</b>
        </div>

        <button class="btn-primary" @click="onRescueClick">
          {{ store.needAd ? '📺 광고 보고 구조하기' : '구조하기' }}
        </button>
      </template>

      <!-- 2. 판정 중 -->
      <template v-else-if="phase === 'judging'">
        <div class="judging">
          <div class="spinner"></div>
          <AnimalAvatar :species-id="animal.speciesId" :grade="animal.grade" :size="72" />
          <p class="t-body1">구조 시도 중…</p>
        </div>
      </template>

      <!-- 3. 결과 -->
      <template v-else>
        <template v-if="result?.success">
          <div class="result-emoji pop">🎉</div>
          <h2 class="t-title2">구조 성공!</h2>
          <AnimalAvatar :species-id="animal.speciesId" :grade="animal.grade" :size="72" />
          <div class="medal-gain pop">+{{ result.medalReward }} 메달</div>
          <p class="t-caption1">앨범에 기록됐어요 · {{ species.name }}</p>
          <button class="btn-primary" @click="close">확인</button>
        </template>
        <template v-else>
          <div class="result-emoji">😢</div>
          <h2 class="t-title2">아쉽게 놓쳤어요</h2>
          <p class="t-body2">이 친구는 다른 곳으로 떠났어요. 다음 기회에!</p>
          <button class="btn-primary" @click="close">확인</button>
        </template>
      </template>
    </div>
  </div>

  <AdModal v-if="showAd" title="구조를 위한 광고" @done="onAdDone" @close="showAd = false" />
</template>

<style scoped>
/* 소개를 펼쳐도 버튼까지 볼 수 있도록 시트 자체를 스크롤 */
.rescue-sheet {
  max-height: 88dvh;
  overflow-y: auto;
}

/* 이름과 등급은 줄바꿈해 세로로 배치 */
.name-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.grade-badge {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}
.stat-grid {
  display: flex;
  gap: 10px;
  width: 100%;
}
.stat {
  flex: 1;
  background: var(--muted-bg);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-label {
  font-size: 12px;
  color: var(--text-2);
}
.stat-value {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-1);
  white-space: nowrap;
}
.taxon-line {
  font-size: 13px;
  color: var(--text-2);
  margin-top: -8px;
}
.endangered-note {
  width: 100%;
  background: var(--muted-bg);
  border-left: 3px solid;
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-2);
  text-align: left;
}

/* 소개 (학습) */
.species-intro {
  margin: -6px 0 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text-2);
  text-align: center;
}
.info-toggle {
  width: 100%;
  height: 44px;
  background: var(--primary-200);
  color: var(--primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.info-toggle:active {
  background: var(--primary-light);
}
.info-rows {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--muted-bg);
  border-radius: var(--radius-md);
  padding: 14px 12px;
}
.info-row {
  display: flex;
  gap: 10px;
  text-align: left;
}
.info-k {
  flex-shrink: 0;
  width: 54px;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
}
.info-v {
  flex: 1;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-1);
}
.ad-note,
.free-note {
  font-size: 13px;
  text-align: center;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  width: 100%;
}
.ad-note {
  background: #FFF7ED;
  color: #C2410C;
}
.free-note {
  background: var(--primary-light);
  color: var(--primary-dark);
}
.judging {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--primary-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.result-emoji {
  font-size: 56px;
}
.result-emoji.pop {
  animation: pop 0.5s ease both;
}
.medal-gain {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.5px;
}
</style>
