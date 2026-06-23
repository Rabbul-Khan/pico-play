<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ThemeIcon from '@/components/icons/ThemeIcon.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-inner">
      <RouterLink to="/" class="wordmark" aria-label="PicoPlay — Home">
        <span class="wordmark-pico">Pico</span><span
          class="wordmark-play"
          :class="{ 'wordmark-play--mono': themeStore.theme === 'mono' }"
        >Play</span>
      </RouterLink>

      <ThemeIcon />
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 56px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
  transition: background-color 150ms ease, border-color 150ms ease;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.wordmark {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: opacity 150ms ease;
}

.wordmark:hover {
  opacity: 0.8;
}

.wordmark-play {
  color: var(--color-accent);
}

.wordmark-play--mono {
  color: var(--color-text-primary);
  font-weight: 800;
}
</style>
