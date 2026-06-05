<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="toast-container">
    <Transition name="toast">
      <div v-if="message" class="toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 16 12 12 8 12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active {
  animation: toastIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}
.toast-leave-active {
  animation: toastOut 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}
</style>
