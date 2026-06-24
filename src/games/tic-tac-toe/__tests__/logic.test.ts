import { describe, it, expect } from 'vitest'
import {
  createBoard,
  makeMove,
  checkWinner,
  getAvailableMoves,
  isBoardFull,
  getGameStatus,
  type Board,
} from '../logic'

describe('createBoard', () => {
  it('creates an empty 9-cell board', () => {
    const board = createBoard()
    expect(board).toHaveLength(9)
    expect(board.every(cell => cell === null)).toBe(true)
  })
})

describe('makeMove', () => {
  it('places a mark on an empty cell', () => {
    const board = createBoard()
    const next = makeMove(board, 0, 'X')
    expect(next[0]).toBe('X')
    expect(board[0]).toBeNull() // original unchanged
  })

  it('returns the same board for an occupied cell', () => {
    const board = makeMove(createBoard(), 0, 'X')
    const next = makeMove(board, 0, 'O')
    expect(next).toBe(board) // same reference — no mutation
  })

  it('returns the same board for out-of-range index', () => {
    const board = createBoard()
    expect(makeMove(board, -1, 'X')).toBe(board)
    expect(makeMove(board, 9, 'X')).toBe(board)
  })
})

describe('checkWinner', () => {
  it('detects row wins', () => {
    // Top row: X X X
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('X')
    expect(result.line).toEqual([0, 1, 2])
  })

  it('detects column wins', () => {
    // Left column: O O O
    const board: Board = [
      'O', 'X', null,
      'O', 'X', null,
      'O', null, null,
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('O')
    expect(result.line).toEqual([0, 3, 6])
  })

  it('detects diagonal win (top-left to bottom-right)', () => {
    const board: Board = [
      'X', 'O', null,
      null, 'X', 'O',
      null, null, 'X',
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('X')
    expect(result.line).toEqual([0, 4, 8])
  })

  it('detects diagonal win (top-right to bottom-left)', () => {
    const board: Board = [
      null, null, 'O',
      'X', 'O', null,
      'O', 'X', 'X',
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('O')
    expect(result.line).toEqual([2, 4, 6])
  })

  it('returns null when no winner', () => {
    const board: Board = [
      'X', 'O', 'X',
      'X', 'O', null,
      'O', 'X', null,
    ]
    const result = checkWinner(board)
    expect(result.winner).toBeNull()
    expect(result.line).toBeNull()
  })

  it('detects middle row win', () => {
    const board: Board = [
      'X', null, null,
      'O', 'O', 'O',
      'X', null, 'X',
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('O')
    expect(result.line).toEqual([3, 4, 5])
  })

  it('detects bottom row win', () => {
    const board: Board = [
      'O', null, null,
      null, 'O', null,
      'X', 'X', 'X',
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('X')
    expect(result.line).toEqual([6, 7, 8])
  })

  it('detects middle column win', () => {
    const board: Board = [
      null, 'X', 'O',
      null, 'X', 'O',
      null, 'X', null,
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('X')
    expect(result.line).toEqual([1, 4, 7])
  })

  it('detects right column win', () => {
    const board: Board = [
      null, null, 'O',
      'X', 'X', 'O',
      null, null, 'O',
    ]
    const result = checkWinner(board)
    expect(result.winner).toBe('O')
    expect(result.line).toEqual([2, 5, 8])
  })
})

describe('getAvailableMoves', () => {
  it('returns all indices for an empty board', () => {
    expect(getAvailableMoves(createBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('returns only empty indices', () => {
    const board: Board = [
      'X', null, 'O',
      null, 'X', null,
      null, null, 'O',
    ]
    expect(getAvailableMoves(board)).toEqual([1, 3, 5, 6, 7])
  })

  it('returns empty array for a full board', () => {
    const board: Board = [
      'X', 'O', 'X',
      'O', 'X', 'O',
      'O', 'X', 'O',
    ]
    expect(getAvailableMoves(board)).toEqual([])
  })
})

describe('isBoardFull', () => {
  it('returns false for an empty board', () => {
    expect(isBoardFull(createBoard())).toBe(false)
  })

  it('returns false for a partially filled board', () => {
    const board = makeMove(createBoard(), 4, 'X')
    expect(isBoardFull(board)).toBe(false)
  })

  it('returns true for a full board', () => {
    const board: Board = [
      'X', 'O', 'X',
      'O', 'X', 'O',
      'O', 'X', 'O',
    ]
    expect(isBoardFull(board)).toBe(true)
  })
})

describe('getGameStatus', () => {
  it('returns "playing" for an empty board', () => {
    expect(getGameStatus(createBoard())).toBe('playing')
  })

  it('returns "win-x" when X wins', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ]
    expect(getGameStatus(board)).toBe('win-x')
  })

  it('returns "win-o" when O wins', () => {
    const board: Board = [
      'X', 'X', null,
      'O', 'O', 'O',
      'X', null, null,
    ]
    expect(getGameStatus(board)).toBe('win-o')
  })

  it('returns "draw" for a full board with no winner', () => {
    const board: Board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ]
    expect(getGameStatus(board)).toBe('draw')
  })
})
