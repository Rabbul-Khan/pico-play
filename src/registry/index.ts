import type { GameModule } from '@/types/game'
import ticTacToe from '@/games/tic-tac-toe'
import memoryMatch from '@/games/memory-match'

export const games: GameModule[] = [
  ticTacToe,
  memoryMatch,
]

export const gameById = new Map<string, GameModule>(
  games.map(g => [g.id, g])
)
