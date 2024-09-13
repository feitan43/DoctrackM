import React, {useState, useEffect, useMemo} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {HStack, Banner, Button} from '@react-native-material/core';

import Icon from 'react-native-vector-icons/Ionicons';
import DoctrackScreen from './DoctrackScreen';
import ForumScreen from './ForumScreen';
import Notifications from './NotificationManagerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyTransactionsScreen from './MyTransactionsScreen';
import baseUrl from '../../config';
import CustomDrawerContent from './CustomDrawer';
import SummaryScreen from './SummaryScreen';
import SafeAreaLoader from '../../loader/SafeAreaLoader';
import SettingsScreen from './SettingsScreen';
import GSOScreen from './GSOScreen';
import SettingsAccordion from './SettingsAccordion';

import useOfficeDelays from '../api/useOfficeDelays';
import useDelaysRegOffice from '../api/useDelaysRegOffice';
import useMyTransactions from '../api/useMyTransactions';
import useUserInfo from '../api/useUserInfo';
import useRecentlyUpdated from '../api/useRecentlyUpdated';
import {useIsFocused} from '@react-navigation/native';
import {ListItem} from '@rneui/themed';
import {Image} from 'react-native-ui-lib';
import {BlurView} from '@react-native-community/blur';
import useTransactionSummary from '../api/useTransactionSummary';
import FastImage from 'react-native-fast-image';
import {BackHandler, ToastAndroid} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProjectCleansingScreen from './ProjectCleansingScreen';
import useOthers from '../api/useOthers';

const Drawer = createDrawerNavigator();

const HomeScreen = ({navigation}) => {
  const {officeDelaysData, officeDelaysLength, fetchOfficeDelays} =
    useOfficeDelays();
  const {
    regOfficeDelaysLength,
    delaysLoading,
    token,
    error,
    showErrorModal,
    setShowErrorModal,
    fetchDataRegOfficeDelays,
  } = useDelaysRegOffice();
  const {myTransactionsLength, fetchMyPersonal} = useMyTransactions();
  const {officeCode, fullName, employeeNumber, officeName, privilege} = useUserInfo();
  const {
    recentlyUpdatedData,
    recentlyUpdatedLength,
    updatedNowData,
    liveUpdatedNowData,
    updatedDateTime,
  } = useRecentlyUpdated();
  const [loading, setLoading] = useState();
  const [showReminder, setShowReminder] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const {
    dataPR,
    dataPO,
    dataPX,
    PRPercentage,
    POPercentage,
    PXPercentage,
    loadingTransSum,
    setDataPR,
    setPRPercentage,
    calculatePRPercentage,
    setDataPO,
    setPOPercentage,
    calculatePOPercentage,
    setDataPX,
    setPXPercentage,
    calculatePXPercentage,
    fetchTransactionSummary,
  } = useTransactionSummary(selectedYear);
  const {othersVouchersData, othersOthersData, loadingOthers, refetchDataOthers} = useOthers(selectedYear);
  const useBackButtonHandler = navigation => {
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Start fetching data concurrently
        await Promise.all([
          fetchOfficeDelays(),
          fetchDataRegOfficeDelays(),
          fetchMyPersonal(),
          fetchTransactionSummary(),
          refetchDataOthers
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // Once all data is fetched, set loading to false
        setLoading(false);
      }
    }

    fetchData();
  }, []);

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (navigation.isFocused()) {
            if (backPressedOnce) {
              BackHandler.exitApp();
            } else {
              setBackPressedOnce(true);
              ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

              setTimeout(() => {
                setBackPressedOnce(false);
              }, 2000);
            }
            return true;
          }
          return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () =>
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [backPressedOnce]),
    );
  };
  useBackButtonHandler(navigation);

  useEffect(() => {
    async function checkNotificationPermission() {
      const settings = await notifee.getNotificationSettings();
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        setShowReminder(true);
      }
    }

    checkNotificationPermission();
  }, []);

  const handleNotification = async () => {
    await notifee.openNotificationSettings();
    setShowReminder(false);
  };

  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking token:', error);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const handleNotifications = async () => {
    if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  const handleForum = async () => {
    if (navigation) {
      navigation.navigate('Forum');
    }
  };

  const MyTransactionsScreenComponent = () => {
    return <MyTransactionsScreen />;
  };

  const DoctrackScreenComponent = ({}) => {
    return (
      <DoctrackScreen
        navigation={navigation}
        officeDelaysLength={officeDelaysLength}
        officeDelaysData={officeDelaysData}
        myTransactionsLength={myTransactionsLength}
        regOfficeDelaysLength={regOfficeDelaysLength}
        recentlyUpdatedLength={recentlyUpdatedLength}
        recentlyUpdatedData={recentlyUpdatedData}
        updatedNowData={updatedNowData}
        officeCode={officeCode}
        officeName={officeName}
        privilege={privilege}
        liveUpdatedNowData={liveUpdatedNowData}
        updatedDateTime={updatedDateTime}
        dataPR={dataPR}
        dataPO={dataPO}
        dataPX={dataPX}
        PRPercentage={PRPercentage}
        POPercentage={POPercentage}
        PXPercentage={PXPercentage}
        loadingTransSum={loadingTransSum}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        fetchDataRegOfficeDelays={fetchDataRegOfficeDelays}
        fetchOfficeDelays={fetchOfficeDelays}
        fetchMyPersonal={fetchMyPersonal}
        fetchTransactionSummary={fetchTransactionSummary}
        othersVouchersData={othersVouchersData}
        othersOthersData={othersOthersData}
        loadingOthers={loadingOthers}
        refetchDataOthers={refetchDataOthers}
        setDataPR = {setDataPR}
        setPRPercentage = {setPRPercentage}
        calculatePRPercentage = {calculatePRPercentage}
        setDataPO = {setDataPO}
        setPOPercentage = {setPOPercentage}
        calculatePOPercentage = {calculatePOPercentage}
        setDataPX = {setDataPX}
        setPXPercentage = {setPXPercentage}
        calculatePXPercentage = {calculatePXPercentage}
      />
    );
  };

  const ProjectCleansingComponent = ({navigation}) => {
    return <ProjectCleansingScreen />;
  };

  const NotificationScreenComponent = ({navigation}) => {
    return <Notifications />;
  };

  const SettingsScreenComponent = ({navigation}) => {
    return <SettingsScreen />;
  };

  const SummaryScreenComponent = ({}) => {
    return <SummaryScreen />;
  };

  const ForumScreenComponent = ({navigation}) => {
    return <ForumScreen />;
  };
  const GSOScreenComponent = ({navigation}) => {
    return <GSOScreen />;
  };

  <View>
    {/* Your component content */}
    <Modal visible={showErrorModal} animationType="slide" transparent={true}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{backgroundColor: 'white', padding: 20, borderRadius: 10}}>
          <Text>Network Request Failed</Text>
          <TouchableOpacity
            title="Close"
            onPress={() => setShowErrorModal(false)}
          />
        </View>
      </View>
    </Modal>
  </View>;

  const CustomHeader = ({title, navigation}) => {
    if (title === 'Settings' || title === 'GSO') {
      return null;
    }
    return (
      <>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginTop: 10,
              height: 100,
              width: '100%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {/* <Image
              source={require('../../assets/images/doctracklogo.png')}
              style={{
                width: 38,
                height: 48,
                marginRight: 5, // Add some space between the image and text
              }}
            /> */}
              <View style={{gap: -6}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-ExtraLight',
                    fontSize: 14,
                    color: 'silver',
                  }}>
                  Maayong Adlaw!
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Medium',
                    fontSize: 16,
                  }}>
                  {fullName}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    opacity: 0.6,
                    letterSpacing: 1,
                  }}>
                  {officeName}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {/* Notification Icon */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* <TouchableOpacity onPress={handleForum} style={{marginEnd: 10}}>
                  <Icon
                    name="chatbox-ellipses-outline"
                    size={25}
                    color="white"
                  />
                </TouchableOpacity> */}
                {/*  <View
              style={{
                position: 'absolute',
                top: -5,
                right: -2,
                backgroundColor: 'red',
                borderRadius: 10,
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 12}}>0</Text>
            </View> */}
              </View>

              {/* Drawer Icon */}
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => navigation.openDrawer()}>
                <Icon name="menu" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Text below the header */}
        </View>
      </>
    );
  };

  if (loading) {
    return <SafeAreaLoader />;
  }


  return (
    <SafeAreaLoader>
      {insets => (
          <View style={[styles.container]}>
            {/*   <StatusBar
              barStyle="light-content"
              backgroundColor={'transparent'}
              translucent
            /> */}
            <View style={{backgroundColor: 'red'}}>
              {showReminder && Platform.Version < 30 && (
                <Banner
                  style={styles.bannerContainer}
                  text="You haven't enabled notifications. Enable them for timely updates."
                  buttons={
                    <HStack spacing={2}>
                      <Button
                        key="fix-it"
                        variant="contained"
                        title="Enable Notifications"
                        onPress={() => handleNotification()}
                        titleStyle={{fontSize: 12}}
                        style={{backgroundColor: '#1a508c'}}
                      />
                      <Button
                        key="learn-more"
                        variant="text"
                        onPress={() => setShowReminder(false)}
                        title="Dismiss"
                        titleStyle={{fontSize: 12, color: '#1a508c'}}
                      />
                    </HStack>
                  }
                />
              )}
            </View>

            <Drawer.Navigator
              initialRouteName="Home"
              drawerContent={props => <CustomDrawerContent {...props} />}
              screenOptions={{
                drawerActiveBackgroundColor: 'rgba(53, 108, 200, 1)',
                //drawerHideStatusBarOnOpen: false,
                //drawerHideStatusBarOnOpen: 'true',
                drawerStatusBarAnimation: 'fade',
                drawerInactiveTintColor:'black',
                drawerActiveTintColor: 'white', // Color for active item
                drawerType: 'front',
                drawerStyle: styles.drawer,
                header: ({navigation, route}) => (
                  <CustomHeader title={route.name} navigation={navigation} />
                ),
                detachPreviousScreen: true,
              }}>
              <Drawer.Screen
                name="Doctrack"
                component={DoctrackScreenComponent}
                options={({color}) => ({
                  drawerIcon: ({color,focused}) => (
                    <Icon
                      name="home-outline"
                      color={focused ? 'white' : '#252525'}
                      size={24}
                    />
                  ),
                  drawerLabel: ({focused}) => (
                    <Text
                      style={{
                        color: focused ? 'white' : '#252525', // Change color based on focus
                        fontSize: 14,
                        fontFamily: 'Oswald-Regular',
                      }}>
                      Home
                    </Text>
                  ),
                  unmountOnBlur: true,
                })}
              />
              {/* <Drawer.Screen
                name="Project Cleansing"
                component={ProjectCleansingComponent}
                options={({color, focused}) => ({
                  drawerIcon: ({color}) => (
                    <Image
                      source={require('../../assets/images/brooms.png')}
                      style={{
                        width: 26,
                        height: 30,
                        tintColor: focused ? 'white' : '#252525', // Change color based on focus
                      }}
                    />
                  ),
                  drawerLabel: ({focused}) => (
                    <Text
                      style={{
                        color: focused ? 'white' : '#252525', // Change color based on focus
                        fontSize: 14,
                        fontFamily: 'Oswald-Regular',
                      }}>
                      Project Cleansing
                    </Text>
                  ),
                  unmountOnBlur: true,
                })}
              /> */}

              {employeeNumber === '391091' && (
                <Drawer.Screen
                  name="GSO"
                  component={GSOScreenComponent}
                  options={{
                    drawerIcon: ({color}) => (
                      <Icon name="cog-outline" color={color} size={24} />
                    ),
                    drawerLabel: () => (
                      <Text
                        style={{
                          color: '#252525',
                          fontSize: 14,
                          //lineHeight: 15,
                          fontFamily: 'Oswald-Regular',
                        }}>
                        GSO
                      </Text>
                    ),
                    unmountOnBlur: true,
                  }}
                />
              )}
              {employeeNumber === '391091' && (
                <Drawer.Screen
                  name="NotificationsManager"
                  component={NotificationScreenComponent}
                  options={{
                    drawerIcon: ({color}) => (
                      <Icon
                        name="notifications-sharp"
                        color={color}
                        size={24}
                      />
                    ),
                    drawerLabel: () => (
                      <Text
                        style={{
                          color: '#252525',
                          fontSize: 14,
                          //lineHeight: 15,
                          fontFamily: 'Oswald-Regular',
                        }}>
                        Notifications
                      </Text>
                    ),
                    unmountOnBlur: true,
                  }}
                />
              )}

              {/* <Drawer.Screen
        name="Settings"
        component={SettingsAccordion}
        options={{
          drawerLabel: () => (
            <Text
              style={{
                color: 'white',
                letterSpacing: 1,
                fontSize: 14,
                fontFamily: 'Oswald-Regular',
                marginStart: 20,
              }}>
              Settings
            </Text>
          ),
          unmountOnBlur: true,
        }}
      /> */}
            </Drawer.Navigator>
          </View>
      )}
    </SafeAreaLoader>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backg: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerContainer: {
    backgroundColor: 'white', 
  },
  drawer: {
    //backgroundColor: 'rgba(255, 255, 255, 0.8 )', // Semi-transparent background
    //borderRightColor: '#fff',
    width: '60%',
    //backdropFilter: 'blur(10px)', // Blur effect (requires proper CSS support)
    shadowColor: 'red',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 2},
    //elevation: 5,
  },
});

export default HomeScreen;
