<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAssetSearch } from '../composables/useAssetSearch'
import type { AssetOption, AssetType } from '../types'

const props = defineProps<{ assetType: AssetType; modelValue: AssetOption | null }>()
const emit = defineEmits<{ 'update:modelValue': [v: AssetOption | null] }>()

const { results, loading, searchError, search, clear } = useAssetSearch()
const query = ref(props.modelValue ? props.modelValue.name : '')
const showDropdown = ref(false)

watch(() => props.modelValue, (v) => {
  if (!v) query.value = ''
})

function onInput() {
  emit('update:modelValue', null)
  showDropdown.value = true
  search(query.value, props.assetType)
}

function select(option: AssetOption) {
  query.value = option.name
  emit('update:modelValue', option)
  showDropdown.value = false
  clear()
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false }, 150)
}
</script>

<template>
  <div class="search-wrap">
    <div class="input-wrap">
      <input
        v-model="query"
        class="input-field"
        :placeholder="assetType === 'crypto' ? 'BTC, 비트코인, 이더리움...' : assetType === 'us-stock' ? 'AAPL, 애플, 테슬라...' : '삼성전자, SK하이닉스...'"
        @input="onInput"
        @blur="onBlur"
        autocomplete="off"
      />
      <span v-if="loading" class="search-spinner">⏳</span>
      <span v-else class="search-icon">🔍</span>
    </div>
    <ul v-if="showDropdown && results.length > 0" class="dropdown">
      <li
        v-for="item in results"
        :key="item.symbol"
        class="dropdown-item"
        @mousedown.prevent="select(item)"
      >
        <span class="dropdown-name">{{ item.name }}</span>
      </li>
    </ul>
    <p v-if="showDropdown && !loading && searchError" class="no-result error-result">
      ⚠️ {{ searchError }}
    </p>
    <p v-else-if="showDropdown && !loading && query.length > 0 && results.length === 0" class="no-result">
      검색 결과가 없습니다
    </p>
  </div>
</template>

<style scoped>
.search-wrap { position: relative; width: 100%; }

.input-wrap { position: relative; }

.input-field {
  width: 100%; height: 48px;
  padding: 0 44px 0 14px;
  background: var(--muted-bg); border: 2px solid transparent;
  border-radius: 12px; font-size: 14px; font-weight: 600;
  color: var(--text-1); outline: none; font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.input-field:focus { border-color: var(--primary); background: #fff; }
.input-field::placeholder { color: var(--text-3); font-weight: 400; }

.search-icon, .search-spinner {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 15px; pointer-events: none; color: var(--text-3);
}

.dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0;
  background: #FFFFFF; border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15,23,41,0.12);
  z-index: 100; list-style: none; overflow: hidden;
  border: 1px solid var(--border);
}
.dropdown-item {
  padding: 12px 16px; cursor: pointer;
  border-bottom: 1px solid var(--border);
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover { background: var(--muted-bg); }
.dropdown-name { font-size: 14px; font-weight: 600; color: var(--text-1); }

.no-result {
  margin-top: 6px; font-size: 13px; color: var(--text-3); text-align: center;
  padding: 10px 0;
}
.error-result { color: var(--error); }
</style>
