<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gameById } from '@/registry'
import type { ResolvedSettings } from '@/types/game'
import GameHeader from '@/components/layout/GameHeader.vue'
import SettingsModal from '@/components/ui/SettingsModal.vue'
import InstructionsModal from '@/components/ui/InstructionsModal.vue'
import { useGameSession, type MatchFormat } from '@/composables/useGameSession'

const route = useRoute()
const router = useRouter()

const gameId = computed(() => route.params.gameId as string)
const game = computed(() => gameById.get(gameId.value))

// Redirect to 404 if game not found
if (!game.value) {
  router.replace({ name: 'not-found' })
}

// Modal state
const showSettings = ref(true) // Show on first visit
const showInstructions = ref(false)

// Current settings (null until user starts game)
const currentSettings = ref<ResolvedSettings | null>(null)

// Provide settings to game component via inject
provide('gameSettings', computed(() => currentSettings.value || {}))

// Session management
const { session, totalRounds, reset: resetSession } = useGameSession()

// Computed labels for score bar
const isVsCpu = computed(() => currentSettings.value?.mode === 'vsComputer')
const isMultiplayer = computed(() =>
  currentSettings.value?.mode === 'localMultiplayer' ||
  currentSettings.value?.mode === 'vsComputer'
)

const player1Label = computed(() => isVsCpu.value ? 'You' : 'Player 1')
const player2Label = computed(() => isVsCpu.value ? 'CPU' : 'Player 2')

const showScoreBar = computed(() => {
  if (!currentSettings.value || !isMultiplayer.value) return false
  return currentSettings.value.matchFormat !== 'single' && currentSettings.value.matchFormat !== undefined
})

// Handle settings start
function handleStart(settings: ResolvedSettings) {
  currentSettings.value = settings
  showSettings.value = false

  // Reset session with the selected match format
  const format = (settings.matchFormat as MatchFormat) || 'single'
  resetSession(format)
}

// Reset when route changes
watch(gameId, () => {
  currentSettings.value = null
  showSettings.value = true
  showInstructions.value = false
  resetSession('single')
})
</script>

<template>
  <main class="game-page" v-if="game">
    <GameHeader
      :game="game"
      :settings="currentSettings"
      :show-score-bar="showScoreBar"
      :player1-label="player1Label"
      :player2-label="player2Label"
      :player1-score="session.player1Score"
      :player2-score="session.player2Score"
      :current-round="session.currentRound"
      :total-rounds="totalRounds"
      @open-settings="showSettings = true"
      @open-instructions="showInstructions = true"
    />

    <!-- Game Board -->
    <div class="game-board" v-if="currentSettings">
      <component :is="game.component" :key="session.currentRound" />
    </div>

    <!-- Prompt to configure if no settings yet -->
    <div class="game-prompt" v-else>
      <p>Configure your game to start playing.</p>
      <button class="game-prompt-btn" @click="showSettings = true">
        Open Settings
      </button>
    </div>

    <!-- Modals -->
    <SettingsModal
      :open="showSettings"
      :game="game"
      @close="showSettings = false"
      @start="handleStart"
    />

    <InstructionsModal
      :open="showInstructions"
      :game-name="game.name"
      :instructions="game.instructions"
      @close="showInstructions = false"
    />
  </main>
</template>

<style scoped>
.game-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-6) var(--spacing-12);
}

.game-board {
  margin-top: var(--spacing-4);
}

.game-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  min-height: 300px;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.game-prompt-btn {
  padding: var(--spacing-2) var(--spacing-6);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 150ms ease;
}

.game-prompt-btn:hover {
  border-color: var(--color-accent);
}
</style>
