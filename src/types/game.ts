import type { Component } from 'vue'

export type GameMode = 'singlePlayer' | 'vsComputer' | 'localMultiplayer'

/** Static metadata: how complex is the game to understand/master */
export type GameComplexity = 'easy' | 'medium' | 'hard'

export interface SettingField {
  key: string
  label: string
  type: 'select' | 'toggle' | 'range'
  options?: { label: string; value: string | number | boolean }[]
  default: string | number | boolean
  min?: number
  max?: number
  step?: number
  /** Only show this field when another field matches a value */
  showWhen?: { key: string; value: string | number | boolean }
}

export type ResolvedSettings = Record<string, string | number | boolean>

export interface GameResult {
  outcome: 'win' | 'loss' | 'draw'
  winner?: 'player1' | 'player2' | 'cpu'
  score?: number
}

export interface GameModule {
  id: string
  name: string
  description: string
  complexity: GameComplexity
  icon: Component
  supportedModes: GameMode[]

  /**
   * The SettingsModal renders its form entirely from this array.
   * No fields are auto-injected except a mode selector when
   * supportedModes.length > 1.
   *
   * The game owns ALL of its settings — including AI difficulty,
   * grid size, match format, and any game-specific options.
   */
  settingsSchema: SettingField[]

  instructions: Component
  component: Component
}
