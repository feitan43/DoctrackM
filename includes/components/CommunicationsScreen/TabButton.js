import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const TabButton = ({ title, isActive, onClick, iconName, activeColor, inactiveColor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive ? styles.tabButtonActive : styles.tabButtonInactive,
      ]}
      onPress={onClick}
    >
      <View style={styles.tabButtonContent}>
        <MaterialCommunityIcons 
          name={iconName} 
          size={24} 
          color={isActive ? activeColor : inactiveColor} 
        />
        <Text style={[
          styles.tabButtonText,
          isActive ? styles.tabButtonTextActive : styles.tabButtonTextInactive
        ]}>
          {title}
        </Text>
      </View>
      {isActive && <View style={styles.activeTabIndicator} />}
    </TouchableOpacity>
  );
};

export default TabButton;