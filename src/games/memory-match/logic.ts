export interface Card {
  id: number
  symbolId: number
  isFlipped: boolean
  isMatched: boolean
}

/**
 * Shuffles a card deck using the Fisher-Yates algorithm.
 */
export function shuffle(deck: Card[]): Card[] {
  const result = [...deck]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Creates and shuffles a deck of cards based on the grid size.
 * Supported sizes: '4x4' (16 cards, 8 pairs), '4x5' (20 cards, 10 pairs), '6x6' (36 cards, 18 pairs)
 */
export function createDeck(gridSize: string): Card[] {
  let numCards = 16
  if (gridSize === '4x5') {
    numCards = 20
  } else if (gridSize === '6x6') {
    numCards = 36
  }

  const numPairs = numCards / 2
  const deck: Card[] = []

  for (let i = 0; i < numPairs; i++) {
    // Add two cards for each symbol ID
    deck.push({
      id: i * 2,
      symbolId: i,
      isFlipped: false,
      isMatched: false,
    })
    deck.push({
      id: i * 2 + 1,
      symbolId: i,
      isFlipped: false,
      isMatched: false,
    })
  }

  return shuffle(deck)
}
