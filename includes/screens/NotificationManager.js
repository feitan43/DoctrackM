import { NativeModules } from 'react-native';

const { NotificationManagerModule } = NativeModules;

const NotificationManager = {
  setNotificationsEnabled: (enabled) => {
    NotificationManagerModule.setNotificationsEnabled(enabled);
  }
};

export default NotificationManager;
