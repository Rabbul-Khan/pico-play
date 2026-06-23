<script setup lang="ts">
import type { GameMode } from '@/types/game'

const props = defineProps<{
  mode: GameMode
}>()

const labels: Record<GameMode, string> = {
  singlePlayer: '1 Player',
  vsComputer: 'vs CPU',
  localMultiplayer: '2 Player',
}
</script>

<template>
  <span class="badge">{{ labels[props.mode] }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
  color: var(--color-text-secondary);
  background-color: var(--color-accent-muted);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  white-space: nowrap;
  user-select: none;
}
</style>
