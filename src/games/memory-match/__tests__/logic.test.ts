import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, type Card } from '../logic'

describe('Memory Match Logic', () => {
  describe('createDeck', () => {
    it('should create a deck with 16 cards for 4x4 grid', () => {
      const deck = createDeck('4x4')
      expect(deck).toHaveLength(16)
    })

    it('should create a deck with 20 cards for 4x5 grid', () => {
      const deck = createDeck('4x5')
      expect(deck).toHaveLength(20)
    })

    it('should create a deck with 36 cards for 6x6 grid', () => {
      const deck = createDeck('6x6')
      expect(deck).toHaveLength(36)
    })

    it('should contain pairs of symbolIds', () => {
      const deck = createDeck('4x4')
      const counts: Record<number, number> = {}

      for (const card of deck) {
        counts[card.symbolId] = (counts[card.symbolId] || 0) + 1
      }

      // 4x4 deck should have 8 pairs (symbolId 0 to 7)
      expect(Object.keys(counts)).toHaveLength(8)
      for (let i = 0; i < 8; i++) {
        expect(counts[i]).toBe(2)
      }
    })

    it('should initialize cards as unflipped and unmatched', () => {
      const deck = createDeck('4x4')
      for (const card of deck) {
        expect(card.isFlipped).toBe(false)
        expect(card.isMatched).toBe(false)
      }
    })
  })

  describe('shuffle', () => {
    it('should return a new array with the same items', () => {
      const deck = createDeck('4x4')
      const shuffled = shuffle(deck)

      expect(shuffled).toHaveLength(deck.length)
      expect(shuffled).not.toBe(deck) // should be a new array reference

      // Sort both by ID to verify they contain the same objects
      const deckSortedIds = [...deck].map(c => c.id).sort((a, b) => a - b)
      const shuffledSortedIds = [...shuffled].map(c => c.id).sort((a, b) => a - b)
      expect(shuffledSortedIds).toEqual(deckSortedIds)
    })

    it('should randomize the order (probabilistic check)', () => {
      // Create a deck of 36 elements (symbolIds 0 to 17 twice)
      const deck: Card[] = []
      for (let i = 0; i < 18; i++) {
        deck.push({ id: i * 2, symbolId: i, isFlipped: false, isMatched: false })
        deck.push({ id: i * 2 + 1, symbolId: i, isFlipped: false, isMatched: false })
      }

      // Shuffle it multiple times and check if at least one is different from the original
      let isDifferent = false
      for (let attempt = 0; attempt < 5; attempt++) {
        const shuffled = shuffle(deck)
        const orderMatches = shuffled.every((card, idx) => card.id === deck[idx].id)
        if (!orderMatches) {
          isDifferent = true
          break
        }
      }

      expect(isDifferent).toBe(true)
    })
  })
})
