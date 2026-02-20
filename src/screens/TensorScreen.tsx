/**
 * TensorScreen - Main camera detection screen
 * Real-time hand landmarks via Vision Camera + resize plugin + TFLite hand landmark model.
 */

import React, {useEffect, useRef, useCallback, useState, useMemo} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Camera, useCameraDevice, useFrameProcessor} from 'react-native-vision-camera';
import {runOnJS, useSharedValue} from 'react-native-reanimated';
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
import {HolisticDetector} from '@services/HolisticDetector';
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
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hand_landmark_lite.tflite';
const LANDMARK_INPUT_SIZE = 224;
const PROCESS_INTERVAL_MS = 100;

const detector = new HolisticDetector();
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

  const {resize} = useResizePlugin();
  const handModelSource = useMemo(() => ({url: HAND_LANDMARK_MODEL_URL}), []);
  const tfliteState = useTensorflowModel(handModelSource);
  const tfliteModel = tfliteState.state === 'loaded' ? tfliteState.model : undefined;

  useEffect(() => {
    initializeCamera();
    return () => {
      detector.dispose();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const granted = await requestCameraPermission();
      if (granted) {
        await detector.initialize();
        dispatch(setCameraActive(true));
        dispatch(setDetectionActive(true));
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required');
      }
    } catch (error) {
      dispatch(setError(`Failed to initialize: ${error}`));
    }
  };

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
            timestamp: result.timestamp instanceof Date ? result.timestamp : new Date(),
          },
        );
      }

      dispatch(updateResults(stat));

      if (isFilming && countdown === 0 && stat.landmarks && stat.landmarks.length > 0) {
        sequenceBuffer.addFrame(stat.landmarks);
      }
    },
    [dispatch, isDetectionActive, isFilming, countdown],
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
            runOnJS(processFrame)({
              rawLandmarks: arr,
              processingTime: elapsed,
              fps,
              timestamp: new Date(),
            });
            return;
          }
        }
        runOnJS(processFrame)({
          recognitions: [],
          leftHandLandmarks: undefined,
          rightHandLandmarks: undefined,
          fps: 10,
          processingTime: 0,
          timestamp: new Date(),
        });
      } catch (_) {
        runOnJS(processFrame)({
          recognitions: [],
          leftHandLandmarks: undefined,
          rightHandLandmarks: undefined,
          fps: 10,
          processingTime: 0,
          timestamp: new Date(),
        });
      }
    },
    [processFrame, tfliteModel, resize],
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
        />

        {/* Hand Skeleton Overlay */}
        {currentResult && (
          <HandSkeletonOverlay
            leftHandLandmarks={currentResult.leftHandLandmarks}
            rightHandLandmarks={currentResult.rightHandLandmarks}
            width={cameraSize.width}
            height={cameraSize.height}
          />
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

        {/* Detected ASL letter or gesture */}
        {currentResult?.recognitions && currentResult.recognitions.length > 0 && (
          <LetterOverlay
            labels={currentResult.recognitions.map(r => r.label)}
          />
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
  controls: {
    paddingHorizontal: theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
