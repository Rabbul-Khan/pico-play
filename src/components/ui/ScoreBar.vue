<script setup lang="ts">
defineProps<{
  player1Label: string
  player2Label: string
  player1Score: number
  player2Score: number
  currentRound: number
  totalRounds: number
}>()
</script>

<template>
  <div class="score-bar" role="status" aria-live="polite">
    <div class="score-bar-scores">
      <span class="score-bar-player">
        {{ player1Label }}: <span class="score-bar-number">{{ player1Score }}</span>
      </span>
      <span class="score-bar-separator">—</span>
      <span class="score-bar-player">
        {{ player2Label }}: <span class="score-bar-number">{{ player2Score }}</span>
      </span>
    </div>
    <span class="score-bar-round" v-if="totalRounds > 1">
      Round {{ currentRound }} of {{ totalRounds }}
    </span>
  </div>
</template>

<style scoped>
.score-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}

.score-bar-scores {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.score-bar-player {
  color: var(--color-text-secondary);
}

.score-bar-number {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--color-text-primary);
}

.score-bar-separator {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.score-bar-round {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}
</style>
