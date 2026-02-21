/**
 * Recognition models matching Flutter implementation
 */

import {HandLandmark} from './Landmark';

/**
 * Represents the recognition output for a detected hand with landmarks and gesture
 * Matches Flutter: lib/screens/tensor/recognition.dart
 */
export interface Recognition {
  /** Index of the result (hand index: 0 or 1 for dual hand detection) */
  id: number;

  /** Gesture label (e.g., "Thumb_Up", "Open_Palm", "Closed_Fist", etc.) */
  label: string;

  /** Confidence score for the gesture [0.0, 1.0] */
  score: number;

  /** Handedness: "Left" or "Right" */
  handedness: string;

  /** Handedness confidence [0.0, 1.0] */
  handednessScore: number;

  /** List of 21 hand landmarks */
  landmarks: HandLandmark[];
}

/**
 * Recognition statistics with performance metrics
 * Matches Flutter: lib/screens/tensor/recognition_statistic.dart
 */
export interface RecognitionStatistic {
  /** List of detected objects with their bounding boxes, labels, and confidence scores */
  recognitions: Recognition[];

  /** Time taken to process the frame in milliseconds */
  processingTime: number;

  /** Current frames per second performance metric */
  fps: number;

  /** Timestamp when the detection was performed (ISO string for Redux serializability) */
  timestamp: string;

  /** Left hand landmarks (if detected) */
  leftHandLandmarks?: HandLandmark[];

  /** Right hand landmarks (if detected) */
  rightHandLandmarks?: HandLandmark[];

  /** All 543 holistic landmarks (for LSTM model) */
  landmarks?: HandLandmark[];
}

/**
 * Helper functions for recognition statistics
 */
export const recognitionStatisticHelpers = {
  hasDetections: (stat: RecognitionStatistic): boolean => stat.recognitions.length > 0,

  detectionCount: (stat: RecognitionStatistic): number => stat.recognitions.length,

  averageConfidence: (stat: RecognitionStatistic): number => {
    if (stat.recognitions.length === 0) return 0.0;
    const total = stat.recognitions.reduce((sum, r) => sum + r.score, 0);
    return total / stat.recognitions.length;
  },

  maxConfidence: (stat: RecognitionStatistic): number => {
    if (stat.recognitions.length === 0) return 0.0;
    return Math.max(...stat.recognitions.map(r => r.score));
  },

  performanceRating: (stat: RecognitionStatistic): string => {
    if (stat.fps >= 25) return 'Excellent';
    if (stat.fps >= 20) return 'Very Good';
    if (stat.fps >= 15) return 'Good';
    if (stat.fps >= 10) return 'Fair';
    return 'Poor';
  },

  summary: (stat: RecognitionStatistic): string => {
    return `Detections: ${stat.recognitions.length} | FPS: ${stat.fps.toFixed(1)} | Processing: ${stat.processingTime}ms | Performance: ${recognitionStatisticHelpers.performanceRating(stat)}`;
  },
};

/**
 * Gesture types (basic heuristic classification)
 */
export enum GestureType {
  OPEN_PALM = 'Open_Palm',
  CLOSED_FIST = 'Closed_Fist',
  POINTING_UP = 'Pointing_Up',
  VICTORY = 'Victory',
  I_LOVE_YOU = 'ILoveYou',
  THUMB_UP = 'Thumb_Up',
  CUSTOM_GESTURE = 'Custom_Gesture',
  UNKNOWN = 'Unknown',
}

/**
 * ASL (American Sign Language) letter labels for sign language recognition.
 * Used when the classifier maps hand landmarks to a letter.
 */
export const ASL_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
] as const;

export type ASLLetter = (typeof ASL_LETTERS)[number];

/** First set of letters we classify with rule-based logic (A–G) */
export const ASL_LETTERS_CLASSIFIED = ASL_LETTERS.slice(0, 7); // A through G
