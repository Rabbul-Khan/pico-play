import {
  type Board,
  type Player,
  checkWinner,
  getAvailableMoves,
  isBoardFull,
  makeMove,
} from './logic'

export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * Minimax with alpha-beta pruning.
 * Returns the heuristic score for the given board state.
 *   +10 - depth  → maximizer wins (sooner is better)
 *   -10 + depth  → minimizer wins (later is better for maximizer)
 *   0            → draw
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
): number {
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X'
  const { winner } = checkWinner(board)

  if (winner === aiPlayer) return 10 - depth
  if (winner === opponent) return -10 + depth
  if (isBoardFull(board)) return 0

  const moves = getAvailableMoves(board)

  if (isMaximizing) {
    let best = -Infinity
    for (const move of moves) {
      const next = makeMove(board, move, aiPlayer)
      const score = minimax(next, depth + 1, false, alpha, beta, aiPlayer)
      best = Math.max(best, score)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      const next = makeMove(board, move, opponent)
      const score = minimax(next, depth + 1, true, alpha, beta, aiPlayer)
      best = Math.min(best, score)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return best
  }
}

/** Find the optimal move using minimax */
function findBestMove(board: Board, aiPlayer: Player): number {
  const moves = getAvailableMoves(board)
  let bestScore = -Infinity
  let bestMove = moves[0]

  for (const move of moves) {
    const next = makeMove(board, move, aiPlayer)
    const score = minimax(next, 1, false, -Infinity, Infinity, aiPlayer)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

/** Pick a random available move */
function randomMove(board: Board): number {
  const moves = getAvailableMoves(board)
  return moves[Math.floor(Math.random() * moves.length)]
}

/**
 * Get the AI's move based on difficulty.
 * - Easy:   70% random, 30% minimax
 * - Medium: 30% random, 70% minimax
 * - Hard:   100% minimax (perfect play)
 */
export function getBestMove(
  board: Board,
  aiPlayer: Player,
  difficulty: Difficulty,
): number {
  const moves = getAvailableMoves(board)
  if (moves.length === 0) return -1

  // On first move with empty board, pick a strategic position quickly
  if (moves.length === 9) {
    // Hard: always center. Others: random between corners and center.
    if (difficulty === 'hard') return 4
    const preferred = [0, 2, 4, 6, 8]
    return preferred[Math.floor(Math.random() * preferred.length)]
  }

  const randomChance =
    difficulty === 'easy' ? 0.7 :
    difficulty === 'medium' ? 0.3 :
    0 // hard

  if (randomChance > 0 && Math.random() < randomChance) {
    return randomMove(board)
  }

  return findBestMove(board, aiPlayer)
}
