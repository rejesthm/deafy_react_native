/**
 * MediaPipe Holistic Detector Service
 * Uses @mediapipe/tasks-vision for full body landmark detection (543 landmarks)
 */

import {
  HolisticLandmarker,
  FilesetResolver,
  HolisticLandmarkerResult,
} from '@mediapipe/tasks-vision';
import {Recognition, RecognitionStatistic, HandLandmark, GestureType} from '@models';
import {classifyASLLetter} from './ASLLetterClassifier';

const MEDIAPIPE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task';

class HolisticDetectorService {
  private holisticLandmarker: HolisticLandmarker | null = null;
  private isReady = false;
  private isProcessing = false;
  private lastProcessedTime = Date.now();
  private static readonly MIN_PROCESSING_INTERVAL = 100; // 100ms matching Flutter

  // Performance tracking
  private frameCount = 0;
  private lastFpsCheck = Date.now();
  private currentFps = 0;

  /**
   * Initialize MediaPipe Holistic Landmarker
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing MediaPipe Holistic Landmarker...');

      // Load MediaPipe WASM files
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      );

      // Create Holistic Landmarker
      this.holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
          delegate: 'GPU', // Use GPU acceleration
        },
        runningMode: 'VIDEO', // For video stream processing
        minFaceDetectionConfidence: 0.5,
        minFaceSuppressionThreshold: 0.3,
        minFacePresenceConfidence: 0.5,
        minPoseDetectionConfidence: 0.5,
        minPoseSuppressionThreshold: 0.3,
        minPosePresenceConfidence: 0.5,
        minHandLandmarksConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        outputFaceBlendshapes: false, // We don't need facial expressions for now
        outputPoseSegmentationMasks: false,
        outputFacialTransformationMatrixes: false,
      });

      this.isReady = true;
      console.log('✅ MediaPipe Holistic Landmarker initialized');
    } catch (error) {
      console.error('❌ Error initializing MediaPipe Holistic Landmarker:', error);
      throw error;
    }
  }

  /**
   * Process a video frame for holistic detection
   * Returns recognition statistics with detected hands
   */
  async processFrame(
    videoFrame: any, // In React Native, this will be a frame from vision-camera
    timestamp: number,
  ): Promise<RecognitionStatistic | null> {
    const now = Date.now();

    // Throttle processing to MIN_PROCESSING_INTERVAL
    if (now - this.lastProcessedTime < HolisticDetectorService.MIN_PROCESSING_INTERVAL) {
      return null;
    }

    if (this.isProcessing || !this.isReady || !this.holisticLandmarker) {
      return null;
    }

    this.isProcessing = true;
    this.lastProcessedTime = now;
    this.frameCount++;

    // Update FPS every second
    const timeSinceLastFps = now - this.lastFpsCheck;
    if (timeSinceLastFps >= 1000) {
      this.currentFps = (this.frameCount / timeSinceLastFps) * 1000;
      this.frameCount = 0;
      this.lastFpsCheck = now;
    }

    const startTime = Date.now();

    try {
      // Detect holistic landmarks
      const results = this.holisticLandmarker.detectForVideo(videoFrame, timestamp);

      const processingTime = Date.now() - startTime;

      // Convert results to Recognition objects
      const recognitions = this.convertToRecognitions(results);

      // Extract hand landmarks for overlay
      const leftHandLandmarks =
        results.leftHandLandmarks && results.leftHandLandmarks.length > 0
          ? results.leftHandLandmarks[0].map(point => ({
              x: point.x,
              y: point.y,
              z: point.z || 0,
            }))
          : undefined;

      const rightHandLandmarks =
        results.rightHandLandmarks && results.rightHandLandmarks.length > 0
          ? results.rightHandLandmarks[0].map(point => ({
              x: point.x,
              y: point.y,
              z: point.z || 0,
            }))
          : undefined;

      // Get all 543 landmarks for LSTM model
      const allLandmarks = this.getAllLandmarks(results);

      const statistic: RecognitionStatistic = {
        recognitions,
        processingTime,
        fps: this.currentFps,
        timestamp: new Date(),
        leftHandLandmarks,
        rightHandLandmarks,
        landmarks: allLandmarks.length > 0 ? allLandmarks : undefined,
      };

      this.isProcessing = false;

      // Log detection info (throttled)
      if (this.frameCount % 30 === 0) {
        console.log(
          `👋 Detected ${recognitions.length} hand(s) | FPS: ${this.currentFps.toFixed(1)} | Processing: ${processingTime}ms`,
        );
      }

      return statistic;
    } catch (error) {
      console.error('❌ Error during holistic detection:', error);
      this.isProcessing = false;
      return null;
    }
  }

  /**
   * Convert MediaPipe results to Recognition objects
   */
  private convertToRecognitions(results: HolisticLandmarkerResult): Recognition[] {
    const recognitions: Recognition[] = [];

    // Process left hand
    if (results.leftHandLandmarks && results.leftHandLandmarks.length > 0) {
      const leftHandLandmarks = results.leftHandLandmarks[0];
      const handLandmarks: HandLandmark[] = leftHandLandmarks.map(point => ({
        x: point.x,
        y: point.y,
        z: point.z || 0,
      }));

      const label = this.classifyGestureOrLetter(handLandmarks);

      recognitions.push({
        id: 0,
        label,
        score: 0.85, // Placeholder confidence
        handedness: 'Left',
        handednessScore: 0.9,
        landmarks: handLandmarks,
      });
    }

    // Process right hand
    if (results.rightHandLandmarks && results.rightHandLandmarks.length > 0) {
      const rightHandLandmarks = results.rightHandLandmarks[0];
      const handLandmarks: HandLandmark[] = rightHandLandmarks.map(point => ({
        x: point.x,
        y: point.y,
        z: point.z || 0,
      }));

      const label = this.classifyGestureOrLetter(handLandmarks);

      recognitions.push({
        id: 1,
        label,
        score: 0.85, // Placeholder confidence
        handedness: 'Right',
        handednessScore: 0.9,
        landmarks: handLandmarks,
      });
    }

    return recognitions;
  }

  /**
   * Classify hand: try ASL letter (A–G) first, then fall back to generic gesture.
   */
  private classifyGestureOrLetter(landmarks: HandLandmark[]): string {
    const letter = classifyASLLetter(landmarks);
    if (letter) return letter;
    return this.classifyGesture(landmarks);
  }

  /**
   * Basic gesture classification based on landmark positions
   * Matches Flutter implementation
   */
  private classifyGesture(landmarks: HandLandmark[]): string {
    if (landmarks.length !== 21) {
      return GestureType.UNKNOWN;
    }

    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];

    // Check if fingers are extended (tip above knuckle)
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

    // Basic gesture patterns
    if (extendedCount === 5) {
      return GestureType.OPEN_PALM;
    } else if (extendedCount === 0) {
      return GestureType.CLOSED_FIST;
    } else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return GestureType.POINTING_UP;
    } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return GestureType.VICTORY;
    } else if (thumbExtended && indexExtended && pinkyExtended && !middleExtended && !ringExtended) {
      return GestureType.I_LOVE_YOU;
    } else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return GestureType.THUMB_UP;
    } else {
      return GestureType.CUSTOM_GESTURE;
    }
  }

  /**
   * Get all holistic landmarks (543 total) for LSTM model
   */
  getAllLandmarks(results: HolisticLandmarkerResult): HandLandmark[] {
    const allLandmarks: HandLandmark[] = [];

    // Face landmarks (468)
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      results.faceLandmarks[0].forEach(point => {
        allLandmarks.push({x: point.x, y: point.y, z: point.z || 0});
      });
    }

    // Pose landmarks (33)
    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      results.poseLandmarks[0].forEach(point => {
        allLandmarks.push({x: point.x, y: point.y, z: point.z || 0});
      });
    }

    // Left hand landmarks (21)
    if (results.leftHandLandmarks && results.leftHandLandmarks.length > 0) {
      results.leftHandLandmarks[0].forEach(point => {
        allLandmarks.push({x: point.x, y: point.y, z: point.z || 0});
      });
    }

    // Right hand landmarks (21)
    if (results.rightHandLandmarks && results.rightHandLandmarks.length > 0) {
      results.rightHandLandmarks[0].forEach(point => {
        allLandmarks.push({x: point.x, y: point.y, z: point.z || 0});
      });
    }

    return allLandmarks;
  }

  /**
   * Dispose of the detector and clean up resources
   */
  dispose(): void {
    if (this.holisticLandmarker) {
      this.holisticLandmarker.close();
      this.holisticLandmarker = null;
    }
    this.isReady = false;
    console.log('🛑 MediaPipe Holistic Detector disposed');
  }

  /**
   * Check if detector is ready
   */
  isInitialized(): boolean {
    return this.isReady;
  }
}

// Export singleton instance
export const holisticDetector = new HolisticDetectorService();

// Also export the class for type checking and new instances if needed
export class HolisticDetector extends HolisticDetectorService {}
