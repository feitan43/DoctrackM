import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { ListItem, Icon } from '@rneui/themed';

const SettingsAccordion = () => {
  const [expanded, setExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [realtimeUpdatesEnabled, setRealtimeUpdatesEnabled] = useState(false);
  const [delayChannelEnabled, setDelayChannelEnabled] = useState(false);

  return (
    <View>
      <ListItem.Accordion
        content={
          <>
            <Icon name="settings" type="material" />
            <ListItem.Content>
              <ListItem.Title>Settings</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => setExpanded(!expanded)}
      >
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>All Notification</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </ListItem>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Realtime Update Channel</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={realtimeUpdatesEnabled}
            onValueChange={setRealtimeUpdatesEnabled}
          />
        </ListItem>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Delay Channel</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={delayChannelEnabled}
            onValueChange={setDelayChannelEnabled}
          />
        </ListItem>
      </ListItem.Accordion>
    </View>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    color: 'white',
    letterSpacing: 1,
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    marginStart: 20
  }
});

export default SettingsAccordion;
