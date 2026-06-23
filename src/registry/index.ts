import type { GameModule } from '@/types/game'

// TODO: Replace mock with real games starting at Milestone 4
import mockGame from '@/games/_mock'

export const games: GameModule[] = [
  mockGame,
]

export const gameById = new Map<string, GameModule>(
  games.map(g => [g.id, g])
)
