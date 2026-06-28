import type { GameModule } from '@/types/game'
import MemoryMatchIcon from './MemoryMatchIcon.vue'
import MemoryMatchBoard from './MemoryMatchBoard.vue'
import MemoryMatchInstructions from './MemoryMatchInstructions.vue'

const memoryMatch: GameModule = {
  id: 'memory-match',
  name: 'Memory Match',
  description: 'Flip cards to find matching pairs',
  complexity: 'easy',
  icon: MemoryMatchIcon,
  supportedModes: ['singlePlayer', 'localMultiplayer'],
  settingsSchema: [
    {
      key: 'gridSize',
      label: 'Grid Size',
      type: 'select',
      options: [
        { label: '4×4 (8 pairs)', value: '4x4' },
        { label: '4×5 (10 pairs)', value: '4x5' },
        { label: '6×6 (18 pairs)', value: '6x6' },
      ],
      default: '4x4',
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
      showWhen: { key: 'mode', value: 'localMultiplayer' },
    },
  ],
  instructions: MemoryMatchInstructions,
  component: MemoryMatchBoard,
}

export default memoryMatch
