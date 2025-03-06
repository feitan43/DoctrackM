import React, { useEffect } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import { Camera } from 'react-native-vision-camera';

const CameraPermission = () => {
  useEffect(() => {
    handleCameraPermission();
  }, []);

  const handleCameraPermission = async () => {
    try {
      const permissionType =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      const cameraPermission = await check(permissionType);

      if (cameraPermission === RESULTS.GRANTED) {
        //console.log('Camera permission granted via react-native-permissions.');
      } else if (cameraPermission === RESULTS.DENIED || cameraPermission === RESULTS.LIMITED) {
        // Request permission if it was previously denied or limited
        const requestResult = await request(permissionType);
        if (requestResult === RESULTS.GRANTED) {
          //console.log('Camera permission granted after request via react-native-permissions.');
        } else {
          handlePermissionDenied('Camera permission is required to scan QR codes.');
        }
      } else if (cameraPermission === RESULTS.BLOCKED) {
        // Handle the blocked state
        handlePermissionBlocked('Camera permission is blocked.');
      } else {
        console.warn('Unhandled permission status:', cameraPermission);
      }

      const visionCameraPermission = Camera.getCameraPermissionStatus();
      if (visionCameraPermission === 'authorized') {
        //console.log('Camera permission granted via Vision Camera.');
      } else if (visionCameraPermission === 'not-determined') {
        const visionRequestResult = await Camera.requestCameraPermission();
        if (visionRequestResult === 'authorized') {
          //console.log('Camera permission granted via Vision Camera request.');
        } else {
          handlePermissionDenied('Camera permission is required to use the Vision Camera.');
        }
      } else if (visionCameraPermission === 'denied') {
        handlePermissionBlocked('Camera permission is blocked for Vision Camera.');
      }
    } catch (error) {
      console.error('Error checking or requesting camera permission:', error);
      Alert.alert(
        'Error',
        'An error occurred while checking camera permissions. Please try again.',
      );
    }
  };

  const handlePermissionDenied = (message) => {
    Alert.alert(
      'Permission Denied',
      `${message} Would you like to try granting permission again?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: () => handleCameraPermission(),
        },
      ]
    );
  };

  const handlePermissionBlocked = (message) => {
    Alert.alert(
      'Permission Blocked',
      `${message} You need to enable it manually in the app settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Platform.OS === 'ios'
              ? Linking.openURL('app-settings:')
              : Linking.openSettings();
          },
        },
      ]
    );
  };

  return null; // No UI component needed here
};

export default CameraPermission;
