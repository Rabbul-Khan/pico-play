import type { GameModule } from '@/types/game'

export const games: GameModule[] = []

export const gameById = new Map<string, GameModule>(
  games.map(g => [g.id, g])
)
