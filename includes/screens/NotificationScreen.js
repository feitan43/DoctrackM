import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserInfo from '../api/useUserInfo';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationScreen = ({navigation}) => {
  const {employeeNumber, fullName, officeName, officeCode, accountType} =
    useUserInfo();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isBatteryOptimizationDisabled, setIsBatteryOptimizationDisabled] =
    useState(true);

  const toggleNotifications = async () => {
    if (!isNotificationsEnabled) {
      const settings = await notifee.getNotificationSettings();
      if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        await notifee.openNotificationSettings();
        setIsNotificationsEnabled(true);
      }
    } else {
      Alert.alert(
        'Disable Notifications',
        'Are you sure you want to disable notifications?',
        [
          {
            text: 'Yes',
            onPress: async () => {
              await notifee.openNotificationSettings();
              setIsNotificationsEnabled(false); // Disable notifications in state
              /*  Alert.alert(
                'Notifications Disabled',
                'You will no longer receive notifications.',
              ); */
            },
          },
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    }
  };

  const toggleBatteryOptimization = async () => {
    try {
      const isBatteryOptimizationEnabled =
        await notifee.isBatteryOptimizationEnabled();
      if (isBatteryOptimizationEnabled) {
        // Open battery optimization settings
        await notifee.openBatteryOptimizationSettings();
        Alert.alert(
          'Battery Optimization Settings',
          'Please disable battery optimization for real-time notifications.',
        );
      } else {
        setIsBatteryOptimizationDisabled(true);
        Alert.alert(
          'Battery Optimization',
          'Battery optimization is already disabled.',
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  async function checkNotificationPermission() {
    const settings = await notifee.getNotificationSettings();
    setIsNotificationsEnabled(
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED,
    );
  }

  async function checkBatteryOptimization() {
    const isBatteryOptimizationEnabled =
      await notifee.isBatteryOptimizationEnabled();

    if (isBatteryOptimizationEnabled) {
      //console.log("Battery optimization is enabled.");
      setIsBatteryOptimizationDisabled(false);
    } else {
      //console.log("Battery optimization is disabled.");
      setIsBatteryOptimizationDisabled(true);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      checkNotificationPermission();
      checkBatteryOptimization();
    }, []),
  );

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        
      </View>
   
      {/* Enable Notifications Section */}
      <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
        <Icon
          name="notifications-outline"
          size={40}
          color="#333333"
          padding={5}
        />
        <View style={{paddingStart: 10}}>
          <Text style={{fontFamily: 'Oswald-Medium', fontSize: 16}}>
            Enable Notifications
          </Text>

          <Text
            style={{fontSize: 12, fontFamily: 'Oswald-Light', color: 'gray'}}>
            to receive daily updates to your documents
          </Text>
        </View>
      </View>
      <View style={{paddingEnd: 20}}>
        <Switch
          style={{padding: 10}}
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
      <View
        style={{
          height: 5,
          marginTop: 10,
          backgroundColor: 'rgba(174, 171, 171, 0.2)',
        }}
      />

      {/* Disable Battery Optimization Section */}
      <View
        style={{flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20}}>
        <Icon
          name="battery-half-outline"
          size={40}
          color="#333333"
          padding={5}
        />
        <View style={{paddingStart: 10}}>
          <View style={{flexDirection: 'column', rowGap: -10}}>
            <Text
              style={{fontFamily: 'Oswald-Medium', color: 'red', fontSize: 16}}>
              Disable
            </Text>
            <Text style={{fontFamily: 'Oswald-Medium', fontSize: 16}}>
              Battery Optimization
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Oswald-Light',
              color: 'gray',
              width: '60%',
            }}>
            to receive real-time notifications and receive daily updates to your
            documents
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
          alignItems: 'center',
          paddingEnd: 20,
        }}>
        <Text
          style={{
            fontFamily: 'Oswald-Light',
            backgroundColor: isBatteryOptimizationDisabled
              ? 'green'
              : 'rgba(240, 98, 97, 1)',
            color: 'white',
            paddingHorizontal: 10,
            borderRadius: 5,
          }}>
          {isBatteryOptimizationDisabled ? 'Disabled' : 'Not yet Disabled'}
        </Text>

        <Switch
          style={{padding: 10}}
          value={isBatteryOptimizationDisabled}
          onValueChange={toggleBatteryOptimization}
        />
      </View>
     {/*  <View style={{paddingHorizontal: 20}}>
        <Text>How to?</Text>
        <Text>
          Step 1
        </Text>
        <Text>
          Click All apps <Text>Find DocMobile</Text>
        </Text>
        <Text>
          Step 2
        </Text>
        <Text>Click Don't optimize</Text>
        <Text>
          Then you're all done!
        </Text>
      </View> */}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    paddingStart: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#252525',
    fontFamily: 'Inter_28pt-Bold',
 },
});

export default NotificationScreen;
