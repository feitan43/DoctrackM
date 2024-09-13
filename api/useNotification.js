import notifee, { AndroidImportance } from '@notifee/react-native';

export const useNotification = () => {

  async function displayNotification(title, body) {
    const channelId = await notifee.createChannel({
      id: 'Delays',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    await notifee.requestPermission();

    const notificationId = notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId,
      },
    });
    return notificationId;
  }


  async function cancelAllNotifications() {
    await notifee.cancelAllNotifications();
  }

  async function cancelNotification(notificationId, tag = undefined) {
    await notifee.cancelNotification(notificationId, tag);
  }

  return {
    displayNotification,
    cancelAllNotifications,
    cancelNotification,
  };
};
