/**
 * Build RecognitionStatistic from raw hand landmarks (e.g. from TFLite frame processor).
 * Used when we have landmarks but not the full Holistic detector output.
 */

import {Recognition, RecognitionStatistic, HandLandmark} from '@models';
import {classifyASLLetter} from './ASLLetterClassifier';

/** Min hand span (wrist to middle fingertip) in normalized coords. Below this = no real hand. */
const MIN_HAND_SPAN = 0.06;

/**
 * Returns true if landmarks look like a real hand (not model hallucination when no hand present).
 * The landmark model always outputs 63 floats; without this check, garbage gets classified as letters.
 */
function hasValidHandPresence(landmarks: HandLandmark[]): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  const wrist = landmarks[0];
  const middleTip = landmarks[12];
  const span = Math.sqrt(
    (middleTip.x - wrist.x) ** 2 + (middleTip.y - wrist.y) ** 2
  );
  return span >= MIN_HAND_SPAN;
}

/**
 * Build recognitions and full statistic from one or two hands' landmarks.
 * Classifies ASL letter (A–G) or gesture for each hand.
 * Only classifies when landmarks pass hand presence check (avoids letters when no hand visible).
 */
export function buildRecognitionFromLandmarks(
  leftHandLandmarks: HandLandmark[] | undefined,
  rightHandLandmarks: HandLandmark[] | undefined,
  opts: { processingTime: number; fps: number; timestamp: Date | string | number },
): RecognitionStatistic {
  const recognitions: Recognition[] = [];
  let id = 0;
  if (
    leftHandLandmarks &&
    leftHandLandmarks.length === 21 &&
    hasValidHandPresence(leftHandLandmarks)
  ) {
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
  if (
    rightHandLandmarks &&
    rightHandLandmarks.length === 21 &&
    hasValidHandPresence(rightHandLandmarks)
  ) {
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
    timestamp:
      typeof opts.timestamp === 'string'
        ? opts.timestamp
        : typeof opts.timestamp === 'number'
          ? new Date(opts.timestamp).toISOString()
          : opts.timestamp.toISOString(),
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
