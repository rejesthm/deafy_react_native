/**
 * Sequence buffer for collecting landmark frames for LSTM model
 * Matches GitHub model requirements: 30 frames × 88 landmarks × 3 coordinates
 */

import {HandLandmark, IMPORTANT_LANDMARKS} from '@models';

const SEQUENCE_LENGTH = 30; // Number of frames to buffer

export class SequenceBuffer {
  private buffer: number[][][] = []; // [frames][landmarks][coordinates]
  private maxLength: number;

  constructor(maxLength: number = SEQUENCE_LENGTH) {
    this.maxLength = maxLength;
  }

  /**
   * Add a new frame of landmarks to the buffer
   * @param landmarks - All 543 holistic landmarks
   */
  addFrame(landmarks: HandLandmark[]): void {
    if (landmarks.length !== 543) {
      console.warn(`Expected 543 landmarks, got ${landmarks.length}`);
      return;
    }

    // Extract only important landmarks
    const importantLandmarks = IMPORTANT_LANDMARKS.map((index: number) => {
      const landmark = landmarks[index];
      return [landmark.x, landmark.y, landmark.z];
    });

    // Add to buffer
    this.buffer.push(importantLandmarks);

    // Keep only last maxLength frames
    if (this.buffer.length > this.maxLength) {
      this.buffer.shift();
    }
  }

  /**
   * Check if buffer is full (ready for inference)
   */
  isFull(): boolean {
    return this.buffer.length >= this.maxLength;
  }

  /**
   * Get the current buffer as a flattened array for model input
   * Shape: [30, 88, 3] → [30, 264]
   */
  getSequence(): number[][] {
    if (!this.isFull()) {
      throw new Error('Buffer not full yet');
    }

    // Return last 30 frames with 88 landmarks × 3 coordinates flattened
    return this.buffer.slice(-this.maxLength).map(frame => {
      return frame.flat(); // Flatten [88][3] to [264]
    });
  }

  /**
   * Get preprocessed data ready for TFLite model
   * Handles missing values with NaN (matching GitHub implementation)
   */
  getPreprocessedSequence(): Float32Array {
    const sequence = this.getSequence();
    const flatSequence = sequence.flat(); // [30 × 264] = [7920]

    // Convert to Float32Array (TFLite input format)
    return new Float32Array(flatSequence);
  }

  /**
   * Get buffer size
   */
  getSize(): number {
    return this.buffer.length;
  }

  /**
   * Get buffer progress (0-1)
   */
  getProgress(): number {
    return this.buffer.length / this.maxLength;
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * Get remaining frames needed
   */
  getRemainingFrames(): number {
    return Math.max(0, this.maxLength - this.buffer.length);
  }
}

// Export singleton instance
export const sequenceBuffer = new SequenceBuffer();
