<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  player1Label: string
  player2Label: string
  player1Score: number
  player2Score: number
  currentRound: number
  totalRounds: number
  isPlayer2Thinking?: boolean
}>()

const requiredWins = computed(() => Math.floor(props.totalRounds / 2) + 1)
</script>

<template>
  <div class="score-bar" role="status" aria-live="polite">
    <div class="score-bar-scores">
      <div class="score-bar-player">
        <span class="score-bar-label">{{ player1Label }}</span>
        <div class="score-bar-pips" aria-label="Score">
          <div
            v-for="i in requiredWins"
            :key="`p1-${i}`"
            class="score-pip"
            :class="{ 'score-pip--filled': i <= player1Score }"
          ></div>
        </div>
      </div>
      <span class="score-bar-separator">—</span>
      <div class="score-bar-player">
        <span class="score-bar-label">
          {{ player2Label }}
          <span v-if="isPlayer2Thinking" class="score-bar-pulse" aria-hidden="true"></span>
        </span>
        <div class="score-bar-pips" aria-label="Score">
          <div
            v-for="i in requiredWins"
            :key="`p2-${i}`"
            class="score-pip"
            :class="{ 'score-pip--filled': i <= player2Score }"
          ></div>
        </div>
      </div>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.score-bar-label {
  color: var(--color-text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
}

.score-bar-pips {
  display: flex;
  gap: 6px;
}

.score-pip {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background-color: transparent;
  transition: background-color 300ms ease, border-color 300ms ease;
}

.score-pip--filled {
  background-color: var(--color-text-primary);
  border-color: var(--color-text-primary);
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

.score-bar-pulse {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: var(--spacing-1);
  background-color: var(--color-accent);
  border-radius: 50%;
  animation: pulse 1s infinite cubic-bezier(0.4, 0, 0.6, 1);
  vertical-align: middle;
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
</style>
