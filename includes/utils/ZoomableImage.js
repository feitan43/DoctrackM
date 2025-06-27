import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
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

const ZoomableImage = ({uri, close}) => {

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate(event => {
      scale.value = savedScale.value * event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
      } else if (scale.value > 4) {
        scale.value = withTiming(4);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: focalX.value - width / 2},
      {translateY: focalY.value - height / 2},
      {scale: scale.value},
      {translateX: -(focalX.value - width / 2)},
      {translateY: -(focalY.value - height / 2)},
    ],
  }));

  useEffect(() => {
    if (uri && imageCache.has(uri)) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [uri]);

  const handleLoad = () => {
    if (!imageCache.has(uri)) {
      imageCache.add(uri);
    }
    setIsLoading(false);
  };

  const handleError = e => {
    console.log('Image failed to load', e.nativeEvent.error);
    setHasError(true);
    setIsLoading(false);
  };

  const handleClose = () => {
    console.log("close")
    if (uri) {
      imageCache.delete(uri);
      FastImage.clearMemoryCache();
      FastImage.clearDiskCache();
    }
    close();
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {(isLoading || hasError) && (
          <View style={styles.centeredMessage}>
            {isLoading && !hasError && (
              <Text style={styles.loadingText}>Loading image...</Text>
            )}
            {hasError && (
              <Text style={styles.errorText}>Failed to load image</Text>
            )}
          </View>
        )}

        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={animatedStyle}>
            <FastImage
              source={{
                uri,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain}
              onLoad={handleLoad}
              onError={handleError}
            />
          </Animated.View>
        </GestureDetector>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingText: {
    color: '#fff',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff0000',
    position: 'absolute',
    top: 20,
  },
  centeredMessage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default ZoomableImage;
