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
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  TouchableHighlight,
  StatusBar,
  ImageBackground,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Image} from 'react-native-ui-lib';
import {useQueryClient} from '@tanstack/react-query';
import {useInspectorImages} from '../hooks/useInspection';
import CustomModal from '../components/CustomModal';
import RecentActivity from './inspector/RecentActivity';

const DoctrackScreen = ({
  myTransactionsLength,
  officeDelaysLength,
  updatedNowData,
  regOfficeDelaysLength,
  officeCode,
  accountType,
  caoReceiver,
  caoEvaluator,
  officeName,
  privilege,
  permission,
  officeAdmin,
  gsoInspection,
  procurement,
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
  loadingUseOthers,
  selectedYear,
  fetchDataRegOfficeDelays,
  refetchDataOthers,
  fetchOfficeDelays,
  fetchMyPersonal,
  fetchTransactionSummary,
  othersVouchersData,
  othersOthersData,
  loadingDetails,
  forInspection,
  inspected,
  inspectionOnHold,
  receivingCountData,
  trackSumData,
  trackSumError,
  trackSumLoading,
  regTrackSumData,
  accountabilityData,
  fetchMyAccountability,
  requestsLength,
  requestsLoading,
  fetchRequests,
  OnScheduleLength,
  onEvalDataCount,
  evaluatedDataCount,
  evalPendingDataCount,
  evalPendingReleasedCount,
  evaluatorSummary,
  recentActivityData,
  recentActivityError,
  recentActivityLoading,
}) => {
  const [showPRStatus, setShowPRStatus] = useState(false);
  const [showPOStatus, setShowPOStatus] = useState(false);
  const [showPXStatus, setShowPXStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSetModalVisible, setSetModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const navigation = useNavigation();

  const openModal = () => {
    setSetModalVisible(true);
  };

  const closeModal = () => {
    setSetModalVisible(false);
  };

  const getSumOfDocumentTypeCount = data => {
    if (!data || !Array.isArray(data)) {
      return 0;
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
      return 0;
    }
    return (checkReleasedCount / totalDocumentTypeCount) * 100;
  };

  const getPercentageOthers = (
    checkReleasedCount,
    caoReleasedOthersCount,
    totalDocumentTypeCount,
  ) => {
    if (totalDocumentTypeCount === 0) {
      return 0;
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
  const [visibleDocuments, setVisibleDocuments] = useState(false);
  const [visibleDocumentsOthers, setVisibleDocumentsOthers] = useState(false);

  const toggleVisibility = documentType => {
    setVisibleStatusCounts(prevState => ({
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
              borderColor: 'rgba(197, 197, 197, 0.2)',
              backgroundColor: 'rgba(221, 221, 221, 0.23)',
              paddingEnd: 20,
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
                        color: '#252525',
                        fontSize: 11,
                        fontFamily: 'Inter_28pt-Regular',
                        letterSpacing: 1,
                        opacity: 0.5,
                        textAlign: 'right',
                      }}>
                      {item.Status}
                    </Text>
                    <Text
                      style={{
                        width: 30,
                        color: '#252525',
                        fontSize: 13,
                        fontFamily: 'Inter_28pt-Regular',
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
                    color: 'black',
                    fontSize: 13,
                    fontFamily: 'Inter_28pt-Regular',
                    opacity: 0.5,
                    textAlign: 'right',
                    marginEnd: 10,
                    paddingVertical: 10,
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
        fetchMyAccountability(),
        refetchDataOthers(),
        receivingCountData,
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
        setModalVisible(false);
      }, 3000);
    }
  }, []);

  const onRefreshInspector = useCallback(async () => {
    setRefreshing(true);
    setModalVisible(true);

    try {
      await Promise.all([
        fetchMyPersonal(),
        fetchMyAccountability(),
        fetchRequests(),
      ]);

      queryClient.invalidateQueries({queryKey: ['inspection']});
      queryClient.invalidateQueries({queryKey: ['inspectionRequest']});
      queryClient.invalidateQueries({queryKey: ['onSchedule']});
      queryClient.invalidateQueries({queryKey: ['inspectionRecentActivity']});
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
        setModalVisible(false);
      }, 3000);
    }
  }, []);

  const selectedOnRefresh = useCallback(() => {
    if (gsoInspection === '1') {
      return onRefreshInspector();
    } else {
      return onRefresh();
    }
  }, [permission, onRefresh, onRefreshInspector]);

  const handlePRStatus = useCallback(() => {
    setShowPRStatus(prevState => !prevState);
  }, []);

  const handlePOStatus = useCallback(() => {
    setShowPOStatus(prevState => !prevState);
  }, []);

  const handlePXStatus = useCallback(() => {
    setShowPXStatus(prevState => !prevState);
  }, []);

  const slideAnimPR = useRef(new Animated.Value(-100)).current;
  const slideAnimPO = useRef(new Animated.Value(-100)).current;
  const slideAnimPX = useRef(new Animated.Value(-100)).current;

  const [showAll, setShowAll] = useState(false);

  const renderUI = useCallback(() => {
    const itemsToShowTrackSum = showAll
      ? trackSumData
      : trackSumData?.slice(0, 5);

    const itemsToShowRegTrackSum = showAll
      ? regTrackSumData
      : regTrackSumData?.slice(0, 5);

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 10,
        }}>
        <View>
          {caoReceiver === '1' || caoEvaluator === '1' ? (
            <>
              <View
                style={{
                  padding: 10,
                    marginTop: 15,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    /*  shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84, */
                    elevation: 1,
                    /*  borderBottomWidth: 1,
                    borderBottomColor: 'silver',
                    borderRightWidth: 1,
                    borderRightColor: 'silver', */
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    paddingBottom: 5,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_28pt-SemiBold',
                      color: '#252525',
                      paddingHorizontal: 10,
                      fontSize: 16,
                    }}>
                    Transaction Counter
                  </Text>
                </View>

                {caoReceiver === '1' && (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {[
                        {
                          label: 'Total Received',
                          count: receivingCountData?.TotalReceived,
                        },
                        {
                          label: 'Received Today',
                          count: receivingCountData?.ReceivedToday,
                        },
                        {
                          label: 'Received This Month',
                          count:
                            receivingCountData?.ReceivedPerMonth?.[0]?.Count,
                        },
                      ].map((item, index) => {
                        const isReceivedThisMonth =
                          item.label === 'Received This Month';
                        return (
                          <Pressable
                            key={index}
                            onPress={
                              isReceivedThisMonth ? openModal : undefined
                            }
                            android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}
                            style={({pressed}) => ({
                              width: '30%',
                              alignItems: 'center',
                              paddingVertical: 10,
                              marginBottom: 10,
                              borderRadius: 5,
                              elevation: 1,
                              backgroundColor: pressed ? '#007bff' : '#ffffff',
                              borderBottomWidth: 2,
                              borderBottomColor: 'silver',
                              borderRightWidth: 2,
                              borderRightColor: 'silver',
                            })}>
                            {({pressed}) => (
                              <>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#007bff',
                                    fontFamily: 'Inter_28pt-Bold',
                                    fontSize: 22,
                                  }}>
                                  {item.count ?? 0}
                                </Text>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#252525',
                                    fontFamily: 'Oswald-Light',
                                    fontSize: 10,

                                    marginTop: 0,
                                  }}>
                                  {item.label}
                                </Text>
                              </>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
                {caoEvaluator === '1' && (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {[
                        {
                          label: 'On Evaluation',
                          screen: 'OnEvaluation',
                          length: onEvalDataCount,
                        },
                        {
                          label: 'Evaluated',
                          screen: 'Evaluated',
                          length: evaluatedDataCount,
                        },
                        {
                          label: 'Pending',
                          screen: 'EvalPending',
                          length: evalPendingDataCount,
                        },
                        {
                          label: 'Pending Released',
                          screen: 'EvalPendingReleased',
                          length: evalPendingReleasedCount,
                        },
                      ].map((item, index) => (
                        <Pressable
                          key={index}
                          onPress={() =>
                            navigation.navigate(item.screen, {
                              ...item,
                              selectedYear,
                            })
                          }
                          style={({pressed}) => ({
                            width: '30%',
                            alignItems: 'center',
                            paddingVertical: 10,
                            marginBottom: 10,
                            borderRadius: 5,
                            elevation: 1,
                            backgroundColor: pressed ? '#007bff' : '#ffffff',
                            borderBottomWidth: 2,
                            borderBottomColor: 'silver',
                            borderRightWidth: 2,
                            borderRightColor: 'silver',
                          })}
                          android_ripple={{}}>
                          {({pressed}) => (
                            <>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#007bff',
                                  fontFamily: 'Inter_28pt-Bold',
                                  fontSize: 22,
                                }}>
                                {item.length}
                              </Text>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#252525',
                                  fontFamily: 'Oswald-Light',
                                  fontSize: 10,
                                  marginTop: 0,
                                }}>
                                {item.label}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* <View
                style={{
                  padding: 10,
                  marginTop: 10,
                  backgroundColor: 'white',
                  borderRadius: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: 'silver',
                  borderRightWidth: 1,
                  borderRightColor: 'silver',
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    paddingBottom: 5,
                    marginBottom: 5,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_28pt-SemiBold',
                      color: '#252525',
                      fontSize: 16,
                      paddingHorizontal: 10,
                    }}>
                    Transaction Summary
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginTop: 5,
                    gap: 10,
                  }}>
                  {requestsLoading ? (
                    <View
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
                      <Text style={{ fontSize: 16, color: '#252525' }}>
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {[
                        {
                          label: 'Daily',
                          screen: 'EvalDaily',
                          icon: 'calendar-today', 
                        },
                        {
                          label: 'Monthly',
                          screen: 'EvalMonthly',
                          icon: 'calendar-month', 
                        },
                        {
                          label: 'Annual',
                          screen: 'EvalAnnual',
                          icon: 'calendar',
                        },
                      ].map((item, index, arr) => (
                        <Pressable
                          key={index}
                          onPress={() =>
                            navigation.navigate(item.screen, {
                              ...item,
                              selectedYear,
                            })
                          }
                          style={({ pressed }) => [
                            {
                              width: arr.length === 3 ? '31%' : '31%',
                              alignItems: 'center',
                              paddingVertical: 10,
                              marginBottom: 10,
                              borderRadius: 5,
                              elevation: 5, // Android shadow
                              backgroundColor: pressed ? '#007bff' : '#ffffff',
                              //borderBottomWidth: 1,
                              //borderBottomColor: 'silver',
                              //borderRightWidth: 1,
                              //borderRightColor: 'silver',

                              // iOS shadow properties
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.5,
                              shadowRadius: 1,
                            },
                          ]}
                          android_ripple={{}}>
                          {({ pressed }) => (
                            <>
                              <Icons
                                name={item.icon}
                                size={35}
                                //color={pressed ? 'white' : '#0c0c0c'}
                                color={pressed ? 'white' : '#007bff'}
                              />
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#252525',
                                  fontFamily: 'Inter_28pt-Regular',
                                  fontSize: 10,
                                }}>
                                {item.label}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                </View>
              </View> */}
            </>
          ) : gsoInspection === '1' &&
            caoReceiver !== '1' &&
            caoEvaluator !== '1' ? (
            <>
              <View
                style={{
                  padding: 10,
                  marginTop: 10,
                  backgroundColor: 'white',
                  borderRadius: 5,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: 'silver',
                  borderRightWidth: 1,
                  borderRightColor: 'silver',
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    paddingBottom: 5,
                    marginBottom: 5,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_28pt-Bold',
                      color: '#252525',
                      fontSize: 15,
                      paddingHorizontal: 10,
                    }}>
                    Inspection Status
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  {requestsLoading ? (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 10,
                      }}>
                      <Text style={{fontSize: 16, color: '#252525'}}>
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {[
                        {
                          label: 'For Inspection',
                          screen: 'ForInspection',
                          length: `${forInspection ?? 0}`,
                        },
                        {
                          label: 'Inspected',
                          screen: 'Inspected',
                          length: `${inspected ?? 0}`,
                        },
                        {
                          label: 'On Hold',
                          screen: 'InspectionOnHold',
                          length: `${inspectionOnHold ?? 0}`,
                        },
                      ].map((item, index, arr) => (
                        <Pressable
                          key={index}
                          onPress={() =>
                            navigation.navigate(item.screen, item.params)
                          }
                          style={({pressed}) => [
                            {
                              width: '30%',
                              alignItems: 'center',
                              paddingVertical: 10,
                              marginBottom: 10,
                              borderRadius: 5,
                              elevation: 1,
                              backgroundColor: pressed ? '#007bff' : '#ffffff',
                              borderBottomWidth: 2,
                              borderBottomColor: 'silver',
                              borderRightWidth: 2,
                              borderRightColor: 'silver',
                            },
                          ]}
                          android_ripple={{}}>
                          {({pressed}) => (
                            <>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#007bff',
                                  fontFamily: 'Inter_28pt-Bold',
                                  fontSize: 26,
                                }}>
                                {item.length || 0}
                              </Text>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#252525',
                                  fontFamily: 'Inter_28pt-Regular',
                                  fontSize: 10,
                                }}>
                                {item.label}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      ))}
                    </>
                  )}
                </View>
              </View>

              {privilege === '10' && (
                <View
                  style={{
                    padding: 10,
                    marginTop: 10,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: 'silver',
                    borderRightWidth: 1,
                    borderRightColor: 'silver',
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-Bold',
                        color: '#252525',
                        fontSize: 15,
                        paddingHorizontal: 10,
                      }}>
                      Scheduler
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginTop: 5,
                      gap: 15,
                    }}>
                    {requestsLoading ? (
                      <View
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          paddingVertical: 10,
                        }}>
                        <Text style={{fontSize: 16, color: '#252525'}}>
                          Loading...
                        </Text>
                      </View>
                    ) : (
                      <>
                        {[
                          {
                            label: 'Request',
                            screen: 'RequestScreen',
                            length: `${requestsLength}`,
                          },
                          {
                            label: 'On Schedule',
                            screen: 'OnScheduleScreen',
                            length: `${OnScheduleLength}`,
                          },
                        ].map((item, index, arr) => (
                          <Pressable
                            key={index}
                            onPress={() =>
                              navigation.navigate(item.screen, item.params)
                            }
                            style={({pressed}) => [
                              {
                                width: '30%',
                                alignItems: 'center',
                                paddingVertical: 10,
                                marginBottom: 10,
                                borderRadius: 5,
                                elevation: 1,
                                backgroundColor: pressed
                                  ? '#007bff'
                                  : '#ffffff',
                                borderBottomWidth: 2,
                                borderBottomColor: 'silver',
                                borderRightWidth: 2,
                                borderRightColor: 'silver',
                              },
                            ]}
                            android_ripple={{}}>
                            {({pressed}) => (
                              <>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#007bff',
                                    fontFamily: 'Inter_28pt-Bold',
                                    fontSize: 26,
                                  }}>
                                  {item.length || 0}
                                </Text>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#252525',
                                    fontFamily: 'Inter_28pt-Regular',
                                    fontSize: 10,
                                  }}>
                                  {item.label}
                                </Text>
                              </>
                            )}
                          </Pressable>
                        ))}
                      </>
                    )}
                  </View>
                </View>
              )}

              <View style={{marginTop: 20}}>
                <RecentActivity
                  recentActivityData={recentActivityData}
                  recentActivityError={recentActivityError}
                  recentActivityLoading={recentActivityLoading}
                  navigation={navigation}
                />
              </View>
            </>
          ) : (
            procurement === '1' /* || accountType === '1' */ &&
            [
              '1071',
              '1081',
              '1061',
              '1091',
              '8751',
              '1031',
              'BAAC',
              'TRAC',
            ].includes(officeCode) && (
              <View>
                {accountType !== '2' && (
                  <View
                    style={{
                      padding: 10,
                      marginTop: 10,
                      backgroundColor: 'white',
                      borderRadius: 5,
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 1,
                      borderBottomWidth: 1,
                      borderBottomColor: 'silver',
                      borderRightWidth: 1,
                      borderRightColor: 'silver',
                    }}>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#eee',
                        paddingBottom: 5,
                        marginBottom: 5,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter_28pt-SemiBold',
                          color: '#252525',
                          paddingHorizontal: 10,
                          fontSize: 16,
                        }}>
                        Tracking Summary
                      </Text>
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingTop: 10,
                        paddingBottom: 10,
                        marginStart: 5,
                      }}>
                      {trackSumLoading ? (
                        <Text style={{textAlign: 'center'}}>Loading...</Text>
                      ) : trackSumError ? (
                        <Text style={{textAlign: 'center', color: 'red'}}>
                          Error loading data
                        </Text>
                      ) : itemsToShowTrackSum?.length === 0 ? (
                        <Text style={{textAlign: 'center'}}>
                          No results found
                        </Text>
                      ) : (
                        <>
                          {itemsToShowTrackSum?.map((item, index) => (
                            <Pressable
                              key={index}
                              onPress={() =>
                                navigation.navigate('TrackingSummaryScreen', {
                                  selectedItem: item,
                                })
                              }
                              style={{}}
                              android_ripple={{color: 'rgba(0, 0, 0, 0.2)'}}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  //alignItems: 'center',
                                  borderBottomWidth: 1,
                                  borderBottomColor: '#eee',
                                  paddingVertical: 5,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter_28pt-Bold',
                                    fontSize: 15,
                                    color: item.Status.includes('Pending')
                                      ? 'rgb(248, 12, 12)'
                                      : 'rgb(8, 112, 231)',
                                    width: '20%',
                                    textAlign: 'right',
                                    paddingRight: 10,
                                    //alignSelf: 'center',
                                    textAlignVertical: 'top',
                                  }}>
                                  {item.Count}
                                </Text>
                                <View style={{width: '80%'}}>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter_28pt-Light',
                                      fontSize: 14,
                                    }}>
                                    {item.Status}
                                  </Text>
                                </View>
                              </View>
                            </Pressable>
                          ))}

                          {trackSumData?.length > 5 && (
                            <View
                              style={{alignSelf: 'flex-end', marginTop: 10}}>
                              <TouchableOpacity
                                onPress={() => setShowAll(prev => !prev)}>
                                <Text
                                  style={{
                                    color: 'rgb(8, 112, 231)',
                                    fontWeight: 'bold',
                                  }}>
                                  {showAll ? 'Show Less' : 'Show More'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                )}

                <View
                  style={{
                    padding: 10,
                    marginTop: 15,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    /*  shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84, */
                    elevation: 1,
                    /*  borderBottomWidth: 1,
                    borderBottomColor: 'silver',
                    borderRightWidth: 1,
                    borderRightColor: 'silver', */
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                      paddingBottom: 5,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-SemiBold',
                        color: '#252525',
                        paddingHorizontal: 10,
                        fontSize: 16,
                      }}>
                      Transaction Counter
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      gap: 15,
                    }}>
                    {[
                      {
                        label: 'Delays',
                        count: `${officeDelaysLength ? officeDelaysLength : 0}`,
                        screen: 'OfficeDelays',
                        condition: accountType === '1',
                      },
                      {
                        label: 'Updated',
                        count: `${updatedNowData ? updatedNowData : 0}`,
                        screen: 'RecentUpdated',
                      },
                      /* {
                      label: 'Attachments',
                      icon: 'document-attach',
                      screen: 'PDF',
                    }, */
                      {
                        label: 'RegDelays',
                        count: `${
                          regOfficeDelaysLength ? regOfficeDelaysLength : 0
                        }`,
                        screen: 'Summary',
                        condition:
                          accountType > '1' &&
                          [
                            '8751',
                            '1031',
                            'BAAC',
                            'BACN',
                            '1071',
                            '1081',
                            '1061',
                            '1091',
                          ].includes(officeCode),
                      },
                    ].map((item, index, arr) => {
                      if (item.condition === false) {
                        return null;
                      }

                      return (
                        <Pressable
                          key={index}
                          onPress={() =>
                            navigation.navigate(item.screen, item.params)
                          }
                          style={({pressed}) => [
                            {
                              width: arr.length === 3 ? '32%' : '32%',
                              alignItems: 'center',
                              paddingVertical: 10,
                              marginBottom: 10,
                              borderRadius: 5,
                              elevation: 1,
                              backgroundColor: pressed ? '#007bff' : '#ffffff',
                              borderBottomWidth: 2,
                              borderBottomColor: 'silver',
                              borderRightWidth: 2,
                              borderRightColor: 'silver',
                            },
                          ]}
                          android_ripple={{}}>
                          {({pressed}) => (
                            <>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#007bff',
                                  fontFamily: 'Inter_28pt-Bold',
                                  fontSize: 26,
                                }}>
                                {item.count || 0}
                              </Text>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#252525',
                                  fontFamily: 'Inter_28pt-Regular',
                                  fontSize: 10,
                                }}>
                                {item.label}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View
                  style={{
                    padding: 10,
                    marginTop: 15,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 1,
                    borderBottomWidth: 1,
                    borderBottomColor: 'silver',
                    borderRightWidth: 1,
                    borderRightColor: 'silver',
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                      paddingBottom: 5,
                      marginBottom: 5,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-SemiBold',
                        color: '#252525',
                        paddingHorizontal: 10,
                        fontSize: 16,
                      }}>
                      Transaction Progress
                    </Text>
                  </View>
                  {loadingTransSum || loadingUseOthers ? (
                    <View style={{alignItems: 'center', marginVertical: 20}}>
                      <Text
                        style={{
                          fontFamily: 'Inter_28pt-Regular',
                          fontSize: 16,
                          color: '#888',
                        }}>
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={{paddingVertical: 10}}>
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Regular',
                                width: 60,
                                textAlign: 'center',
                              }}>
                              PR
                            </Text>
                            <TouchableOpacity
                              style={{
                                //paddingVertical: 10,
                                flex: 1,
                                marginVertical: 10,
                              }}
                              onPress={handlePRStatus}>
                              <ProgressBar
                                percentage={PRPercentage}
                                color="rgba(42, 126, 216, 0.75)"
                              />
                            </TouchableOpacity>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Inter_28pt-Bold',
                                paddingHorizontal: 5,
                                textAlign: 'right',
                                width: 50,
                              }}>
                              {Math.round(PRPercentage)}%
                            </Text>
                          </View>

                          <View style={{}}>
                            <AnimatedStatusView
                              showStatus={showPRStatus}
                              data={dataPR}
                              slideAnim={slideAnimPR}
                            />
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Regular',
                                width: 60,
                                textAlign: 'center',
                              }}>
                              PO
                            </Text>
                            <TouchableOpacity
                              style={{
                                //paddingVertical: 10,
                                flex: 1,
                                marginVertical: 10,
                              }}
                              onPress={handlePOStatus}>
                              <ProgressBar
                                percentage={POPercentage}
                                color="rgba(42, 126, 216, 0.50)"
                              />
                            </TouchableOpacity>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Inter_28pt-Bold',
                                paddingHorizontal: 5,
                                textAlign: 'right',
                                width: 50,
                              }}>
                              {Math.round(POPercentage)}%
                            </Text>
                          </View>

                          <View style={{}}>
                            <AnimatedStatusView
                              showStatus={showPOStatus}
                              data={dataPO}
                              slideAnim={slideAnimPO}
                            />
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Regular',
                                width: 60,
                                textAlign: 'center',
                              }}>
                              PX
                            </Text>
                            <TouchableOpacity
                              style={{
                                //paddingVertical: 10,
                                flex: 1,
                                marginVertical: 10,
                              }}
                              onPress={handlePXStatus}>
                              <ProgressBar
                                percentage={PXPercentage}
                                color="rgba(42, 126, 216, 0.25)"
                              />
                            </TouchableOpacity>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Inter_28pt-Bold',
                                paddingHorizontal: 5,
                                textAlign: 'right',
                                width: 50,
                              }}>
                              {Math.round(PXPercentage)}%
                            </Text>
                          </View>

                          <View style={{}}>
                            <AnimatedStatusView
                              showStatus={showPXStatus}
                              data={dataPX}
                              slideAnim={slideAnimPX}
                            />
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Regular',
                                width: 60,
                                textAlign: 'center',
                              }}>
                              Vouchers
                            </Text>
                            <TouchableOpacity
                              style={{
                                //paddingVertical: 10,
                                flex: 1,
                                marginVertical: 10,
                              }}
                              onPress={() =>
                                setVisibleDocuments(prevState => !prevState)
                              }>
                              <ProgressBar
                                percentage={Math.round(percentage)}
                                color="rgba(42, 126, 216, 0.15)"
                              />
                            </TouchableOpacity>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Inter_28pt-Bold',
                                paddingHorizontal: 5,
                                textAlign: 'right',
                                width: 50,
                              }}>
                              {Math.round(percentage)}%
                            </Text>
                          </View>

                          <View style={{width: '100%', alignSelf: 'flex-end'}}>
                            {visibleDocuments &&
                              othersVouchersData.map((item, index) => (
                                <View
                                  key={index}
                                  style={{
                                    backgroundColor: 'white',
                                    paddingBottom: 10,
                                    width: '75%',
                                    alignSelf: 'flex-end',
                                  }}>
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
                                          fontFamily: 'Inter_28pt-Regular',
                                          fontSize: 12,
                                          textAlign: 'left',
                                          alignItems: 'center',
                                          alignContent: 'center',
                                          textTransform: 'capitalize',
                                        }}>
                                        {item.DocumentType}
                                      </Text>
                                    </View>
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
                                        fontFamily: 'Inter_28pt-Regular',
                                        textAlign: 'right',
                                      }}>
                                      {item.DocumentTypeCount}
                                    </Text>

                                    <View
                                      style={{
                                        flex: 1,
                                      }}>
                                      <TouchableOpacity
                                        style={{marginVertical: 10}}
                                        onPress={() =>
                                          toggleVisibility(item.DocumentType)
                                        }>
                                        <ProgressBarOthers
                                          percentage={
                                            ((item.StatusCounts.find(
                                              status =>
                                                status.Status ===
                                                'Check Released',
                                            )?.StatusCount || 0) /
                                              parseInt(
                                                item.DocumentTypeCount,
                                                10,
                                              )) *
                                            100
                                          }
                                          color={
                                            ((item.StatusCounts.find(
                                              status =>
                                                status.Status ===
                                                'Check Released',
                                            )?.StatusCount || 0) /
                                              parseInt(
                                                item.DocumentTypeCount,
                                                10,
                                              )) *
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
                                        fontSize: 14,
                                        fontFamily: 'Inter_28pt-Bold',
                                        paddingHorizontal: 5,
                                        textAlign: 'right',
                                        width: 50,
                                      }}>
                                      {Math.round(
                                        ((item.StatusCounts.find(
                                          status =>
                                            status.Status === 'Check Released',
                                        )?.StatusCount || 0) /
                                          parseInt(
                                            item.DocumentTypeCount,
                                            10,
                                          )) *
                                          100,
                                      )}
                                      %
                                    </Text>
                                  </View>

                                  {visibleStatusCounts[item.DocumentType] && (
                                    <View
                                      style={{
                                        width: '100%',
                                        backgroundColor:
                                          'rgba(221, 221, 221, 0.23)',
                                        paddingEnd: 20,
                                        paddingVertical: 10,
                                      }}>
                                      <View style={{}}>
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
                                                  //borderRightWidth: 1,
                                                  borderColor:
                                                    'rgba(224, 225, 228, 0.69)',
                                                }}>
                                                <TouchableOpacity
                                                  activeOpacity={0.5}
                                                  //underlayColor="rgba(223, 231, 248, 0.3)"
                                                  style={{
                                                    paddingHorizontal: 10,
                                                  }}
                                                  onPress={() => {
                                                    navigation.navigate(
                                                      'Others',
                                                      {
                                                        selectedItem:
                                                          item.DocumentType,
                                                        details:
                                                          item.Details[
                                                            statusItem.Status
                                                          ],
                                                        loadingDetails,
                                                      },
                                                    );
                                                  }}>
                                                  <View
                                                    style={{
                                                      flexDirection: 'row',
                                                      alignItems: 'center',
                                                    }}>
                                                    <Text
                                                      style={{
                                                        color: '#252525',
                                                        fontSize: 11,
                                                        fontFamily:
                                                          'Inter_28pt-Regular',
                                                        letterSpacing: 1,
                                                        opacity: 0.5,
                                                        textAlign: 'right',
                                                      }}>
                                                      {statusItem.Status}
                                                    </Text>
                                                    <Text
                                                      style={{
                                                        width: 30,
                                                        color: '#252525',
                                                        fontSize: 13,
                                                        fontFamily:
                                                          'Inter_28pt-Regular',
                                                        textAlign: 'right',
                                                        letterSpacing: 1,
                                                      }}>
                                                      {statusItem.StatusCount}
                                                    </Text>
                                                  </View>
                                                </TouchableOpacity>
                                              </View>
                                            ),
                                          )}
                                        </View>
                                      </View>
                                    </View>
                                  )}
                                </View>
                              ))}
                          </View>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Regular',
                                width: 60,
                                textAlign: 'center',
                              }}>
                              Others
                            </Text>
                            <TouchableOpacity
                              style={{
                                //paddingVertical: 10,
                                flex: 1,
                                marginVertical: 10,
                              }}
                              onPress={() =>
                                setVisibleDocumentsOthers(
                                  prevState => !prevState,
                                )
                              }>
                              <ProgressBar
                                percentage={percentageOthers}
                                color="rgba(42, 126, 216, 0.15)"
                              />
                            </TouchableOpacity>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Inter_28pt-Bold',
                                paddingHorizontal: 5,
                                textAlign: 'right',
                                width: 50,
                              }}>
                              {Math.round(percentageOthers)}%
                            </Text>
                          </View>

                          {visibleDocumentsOthers &&
                            othersOthersData.map((item, index) => (
                              <View
                                key={index}
                                style={{
                                  backgroundColor: 'white',
                                  paddingBottom: 10,
                                  width: '75%',
                                  alignSelf: 'flex-end',
                                }}>
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
                                        fontFamily: 'Inter_28pt-Regular',
                                        fontSize: 12,
                                        textAlign: 'left',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        textTransform: 'capitalize',
                                      }}>
                                      {item.DocumentType}
                                    </Text>
                                  </View>
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
                                      fontFamily: 'Inter_28pt-Regular',
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
                                      style={{paddingVertical: 10}}
                                      onPress={() =>
                                        toggleVisibility(item.DocumentType)
                                      }>
                                      <ProgressBarOthers
                                        percentage={
                                          item.DocumentType === 'Liquidation'
                                            ? ((item.StatusCounts.find(
                                                status =>
                                                  status.Status ===
                                                  'CAO Released',
                                              )?.StatusCount || 0) /
                                                parseInt(
                                                  item.DocumentTypeCount,
                                                  10,
                                                )) *
                                              100
                                            : ((item.StatusCounts.find(
                                                status =>
                                                  status.Status ===
                                                  'Check Released',
                                              )?.StatusCount || 0) /
                                                parseInt(
                                                  item.DocumentTypeCount,
                                                  10,
                                                )) *
                                              100
                                        }
                                        color={
                                          item.DocumentType === 'Liquidation'
                                            ? ((item.StatusCounts.find(
                                                status =>
                                                  status.Status ===
                                                  'CAO Released',
                                              )?.StatusCount || 0) /
                                                parseInt(
                                                  item.DocumentTypeCount,
                                                  10,
                                                )) *
                                                100 ===
                                              100
                                              ? 'orange'
                                              : '#448eed'
                                            : ((item.StatusCounts.find(
                                                status =>
                                                  status.Status ===
                                                  'Check Released',
                                              )?.StatusCount || 0) /
                                                parseInt(
                                                  item.DocumentTypeCount,
                                                  10,
                                                )) *
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
                                      fontSize: 14,
                                      fontFamily: 'Inter_28pt-Bold',
                                      paddingHorizontal: 5,
                                      textAlign: 'right',
                                      width: 50,
                                    }}>
                                    {Math.round(
                                      item.DocumentType === 'Liquidation'
                                        ? ((item.StatusCounts.find(
                                            status =>
                                              status.Status === 'CAO Released',
                                          )?.StatusCount || 0) /
                                            parseInt(
                                              item.DocumentTypeCount,
                                              10,
                                            )) *
                                            100
                                        : ((item.StatusCounts.find(
                                            status =>
                                              status.Status ===
                                              'Check Released',
                                          )?.StatusCount || 0) /
                                            parseInt(
                                              item.DocumentTypeCount,
                                              10,
                                            )) *
                                            100,
                                    )}
                                    %
                                  </Text>
                                </View>

                                {visibleStatusCounts[item.DocumentType] && (
                                  <View style={[styles.table, {}]}>
                                    <View style={styles.column}></View>

                                    <View style={styles.column}></View>

                                    <View
                                      style={[styles.column, {flexGrow: 5}]}>
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
                                                  navigation.navigate(
                                                    'Others',
                                                    {
                                                      selectedItem:
                                                        item.DocumentType,
                                                      details:
                                                        item.Details[
                                                          statusItem.Status
                                                        ],
                                                      loadingDetails,
                                                    },
                                                  );
                                                }}>
                                                <View
                                                  style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                  }}>
                                                  <Text
                                                    style={{
                                                      color: '#252525',
                                                      fontSize: 11,
                                                      fontFamily:
                                                        'Inter_28pt-Regular',
                                                      letterSpacing: 1,
                                                      opacity: 0.5,
                                                      textAlign: 'right',
                                                    }}>
                                                    {statusItem.Status}
                                                  </Text>
                                                  <Text
                                                    style={{
                                                      width: 30,
                                                      color: '#252525',
                                                      fontSize: 13,
                                                      fontFamily:
                                                        'Inter_28pt-Regular',
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
                                  </View>
                                )}
                              </View>
                            ))}
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )
          )}
        </View>

        {/* Uploader */}
        {procurement === '1' && (
          <View
            style={{
              padding: 10,
              marginTop: 15,
              backgroundColor: 'white',
              borderRadius: 5,
              elevation: 2,
            }}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                paddingBottom: 5,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-SemiBold',
                  color: '#252525',
                  paddingHorizontal: 10,
                  fontSize: 16,
                }}>
                Uploader
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-start',
                gap: 15,
              }}>
              {[
                {
                label: 'Attachments',
                icon: true,
                condition: officeAdmin === '1',
                screen: 'Attachments',
                },
              
              ].map((item, index) => {
                if (item.condition === false) {
                  return null;
                }

                return (
                  <Pressable
                    key={index}
                    style={({pressed}) => [
                      {
                        width: '30%',
                        alignItems: 'center',
                        paddingVertical: 10,
                        marginBottom: 10,
                        borderRadius: 5,
                        elevation: 1,
                        backgroundColor: pressed ? '#007bff' : '#ffffff',
                        borderBottomWidth: 2,
                        borderBottomColor: 'silver',
                        borderRightWidth: 2,
                        borderRightColor: 'silver',
                      },
                    ]}
                    android_ripple={{color: 'rgba(200, 200, 200, 0.5)'}}
                    onPress={() => {
                      if (item.screen) {
                        navigation.navigate(item.screen);
                      } else {
                        console.log(`${item.label} card pressed`);
                      }
                    }}>
                    {({pressed}) => (
                      <>
                        {item.icon ? (
                          <View style={{paddingVertical: 5}}>
                           {/*  <Image
                              source={require('../../assets/images/access.png')}
                              style={{
                                width: 30,
                                height: 30,
                                tintColor: pressed ? 'white' : '#007bff',
                              }}
                            /> */}
                            <Icon name="document-attach-outline" size={28} color={pressed ? 'white' : '#007bff'}/>
                          </View>
                        ) : (
                          <Text
                            style={{
                              color: pressed ? 'white' : '#007bff',
                              fontFamily: 'Inter_28pt-Bold',
                              fontSize: 26,
                            }}>
                            {item.count || 0}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: pressed ? 'white' : '#252525',
                            fontFamily: 'Inter_28pt-Regular',
                            fontSize: 10,
                          }}>
                          {item.label}
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

         {/* Uploader */}
        {procurement === '1' && (
          <View
            style={{
              padding: 10,
              marginTop: 15,
              backgroundColor: 'white',
              borderRadius: 5,
              elevation: 2,
            }}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                paddingBottom: 5,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-SemiBold',
                  color: '#252525',
                  paddingHorizontal: 10,
                  fontSize: 16,
                }}>
                BOSS LEVEL
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-start',
                gap: 15,
              }}>
              {[
                {
                label: 'Access',
                icon: true,
                condition: officeAdmin === '1',
                screen: 'SuperAccess',
                },
              
              ].map((item, index) => {
                if (item.condition === false) {
                  return null;
                }

                return (
                  <Pressable
                    key={index}
                    style={({pressed}) => [
                      {
                        width: '30%',
                        alignItems: 'center',
                        paddingVertical: 10,
                        marginBottom: 10,
                        borderRadius: 5,
                        elevation: 1,
                        backgroundColor: pressed ? '#007bff' : '#ffffff',
                        borderBottomWidth: 2,
                        borderBottomColor: 'silver',
                        borderRightWidth: 2,
                        borderRightColor: 'silver',
                      },
                    ]}
                    android_ripple={{color: 'rgba(200, 200, 200, 0.5)'}}
                    onPress={() => {
                      if (item.screen) {
                        navigation.navigate(item.screen);
                      } else {
                        console.log(`${item.label} card pressed`);
                      }
                    }}>
                    {({pressed}) => (
                      <>
                        {item.icon ? (
                          <View style={{paddingVertical: 5}}>
                           {/*  <Image
                              source={require('../../assets/images/access.png')}
                              style={{
                                width: 30,
                                height: 30,
                                tintColor: pressed ? 'white' : '#007bff',
                              }}
                            /> */}
                            <Icon name="glasses-outline" size={30} color={pressed ? 'white' : '#007bff'}/>
                          </View>
                        ) : (
                          <Text
                            style={{
                              color: pressed ? 'white' : '#007bff',
                              fontFamily: 'Inter_28pt-Bold',
                              fontSize: 26,
                            }}>
                            {item.count || 0}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: pressed ? 'white' : '#252525',
                            fontFamily: 'Inter_28pt-Regular',
                            fontSize: 10,
                          }}>
                          {item.label}
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/*PERSONAL VIEW */}
        <View
          style={{
            padding: 10,
            marginTop: 15,
            marginBottom: 60,
            backgroundColor: 'white',
            borderRadius: 5,
            /* shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.84, */
            elevation: 2,
            /*  elevation: 1,
            borderBottomWidth: 1,
            borderBottomColor: 'silver',
            borderRightWidth: 1,
            borderRightColor: 'silver', */
          }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
              paddingBottom: 5,
              marginBottom: 10,
            }}>
            <Text
              style={{
                fontFamily: 'Inter_28pt-SemiBold',
                color: '#252525',
                paddingHorizontal: 10,
                fontSize: 16,
              }}>
              Personal
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: 15,
            }}>
            {[
              {
                label: 'Salaries',
                count: `${myTransactionsLength ? myTransactionsLength : 0}`,
                screen: 'MyTransactions',
              },
              {
                label: 'ARE',
                count: `${accountabilityData ? accountabilityData.length : 0}`,
                screen: 'MyAccountability',
              },
              {
                label: 'Access',
                icon: true,
                condition: officeAdmin === '1',
                screen: 'MyAccess',
              },
              
            ].map((item, index) => {
              if (item.condition === false) {
                return null;
              }

              return (
                <Pressable
                  key={index}
                  style={({pressed}) => [
                    {
                      width: '30%',
                      alignItems: 'center',
                      paddingVertical: 10,
                      marginBottom: 10,
                      borderRadius: 5,
                      elevation: 1,
                      backgroundColor: pressed ? '#007bff' : '#ffffff',
                      borderBottomWidth: 2,
                      borderBottomColor: 'silver',
                      borderRightWidth: 2,
                      borderRightColor: 'silver',
                    },
                  ]}
                  android_ripple={{color: 'rgba(200, 200, 200, 0.5)'}}
                  onPress={() => {
                    if (item.screen) {
                      navigation.navigate(item.screen);
                    } else {
                      console.log(`${item.label} card pressed`);
                    }
                  }}>
                  {({pressed}) => (
                    <>
                      {item.icon ? (
                        <View style={{paddingVertical: 5}}>
                          <Image
                            source={require('../../assets/images/access.png')}
                            style={{
                              width: 30,
                              height: 30,
                              tintColor: pressed ? 'white' : '#007bff', // Optional, to apply color if the image supports it
                            }}
                          />
                        </View>
                      ) : (
                        <Text
                          style={{
                            color: pressed ? 'white' : '#007bff',
                            fontFamily: 'Inter_28pt-Bold',
                            fontSize: 26,
                          }}>
                          {item.count || 0}
                        </Text>
                      )}
                      <Text
                        style={{
                          color: pressed ? 'white' : '#252525',
                          fontFamily: 'Inter_28pt-Regular',
                          fontSize: 10,
                        }}>
                        {item.label}
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 100,
          }}>
          <Image
            source={require('../../assets/images/logodavao.png')}
            style={{
              width: 38,
              height: 38,
              opacity: 0.8,
              marginRight: 10,
            }}
          />
          <Image
            source={require('../../assets/images/dcplinado.png')}
            style={{
              width: 80,
              height: 21,
              opacity: 0.8,
            }}
          />
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <ImageBackground
        source={require('../../assets/images/bgasset.jpg')}
        style={{flex: 1}}
        resizeMode="cover">
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        />
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={selectedOnRefresh}
            />
          }>
          {renderUI()}
          <LoadingModal visible={isModalVisible} />
          <CustomModal visible={isSetModalVisible} onRequestClose={closeModal}>
            <Text>This feature is currently under development.</Text>
          </CustomModal>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollViewContent: {
    flex: 1,
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
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 11,
    textAlign: 'left',
    alignItems: 'center',
    alignContent: 'center',
  },
  progressBarContainer: {
    //marginStart: 20,
    alignSelf: 'center',
    width: '90%',
    height: 25,
    borderRadius: 5,
    backgroundColor: 'rgb(223, 222, 222)',
    overflow: 'hidden',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    //elevation: 2, // Shadow for Android
  },
  progressBarContainerOthers: {
    alignSelf: 'center',
    width: '90%',
    height: 25,
    borderRadius: 5,
    backgroundColor: 'rgb(223, 222, 222)',
    overflow: 'hidden',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
  },
  progressBar: {
    height: '100%',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    //elevation: 8, // Shadow for Android
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
    marginVertical: 5,
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
  shimmerWrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0, 0.03)',
  },
  gradient: {
    flex: 1,
  },
  calendar: {marginBottom: 10},
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  card: {
    marginVertical: 5,
    padding: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDesc: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default DoctrackScreen;
