import React from 'react';
import { View, Text } from 'react-native';

const EmptyScreen = ({ userId }) => {

  return (
    <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
    {userId ? (
      <Text style={{ color: 'black' }}>User ID: {userId}</Text> // Display userId if it exists
    ) : (
      <Text style={{ color: 'black' }}>No details available.</Text>
    )}
  </View>
  );
};

export default EmptyScreen;
