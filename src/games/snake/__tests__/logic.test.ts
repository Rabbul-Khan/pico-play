import { describe, it, expect } from 'vitest'
import { createSnake, moveSnake, checkCollision, generateFood, type Position } from '../logic'

describe('Snake Logic', () => {
  describe('createSnake', () => {
    it('should create a 3-segment snake in the center of the grid', () => {
      const snake = createSnake(20, 20)
      expect(snake).toHaveLength(3)
      // Head should be at center: Math.floor(20 / 2) = 10
      expect(snake[0]).toEqual({ x: 10, y: 10 })
      expect(snake[1]).toEqual({ x: 9, y: 10 })
      expect(snake[2]).toEqual({ x: 8, y: 10 })
    })
  })

  describe('moveSnake', () => {
    it('should move the head UP and pop the tail if not growing', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const moved = moveSnake(snake, 'UP', false)
      expect(moved).toHaveLength(3)
      expect(moved[0]).toEqual({ x: 10, y: 9 })
      expect(moved[1]).toEqual({ x: 10, y: 10 })
      expect(moved[2]).toEqual({ x: 9, y: 10 })
    })

    it('should move the head DOWN and pop the tail if not growing', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const moved = moveSnake(snake, 'DOWN', false)
      expect(moved[0]).toEqual({ x: 10, y: 11 })
      expect(moved[2]).toEqual({ x: 9, y: 10 })
    })

    it('should move the head LEFT and pop the tail if not growing', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const moved = moveSnake(snake, 'LEFT', false)
      expect(moved[0]).toEqual({ x: 9, y: 10 })
    })

    it('should move the head RIGHT and pop the tail if not growing', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const moved = moveSnake(snake, 'RIGHT', false)
      expect(moved[0]).toEqual({ x: 11, y: 10 })
    })

    it('should grow by keeping the tail when grow is true', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const moved = moveSnake(snake, 'UP', true)
      expect(moved).toHaveLength(4)
      expect(moved[0]).toEqual({ x: 10, y: 9 })
      expect(moved[1]).toEqual({ x: 10, y: 10 })
      expect(moved[2]).toEqual({ x: 9, y: 10 })
      expect(moved[3]).toEqual({ x: 8, y: 10 })
    })
  })

  describe('checkCollision', () => {
    it('should return false when snake is within bounds and has no self-collision', () => {
      const head = { x: 10, y: 10 }
      const body = [{ x: 9, y: 10 }, { x: 8, y: 10 }]
      expect(checkCollision(head, body, 20, 20)).toBe(false)
    })

    it('should return true when head is out of bounds (negative x)', () => {
      const head = { x: -1, y: 10 }
      const body = [{ x: 0, y: 10 }]
      expect(checkCollision(head, body, 20, 20)).toBe(true)
    })

    it('should return true when head is out of bounds (x >= width)', () => {
      const head = { x: 20, y: 10 }
      const body = [{ x: 19, y: 10 }]
      expect(checkCollision(head, body, 20, 20)).toBe(true)
    })

    it('should return true when head is out of bounds (negative y)', () => {
      const head = { x: 10, y: -1 }
      const body = [{ x: 10, y: 0 }]
      expect(checkCollision(head, body, 20, 20)).toBe(true)
    })

    it('should return true when head is out of bounds (y >= height)', () => {
      const head = { x: 10, y: 20 }
      const body = [{ x: 10, y: 19 }]
      expect(checkCollision(head, body, 20, 20)).toBe(true)
    })

    it('should return true on self-collision', () => {
      // Head coordinates matches a segment of the body
      const head = { x: 9, y: 10 }
      const body = [{ x: 9, y: 10 }, { x: 9, y: 11 }]
      expect(checkCollision(head, body, 20, 20)).toBe(true)
    })
  })

  describe('generateFood', () => {
    it('should generate food within bounds and not on snake body', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const food = generateFood(snake, 20, 20)

      expect(food.x).toBeGreaterThanOrEqual(0)
      expect(food.x).toBeLessThan(20)
      expect(food.y).toBeGreaterThanOrEqual(0)
      expect(food.y).toBeLessThan(20)

      const onSnake = snake.some(s => s.x === food.x && s.y === food.y)
      expect(onSnake).toBe(false)
    })

    it('should return { x: -1, y: -1 } if the board is completely full', () => {
      const snake: Position[] = []
      // Fill a 3x3 board
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          snake.push({ x, y })
        }
      }

      const food = generateFood(snake, 3, 3)
      expect(food).toEqual({ x: -1, y: -1 })
    })
  })
})
