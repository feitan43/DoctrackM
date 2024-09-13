import {StyleSheet, Text, View, Image, Animated, StatusBar} from 'react-native';
import React, {useEffect, useRef} from 'react';

const SplashScreen = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

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

    setTimeout(() => {
      // navigation.replace('Home');
    }, 3000);
  }, []);

  return (
    <View
      style={{
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
     {/*  <Animated.Image
        source={require('../../assets/images/doctracklogo.png')}
        style={[styles.logo, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}
      /> */}
      <Text
        style={{
          fontSize: 40,
          color: 'black',
          fontFamily: 'Oswald-SemiBold',
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: {width: -1, height: 1},
          textShadowRadius: 10,
        }}>
        DocMobile
      </Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  logo: {
    height: 158,
    width: 125,
    margin: 40,
  },
});
