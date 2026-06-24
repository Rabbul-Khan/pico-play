import { describe, it, expect } from 'vitest'
import { getBestMove } from '../ai'
import { type Board, getAvailableMoves } from '../logic'

describe('getBestMove', () => {
  it('returns a valid move index', () => {
    const board: Board = [
      'X', null, 'O',
      null, 'X', null,
      null, null, null,
    ]
    const move = getBestMove(board, 'O', 'hard')
    const available = getAvailableMoves(board)
    expect(available).toContain(move)
  })

  it('takes an immediate winning move on hard', () => {
    // O can win by playing index 2
    const board: Board = [
      'X', 'X', null,
      'O', 'O', null,
      null, null, 'X',
    ]
    const move = getBestMove(board, 'O', 'hard')
    expect(move).toBe(5) // O O _ → O O O (row 1, index 5)
  })

  it('blocks opponent winning move on hard', () => {
    // X is about to win with index 2 (top row)
    // O (AI) must block
    const board: Board = [
      'X', 'X', null,
      'O', 'O', null,
      null, null, null,
    ]
    const move = getBestMove(board, 'O', 'hard')
    // O should either block X at index 2 or take its own win at index 5
    // Index 5 wins immediately, so that's the best move
    expect(move).toBe(5)
  })

  it('blocks when no immediate win available on hard', () => {
    // X threatens top row: X X _
    // O has no immediate win
    const board: Board = [
      'X', 'X', null,
      'O', null, null,
      null, null, null,
    ]
    const move = getBestMove(board, 'O', 'hard')
    expect(move).toBe(2) // must block top row
  })

  it('handles nearly full board', () => {
    const board: Board = [
      'X', 'O', 'X',
      'O', 'X', 'O',
      'O', 'X', null,
    ]
    const move = getBestMove(board, 'O', 'hard')
    expect(move).toBe(8) // only move available
  })

  it('returns -1 for a full board', () => {
    const board: Board = [
      'X', 'O', 'X',
      'O', 'X', 'O',
      'O', 'X', 'O',
    ]
    const move = getBestMove(board, 'O', 'hard')
    expect(move).toBe(-1)
  })

  it('easy difficulty sometimes makes suboptimal moves', () => {
    // Run many iterations — easy should NOT always pick the optimal move
    const board: Board = [
      'X', 'X', null,
      'O', null, null,
      null, null, null,
    ]

    let blockedCount = 0
    const iterations = 100

    for (let i = 0; i < iterations; i++) {
      const move = getBestMove(board, 'O', 'easy')
      if (move === 2) blockedCount++
    }

    // Easy blocks 30% of the time (minimax) — should NOT block every time
    // With 70% random, the chance of always blocking is astronomically low
    expect(blockedCount).toBeLessThan(iterations)
    // But should block at least sometimes
    expect(blockedCount).toBeGreaterThan(0)
  })
})
