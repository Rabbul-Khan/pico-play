<script setup lang="ts">
import { games } from '@/registry'
</script>

<template>
  <main class="home">
    <section class="home-hero">
      <h1 class="home-title">Games</h1>
      <p class="home-subtitle" v-if="games.length === 0">
        No games registered yet. They're coming soon.
      </p>
    </section>

    <section class="game-grid" v-if="games.length > 0" aria-label="Game list">
      <!-- GameCards will be rendered here in Milestone 3 -->
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-12) var(--spacing-6);
}

.home-hero {
  margin-bottom: var(--spacing-12);
}

.home-title {
  font-family: var(--font-ui);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
}

.home-subtitle {
  margin-top: var(--spacing-3);
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.game-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-4);
}

@media (min-width: 640px) {
  .game-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .game-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
