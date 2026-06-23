<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore, type Theme } from '@/stores/theme'

const themeStore = useThemeStore()

const iconPath = computed(() => {
  const paths: Record<Theme, string> = {
    // Sun icon — shown when currently in dark mode (click to go to light)
    dark: 'M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
    // Moon icon — shown when currently in light mode (click to go to mono)
    light: 'M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z',
    // Monitor icon — shown when currently in mono (click to go to dark)
    mono: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm6 13h8m-4-2v2',
  }
  return paths[themeStore.theme]
})

const ariaLabel = computed(() => {
  const labels: Record<Theme, string> = {
    dark: 'Switch to light theme',
    light: 'Switch to monochrome theme',
    mono: 'Switch to dark theme',
  }
  return labels[themeStore.theme]
})
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    @click="themeStore.cycleTheme()"
  >
    <svg
      class="theme-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path :d="iconPath" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
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
  transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
}

.theme-toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
  background-color: var(--color-surface-hover);
}

.theme-icon {
  transition: transform 150ms ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(15deg);
}
</style>
