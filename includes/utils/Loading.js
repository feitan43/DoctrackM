import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import {
BallIndicator,
BarIndicator,
DotIndicator,
MaterialIndicator,
PacmanIndicator,
PulseIndicator,
SkypeIndicator,
UIActivityIndicator,
WaveIndicator,
} from 'react-native-indicators';
const Loading = ({ visible = true, color = '#3B82F6', size = 40 }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BallIndicator color={color} size={size} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    //backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
