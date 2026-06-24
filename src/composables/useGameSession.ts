import { ref, computed } from 'vue'
import type { GameResult } from '@/types/game'

export type MatchFormat = 'single' | 'bo3' | 'bo5' | 'bo7'

interface GameSession {
  format: MatchFormat
  player1Score: number
  player2Score: number
  currentRound: number
  isSessionComplete: boolean
}

const winsRequired: Record<MatchFormat, number> = {
  single: 1,
  bo3: 2,
  bo5: 3,
  bo7: 4,
}

const totalRoundsMap: Record<MatchFormat, number> = {
  single: 1,
  bo3: 3,
  bo5: 5,
  bo7: 7,
}

export function useGameSession(format: MatchFormat = 'single') {
  const session = ref<GameSession>({
    format,
    player1Score: 0,
    player2Score: 0,
    currentRound: 1,
    isSessionComplete: false,
  })

  const totalRounds = computed(() => totalRoundsMap[session.value.format])
  const requiredWins = computed(() => winsRequired[session.value.format])

  function recordResult(result: GameResult) {
    if (session.value.isSessionComplete) return

    if (result.outcome === 'win') {
      if (result.winner === 'player1') {
        session.value.player1Score++
      } else if (result.winner === 'player2' || result.winner === 'cpu') {
        session.value.player2Score++
      }
    }
    // Draws don't increment scores but still advance the round

    // Check if session is complete
    if (
      session.value.player1Score >= requiredWins.value ||
      session.value.player2Score >= requiredWins.value ||
      session.value.currentRound >= totalRounds.value
    ) {
      session.value.isSessionComplete = true
    } else {
      session.value.currentRound++
    }
  }

  function reset(newFormat?: MatchFormat) {
    session.value = {
      format: newFormat || session.value.format,
      player1Score: 0,
      player2Score: 0,
      currentRound: 1,
      isSessionComplete: false,
    }
  }

  const sessionWinner = computed(() => {
    if (!session.value.isSessionComplete) return null
    if (session.value.player1Score > session.value.player2Score) return 'player1'
    if (session.value.player2Score > session.value.player1Score) return 'player2'
    return 'draw'
  })

  return {
    session,
    totalRounds,
    recordResult,
    reset,
    sessionWinner,
  }
}
