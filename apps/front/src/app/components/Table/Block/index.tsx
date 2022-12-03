import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';

const StyledBlock = styled.div<{color: string}>`
  width: 50px;
  height: 50px;
  background-color: ${({ color }) => color};
`;

export type BlockProps = PropsWithChildren<{color: string}>

export function Block({children, color}: BlockProps) {
  return <StyledBlock color={color}>{children}</StyledBlock>;
}
