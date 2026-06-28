<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { ResolvedSettings, GameResult } from '@/types/game'
import { createDeck, type Card } from './logic'

// Injected from GamePage
const settings = inject<Ref<ResolvedSettings>>('gameSettings', ref({}))
const recordResult = inject<(result: GameResult) => void>('recordResult', () => {})
const session = inject<Ref<{ isSessionComplete: boolean, format: string }>>('gameSession', ref({ isSessionComplete: false, format: 'single' }))
const resetSession = inject<(format?: string) => void>('resetSession', () => {})
const startRematch = inject<() => void>('startRematch', () => {})

// Game settings computed
const mode = computed(() => settings.value.mode as string || 'singlePlayer')
const gridSize = computed(() => settings.value.gridSize as string || '4x4')
const isMultiplayer = computed(() => mode.value === 'localMultiplayer')

// Game state
const deck = ref<Card[]>([])
const flippedIndices = ref<number[]>([]) // Indices in the deck array
const flipsCount = ref(0) // Tracks total flip pairs made
const timeElapsed = ref(0)
const timerInterval = ref<any>(null)
const timerStarted = ref(false)

// Multiplayer local state
const currentPlayerIndex = ref(0) // 0 = Player 1, 1 = Player 2
const playerScores = ref([0, 0]) // Pairs found per player

const isGameOver = ref(false)
const disableBoard = ref(false)
const isTransitioning = ref(false)

// Formatting timer: MM:SS
const formattedTime = computed(() => {
  const mins = Math.floor(timeElapsed.value / 60)
  const secs = timeElapsed.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// Turn/status message
const statusText = computed(() => {
  if (isGameOver.value) {
    if (isMultiplayer.value) {
      if (playerScores.value[0] > playerScores.value[1]) {
        return 'Player 1 Wins!'
      } else if (playerScores.value[1] > playerScores.value[0]) {
        return 'Player 2 Wins!'
      }
      return "It's a Draw!"
    }
    return 'Grid Cleared!'
  }

  if (isMultiplayer.value) {
    return `Player ${currentPlayerIndex.value + 1}'s Turn`
  }

  return `Flips: ${flipsCount.value}`
})

// Card name labels for ARIA
function getCardLabel(card: Card, index: number): string {
  const pos = `Card ${index + 1}`
  if (card.isMatched) {
    return `${pos}: Matched symbol ${card.symbolId + 1}`
  }
  if (card.isFlipped) {
    return `${pos}: Revealed symbol ${card.symbolId + 1}`
  }
  return `${pos}: Face down`
}

// Timer controls
function startTimer() {
  if (timerInterval.value) return
  timerStarted.value = true
  timerInterval.value = setInterval(() => {
    timeElapsed.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function resetTimer() {
  stopTimer()
  timeElapsed.value = 0
  timerStarted.value = false
}

// Handle card click
function handleCardClick(index: number) {
  if (disableBoard.value || isGameOver.value) return
  const card = deck.value[index]
  if (card.isFlipped || card.isMatched) return

  // Start timer on first card click (single player only)
  if (!isMultiplayer.value && !timerStarted.value) {
    startTimer()
  }

  // Flip card
  card.isFlipped = true
  flippedIndices.value.push(index)

  if (flippedIndices.value.length === 2) {
    flipsCount.value++
    checkMatch()
  }
}

// Matching logic
function checkMatch() {
  disableBoard.value = true
  const [idx1, idx2] = flippedIndices.value
  const card1 = deck.value[idx1]
  const card2 = deck.value[idx2]

  if (card1.symbolId === card2.symbolId) {
    // Match found
    setTimeout(() => {
      card1.isMatched = true
      card2.isMatched = true
      
      if (isMultiplayer.value) {
        playerScores.value[currentPlayerIndex.value]++
      }

      flippedIndices.value = []
      disableBoard.value = false

      checkGameCompletion()
    }, 300) // Small delay to let the flip animation finish
  } else {
    // Mismatch
    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      flippedIndices.value = []
      
      // Switch turns in multiplayer
      if (isMultiplayer.value) {
        currentPlayerIndex.value = currentPlayerIndex.value === 0 ? 1 : 0
      }

      disableBoard.value = false
    }, 1000)
  }
}

// Game completion
function checkGameCompletion() {
  const allMatched = deck.value.every(card => card.isMatched)
  if (allMatched) {
    isGameOver.value = true
    stopTimer()

    let result: GameResult = { outcome: 'draw' }

    if (isMultiplayer.value) {
      const [score1, score2] = playerScores.value
      if (score1 > score2) {
        result = { outcome: 'win', winner: 'player1' }
      } else if (score2 > score1) {
        result = { outcome: 'win', winner: 'player2' }
      }
    } else {
      // Single player is always recorded as a win for completing
      result = { outcome: 'win', winner: 'player1', score: flipsCount.value }
    }

    recordResult(result)

    // Auto-advance transitions for multi-round matches
    if (isMultiplayer.value && !session.value.isSessionComplete) {
      setTimeout(() => {
        isTransitioning.value = true
        setTimeout(() => {
          playAgain()
          isTransitioning.value = false
        }, 300)
      }, 1500)
    }
  }
}

// Reset board state for next round / play again
function playAgain() {
  deck.value = createDeck(gridSize.value)
  flippedIndices.value = []
  flipsCount.value = 0
  isGameOver.value = false
  disableBoard.value = false
  currentPlayerIndex.value = 0
  playerScores.value = [0, 0]
  resetTimer()
}

// Full reset to menu settings
function newSettings() {
  resetSession()
  playAgain()
}

// Rematch from completed session
function handleRematch() {
  startRematch()
  playAgain()
}

// Watchers
watch(gridSize, () => {
  playAgain()
})

watch(mode, () => {
  playAgain()
})

onMounted(() => {
  nextTick(() => {
    playAgain()
  })
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="mm">
    <!-- Header metrics -->
    <div class="mm-header" aria-live="polite">
      <div v-if="!isMultiplayer" class="mm-metrics">
        <div class="mm-metric">
          <span class="mm-metric-label">Time</span>
          <span class="mm-metric-value">{{ formattedTime }}</span>
        </div>
        <div class="mm-metric">
          <span class="mm-metric-label">Flips</span>
          <span class="mm-metric-value">{{ flipsCount }}</span>
        </div>
      </div>
      <div v-else class="mm-multiplayer-status">
        <span class="mm-status-text">{{ statusText }}</span>
        <div class="mm-scores">
          <div class="mm-score" :class="{ 'mm-score--active': currentPlayerIndex === 0 }">
            P1: <span class="mm-score-num">{{ playerScores[0] }}</span>
          </div>
          <div class="mm-score" :class="{ 'mm-score--active': currentPlayerIndex === 1 }">
            P2: <span class="mm-score-num">{{ playerScores[1] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Board -->
    <div
      class="mm-board"
      :class="[`mm-board--${gridSize}`, { 'mm-board--disabled': disableBoard }]"
      :style="{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 300ms ease' }"
      role="grid"
      aria-label="Memory match board"
    >
      <button
        v-for="(card, i) in deck"
        :key="card.id"
        class="mm-card-container"
        :disabled="card.isMatched || disableBoard"
        :aria-label="getCardLabel(card, i)"
        @click="handleCardClick(i)"
      >
        <div 
          class="mm-card-inner"
          :class="{ 'mm-card-inner--flipped': card.isFlipped || card.isMatched, 'mm-card-inner--matched': card.isMatched }"
        >
          <!-- Front Side (Faced Down) -->
          <div class="mm-card-side mm-card-front">
            <div class="mm-card-pattern">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mm-card-back-logo">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <!-- Back Side (Flipped Open) -->
          <div class="mm-card-side mm-card-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mm-symbol">
              <!-- Render 18 distinct geometric symbols -->
              <circle v-if="card.symbolId === 0" cx="12" cy="12" r="8" />
              <rect v-else-if="card.symbolId === 1" x="4" y="4" width="16" height="16" rx="2" />
              <polygon v-else-if="card.symbolId === 2" points="12 3 21 21 3 21" />
              <polygon v-else-if="card.symbolId === 3" points="12 2 22 12 12 22 2 12" />
              <path v-else-if="card.symbolId === 4" d="M12 5v14M5 12h14" />
              <polygon v-else-if="card.symbolId === 5" points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" />
              <polygon v-else-if="card.symbolId === 6" points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
              <path v-else-if="card.symbolId === 7" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path v-else-if="card.symbolId === 8" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              <g v-else-if="card.symbolId === 9">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </g>
              <path v-else-if="card.symbolId === 10" d="m18 15-6-6-6 6" />
              <path v-else-if="card.symbolId === 11" d="M3 3h18v18H3Z" />
              <path v-else-if="card.symbolId === 12" d="M2 12c0-3.3 2.7-6 6-6 2.1 0 3.9 1.1 5 2.8 1.1-1.7 2.9-2.8 5-2.8 3.3 0 6 2.7 6 6s-2.7 6-6 6c-2.1 0-3.9-1.1-5-2.8-1.1 1.7-2.9 2.8-5 2.8-3.3 0-6-2.7-6-6Z" />
              <path v-else-if="card.symbolId === 13" d="M2 12c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 7 0" />
              <path v-else-if="card.symbolId === 14" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path v-else-if="card.symbolId === 15" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
              <g v-else-if="card.symbolId === 16">
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="1.5" />
              </g>
              <path v-else-if="card.symbolId === 17" d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2Zm0 10v8a2 2 0 0 1-2 2" />
            </svg>
          </div>
        </div>
      </button>
    </div>

    <!-- Game Over Actions -->
    <div v-if="isGameOver && session.isSessionComplete" class="mm-game-over">
      <h2 class="mm-game-over-msg">{{ statusText }}</h2>
      <div v-if="!isMultiplayer" class="mm-game-over-stats">
        <p>Time: <span class="mm-stat-val">{{ formattedTime }}</span></p>
        <p>Flips: <span class="mm-stat-val">{{ flipsCount }}</span></p>
      </div>
      <div class="mm-actions">
        <button class="mm-btn mm-btn--primary" @click="handleRematch">
          {{ isMultiplayer ? 'Rematch' : 'Play Again' }}
        </button>
        <button class="mm-btn mm-btn--secondary" @click="newSettings">
          New Settings
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-4) 0;
  width: 100%;
}

/* Header metrics */
.mm-header {
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: center;
  min-height: 2.25rem;
}

.mm-metrics {
  display: flex;
  gap: var(--spacing-8);
}

.mm-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mm-metric-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mm-metric-value {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mm-multiplayer-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.mm-status-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.mm-scores {
  display: flex;
  gap: var(--spacing-6);
}

.mm-score {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-sm);
  transition: all 150ms ease;
}

.mm-score--active {
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.mm-score-num {
  font-family: var(--font-mono);
  font-weight: 600;
}

/* Board */
.mm-board {
  display: grid;
  gap: 8px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  perspective: 1000px;
}

.mm-board--disabled {
  pointer-events: none;
}

.mm-board--4x4 {
  grid-template-columns: repeat(4, 1fr);
}

.mm-board--4x5 {
  grid-template-columns: repeat(5, 1fr);
}

.mm-board--6x6 {
  grid-template-columns: repeat(6, 1fr);
}

/* Card Container */
.mm-card-container {
  aspect-ratio: 1;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  perspective: 1000px;
  outline: none;
}

.mm-card-container:disabled {
  cursor: default;
}

.mm-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 250ms cubic-bezier(0.25, 1, 0.5, 1);
  transform-style: preserve-3d;
}

.mm-card-inner--flipped {
  transform: rotateY(180deg);
}

.mm-card-side {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

/* Front Side */
.mm-card-front {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.mm-card-container:hover:not(:disabled) .mm-card-front {
  background-color: var(--color-surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.mm-card-container:focus-visible .mm-card-front {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
}

.mm-card-pattern {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* Back Side */
.mm-card-back {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  transform: rotateY(180deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.mm-card-inner--matched .mm-card-back {
  opacity: 0.4;
  box-shadow: none;
  animation: matchPop 300ms ease;
}

.mm-symbol {
  width: 50%;
  height: 50%;
}

@keyframes matchPop {
  0% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.08); }
  100% { transform: rotateY(180deg) scale(1); }
}

/* Game Over Screen */
.mm-game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  animation: fadeIn 0.3s ease;
}

.mm-game-over-msg {
  font-family: var(--font-ui);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.mm-game-over-stats {
  display: flex;
  gap: var(--spacing-6);
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.mm-stat-val {
  font-weight: 600;
  color: var(--color-text-primary);
}

.mm-actions {
  display: flex;
  gap: var(--spacing-3);
}

.mm-btn {
  padding: var(--spacing-2) var(--spacing-6);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 150ms ease;
}

.mm-btn--primary {
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-accent);
}

.mm-btn--primary:hover {
  opacity: 0.9;
}

.mm-btn--secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.mm-btn--secondary:hover {
  border-color: var(--color-text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .mm-card-inner {
    transition: none;
  }
  .mm-card-inner--matched .mm-card-back {
    animation: none;
  }
  .mm-btn {
    transition: none;
  }
}
</style>
