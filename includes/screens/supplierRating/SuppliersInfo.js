import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const generateRandomCoordinate = () => {
  const latitude = (Math.random() * 180 - 90).toFixed(6);    // -90 to +90
  const longitude = (Math.random() * 360 - 180).toFixed(6);  // -180 to +180
  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };
};

const MapScreen = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const coord = generateRandomCoordinate();
    setLocation(coord);
  }, []);

  if (!location) return <Text style={styles.loading}>Loading map...</Text>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        <Marker coordinate={location} title="Random Location" />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
  },
});

export default MapScreen;
