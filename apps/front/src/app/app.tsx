import { Game } from '@bandeirantes/events';
import { Table } from './components';
import { GameProvider } from './contexts';
import { Lobby } from './pages';

const game: Game = {
  lands: [
    [
      { id: '1', owner: { color: 'blue' } as any, status: 'claimed' },
      { id: '2', owner: { color: 'blue' } as any, status: 'claimed' },
      { id: '3', owner: { color: 'blue' } as any, status: 'claimed' },
    ],
    [
      { id: '1', owner: null, status: 'claimed' },
      { id: '2', owner: null, status: 'claimed' },
      { id: '3', owner: null, status: 'claimed' },
    ],
  ],
} as any;

export function App() {
  return (
    <GameProvider>
      <Table game={game} />
      <Lobby />
    </GameProvider>
  );
}

export default App;
