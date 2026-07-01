import type { GameModule } from '@/types/game'
import SnakeIcon from './SnakeIcon.vue'
import SnakeBoard from './SnakeBoard.vue'
import SnakeInstructions from './SnakeInstructions.vue'

const snake: GameModule = {
  id: 'snake',
  name: 'Snake',
  description: 'Classic arcade game',
  complexity: 'medium',
  icon: SnakeIcon,
  supportedModes: ['singlePlayer'],
  settingsSchema: [
    {
      key: 'speed',
      label: 'Speed',
      type: 'select',
      options: [
        { label: 'Slow', value: 'slow' },
        { label: 'Normal', value: 'normal' },
        { label: 'Fast', value: 'fast' },
      ],
      default: 'normal',
    },
    {
      key: 'gridSize',
      label: 'Grid Size',
      type: 'select',
      options: [
        { label: 'Small (15×15)', value: 'small' },
        { label: 'Medium (20×20)', value: 'medium' },
        { label: 'Large (25×25)', value: 'large' },
      ],
      default: 'medium',
    },
  ],
  instructions: SnakeInstructions,
  component: SnakeBoard,
}

export default snake
