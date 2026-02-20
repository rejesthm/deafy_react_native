/**
 * Landmark models matching Flutter implementation
 */

import {Dimensions} from 'react-native';

/**
 * Represents a single hand landmark point with x, y, z coordinates
 * Matches Flutter: lib/screens/tensor/recognition.dart
 */
export interface HandLandmark {
  /** Normalized x-coordinate (0.0 - 1.0) */
  x: number;
  /** Normalized y-coordinate (0.0 - 1.0) */
  y: number;
  /** Depth relative to wrist (in same scale as x) */
  z: number;
}

/**
 * MediaPipe Holistic landmarks (543 total)
 */
export interface HolisticLandmarks {
  /** 468 face landmarks */
  face: HandLandmark[];
  /** 33 pose landmarks */
  pose: HandLandmark[];
  /** 21 left hand landmarks */
  leftHand: HandLandmark[];
  /** 21 right hand landmarks */
  rightHand: HandLandmark[];
}

/**
 * Converts normalized coordinates to screen coordinates
 * Handles portrait/landscape orientation and camera sensor rotation
 */
export const landmarkToScreenPosition = (
  landmark: HandLandmark,
  screenWidth: number,
  screenHeight: number,
): {x: number; y: number} => {
  // MediaPipe returns normalized coordinates (0-1) from camera sensor perspective
  // On mobile devices in portrait mode, the camera sensor is typically in landscape
  // so we need to rotate the coordinates 90 degrees clockwise

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
 * Hand landmark indices (21 points per hand)
 */
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // Index finger
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // Middle finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  // Ring finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  // Pinky
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  // Palm
  [5, 9],
  [9, 13],
  [13, 17],
] as const;

/**
 * Important landmarks for LSTM model (from GitHub repo)
 * 13 face + 75 hand landmarks = 88 total
 */
export const IMPORTANT_LANDMARKS = [
  // Face landmarks
  0, 9, 11, 13, 14, 17, 117, 118, 119, 199, 346, 347, 348,
  // Hand landmarks (468-543)
  ...Array.from({length: 75}, (_, i) => 468 + i),
] as const;
