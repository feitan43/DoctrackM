import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import BASE_URL from '../../config';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Text,
  StatusBar,
  Image,
  ImageBackground,
  FlatList,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {HStack, Banner} from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import DoctrackScreen from './DoctrackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeAreaLoader from '../../loader/SafeAreaLoader';
import SettingsScreen from './SettingsScreen';
import {
  TabView,
  SceneMap,
  TabBar,
  TransitionPager,
} from 'react-native-tab-view';
import useOfficeDelays from '../api/useOfficeDelays';
import useDelaysRegOffice from '../api/useDelaysRegOffice';
import useMyTransactions from '../api/useMyTransactions';
import useUserInfo from '../api/useUserInfo';
import useRecentlyUpdated from '../api/useRecentlyUpdated';
import useOthers from '../api/useOthers';
import {useBackButtonHandler} from '../utils/useBackButtonHandler';
import useTransactionSummary from '../api/useTransactionSummary';
import SearchScreen from './SearchScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import useReceiving from '../api/useReceiving';
import useTrackingSummary from '../api/useTrackingSummary';
import useRegTrackingSummary from '../api/useRegTrackingSummary';
import useMyAccountability from '../api/useMyAccountabilty';
import useRequestInspection from '../api/useRequestInspection';
import useOnSchedule from '../api/useOnSchedule';
import useRecentActivity from '../api/useRecentActivity';
import {useEvaluationByStatus} from '../hooks/useEvaluationByStatus';
import {
  Menu,
  Divider,
  Provider as PaperProvider,
  Button,
} from 'react-native-paper';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {useEvaluatorSummary} from '../hooks/useEvaluatorSummary';
import {
  useInspection,
  useInspectionRecentActivity,
} from '../hooks/useInspection';

const Drawer = createDrawerNavigator();

const Tab = createBottomTabNavigator();
const currentYear = new Date().getFullYear();

const HomeScreen = ({navigation}) => {
  const {officeDelaysData, officeDelaysLength, fetchOfficeDelays} =
    useOfficeDelays();
  const {regOfficeDelaysLength, fetchDataRegOfficeDelays} =
    useDelaysRegOffice();
  const {
    myTransactionsLength,
    loading: myTransactionsLoading,
    fetchMyPersonal,
  } = useMyTransactions();
  const {
    officeCode,
    fullName,
    employeeNumber,
    officeName,
    privilege,
    permission,
    accountType,
    token,
    gsoInspection,
    procurement,
    officeAdmin,
    caoReceiver,
    caoEvaluator,
    boss,
  } = useUserInfo();
  const {
    recentlyUpdatedData,
    recentlyUpdatedLength,
    updatedNowData,
    liveUpdatedNowData,
    updatedDateTime,
  } = useRecentlyUpdated();
  const [loading, setLoading] = useState();
  const [showReminder, setShowReminder] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);

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
  const {
    othersVouchersData,
    othersOthersData,
    loadingUseOthers,
    refetchDataOthers,
  } = useOthers(selectedYear);
  const {
    data: recentActivityData,
    isError: recentActivityError,
    isLoading: recentActivityLoading,
  } = useInspectionRecentActivity();

  const {
    receivingCountData,
    receivedMonthly,
    isReceivedLoading,
    isLoading: loadingReceiving,
    error: receivingError,
    receivingCount,
  } = useReceiving(selectedYear);

  const {trackSumData, trackSumError, trackSumLoading, refetchTrackSum} =
    useTrackingSummary(selectedYear);
  const {
    regTrackSumData,
    regTrackSumError,
    regTrackSumLoading,
    refetchRegTrackSum,
  } = useRegTrackingSummary(selectedYear);
  const {accountabilityData, error, fetchMyAccountability} =
    useMyAccountability();
  const {
    requestsLength,
    loading: requestsLoading,
    fetchRequests,
  } = useRequestInspection();

  const {dataLength: OnScheduleLength} = useOnSchedule();
  const {data: onEvalData} = useEvaluationByStatus(
    selectedYear,
    'On Evaluation - Accounting',
  );
  const {data: evaluatedData} = useEvaluationByStatus(
    selectedYear,
    'Evaluated - Accounting',
  );
  const {data: evalPendingData} = useEvaluationByStatus(
    selectedYear,
    'Pending at CAO',
  );
  const {data: evalPendingReleased} = useEvaluationByStatus(
    selectedYear,
    'Pending Released - CAO',
  );
  const {data: evaluatorSummary} = useEvaluatorSummary(selectedYear);
  const {
    data: inspection,
    isLoading: inspectionLoading,
    isError: inspectionError,
  } = useInspection();

  const forInspection = Array.isArray(inspection)
    ? inspection.filter(
        item => item?.Status?.toLowerCase() === 'for inspection',
      ).length
    : 0;

  const inspected = Array.isArray(inspection)
    ? inspection.filter(
        item =>
          item.DateInspected !== null &&
          item.DateInspected !== '' &&
          item?.Status?.toLowerCase() !== 'for inspection' &&
          item?.Status?.toLowerCase() !== 'inspection on hold',
      ).length
    : 0;

  const inspectionOnHold = Array.isArray(inspection)
    ? inspection.filter(
        item => item?.Status?.toLowerCase() === 'inspection on hold',
      ).length
    : 0;

  const years = Array.from(
    {length: Math.max(0, currentYear - 2023 + 1)},
    (_, index) => ({
      label: `${currentYear - index}`,
      value: currentYear - index,
    }),
  );

  const [visible, setVisible] = useState(false);
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  const onEvalDataCount = onEvalData?.length || 0;

  const evaluatedDataCount = evaluatedData?.length || 0;
  const evalPendingDataCount = evalPendingData?.length || 0;
  const evalPendingReleasedCount = evalPendingReleased?.length || 0;

  const bottomSheetRef = useRef(null);
  useBackButtonHandler(navigation);

  useEffect(() => {
    async function checkNotificationPermission() {
      const settings = await notifee.getNotificationSettings();
      if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        setShowReminder(true);
      }
    }
    checkNotificationPermission();
  }, []);

  const openSelectYear = useCallback(() => {
    closeMenu();
    bottomSheetRef.current?.present();
  }, []);

  const handleYearSelect = year => {
    setLoading(true);
    setSelectedYear(year);
    bottomSheetRef.current?.dismiss();

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleNotification = async () => {
    await notifee.openNotificationSettings();
    setShowReminder(false);
  };

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

  const logout = async () => {
    setModalVisible(false);
    setProgressModalVisible(true);
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({EmployeeNumber: employeeNumber}),
      };

      const response = await fetch(`${BASE_URL}/logoutApi`, requestOptions);

      if (!response.ok) {
        throw new Error(
          `Logout request failed with status: ${response.status}`,
        );
      }

      await AsyncStorage.removeItem('token');
      navigation.replace('Login');

      setProgressModalVisible(false);
    } catch (error) {
      console.error('Error while logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
      setProgressModalVisible(false);
    }
  };

  const DoctrackScreenComponent = () => {
    return (
      <>
        <DoctrackScreen
          navigation={navigation}
          officeDelaysLength={officeDelaysLength}
          officeDelaysData={officeDelaysData}
          myTransactionsLength={myTransactionsLength}
          regOfficeDelaysLength={regOfficeDelaysLength}
          recentlyUpdatedLength={recentlyUpdatedLength}
          recentlyUpdatedData={recentlyUpdatedData}
          updatedNowData={updatedNowData}
          fullName={fullName}
          employeeNumber={employeeNumber}
          officeCode={officeCode}
          officeName={officeName}
          privilege={privilege}
          permission={permission}
          caoReceiver={caoReceiver}
          caoEvaluator={caoEvaluator}
          accountType={accountType}
          officeAdmin={officeAdmin}
          gsoInspection={gsoInspection}
          procurement={procurement}
          boss={boss}
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
          myTransactionsLoading={myTransactionsLoading}
          fetchTransactionSummary={fetchTransactionSummary}
          othersVouchersData={othersVouchersData}
          othersOthersData={othersOthersData}
          loadingUseOthers={loadingUseOthers}
          refetchDataOthers={refetchDataOthers}
          setDataPR={setDataPR}
          setPRPercentage={setPRPercentage}
          calculatePRPercentage={calculatePRPercentage}
          setDataPO={setDataPO}
          setPOPercentage={setPOPercentage}
          calculatePOPercentage={calculatePOPercentage}
          setDataPX={setDataPX}
          setPXPercentage={setPXPercentage}
          calculatePXPercentage={calculatePXPercentage}
          forInspection={forInspection}
          inspected={inspected}
          inspectionOnHold={inspectionOnHold}
          //inspectionList={inspectionList}
          inspectionLoading={inspectionLoading}
          inspectionError={inspectionError}
          recentActivityData={recentActivityData}
          recentActivityError={recentActivityError}
          recentActivityLoading={recentActivityLoading}
          //fetchRecentActivity={fetchRecentActivity}
          receivingCount={receivingCount}
          receivingCountData={receivingCountData}
          // receivedMonthly={receivedMonthly}
          loadingReceiving={loadingReceiving}
          isReceivedLoading={isReceivedLoading}
          receivingError={receivingError}
          trackSumData={trackSumData}
          trackSumError={trackSumError}
          trackSumLoading={trackSumLoading}
          refetchTrackSum={refetchTrackSum}
          regTrackSumData={regTrackSumData}
          regTrackSumError={regTrackSumError}
          regTrackSumLoading={regTrackSumLoading}
          refetchRegTrackSum={refetchRegTrackSum}
          accountabilityData={accountabilityData}
          fetchMyAccountability={fetchMyAccountability}
          requestsLength={requestsLength}
          requestsLoading={requestsLoading}
          fetchRequests={fetchRequests}
          OnScheduleLength={OnScheduleLength}
          onEvalDataCount={onEvalDataCount}
          evaluatedDataCount={evaluatedDataCount}
          evalPendingDataCount={evalPendingDataCount}
          evalPendingReleasedCount={evalPendingReleasedCount}
          evaluatorSummary={evaluatorSummary}
        />
      </>
    );
  };

  const SearchScreenComponent = ({}) => {
    return (
      <SearchScreen
        navigation={navigation}
        officeCode={officeCode}
        officeName={officeName}
        privilege={privilege}
        fullName={fullName}
        employeeNumber={employeeNumber}
        permission={permission}
        caoReceiver={caoReceiver}
        caoEvaluator={caoEvaluator}
        accountType={accountType}
        officeAdmin={officeAdmin}
        gsoInspection={gsoInspection}
        procurement={procurement}
        boss={boss}
      />
    );
  };

  const SettingsScreenComponent = ({}) => {
    return (
      <SettingsScreen
        navigation={navigation}
        officeCode={officeCode}
        officeName={officeName}
        privilege={privilege}
        fullName={fullName}
        employeeNumber={employeeNumber}
        permission={permission}
        caoReceiver={caoReceiver}
        caoEvaluator={caoEvaluator}
        accountType={accountType}
        officeAdmin={officeAdmin}
        gsoInspection={gsoInspection}
        procurement={procurement}
      />
    );
  };

  useEffect(() => {
    checkToken();
  }, []);

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'doctrack', title: 'Home', icon: 'home-outline'},
    {key: 'search', title: 'Search', icon: 'search-outline'},
    {key: 'settings', title: 'More', icon: 'menu-outline'},
  ]);

  const renderScene = SceneMap({
    doctrack: DoctrackScreenComponent,
    search: SearchScreenComponent,
    settings: SettingsScreenComponent,
  });

  /* if (loading) {
    return <SafeAreaLoader />;
  } */

  return (
    <SafeAreaView style={[styles.container]}>
      <BottomSheetModalProvider>
        <PaperProvider>
          <SafeAreaLoader>
            {() => (
              <>
                <ImageBackground
                  source={require('../../assets/images/CirclesBG.png')}
                  style={styles.header}>
                  <Image
                    source={require('../../assets/images/docmobilelogo2.png')}
                    style={{
                      width: 120,
                      height: 30,
                      margin: 5,
                      marginStart: 10,
                      tintColor: '#fff',
                    }}
                  />

                  <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    statusBarHeight={80}
                    anchor={
                      <Pressable
                        onPress={openMenu}
                        style={styles.settingsButton}>
                        <Icon name="settings-outline" size={24} color="white" />
                      </Pressable>
                    }>
                    {/* <View style={styles.pointer} /> */}
                    <Menu.Item
                      onPress={() => openSelectYear()}
                      title="Change Year"
                    />
                    <Divider />
                    <Menu.Item
                      onPress={() => setModalVisible(true)}
                      title="Logout"
                    />
                  </Menu>

                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Logout</Text>
                        <Text style={styles.modalMessage}>
                          Are you sure you want to log out?
                        </Text>

                        <View style={styles.modalActions}>
                          {/* Cancel Button */}
                          <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                          </TouchableOpacity>

                          {/* Confirm Logout Button */}
                          <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={logout}>
                            <Text style={styles.buttonText}>Logout</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>

                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={progressModalVisible}
                    onRequestClose={() => {}}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContainer}>
                        <ActivityIndicator
                          size="large"
                          color="rgba(42, 125, 216, 1)"
                        />
                        <Text style={styles.modalMessage}>Logging out...</Text>
                      </View>
                    </View>
                  </Modal>

                  <BottomSheetModal
                    ref={bottomSheetRef}
                    index={0}
                    snapPoints={['40%', '60%']} // Allows it to expand if needed
                    backgroundStyle={styles.bottomSheet}
                    handleIndicatorStyle={styles.handleIndicator}>
                    <View style={styles.bottomSheetContent}>
                      <Text style={styles.title}>Select Year</Text>

                      <FlatList
                        data={years}
                        keyExtractor={item => item.value.toString()}
                        contentContainerStyle={styles.scrollableList} // Makes it scrollable
                        showsVerticalScrollIndicator={false} // Hides the scrollbar
                        renderItem={({item}) => (
                          <Pressable
                            style={styles.yearItem}
                            onPress={() => handleYearSelect(item.value)}>
                            <Text
                              style={[
                                styles.yearText,
                                selectedYear === item.value &&
                                  styles.selectedYear,
                              ]}>
                              {item.label}
                            </Text>
                          </Pressable>
                        )}
                      />
                    </View>
                  </BottomSheetModal>
                </ImageBackground>
                {showReminder /*  || Platform.Version < 30 */ && (
                  <Banner
                    style={styles.bannerContainer}
                    text="You haven't enabled notifications. Enable them for timely updates."
                    buttons={
                      <View style={styles.buttonStack}>
                        <Button
                          mode="contained"
                          onPress={handleNotification}
                          labelStyle={styles.buttonLabel}
                          style={styles.containedButton}>
                          Enable Notifications
                        </Button>
                        <Button
                          mode="text"
                          onPress={() => setShowReminder(false)}
                          labelStyle={styles.dismissButtonLabel}>
                          Dismiss
                        </Button>
                      </View>
                    }
                  />
                )}
                <TabView
                  navigationState={{index, routes}}
                  renderScene={renderScene}
                  onIndexChange={setIndex}
                  initialLayout={{width: layout.width}}
                  tabBarPosition="bottom"
                  transitionStyle="scroll"
                  swipeEnabled={false} // 👈 disables swipe
                  // style={{backgroundColor: 'pink'}}
                  renderTabBar={props => (
                    <ImageBackground
                      source={require('../../assets/images/CirclesBG2.png')}
                      style={styles.tabBarBackground}>
                      <TabBar
                        {...props}
                        renderIcon={({route, focused}) => (
                          <Icon
                            name={route.icon}
                            size={focused ? 22 : 20}
                            color={focused ? 'white' : 'white'}
                            suppressHighlighting={true}
                          />
                        )}
                        style={styles.tabBar}
                        indicatorStyle={[styles.indicator, {top: 0}]}
                        labelStyle={styles.tabLabel}
                        getLabelText={({route}) => route.title}
                        android_ripple={false}
                        pressColor="transparent"
                      />
                    </ImageBackground>
                  )}
                  /*  pager={props => <TransitionPager {...props} />} */
                />
                {loading && (
                  <View style={styles.loadingContainer}>
                    <Text style={{color: 'white'}}>
                      Changing year to {selectedYear}...
                    </Text>
                  </View>
                )}
              </>
            )}
          </SafeAreaLoader>
        </PaperProvider>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    backgroundColor: 'white',
  },
  buttonStack: {
    flexDirection: 'row',
    alignItems: 'center',
    // Add spacing between buttons, if not handled by a true HStack component
    // For example, you might add margin to individual buttons
  },
  containedButton: {
    backgroundColor: '#1a508c', // Your specified background color
    marginRight: 8, // Add some space between buttons
  },
  buttonLabel: {
    fontSize: 12,
    color: 'white', // Contained buttons usually have white text
  },
  dismissButtonLabel: {
    fontSize: 12,
    color: '#1a508c', // Text buttons usually have colored text
  },
  scene: {
    flex: 1,
  },
  tabBarContainer: {
    width: '100%',
    height: 50,
    position: 'relative',
  },
  tabBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
  },
  tabBar: {
    backgroundColor: 'transparent',
    height: 50,
    zIndex: 1,
  },
  indicator: {
    backgroundColor: '#007aff',
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 4, // Shadow effect
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    marginEnd: 5,
    paddingHorizontal: 5,
    //backgroundColor:'red',
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  backgroundImage: {
    flex: 1, // Make it fill the entire screen
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: semi-transparent background
    borderRadius: 5,
  },
  pointer: {
    position: 'absolute',
    top: -10, // Position it above the menu
    right: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white', // Match menu background
  },
  bottomSheet: {
    //backgroundColor: 'rgba(255, 255, 255, 0.95)', // Soft white background
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: -2},
  },
  handleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 8,
  },
  bottomSheetContent: {flex: 1, padding: 20, alignItems: 'center'},

  // Title Styling
  title: {fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15},

  // Year Item Styling
  yearItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  yearText: {fontSize: 20, fontWeight: 'bold', color: '#333'},
  selectedYear: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#ff3b3b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalMessage: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  confirmButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
