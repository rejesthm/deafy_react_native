/**
 * TensorScreen - Main camera detection screen
 * Real-time hand landmarks via Vision Camera + resize plugin + TFLite hand landmark model.
 */

import React, {useEffect, useRef, useCallback, useState, useMemo} from 'react';
import {StyleSheet, View, Alert, Dimensions} from 'react-native';
import {Camera, useCameraDevice, useFrameProcessor} from 'react-native-vision-camera';
import {Worklets} from 'react-native-worklets-core';
import {useSharedValue} from 'react-native-reanimated';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {
  setCameraActive,
  setDetectionActive,
  startFilming,
  stopFilming,
  updateResults,
  updateCountdown,
  setError,
} from '@store/tensorSlice';
import {
  ScreenContainer,
  CustomButton,
  ButtonText,
  Row,
  Spacer,
} from '@components/ui';
import {
  HandSkeletonOverlay,
  PerformanceOverlay,
  CountdownOverlay,
  LetterOverlay,
} from '@components/camera';
import {SequenceBuffer} from '@services/SequenceBuffer';
import {
  buildRecognitionFromLandmarks,
  parseLandmarksFromTFLite,
} from '@services/recognitionFromLandmarks';
import {requestCameraPermission} from '@utils/permissions';
import {theme} from '@theme';
import {useResizePlugin} from 'vision-camera-resize-plugin';
import {useTensorflowModel} from 'react-native-fast-tflite';

const HAND_LANDMARK_MODEL_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hand_landmark_full.tflite';
const LANDMARK_INPUT_SIZE = 224;
const PROCESS_INTERVAL_MS = 100;
const SMOOTHING_FRAMES = 4; // Require N consecutive same letter before showing

const sequenceBuffer = new SequenceBuffer(30);

export const TensorScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isCameraActive,
    isDetectionActive,
    isFilming,
    countdown,
    currentResult,
  } = useAppSelector(state => state.tensor);

  const device = useCameraDevice('front');
  const [cameraSize, setCameraSize] = useState({width: 0, height: 0});
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessTime = useSharedValue(0);
  const letterBufferRef = useRef<string[]>([]);
  const [smoothedLabels, setSmoothedLabels] = useState<string[]>([]);

  const {resize} = useResizePlugin();
  const handModelSource = useMemo(() => ({url: HAND_LANDMARK_MODEL_URL}), []);
  const tfliteState = useTensorflowModel(handModelSource);
  const tfliteModel = tfliteState.state === 'loaded' ? tfliteState.model : undefined;

  const initializeCamera = useCallback(async () => {
    try {
      const granted = await requestCameraPermission();
      if (granted) {
        dispatch(setCameraActive(true));
        dispatch(setDetectionActive(true));
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required');
      }
    } catch (error) {
      dispatch(setError(`Failed to initialize: ${error}`));
    }
  }, [dispatch]);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [initializeCamera]);

  // Temporal smoothing: only show letter after N consecutive frames match
  useEffect(() => {
    if (!currentResult?.recognitions?.length) {
      letterBufferRef.current = [];
      setSmoothedLabels([]);
      return;
    }
    const labels = currentResult.recognitions
      .map(r => r.label)
      .filter(l => l && l !== 'Unknown');
    const primary = labels[0] ?? null;
    if (!primary) {
      letterBufferRef.current = [];
      setSmoothedLabels([]);
      return;
    }
    const buf = letterBufferRef.current;
    if (buf.length > 0 && buf[buf.length - 1] !== primary) {
      buf.length = 0;
    }
    buf.push(primary);
    if (buf.length > SMOOTHING_FRAMES) {
      buf.shift();
    }
    if (buf.length === SMOOTHING_FRAMES && buf.every(l => l === buf[0])) {
      setSmoothedLabels([buf[0]]);
    } else {
      setSmoothedLabels([]);
    }
  }, [currentResult]);

  const handleStartFilming = useCallback(() => {
    dispatch(startFilming());
    sequenceBuffer.clear();
    
    // Start countdown
    let count = 3;
    dispatch(updateCountdown(count));
    
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        dispatch(updateCountdown(count));
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        dispatch(updateCountdown(0));
      }
    }, 1000);
  }, [dispatch]);

  const handleStopFilming = useCallback(() => {
    dispatch(stopFilming());
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    dispatch(updateCountdown(0));
    
    // Process the collected sequence
    if (sequenceBuffer.isFull()) {
      const preprocessed = sequenceBuffer.getPreprocessedSequence();
      console.log('Sequence ready for LSTM model:', preprocessed.length);
      // TODO: Run TFLite model inference here
    } else {
      Alert.alert('Not Enough Data', 'Please record for at least 1 second');
    }
    
    sequenceBuffer.clear();
  }, [dispatch]);

  const processFrame = useCallback(
    (result: any) => {
      if (!isDetectionActive) return;

      let leftHandLandmarks = result.leftHandLandmarks;
      let rightHandLandmarks = result.rightHandLandmarks;
      if (result.rawLandmarks && Array.isArray(result.rawLandmarks) && result.rawLandmarks.length >= 63) {
        const landmarks = parseLandmarksFromTFLite(result.rawLandmarks);
        if (landmarks.length === 21) leftHandLandmarks = landmarks;
      }

      let stat = result;
      if (
        (leftHandLandmarks || rightHandLandmarks) &&
        (!result.recognitions || result.recognitions.length === 0)
      ) {
        stat = buildRecognitionFromLandmarks(
          leftHandLandmarks,
          rightHandLandmarks,
          {
            processingTime: result.processingTime ?? 0,
            fps: result.fps ?? 10,
            timestamp:
              typeof result.timestamp === 'number'
                ? result.timestamp
                : result.timestamp instanceof Date
                  ? result.timestamp.getTime()
                  : Date.now(),
          },
        );
      }

      // Ensure timestamp is serializable (ISO string) for Redux
      const serializableStat = {
        ...stat,
        timestamp:
          typeof stat.timestamp === 'string'
            ? stat.timestamp
            : typeof stat.timestamp === 'number'
              ? new Date(stat.timestamp).toISOString()
              : new Date().toISOString(),
      };
      dispatch(updateResults(serializableStat));

      if (
        isFilming &&
        countdown === 0 &&
        (stat.leftHandLandmarks || stat.rightHandLandmarks)
      ) {
        sequenceBuffer.addFrame(stat.leftHandLandmarks, stat.rightHandLandmarks);
      }
    },
    [dispatch, isDetectionActive, isFilming, countdown],
  );

  const runOnJSProcessFrame = useMemo(
    () => Worklets.createRunOnJS(processFrame),
    [processFrame],
  );

  const frameProcessor = useFrameProcessor(
    (frame: any) => {
      'worklet';
      const now = Date.now();
      if (now - lastProcessTime.value < PROCESS_INTERVAL_MS) return;
      lastProcessTime.value = now;
      const processingStart = now;

      try {
        const model = tfliteModel;
        if (model && resize) {
          const resized = resize(frame, {
            scale: {width: LANDMARK_INPUT_SIZE, height: LANDMARK_INPUT_SIZE},
            pixelFormat: 'rgb',
            dataType: 'float32',
          });
          const outputs = model.runSync([resized]);
          const rawLandmarks = outputs[0];
          if (rawLandmarks && rawLandmarks.length >= 63) {
            const arr = Array.from(rawLandmarks as Float32Array);
            const elapsed = Date.now() - processingStart;
            const fps = 1000 / PROCESS_INTERVAL_MS;
            runOnJSProcessFrame({
              rawLandmarks: arr,
              processingTime: elapsed,
              fps,
              timestamp: Date.now(),
            });
            return;
          }
        }
        runOnJSProcessFrame({
          recognitions: [],
          leftHandLandmarks: undefined,
          rightHandLandmarks: undefined,
          fps: 10,
          processingTime: 0,
          timestamp: Date.now(),
        });
      } catch (_) {
        runOnJSProcessFrame({
          recognitions: [],
          leftHandLandmarks: undefined,
          rightHandLandmarks: undefined,
          fps: 10,
          processingTime: 0,
          timestamp: Date.now(),
        });
      }
    },
    [runOnJSProcessFrame, tfliteModel, resize],
  );

  if (!device) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <ButtonText>No camera device found</ButtonText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View
        style={styles.cameraContainer}
        onLayout={e => {
          const {width, height} = e.nativeEvent.layout;
          setCameraSize({width, height});
        }}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraActive}
          frameProcessor={frameProcessor}
          androidPreviewViewType="texture-view"
        />

        {/* Hand Skeleton Overlay - positioned above camera with explicit zIndex */}
        {currentResult &&
          (currentResult.leftHandLandmarks || currentResult.rightHandLandmarks) && (
            <View
              style={styles.overlayContainer}
              pointerEvents="none">
              <HandSkeletonOverlay
                leftHandLandmarks={currentResult.leftHandLandmarks}
                rightHandLandmarks={currentResult.rightHandLandmarks}
                width={cameraSize.width || Dimensions.get('window').width}
                height={cameraSize.height || Dimensions.get('window').height}
              />
            </View>
          )}

        {/* Performance Metrics */}
        {currentResult && (
          <PerformanceOverlay
            fps={currentResult.fps}
            processingTime={currentResult.processingTime}
          />
        )}

        {/* Countdown Overlay */}
        <CountdownOverlay count={countdown} />

        {/* Detected ASL letter (smoothed over N frames for stability) */}
        {smoothedLabels.length > 0 && (
          <LetterOverlay labels={smoothedLabels} />
        )}
      </View>

      <Spacer size="lg" />

      {/* Controls */}
      <View style={styles.controls}>
        <Row justify="center">
          {!isFilming ? (
            <CustomButton onPress={handleStartFilming}>
              <ButtonText>Start Recording</ButtonText>
            </CustomButton>
          ) : (
            <CustomButton
              onPress={handleStopFilming}
              style={{backgroundColor: theme.colors.error}}>
              <ButtonText>Stop Recording</ButtonText>
            </CustomButton>
          )}
        </Row>
      </View>

      <Spacer size="xl" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    margin: theme.spacing.lg,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  controls: {
    paddingHorizontal: theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
