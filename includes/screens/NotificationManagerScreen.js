import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, Alert} from 'react-native';
import notifee, {
  AuthorizationStatus,
  AndroidStyle,
  AndroidImportance,
  AndroidColor,
  AndroidBadgeIconType,
  AndroidGroupAlertBehavior,
  AndroidVisibility,
} from '@notifee/react-native';
import baseUrl from '../../config';

const NotificationManager = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = () => {
    setNotification('New Notification!');
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const handleNotificationPress = () => {
    if (notification) {
      Alert.alert('Notification Pressed', 'You clicked the notification!');
      hideNotification();
    }
  };

  const triggerFunction = async () => {
    try {
      const response = await fetch(`${baseUrl}/triggerFunction`, {
        method: 'POST',
      });

      if (response.ok) {
        Alert.alert('Success', 'Function triggered successfully');
      } else {
        Alert.alert('Error', 'Failed to trigger function');
      }
    } catch (error) {
      console.error('Error triggering function:', error);
      Alert.alert('Error', 'Failed to trigger function');
    }
  };

  const triggerFunction2 = () => {
    Alert.alert('Notification Pressed', 'You clicked the notification!');
    displayNotification();
  };

  async function createChannel() {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH, // Use AndroidImportance
    });

    return channelId;
  }

  async function displayNotification() {
    const channelId = await createChannel();

    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Notification Body',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        showBadge: true, // Ensure this is set to true
      },
    });
  }

  /*  async function onDisplayNotification() {
    try {
      // Request permissions (required for iOS)
      await notifee.requestPermission();
  
      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'sound',
        name: 'Default Channel',
        sound: 'notificationdelays',
        importance: AndroidImportance.HIGH
      });
  
      // Display a heads-up notification with a popup style
      await notifee.displayNotification({
        title: 'Notification Title',
        body: 'Main body content of the notification',
        android: {
          channelId,
          sound: 'notificationdelays',
          pressAction: {
            id: 'default', // Make sure this id matches the channel ID
          },
        },
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
      // Handle the error as needed, such as showing an error message to the user
    }
  } */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTIFICATION MANUAL! FOR TESTING!</Text>
      {notification && (
        <View style={styles.notification}>
          <Text>{notification}</Text>
          <Button title="Dismiss" onPress={hideNotification} />
          <Button title="Press Me" onPress={handleNotificationPress} />
        </View>
      )}
      <View style={{gap: 20}}>
        <Button title="Notify" onPress={() => triggerFunction()} />

        <Button title="TEST" onPress={() => triggerFunction2()} />
      </View>

      {/* <Button title="TEST" onPress={() => onDisplayNotification()} /> */}
      <View style={{padding: 20}}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notification: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default NotificationManager;
