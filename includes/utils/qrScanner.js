// utils/qrScanner.js
import {Camera} from 'react-native-vision-camera';
import {Platform} from 'react-native';

// Ask for camera permission
export const requestCameraPermission = async () => {
  const permissionStatus = await Camera.requestCameraPermission();
  return permissionStatus === 'authorized';
};

// Check current camera permission
export const checkCameraPermission = async () => {
  const status = await Camera.getCameraPermissionStatus();
  return status === 'authorized';
};

// QR data validator (simple or JSON-based)
export const validateQRData = (data) => {
  try {
    const parsed = JSON.parse(data);
    return {valid: true, data: parsed};
  } catch (err) {
    return {valid: true, data}; // Still valid if it's plain text
  }
};

export const sanitizeQRData = (data) => {
  return data.trim();
};

export const isValidTrackingNumber = (data) => {
  return /^(\d{4,}-?\d+)$/.test(data);
};