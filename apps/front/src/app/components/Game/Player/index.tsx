import { Bandeirante } from '@bandeirantes/events';
import styled from '@emotion/styled';

export type PlayerProps = Bandeirante;

function getDirectionInAngle(direction: Bandeirante['direction']) {
  switch (direction) {
    case 'north':
      return '0';
    case 'east':
      return '90deg';
    case 'south':
      return '180deg';
    case 'west':
      return '270deg';
    default:
      return '0';
  }
}

const StyledPlayer = styled.div<{
  color: string;
  direction: Bandeirante['direction'];
}>`
  position: relative;
  border-radius: 50%;
  width: 90%;
  height: 90%;
  background-color: ${({ color }) => color};
  transform: rotateZ(${({ direction }) => getDirectionInAngle(direction)});

  ::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 30%;
    width: 10px;
    height: 10px;
    background-color: black;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;

export function Player({ color, direction }: PlayerProps) {
  return <StyledPlayer color={color} direction={direction} />;
}
