/**
 * TensorScreen - Main camera detection screen
 * Matches Flutter tensor_screen.dart functionality
 */

import React, {useEffect, useRef, useCallback, useState} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Camera, useCameraDevice, useFrameProcessor} from 'react-native-vision-camera';
import {runOnJS} from 'react-native-reanimated';
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
import {requestCameraPermission} from '@utils/permissions';
import {theme} from '@theme';

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

      dispatch(updateResults(result));

      // Add to sequence buffer if filming and countdown finished
      if (isFilming && countdown === 0 && result.landmarks) {
        sequenceBuffer.addFrame(result.landmarks);
      }
    },
    [dispatch, isDetectionActive, isFilming, countdown]
  );

  /** Run detector when frame data is available (e.g. from native plugin or test harness). */
  const processFrameWithDetector = useCallback(
    async (frame: any, timestamp: number) => {
      if (!isDetectionActive || !frame) return;
      try {
        const result = await detector.processFrame(frame, timestamp);
        if (result) processFrame(result);
      } catch (e) {
        console.warn('Detector processFrame failed:', e);
      }
    },
    [isDetectionActive, processFrame]
  );

  const frameProcessor = useFrameProcessor(
    (frame: any) => {
      'worklet';
      const now = Date.now();
      if (now - (frameProcessor as any).lastProcessTime < 100) return;
      (frameProcessor as any).lastProcessTime = now;

      try {
        // When a native frame processor plugin provides frame data to JS, call
        // processFrameWithDetector(frame, now) to run MediaPipe and show ASL letter.
        // Until then we pass placeholder result so overlay and state stay consistent.
        runOnJS(processFrame)({
          recognitions: [],
          leftHandLandmarks: undefined,
          rightHandLandmarks: undefined,
          fps: 10,
          processingTime: 0,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Frame processing error:', error);
      }
    },
    [processFrame]
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
