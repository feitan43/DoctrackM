import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Animated,
  Text,
  StatusBar,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import {BlurView} from '@react-native-community/blur';

const SafeAreaLoader = ({
  children,
  indicatorColor = '#007AFF',
  indicatorSize = 'large',
}) => {
  const [isLoading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1.2)).current;

  useEffect(() => {
    const fetchSafeAreaInsets = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLoading(false);
    };

    fetchSafeAreaInsets();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Adjust duration as needed
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000, // Adjust duration as needed
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />

      <View style={styles.loadingContainer}>
        {/*  {isLoading && (
          <LottieView
            source={require('../assets/images/loadings.json')} // Update with your Lottie animation path
            autoPlay
            style={styles.lottieAnimation}
          />
        )} */}
        <Image
          source={require('../assets/images/doctracklogo.png')}
          style={[styles.logo]}
        />

        {/*    <Text
        style={{
          fontSize: 40,
    color: 'white',
    fontFamily: 'Oswald-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
        }}>
        DocMobile<Text style={{color: 'orange', fontSize: 25}}> v1</Text>
      </Text> */}
      </View>

      {/* Render children when loading is complete */}
      {!isLoading && children(insets)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',

  },
  overlay: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  logo: {
    height: 158,
    width: 125,
    margin: 40,
  },
  lottieAnimation: {
    width: 300,
    height: 300,
  },
});

export default SafeAreaLoader;
