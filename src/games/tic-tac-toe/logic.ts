export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]

export interface WinResult {
  winner: Player | null
  line: number[] | null
}

export type GameStatus = 'playing' | 'win-x' | 'win-o' | 'draw'

/** All 8 possible winning lines on a 3×3 board */
const WIN_LINES: readonly number[][] = [
  [0, 1, 2], // row 0
  [3, 4, 5], // row 1
  [6, 7, 8], // row 2
  [0, 3, 6], // col 0
  [1, 4, 7], // col 1
  [2, 5, 8], // col 2
  [0, 4, 8], // diagonal ↘
  [2, 4, 6], // diagonal ↙
]

/** Create a fresh empty board */
export function createBoard(): Board {
  return Array(9).fill(null)
}

/** Return a new board with the move applied (immutable) */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (index < 0 || index >= 9 || board[index] !== null) {
    return board
  }
  const next = [...board]
  next[index] = player
  return next
}

/** Check if there is a winner and which line won */
export function checkWinner(board: Board): WinResult {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  return { winner: null, line: null }
}

/** Get all available (empty) cell indices */
export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((moves, cell, i) => {
    if (cell === null) moves.push(i)
    return moves
  }, [])
}

/** Check if the board is completely filled */
export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null)
}

/** Get the current game status */
export function getGameStatus(board: Board): GameStatus {
  const { winner } = checkWinner(board)
  if (winner === 'X') return 'win-x'
  if (winner === 'O') return 'win-o'
  if (isBoardFull(board)) return 'draw'
  return 'playing'
}
