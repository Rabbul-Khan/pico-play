<script setup lang="ts">
import type { Component } from 'vue'
import Modal from '@/components/ui/Modal.vue'

defineProps<{
  open: boolean
  gameName: string
  instructions: Component
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Modal :open="open" :aria-label="`${gameName} instructions`" @close="emit('close')">
    <div class="instructions-modal">
      <h2 class="instructions-title">How to Play</h2>
      <div class="instructions-content">
        <component :is="instructions" />
      </div>
      <button class="instructions-close" @click="emit('close')">
        Got it
      </button>
    </div>
  </Modal>
</template>

<style scoped>
.instructions-modal {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.instructions-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.instructions-content {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.instructions-content :deep(p) {
  margin-bottom: var(--spacing-3);
}

.instructions-content :deep(p:last-child) {
  margin-bottom: 0;
}

.instructions-content :deep(strong) {
  color: var(--color-text-primary);
  font-weight: 500;
}

.instructions-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 1px 5px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
}

.instructions-content :deep(ul),
.instructions-content :deep(ol) {
  padding-left: var(--spacing-6);
  margin-bottom: var(--spacing-3);
}

.instructions-content :deep(li) {
  margin-bottom: var(--spacing-1);
}

.instructions-close {
  padding: var(--spacing-2) var(--spacing-4);
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  align-self: flex-end;
  transition: border-color 150ms ease, color 150ms ease;
}

.instructions-close:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}
</style>
