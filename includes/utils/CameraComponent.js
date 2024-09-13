import React, {useRef, useState, useEffect, useMemo} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  StyleSheet,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
  CameraProps,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import {CameraRoll, useCameraRoll} from '@react-native-camera-roll/camera-roll';
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {interpolate, Extrapolation} from 'react-native-reanimated';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

const CameraComponent = () => {
  const [isPressed, setIsPressed] = useState(false);
  const zoom = useSharedValue(device?.neutralZoom ?? 1); // Assuming 1 is a default value if neutralZoom is undefined
  const [photo, setPhoto] = useState(null); // State variable to hold the photo object

  const zoomOffset = useSharedValue(0);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value;
    })
    .onUpdate(event => {
      const z = zoomOffset.value * event.scale;
      zoom.value = interpolate(
        z,
        [1, 10],
        [device.minZoom, device.maxZoom],
        Extrapolation.CLAMP,
      );
    });

  const animatedProps =
    useAnimatedProps < CameraProps > (() => ({zoom: zoom.value}), [zoom]);
  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const {hasPermission} = useCameraPermission();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraDevice, setCameraDevice] = useState('back'); // Initialize camera device state
  const camera = useRef(null);
  const [photos, getPhotos, save] = useCameraRoll();

  const openCameraRoll = async () => {

  };

  
  const device = useCameraDevice(cameraDevice, {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera',
    ],
  });

  const takePhoto = async () => {
    console.log('TAKING PHOTO');
    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
        enableAutoRedEyeReduction: true,
      });

      // Check if photo is not undefined before accessing its path property
      if (photo && photo.path) {
        console.log('Took photo:', photo);

        // Save the photo to camera roll using its path
        await CameraRoll.save(photo.path);

        setPhoto(photo);
        console.log('Photo saved to camera roll');
      } else {
        throw new Error('Photo path is undefined');
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.'); // Display error message
    }
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera permission to take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('Camera permission granted');
        setCameraReady(true); // Set camera ready state to true
      } else {
        //console.log('Camera permission denied');
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to use this feature.',
        );
      }
    } catch (err) {
      console.warn(err);
      Alert.alert(
        'Error',
        'Failed to request camera permission. Please try again.',
      ); // Display error message
    }
  };

  useEffect(() => {
    requestCameraPermission();
    /*     return () => {
      if (camera.current) {
        camera.current.release();
      }
    }; */
  }, []);

  const PermissionsPage = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required.</Text>
        <TouchableOpacity onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const toggleCameraDevice = () => {
    const newCameraDevice = cameraDevice === 'back' ? 'front' : 'back';
    setCameraDevice(newCameraDevice);
  };

  const NoCameraDeviceError = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No camera device found.</Text>
      </View>
    );
  };

  const format = useCameraFormat(device, [
    {videoAspectRatio: 16 / 9},
    {videoResolution: {width: 640, height: 480}},
    {fps: 60},
  ]);

  const fps = format.maxFps >= 240 ? 240 : format.maxFps;

  if (!hasPermission) return <PermissionsPage />;
  if (device === null) return <NoCameraDeviceError />;

  return (
    <View style={styles.container}>
      {cameraReady ? (
        <GestureDetector gesture={gesture}>
          <ReanimatedCamera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            photo={true}
            isActive={true}
            animatedProps={animatedProps}
          />
        </GestureDetector>
      ) : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={openCameraRoll}
          style={styles.cameraRollButton}>
          {photo && (
            <Image source={{uri: photo.path}} style={styles.cameraRollIcon} />
          )}
        </TouchableOpacity>

        {/*     <View style={{borderRadius: 999, borderWidth: 6}}>
        <Pressable
          style={({pressed}) => [
            pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
            styles.cameraButton,
          ]}
          android_ripple={{color: 'gray'}}
          onPress={takePhoto}>
        </Pressable>
        </View> */}

        <TouchableOpacity
          onPress={takePhoto}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1} // To disable the default opacity change on press
          style={[styles.photoButton, isPressed && styles.pressed]}>
          <View style={[styles.circle, isPressed && styles.circlePressed]} />
          <View style={[styles.ring, isPressed && styles.ringPressed]} />
        </TouchableOpacity>
        <View
          style={{backgroundColor: '#242424', padding: 10, borderRadius: 999}}>
          <TouchableOpacity
            style={({pressed}) => [
              pressed && {backgroundColor: 'gray'},
              styles.cameraButton,
            ]}
            android_ripple={{color: 'gray'}}
            onPress={toggleCameraDevice}>
            <Icon name="camera-reverse-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Set background color to black
  },
  text: {
    color: 'white', // Set text color to white
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    marginHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  camera: {
    flex: 1,
    aspectRatio: 16 / 9, // Set aspect ratio for camera preview
  },
  cameraButton: {
    width: 60,
    height: 60,
    backgroundColor: 'gray',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButton: {
    width: 75,
    height: 75,
    borderRadius: 999,
    borderWidth: 6,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  circle: {
    width: '75%',
    height: '75%',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    opacity: 0,
  },
  circlePressed: {
    opacity: 1,
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 999,
    borderWidth: 5,
    borderColor: '#ffffff',
    opacity: 0.8,
  },
  ringPressed: {
    opacity: 1,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Align the content to the bottom
  },
  blackBackground: {
    backgroundColor: 'black', // Black background color
    height: 130, // Adjust height as needed
  },
  cameraRollButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraRollIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'gray',
    resizeMode: 'contain',
  },
});

export default CameraComponent;
