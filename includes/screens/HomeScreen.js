import React, {useState, useEffect, useRef, useCallback} from 'react';
import BASE_URL from '../../config';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Image,
  ImageBackground,
  FlatList,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {Banner, HStack} from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import DoctrackScreen from './DoctrackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeAreaLoader from '../../loader/SafeAreaLoader';
import SettingsScreen from './SettingsScreen';
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
import useRequestInspection from '../api/useRequestInspection';
import useOnSchedule from '../api/useOnSchedule';
import {useEvaluationByStatus} from '../hooks/useEvaluationByStatus';
import {
  Provider as PaperProvider,
  Button as PaperButton,
} from 'react-native-paper';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {useEvaluatorSummary} from '../hooks/useEvaluatorSummary';
import {
  useAdvanceInspection,
  useInspection,
  useInspectionRecentActivity,
} from '../hooks/useInspection';
import {useMyAccountability} from '../hooks/usePersonal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CommunicationsScreen from '../components/CommunicationsScreen';

const Tab = createBottomTabNavigator();
const currentYear = new Date().getFullYear();

const DoctrackScreenComponent = ({navigation, ...props}) => {
  return <DoctrackScreen navigation={navigation} {...props} />;
};

const SearchScreenComponent = ({navigation, ...props}) => {
  return <SearchScreen navigation={navigation} {...props} />;
};

const SettingsScreenComponent = ({navigation, ...props}) => {
  return <SettingsScreen navigation={navigation} {...props} />;
};

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
    payroll,
    boss,
    sura,
    fms,
  } = useUserInfo();
  const {
    recentlyUpdatedData,
    recentlyUpdatedLength,
    updatedNowData,
    liveUpdatedNowData,
    updatedDateTime,
  } = useRecentlyUpdated();
  const [loading, setLoading] = useState(true);
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
  const {
    data: accountabilityData,
    isError: accountabilityError,
    refetch: fetchMyAccountability,
  } = useMyAccountability();
  const {
    requestsLength,
    loading: requestsLoading,
    fetchRequests,
  } = useRequestInspection();

  const {
    data: advanceInspection,
    loading: dataLoading,
    error: dataError,
    refetch,
  } = useAdvanceInspection();

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

  const advanceForInspection = Array.isArray(advanceInspection)
    ? advanceInspection.filter(
        item =>
          item?.Status?.toLowerCase() === 'for inspection' &&
          item?.DateInspected === null,
      ).length
    : 0;

  const years = Array.from(
    {length: Math.max(0, currentYear - 2023 + 1)},
    (_, index) => ({
      label: `${currentYear - index}`,
      value: currentYear - index,
    }),
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  const onEvalDataCount = onEvalData?.length || 0;
  const evaluatedDataCount = evaluatedData?.length || 0;
  const evalPendingDataCount = evalPendingData?.length || 0;
  const evalPendingReleasedCount = evalPendingReleased?.length || 0;

  const yearBottomSheetRef = useRef(null);
  const settingsBottomSheetRef = useRef(null);
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

  const openYearSelector = useCallback(() => {
    settingsBottomSheetRef.current?.close();
    yearBottomSheetRef.current?.present();
  }, []);

  const openSettings = useCallback(() => {
    settingsBottomSheetRef.current?.present();
  }, []);

  const handleYearSelect = year => {
    setLoading(true);
    setSelectedYear(year);
    yearBottomSheetRef.current?.dismiss();

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

  const SettingsBottomSheetContent = () => (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>More Options</Text>
      <TouchableOpacity
        style={styles.bottomSheetButton}
        onPress={openYearSelector}>
        <Icon name="calendar-outline" size={24} color="#333" />
        <Text style={styles.bottomSheetButtonText}>Change Year</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.bottomSheetButton, {marginTop: 10}]}
        onPress={() => {
          settingsBottomSheetRef.current?.close();
          setModalVisible(true);
        }}>
        <Icon name="log-out-outline" size={24} color="red" />
        <Text style={[styles.bottomSheetButtonText, {color: 'red'}]}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackdrop = useCallback(
    props => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />,
    [],
  );

  const prevScrollY = useRef(0);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const handleScroll = event => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    const isScrollingUp = currentScrollY < prevScrollY.current;
    const isScrollingDown = currentScrollY > prevScrollY.current;

    const scrollThreshold = 10;

    if (isScrollingDown && currentScrollY > scrollThreshold) {
      setIsTabVisible(false);
    } else if (isScrollingUp || currentScrollY < scrollThreshold) {
      setIsTabVisible(true);
    }

    prevScrollY.current = currentScrollY;
  };

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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Pressable
                      onPress={openSettings}
                      style={({pressed}) => [
                        {
                          padding: 10,
                          borderRadius: 12, // radius here
                          backgroundColor: pressed ? '#555' : 'transparent', // pressed effect
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}>
                      <MaterialCommunityIcons
                        name="cog"
                        size={24}
                        color="white"
                      />
                    </Pressable>
                  </View>

                  {/* Settings Bottom Sheet Modal */}
                  <BottomSheetModal
                    ref={settingsBottomSheetRef}
                    index={0}
                    snapPoints={['50%']}
                    backgroundStyle={styles.bottomSheet}
                    handleIndicatorStyle={styles.handleIndicator}
                    backdropComponent={renderBackdrop}>
                    <SettingsBottomSheetContent />
                  </BottomSheetModal>

                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    statusBarTranslucent={true}
                    onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Logout</Text>
                        <Text style={styles.modalMessage}>
                          Are you sure you want to log out?
                        </Text>
                        <View style={styles.modalActions}>
                          <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                          </TouchableOpacity>
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
                    animationType="none"
                    transparent={true}
                    visible={progressModalVisible}
                    statusBarTranslucent={true}
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
                    ref={yearBottomSheetRef}
                    index={0}
                    snapPoints={['40%', '60%']}
                    backgroundStyle={styles.bottomSheet}
                    handleIndicatorStyle={styles.handleIndicator}
                    backdropComponent={renderBackdrop}>
                    <View style={styles.bottomSheetContent}>
                      <Text style={styles.title}>Select Year</Text>
                      <FlatList
                        data={years}
                        keyExtractor={item => item.value.toString()}
                        contentContainerStyle={styles.scrollableList}
                        showsVerticalScrollIndicator={false}
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

                {showReminder && (
                  <Banner
                    style={styles.bannerContainer}
                    text="You haven't enabled notifications. Enable them for timely updates."
                    buttons={
                      <HStack spacing={2}>
                        <PaperButton
                          mode="contained"
                          onPress={handleNotification}
                          labelStyle={styles.buttonLabel}
                          style={styles.containedButton}>
                          Enable Notifications
                        </PaperButton>
                        <PaperButton
                          mode="text"
                          onPress={() => setShowReminder(false)}
                          labelStyle={styles.dismissButtonLabel}>
                          Dismiss
                        </PaperButton>
                      </HStack>
                    }
                  />
                )}

                <Tab.Navigator
                  screenOptions={{
                    headerShown: false,
                    tabBarStyle: [
                      styles.tabBar,
                      {
                        bottom: isTabVisible ? 0 : -100,
                      },
                    ],
                    tabBarActiveTintColor: '#3B82F6',
                    tabBarInactiveTintColor: '#777777ff',
                    tabBarShowLabel: true,
                    tabBarBackground: () => (
                      <LinearGradient
                        colors={['#ffffffff', '#e9ebee']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={{
                          ...styles.tabBarBackground,
                        }}>
                        <View
                          style={{
                            ...styles.tabBarBackground,
                          }}
                        />
                      </LinearGradient>
                    ),
                  }}>
                  <Tab.Screen
                    name="Doctrack"
                    options={{
                      tabBarLabel: 'Home', // 👈 Set custom label here
                      tabBarIcon: ({color, size, focused}) => (
                        <MaterialCommunityIcons
                          //name={focused ? 'home' : 'home-outline'}
                          name={'home-outline'}
                          size={focused ? 40 : 35}
                          color={color}
                        />
                      ),
                    }}>
                    {props => (
                      <DoctrackScreenComponent
                        {...props}
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
                        payroll={payroll}
                        boss={boss}
                        sura={sura}
                        fms={fms}
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
                        advanceForInspection={advanceForInspection}
                        forInspection={forInspection}
                        inspected={inspected}
                        inspectionOnHold={inspectionOnHold}
                        inspectionLoading={inspectionLoading}
                        inspectionError={inspectionError}
                        recentActivityData={recentActivityData}
                        recentActivityError={recentActivityError}
                        recentActivityLoading={recentActivityLoading}
                        receivingCount={receivingCount}
                        receivingCountData={receivingCountData}
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
                        onScroll={handleScroll}
                      />
                    )}
                  </Tab.Screen>

                  <Tab.Screen
                    name="Search"
                    options={{
                      tabBarIcon: ({color, size, focused}) => (
                        <MaterialCommunityIcons
                          name={
                            focused
                              ? 'file-search-outline'
                              : 'file-search-outline'
                          }
                          size={focused ? 40 : 30}
                          color={color}
                        />
                      ),
                    }}>
                    {props => (
                      <SearchScreenComponent
                        {...props}
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
                    )}
                  </Tab.Screen>
                  <Tab.Screen
                    name="Connect"
                    options={{
                      tabBarIcon: ({color, size, focused}) => (
                        <MaterialCommunityIcons
                          name={
                            //focused ? 'android-messages' : 'android-messages'
                            focused
                              ? 'message-badge-outline'
                              : 'message-badge-outline'
                          }
                          size={focused ? 40 : 30}
                          color={color}
                        />
                      ),
                    }}>
                    {props => (
                      <CommunicationsScreen
                        {...props}
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
                        onScroll={handleScroll}
                      />
                    )}
                  </Tab.Screen>

                  <Tab.Screen
                    name="More"
                    options={{
                      tabBarIcon: ({color, size, focused}) => (
                        <MaterialCommunityIcons
                          name={focused ? 'dots-grid' : 'dots-grid'}
                          size={focused ? 40 : 30}
                          color={color}
                        />
                      ),
                    }}>
                    {props => (
                      <SettingsScreenComponent
                        {...props}
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
                    )}
                  </Tab.Screen>
                </Tab.Navigator>
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
  },
  containedButton: {
    backgroundColor: '#1a508c',
    marginRight: 8,
  },
  buttonLabel: {
    fontSize: 12,
    color: 'white',
  },
  dismissButtonLabel: {
    fontSize: 12,
    color: '#1a508c',
  },
  tabBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    //borderRadius: 50,
    paddingBottom: 10,
  },
  tabBar: {
    backgroundColor: 'transparent',
    height: 60,
    zIndex: 1,
    position: 'absolute',
    //borderTopWidth: 0,
    //bottom: 20,
    //right: 10,
    //left: 10,
    //borderRadius: 10,
    paddingHorizontal: 10,
  },
  header: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    //elevation: 4,
  },
  settingsButton: {
    marginEnd: 5,
    paddingHorizontal: 5,
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomSheet: {
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
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  yearItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedYear: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bottomSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  bottomSheetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
});

export default HomeScreen;
