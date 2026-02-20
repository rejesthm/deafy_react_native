/**
 * Coordinate transformation utilities
 */

import {Dimensions} from 'react-native';
import {HandLandmark} from '@models';

/**
 * Convert normalized MediaPipe coordinates to screen coordinates
 * Handles portrait/landscape orientation and camera sensor rotation
 */
export const normalizedToScreenCoordinates = (
  landmark: HandLandmark,
  screenWidth: number,
  screenHeight: number,
): {x: number; y: number} => {
  const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');
  const isPortrait = deviceHeight > deviceWidth;

  if (isPortrait) {
    // Portrait mode - rotate coordinates 90° clockwise and flip both horizontally and vertically
    // This matches the Flutter implementation
    return {
      x: (1 - landmark.y) * screenWidth,
      y: landmark.x * screenHeight,
    };
  } else {
    // Landscape mode - flip horizontally (for front camera)
    return {
      x: (1 - landmark.x) * screenWidth,
      y: landmark.y * screenHeight,
    };
  }
};

/**
 * Calculate distance between two landmarks
 */
export const calculateDistance = (p1: HandLandmark, p2: HandLandmark): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => {
  const {width, height} = Dimensions.get('window');
  return {width, height, isPortrait: height > width};
};
