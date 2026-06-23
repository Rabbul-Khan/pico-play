import type { GameModule } from '@/types/game'
import MockIcon from './MockIcon.vue'
import MockBoard from './MockBoard.vue'
import MockInstructions from './MockInstructions.vue'

const mockGame: GameModule = {
  id: 'mock',
  name: 'Mock Game',
  description: 'A test game to verify platform flow',
  complexity: 'easy',
  icon: MockIcon,
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
      key: 'size',
      label: 'Grid Size',
      type: 'select',
      options: [
        { label: 'Small (2×2)', value: 'small' },
        { label: 'Medium (3×3)', value: 'medium' },
        { label: 'Large (5×5)', value: 'large' },
      ],
      default: 'medium',
    },
    {
      key: 'matchFormat',
      label: 'Match Format',
      type: 'select',
      options: [
        { label: 'Single Match', value: 'single' },
        { label: 'Best of 3', value: 'bo3' },
      ],
      default: 'single',
    },
  ],
  instructions: MockInstructions,
  component: MockBoard,
}

export default mockGame
