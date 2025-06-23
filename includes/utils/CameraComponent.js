import React, {useRef, useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
  CameraProps,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import {CameraRoll} from '@react-native-camera-roll/camera-roll'; 
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

/**
 * CameraComponent
 * A full-screen camera view for taking photos with zoom and device switching.
 * It integrates with react-native-vision-camera and react-native-reanimated
 * for camera control and gestures.
 *
 * @param {object} props - The component props.
 * @param {function(string): void} props.onPhotoTaken - Callback function to be called with the URI of the captured photo.
 * @param {function(): void} props.onClose - Callback function to close the camera view.
 */
const CameraComponent = ({onPhotoTaken, onClose}) => {
  const [cameraDevice, setCameraDevice] = useState('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice(cameraDevice, {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera',
    ],
  });

  const zoom = useSharedValue(device?.neutralZoom ?? 1);
  const zoomOffset = useSharedValue(0);

  const [lastSavedPhoto, setLastSavedPhoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const cameraRef = useRef(null);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value; 
    })
    .onUpdate(event => {
      const newZoom = zoomOffset.value * event.scale;
      zoom.value = interpolate(
        newZoom,
        [1, 10],
        [device.minZoom, device.maxZoom], 
        Extrapolation.CLAMP, 
      );
    });

  // Animated props for the Camera component (specifically for zoom)
  const animatedCameraProps = useAnimatedProps(() => ({
    zoom: zoom.value,
  }), [zoom]);

  // Request camera permission on component mount if not already granted
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Handles requesting camera permission and alerts user if denied
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to take photos. Please enable it in your device settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
    }
  }, [requestPermission]);

  // Function to capture a photo
  const takePhoto = useCallback(async () => {
    if (cameraRef.current == null || isCapturing) {
      // Prevent multiple captures simultaneously or if camera ref is not ready
      return;
    }

    if (!hasPermission) {
      // Ensure permission is granted before attempting to take photo
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to take photos. Please grant access.',
      );
      handleRequestPermission(); // Prompt for permission
      return;
    }

    setIsCapturing(true); // Indicate that capture is in progress
    setIsButtonPressed(true); // Visual feedback for button press

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality', // Prioritize image quality
        flash: 'off', // Can be 'on', 'off', 'auto'
        enableShutterAndAutoFocusing: true,
      });

      if (photo && photo.path) {
        const photoUri = `file://${photo.path}`;

        // Save photo to device's camera roll
        // This requires write permissions (READ_EXTERNAL_STORAGE/WRITE_EXTERNAL_STORAGE or READ_MEDIA_IMAGES)
        try {
          await CameraRoll.save(photoUri, {type: 'photo'});
          setLastSavedPhoto(photo); // Update state for the camera roll preview icon
          console.log('Photo saved to camera roll:', photoUri);
        } catch (saveError) {
          console.error('Failed to save photo to camera roll:', saveError);
          // Alert user that photo was taken but couldn't be saved to gallery
          Alert.alert('Save Error', 'Photo taken, but failed to save to gallery.');
        }

        // Pass the photo URI back to the parent component
        onPhotoTaken(photoUri);
      } else {
        throw new Error('Photo path is undefined after capture.');
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Capture Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsCapturing(false); // Reset capture state
      // Add a slight delay for visual feedback before resetting button state
      setTimeout(() => setIsButtonPressed(false), 200);
    }
  }, [hasPermission, isCapturing, onPhotoTaken, handleRequestPermission]);

  // Toggle between front and back camera
  const toggleCameraDevice = useCallback(() => {
    setCameraDevice(prevDevice => (prevDevice === 'back' ? 'front' : 'back'));
  }, []);

  // Use camera format for specific resolutions or FPS (optional, but good for control)
  const format = useCameraFormat(device, [
    {videoAspectRatio: 16 / 9},
    {videoResolution: {width: 1920, height: 1080}}, // Example: Full HD capture
    {fps: 30}, // Example: 30 FPS
  ]);

  // Render permission request page if no permission
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission required.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
          <Icon name="close-circle-outline" size={40} color="white" />
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render error if no camera device is found
  if (device === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device found.</Text>
        <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
          <Icon name="close-circle-outline" size={40} color="white" />
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <ReanimatedCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          photo={true}
          isActive={true} // Camera is active when this component is mounted
          animatedProps={animatedCameraProps}
          format={format} // Apply the selected format
          fps={format.fps} // Set FPS based on format
        />
      </GestureDetector>

      <View style={styles.controlsContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Close Camera">
          <Icon name="close-outline" size={35} color="white" />
        </TouchableOpacity>

        {/* Camera Roll Preview Button */}
        <TouchableOpacity
          onPress={() => {
            // This button could optionally launch react-native-image-picker's gallery
            // if you want to allow users to select from the gallery directly from here.
            // For now, it's just a visual placeholder for the last photo.
            Alert.alert('Camera Roll', 'This button can be linked to your photo gallery.');
          }}
          style={styles.cameraRollButton}
          accessibilityLabel="View last taken photo or open camera roll">
          {lastSavedPhoto ? (
            <Image
              source={{uri: `file://${lastSavedPhoto.path}`}}
              style={styles.cameraRollIcon}
            />
          ) : (
            <Icon name="image-outline" size={30} color="white" />
          )}
        </TouchableOpacity>

        {/* Take Photo Button */}
        <TouchableOpacity
          onPress={takePhoto}
          onPressIn={() => setIsButtonPressed(true)}
          onPressOut={() => setIsButtonPressed(false)}
          activeOpacity={1}
          style={[styles.photoButton, isButtonPressed && styles.photoButtonPressed]}
          disabled={isCapturing}
          accessibilityLabel="Take Photo">
          {isCapturing ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <View style={styles.captureCircle} />
          )}
        </TouchableOpacity>

        {/* Toggle Camera Device Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleCameraDevice}
          disabled={isCapturing}
          accessibilityLabel="Toggle Camera (Front/Back)">
          <Icon name="camera-reverse-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeModalButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 16,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 30 : 20, // Adjust padding for iOS bottom safe area
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
  },
  closeButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cameraRollButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensure image respects border radius
  },
  cameraRollIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoButton: {
    width: 75,
    height: 75,
    borderRadius: 999, // Makes it a perfect circle
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  photoButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.2)', // Slight transparent fill when pressed
  },
  captureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  toggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraComponent;