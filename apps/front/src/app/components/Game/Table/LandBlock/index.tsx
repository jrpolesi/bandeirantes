import { Bandeirante, Land } from '@bandeirantes/events';
import styled from '@emotion/styled';
import { LandPosition, usePlayerOnLand } from '../../hooks';
import { Player } from '../../Player';

const StyledBlock = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: ${({ color }) => color};
  border: 2px solid black;
`;

export type LandBlockProps = Land & {
  blockPosition: LandPosition;
  players: Array<Bandeirante>;
};

const NO_OWNER_COLOR = '#E9CEA6';

export function LandBlock({ owner, blockPosition, players }: LandBlockProps) {
  const currentPlayer = usePlayerOnLand(players, blockPosition);

  return (
    <StyledBlock color={owner?.color ?? NO_OWNER_COLOR}>
      {currentPlayer && <Player {...currentPlayer} />}
    </StyledBlock>
  );
}
