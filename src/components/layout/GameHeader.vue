<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { GameModule, ResolvedSettings } from '@/types/game'
import ScoreBar from '@/components/ui/ScoreBar.vue'

defineProps<{
  game: GameModule
  settings: ResolvedSettings | null
  showScoreBar?: boolean
  player1Label?: string
  player2Label?: string
  player1Score?: number
  player2Score?: number
  currentRound?: number
  totalRounds?: number
  isPlayer2Thinking?: boolean
}>()

const emit = defineEmits<{
  openSettings: []
  openInstructions: []
}>()
</script>

<template>
  <header class="game-header">
    <div class="game-header-row">
      <RouterLink to="/" class="game-header-back" aria-label="Back to home">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5m0 0 7 7m-7-7 7-7" />
        </svg>
      </RouterLink>

      <h1 class="game-header-title">{{ game.name }}</h1>

      <div class="game-header-actions">
        <button
          class="game-header-btn"
          aria-label="Game settings"
          title="Settings"
          @click="emit('openSettings')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          class="game-header-btn"
          aria-label="How to play"
          title="Instructions"
          @click="emit('openInstructions')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>
      </div>
    </div>

    <ScoreBar
      v-if="showScoreBar"
      :player1-label="player1Label || 'Player 1'"
      :player2-label="player2Label || 'Player 2'"
      :player1-score="player1Score || 0"
      :player2-score="player2Score || 0"
      :current-round="currentRound || 1"
      :total-rounds="totalRounds || 1"
      :is-player2-thinking="isPlayer2Thinking"
    />
  </header>
</template>

<style scoped>
.game-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-4) 0;
}

.game-header-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.game-header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  flex-shrink: 0;
  transition: border-color 150ms ease, color 150ms ease;
}

.game-header-back:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.game-header-title {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
}

.game-header-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.game-header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}

.game-header-btn:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}
</style>
