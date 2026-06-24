import type { GameModule } from '@/types/game'
import TicTacToeIcon from './TicTacToeIcon.vue'
import TicTacToeBoard from './TicTacToeBoard.vue'
import TicTacToeInstructions from './TicTacToeInstructions.vue'

const ticTacToe: GameModule = {
  id: 'tic-tac-toe',
  name: 'Tic Tac Toe',
  description: 'Classic 3×3 strategy game',
  complexity: 'easy',
  icon: TicTacToeIcon,
  supportedModes: ['vsComputer', 'localMultiplayer'],
  settingsSchema: [
    {
      key: 'difficulty',
      label: 'Difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      default: 'medium',
      showWhen: { key: 'mode', value: 'vsComputer' },
    },
    {
      key: 'firstMove',
      label: 'First Move',
      type: 'select',
      options: [
        { label: 'Player', value: 'player' },
        { label: 'CPU', value: 'cpu' },
        { label: 'Random', value: 'random' },
      ],
      default: 'player',
      showWhen: { key: 'mode', value: 'vsComputer' },
    },
    {
      key: 'matchFormat',
      label: 'Match Format',
      type: 'select',
      options: [
        { label: 'Single Match', value: 'single' },
        { label: 'Best of 3', value: 'bo3' },
        { label: 'Best of 5', value: 'bo5' },
      ],
      default: 'single',
    },
  ],
  instructions: TicTacToeInstructions,
  component: TicTacToeBoard,
}

export default ticTacToe
