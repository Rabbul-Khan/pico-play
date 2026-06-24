<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { ResolvedSettings, GameResult } from '@/types/game'
import {
  createBoard,
  makeMove,
  checkWinner,
  getAvailableMoves,
  getGameStatus,
  type Board,
  type Player,
} from './logic'
import { getBestMove, type Difficulty } from './ai'

// Injected from GamePage
const settings = inject<Ref<ResolvedSettings>>('gameSettings', ref({}))
const recordResult = inject<(result: GameResult) => void>('recordResult', () => {})
const session = inject<Ref<{ isSessionComplete: boolean, format: string }>>('gameSession', ref({ isSessionComplete: false, format: 'single' }))
const resetSession = inject<(format?: string) => void>('resetSession', () => {})
const startRematch = inject<() => void>('startRematch', () => {})
const setPlayer2Thinking = inject<(val: boolean) => void>('setPlayer2Thinking', () => {})

// Game state
const board = ref<Board>(createBoard())
const currentPlayer = ref<Player>('X')
const isGameOver = ref(false)
const winLine = ref<number[] | null>(null)
const isAiThinking = ref(false)
const isTransitioning = ref(false)
const statusMessage = ref('')

// Settings accessors
const mode = computed(() => settings.value.mode as string || 'localMultiplayer')
const difficulty = computed(() => (settings.value.difficulty as Difficulty) || 'medium')
const firstMove = computed(() => (settings.value.firstMove as string) || 'player')
const isVsCpu = computed(() => mode.value === 'vsComputer')

// Player is always X, CPU is always O in vsComputer mode
const humanPlayer: Player = 'X'
const cpuPlayer: Player = 'O'

// Determine whose turn display (used in status text)

const statusText = computed(() => {
  if (statusMessage.value) return statusMessage.value

  if (isGameOver.value) {
    const { winner } = checkWinner(board.value)
    if (winner) {
      if (isVsCpu.value) {
        return winner === humanPlayer ? 'You win!' : 'CPU wins!'
      }
      return `Player ${winner === 'X' ? '1' : '2'} wins!`
    }
    return "It's a draw!"
  }

  if (isAiThinking.value) return 'CPU is thinking…'

  if (isVsCpu.value) {
    return currentPlayer.value === humanPlayer ? 'Your turn' : 'CPU\'s turn'
  }

  return `Player ${currentPlayer.value === 'X' ? '1' : '2'}'s turn`
})

// Handle cell click
function handleCellClick(index: number) {
  if (isGameOver.value || isAiThinking.value) return
  if (board.value[index] !== null) return
  if (isVsCpu.value && currentPlayer.value !== humanPlayer) return

  placeMark(index)
}

// Place a mark and check result
function placeMark(index: number) {
  board.value = makeMove(board.value, index, currentPlayer.value)

  const status = getGameStatus(board.value)
  if (status !== 'playing') {
    endGame()
    return
  }

  // Switch turns
  currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'

  // Trigger CPU move if needed
  if (isVsCpu.value && currentPlayer.value === cpuPlayer) {
    triggerCpuMove()
  } else if (getAvailableMoves(board.value).length === 1) {
    // Auto-fill the 9th box immediately to save an unnecessary click
    const lastMove = getAvailableMoves(board.value)[0]
    if (lastMove !== undefined) {
      placeMark(lastMove)
    }
  }
}

// CPU move with delay
function triggerCpuMove() {
  isAiThinking.value = true
  setPlayer2Thinking(true)

  let minDelay = 300
  let maxDelay = 500
  
  if (difficulty.value === 'medium') {
    minDelay = 500
    maxDelay = 800
  } else if (difficulty.value === 'hard') {
    minDelay = 800
    maxDelay = 1200
  }
  
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay

  setTimeout(() => {
    if (isGameOver.value) {
      isAiThinking.value = false
      setPlayer2Thinking(false)
      return
    }

    const move = getBestMove(board.value, cpuPlayer, difficulty.value)
    if (move >= 0) {
      placeMark(move)
    }
    isAiThinking.value = false
    setPlayer2Thinking(false)
  }, delay)
}

// End the game and record result
function endGame() {
  isGameOver.value = true
  const { winner, line } = checkWinner(board.value)
  winLine.value = line

  // Build GameResult for session tracking
  const result: GameResult = { outcome: 'draw' }

  if (winner) {
    result.outcome = 'win'
    if (isVsCpu.value) {
      result.winner = winner === humanPlayer ? 'player1' : 'cpu'
    } else {
      result.winner = winner === 'X' ? 'player1' : 'player2'
    }
  }

  recordResult(result)

  // Auto-advance seamless transitions for multi-round matches
  if (!session.value.isSessionComplete) {
    setTimeout(() => {
      isTransitioning.value = true
      setTimeout(() => {
        playAgain()
        isTransitioning.value = false
      }, 300)
    }, 1500)
  }
}

// Play again (next round)
function playAgain() {
  board.value = createBoard()
  winLine.value = null
  isGameOver.value = false
  isAiThinking.value = false
  statusMessage.value = ''

  // Alternate first move for fairness in local multiplayer
  if (!isVsCpu.value) {
    currentPlayer.value = 'X'
  } else {
    // In vs CPU, respect firstMove setting
    startVsCpu()
  }
}

// Start a fresh session (Rematch)
function handleRematch() {
  startRematch()
  playAgain()
}

// New settings — tell parent to reopen settings modal
function newSettings() {
  resetSession()
  // The GamePage watches for settings changes and reopens the modal
  // We emit via a custom event on the parent component
  board.value = createBoard()
  winLine.value = null
  isGameOver.value = false
  isAiThinking.value = false
  statusMessage.value = ''
  currentPlayer.value = 'X'
}

// Initialize vs CPU game
function startVsCpu() {
  if (!isVsCpu.value) {
    currentPlayer.value = 'X'
    return
  }

  let cpuGoesFirst = false

  if (firstMove.value === 'cpu') {
    cpuGoesFirst = true
  } else if (firstMove.value === 'random') {
    cpuGoesFirst = Math.random() < 0.5
  }

  if (cpuGoesFirst) {
    currentPlayer.value = cpuPlayer
    triggerCpuMove()
  } else {
    currentPlayer.value = humanPlayer
  }
}

// Check if a cell is on the winning line
function isWinCell(index: number): boolean {
  return winLine.value?.includes(index) ?? false
}

// Cell label for accessibility
function cellLabel(index: number): string {
  const row = Math.floor(index / 3) + 1
  const col = (index % 3) + 1
  const mark = board.value[index]
  const state = mark ? `marked ${mark}` : 'empty'
  return `Row ${row}, Column ${col}, ${state}`
}

// Calculate SVG line coordinates for the winning line
const winLineCoords = computed(() => {
  if (!winLine.value) return null
  
  const start = winLine.value[0]
  const end = winLine.value[2]
  
  // Coordinates in a 300x300 viewBox (each cell is 100x100)
  const getCenter = (index: number) => ({
    x: (index % 3) * 100 + 50,
    y: Math.floor(index / 3) * 100 + 50
  })
  
  const startPt = getCenter(start)
  const endPt = getCenter(end)
  
  // Extend the line slightly past the centers
  const dx = endPt.x - startPt.x
  const dy = endPt.y - startPt.y
  const len = Math.hypot(dx, dy)
  const ext = 20
  
  return {
    x1: startPt.x - (dx / len) * ext,
    y1: startPt.y - (dy / len) * ext,
    x2: endPt.x + (dx / len) * ext,
    y2: endPt.y + (dy / len) * ext,
  }
})

// Initialize game on mount
onMounted(() => {
  nextTick(() => {
    startVsCpu()
  })
})

// Watch for settings changes (happens when GamePage re-provides)
watch(settings, () => {
  board.value = createBoard()
  winLine.value = null
  isGameOver.value = false
  isAiThinking.value = false
  statusMessage.value = ''
  currentPlayer.value = 'X'

  nextTick(() => {
    startVsCpu()
  })
}, { deep: true })
</script>

<template>
  <div class="ttt">
    <!-- Status -->
    <div class="ttt-status" aria-live="polite" :style="{ visibility: isGameOver ? 'hidden' : 'visible' }">
      {{ statusText }}
      <span v-if="isAiThinking" class="ttt-thinking-dot" aria-hidden="true"></span>
    </div>

    <!-- Board -->
    <div 
      class="ttt-board" 
      role="grid" 
      aria-label="Tic Tac Toe board"
      :style="{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 300ms ease' }"
    >
      <button
        v-for="(cell, i) in board"
        :key="i"
        class="ttt-cell"
        :class="{
          'ttt-cell--win': isWinCell(i),
          'ttt-cell--lose': isGameOver && winLine && !isWinCell(i),
          'ttt-cell--x': cell === 'X',
          'ttt-cell--o': cell === 'O',
          'ttt-cell--disabled': isGameOver || isAiThinking || cell !== null,
        }"
        :aria-label="cellLabel(i)"
        :disabled="isGameOver || isAiThinking || cell !== null"
        @click="handleCellClick(i)"
      >
        <!-- X mark -->
        <svg
          class="ttt-mark ttt-mark--x"
          :class="{
            'ttt-mark--placed': cell === 'X',
            'ttt-mark--ghost': cell === null && currentPlayer === 'X'
          }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>

        <!-- O mark -->
        <svg
          class="ttt-mark ttt-mark--o"
          :class="{
            'ttt-mark--placed': cell === 'O',
            'ttt-mark--ghost': cell === null && currentPlayer === 'O'
          }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <circle cx="12" cy="12" r="7" />
        </svg>
      </button>

      <!-- Win Line Overlay -->
      <svg v-if="winLineCoords" class="ttt-win-line-overlay" viewBox="0 0 300 300">
        <line
          :x1="winLineCoords.x1"
          :y1="winLineCoords.y1"
          :x2="winLineCoords.x2"
          :y2="winLineCoords.y2"
          class="ttt-win-line"
        />
      </svg>
    </div>

    <!-- Game Over Actions -->
    <div v-if="isGameOver && session.isSessionComplete" class="ttt-game-over">
      <h2 class="ttt-game-over-msg">{{ statusText }}</h2>
      <div class="ttt-actions">
        <button
          class="ttt-btn ttt-btn--primary"
          @click="handleRematch"
        >
          {{ session.format === 'single' ? 'Play Again' : 'Rematch' }}
        </button>
        <button class="ttt-btn ttt-btn--secondary" @click="newSettings">
          New Settings
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Local theme variables for the distinct win state */
.ttt {
  --color-win-line: #FF3366;
  --color-win-bg: rgba(255, 51, 102, 0.1);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-6) 0;
}

:global([data-theme="light"]) .ttt {
  --color-win-line: #FF0044;
  --color-win-bg: rgba(255, 0, 68, 0.08);
}

:global([data-theme="mono"]) .ttt {
  --color-win-line: var(--color-text-primary);
  --color-win-bg: var(--color-bg-elevated);
}

/* Status */
.ttt-status {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-height: 1.5em;
}

.ttt-thinking-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: var(--spacing-2);
  background-color: var(--color-accent);
  border-radius: 50%;
  animation: pulse 1s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

/* Board */
.ttt-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1;
  background-color: transparent;
  position: relative;
}

/* Cells */
.ttt-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  padding: 16%;
  transition: all 150ms ease;
  position: relative;
}

.ttt-cell:hover:not(.ttt-cell--disabled) {
  background-color: var(--color-surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.ttt-cell:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
  z-index: 1;
}

.ttt-cell--disabled {
  cursor: default;
}

.ttt-cell--win {
  background-color: var(--color-win-bg);
  border-color: var(--color-win-line);
  box-shadow: 0 0 0 1px var(--color-win-line);
  z-index: 2;
}

.ttt-cell--lose {
  opacity: 0.3;
  box-shadow: none;
}

/* Marks */
.ttt-mark {
  position: absolute;
  inset: 16%;
  width: 68%;
  height: 68%;
  opacity: 0;
}

.ttt-mark--placed {
  animation: placeMark 150ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes placeMark {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Ghosting */
.ttt-mark--ghost {
  transform: scale(1);
  transition: opacity 150ms ease;
}

.ttt-cell:not(.ttt-cell--disabled):hover .ttt-mark--ghost {
  opacity: 0.2;
}

.ttt-mark--x {
  color: var(--color-text-primary);
}

.ttt-mark--o {
  color: var(--color-accent);
}

/* Game Over Actions */
.ttt-actions {
  display: flex;
  gap: var(--spacing-3);
}

.ttt-btn {
  padding: var(--spacing-2) var(--spacing-6);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;
}

.ttt-btn--primary {
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-accent);
}

.ttt-btn--primary:hover {
  opacity: 0.9;
}

.ttt-btn--secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.ttt-btn--secondary:hover {
  border-color: var(--color-text-secondary);
}

/* Win Line Overlay */
.ttt-win-line-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.ttt-win-line {
  stroke: var(--color-accent);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: drawLine 0.4s ease forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

/* Game Over Message */
.ttt-game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  animation: fadeIn 0.3s ease;
}

.ttt-game-over-msg {
  font-family: var(--font-ui);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ttt-cell {
    transition: none;
  }
  .ttt-btn {
    transition: none;
  }
}
</style>
