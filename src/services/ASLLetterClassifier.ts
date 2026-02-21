/**
 * Rule-based ASL (American Sign Language) letter classifier.
 * Maps 21 hand landmarks to letters A–G using finger positions and simple geometry.
 * MediaPipe hand indices: 0 wrist, 1-4 thumb, 5-8 index, 9-12 middle, 13-16 ring, 17-20 pinky.
 */

import {HandLandmark} from '@models';

const HAND_LANDMARK_COUNT = 21;

/** Squared distance between two points (avoids sqrt) */
function distSq(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return dx * dx + dy * dy + dz * dz;
}

function dist(a: HandLandmark, b: HandLandmark): number {
  return Math.sqrt(distSq(a, b));
}

/** Finger tip is "extended" if tip is above (lower y in screen coords) the PIP joint.
 *  Small tolerance (0.02) for noisy landmarks. */
function isFingerExtended(
  landmarks: HandLandmark[],
  tipIdx: number,
  pipIdx: number,
): boolean {
  return landmarks[tipIdx].y < landmarks[pipIdx].y + 0.02;
}

/** Thumb: tip 4, IP 3, MCP 2. Extended if tip is "out" from palm (compare y with 2).
 *  Small tolerance for noisy landmarks. */
function isThumbExtended(landmarks: HandLandmark[]): boolean {
  return landmarks[4].y < landmarks[2].y + 0.02;
}

/** Check if two landmarks are close (touching) within threshold.
 *  0.10 allows for slight landmark jitter while still distinguishing F from B. */
function areTouching(a: HandLandmark, b: HandLandmark, threshold = 0.10): boolean {
  return dist(a, b) < threshold;
}

/**
 * Classify hand shape into an ASL letter (A–G) or null if no letter matches.
 * Uses heuristic rules based on finger extended/curled and key positions.
 */
export function classifyASLLetter(landmarks: HandLandmark[]): string | null {
  if (!landmarks || landmarks.length !== HAND_LANDMARK_COUNT) {
    return null;
  }

  const thumbExt = isThumbExtended(landmarks);
  const indexExt = isFingerExtended(landmarks, 8, 6);
  const middleExt = isFingerExtended(landmarks, 12, 10);
  const ringExt = isFingerExtended(landmarks, 16, 14);
  const pinkyExt = isFingerExtended(landmarks, 20, 18);

  const thumb = landmarks[4];
  const indexTip = landmarks[8];
  const wrist = landmarks[0];
  const extendedCount = [thumbExt, indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // A: Fist with thumb to the side (all fingers curled, thumb not extended up)
  if (extendedCount === 0) {
    return 'A';
  }

  // B: Flat hand, all four fingers extended (open palm)
  if (indexExt && middleExt && ringExt && pinkyExt) {
    return 'B';
  }

  // F: OK sign – thumb and index tips touching, other three fingers extended
  if (areTouching(thumb, indexTip) && middleExt && ringExt && pinkyExt) {
    return 'F';
  }

  // D / G: Only index extended. D = index up; G = index pointing sideways.
  // Use ratio > 0.7 to favor clear horizontal vs vertical distinction.
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    const dx = Math.abs(indexTip.x - wrist.x);
    const dy = Math.abs(indexTip.y - wrist.y);
    const indexHorizontal = dx > dy * 0.7;
    return indexHorizontal ? 'G' : 'D';
  }

  // C: Curved C – not all extended, not all curled; hand in a C shape
  const thumbToPinky = dist(landmarks[4], landmarks[20]);
  const thumbToIndex = dist(landmarks[4], landmarks[8]);
  if (extendedCount >= 1 && extendedCount <= 3 && thumbToPinky > 0.05 && thumbToIndex > 0.05) {
    const allCurled = !indexExt && !middleExt && !ringExt && !pinkyExt;
    const allFourExtended = indexExt && middleExt && ringExt && pinkyExt;
    if (!allCurled && !allFourExtended) return 'C';
  }

  // E: Claw – all four fingers curled (tips below PIPs), thumb may be opposing
  if (!indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt) {
    const fingerTipsY = [landmarks[8].y, landmarks[12].y, landmarks[16].y, landmarks[20].y];
    const fingerPipsY = [landmarks[6].y, landmarks[10].y, landmarks[14].y, landmarks[18].y];
    const allTipsBelowPips = fingerTipsY.every((y, i) => y > fingerPipsY[i]);
    if (allTipsBelowPips) return 'E';
  }

  return null;
}
