/**
 * Hand Skeleton Overlay - Renders hand landmarks and connections
 * Landmarks are normalized [0,1]; multiply by width/height for pixel coords.
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

/** Normalize coord to [0,1] - model may output 0-224 or 0-1 */
function norm(c: number): number {
  if (c > 1) return Math.min(1, c / 224);
  return Math.max(0, Math.min(1, c));
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
        {HAND_CONNECTIONS.map(([start, end], index) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          if (!startPoint || !endPoint) return null;

          const x1 = norm(startPoint.x) * width;
          const y1 = norm(startPoint.y) * height;
          const x2 = norm(endPoint.x) * width;
          const y2 = norm(endPoint.y) * height;

          return (
            <Line
              key={`connection-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={3}
              opacity={0.9}
            />
          );
        })}

        {landmarks.map((landmark, index) => {
          const cx = norm(landmark.x) * width;
          const cy = norm(landmark.y) * height;
          return (
            <Circle
              key={`landmark-${index}`}
              cx={cx}
              cy={cy}
              r={6}
              fill={color}
              opacity={0.95}
            />
          );
        })}
      </>
    );
  };

  const w = Math.max(1, width);
  const h = Math.max(1, height);

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet">
      {renderHandSkeleton(leftHandLandmarks, theme.colors.leftHand)}
      {renderHandSkeleton(rightHandLandmarks, theme.colors.rightHand)}
    </Svg>
  );
};
