import { Land } from '@bandeirantes/events';
import styled from '@emotion/styled';
import { Block } from '../Block';

export type TableLineProps = {
  lands: Array<Land>;
};

const StyledTableLine = styled.div`
  display: flex;
`

export function TableLine({ lands }: TableLineProps) {
  return (
    <StyledTableLine>
      {lands.map((land) => (
        <Block color={land.owner?.color ?? 'red'}>oi</Block>
      ))}
    </StyledTableLine>
  );
}
