/**
 * Sequence buffer for collecting hand landmark frames for LSTM model.
 * Hand-only: 30 frames × 42 landmarks (21 left + 21 right) × 3 coordinates.
 * Missing hand is padded with zeros.
 */

import {HandLandmark} from '@models';

const SEQUENCE_LENGTH = 30;
const HAND_LANDMARK_COUNT = 21;
const HANDS_PER_FRAME = 2; // left + right
const LANDMARKS_PER_FRAME = HAND_LANDMARK_COUNT * HANDS_PER_FRAME; // 42

/** Placeholder for missing hand (zeros) */
const EMPTY_HAND: number[][] = Array.from({length: HAND_LANDMARK_COUNT}, () => [0, 0, 0]);

function landmarksToArray(landmarks: HandLandmark[]): number[][] {
  return landmarks.slice(0, HAND_LANDMARK_COUNT).map(l => [
    l.x ?? 0,
    l.y ?? 0,
    (l.z ?? 0),
  ]);
}

export class SequenceBuffer {
  private buffer: number[][][] = []; // [frames][landmarks][x,y,z]
  private maxLength: number;

  constructor(maxLength: number = SEQUENCE_LENGTH) {
    this.maxLength = maxLength;
  }

  /**
   * Add a new frame of hand landmarks to the buffer.
   * @param leftHandLandmarks - 21 left hand landmarks (optional)
   * @param rightHandLandmarks - 21 right hand landmarks (optional)
   * At least one hand must be provided. Missing hand is padded with zeros.
   */
  addFrame(
    leftHandLandmarks?: HandLandmark[],
    rightHandLandmarks?: HandLandmark[],
  ): void {
    const left = leftHandLandmarks?.length === HAND_LANDMARK_COUNT
      ? landmarksToArray(leftHandLandmarks)
      : EMPTY_HAND;
    const right = rightHandLandmarks?.length === HAND_LANDMARK_COUNT
      ? landmarksToArray(rightHandLandmarks)
      : EMPTY_HAND;

    const frame = [...left, ...right];
    this.buffer.push(frame);

    if (this.buffer.length > this.maxLength) {
      this.buffer.shift();
    }
  }

  isFull(): boolean {
    return this.buffer.length >= this.maxLength;
  }

  /**
   * Get the buffer as flattened array for model input.
   * Shape: [30, 42, 3] → 30 × 126 = 3780 floats
   */
  getSequence(): number[][] {
    if (!this.isFull()) {
      throw new Error('Buffer not full yet');
    }
    return this.buffer.slice(-this.maxLength).map(frame => frame.flat());
  }

  getPreprocessedSequence(): Float32Array {
    const sequence = this.getSequence();
    const flatSequence = sequence.flat();
    return new Float32Array(flatSequence);
  }

  getSize(): number {
    return this.buffer.length;
  }

  getProgress(): number {
    return this.buffer.length / this.maxLength;
  }

  clear(): void {
    this.buffer = [];
  }

  getRemainingFrames(): number {
    return Math.max(0, this.maxLength - this.buffer.length);
  }
}

export const sequenceBuffer = new SequenceBuffer();
