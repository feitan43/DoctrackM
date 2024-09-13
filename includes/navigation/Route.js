import {
  NavigationContainer,
  useNavigation,
  DarkTheme,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Text,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import notifee, {
  EventType,
  AuthorizationStatus,
  AndroidImportance,
} from '@notifee/react-native';
import {
  notificationListeners,
  checkBatteryOptimization,
} from '../notification/notificationServices';

//screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import DoctrackScreen from '../screens/DoctrackScreen';
import ForumScreen from '../screens/ForumScreen';
import MyTransactionsScreen from '../screens/MyTransactionsScreen';
import NotificationManagerScreen from '../screens/NotificationManagerScreen';
import SummaryScreen from '../screens/SummaryScreen';
import DetailScreen from '../screens/DetailScreen';

//notif
import NavigationService from './navigationServices';

//api
import useUserInfo from '../api/useUserInfo';
import useDelaysPerOffice from '../api/useDelaysRegOffice';
import useGenInformation from '../api/useGenInformation';
import LoadingScreen from '../screens/LoadingScreen';
import SplashScreen from '../screens/SplashScreen';
import EmptyScreen from '../screens/EmptyScreen';
import MyTransactionDetails from '../screens/MyTransactionDetails';
import OfficeDelaysScreen from '../screens/OfficeDelaysScreen';
import RecentUpdatedScreen from '../screens/RecentUpdatedScreen';
import NotificationsScreen from '../screens/NotificationScreen';
import {
  createStackNavigator,
  CardStyleInterpolators,
  TransitionPresets,
  TransitionSpecs,
} from '@react-navigation/stack';
import {Easing} from 'react-native-reanimated';
import SettingsScreen from '../screens/SettingsScreen';
import baseUrl from '../../config';
import CameraComponent from '../utils/CameraComponent';
import DeviceInfo from 'react-native-device-info';
import RNFetchBlob from 'react-native-blob-util';
import BootSplash from 'react-native-bootsplash';
import RNBootSplash from 'react-native-bootsplash';
import StatusView from '../screens/procProgress/StatusView';
import WebViewScreen from '../screens/WebViewScreen';
import ProjectCleansingDetails from '../screens/ProjectCleansingDetails';
import ProjectCleansingFullDetails from '../screens/ProjectCleansingFullDetails';
import OthersScreen from '../screens/OthersScreen';
import ProjectCleansingScreen from '../screens/ProjectCleansingScreen';

export function Route() {
  const [initialRoute, setInitialRoute] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [tokens, setToken] = useState(null);
  const [showReminder, setShowReminder] = useState(false);

  const {delaysRegOfficeData, delaysLoading} = useDelaysPerOffice();
  const {genInformationData} = useGenInformation();

  const {userData, fullName, officeCode} = useUserInfo();

  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');

  const [loginState, setLoginState] = useState();
  const Stack = createStackNavigator();

  useEffect(() => {
    const init = async () => {};

    init().finally(async () => {
      await BootSplash.hide({fade: true});
      //console.log("BootSplash has been hidden successfully");
    });
  }, []);

  useEffect(() => {
    // Get the current version of the app
    const getVersion = async () => {
      const version = DeviceInfo.getVersion();
      setCurrentVersion(version);
      // Call a function to check against the latest version
      checkForUpdates(version);
    };
    getVersion();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setLoading(false);

        setInitialRoute(storedToken ? 'Home' : 'Login');
      } catch (error) {
        setLoading(false);
        console.error('Error checking token:', error);
        // Handle error (e.g., show error message or fallback to default route)
      }
    };

    checkToken();
  }, []);

  const checkForUpdates = async currentVersion => {
    try {
      const response = await fetch(`${baseUrl}/get-latest-version`);
      const data = await response.json();
      const latestVersionFromServer = data.latestVersion;
      const url = data.latestVersion.updateUrl;
      setLatestVersion(latestVersionFromServer);
      //console.log(data.latestVersion.updateUrl)
      /* console.log("v",latestVersionFromServer) */

      if (latestVersionFromServer.version !== currentVersion) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Please update to the latest version.',
          [
            {text: 'Update Now', onPress: () => handleUpdate(url)},
            {text: 'Cancel', style: 'cancel'},
          ],
          {cancelable: false},
        );
      } else {
        // App is up to date
        // Alert.alert('Up to Date', 'You are already using the latest version of the app.');
      }
    } catch (error) {
      // console.error('Error fetching the latest version:', error);
      Alert.alert(
        'Error',
        'Failed to check for updates. Please try again later.',
      );
    }
  };

  const handleUpdate = async updateUrl => {
    const appStoreUrl = 'https://apps.apple.com/app/[your-app-id]';
    const url = Platform.OS === 'ios' ? appStoreUrl : updateUrl;

    const path = `${RNFetchBlob.fs.dirs.DocumentDir}/update.apk`; 
    await notifee.createChannel({
      id: 'update',
      name: 'Update Channel',
      importance: AndroidImportance.HIGH,
      vibration: false, 
    });

    await notifee.displayNotification({
      id: 'progress',
      title: 'Downloading Update',
      body: 'Please wait while the update is being downloaded.',
      android: {
        channelId: 'update',
        vibrationPattern: [500, 1000, 500, 1000],
        progress: {
          max: 100,
          current: 0,
          indeterminate: true,
        },
      },
    });

    RNFetchBlob.config({
      path,
      fileCache: true,
    })
      .fetch('GET', url)
      .progress((received, total) => {
        // console.log('Received:', received, 'Total:', total);
        const progress = Math.floor((received / total) * 100);
        notifee.displayNotification({
          id: 'progress',
          title: 'Downloading Update',
          body: `Downloading... ${progress}%`,
          android: {
            channelId: 'update',
            smallIcon: 'ic_launcher_round',
            vibrationPattern: [500, 1000, 500, 1000],
            progress: {
              max: 100,
              current: progress,
              indeterminate: false,
            },
          },
        });
      })
      .then(async res => {
        console.log('File downloaded to ', path);

        await notifee.cancelNotification('progress');

        await notifee.displayNotification({
          title: 'Download Complete',
          body: 'The update has been downloaded successfully.',
          android: {
            channelId: 'update',
            smallIcon: 'ic_launcher_round',
            importance: AndroidImportance.HIGH,
          },
        });

        if (Platform.OS === 'android') {
          RNFetchBlob.android.actionViewIntent(
            res.path(),
            'application/vnd.android.package-archive',
          );
        } else if (Platform.OS === 'ios') {
          Linking.openURL(appStoreUrl)
            .then(() => {
              console.log('Opened app store successfully');
            })
            .catch(error => {
              console.error('Failed to open app store:', error);
              Alert.alert('Error', 'Failed to open app store.');
            });
        }
      })
      .catch(async error => {
        console.error('Failed to download update:', error);
        await notifee.cancelNotification('progress');
        Alert.alert('Error', 'Failed to download update.');
      });
  };

  useEffect(() => {
    if (Platform.OS === 'android' && Platform.Version > 30) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
        .then(res => {
          if (!!res && res === 'granted') {
            notificationListeners();
          } else {
            console.log('Permission not granted');
            setShowReminder(true);
            notificationListeners();
          }
        })
        .catch(error => {
          Alert.alert('Something went wrong while requesting permissions.');
        });
    } else {
      notificationListeners();
    }
  }, []);

  useEffect(() => {
    async function checkNotificationPermission() {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
      } else if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
        setShowReminder(true);
      }
    }

    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (officeCode) {
      return notifee.onForegroundEvent(async ({type, detail}) => {
        switch (type) {
          case EventType.DISMISSED:
            // console.log('User dismissed notification', detail.notification);
            if (detail.notification && detail.notification.android) {
              const groupId = detail.notification.android.groupId;
              const channelId = detail.notification.android.channelId;

              const notifications = await notifee.getDisplayedNotifications();
              // Cancel all notifications with the same groupId
              for (const notification of notifications) {
                if (notification.notification.android.channelId === channelId) {
                  await notifee.cancelNotification(notification.id);
                }
              }
            }

            break;

          case EventType.PRESS:
            // Log notification details for debugging
            //console.log('Pressed notification', detail.notification);

            // Access groupId from android object
            const groupId = detail.notification.android.groupId;
            const channelId = detail.notification.android.channelId;

            // Cancel all notifications with the same groupId
            if (groupId) {
              await AsyncStorage.removeItem(`groupMessages_${groupId}`);
              await AsyncStorage.setItem('notificationCount', '0');

              const notifications = await notifee.getDisplayedNotifications();
              for (const notification of notifications) {
                if (notification.notification.android.groupId === groupId) {
                  await notifee.cancelNotification(notification.id);
                }
              }
            }

            if (channelId === 'recentlyupdated') {
              console.log('Navigating to RecentUpdated');
              NavigationService.navigate('RecentUpdated');
              await fetch(`${baseUrl}/read?OfficeCode=${officeCode}`, {
                method: 'GET',
              });
            } else if (channelId === 'regulatorydelays') {
              console.log('Navigating to Summary');
              NavigationService.navigate('Summary');
            } else if (channelId === 'nonregulatorydelays') {
              console.log('Navigating to OfficeDelays');
              NavigationService.navigate('OfficeDelays');
            } else if (channelId === 'mypersonal') {
              console.log('Navigating to MyPersonal');
              NavigationService.navigate('MyTransactions');
            } else {
              console.log('Unknown channelId:', channelId);
            }
            break;
          default:
            break;
        }
      });
    }
  }, [officeCode]);

  // Bootstrap sequence function
  async function bootstrap() {
    const initialNotification = await notifee.getInitialNotification();

    // If initialNotification is falsy, return early
    if (!initialNotification) {
      return;
    }

    /*  console.log('Notification caused application to open');
    console.log(
      'Press action used to open the app',
      initialNotification.pressAction,
    );
    console.log("group",initialNotification.notification.android.groupId); */

    const groupId = initialNotification.notification.android.groupId;
    const channelId = initialNotification.notification.android.channelId;

    if (channelId === 'nonregulatorydelays') {
      // Delay navigation by 2 seconds
      setTimeout(() => {
        NavigationService.navigate('OfficeDelays');
      }, 2000);
    } else if (channelId === 'regulatorydelays') {
      // Delay navigation by 2 seconds
      setTimeout(() => {
        NavigationService.navigate('Summary');
      }, 2000);
    } else if (channelId === 'recentlyupdated') {
      // Delay navigation by 2 seconds
      setTimeout(() => {
        NavigationService.navigate('RecentUpdated');
      }, 2000);
    } else if (channelId === 'mypersonal') {
      // Delay navigation by 2 seconds
      setTimeout(() => {
        NavigationService.navigate('MyTransactions');
      }, 2000);
    } else {
      console.log('Unknown channelId:', channelId);
    }
  }

  useEffect(() => {
    bootstrap()
      .then(() => setLoading(false))
      .catch(console.error);
  }, []);

  return (
    <NavigationContainer ref={NavigationService.setTopLevelNavigator}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={'transparent'}
        translucent
      />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'vertical',
          ...TransitionPresets.SlideFromRightIOS,
          navigationBarColor: 'transparent',
          animationDuration: 500,
          presentation: 'transparentModal',
        }}>
        <Stack.Screen name="Home">
          {props => (
            <HomeScreen
              {...props}
              token={tokens}
              userData={userData}
              fullName={fullName}
              delaysRegOfficeData={delaysRegOfficeData}
              genInformationData={genInformationData}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Doctrack" component={DoctrackScreen} />
        <Stack.Screen name="Forum" component={ForumScreen} />
        <Stack.Screen
          name="NotificationsManager"
          component={NotificationManagerScreen}
        />
        <Stack.Screen name="MyTransactions" component={MyTransactionsScreen} />
        <Stack.Screen
          name="MyTransactionsDetails"
          component={MyTransactionDetails}
        />
        <Stack.Screen name="Empty" component={EmptyScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen name="OfficeDelays" component={OfficeDelaysScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="RecentUpdated" component={RecentUpdatedScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="StatusView" component={StatusView} />
        <Stack.Screen name="Others" component={OthersScreen} />

        <Stack.Screen
          name="ProjectCleansing"
          component={ProjectCleansingScreen}
        />
        <Stack.Screen
          name="ProjectCleansingDetails"
          component={ProjectCleansingDetails}
        />
        <Stack.Screen
          name="ProjectCleansingFullDetails"
          component={ProjectCleansingFullDetails}
        />
        <Stack.Screen name="WebView" component={WebViewScreen} />
        <Stack.Screen name="Camera" component={CameraComponent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  permissionReminder: {
    flex: 1,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  enableButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#d9534f', // Red color for close button
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
