import { defineStore } from 'pinia'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { computed } from 'vue'

export type Theme = 'dark' | 'light' | 'mono'

const STORAGE_KEY = 'picoplay-theme'
const THEME_ORDER: Theme[] = ['dark', 'light', 'mono']

export const useThemeStore = defineStore('theme', () => {
  const theme = useLocalStorage<Theme>(STORAGE_KEY, 'dark')

  const themeLabel = computed(() => {
    const labels: Record<Theme, string> = {
      dark: 'Dark',
      light: 'Light',
      mono: 'Monochrome',
    }
    return labels[theme.value]
  })

  function setTheme(t: Theme) {
    theme.value = t
    applyTheme(t)
  }

  function cycleTheme() {
    const currentIndex = THEME_ORDER.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length
    setTheme(THEME_ORDER[nextIndex])
  }

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t)
  }

  // Apply on store creation
  applyTheme(theme.value)

  return {
    theme,
    themeLabel,
    setTheme,
    cycleTheme,
  }
})
