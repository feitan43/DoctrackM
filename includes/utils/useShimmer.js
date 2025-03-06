import React, { useRef, useEffect, memo } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export const Shimmer = memo(({ width = screenWidth * 0.95, height = 150, borderRadius = 8 }) => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnimatedValue]);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.shimmerWrapper, { width, height, borderRadius }]}>
      <Animated.View
        style={{ ...StyleSheet.absoluteFillObject, transform: [{ translateX }] }}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  shimmerWrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  gradient: {
    flex: 1,
  },
});
