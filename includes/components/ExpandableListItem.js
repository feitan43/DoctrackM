import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ExpandableListItem = ({ title, children, isInitialExpanded = false }) => {
  const [expanded, setExpanded] = useState(isInitialExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header} activeOpacity={0.8}>
        <Text style={styles.title}>{title}</Text>
        <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={28} color="#777" />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // Slightly more rounded corners
    marginBottom: 15, // More space between cards
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Softer, wider shadow
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20, // Increased padding
    paddingHorizontal: 25, // Increased padding
    backgroundColor: '#FFFFFF', // Keeping header white for consistency, relying on shadow for separation
  },
  title: {
    fontSize: 17, // Slightly larger title
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  content: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#F9F9F9', // Very light background for content area
    borderTopWidth: StyleSheet.hairlineWidth, // Very thin top border
    borderTopColor: '#EEE',
  },
});

export default ExpandableListItem;