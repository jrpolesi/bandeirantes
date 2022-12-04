import { useEffect } from 'react';
import { Table } from '../../components';
import { useGameContext } from '../../contexts';

export function Game({ game }: any) {
  const { setIsConnected, changeDirection } = useGameContext();
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      console.log(event.key === ' ');
      switch (event.key) {
        case 'w':
        case 'ArrowUp':
          changeDirection('north');
          break;
        case 'd':
        case 'ArrowRight':
          changeDirection('east');
          break;
        case 's':
        case 'ArrowDown':
          changeDirection('south');
          break;
        case 'a':
        case 'ArrowLeft':
          changeDirection('west');
          break;
        case ' ':
          changeDirection(null);
          break;
        default:
      }
    }

    document.body.addEventListener('keydown', handleKeydown);

    return () => document.body.removeEventListener('keydown', handleKeydown);
  }, []);

  if (game) {
    return (
      <>
        <Table game={game} />
        <button onClick={() => setIsConnected(false)}>voltar</button>
      </>
    );
  }

  return (
    <>
      <div>aguarde</div>

      <button onClick={() => setIsConnected(false)}>voltar</button>
    </>
  );
}
