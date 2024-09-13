import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import RadialGradient from 'react-native-radial-gradient'; // Import RadialGradient library
import {PermissionsAndroid, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import notifee, {EventType} from '@notifee/react-native';

const SettingsScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const navigation = useNavigation();

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
    // Handle enabling/disabling notifications
  };


/* useEffect((
)) */

/* 


/*   if (notificationsEnabled) {
    // Notifications are enabled, perform actions accordingly
    console.log('Notifications are enabled.');
  } else {
    // Notifications are disabled, perform actions accordingly
    console.log('Notifications are disabled.');
  }
 */


  const handleNotification = async () => {
    await notifee.openNotificationSettings();
  }

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app would like to send you notifications.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
          return true;
        } else {
          console.log('Notification permission denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // For iOS, notification permissions are handled differently
      console.log('For iOS, notification permissions are handled differently');
      return false;
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#171717" barStyle="white-content" />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{borderRadius: 100, overflow: 'hidden', margin: 5}}>
                <Pressable
                  style={({pressed}) => [
                    pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                    {
                      width: 40,
                      backgroundColor: 'transparent',
                      padding: 5,
                      flexDirection: 'row',
                      alignItems: 'center',
                    },
                  ]}
                  android_ripple={{color: 'gray'}}
                  onPress={() => navigation.goBack()}>
                  <Icon name="chevron-back-outline" size={26} color="white" />
                </Pressable>
              </View>
              <Text
                style={{
                  padding: 10,
                  fontSize: 24,
                  fontFamily: 'Oswald-SemiBold',
                  color: 'white',
                }}>
                Settings
              </Text>
            </View>
          </View>

          <View style={{paddingStart: 30}}>
            <Text style={{color: 'silver'}}>Notifications</Text>
          </View>

          <TouchableOpacity onPress={handleNotification}>
          <View
            style={{
              backgroundColor: '#444444',
              marginHorizontal: 10,
              borderRadius: 5,
              marginTop: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    marginStart: 10,
                    padding: 5,
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'left',
                    fontFamily: 'Roboto-Medium',
                  }}>
                  All Notifications
                </Text>
              </View>
              <Icon
                name="chevron-forward-outline"
                size={26}
                color="silver"
              />
            </View>
          </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
