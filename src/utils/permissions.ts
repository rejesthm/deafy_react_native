/**
 * Permission utilities for camera and microphone access
 */

import {Platform, Alert, Linking} from 'react-native';
import {Camera} from 'react-native-vision-camera';

/**
 * Request camera permission
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = await Camera.requestCameraPermission();
    
    if (permission === 'granted') {
      return true;
    }

    if (permission === 'denied') {
      showPermissionAlert('Camera');
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request microphone permission
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const permission = await Camera.requestMicrophonePermission();
    
    if (permission === 'granted') {
      return true;
    }

    if (permission === 'denied') {
      showPermissionAlert('Microphone');
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
};

/**
 * Show alert when permission is blocked
 */
const showPermissionAlert = (permissionName: string): void => {
  Alert.alert(
    `${permissionName} Permission Required`,
    `Please enable ${permissionName} access in Settings to use this feature.`,
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Open Settings', onPress: () => Linking.openSettings()},
    ],
  );
};

/**
 * Check if camera permission is granted
 */
export const hasCameraPermission = async (): Promise<boolean> => {
  const permission = await Camera.getCameraPermissionStatus();
  return permission === 'granted';
};
