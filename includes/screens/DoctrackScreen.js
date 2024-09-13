import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  TouchableHighlight,
} from 'react-native';
import {StackActions} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import OfficeDelaysScreen from './OfficeDelaysScreen';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import {SearchBar} from '@rneui/themed';
import ProjectCleansingScreen from './ProjectCleansingScreen';

const DoctrackScreen = ({
  officeDelaysLength,
  regOfficeDelaysLength,
  myTransactionsLength,
  updatedNowData,
  updatedDateTime,
  officeCode,
  officeName,
  privilege,
  dataPR,
  dataPO,
  dataPX,
  PRPercentage,
  POPercentage,
  PXPercentage,
  setDataPR,
  setPRPercentage,
  calculatePRPercentage,
  setDataPO,
  setPOPercentage,
  calculatePOPercentage,
  setDataPX,
  setPXPercentage,
  calculatePXPercentage,
  loadingTransSum,
  selectedYear,
  setSelectedYear,
  fetchDataRegOfficeDelays,
  refetchDataOthers,
  fetchOfficeDelays,
  fetchMyPersonal,
  fetchTransactionSummary,
  othersVouchersData,
  othersOthersData,
  loadingDetails,
}) => {
  const [showPRStatus, setShowPRStatus] = useState(false);
  const [showPOStatus, setShowPOStatus] = useState(false);
  const [showPXStatus, setShowPXStatus] = useState(false);

  const [refreshing, setRefreshing] = React.useState(false);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const navigation = useNavigation();

  const [search, setSearch] = useState('');

  const updateSearch = search => {
    setSearch(search);
  };

  const YearDropdown = ({selectedYear, setSelectedYear}) => {
    const years = [
      {label: `${new Date().getFullYear()}`, value: new Date().getFullYear()},
      {label: '2023', value: 2023},
    ];

    return (
      <View style={{position: 'relative', zIndex: 1}}>
        <Dropdown
          style={[styles.dropdown, {elevation: 10}]}
          data={years}
          labelField="label"
          valueField="value"
          placeholder={selectedYear.toString()}
          selectedTextStyle={{
            color: 'white',
            fontSize: 18,
            fontFamily: 'Oswald-Light',
          }}
          placeholderStyle={{
            color: 'white',
            fontSize: 18,
            fontFamily: 'Oswald-Light',
          }}
          iconStyle={{tintColor: 'white'}}
          value={selectedYear}
          onChange={item => {
            setSelectedYear(item.value);
          }}
        />
      </View>
    );
  };

  const getSumOfDocumentTypeCount = data => {
    if (!data || !Array.isArray(data)) {
      return 0; // Return 0 if data is null, undefined, or not an array
    }
    return data.reduce((sum, item) => {
      const count = parseInt(item.DocumentTypeCount, 10) || 0;
      return sum + count;
    }, 0);
  };

  const getTotalCheckReleasedCount = data => {
    if (!Array.isArray(data)) {
      return 0;
    }

    const total = data
      .flatMap(doc =>
        Array.isArray(doc.StatusCounts)
          ? doc.StatusCounts.filter(item => item.Status === 'Check Released')
          : [],
      )
      .reduce((sum, item) => sum + parseInt(item.StatusCount, 10) || 0, 0);

    return total;
  };

  const getTotalCAOReleasedCount = data => {
    if (!Array.isArray(data)) {
      return 0;
    }

    const total = data
      .flatMap(doc =>
        doc.DocumentType === 'Liquidation' && Array.isArray(doc.StatusCounts)
          ? doc.StatusCounts.filter(item => item.Status === 'CAO Released')
          : [],
      )
      .reduce((sum, item) => sum + parseInt(item.StatusCount, 10) || 0, 0);

    return total;
  };

  const getPercentage = (checkReleasedCount, totalDocumentTypeCount) => {
    if (totalDocumentTypeCount === 0) {
      return 0; // Avoid division by zero
    }
    return (checkReleasedCount / totalDocumentTypeCount) * 100;
  };

  const getPercentageOthers = (
    checkReleasedCount,
    caoReleasedOthersCount,
    totalDocumentTypeCount,
  ) => {
    if (totalDocumentTypeCount === 0) {
      return 0; // Avoid division by zero
    }
    return (
      ((checkReleasedCount + caoReleasedOthersCount) / totalDocumentTypeCount) *
      100
    );
  };

  const checkReleasedCount = getTotalCheckReleasedCount(othersVouchersData);

  const totalDocumentTypeCount = getSumOfDocumentTypeCount(othersVouchersData);

  const checkReleasedOthersCount = getTotalCheckReleasedCount(othersOthersData);
  const caoReleasedOthersCount = getTotalCAOReleasedCount(othersOthersData);
  const totalDocumentTypeOthersCount =
    getSumOfDocumentTypeCount(othersOthersData);

  const percentage = getPercentage(checkReleasedCount, totalDocumentTypeCount);

  const percentageOthers = getPercentageOthers(
    checkReleasedOthersCount,
    caoReleasedOthersCount,
    totalDocumentTypeOthersCount,
  );

  const [visibleStatusCounts, setVisibleStatusCounts] = useState({});
  const [visibleOthersStatusCounts, setVisibleOthersStatusCounts] = useState(
    {},
  );

  const [visibleDocuments, setVisibleDocuments] = useState(false);
  const [visibleDocumentsOthers, setVisibleDocumentsOthers] = useState(false);

  const toggleDocumentOthersVisibility = documentType => {
    setVisibleDocumentsOthers(prevState => ({
      ...prevState,
      [documentType]: !prevState[documentType],
    }));
  };

  const toggleDocumentVisibility = documentType => {
    setVisibleDocuments(prevState => ({
      ...prevState,
      [documentType]: !prevState[documentType],
    }));
  };

  const toggleVisibility = documentType => {
    setVisibleStatusCounts(prevState => ({
      ...prevState,
      [documentType]: !prevState[documentType],
    }));
  };

  const toggleVisibilityOthers = documentType => {
    setVisibleOthersStatusCounts(prevState => ({
      ...prevState,
      [documentType]: !prevState[documentType],
    }));
  };

  const ProgressBar = React.memo(({percentage, color}) => {
    const widthAnim = useRef(new Animated.Value(parseInt(percentage))).current;

    useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, [percentage]);

    const animatedWidth = widthAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {width: animatedWidth, backgroundColor: color},
          ]}
        />
      </View>
    );
  });

  const ProgressBarOthers = React.memo(({percentage, color}) => {
    const widthAnim = useRef(new Animated.Value(parseInt(percentage))).current;

    useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, [percentage]);

    const animatedWidth = widthAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.progressBarContainerOthers}>
        <Animated.View
          style={[
            styles.progressBar,
            {width: animatedWidth, backgroundColor: color},
          ]}
        />
      </View>
    );
  });

  const LoadingModal = ({visible}) => {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={() => {}}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{color: 'white', marginTop: 10}}>Loading ...</Text>
          </View>
        </View>
      </Modal>
    );
  };

  const AnimatedStatusView = ({showStatus, data, slideAnim}) => {
    const animating = useRef(false);

    useEffect(() => {
      if (animating.current) return;

      animating.current = true;
      Animated.timing(slideAnim, {
        toValue: showStatus ? 0 : -20,
        duration: 160,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        animating.current = false;
      });
    }, [showStatus, slideAnim]);

    return (
      <Animated.View
        style={{
          transform: [{translateY: slideAnim}],
          overflow: 'hidden',
          paddingBottom: 20,
        }}>
        {showStatus && (
          <View
            style={{
              borderRightWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              maxWidth: 230,
            }}>
            {data && data.StatusCountData && data.StatusCountData.length > 0 ? (
              data.StatusCountData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    navigation.navigate('StatusView', {
                      selectedItem: item,
                      statusViewResults: data.StatusViewResults[item.Status],
                      officeName,
                      loadingTransSum,
                    })
                  }>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingStart: 20,
                      justifyContent: 'flex-end',
                      paddingEnd: 10,
                      paddingVertical: 5,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 13,
                        fontFamily: 'Oswald-Light',
                        letterSpacing: 1,
                        opacity: 0.5,
                        textAlign: 'right',
                      }}>
                      {item.Status}
                    </Text>
                    <Text
                      style={{
                        width: 30,
                        color: 'white',
                        fontSize: 13,
                        fontFamily: 'Oswald-Light',
                        textAlign: 'right',
                        letterSpacing: 1,
                      }}>
                      {item.StatusCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{maxWidth: 220}}>
                <Text
                  style={{
                    color: 'white',
                    opacity: 0.5,
                    textAlign: 'right',
                    fontFamily: 'Oswald-Light',
                    marginEnd: 10,
                  }}>
                  Nothing to Load...
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setModalVisible(true);

    try {
      // Fetch data concurrently to improve performance
      await Promise.all([
        fetchTransactionSummary(
          'PR',
          setDataPR,
          setPRPercentage,
          calculatePRPercentage,
        ),
        fetchTransactionSummary(
          'PO',
          setDataPO,
          setPOPercentage,
          calculatePOPercentage,
        ),
        fetchTransactionSummary(
          'PX',
          setDataPX,
          setPXPercentage,
          calculatePXPercentage,
        ),
        fetchDataRegOfficeDelays(),
        fetchOfficeDelays(),
        fetchMyPersonal(),
        refetchDataOthers(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
        setModalVisible(false);
      }, 3000); // 3 seconds timeout
    }
  }, []);

  const handleSummary = async () => {
    if (navigation) {
      navigation.dispatch(
        StackActions.push('Summary', {
          /* Optional parameters here */
        }),
      );
      // Or you can use
      // navigation.navigate('Summary', { /* Optional parameters here */ });
    }
  };

  const handleMyTransactions = async () => {
    if (navigation) {
      navigation.navigate('MyTransactions');
    }
  };

  const handleOfficeDelays = async () => {
    if (navigation) {
      navigation.navigate('OfficeDelays');
      return <OfficeDelaysScreen />;
    }
  };

  const handleRecentUpdated = async () => {
    if (navigation) {
      navigation.navigate('RecentUpdated');
    }
  };

  const handlePRStatus = useCallback(() => {
    setShowPRStatus(prevState => !prevState);
  }, []);

  const handlePOStatus = useCallback(() => {
    setShowPOStatus(prevState => !prevState);
  }, []);

  const handlePXStatus = useCallback(() => {
    setShowPXStatus(prevState => !prevState);
  }, []);

  const handleInspection = async () => {
    navigation.navigate('ProjectCleansing');
    return <ProjectCleansingScreen />;
  };

  const slideAnimPR = useRef(new Animated.Value(-100)).current;
  const slideAnimPO = useRef(new Animated.Value(-100)).current;
  const slideAnimPX = useRef(new Animated.Value(-100)).current;

  const renderContent = useCallback(() => {
    if (
      ['8751', '1031', '1081', 'BAAC', '1071', '1061', '1091'].includes(
        officeCode,
      )
    ) {
      return (
        <>
          <View
            style={{
              columnGap: 10,
              justifyContent: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
            }}>
            <View style={{flex: 1}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleRecentUpdated}>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 10,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                    RECENTLY UPDATED
                  </Text>
                  <Text
                    style={{
                      fontSize: 70,
                      //backgroundColor:'red',
                      lineHeight: 90,
                      fontFamily: 'Oswald-Bold',
                      color: 'rgba(255, 255, 255, 1)',
                      textShadowRadius: 1,
                      textShadowOffset: {width: 2, height: 4},
                    }}>
                    {updatedNowData ? updatedNowData : 0}
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={{flex: 1}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleMyTransactions}>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 10,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                    MY PERSONAL
                  </Text>
                  <Text
                    style={{
                      fontSize: 70,
                      //backgroundColor:'red',
                      lineHeight: 90,
                      fontFamily: 'Oswald-Bold',
                      color: 'rgba(255, 255, 255, 1)',
                      textShadowRadius: 1,
                      textShadowOffset: {width: 2, height: 4},
                    }}>
                    {myTransactionsLength ? myTransactionsLength : 0}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View
            style={{
              marginTop: 10,
              columnGap: 10,
              justifyContent: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
            }}>
            <View style={{flex: 1}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleOfficeDelays}>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 10,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                    OFFICE DELAYS
                  </Text>

                  <Text
                    style={{
                      fontSize: 70,
                      //backgroundColor:'red',
                      lineHeight: 90,
                      fontFamily: 'Oswald-Bold',
                      color: 'rgba(255, 255, 255, 1)',
                      textShadowRadius: 1,
                      textShadowOffset: {width: 2, height: 4},
                    }}>
                    {officeDelaysLength ? officeDelaysLength : 0}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={{flex: 1}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleSummary}>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 10,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                    REGULATORY OFFICE DELAYS
                  </Text>

                  <Text
                    style={{
                      fontSize: 70,
                      //backgroundColor:'red',
                      lineHeight: 90,
                      fontFamily: 'Oswald-Bold',
                      color: 'rgba(255, 255, 255, 1)',
                      textShadowRadius: 1,
                      textShadowOffset: {width: 2, height: 4},
                    }}>
                    {regOfficeDelaysLength ? regOfficeDelaysLength : 0}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 15,
                paddingStart: 15,
                padding: 10,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Oswald-Light',
                  letterSpacing: 2,
                  fontSize: 16,
                  textTransform: 'uppercase',
                }}>
                Procurement Progress
              </Text>
              {loadingTransSum && (
                <ActivityIndicator size="small" color="white" />
              )}
              <View style={{}}>
                <YearDropdown
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                />
              </View>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0, 0.1)',
                paddingBottom: 10,
              }}>
              <View style={{backgroundColor: 'rgba(0,0,0, 0.1)'}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginStart: 15,
                    marginVertical: 5,
                    fontSize: 14,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                  Purchase Request
                </Text>
              </View>

              <View style={{}}>
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    //paddingVertical: -10,
                  }}>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          alignSelf: 'center',
                          textAlign: 'center',
                          opacity: 0.8,
                        },
                      ]}>
                      PR
                    </Text>
                  </View>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 2,
                          alignSelf: 'center',
                          textAlign: 'center',
                          opacity: 0.8,
                        },
                      ]}>
                      Completed
                    </Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 6}]}></View>
                </View>

                <View style={[styles.table, {}]}>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          alignSelf: 'center',
                          textAlign: 'center',
                        },
                      ]}>
                      {dataPR && dataPR.TotalCount != null
                        ? dataPR.TotalCount
                        : ''}
                    </Text>
                  </View>

                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {flex: 2, alignSelf: 'center', textAlign: 'center'},
                      ]}>
                      {dataPR && dataPR.ForPOCount != null
                        ? dataPR.ForPOCount
                        : ''}
                    </Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 5}]}>
                    <TouchableOpacity onPress={handlePRStatus}>
                      <ProgressBar
                        percentage={PRPercentage}
                        color="'rgba(36, 165, 6, 1)',"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'center',
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {Math.round(PRPercentage)}%
                    </Text>
                  </View>
                </View>

                <View style={[styles.table, {}]}>
                  <View style={styles.column}></View>

                  <View style={styles.column}></View>

                  <View style={[styles.column, {flexGrow: 5}]}>
                    <AnimatedStatusView
                      showStatus={showPRStatus}
                      data={dataPR}
                      slideAnim={slideAnimPR}
                    />
                  </View>

                  <View style={styles.column}></View>
                </View>
              </View>

              <View style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginStart: 15,
                    marginVertical: 5,
                    fontSize: 14,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                  Purchase Order
                </Text>
              </View>

              <View style={{}}>
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    //paddingVertical: -10,
                  }}>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          alignSelf: 'center',
                          textAlign: 'center',
                          opacity: 0.8,
                        },
                      ]}>
                      PO
                    </Text>
                  </View>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 2,
                          alignSelf: 'center',
                          textAlign: 'center',
                          opacity: 0.8,
                        },
                      ]}>
                      Completed
                    </Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 6}]}></View>
                </View>

                <View style={styles.table}>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {alignSelf: 'center', textAlign: 'center'},
                      ]}>
                      {dataPO && dataPO.TotalCount != null
                        ? dataPO.TotalCount
                        : ''}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {flex: 2, alignSelf: 'center', textAlign: 'center'},
                      ]}>
                      {dataPO && dataPO.WaitingForDeliveryCount != null
                        ? dataPO.WaitingForDeliveryCount
                        : ''}
                    </Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 5}]}>
                    <TouchableOpacity onPress={handlePOStatus}>
                      <ProgressBar
                        percentage={POPercentage}
                        color="rgba(78, 187, 242, 1)"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'center',
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {Math.round(POPercentage)}%
                    </Text>
                  </View>
                </View>

                <View style={[styles.table, {}]}>
                  <View style={styles.column}></View>

                  <View style={styles.column}></View>

                  <View style={[styles.column, {flexGrow: 5}]}>
                    <AnimatedStatusView
                      showStatus={showPOStatus}
                      data={dataPO}
                      slideAnim={slideAnimPO}
                    />
                  </View>

                  <View style={styles.column}></View>
                </View>
              </View>

              <View style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginStart: 15,
                    marginVertical: 5,
                    fontSize: 14,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                  Payment
                </Text>
              </View>

              <View style={{}}>
                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    flexDirection: 'row',
                    //paddingVertical: -10,
                  }}>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          alignSelf: 'center',
                          textAlign: 'center',
                          opacity: 0.8,
                        },
                      ]}>
                      PX
                    </Text>
                  </View>
                  <View style={[styles.column]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 2,
                          alignSelf: 'center',
                          textAlign: 'center',
                          opacity: 0.8,
                        },
                      ]}>
                      Paid
                    </Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 6}]}></View>
                </View>

                <View style={styles.table}>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {flex: 1, alignSelf: 'center', textAlign: 'center'},
                      ]}>
                      {dataPX && dataPX.TotalCount != null
                        ? dataPX.TotalCount
                        : ''}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {flex: 1, alignSelf: 'center', textAlign: 'center'},
                      ]}>
                      {dataPX && dataPX.CheckReleasedCount != null
                        ? dataPX.CheckReleasedCount
                        : ''}
                    </Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 5}]}>
                    <TouchableOpacity onPress={handlePXStatus}>
                      <ProgressBar
                        percentage={PXPercentage}
                        color="'rgba(247, 187, 56, 1)',"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.column, {}]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'center',
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {Math.round(PXPercentage)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.table}>
                  <View style={styles.column}></View>
                  <View style={styles.column}></View>
                  <View style={[styles.column, {flexGrow: 5}]}>
                    <AnimatedStatusView
                      showStatus={showPXStatus}
                      data={dataPX}
                      slideAnim={slideAnimPX}
                    />
                  </View>
                  <View style={styles.column}></View>
                </View>
              </View>
            </View>

            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 15,
                  paddingStart: 15,
                  padding: 10,
                }}></View>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0, 0.1)',
                }}>
                <View
                  style={{
                    paddingBottom: 20,
                  }}>
                  <View style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
                    <Text
                      style={{
                        fontFamily: 'Oswald-Regular',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginStart: 15,
                        marginVertical: 5,
                        fontSize: 14,
                        letterSpacing: 0.5,
                        //textTransform: 'uppercase',
                        //REG
                      }}>
                      Vouchers
                    </Text>
                  </View>

                  <View style={styles.table}>
                    <View style={styles.column}>
                      <Text
                        style={[
                          styles.text,
                          {
                            flex: 1,
                            alignSelf: 'center',
                            textAlign: 'right',
                            justifyContent: 'center',
                            marginStart: 20,
                            fontFamily: 'Oswald-Regular',
                          },
                        ]}>
                        {totalDocumentTypeCount}
                      </Text>
                    </View>
                    <View style={styles.column}>
                      <Text
                        style={[
                          styles.text,
                          {alignSelf: 'center', textAlign: 'center'},
                        ]}></Text>
                    </View>
                    <View style={[styles.column, {flexGrow: 5}]}>
                      <TouchableOpacity
                        onPress={() =>
                          setVisibleDocuments(prevState => !prevState)
                        }>
                        <ProgressBar
                          percentage={Math.round(percentage)}
                          color="rgba(223, 231, 248, 1)"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.column, {}]}>
                      <Text
                        style={[
                          styles.text,
                          {
                            flex: 1,
                            alignSelf: 'center',
                            textAlign: 'center',
                            fontFamily: 'Oswald-Regular',
                          },
                        ]}>
                        {Math.round(percentage)}%
                      </Text>
                    </View>
                  </View>
                </View>

                {visibleDocuments &&
                  othersVouchersData.map((item, index) => (
                    <View
                      key={index}
                      style={{backgroundColor: 'white', paddingBottom: 10}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          //backgroundColor: 'rgba(0,0,0,0.1)',
                          backgroundColor: 'rgba(223, 231, 248, 1)',
                        }}>
                        <View
                          style={{
                            justifyContent: 'center',
                            paddingVertical: 3,
                            margin: 2,
                            paddingStart: 15,
                          }}>
                          <Text
                            style={{
                              color: 'rgba(42, 42, 42, 1)',
                              fontFamily: 'Oswald-Regular',
                              textAlign: 'left',
                              alignItems: 'center',
                              alignContent: 'center',
                              textTransform: 'capitalize',
                            }}>
                            {item.DocumentType}
                          </Text>
                        </View>
                        <View style={[styles.column, {flexGrow: 6}]}></View>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            //color: 'white',
                            color: 'black',
                            fontSize: 14,
                            width: '35%',
                            fontFamily: 'Oswald-Regular',
                            textAlign: 'right',
                          }}>
                          {item.DocumentTypeCount}
                        </Text>
                        <View
                          style={{
                            flex: 5,
                            justifyContent: 'flex-end',
                            marginEnd: 5,
                          }}>
                          <TouchableOpacity
                            onPress={() => toggleVisibility(item.DocumentType)}>
                            <ProgressBarOthers
                              percentage={
                                ((item.StatusCounts.find(
                                  status => status.Status === 'Check Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                100
                              }
                              color={
                                ((item.StatusCounts.find(
                                  status => status.Status === 'Check Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                  100 ===
                                100
                                  ? 'orange'
                                  : '#448eed'
                              }
                            />
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={[
                            styles.text,
                            {
                              flex: 1,
                              alignSelf: 'center',
                              textAlign: 'center',
                              fontFamily: 'Oswald-Regular',
                              color: '#252525',
                            },
                          ]}>
                          {Math.round(
                            ((item.StatusCounts.find(
                              status => status.Status === 'Check Released',
                            )?.StatusCount || 0) /
                              parseInt(item.DocumentTypeCount, 10)) *
                              100,
                          )}
                          %
                        </Text>
                      </View>

                      {visibleStatusCounts[item.DocumentType] && (
                        <View style={[styles.table, {}]}>
                          <View style={styles.column}></View>

                          <View style={styles.column}></View>

                          <View style={[styles.column, {flexGrow: 5}]}>
                            <View style={{marginBottom: 10}}>
                              {item.StatusCounts.map(
                                (statusItem, statusIndex) => (
                                  <View
                                    key={statusIndex} // Moved key here
                                    style={{
                                      flexDirection: 'row',
                                      paddingStart: 20,
                                      paddingBottom: 10,
                                      justifyContent: 'flex-end',
                                      alignItems: 'center',
                                      borderRightWidth: 1,
                                      borderColor: 'silver',
                                    }}>
                                    <TouchableHighlight
                                      activeOpacity={0.5}
                                      underlayColor="rgba(223, 231, 248, 0.3)"
                                      style={{paddingHorizontal: 10}}
                                      onPress={() => {
                                        navigation.navigate('Others', {
                                          selectedItem: item.DocumentType,
                                          details:
                                            item.Details[statusItem.Status],
                                          loadingDetails,
                                        });
                                      }}>
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            color: '#252525',
                                            fontSize: 13,
                                            fontFamily: 'Oswald-Light',
                                            letterSpacing: 1,
                                            textAlign: 'right',
                                            //marginRight: 10, // Added margin for better spacing between text
                                          }}>
                                          {statusItem.Status}
                                        </Text>
                                        <Text
                                          style={{
                                            width: 30,
                                            color: '#252525',
                                            fontSize: 13,
                                            fontFamily: 'Oswald-Light',
                                            textAlign: 'right',
                                            letterSpacing: 1,
                                          }}>
                                          {statusItem.StatusCount}
                                        </Text>
                                      </View>
                                    </TouchableHighlight>
                                  </View>
                                ),
                              )}
                            </View>
                          </View>

                          <View style={styles.column}></View>
                        </View>
                      )}
                    </View>
                  ))}
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(0,0,0, 0.1)',
                }}>
                <View
                  style={{
                    paddingBottom: 20,
                  }}>
                  <View style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
                    <Text
                      style={{
                        fontFamily: 'Oswald-Regular',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginStart: 15,
                        marginVertical: 5,
                        fontSize: 14,
                        letterSpacing: 0.5,
                        //textTransform: 'uppercase',
                      }}>
                      Others
                    </Text>
                  </View>

                  <View style={styles.table}>
                    <View style={styles.column}>
                      <Text
                        style={[
                          styles.text,
                          {
                            flex: 1,
                            alignSelf: 'center',
                            textAlign: 'right',
                            justifyContent: 'center',
                            marginStart: 20,
                            fontFamily: 'Oswald-Regular',
                          },
                        ]}>
                        {totalDocumentTypeOthersCount}
                      </Text>
                    </View>
                    <View style={styles.column}>
                      <Text
                        style={[
                          styles.text,
                          {alignSelf: 'center', textAlign: 'center'},
                        ]}></Text>
                    </View>
                    <View style={[styles.column, {flexGrow: 5}]}>
                      <TouchableOpacity
                        onPress={() =>
                          setVisibleDocumentsOthers(prevState => !prevState)
                        }>
                        <ProgressBar
                          percentage={Math.round(percentageOthers)}
                          //color="rgba(255,255,255,0.8)"
                          color="rgba(255,255,255,0.8)"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.column, {}]}>
                      <Text
                        style={[
                          styles.text,
                          {
                            flex: 1,
                            alignSelf: 'center',
                            textAlign: 'center',
                            fontFamily: 'Oswald-Regular',
                          },
                        ]}>
                        {Math.round(percentageOthers)}%
                      </Text>
                    </View>
                  </View>
                </View>

                {visibleDocumentsOthers &&
                  othersOthersData.map((item, index) => (
                    <View
                      key={index}
                      style={{backgroundColor: 'white', paddingBottom: 10}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          //backgroundColor: 'rgba(0,0,0,0.1)',
                          backgroundColor: 'rgba(223, 231, 248, 1)',
                        }}>
                        <View
                          style={{
                            justifyContent: 'center',
                            paddingVertical: 3,
                            margin: 2,
                            paddingStart: 15,
                          }}>
                          <Text
                            style={{
                              color: 'rgba(42, 42, 42, 1)',
                              fontFamily: 'Oswald-Regular',
                              textAlign: 'left',
                              alignItems: 'center',
                              alignContent: 'center',
                              textTransform: 'capitalize',
                            }}>
                            {item.DocumentType}
                          </Text>
                        </View>
                        <View style={[styles.column, {flexGrow: 6}]}></View>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            //color: 'white',
                            color: 'black',
                            fontSize: 14,
                            width: '35%',
                            fontFamily: 'Oswald-Regular',
                            textAlign: 'right',
                          }}>
                          {item.DocumentTypeCount}
                        </Text>
                        <View
                          style={{
                            flex: 5,
                            justifyContent: 'flex-end',
                            marginEnd: 5,
                          }}>
                          <TouchableOpacity
                            onPress={() => toggleVisibility(item.DocumentType)}>
                            <ProgressBarOthers
                              percentage={
                                item.DocumentType === 'Liquidation'
                                  ? ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'CAO Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                    100
                                  : ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'Check Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                    100
                              }
                              color={
                                item.DocumentType === 'Liquidation'
                                  ? ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'CAO Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                      100 ===
                                    100
                                    ? 'orange'
                                    : '#448eed'
                                  : ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'Check Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                      100 ===
                                    100
                                  ? 'orange'
                                  : '#448eed'
                              }
                            />
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={[
                            styles.text,
                            {
                              flex: 1,
                              alignSelf: 'center',
                              textAlign: 'center',
                              fontFamily: 'Oswald-Regular',
                              color: '#252525',
                            },
                          ]}>
                          {Math.round(
                            item.DocumentType === 'Liquidation'
                              ? ((item.StatusCounts.find(
                                  status => status.Status === 'CAO Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                  100
                              : ((item.StatusCounts.find(
                                  status => status.Status === 'Check Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                  100,
                          )}
                          %
                        </Text>
                      </View>

                      {visibleStatusCounts[item.DocumentType] && (
                        <View style={[styles.table, {}]}>
                          <View style={styles.column}></View>

                          <View style={styles.column}></View>

                          <View style={[styles.column, {flexGrow: 5}]}>
                            <View style={{marginBottom: 10}}>
                              {item.StatusCounts.map(
                                (statusItem, statusIndex) => (
                                  <View
                                    key={statusIndex} // Moved key here
                                    style={{
                                      flexDirection: 'row',
                                      paddingStart: 20,
                                      paddingBottom: 10,
                                      justifyContent: 'flex-end',
                                      alignItems: 'center',
                                      borderRightWidth: 1,
                                      borderColor: 'silver',
                                    }}>
                                    <TouchableHighlight
                                      activeOpacity={0.5}
                                      underlayColor="rgba(223, 231, 248, 0.3)"
                                      style={{paddingHorizontal: 10}}
                                      onPress={() => {
                                        navigation.navigate('Others', {
                                          selectedItem: item.DocumentType,
                                          details:
                                            item.Details[statusItem.Status],
                                          loadingDetails,
                                        });
                                      }}>
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{
                                            color: '#252525',
                                            fontSize: 13,
                                            fontFamily: 'Oswald-Light',
                                            letterSpacing: 1,
                                            textAlign: 'right',
                                            //marginRight: 10, // Added margin for better spacing between text
                                          }}>
                                          {statusItem.Status}
                                        </Text>
                                        <Text
                                          style={{
                                            width: 30,
                                            color: '#252525',
                                            fontSize: 13,
                                            fontFamily: 'Oswald-Light',
                                            textAlign: 'right',
                                            letterSpacing: 1,
                                          }}>
                                          {statusItem.StatusCount}
                                        </Text>
                                      </View>
                                    </TouchableHighlight>
                                  </View>
                                ),
                              )}
                            </View>
                          </View>

                          <View style={styles.column}></View>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            </View>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              flexGrow: 1,
              marginTop: 10,
              marginBottom: 10,
            }}>
            <View style={{width: '100%'}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleRecentUpdated}>
                <View
                  style={{
                    backgroundColor: 'transparent',
                    width: '100%',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: 10,
                    }}>
                    RECENTLY UPDATED
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text
                        style={{
                          textAlign: 'left',
                          fontSize: 80,
                          fontFamily: 'Oswald-Bold',
                          color: 'white',
                          lineHeight: 100,
                          textShadowRadius: 1,
                          textShadowOffset: {width: 2, height: 4},
                          marginBottom: -25,
                        }}>
                        {updatedNowData ? updatedNowData : 0}
                      </Text>
                    </View>
                    {updatedDateTime && updatedDateTime !== 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          justifyContent: 'flex-end',
                          right: 10,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-ExtraLight',
                            fontSize: 12,
                            color: 'silver',
                          }}>
                          Last Updated:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 12,
                            color: 'silver',
                          }}>
                          {updatedDateTime ? updatedDateTime : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    alignSelf: 'flex-end',
                    marginTop: 15,
                    marginEnd: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                  }}></View>
              </Pressable>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              columnGap: 10,
            }}>
            <View style={{flex: 1}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleMyTransactions}>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 10,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                    MY PERSONAL
                  </Text>
                  <Text
                    style={{
                      fontSize: 70,
                      //backgroundColor:'red',
                      lineHeight: 90,
                      fontFamily: 'Oswald-Bold',
                      color: 'rgba(255, 255, 255, 1)',
                      textShadowRadius: 1,
                      textShadowOffset: {width: 2, height: 4},
                    }}>
                    {myTransactionsLength ? myTransactionsLength : 0}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={{flex: 1}}>
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                onPress={handleOfficeDelays}>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 10,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>
                    OFFICE DELAYS
                  </Text>

                  <Text
                    style={{
                      fontSize: 70,
                      //backgroundColor:'red',
                      lineHeight: 90,
                      fontFamily: 'Oswald-Bold',
                      color: 'rgba(255, 255, 255, 1)',
                      textShadowRadius: 1,
                      textShadowOffset: {width: 2, height: 4},
                    }}>
                    {officeDelaysLength ? officeDelaysLength : 0}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 15,
              paddingStart: 15,
              padding: 10,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Oswald-Light',
                letterSpacing: 2,
                fontSize: 16,
                textTransform: 'uppercase',
              }}>
              Procurement Progress
            </Text>
            {loadingTransSum && (
              <ActivityIndicator size="small" color="white" />
            )}
            <View style={{}}>
              <YearDropdown
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
            </View>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0, 0.1)',
              paddingBottom: 10,
            }}>
            <View style={{backgroundColor: 'rgba(0,0,0, 0.1)'}}>
              <Text
                style={{
                  fontFamily: 'Oswald-Regular',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginStart: 15,
                  marginVertical: 5,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                Purchase Request
              </Text>
            </View>

            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  //paddingVertical: -10,
                }}>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        alignSelf: 'center',
                        textAlign: 'center',
                        opacity: 0.8,
                      },
                    ]}>
                    PR
                  </Text>
                </View>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 2,
                        alignSelf: 'center',
                        textAlign: 'center',
                        opacity: 0.8,
                      },
                    ]}>
                    Completed
                  </Text>
                </View>
                <View style={[styles.column, {flexGrow: 6}]}></View>
              </View>

              <View style={[styles.table, {}]}>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        alignSelf: 'center',
                        textAlign: 'center',
                      },
                    ]}>
                    {dataPR && dataPR.TotalCount != null
                      ? dataPR.TotalCount
                      : ''}
                  </Text>
                </View>

                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {flex: 2, alignSelf: 'center', textAlign: 'center'},
                    ]}>
                    {dataPR && dataPR.ForPOCount != null
                      ? dataPR.ForPOCount
                      : ''}
                  </Text>
                </View>
                <View style={[styles.column, {flexGrow: 5}]}>
                  <TouchableOpacity onPress={handlePRStatus}>
                    <ProgressBar
                      percentage={PRPercentage}
                      color="'rgba(36, 165, 6, 1)',"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.column}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 1,
                        alignSelf: 'center',
                        textAlign: 'center',
                        fontFamily: 'Oswald-Regular',
                      },
                    ]}>
                    {Math.round(PRPercentage)}%
                  </Text>
                </View>
              </View>

              <View style={[styles.table, {}]}>
                <View style={styles.column}></View>

                <View style={styles.column}></View>

                <View style={[styles.column, {flexGrow: 5}]}>
                  <AnimatedStatusView
                    showStatus={showPRStatus}
                    data={dataPR}
                    slideAnim={slideAnimPR}
                  />
                </View>

                <View style={styles.column}></View>
              </View>
            </View>

            <View style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
              <Text
                style={{
                  fontFamily: 'Oswald-Regular',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginStart: 15,
                  marginVertical: 5,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                Purchase Order
              </Text>
            </View>

            <View style={{}}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  //paddingVertical: -10,
                }}>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        alignSelf: 'center',
                        textAlign: 'center',
                        opacity: 0.8,
                      },
                    ]}>
                    PO
                  </Text>
                </View>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 2,
                        alignSelf: 'center',
                        textAlign: 'center',
                        opacity: 0.8,
                      },
                    ]}>
                    Completed
                  </Text>
                </View>
                <View style={[styles.column, {flexGrow: 6}]}></View>
              </View>

              <View style={styles.table}>
                <View style={styles.column}>
                  <Text
                    style={[
                      styles.text,
                      {alignSelf: 'center', textAlign: 'center'},
                    ]}>
                    {dataPO && dataPO.TotalCount != null
                      ? dataPO.TotalCount
                      : ''}
                  </Text>
                </View>
                <View style={styles.column}>
                  <Text
                    style={[
                      styles.text,
                      {flex: 2, alignSelf: 'center', textAlign: 'center'},
                    ]}>
                    {dataPO && dataPO.WaitingForDeliveryCount != null
                      ? dataPO.WaitingForDeliveryCount
                      : ''}
                  </Text>
                </View>
                <View style={[styles.column, {flexGrow: 5}]}>
                  <TouchableOpacity onPress={handlePOStatus}>
                    <ProgressBar
                      percentage={POPercentage}
                      color="rgba(78, 187, 242, 1)"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.column}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 1,
                        alignSelf: 'center',
                        textAlign: 'center',
                        fontFamily: 'Oswald-Regular',
                      },
                    ]}>
                    {Math.round(POPercentage)}%
                  </Text>
                </View>
              </View>

              <View style={[styles.table, {}]}>
                <View style={styles.column}></View>

                <View style={styles.column}></View>

                <View style={[styles.column, {flexGrow: 5}]}>
                  <AnimatedStatusView
                    showStatus={showPOStatus}
                    data={dataPO}
                    slideAnim={slideAnimPO}
                  />
                </View>

                <View style={styles.column}></View>
              </View>
            </View>

            <View style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
              <Text
                style={{
                  fontFamily: 'Oswald-Regular',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginStart: 15,
                  marginVertical: 5,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                Payment
              </Text>
            </View>

            <View style={{}}>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  flexDirection: 'row',
                  //paddingVertical: -10,
                }}>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        alignSelf: 'center',
                        textAlign: 'center',
                        opacity: 0.8,
                      },
                    ]}>
                    PX
                  </Text>
                </View>
                <View style={[styles.column]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 2,
                        alignSelf: 'center',
                        textAlign: 'center',
                        opacity: 0.8,
                      },
                    ]}>
                    Paid
                  </Text>
                </View>
                <View style={[styles.column, {flexGrow: 6}]}></View>
              </View>

              <View style={styles.table}>
                <View style={styles.column}>
                  <Text
                    style={[
                      styles.text,
                      {flex: 1, alignSelf: 'center', textAlign: 'center'},
                    ]}>
                    {dataPX && dataPX.TotalCount != null
                      ? dataPX.TotalCount
                      : ''}
                  </Text>
                </View>
                <View style={styles.column}>
                  <Text
                    style={[
                      styles.text,
                      {flex: 1, alignSelf: 'center', textAlign: 'center'},
                    ]}>
                    {dataPX && dataPX.CheckReleasedCount != null
                      ? dataPX.CheckReleasedCount
                      : ''}
                  </Text>
                </View>
                <View style={[styles.column, {flexGrow: 5}]}>
                  <TouchableOpacity onPress={handlePXStatus}>
                    <ProgressBar
                      percentage={PXPercentage}
                      color="'rgba(247, 187, 56, 1)',"
                    />
                  </TouchableOpacity>
                </View>
                <View style={[styles.column, {}]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        flex: 1,
                        alignSelf: 'center',
                        textAlign: 'center',
                        fontFamily: 'Oswald-Regular',
                      },
                    ]}>
                    {Math.round(PXPercentage)}%
                  </Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.column}></View>
                <View style={styles.column}></View>
                <View style={[styles.column, {flexGrow: 5}]}>
                  <AnimatedStatusView
                    showStatus={showPXStatus}
                    data={dataPX}
                    slideAnim={slideAnimPX}
                  />
                </View>
                <View style={styles.column}></View>
              </View>
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 15,
                paddingStart: 15,
                padding: 10,
                //NON REG
              }}>
              {/*               <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                    letterSpacing: 2,
                    fontSize: 16,
                    textTransform: 'uppercase',
                  }}>
                  Others
                </Text> */}
            </View>

            <View
              style={{
                backgroundColor: 'rgba(0,0,0, 0.1)',
              }}>
              <View
                style={{
                  //backgroundColor: 'rgba(37, 89, 200, 1)'
                  paddingBottom: 20,
                }}>
                <View style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginStart: 15,
                      marginVertical: 5,
                      fontSize: 14,
                      letterSpacing: 0.5,
                      //textTransform: 'uppercase',
                    }}>
                    Vouchers
                  </Text>
                </View>

                <View style={styles.table}>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'right',
                          justifyContent: 'center',
                          marginStart: 20,
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {totalDocumentTypeCount}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {alignSelf: 'center', textAlign: 'center'},
                      ]}></Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 5}]}>
                    <TouchableOpacity
                      onPress={() =>
                        setVisibleDocuments(prevState => !prevState)
                      }>
                      <ProgressBar
                        percentage={Math.round(percentage)}
                        color="rgba(223, 231, 248, 1)"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.column, {}]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'center',
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {Math.round(percentage)}%
                    </Text>
                  </View>
                </View>
              </View>

              {visibleDocuments &&
                othersVouchersData.map((item, index) => (
                  <View
                    key={index}
                    style={{backgroundColor: 'white', paddingBottom: 10}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        //backgroundColor: 'rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(223, 231, 248, 1)',
                      }}>
                      <View
                        style={{
                          justifyContent: 'center',
                          paddingVertical: 3,
                          margin: 2,
                          paddingStart: 15,
                        }}>
                        <Text
                          style={{
                            color: 'rgba(42, 42, 42, 1)',
                            fontFamily: 'Oswald-Regular',
                            textAlign: 'left',
                            alignItems: 'center',
                            alignContent: 'center',
                            textTransform: 'capitalize',
                          }}>
                          {item.DocumentType}
                        </Text>
                      </View>
                      <View style={[styles.column, {flexGrow: 6}]}></View>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          //color: 'white',
                          color: 'black',
                          fontSize: 14,
                          width: '35%',
                          fontFamily: 'Oswald-Regular',
                          textAlign: 'right',
                        }}>
                        {item.DocumentTypeCount}
                      </Text>
                      <View
                        style={{
                          flex: 5,
                          justifyContent: 'flex-end',
                          marginEnd: 5,
                        }}>
                       <TouchableOpacity
                            onPress={() => toggleVisibility(item.DocumentType)}>
                            <ProgressBarOthers
                              percentage={
                                ((item.StatusCounts.find(
                                  status => status.Status === 'Check Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                100
                              }
                              color={
                                ((item.StatusCounts.find(
                                  status => status.Status === 'Check Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                  100 ===
                                100
                                  ? 'orange'
                                  : '#448eed'
                              }
                            />
                          </TouchableOpacity>
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'right',
                          fontFamily: 'Oswald-Regular',
                          color: 'rgba(42, 42, 42, 1)',
                        }}>
                        {Math.round(
                          // Calculate the sum of counts for both 'Check Released' and 'CAO Released'
                          ((parseInt(
                            item.StatusCounts.find(
                              status => status.Status === 'Check Released',
                            )?.StatusCount || 0,
                          ) +
                            (item.DocumentType === 'Liquidation'
                              ? parseInt(
                                  item.StatusCounts.find(
                                    status => status.Status === 'CAO Released',
                                  )?.StatusCount || 0,
                                )
                              : 0)) /
                            parseInt(item.DocumentTypeCount, 10)) *
                            100,
                        )}
                        %
                      </Text>
                    </View>

                    {visibleStatusCounts[item.DocumentType] && (
                      <View style={[styles.table, {}]}>
                        <View style={styles.column}></View>

                        <View style={styles.column}></View>

                        <View style={[styles.column, {flexGrow: 5}]}>
                          <View style={{marginBottom: 10}}>
                            {item.StatusCounts.map(
                              (statusItem, statusIndex) => (
                                <View
                                  key={statusIndex} // Moved key here
                                  style={{
                                    flexDirection: 'row',
                                    paddingStart: 20,
                                    paddingBottom: 10,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    borderRightWidth: 1,
                                    borderColor: 'silver',
                                  }}>
                                  <TouchableHighlight
                                    activeOpacity={0.5}
                                    underlayColor="rgba(223, 231, 248, 0.3)"
                                    style={{paddingHorizontal: 10}}
                                    onPress={() => {
                                      navigation.navigate('Others', {
                                        selectedItem: item.DocumentType,
                                        details:
                                          item.Details[statusItem.Status],
                                        loadingDetails,
                                      });
                                    }}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                      }}>
                                      <Text
                                        style={{
                                          color: '#252525',
                                          fontSize: 13,
                                          fontFamily: 'Oswald-Light',
                                          letterSpacing: 1,
                                          textAlign: 'right',
                                          //marginRight: 10, // Added margin for better spacing between text
                                        }}>
                                        {statusItem.Status}
                                      </Text>
                                      <Text
                                        style={{
                                          width: 30,
                                          color: '#252525',
                                          fontSize: 13,
                                          fontFamily: 'Oswald-Light',
                                          textAlign: 'right',
                                          letterSpacing: 1,
                                        }}>
                                        {statusItem.StatusCount}
                                      </Text>
                                    </View>
                                  </TouchableHighlight>
                                </View>
                              ),
                            )}
                          </View>
                        </View>

                        <View style={styles.column}></View>
                      </View>
                    )}
                  </View>
                ))}
            </View>

            <View
              style={{
                backgroundColor: 'rgba(0,0,0, 0.1)',
                //backgroundColor: 'white',
                //shadowRadius: 5,
                //shadowColor: 'white',
                //elevation: 10,
                //borderWidth: 1,
                //borderColor: 'white'
                //backgroundColor :'rgba(37, 89, 200, 1)'
              }}>
              <View
                style={{
                  //backgroundColor: 'white',
                  //backgroundColor: 'rgba(37, 89, 200, 1)'
                  paddingBottom: 20,
                }}>
                <View style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginStart: 15,
                      marginVertical: 5,
                      fontSize: 14,
                      letterSpacing: 0.5,
                      //textTransform: 'uppercase',
                    }}>
                    Others
                  </Text>
                </View>

                <View style={styles.table}>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'right',
                          justifyContent: 'center',
                          marginStart: 20,
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {totalDocumentTypeOthersCount}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text
                      style={[
                        styles.text,
                        {alignSelf: 'center', textAlign: 'center'},
                      ]}></Text>
                  </View>
                  <View style={[styles.column, {flexGrow: 5}]}>
                    <TouchableOpacity
                      onPress={() =>
                        setVisibleDocumentsOthers(prevState => !prevState)
                      }>
                      <ProgressBar
                        percentage={Math.round(percentageOthers)}
                        //color="rgba(255,255,255,0.8)"
                        color="rgba(255,255,255,0.8)"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.column, {}]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          flex: 1,
                          alignSelf: 'center',
                          textAlign: 'center',
                          fontFamily: 'Oswald-Regular',
                        },
                      ]}>
                      {Math.round(percentageOthers)}%
                    </Text>
                  </View>
                </View>
              </View>

              {visibleDocumentsOthers &&
                othersOthersData.map((item, index) => (
                  <View
                    key={index}
                    style={{backgroundColor: 'white', paddingBottom: 10}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        //backgroundColor: 'rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(223, 231, 248, 1)',
                      }}>
                      <View
                        style={{
                          justifyContent: 'center',
                          paddingVertical: 3,
                          margin: 2,
                          paddingStart: 15,
                        }}>
                        <Text
                          style={{
                            color: 'rgba(42, 42, 42, 1)',
                            fontFamily: 'Oswald-Regular',
                            textAlign: 'left',
                            alignItems: 'center',
                            alignContent: 'center',
                            textTransform: 'capitalize',
                          }}>
                          {item.DocumentType}
                        </Text>
                      </View>
                      <View style={[styles.column, {flexGrow: 6}]}></View>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          //color: 'white',
                          color: 'black',
                          fontSize: 14,
                          width: '35%',
                          fontFamily: 'Oswald-Regular',
                          textAlign: 'right',
                        }}>
                        {item.DocumentTypeCount}
                      </Text>
                      <View
                        style={{
                          flex: 5,
                          justifyContent: 'flex-end',
                          marginEnd: 5,
                        }}>
                       <TouchableOpacity
                            onPress={() => toggleVisibility(item.DocumentType)}>
                            <ProgressBarOthers
                              percentage={
                                item.DocumentType === 'Liquidation'
                                  ? ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'CAO Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                    100
                                  : ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'Check Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                    100
                              }
                              color={
                                item.DocumentType === 'Liquidation'
                                  ? ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'CAO Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                      100 ===
                                    100
                                    ? 'orange'
                                    : '#448eed'
                                  : ((item.StatusCounts.find(
                                      status =>
                                        status.Status === 'Check Released',
                                    )?.StatusCount || 0) /
                                      parseInt(item.DocumentTypeCount, 10)) *
                                      100 ===
                                    100
                                  ? 'orange'
                                  : '#448eed'
                              }
                            />
                          </TouchableOpacity>
                      </View>
                      <Text
                        style={[
                          styles.text,
                          {
                            flex: 1,
                            alignSelf: 'center',
                            textAlign: 'center',
                            fontFamily: 'Oswald-Regular',
                            color: '#252525',
                          },
                        ]}>
                        {Math.round(
                          item.DocumentType === 'Liquidation'
                            ? ((item.StatusCounts.find(
                                status => status.Status === 'CAO Released',
                              )?.StatusCount || 0) /
                                parseInt(item.DocumentTypeCount, 10)) *
                                100
                            : ((item.StatusCounts.find(
                                status => status.Status === 'Check Released',
                              )?.StatusCount || 0) /
                                parseInt(item.DocumentTypeCount, 10)) *
                                100,
                        )}
                        %
                      </Text>
                    </View>

                    {visibleStatusCounts[item.DocumentType] && (
                      <View style={[styles.table, {}]}>
                        <View style={styles.column}></View>

                        <View style={styles.column}></View>

                        <View style={[styles.column, {flexGrow: 5}]}>
                          <View style={{marginBottom: 10}}>
                            {item.StatusCounts.map(
                              (statusItem, statusIndex) => (
                                <View
                                  key={statusIndex} // Moved key here
                                  style={{
                                    flexDirection: 'row',
                                    paddingStart: 20,
                                    paddingBottom: 10,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    borderRightWidth: 1,
                                    borderColor: 'silver',
                                  }}>
                                  <TouchableHighlight
                                    activeOpacity={0.5}
                                    underlayColor="rgba(223, 231, 248, 0.3)"
                                    style={{paddingHorizontal: 10}}
                                    onPress={() => {
                                      navigation.navigate('Others', {
                                        selectedItem: item.DocumentType,
                                        details:
                                          item.Details[statusItem.Status],
                                        loadingDetails,
                                      });
                                    }}>
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                      }}>
                                      <Text
                                        style={{
                                          color: '#252525',
                                          fontSize: 13,
                                          fontFamily: 'Oswald-Light',
                                          letterSpacing: 1,
                                          textAlign: 'right',
                                          //marginRight: 10, // Added margin for better spacing between text
                                        }}>
                                        {statusItem.Status}
                                      </Text>
                                      <Text
                                        style={{
                                          width: 30,
                                          color: '#252525',
                                          fontSize: 13,
                                          fontFamily: 'Oswald-Light',
                                          textAlign: 'right',
                                          letterSpacing: 1,
                                        }}>
                                        {statusItem.StatusCount}
                                      </Text>
                                    </View>
                                  </TouchableHighlight>
                                </View>
                              ),
                            )}
                          </View>
                        </View>

                        <View style={styles.column}></View>
                      </View>
                    )}
                  </View>
                ))}
            </View>
          </View>
        </>
      );
    }
  });

  const renderInspectionGSO = () => {
    return (
      <View>
        {/* Sample view when privilege is 5 for office code 1061 */}
        {/*   <Text> Privilege: 5 for GSO.</Text> */}

        <View
          style={{
            columnGap: 10,
            justifyContent: 'center',
            flexDirection: 'row',
            alignSelf: 'center',
          }}>
          <View style={{flex: 1}}>
            <Pressable
              style={({pressed}) => [
                {
                  backgroundColor: pressed
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                },
              ]}
              android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
              onPress={handleMyTransactions}>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    fontSize: 14,
                    width: '100%',
                    textAlign: 'center',
                    marginTop: 10,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                  MY PERSONAL
                </Text>
                <Text
                  style={{
                    fontSize: 70,
                    //backgroundColor:'red',
                    lineHeight: 90,
                    fontFamily: 'Oswald-Bold',
                    color: 'rgba(255, 255, 255, 1)',
                    textShadowRadius: 1,
                    textShadowOffset: {width: 2, height: 4},
                  }}>
                  {myTransactionsLength ? myTransactionsLength : 0}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={{flex: 1}}>
            <Pressable
              style={({pressed}) => [
                {
                  backgroundColor: pressed
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                },
              ]}
              android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
              onPress={handleInspection}>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    fontSize: 14,
                    width: '100%',
                    textAlign: 'center',
                    marginTop: 10,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                  FOR INSPECTION
                </Text>

                <Text
                  style={{
                    fontSize: 50,
                    //backgroundColor:'red',
                    lineHeight: 90,
                    fontFamily: 'Oswald-Bold',
                    color: 'rgba(255, 255, 255, 1)',
                    textShadowRadius: 1,
                    textShadowOffset: {width: 2, height: 4},
                  }}>
                  {/* {officeDelaysLength ? officeDelaysLength : 0} */}
                  {56331}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderInspectionCEO = () => {
    return (
      <View>
        {/* Sample view when privilege is 5 for office code 1061 */}
        <Text>You have privilege level 5 for CEO.</Text>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView
        style={{flex: 1, backgroundColor: 'rgba(223, 231, 248, 1)'}}>
        <ImageBackground
          source={require('../../assets/images/docmobileBG.png')}
          style={{flex: 1, paddingTop: 95}}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {privilege === '5' && officeCode === '1061' ? (
              <View>{renderInspectionGSO()}</View>
            ) : privilege === '5' && officeCode === '8751' ? (
              <View>{renderInspectionCEO()}</View>
            ) : (
              renderContent()
            )}

            <View style={{height: 500}}></View>
          </ScrollView>

          <LoadingModal visible={isModalVisible} />
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEFF2',
  },
  scrollViewContent: {
    paddingHorizontal: 10,
  },
  userInfoText: {
    color: 'yellow',
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tnEntry: {
    marginTop: 10,
    padding: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },
  iconContainer: {
    backgroundColor: 'gray',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  menuIcon: {
    marginRight: 40,
    marginLeft: 20,
  },
  docSearch: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  label: {
    width: '22%',
    marginRight: 10,
    textAlign: 'right',
  },
  value: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '80%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showMore: {
    alignItems: 'flex-end',
  },
  showMoreContainer: {
    flexDirection: 'row',
  },
  showMoreText: {
    color: 'darkblue',
    fontSize: 14,
    marginLeft: 5,
  },
  note: {
    backgroundColor: 'skygray',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
  },
  history: {},
  historyTableHeader: {
    backgroundColor: 'darkgray',
    flexDirection: 'row',
    gap: 100,
  },
  historyData: {
    flexDirection: 'row',
  },
  summary: {
    backgroundColor: 'white',
    borderWidth: 1,
  },
  myTracker: {
    width: '20%',
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5,
  },
  myOfficeTracker: {
    width: '20%',
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5,
  },
  radialGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:
      Math.round(
        Dimensions.get('window').width + Dimensions.get('window').height,
      ) / 2,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  graphStyle: {
    transform: [{rotate: '90deg'}],
    borderRadius: 20,
  },

  table: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 3,
    margin: 2,
    borderRadius: 5,
  },
  text: {
    width: 55,
    color: 'white',
    fontFamily: 'Oswald-Light',
    textAlign: 'left',
    alignItems: 'center',
    alignContent: 'center',
  },
  progressBarContainer: {
    marginStart: 20,
    width: '90%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  progressBarContainerOthers: {
    width: '90%',
    height: 10,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(38, 102, 210, 0.3)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Oswald-Regular',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  animPR: {
    height: 100,
  },
  dropdown: {
    width: 80,
    paddingHorizontal: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  activityIndicatorWrapper: {
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DoctrackScreen;
