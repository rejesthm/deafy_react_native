/**
 * React Native–compatible MediaPipe Holistic Detector
 *
 * Uses native MediaPipe solutions:
 * - Hands: TFLite hand_landmark_lite model (MediaPipe's model) via react-native-fast-tflite
 *   → Processed in TensorScreen frame processor
 * - Pose: react-native-mediapipe (usePoseDetection) - 33 body landmarks
 * - Face: react-native-mediapipe (useFaceLandmarkDetection) - 468 face landmarks
 *
 * This service processes hand landmarks (from TFLite) into RecognitionStatistic.
 * For real-time camera: TensorScreen uses buildRecognitionFromLandmarks directly.
 * For pose/face: use usePoseDetection and useFaceLandmarkDetection from react-native-mediapipe.
 */

import {Recognition, RecognitionStatistic, HandLandmark, GestureType} from '@models';
import {classifyASLLetter} from './ASLLetterClassifier';
import {buildRecognitionFromLandmarks} from './recognitionFromLandmarks';

export interface HandLandmarksInput {
  leftHandLandmarks?: HandLandmark[];
  rightHandLandmarks?: HandLandmark[];
}

class RNMediaPipeHolisticDetector {
  private isReady = true; // No async init needed for landmark-based processing

  /**
   * No-op for compatibility. Hand model is loaded in TensorScreen via useTensorflowModel.
   */
  async initialize(): Promise<void> {
    this.isReady = true;
    console.log('✅ RN MediaPipe Detector ready (hands via TFLite)');
  }

  /**
   * Process hand landmarks into RecognitionStatistic.
   * Use this when you have landmarks from TFLite (or other source).
   */
  processLandmarks(
    input: HandLandmarksInput,
    opts: {processingTime: number; fps: number; timestamp?: Date},
  ): RecognitionStatistic {
    return buildRecognitionFromLandmarks(
      input.leftHandLandmarks,
      input.rightHandLandmarks,
      {
        processingTime: opts.processingTime,
        fps: opts.fps,
        timestamp: opts.timestamp ?? new Date(),
      },
    );
  }

  /**
   * Legacy processFrame - accepts landmarks (from TFLite output).
   * For camera frames, TensorScreen handles detection in its frame processor.
   */
  async processFrame(
    _videoFrame: unknown,
    _timestamp: number,
  ): Promise<RecognitionStatistic | null> {
    console.warn(
      'HolisticDetector.processFrame is deprecated. Use processLandmarks with TFLite output, or process frames in TensorScreen.',
    );
    return null;
  }

  /**
   * Get all landmarks for LSTM model.
   * Currently returns hand landmarks only (42 max: 21 left + 21 right).
   * For full 543 landmarks, integrate usePoseDetection + useFaceLandmarkDetection from react-native-mediapipe.
   */
  getAllLandmarks(input: HandLandmarksInput): HandLandmark[] {
    const all: HandLandmark[] = [];
    if (input.leftHandLandmarks?.length === 21) {
      all.push(...input.leftHandLandmarks);
    }
    if (input.rightHandLandmarks?.length === 21) {
      all.push(...input.rightHandLandmarks);
    }
    return all;
  }

  /**
   * Classify gesture from hand landmarks (for use outside buildRecognitionFromLandmarks).
   */
  classifyGesture(landmarks: HandLandmark[]): string {
    if (landmarks.length !== 21) return GestureType.UNKNOWN;

    const letter = classifyASLLetter(landmarks);
    if (letter) return letter;

    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];

    const thumbExtended = thumb.y < landmarks[2].y;
    const indexExtended = index.y < landmarks[6].y;
    const middleExtended = middle.y < landmarks[10].y;
    const ringExtended = ring.y < landmarks[14].y;
    const pinkyExtended = pinky.y < landmarks[18].y;

    const extendedCount = [
      thumbExtended,
      indexExtended,
      middleExtended,
      ringExtended,
      pinkyExtended,
    ].filter(Boolean).length;

    if (extendedCount === 5) return GestureType.OPEN_PALM;
    if (extendedCount === 0) return GestureType.CLOSED_FIST;
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended)
      return GestureType.POINTING_UP;
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended)
      return GestureType.VICTORY;
    if (thumbExtended && indexExtended && pinkyExtended && !middleExtended && !ringExtended)
      return GestureType.I_LOVE_YOU;
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended)
      return GestureType.THUMB_UP;

    return GestureType.CUSTOM_GESTURE;
  }

  dispose(): void {
    this.isReady = false;
    console.log('🛑 RN MediaPipe Detector disposed');
  }

  isInitialized(): boolean {
    return this.isReady;
  }
}

export const holisticDetector = new RNMediaPipeHolisticDetector();
export class HolisticDetector extends RNMediaPipeHolisticDetector {}
