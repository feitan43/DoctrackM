import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <Image
          source={require("../../assets/images/asset1.png")}
          style={styles.image}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200, // Set your desired width
    height: 200, // Set your desired height
    resizeMode: 'contain', // Adjust the image resizeMode as needed
  },
});

export default LoadingScreen;
