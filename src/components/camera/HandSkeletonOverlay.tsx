/**
 * Hand Skeleton Overlay - Renders hand landmarks and connections
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Circle, Line} from 'react-native-svg';
import {HAND_CONNECTIONS} from '@models/Landmark';
import type {HandLandmark} from '@models/Landmark';
import {theme} from '@theme';

interface HandSkeletonOverlayProps {
  leftHandLandmarks?: HandLandmark[];
  rightHandLandmarks?: HandLandmark[];
  width: number;
  height: number;
}

export const HandSkeletonOverlay: React.FC<HandSkeletonOverlayProps> = ({
  leftHandLandmarks,
  rightHandLandmarks,
  width,
  height,
}) => {
  const renderHandSkeleton = (
    landmarks: HandLandmark[] | undefined,
    color: string
  ) => {
    if (!landmarks || landmarks.length === 0) return null;

    return (
      <>
        {/* Render connections */}
        {HAND_CONNECTIONS.map(([start, end], index) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          if (!startPoint || !endPoint) return null;

          return (
            <Line
              key={`connection-${index}`}
              x1={startPoint.x * width}
              y1={startPoint.y * height}
              x2={endPoint.x * width}
              y2={endPoint.y * height}
              stroke={color}
              strokeWidth={2}
              opacity={0.6}
            />
          );
        })}

        {/* Render landmarks */}
        {landmarks.map((landmark, index) => (
          <Circle
            key={`landmark-${index}`}
            cx={landmark.x * width}
            cy={landmark.y * height}
            r={4}
            fill={color}
            opacity={0.8}
          />
        ))}
      </>
    );
  };

  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
      {renderHandSkeleton(leftHandLandmarks, theme.colors.leftHandColor)}
      {renderHandSkeleton(rightHandLandmarks, theme.colors.rightHandColor)}
    </Svg>
  );
};
