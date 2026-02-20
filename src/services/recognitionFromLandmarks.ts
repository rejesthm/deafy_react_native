/**
 * Build RecognitionStatistic from raw hand landmarks (e.g. from TFLite frame processor).
 * Used when we have landmarks but not the full Holistic detector output.
 */

import {Recognition, RecognitionStatistic, HandLandmark} from '@models';
import {classifyASLLetter} from './ASLLetterClassifier';

/**
 * Build recognitions and full statistic from one or two hands' landmarks.
 * Classifies ASL letter (A–G) or gesture for each hand.
 */
export function buildRecognitionFromLandmarks(
  leftHandLandmarks: HandLandmark[] | undefined,
  rightHandLandmarks: HandLandmark[] | undefined,
  opts: { processingTime: number; fps: number; timestamp: Date },
): RecognitionStatistic {
  const recognitions: Recognition[] = [];
  let id = 0;
  if (leftHandLandmarks && leftHandLandmarks.length === 21) {
    const label = classifyASLLetter(leftHandLandmarks) ?? 'Unknown';
    recognitions.push({
      id: id++,
      label,
      score: 0.85,
      handedness: 'Left',
      handednessScore: 0.9,
      landmarks: leftHandLandmarks,
    });
  }
  if (rightHandLandmarks && rightHandLandmarks.length === 21) {
    const label = classifyASLLetter(rightHandLandmarks) ?? 'Unknown';
    recognitions.push({
      id: id++,
      label,
      score: 0.85,
      handedness: 'Right',
      handednessScore: 0.9,
      landmarks: rightHandLandmarks,
    });
  }
  return {
    recognitions,
    processingTime: opts.processingTime,
    fps: opts.fps,
    timestamp: opts.timestamp,
    leftHandLandmarks,
    rightHandLandmarks,
  };
}

/**
 * Parse TFLite hand landmark output (21 points × 3 coords = 63 floats) into HandLandmark[].
 * MediaPipe format: x, y, z normalized (x,y in [0,1], z relative).
 */
export function parseLandmarksFromTFLite(output: Float32Array | number[]): HandLandmark[] {
  const landmarks: HandLandmark[] = [];
  const len = Math.min(output.length, 21 * 3);
  for (let i = 0; i < len; i += 3) {
    landmarks.push({
      x: output[i] ?? 0,
      y: output[i + 1] ?? 0,
      z: output[i + 2] ?? 0,
    });
  }
  return landmarks;
}
