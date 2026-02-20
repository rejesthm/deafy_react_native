/**
 * Countdown Overlay - 3-2-1 countdown for filming
 */

import React from 'react';
import styled from 'styled-components/native';
import {theme} from '@theme';

interface CountdownOverlayProps {
  count: number;
}

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const CountdownText = styled.Text`
  font-size: 120px;
  font-weight: bold;
  color: ${theme.colors.white};
  text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.6);
`;

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({count}) => {
  if (count <= 0) return null;

  return (
    <Container>
      <CountdownText>{count}</CountdownText>
    </Container>
  );
};
