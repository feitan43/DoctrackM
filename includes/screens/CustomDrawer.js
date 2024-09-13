import React, {useState, useEffect} from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from '../api/useUserInfo';
import baseUrl from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import RadialGradient from 'react-native-radial-gradient';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import {ListItem} from '@rneui/themed';
import {color} from '@rneui/base';
import {ScrollView} from 'react-native-gesture-handler';
import notifee, {AuthorizationStatus} from '@notifee/react-native';

const CustomDrawerItem = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 10 }}>
      {isActive ? (
        <LinearGradient
          colors={['#ff7e5f', '#feb47b']}
          style={styles.linearGradient}>
          <Text style={styles.activeItemText}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.inactiveItem}>
          <Text style={styles.inactiveItemText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};



const CustomDrawer = props => {
  const {fullName, officeName, employeeNumber} = useUserInfo();
  const [userId, setUserId] = useState();
  const {navigation} = props;
  const version = DeviceInfo.getVersion();

  const [expanded, setExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [realtimeUpdatesEnabled, setRealtimeUpdatesEnabled] = useState(false);
  const [delayChannelEnabled, setDelayChannelEnabled] = useState(false);

  const logout = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({EmployeeNumber: employeeNumber}),
      };

      // Log the request options
      //console.log('Request Options:', requestOptions);

      const response = await fetch(`${baseUrl}/logoutApi`, requestOptions);

      // Log the response status
      //console.log('Response Status:', response.status);

      if (!response.ok) {
        throw new Error(
          `Logout request failed with status: ${response.status}`,
        );
      }

      // Log success message if response is successful
      console.log('Logged out successfully');

      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error while logging out:', error);
    }
  };

  const handleNotification = async () => {
    await notifee.openNotificationSettings();
  };

  useEffect(() => {
    async function checkNotificationPermission() {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permissions have been authorized');
      } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        console.log('Notification permissions have been denied');
      }
    }

    checkNotificationPermission();
  }, []);

  const handleNotificationToggle = async value => {
    setNotificationsEnabled(value);

    if (value) {
      console.log('Notifications enabled');
      setNotificationsEnabled(true);
    } else {
      console.log('Notifications disabled');
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        marginBottom: 40
      }}>
      <View style={{height: '100%'}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{marginStart: 20}}>
            <Image
              source={require('../../assets/images/doctracklogo.png')}
              style={{
                height: 49,
                width: 39,
                shadowRadius: 10,
                shadowColor: 'rgba(97, 93, 93, 0.9)',
                shadowOffset: {width: 4, height: 4},
              }}
            />
          </View>

          <View style={{rowGap: -10, marginStart: 3}}>
            <Text
              style={{
                color: 'rgba(2, 58, 146, 1)',
                fontFamily: 'Prompt-Bold',
                fontSize: 24,
              }}>
              DocMobile
            </Text>
            <Text
              style={{
                fontFamily: 'Prompt-Light',
                fontSize: 13,
                color: 'rgba(2, 58, 146, 1)',
              }}>
              Project Doctrack
            </Text>
          </View>
        </View>

        {/*     
            <View
              style={{
                marginBottom: 10,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <ImageBackground
                source={require('../../assets/images/davao.png')}
                style={{
                  height: 180,
                  width: 180,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                imageStyle={{opacity: 0.02}} // Set opacity on the background image
              >
                <Image
                  source={require('../../assets/images/doctracklogo.png')}
                  style={{
                    height: 120,
                    width: 95,
                    marginTop: 25,
                    shadowRadius: 10,
                    shadowColor: 'rgba(97, 93, 93, 0.9)',
                    shadowOffset: {width: 4, height: 4},
                  }}
                />
              </ImageBackground>

              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'Oswald-Regular',
                }}>
                {fullName}
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255, 0.02)',
                  width: '90%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 5,
                }}>
                <Text
                  style={{
                    color: '#FFB800',
                    fontSize: 12,
                    fontFamily: 'Oswald-Regular',
                  }}>
                  {officeName}
                </Text>
               

                <Text style={{fontFamily: 'TTNormsPro-Black', blac}}>
                  DocMobile
                </Text>
              </View>
            </View> */}

        <ScrollView style={{flex: 1, marginBottom: 20, marginTop: 20}}>
          <DrawerItemList {...props} />
         
        </ScrollView>

        <View style={{marginTop: 'auto', marginBottom: 5}}>

        <View>
            <ListItem.Accordion
              icon={() => (
                <Icon
                  name="chevron-down-sharp"
                  type="ionicons"
                  size={20}
                  color={'white'}
                />
              )}
              content={
                <>
                  <Icon
                    name="settings"
                    type="material"
                    size={20}
                    color={expanded ? 'rgba(55, 118, 219, 1)' : 'silver'}
                  />
                  <ListItem.Content>
                    <ListItem.Title
                      style={{
                        color: '#252525',
                        paddingStart: 10,
                        fontFamily: 'Oswald-Regular',
                        fontSize: 14,
                      }}>
                      Settings
                    </ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={expanded}
              onPress={() => setExpanded(!expanded)}
              containerStyle={{
                backgroundColor: expanded
                  ? 'rgba(0, 15, 39, 0.3)'
                  : 'transparent',
              }}>
              <ListItem
                containerStyle={{
                  backgroundColor: 'transparent',
                  paddingVertical: 5,
                }}>
                <TouchableOpacity
                  onPress={handleNotification}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <ListItem.Content>
                    <ListItem.Title
                      style={{
                        color: '#252525',
                        fontSize: 14,
                        fontFamily: 'Oswald-Light',
                        paddingStart: 30,
                      }}>
                      Notification Settings
                    </ListItem.Title>
                  </ListItem.Content>
                  <Icon
                    name="chevron-forward-outline"
                    size={22}
                    color="#585858"
                    style={{alignSelf: 'flex-end'}}
                  />
                </TouchableOpacity>

                {/*    <Switch
                      value={notificationsEnabled}
                      onValueChange={handleNotification}
                    /> */}
              </ListItem>
              {/*   <ListItem
                    containerStyle={{
                      backgroundColor: 'transparent',
                      paddingVertical: 5,
                    }}>
                    <ListItem.Content>
                      <ListItem.Title
                        style={{
                          color: 'white',
                          fontSize: 14,
                          fontFamily: 'Oswald-Light',
                          paddingStart: 30,
                        }}>
                        Update Today Channel
                      </ListItem.Title>
                    </ListItem.Content>
                    <Switch
                      value={realtimeUpdatesEnabled}
                      onValueChange={setRealtimeUpdatesEnabled}
                    />
                  </ListItem> */}
              {/*   <ListItem
                    containerStyle={{
                      backgroundColor: 'transparent',
                      paddingVertical: 5,
                    }}>
                    <ListItem.Content>
                      <ListItem.Title
                        style={{
                          color: 'white',
                          fontSize: 14,
                          fontFamily: 'Oswald-Light',
                          paddingStart: 30,
                        }}>
                        Delay Channel
                      </ListItem.Title>
                    </ListItem.Content>
                    <Switch
                      value={delayChannelEnabled}
                      onValueChange={setDelayChannelEnabled}
                    />
                  </ListItem> */}
            </ListItem.Accordion>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '80%',
              paddingVertical: 8,
              height: 'auto',
              alignSelf: 'center',
              backgroundColor: 'white',
              borderRadius: 2,
            }}
            onPress={logout}>
            <Icon
              name="log-out-outline"
              size={22}
              color="#585858"
              style={{paddingRight: 5}}
            />

            <Text
              style={{
                alignSelf: 'center',
                color: '#585858',
                fontFamily: 'Oswald-Regular',
              }}>
              LOGOUT
            </Text>
            {/* <Icon name="power-sharp" color="red" size={20} /> */}
          </TouchableOpacity>
        </View>

        <View style={{alignItems: 'center'}}>
          <Text
            style={{
              color: '#ccc',
              fontFamily: 'Oswald-Regular',
              fontSize: 10,
              marginBottom: 10,
            }}>
            {version}
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
});

export default CustomDrawer;
