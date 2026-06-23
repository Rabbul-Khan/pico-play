<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gameById } from '@/registry'

const route = useRoute()
const router = useRouter()

const gameId = computed(() => route.params.gameId as string)
const game = computed(() => gameById.get(gameId.value))

// Redirect to 404 if game not found
if (!game.value) {
  router.replace({ name: 'not-found' })
}
</script>

<template>
  <main class="game-page" v-if="game">
    <h1 class="sr-only">{{ game.name }}</h1>
    <!-- GameHeader and game component will be rendered here in Milestone 3 -->
    <div class="game-placeholder">
      <p>{{ game.name }} — board coming soon.</p>
    </div>
  </main>
</template>

<style scoped>
.game-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.game-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
