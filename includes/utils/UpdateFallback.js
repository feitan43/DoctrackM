import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import HotUpdater from "@hot-updater/react-native";

const UpdateFallback = ({ progress = 0, status }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress * 200, 
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (status === 'UPDATED') {
      setTimeout(() => {
        HotUpdater.reload();
      }, 2000);
    }
  }, [status]);

  return (
    <View style={styles.fallbackContainer}>
      <Image source={require('../../assets/images/doctracklogo.png')} style={styles.logo} />
      <Text style={styles.fallbackText}>
        {status === 'UPDATED' ? 'Update Complete! Restarting App...' : 'Updating...'}
      </Text>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: animatedWidth }]} />
      </View>

      {progress > 0 && <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: 200,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007BFF',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 5,
  },
});

export default UpdateFallback;
