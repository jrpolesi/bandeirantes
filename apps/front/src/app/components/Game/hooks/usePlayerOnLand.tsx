import { Bandeirante } from '@bandeirantes/events';
import { useMemo } from 'react';

export type LandPosition = {
  x: number;
  y: number;
};

export function usePlayerOnLand(
  players: Array<Bandeirante>,
  landPosition: LandPosition
) {
  return useMemo(() => {
    return players.find(
      ({ position }) =>
        position.x === landPosition.x && position.y === landPosition.y
    );
  }, [players, landPosition]);
}
