<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { GameModule } from '@/types/game'
import { useThemeStore } from '@/stores/theme'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{
  game: GameModule
}>()

const themeStore = useThemeStore()
</script>

<template>
  <RouterLink
    :to="`/games/${props.game.id}`"
    class="game-card"
    :class="{ 'game-card--mono': themeStore.theme === 'mono' }"
    :aria-label="`Play ${props.game.name}`"
  >
    <div class="game-card-header">
      <component :is="props.game.icon" class="game-card-icon" />
      <h2 class="game-card-name">{{ props.game.name }}</h2>
    </div>

    <p class="game-card-description">{{ props.game.description }}</p>

    <div class="game-card-badges">
      <Badge
        v-for="mode in props.game.supportedModes"
        :key="mode"
        :mode="mode"
      />
    </div>
  </RouterLink>
</template>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.game-card:hover {
  border-color: var(--color-accent);
  background-color: var(--color-surface-hover);
}

.game-card--mono:hover {
  border-color: var(--color-text-primary);
  border-width: 2px;
  /* Offset the extra border width to prevent layout shift */
  padding: calc(var(--spacing-6) - 1px);
}

.game-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.game-card-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.game-card-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.game-card-description {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.game-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: auto;
}
</style>
