<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import type { ResolvedSettings, GameResult } from '@/types/game'
import { createSnake, moveSnake, checkCollision, generateFood, type Position, type Direction } from './logic'

// Injected from GamePage
const settings = inject<Ref<ResolvedSettings>>('gameSettings', ref({}))
const recordResult = inject<(result: GameResult) => void>('recordResult', () => {})

// Game settings computed
const speed = computed(() => settings.value.speed as string || 'normal')
const gridSize = computed(() => settings.value.gridSize as string || 'medium')

// Mappings
const gridWidth = computed(() => {
  if (gridSize.value === 'small') return 15
  if (gridSize.value === 'large') return 25
  return 20 // medium
})

const speedMs = computed(() => {
  if (speed.value === 'slow') return 150
  if (speed.value === 'fast') return 70
  return 100 // normal
})

const gridCellSizePercent = computed(() => {
  return `${100 / gridWidth.value}%`
})

// Game state refs
const snake = ref<Position[]>([])
const food = ref<Position>({ x: -1, y: -1 })
const direction = ref<Direction>('RIGHT')
const nextDirection = ref<Direction>('RIGHT')

const score = ref(0)
const highScore = ref(0)
const isPaused = ref(false)
const isGameOver = ref(false)
const gameStarted = ref(false)
const hasInteracted = ref(false) // First click to start

const requestAnimationFrameId = ref<number | null>(null)

// High score localStorage key
const LOCAL_STORAGE_KEY = 'picoplay-snake-highscore'

// Styling helper for absolute positions
function cellStyle(pos: Position) {
  const size = 100 / gridWidth.value
  return {
    left: `${pos.x * size}%`,
    top: `${pos.y * size}%`,
    width: `${size}%`,
    height: `${size}%`,
  }
}

// Tick execution
function tick() {
  direction.value = nextDirection.value

  const head = snake.value[0]
  if (!head) return

  // Calculate next head position
  const nextHead = { x: head.x, y: head.y }
  switch (direction.value) {
    case 'UP': nextHead.y--; break
    case 'DOWN': nextHead.y++; break
    case 'LEFT': nextHead.x--; break
    case 'RIGHT': nextHead.x++; break
  }

  // Check if eating food
  const eating = nextHead.x === food.value.x && nextHead.y === food.value.y

  if (eating) {
    score.value++
    // Spawn new food
    const nextSnake = moveSnake(snake.value, direction.value, true)
    const newFood = generateFood(nextSnake, gridWidth.value, gridWidth.value)
    
    if (newFood.x === -1) {
      // Board full! Win/End game
      snake.value = nextSnake
      endGame(true)
      return
    }

    food.value = newFood
    snake.value = nextSnake
  } else {
    // Check collision before actually moving
    const bodyToCheck = snake.value.slice(0, -1) // If not growing, tail moves out of the way
    if (checkCollision(nextHead, bodyToCheck, gridWidth.value, gridWidth.value)) {
      endGame(false)
      return
    }
    snake.value = moveSnake(snake.value, direction.value, false)
  }
}

// Timer Accumulator for Game Loop
let lastTime = 0
let accumulator = 0

function gameLoop(timestamp: number) {
  if (isGameOver.value || isPaused.value || !gameStarted.value) {
    lastTime = 0
    requestAnimationFrameId.value = requestAnimationFrame(gameLoop)
    return
  }

  if (!lastTime) {
    lastTime = timestamp
  }
  const elapsed = timestamp - lastTime
  lastTime = timestamp

  accumulator += elapsed

  const interval = speedMs.value
  if (accumulator >= interval) {
    tick()
    accumulator %= interval
  }

  requestAnimationFrameId.value = requestAnimationFrame(gameLoop)
}

// Start Game Loop
function startGameLoop() {
  if (requestAnimationFrameId.value === null) {
    lastTime = 0
    accumulator = 0
    requestAnimationFrameId.value = requestAnimationFrame(gameLoop)
  }
}

function stopGameLoop() {
  if (requestAnimationFrameId.value !== null) {
    cancelAnimationFrame(requestAnimationFrameId.value)
    requestAnimationFrameId.value = null
  }
}

// Setup game board
function initGame() {
  stopGameLoop()
  score.value = 0
  direction.value = 'RIGHT'
  nextDirection.value = 'RIGHT'
  isPaused.value = false
  isGameOver.value = false
  gameStarted.value = false
  hasInteracted.value = false

  // Load high score
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  highScore.value = saved ? parseInt(saved, 10) : 0

  snake.value = createSnake(gridWidth.value, gridWidth.value)
  food.value = generateFood(snake.value, gridWidth.value, gridWidth.value)
}

function triggerStart() {
  hasInteracted.value = true
  gameStarted.value = true
  startGameLoop()
}

function togglePause() {
  if (!gameStarted.value || isGameOver.value) return
  isPaused.value = !isPaused.value
}

function endGame(completed: boolean) {
  isGameOver.value = true
  stopGameLoop()

  // Save high score
  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem(LOCAL_STORAGE_KEY, score.value.toString())
  }

  recordResult({
    outcome: completed ? 'win' : 'loss',
    score: score.value
  })
}

// Keyboard controls
function handleKeyDown(e: KeyboardEvent) {
  if (isGameOver.value) return

  // Prevent browser scrolling with arrows and space
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault()
  }

  if (e.key === ' ' || e.key === 'Spacebar') {
    if (!hasInteracted.value) {
      triggerStart()
    } else {
      togglePause()
    }
    return
  }

  if (!gameStarted.value || isPaused.value) return

  switch (e.key.toLowerCase()) {
    case 'arrowup':
    case 'w':
      if (direction.value !== 'DOWN') nextDirection.value = 'UP'
      break
    case 'arrowdown':
    case 's':
      if (direction.value !== 'UP') nextDirection.value = 'DOWN'
      break
    case 'arrowleft':
    case 'a':
      if (direction.value !== 'RIGHT') nextDirection.value = 'LEFT'
      break
    case 'arrowright':
    case 'd':
      if (direction.value !== 'LEFT') nextDirection.value = 'RIGHT'
      break
  }
}

// Touch controls (Swiping)
let touchStartX = 0
let touchStartY = 0
const MIN_SWIPE_DISTANCE = 30

function handleTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (touch) {
    touchStartX = touch.clientX
    touchStartY = touch.clientY
  }
}

function handleTouchEnd(e: TouchEvent) {
  if (!gameStarted.value || isPaused.value || isGameOver.value) return

  const touch = e.changedTouches[0]
  if (!touch) return

  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY

  // Check if minimum distance met
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < MIN_SWIPE_DISTANCE) return

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (deltaX > 0 && direction.value !== 'LEFT') {
      nextDirection.value = 'RIGHT'
    } else if (deltaX < 0 && direction.value !== 'RIGHT') {
      nextDirection.value = 'LEFT'
    }
  } else {
    // Vertical swipe
    if (deltaY > 0 && direction.value !== 'UP') {
      nextDirection.value = 'DOWN'
    } else if (deltaY < 0 && direction.value !== 'DOWN') {
      nextDirection.value = 'UP'
    }
  }
}

// Watchers
watch([gridSize, speed], () => {
  initGame()
})

onMounted(() => {
  initGame()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  stopGameLoop()
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="snake">
    <!-- Header metrics -->
    <div class="snake-header" aria-live="polite">
      <div class="snake-metrics">
        <div class="snake-metric">
          <span class="snake-metric-label">Score</span>
          <span class="snake-metric-value">{{ score }}</span>
        </div>
        <div class="snake-metric">
          <span class="snake-metric-label">Best</span>
          <span class="snake-metric-value">{{ highScore }}</span>
        </div>
      </div>

      <!-- Controls row -->
      <button 
        v-if="hasInteracted && !isGameOver" 
        class="snake-control-btn" 
        @click="togglePause"
        :aria-label="isPaused ? 'Resume game' : 'Pause game'"
      >
        <svg v-if="isPaused" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="4" x2="18" y2="20" />
          <line x1="6" y1="4" x2="6" y2="20" />
        </svg>
      </button>
    </div>

    <!-- Board -->
    <div
      class="snake-board-grid"
      :class="`snake-board--${gridSize}`"
      role="grid"
      aria-label="Snake board"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Subtle waffle lines (pattern background configured in CSS) -->

      <!-- Food -->
      <div 
        v-if="gameStarted && food.x !== -1"
        class="snake-cell snake-food"
        :style="cellStyle(food)"
      >
        <span class="snake-food-pulse"></span>
      </div>

      <!-- Snake segments -->
      <div
        v-for="(segment, idx) in snake"
        :key="idx"
        class="snake-cell"
        :class="{ 
          'snake-segment': true,
          'snake-segment--head': idx === 0,
          'snake-segment--up': idx === 0 && direction === 'UP',
          'snake-segment--down': idx === 0 && direction === 'DOWN',
          'snake-segment--left': idx === 0 && direction === 'LEFT',
          'snake-segment--right': idx === 0 && direction === 'RIGHT',
        }"
        :style="cellStyle(segment)"
      />

      <!-- Start Overlay -->
      <div v-if="!hasInteracted" class="snake-overlay" @click="triggerStart">
        <span class="snake-overlay-title">Ready?</span>
        <span class="snake-overlay-sub">Press Spacebar or Click to Start</span>
      </div>

      <!-- Pause Overlay -->
      <div v-else-if="isPaused" class="snake-overlay" @click="togglePause">
        <span class="snake-overlay-title">Paused</span>
        <span class="snake-overlay-sub">Press Spacebar to Resume</span>
      </div>
    </div>

    <!-- Game Over overlay (bottom dialog) -->
    <div v-if="isGameOver" class="snake-game-over">
      <h2 class="snake-game-over-msg">Game Over</h2>
      <p class="snake-game-over-sub">You scored {{ score }} points!</p>
      <button class="snake-btn" @click="initGame">
        Play Again
      </button>
    </div>
  </div>
</template>

<style scoped>
.snake {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-4) 0;
  width: 100%;
}

/* Header metrics */
.snake-header {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2.5rem;
}

.snake-metrics {
  display: flex;
  gap: var(--spacing-8);
}

.snake-metric {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.snake-metric-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.snake-metric-value {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.snake-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}

.snake-control-btn:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

/* Grid Board */
.snake-board-grid {
  position: relative;
  width: 100%;
  max-width: 440px;
  aspect-ratio: 1;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  
  /* Waffle pattern grid lines */
  background-size: v-bind('gridCellSizePercent') v-bind('gridCellSizePercent');
  background-image: 
    linear-gradient(to right, var(--color-border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
}

/* Cells styling */
.snake-cell {
  position: absolute;
  padding: 1px; /* border between cells */
  box-sizing: border-box;
}

/* Food dot styling */
.snake-food {
  display: flex;
  align-items: center;
  justify-content: center;
}

.snake-food-pulse {
  width: 70%;
  height: 70%;
  background-color: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent);
  animation: foodPulse 1s infinite alternate ease-in-out;
}

@keyframes foodPulse {
  0% { transform: scale(0.85); opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

/* Snake segments styling */
.snake-segment {
  background-color: var(--color-text-primary);
  border-radius: 3px;
  transition: all 50ms ease-out;
}

/* Rounded corners for head */
.snake-segment--head {
  background-color: var(--color-accent);
  z-index: 2;
  border-radius: 6px;
}

/* Give head directional rounding to look elegant */
.snake-segment--up {
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
}
.snake-segment--down {
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}
.snake-segment--left {
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
.snake-segment--right {
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}

/* Overlays */
.snake-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  z-index: 10;
  cursor: pointer;
}

/* Override dark overlay bg in light mode */
:global([data-theme="light"]) .snake-overlay {
  background-color: rgba(250, 250, 250, 0.85);
}

.snake-overlay-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.snake-overlay-sub {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Game Over overlay (bottom card) */
.snake-game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  animation: slideUp 0.3s ease;
  width: 100%;
}

.snake-game-over-msg {
  font-family: var(--font-ui);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.snake-game-over-sub {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.snake-btn {
  padding: var(--spacing-2) var(--spacing-6);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 150ms ease;
}

.snake-btn:hover {
  opacity: 0.9;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .snake-overlay {
    backdrop-filter: none;
  }
  .snake-food-pulse {
    animation: none;
  }
  .snake-btn {
    transition: none;
  }
  .snake-control-btn {
    transition: none;
  }
}
</style>
