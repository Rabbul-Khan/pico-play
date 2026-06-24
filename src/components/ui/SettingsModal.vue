<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GameModule, GameMode, SettingField, ResolvedSettings } from '@/types/game'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps<{
  open: boolean
  game: GameModule
}>()

const emit = defineEmits<{
  close: []
  start: [settings: ResolvedSettings]
}>()

// Build initial settings from schema defaults
function buildDefaults(): ResolvedSettings {
  const defaults: ResolvedSettings = {}

  // Auto-inject mode if multiple modes supported
  if (props.game.supportedModes.length > 1) {
    defaults.mode = props.game.supportedModes[0]
  } else if (props.game.supportedModes.length === 1) {
    defaults.mode = props.game.supportedModes[0]
  }

  for (const field of props.game.settingsSchema) {
    defaults[field.key] = field.default
  }

  return defaults
}

const settings = ref<ResolvedSettings>(buildDefaults())

// Reset settings when modal opens or game changes
watch(() => [props.open, props.game.id], () => {
  if (props.open) {
    settings.value = buildDefaults()
  }
})

// Whether to show the mode selector
const showModeSelector = computed(() => props.game.supportedModes.length > 1)

// Mode labels
const modeLabels: Record<GameMode, string> = {
  singlePlayer: '1 Player',
  vsComputer: 'vs Computer',
  localMultiplayer: '2 Player',
}

// Determine which fields are visible (respecting showWhen)
function isFieldVisible(field: SettingField): boolean {
  if (!field.showWhen) return true
  return settings.value[field.showWhen.key] === field.showWhen.value
}

function handleStart() {
  emit('start', { ...settings.value })
}
</script>

<template>
  <Modal :open="open" aria-label="Game settings" @close="emit('close')">
    <div class="settings-modal">
      <h2 class="settings-title">{{ game.name }}</h2>

      <form class="settings-form" @submit.prevent="handleStart">
        <!-- Mode selector (auto-injected) -->
        <div v-if="showModeSelector" class="settings-mode-container">
          <div class="settings-field">
            <label class="settings-label" id="mode-label">Mode</label>
            <div class="segmented-control" role="group" aria-labelledby="mode-label">
              <button
                v-for="mode in game.supportedModes"
                :key="mode"
                type="button"
                class="segmented-btn"
                :class="{ 'segmented-btn--active': settings.mode === mode }"
                @click="settings.mode = mode"
              >
                {{ modeLabels[mode] }}
              </button>
            </div>
          </div>
        </div>

        <!-- Schema-driven fields -->
        <template v-for="field in game.settingsSchema" :key="field.key">
          <transition name="slide-field">
            <div v-show="isFieldVisible(field)" class="settings-field-container">
              <div class="settings-field">
                <label
                  class="settings-label"
                  :id="`label-${field.key}`"
                >
                  {{ field.label }}
                </label>

                <!-- Segmented Control for 'select' -->
                <div 
                  v-if="field.type === 'select'" 
                  class="segmented-control" 
                  role="group" 
                  :aria-labelledby="`label-${field.key}`"
                >
                  <button
                    v-for="opt in field.options"
                    :key="String(opt.value)"
                    type="button"
                    class="segmented-btn"
                    :class="{ 'segmented-btn--active': settings[field.key] === opt.value }"
                    @click="settings[field.key] = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>

            <!-- Toggle -->
            <button
              v-else-if="field.type === 'toggle'"
              type="button"
              :id="`setting-${field.key}`"
              class="settings-toggle"
              :class="{ 'settings-toggle--active': settings[field.key] }"
              :aria-pressed="!!settings[field.key]"
              @click="settings[field.key] = !settings[field.key]"
            >
              <span class="settings-toggle-thumb" />
            </button>

            <!-- Range -->
            <div v-else-if="field.type === 'range'" class="settings-range-wrapper">
              <input
                type="range"
                :id="`setting-${field.key}`"
                v-model.number="settings[field.key]"
                :min="field.min"
                :max="field.max"
                :step="field.step || 1"
                class="settings-range"
              />
              <span class="settings-range-value">{{ settings[field.key] }}</span>
            </div>
          </div>
        </div>
      </transition>
        </template>

        <button type="submit" class="settings-start">
          Start Game
        </button>
      </form>
    </div>
  </Modal>
</template>

<style scoped>
.settings-modal {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.settings-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.settings-form {
  display: flex;
  flex-direction: column;
}

.settings-mode-container {
  margin-bottom: var(--spacing-4);
}

.settings-field-container {
  margin-bottom: var(--spacing-4);
  overflow: hidden;
}

.slide-field-enter-active,
.slide-field-leave-active {
  transition: all 250ms cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-field-enter-from,
.slide-field-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  transform: translateY(-8px);
}

.slide-field-enter-to,
.slide-field-leave-from {
  opacity: 1;
  max-height: 100px;
  margin-bottom: var(--spacing-4);
  transform: translateY(0);
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.settings-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Segmented Control */
.segmented-control {
  display: flex;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.segmented-btn {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-2);
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-sm) - 2px);
  cursor: pointer;
  transition: all 150ms ease;
  text-align: center;
}

.segmented-btn:hover {
  color: var(--color-text-primary);
}

.segmented-btn--active {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Toggle */
.settings-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  background-color: var(--color-bg-primary);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
  padding: 0;
}

.settings-toggle--active {
  background-color: var(--color-accent-muted);
  border-color: var(--color-accent);
}

.settings-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--color-text-secondary);
  transition: transform 150ms ease, background-color 150ms ease;
}

.settings-toggle--active .settings-toggle-thumb {
  transform: translateX(20px);
  background-color: var(--color-accent);
}

/* Range */
.settings-range-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.settings-range {
  flex: 1;
  accent-color: var(--color-accent);
}

.settings-range-value {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  min-width: 28px;
  text-align: right;
}

/* Start button */
.settings-start {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-6);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-bg-primary);
  background-color: var(--color-accent);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 150ms ease;
}

.settings-start:hover {
  opacity: 0.9;
}

.settings-start:active {
  opacity: 0.8;
}
</style>
