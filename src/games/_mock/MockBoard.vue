<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { ResolvedSettings } from '@/types/game'

const settings = inject<ResolvedSettings>('gameSettings', {})

const gridSize = computed(() => {
  const size = settings.size
  return size === 'large' ? 5 : size === 'small' ? 2 : 3
})

const cells = ref<string[]>(Array(gridSize.value * gridSize.value).fill(''))
const currentMark = ref('X')

function handleClick(index: number) {
  if (cells.value[index]) return
  cells.value[index] = currentMark.value
  currentMark.value = currentMark.value === 'X' ? 'O' : 'X'
}
</script>

<template>
  <div class="mock-board">
    <p class="mock-info">
      Mode: <code>{{ settings.mode || 'N/A' }}</code> ·
      Grid: <code>{{ gridSize }}×{{ gridSize }}</code>
    </p>

    <div
      class="mock-grid"
      :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }"
    >
      <button
        v-for="(cell, i) in cells"
        :key="i"
        class="mock-cell"
        :aria-label="`Cell ${i + 1}`"
        @click="handleClick(i)"
      >
        {{ cell }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mock-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-6) 0;
}

.mock-info {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.mock-info code {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 1px 5px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
}

.mock-grid {
  display: grid;
  gap: 2px;
  max-width: 300px;
  width: 100%;
}

.mock-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.mock-cell:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-text-secondary);
}

.mock-cell:empty {
  cursor: pointer;
}
</style>
