export interface Position {
  x: number
  y: number
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

/**
 * Initializes a 3-segment snake horizontally at the center of the grid, facing RIGHT.
 */
export function createSnake(width: number, height: number): Position[] {
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)

  return [
    { x: centerX, y: centerY },     // Head
    { x: centerX - 1, y: centerY }, // Body 1
    { x: centerX - 2, y: centerY }, // Body 2
  ]
}

/**
 * Moves the snake one step in the specified direction.
 * Prepends a new head and removes the tail unless grow is true.
 */
export function moveSnake(snake: Position[], direction: Direction, grow: boolean): Position[] {
  if (snake.length === 0) return []

  const head = snake[0]
  const newHead = { x: head.x, y: head.y }

  switch (direction) {
    case 'UP':
      newHead.y--
      break
    case 'DOWN':
      newHead.y++
      break
    case 'LEFT':
      newHead.x--
      break
    case 'RIGHT':
      newHead.x++
      break
  }

  const newSnake = [newHead, ...snake]
  if (!grow) {
    newSnake.pop()
  }

  return newSnake
}

/**
 * Checks if the head of the snake collides with walls or self.
 * Note: snakeBody should be the rest of the snake body (excluding the head).
 */
export function checkCollision(head: Position, snakeBody: Position[], width: number, height: number): boolean {
  // Check wall collision
  if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
    return true
  }

  // Check self collision
  return snakeBody.some(segment => segment.x === head.x && segment.y === head.y)
}

/**
 * Generates food at a random unoccupied cell on the grid.
 * If the grid is completely full, returns { x: -1, y: -1 }.
 */
export function generateFood(snake: Position[], width: number, height: number): Position {
  const snakeSet = new Set(snake.map(p => `${p.x},${p.y}`))
  const emptyCells: Position[] = []

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (!snakeSet.has(`${x},${y}`)) {
        emptyCells.push({ x, y })
      }
    }
  }

  if (emptyCells.length === 0) {
    return { x: -1, y: -1 }
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length)
  return emptyCells[randomIndex]
}
