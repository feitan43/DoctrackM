import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import NotificationManager from './NotificationManager';

const NotificationToggle = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleNotifications = (value) => {
    setNotificationsEnabled(value);
    NotificationManager.setNotificationsEnabled(value);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'center', paddingTop: 100}}>
      <Text>Enable Notifications</Text>
      <Switch
        value={notificationsEnabled}
        onValueChange={toggleNotifications}
      />
    </View>
  );
};

export default NotificationToggle;
