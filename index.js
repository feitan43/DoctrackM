import {Alert, AppRegistry, Platform} from 'react-native';
import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType, AndroidImportance} from '@notifee/react-native';
import {name as appName} from './app.json';
import App from './App';
import {displayNotification} from './includes/notification/notificationServices';
import NavigationService from './includes/navigation/navigationServices';
import {Route} from './includes/navigation/Route';
import {officeCode} from './includes/api/useUserInfo'
import baseUrl from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  decode  from 'base-64';

// Setting up global atob
global.atob = decode;


const TokenManager = () => {
  const [storedToken, setStoredToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null); // State to store decoded token

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setStoredToken(token);

          // Decode the token
          const decoded = decodeToken(token);
          setDecodedToken(decoded);
          //console.log('Decoded Token:', decoded);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  const decodeToken = token => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (err) {
      console.log('Error decoding token:', err);
      return null;
    }
  };
 // console.log('Stored Token:', decodedToken);

}




messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background index!', remoteMessage);

  if (remoteMessage.data && remoteMessage.data.notifee) {
    await displayNotification(remoteMessage);
  }
});

/* console.log(baseUrl);
console.log(officeCode); */
notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;

/*   if (type === EventType.PRESS && Platform.OS === 'android' && Platform.Version >= 13) {
    NavigationService.navigate('Summary');
  } */

    if (type === EventType.ACTION_PRESS && pressAction.id === 'read') {
      if (detail.notification && detail.notification.android) {
        const office = detail.notification.android.officeCode;
    
        console.log('Notification pressed MARK READ!');
    
        try {
          const response = await fetch(`${baseUrl}/read?OfficeCode=${office}`, {
            method: 'GET',
          });
          
          console.log(response);
          if (!response.ok) {
            throw new Error(`Fetch failed with status: ${response.status}`);
          }
    
          const notifications = await notifee.getDisplayedNotifications();
          for (const notification of notifications) {
            if (notification.notification.android.groupId === groupId) {
              await notifee.cancelNotification(notification.id);
            }
          }
        } catch (error) {
          console.error('Error handling notification press:', error);
        }
      }
    }
  
  if (type === EventType.DISMISSED) {
    // console.log('User dismissed notification', detail.notification);
 
     if (detail.notification && detail.notification.android) {
       const groupId = detail.notification.android.groupId;
       if (groupId) {
         await AsyncStorage.removeItem(`groupMessages_${groupId}`);
       }
 
       // Reset the notification count to zero
       await AsyncStorage.setItem('notificationCount', '0');
 
       const notifications = await notifee.getDisplayedNotifications();
       // Cancel all notifications with the same groupId
       for (const notification of notifications) {
         if (notification.notification.android.groupId === groupId) {
           await notifee.cancelNotification(notification.id);
         }
       }
     }
   }
 
   return null;
});

const HeadlessCheck = ({isHeadless}) => {
  if (isHeadless) {
    return null;
  }
  return <App/>;
};

// Headless task to handle background messages
AppRegistry.registerHeadlessTask(
  'RNFirebaseBackgroundMessage',
  () =>
    async ({data, messageId}) => {
      try {
        console.log(
          'Headless message received from index:',
          JSON.stringify(data),
        );
      } catch (error) {
        console.error('Error handling headless message:', error);
      }
    },
);

AppRegistry.registerComponent(appName, () => {

NavigationService.setTopLevelNavigator(HeadlessCheck);
return () => (
  <>
    <TokenManager />
    <HeadlessCheck />
  </>
);

});

