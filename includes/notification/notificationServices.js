import messaging from '@react-native-firebase/messaging';
import {  Platform, Alert } from 'react-native';
import NavigationService from '../navigation/navigationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AuthorizationStatus,AndroidStyle , AndroidImportance, AndroidColor, AndroidBadgeIconType, AndroidGroupAlertBehavior, AndroidVisibility  } from '@notifee/react-native';


export async function checkNotificationPermission() {
  const settings = await notifee.getNotificationSettings();
  if (settings.authorizationStatus === 'AUTHORIZED') {
  } else if (settings.authorizationStatus === 'DENIED') {
  }
}

export async function checkApplicationPermission() {
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus) {
    //console.log('User has notification permissions enabled');
  } else {
    //console.log('User has notification permissions disabled');
  }

  console.log('iOS settings: ', settings.ios);
}

export const requestUserPermission = async () => {
  const settings = await notifee.requestPermission({
    alert: true,
    badge: true,
    sound: true,
    announcement: true,
    inAppNotificationSettings: false,
    provisional: true,
    // ... other permission settings
  });
  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    console.log('Permission settings:', settings);
  } else {
    console.log('User declined permissions');
  }
}


export async function checkChannelPermission() {
  try {
    const channel = await notifee.getChannel('Regulatory');
    if (channel.blocked) {
      console.log('Channel is disabled');
    } else {
      console.log('Channel is enabled');
    }
  } catch (error) {
    console.error('Error in checkChannelPermission:', error);
    throw error;
  }
}






export async function getExistingSettings() {
  const settings = await notifee.getNotificationSettings();

  if (settings) {
    console.log('Current permission settings: ', settings);
  }
}



const getFcmToken = async () => {

    try {
        const token = await messaging().getToken()
        //console.log("fcm token:", token)
    } catch (error) {
        console.log("error in creating token")
    }

}



export const checkBatteryOptimization = async () => {
  try {
    const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();

    if (batteryOptimizationEnabled) {
      Alert.alert(
        'Restrictions Detected',
        'To ensure notifications are delivered, please disable battery optimization for the app.',
        [
          {
            text: 'OK, open settings',
            onPress: async () => {
              await notifee.openBatteryOptimizationSettings();
            },
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.error('Error checking battery optimization:', error);
  }
};


  /*   async function createNotificationChannel(remoteMessage) {
    
    } */
    
    export const displayNotification = async (remoteMessage) => {
      const notifeeData = JSON.parse(remoteMessage.data.notifee);
      console.log(remoteMessage);
    
      // Create the notification channel
      await notifee.createChannel({
        id: notifeeData.data.channelId,
        name: notifeeData.data.channelId,
        sound: 'default',  
        lights: true,
        lightColor: AndroidColor.BLUE,
        importance: AndroidImportance.HIGH,
      });
    
      try {
        const notification = {
          title: notifeeData.notification.title,
          body: notifeeData.notification.body,
          android: {
            channelId: notifeeData.data.channelId || 'default',  
            badgeIconType: AndroidBadgeIconType.LARGE,
            smallIcon: 'ic_launcher_round',
            showTimestamp: true,
            sound: 'default',
            lights: [AndroidColor.BLUE, 300, 600],
            pressAction: {
              id: 'default',
              launchActivity: 'default',
          },
            style: {
              type: AndroidStyle.INBOX,
              lines: [notifeeData.notification.body],
              title: notifeeData.notification.title,
            },
          },
        };
    
        // Display the notification
        await notifee.displayNotification(notification);
      } catch (error) {
        console.error('Failed to display notification:', error);
      }
    };
     /*  export const displayNotification = async (remoteMessage) => {
        try {
            const notifeeData = JSON.parse(remoteMessage.data.notifee);
    
            let groupId;
            let channel;
    
            if (notifeeData.groupId && notifeeData.data.channelId) {
                groupId = notifeeData.groupId;
                channel = notifeeData.data.channelId;
                //console.log("gI", groupId);
                //console.log("CI", channel);
            }
    
            const channelId = await notifee.createChannel({
                id: channel,
                name: channel,
                badge: true,
                lights: true,
                lightColor: AndroidColor.BLUE,
                importance: AndroidImportance.HIGH,
            });
    
            const timestamp = notifeeData.timestamp || Date.now();
    
            // Get the current notification count
            let notificationCount = await AsyncStorage.getItem('notificationCount');
            notificationCount = notificationCount ? parseInt(notificationCount) : 0;
            notificationCount += 1;
    
            // Save the updated notification count
            await AsyncStorage.setItem('notificationCount', notificationCount.toString());
    
            // Retrieve current messages for the group
            let groupMessages = await AsyncStorage.getItem(`groupMessages_${groupId}`);
            groupMessages = groupMessages ? JSON.parse(groupMessages) : [];
    
            // Add the new message to the group messages
            groupMessages.push(notifeeData.notification.body);
    
            // Save the updated group messages
            await AsyncStorage.setItem(`groupMessages_${groupId}`, JSON.stringify(groupMessages));
    

            groupMessages.reverse();

            
            if (Platform.OS === 'android') {

              if (Platform.Version > 30) { // Android 11 (API level 30) and above
                  notificationId = await notifee.displayNotification({
                      title: notifeeData.notification.title,
                      body: notifeeData.notification.body,
                      android: {
                          lights: [AndroidColor.BLUE, 300, 600],
                          smallIcon: 'ic_launcher_round',
                          badgeIconType: AndroidBadgeIconType.LARGE,
                          badgeCount: notificationCount, 
                          sound: 'default',
                          channelId: channelId,
                          pressAction: {
                              id: 'default',
                              launchActivity: 'default',
                          },
                          timestamp: timestamp,
                          showTimestamp: true,
                          groupSummary: true,
                          groupId: groupId,
                          style: {
                              type: AndroidStyle.INBOX,
                              lines: groupMessages, // Use the current list of messages for the group
                          },
                      },
                  });
              } else { // Android 10 (API level 29) and below
                  notificationId = await notifee.displayNotification({
                      id: groupId,
                      title: channelId,
                      body: notifeeData.notification.body,
                      android: {
                          channelId: channelId,
                          groupSummary: true,
                          groupId: groupId,
                          badgeIconType: AndroidBadgeIconType.LARGE,
                          smallIcon: 'ic_launcher_round',
                          badgeCount: notificationCount,
                          showTimestamp: true,
                          style: {
                              type: AndroidStyle.INBOX,
                              lines: [`${notifeeData.notification.body}`],
                              title: notifeeData.notification.title,
                          },
                      },
                  });
              }
          }
          
          return notificationId;
      } catch (error) {
          console.error('Error in displayNotification:', error);
          throw error;
      }
  } */
      
      
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background app!');

    if (remoteMessage.data && remoteMessage.data.notifee) {
        await displayNotification(remoteMessage);
    } else {
        console.log('Not navigating. Missing or invalid notifee data.');
    }
});


export async function notificationListeners() {
  const onMessageUnsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('A new FCM message arrived! FOREGROUND!!');
   displayNotification(remoteMessage);
  });

  const onNotificationOpenedAppUnsubscribe = messaging().onNotificationOpenedApp(
    async (remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);

    }
  );

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    console.log('Notification caused app to open from quit state:', initialNotification.notification);

    console.log('Initial notification pressed:', initialNotification);
    
  }

  return () => {
    onMessageUnsubscribe();
    onNotificationOpenedAppUnsubscribe();
  };
}

  
  