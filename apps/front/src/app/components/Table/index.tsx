import { Game } from '@bandeirantes/events';
import { TableLine } from './TableLine';

export type TableProps = { game: Game };

export function Table({ game }: TableProps) {
  return (
    <div>
      {game.lands.map((lineOfLands) => (
        <TableLine lands={lineOfLands} />
      ))}
    </div>
  );
}
