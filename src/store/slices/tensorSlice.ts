/**
 * Redux Toolkit slice for tensor/detection state
 * Matches Flutter TensorBloc functionality
 */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Recognition, RecognitionStatistic} from '@models';

export interface TensorState {
  // Camera state
  isCameraActive: boolean;
  isCameraInitialized: boolean;
  cameraError: string | null;

  // Detector state
  isDetectionActive: boolean;
  isDetectorInitialized: boolean;
  detectorError: string | null;

  // Detection state
  isFilming: boolean;
  isDetecting: boolean;
  countdown: number;
  countdownSeconds: number | null;

  // Results
  currentResult: RecognitionStatistic | null;
  results: Recognition[];
  fps: number;
  processingTime: number;

  // Frame tracking
  frameCount: number;
  lastFrameTime: number | null;
}

const initialState: TensorState = {
  isCameraActive: false,
  isCameraInitialized: false,
  cameraError: null,
  isDetectionActive: false,
  isDetectorInitialized: false,
  detectorError: null,
  isFilming: false,
  isDetecting: false,
  countdown: 0,
  countdownSeconds: null,
  currentResult: null,
  results: [],
  fps: 0,
  processingTime: 0,
  frameCount: 0,
  lastFrameTime: null,
};

const tensorSlice = createSlice({
  name: 'tensor',
  initialState,
  reducers: {
    // Camera actions
    initializeCameraSuccess: state => {
      state.isCameraInitialized = true;
      state.cameraError = null;
    },
    initializeCameraFailure: (state, action: PayloadAction<string>) => {
      state.isCameraInitialized = false;
      state.cameraError = action.payload;
    },
    stopCamera: state => {
      state.isCameraInitialized = false;
      state.isDetecting = false;
      state.isFilming = false;
      state.results = [];
    },

    // Detector actions
    initializeDetectorSuccess: state => {
      state.isDetectorInitialized = true;
      state.detectorError = null;
    },
    initializeDetectorFailure: (state, action: PayloadAction<string>) => {
      state.isDetectorInitialized = false;
      state.detectorError = action.payload;
    },
    disposeDetector: state => {
      state.isDetectorInitialized = false;
      state.isDetecting = false;
    },

    // Filming actions (with countdown)
    startFilming: state => {
      state.isFilming = true;
      state.countdownSeconds = 3; // Start 3-second countdown
    },
    updateCountdown: (state, action: PayloadAction<number>) => {
      state.countdownSeconds = action.payload;
      if (action.payload === 0) {
        state.isDetecting = true; // Start detection when countdown reaches 0
      }
    },
    stopFilming: state => {
      state.isFilming = false;
      state.isDetecting = false;
      state.countdownSeconds = null;
      state.results = [];
    },

    // Detection actions
    startDetection: state => {
      state.isDetecting = true;
    },
    stopDetection: state => {
      state.isDetecting = false;
      state.results = [];
    },

    // Results update
    updateResults: (state, action: PayloadAction<RecognitionStatistic>) => {
      state.currentResult = action.payload;
      state.results = action.payload.recognitions;
      state.fps = action.payload.fps;
      state.processingTime = action.payload.processingTime;
    },

    // Frame tracking
    incrementFrameCount: state => {
      state.frameCount += 1;
      state.lastFrameTime = Date.now();
    },

    // Reset state
    resetTensorState: () => initialState,
  },
});

export const {
  initializeCameraSuccess,
  initializeCameraFailure,
  stopCamera,
  initializeDetectorSuccess,
  initializeDetectorFailure,
  disposeDetector,
  startFilming,
  updateCountdown,
  stopFilming,
  startDetection,
  stopDetection,
  updateResults,
  incrementFrameCount,
  resetTensorState,
} = tensorSlice.actions;

export default tensorSlice.reducer;
