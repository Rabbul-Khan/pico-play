import type { GameModule } from '@/types/game'
import ticTacToe from '@/games/tic-tac-toe'

export const games: GameModule[] = [
  ticTacToe,
]

export const gameById = new Map<string, GameModule>(
  games.map(g => [g.id, g])
)
