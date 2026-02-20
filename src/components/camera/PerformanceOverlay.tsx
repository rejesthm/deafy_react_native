/**
 * Performance Overlay - FPS and processing time display
 */

import React from 'react';
import styled from 'styled-components/native';
import {theme} from '@theme';

interface PerformanceOverlayProps {
  fps: number;
  processingTime: number;
}

const Container = styled.View`
  position: absolute;
  top: ${theme.spacing.lg}px;
  left: ${theme.spacing.lg}px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: ${theme.radius.md}px;
  padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
`;

const MetricText = styled.Text`
  ${theme.typography.caption};
  color: ${theme.colors.white};
  font-family: monospace;
`;

export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  fps,
  processingTime,
}) => {
  return (
    <Container>
      <MetricText>FPS: {fps.toFixed(1)}</MetricText>
      <MetricText>Process: {processingTime.toFixed(0)}ms</MetricText>
    </Container>
  );
};
