import { Bandeirante, Land } from '@bandeirantes/events';
import styled from '@emotion/styled';
import { LandBlock } from '../LandBlock';

export type TableLineProps = {
  lands: Array<Land>;
  players: Array<Bandeirante>;
  currentLine: number;
};

const StyledTableLine = styled.div`
  display: flex;
`;

export function TableLine({ lands, players, currentLine }: TableLineProps) {
  return (
    <StyledTableLine>
      {lands.map((land, currentColumn) => {
        return (
          <LandBlock
            key={land.id}
            {...land}
            players={players}
            blockPosition={{ x: currentColumn, y: currentLine }}
          />
        );
      })}
    </StyledTableLine>
  );
}
