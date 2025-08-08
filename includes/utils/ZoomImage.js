import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';

const {width, height} = Dimensions.get('window');
const imageCache = new Set();

// Clamp helper function to restrict a value within a specified range
const clamp = (value, min, max) => {
  'worklet'; // Marks the function to run on the UI thread for performance
  return Math.min(Math.max(value, min), max);
};

const ZoomImage = ({source, close}) => {
  // State to manage image loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to manage image error status
  const [hasError, setHasError] = useState(false);

  // Shared values for animation:
  // Current scale of the image
  const scale = useSharedValue(1);
  // Saved scale value for pinch gesture calculations
  const savedScale = useSharedValue(1);
  // Focal point X-coordinate during pinch gesture
  const focalX = useSharedValue(0);
  // Focal point Y-coordinate during pinch gesture
  const focalY = useSharedValue(0);

  // Current translation X-coordinate of the image
  const translateX = useSharedValue(0);
  // Current translation Y-coordinate of the image
  const translateY = useSharedValue(0);
  // Saved translation X-coordinate for pan gesture calculations
  const savedTranslateX = useSharedValue(0);
  // Saved translation Y-coordinate for pan gesture calculations
  const savedTranslateY = useSharedValue(0);

  // Constants for scale limits and damping effect
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const DAMPING = 0.3;

  // Pinch gesture handler
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      // Save the current scale when the gesture starts
      savedScale.value = scale.value;
    })
    .onUpdate(event => {
      // Calculate the new scale, clamping it within MIN_SCALE and MAX_SCALE
      const newScale = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
      scale.value = newScale;
      // Update focal points for zoom center
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      // Animate scale back to MIN_SCALE if it's less than 1
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
      }
      // Animate scale back to MAX_SCALE if it's greater than 4 (optional, but good for consistency)
      // else if (scale.value > MAX_SCALE) {
      //   scale.value = withTiming(MAX_SCALE);
      // }
    });

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Save current translation when the gesture starts
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate(event => {
      // Calculate new translation based on current translation and gesture movement
      const dx = savedTranslateX.value + event.translationX;
      const dy = savedTranslateY.value + event.translationY;

      // Apply damping if scale is not greater than 1 (i.e., not zoomed in)
      const dampedX = dx * (scale.value > 1 ? 1 : DAMPING);
      const dampedY = dy * (scale.value > 1 ? 1 : DAMPING);

      translateX.value = dampedX;
      translateY.value = dampedY;
    })
    .onEnd(() => {
      // Reset translation to 0 if the image is not zoomed (scale <= 1)
      if (scale.value <= 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  // Compose pinch and pan gestures to work simultaneously
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for the image, applying transformations
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value}, // Apply X translation
      {translateY: translateY.value}, // Apply Y translation
      // Move the image so the focal point is at the center of the screen
      {translateX: focalX.value - width / 2},
      {translateY: focalY.value - height / 2},
      {scale: scale.value}, // Apply scale
      // Move the image back to its original position relative to the focal point
      {translateX: -(focalX.value - width / 2)},
      {translateY: -(focalY.value - height / 2)},
    ],
  }));

  // Effect to handle image loading status and caching
  useEffect(() => {
    if (source && imageCache.has(source.uri)) {
      setIsLoading(false); // If image is in cache, set loading to false immediately
    } else {
      setIsLoading(true); // Otherwise, set loading to true
      setHasError(false); // Reset error state when a new source is provided
    }
  }, [source]);

  // Handler for successful image load
  const handleLoad = () => {
    if (source?.uri && !imageCache.has(source.uri)) {
      imageCache.add(source.uri); // Add image URI to cache
    }
    setIsLoading(false); // Set loading to false on successful load
  };

  // Handler for image load error
  const handleError = (e) => {
    console.error("Image loading error:", e.nativeEvent.error);
    setHasError(true); // Set error state to true
    setIsLoading(false); // Set loading to false on error
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {/* Close button */}
        {/* <TouchableOpacity onPress={close} style={styles.closeButton}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity> */}

        {isLoading && !hasError && (
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading image...</Text>
          </View>
        )}

        {hasError && (
          <View style={styles.centeredMessage}>
            <Text style={styles.errorText}>Failed to load image.</Text>
            <Text style={styles.errorText}>Please check the source or your network connection.</Text>
          </View>
        )}

        {!hasError && (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={animatedStyle}>
              <FastImage
                source={{
                  ...source,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.contain}
                onLoad={handleLoad}
                onError={handleError} // Correctly referencing the defined handleError function
              />
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width,
    height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  centeredMessage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
});

export default ZoomImage;
