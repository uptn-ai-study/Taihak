<script setup lang="ts">
import { ref, computed } from 'vue'
import { GRADES, getSpecies } from '../config/gameConfig'
import type { Grade } from '../types'

const props = withDefaults(
  defineProps<{
    speciesId: string
    grade: Grade
    size?: number
    ring?: boolean
  }>(),
  { size: 48, ring: true },
)

const failed = ref(false)
const species = computed(() => getSpecies(props.speciesId))
const gradeConf = computed(() => GRADES[props.grade])
// 실제 일러스트가 아직 없으므로 초기엔 항상 폴백(이모지). 파일이 채워지면 자동 노출.
const showImage = computed(() => !failed.value && !!species.value.imageSlot)
</script>

<template>
  <div
    class="avatar"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: gradeConf.color + '22',
      boxShadow: ring ? `inset 0 0 0 2px ${gradeConf.color}` : 'none',
      fontSize: size * 0.5 + 'px',
    }"
  >
    <img
      v-if="showImage"
      :src="species.imageSlot"
      :alt="species.name"
      @error="failed = true"
    />
    <span v-else>{{ species.emoji }}</span>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  line-height: 1;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
