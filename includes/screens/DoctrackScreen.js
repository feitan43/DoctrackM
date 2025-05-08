import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  StatusBar,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { StackActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import OfficeDelaysScreen from './OfficeDelaysScreen';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import ProjectCleansingScreen from './ProjectCleansingScreen';
import { Image } from 'react-native-ui-lib';
import useGetImage from '../api/useGetImage';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from 'react-native-paper';
import { Shimmer } from '../utils/useShimmer';
import { useQueryClient } from '@tanstack/react-query';
import CustomModal from '../components/CustomModal';

const currentYear = new Date().getFullYear();

const RecentActivity = ({
  recentActivityData,
  recentActivityError,
  recentActivityLoading,
  navigation,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const nextPage = () => {
    if (currentPage * itemsPerPage < recentActivityData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedData =
    recentActivityData && recentActivityData.length > 0
      ? recentActivityData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      )
      : [];

  const onPressItem = item => {
    navigation.navigate('InspectionDetails', { item });
  };

  const InspectionImage = ({ item }) => {
    const { inspectorImages, loading, error, fetchInspectorImage } = useGetImage(
      item?.Year,
      item?.TrackingNumber,
    );

    useEffect(() => {
      fetchInspectorImage();
    }, [item?.Year, item?.TrackingNumber]);

    if (loading) {
      return (
        <View style={{ backgroundColor: 'transparent' }}>
          <ActivityIndicator
            size="small"
            color="white"
            style={{ width: 60, height: 60 }}
          />
        </View>
      );
    }

    if (error) {
      return (
        <Image
          source={require('../../assets/images/noImage.jpg')}
          style={{
            width: 60,
            height: 60,
            borderWidth: 1,
            borderColor: 'silver',
          }}
        />
        //   <FastImage
        //   source={{ uri, priority: FastImage.priority.high, cache: 'web' }}
        //   style={{
        //     width: 60,
        //     height: 60,
        //     borderWidth: 1,
        //     borderColor: "silver",
        //   }}
        //   resizeMode={FastImage.resizeMode.cover}
        // />
      );
    }

    const imageUri = inspectorImages.length > 0 ? inspectorImages[0] : null;
    //console.log(inspectorImages);

    return (
      <FastImage
        source={
          imageUri
            ? { uri: imageUri, priority: FastImage.priority.high, cache: 'web' }
            : require('../../assets/images/noImage.jpg')
        }
        style={{
          width: 60,
          height: 60,
          borderWidth: 1,
          borderColor: 'silver',
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
    );
  };

  return (
    <View
      style={{
        padding: 10,
        marginBottom: 10,
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
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Inter_28pt-Bold',
              color: '#252525',
              fontSize: 15,
            }}>
            Recent Activity
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={prevPage} disabled={currentPage === 1}>
              <Icon
                name="chevron-back"
                size={24}
                color={currentPage === 1 ? '#eee' : 'black'}
              />
            </TouchableOpacity>
            <Text
              style={{
                marginHorizontal: 20,
                fontSize: 14,
                color: 'gray',
              }}>
              {`${currentPage}`}
            </Text>
            <TouchableOpacity
              onPress={nextPage}
              disabled={
                !recentActivityData ||
                recentActivityData.length === 0 ||
                currentPage * itemsPerPage >= recentActivityData.length
              }>
              <Icon
                name="chevron-forward"
                size={24}
                color={
                  !recentActivityData ||
                    recentActivityData.length === 0 ||
                    currentPage * itemsPerPage >= recentActivityData.length
                    ? '#eee'
                    : 'black'
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {recentActivityLoading ? (
        <View
          style={{
            marginTop: 10,
            marginHorizontal: 10,
            marginBottom: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'rgba(0,0,0, 0.05)',
            padding: 10,
          }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : recentActivityError ? (
        <View
          style={{
            marginTop: 10,
            marginHorizontal: 10,
            marginBottom: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'rgba(255, 0, 0, 0.1)', // Red background for error
            padding: 10,
          }}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter_18pt-Regular',
              fontSize: 14,
              textAlign: 'center',
            }}>
            Something went wrong. Please try again.
          </Text>
        </View>
      ) : (
        <View
          style={{
            marginBottom: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            marginHorizontal: 5,
          }}>
          {!recentActivityData || recentActivityData.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                padding: 10,
                backgroundColor: 'rgb(243, 243, 243)',
                marginHorizontal: 5,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_18pt-Regular',
                  color: 'silver',
                  fontSize: 12,
                }}>
                No results found
              </Text>
            </View>
          ) : (
            paginatedData.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => onPressItem(item)}
                style={({ pressed }) => [
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(192, 192, 192, 0.05)',
                  },
                ]}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}>
                <View
                  style={{ flexDirection: 'row', marginVertical: 10, gap: -5 }}>
                  <View
                    style={{
                      width: '30%',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 10,
                    }}>
                    <InspectionImage item={item} />
                  </View>

                  <View style={{ gap: 0, width: '70%' }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-SemiBold',
                        fontSize: 12,
                        color: '#252525',
                        width: '90%',
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.OfficeName}
                    </Text>

                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-Regular',
                        fontSize: 12,
                        color: '#252525',
                      }}>
                      {item.CategoryCode}
                      {' - '}
                      <Text
                        style={{
                          fontFamily: 'Inter_28pt-Regular',
                          fontSize: 10,
                          color: '#252525',
                        }}>
                        {item.CategoryName}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-Regular',
                        fontSize: 12,
                        color: 'white',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter_28pt-Regular',
                          fontSize: 12,
                          color: '#252525',
                        }}>
                        {item.TrackingNumber}
                      </Text>
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const DoctrackScreen = ({
  officeDelaysLength,
  regOfficeDelaysLength,
  myTransactionsLength,
  updatedNowData,
  updatedDateTime,
  officeCode,
  accountType,
  caoReceiver,
  officeName,
  employeeNumber,
  fullName,
  privilege,
  permission,
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
  setSelectedYear,
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
  inspectionLoading,
  inspectionError,
  recentActivityData,
  recentActivityError,
  recentActivityLoading,
  fetchRecentActivity,
  receivingCount,
  receivingCountData,
  isReceivedLoading,
  receivedMonthly,
  loadingReceiving,
  trackSumData,
  trackSumError,
  trackSumLoading,
  refetchTrackSum,
  regTrackSumData,
  regTrackSumError,
  regTrackSumLoading,
  refetchRegTrackSum,
  accountabilityData,
  fetchMyAccountability,
  requestsLength,
  requestsLoading,
  fetchRequests,
  OnScheduleLength,
  myTransactionsLoading,
  onEvalDataCount,
  evaluatedDataCount,
  evalPendingDataCount,
  evalPendingReleasedCount,
  evaluatorSummary,
}) => {
  const [showPRStatus, setShowPRStatus] = useState(false);
  const [showPOStatus, setShowPOStatus] = useState(false);
  const [showPXStatus, setShowPXStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSetModalVisible, setSetModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState('');
  const navigation = useNavigation();

  const openModal = () => {
    setSetModalVisible(true);
  };

  const closeModal = () => {
    setSetModalVisible(false);
  };


  const YearDropdown = ({ selectedYear, setSelectedYear }) => {
    const years = Array.from(
      { length: Math.max(0, currentYear - 2023 + 1) },
      (_, index) => ({
        label: `${currentYear - index}`,
        value: currentYear - index,
      }),
    );

    return (
      <View
        style={{
          position: 'relative',
          zIndex: 1,
          borderWidth: 1,
          borderColor: 'silver',
          borderRadius: 5,
        }}>
        <Dropdown
          style={[styles.dropdown, { elevation: 10 }]}
          data={years}
          labelField="label"
          valueField="value"
          placeholder={`${selectedYear}`}
          selectedTextStyle={{ color: '#252525' }}
          placeholderStyle={{ color: '#252525' }}
          iconStyle={{ tintColor: '#252525' }}
          value={selectedYear}
          onChange={item => {
            setSelectedYear(item.value);
          }}
        />
      </View>
    );
  };

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
    '',
    //'Total',
  ];
  const data = [
    [8, 10, 3, 21],
    [13, 8, 9, 30],
    [50, 23, 26, 99],
    [45, 24, 23, 92],
    [43, 24, 24, 91],
    [77, 57, 26, 160],
    [55, 27, 39, 121],
    [210, 166, 32, 408],
    [113, 85, 42, 240],
    [82, 49, 47, 178],
    [696, 473, 271, 1440],
  ];

  const transactions = {
    '2025-02-20': [
      {
        id: '1',
        title: 'Transaction 1',
        description: 'Detail for transaction 1',
      },
      {
        id: '2',
        title: 'Transaction 2',
        description: 'Detail for transaction 2',
      },
    ],
    '2025-02-21': [
      {
        id: '3',
        title: 'Transaction 3',
        description: 'Detail for transaction 3',
      },
    ],
    // add more dates & transactions as needed
  };

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  const renderTransaction = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDesc}>{item.description}</Text>
      </Card.Content>
    </Card>
  );

  const transactionsForSelectedDate = transactions[selectedDate] || [];

  /* const tableData = [
    { month: 'Jan', onEvaluation: '', evaluated: '', pending: '', total: '' },
    { month: 'Feb', onEvaluation: 8, evaluated: 10, pending: 3, total: 21 },
    { month: 'Mar', onEvaluation: '', evaluated: '', pending: '', total: '' },
    { month: 'Apr', onEvaluation: 13, evaluated: 8, pending: 9, total: 30 },
    { month: 'May', onEvaluation: 50, evaluated: 23, pending: 26, total: 99 },
    { month: 'Jun', onEvaluation: 45, evaluated: 24, pending: 23, total: 92 },
    { month: 'Jul', onEvaluation: 43, evaluated: 24, pending: 24, total: 91 },
    { month: 'Aug', onEvaluation: 77, evaluated: 57, pending: 26, total: 160 },
    { month: 'Sep', onEvaluation: 55, evaluated: 27, pending: 39, total: 121 },
    { month: 'Oct', onEvaluation: 210, evaluated: 166, pending: 32, total: 408 },
    { month: 'Nov', onEvaluation: 113, evaluated: 85, pending: 42, total: 240 },
    { month: 'Dec', onEvaluation: 82, evaluated: 49, pending: 47, total: 178 },
    { month: 'Total', onEvaluation: 696, evaluated: 473, pending: 271, total: 1440 }
  ]; */

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
  const [visibleOthersStatusCounts, setVisibleOthersStatusCounts] = useState(
    {},
  );
  const [visibleDocuments, setVisibleDocuments] = useState(false);
  const [visibleDocumentsOthers, setVisibleDocumentsOthers] = useState(false);

  const toggleVisibility = documentType => {
    setVisibleStatusCounts(prevState => ({
      ...prevState,
      [documentType]: !prevState[documentType],
    }));
  };

  const ProgressBar = React.memo(({ percentage, color }) => {
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
            { width: animatedWidth, backgroundColor: color },
          ]}
        />
      </View>
    );
  });

  const ProgressBarOthers = React.memo(({ percentage, color }) => {
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
            { width: animatedWidth, backgroundColor: color },
          ]}
        />
      </View>
    );
  });

  const LoadingModal = ({ visible }) => {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={() => { }}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: 'white', marginTop: 10 }}>Loading ...</Text>
          </View>
        </View>
      </Modal>
    );
  };

  const AnimatedStatusView = ({ showStatus, data, slideAnim }) => {
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
          transform: [{ translateY: slideAnim }],
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
              <View style={{ maxWidth: 220 }}>
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
        fetchRecentActivity(),
        fetchRequests(),
      ]);

      // Invalidate and refetch the 'inspection' query
      queryClient.invalidateQueries({
        queryKey: ['inspection'],
      });
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
    if (permission === '10' || permission === '48') {
      return onRefreshInspector();
    } else {
      return onRefresh();
    }
  }, [permission, onRefresh, onRefreshInspector]);

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

  const handleMyAccountability = async () => {
    if (navigation) {
      navigation.navigate('MyAccountability');
    }
  };

  const handleSender = async () => {
    if (navigation) {
      navigation.navigate('Sender');
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

  const [showAll, setShowAll] = useState(false);

  const renderContent = useCallback(() => {
    const itemsToShowTrackSum = showAll
      ? trackSumData
      : trackSumData?.slice(0, 5);
    const itemsToShowRegTrackSum = showAll
      ? regTrackSumData
      : regTrackSumData?.slice(0, 5);
    return (
      <View style={{ marginBottom: 100, backgroundColor: 'red', flex: 1 }}>
        {/* TRACKING SUMMARY */}

        {!['10', '5', '8', '9', '11'].includes(privilege) &&
          permission !== '10' && (
            <View
              style={{
                padding: 10,
                marginTop: 10,
                marginHorizontal: 10,
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
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_28pt-Bold',
                    color: '#252525',
                    fontSize: 15,
                    paddingHorizontal: 10,
                  }}>
                  Tracking Summary - Default
                </Text>
              </View>

              {accountType === '1' ? (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginStart: 5,
                  }}>
                  {trackSumLoading ? (
                    <Text style={{ textAlign: 'center' }}>Loading...</Text>
                  ) : trackSumError ? (
                    <Text style={{ textAlign: 'center', color: 'red' }}>
                      Error loading data
                    </Text>
                  ) : itemsToShowTrackSum?.length === 0 ? (
                    <Text style={{ textAlign: 'center' }}>No results found</Text>
                  ) : (
                    <>
                      {itemsToShowTrackSum?.map((item, index) => (
                        <Pressable
                          key={index}
                          onPress={() => {
                            navigation.navigate('TrackingSummaryScreen', {
                              selectedItem: item,
                            });
                          }}
                          android_ripple={{ color: 'rgba(0, 0, 0, 0.2)' }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Bold',
                                fontSize: 16,
                                color: item.Status.includes('Pending')
                                  ? 'rgb(248, 12, 12)'
                                  : 'rgb(8, 112, 231)',
                                width: '20%',
                                textAlign: 'right',
                                paddingRight: 10,
                                alignSelf: 'center',
                              }}>
                              {item.Count}
                            </Text>
                            <View style={{ width: '80%' }}>
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
                        <View style={{ alignSelf: 'flex-end' }}>
                          <Pressable
                            onPress={() => setShowAll(prev => !prev)}
                            style={{
                              padding: 10,
                              marginTop: 10,
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: 'rgb(8, 112, 231)',
                                fontWeight: 'bold',
                              }}>
                              {showAll ? 'Show Less' : 'Show More'}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}
                </View>
              ) : (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginStart: 5,
                  }}>
                  {regTrackSumLoading ? (
                    <Text style={{ textAlign: 'center' }}>Loading...</Text>
                  ) : regTrackSumError ? (
                    <Text style={{ textAlign: 'center', color: 'red' }}>
                      Error loading data
                    </Text>
                  ) : itemsToShowRegTrackSum?.length === 0 ? (
                    <Text style={{ textAlign: 'center' }}>No results found</Text>
                  ) : (
                    <>
                      {itemsToShowRegTrackSum?.map((item, index) => (
                        <Pressable
                          key={index}
                          onPress={() => {
                            navigation.navigate('RegTrackingSummaryScreen', {
                              selectedItem: item,
                            });
                          }}
                          android_ripple={{ color: 'rgba(35, 24, 24, 0.2)' }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_28pt-Bold',
                                fontSize: 16,
                                color: item.Status.includes('Pending')
                                  ? 'rgb(248, 12, 12)'
                                  : 'rgb(8, 112, 231)',
                                width: '20%',
                                textAlign: 'right',
                                paddingRight: 10,
                                alignSelf: 'center',
                              }}>
                              {item.Count}
                            </Text>
                            <View style={{ width: '80%' }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter_28pt-Regular',
                                  fontSize: 14,
                                }}>
                                {item.Status}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      ))}
                      {regTrackSumData?.length > 5 && (
                        <View style={{ alignSelf: 'flex-end' }}>
                          <Pressable
                            onPress={() => setShowAll(prev => !prev)}
                            style={{
                              padding: 10,
                              marginTop: 10,
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: 'rgb(8, 112, 231)',
                                fontWeight: 'bold',
                              }}>
                              {showAll ? 'Show Less' : 'Show More'}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          )}

        {/*TRANSACTION COUNTER*/}
        <View
          style={{
            padding: 10,
            marginTop: 10,
            marginHorizontal: 10,
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
            }}>
            <Text
              style={{
                fontFamily: 'Inter_28pt-Bold',
                color: '#252525',
                fontSize: 15,
                paddingHorizontal: 10,
              }}>
              Transaction Counter
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 10,
              paddingHorizontal: 10,
              marginTop: 5,
              paddingTop: 10,
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
              {
                label: 'RegDelays',
                count: `${regOfficeDelaysLength ? regOfficeDelaysLength : 0}`,
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
                  onPress={() => navigation.navigate(item.screen, item.params)}
                  style={({ pressed }) => [
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
                  {({ pressed }) => (
                    <>
                      <Text
                        style={{
                          color: pressed ? 'white' : 'black',
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

        <View style={{ marginBottom: 10 }}>
          {/*Personal*/}
          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
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
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Bold',
                  color: '#252525',
                  fontSize: 15,
                  paddingHorizontal: 10,
                }}>
                Personal
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: 10,
                paddingHorizontal: 10,
                marginTop: 5,
                paddingTop: 10,
              }}>
              {[
                {
                  label: 'SLRY',
                  count: `${myTransactionsLength && myTransactionsLength
                    ? myTransactionsLength
                    : 0
                    }`,
                  screen: 'MyTransactions',
                },
                {
                  label: 'ARE',
                  count: `${accountabilityData && accountabilityData.length
                    ? accountabilityData.length
                    : 0
                    }`,
                  screen: 'MyAccountability',
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
                    style={({ pressed }) => [
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
                    {({ pressed }) => (
                      <>
                        <Text
                          style={{
                            color: pressed ? 'white' : 'black',
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
        </View>

        {/*PROCUREMENT PROGRESS*/}
        {accountType === '1' ? (
          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000', // Shadow color for iOS
              shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
              shadowOpacity: 0.25, // Shadow opacity for iOS
              shadowRadius: 3.84, // Shadow radius for iOS
              elevation: 8, // Shadow for Android
            }}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Bold',
                  color: '#252525',
                  fontSize: 15,
                  paddingHorizontal: 10,
                }}>
                Transaction Progress
              </Text>
            </View>
            {loadingTransSum || loadingUseOthers ? (
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
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
                <View style={{ paddingVertical: 10 }}>
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

                    <View style={{ width: '100%', alignSelf: 'flex-end' }}>
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
                                  style={{ marginVertical: 10 }}
                                  onPress={() =>
                                    toggleVisibility(item.DocumentType)
                                  }>
                                  <ProgressBarOthers
                                    percentage={
                                      ((item.StatusCounts.find(
                                        status =>
                                          status.Status === 'Check Released',
                                      )?.StatusCount || 0) /
                                        parseInt(item.DocumentTypeCount, 10)) *
                                      100
                                    }
                                    color={
                                      ((item.StatusCounts.find(
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
                                    parseInt(item.DocumentTypeCount, 10)) *
                                  100,
                                )}
                                %
                              </Text>
                            </View>

                            {visibleStatusCounts[item.DocumentType] && (
                              <View
                                style={{
                                  width: '100%',
                                  backgroundColor: 'rgba(221, 221, 221, 0.23)',
                                  paddingEnd: 20,
                                  paddingVertical: 10,
                                }}>
                                <View style={{}}>
                                  <View style={{ marginBottom: 10 }}>
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
                                            style={{ paddingHorizontal: 10 }}
                                            onPress={() => {
                                              navigation.navigate('Others', {
                                                selectedItem: item.DocumentType,
                                                details:
                                                  item.Details[
                                                  statusItem.Status
                                                  ],
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
                          setVisibleDocumentsOthers(prevState => !prevState)
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
                                style={{ paddingVertical: 10 }}
                                onPress={() =>
                                  toggleVisibility(item.DocumentType)
                                }>
                                <ProgressBarOthers
                                  percentage={
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
                                          status.Status === 'Check Released',
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
                                          status.Status === 'CAO Released',
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
                                          status.Status === 'Check Released',
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
                                    parseInt(item.DocumentTypeCount, 10)) *
                                  100
                                  : ((item.StatusCounts.find(
                                    status =>
                                      status.Status === 'Check Released',
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

                              <View style={[styles.column, { flexGrow: 5 }]}>
                                <View style={{ marginBottom: 10 }}>
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
                                          style={{ paddingHorizontal: 10 }}
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
        ) : (
          <>
            <View></View>
          </>
        )}

        {/*FOOTER*/}
        <View
          style={{
            flex: 1,
            marginTop: 15,
            //backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingEnd: 20,
            paddingTop: 20,
            paddingBottom: 20,
            //borderTopWidth: 1,
            //borderTopColor: 'rgba(0, 0, 0, 0.05)',
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

  const renderInspector = () => (
    <View>
      <View
        style={{
          padding: 10,
          marginTop: 10,
          marginHorizontal: 10,
          backgroundColor: 'white',
          borderRadius: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 6,
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
            Inspection Status - Inspector
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            gap: 10,
            marginEnd: 10,
            paddingHorizontal: 10,
            marginTop: 5,
            paddingTop: 10,
          }}>
          {requestsLoading ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ fontSize: 16, color: '#252525' }}>Loading...</Text>
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
                  onPress={() => navigation.navigate(item.screen, item.params)}
                  style={({ pressed }) => [
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
                  {({ pressed }) => (
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

      {/* Scheduler */}
      {privilege === '10' && (
        <View
          style={{
            padding: 10,
            marginTop: 10,
            marginHorizontal: 10,
            backgroundColor: 'white',
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            //shadowOpacity: 0.08,
            shadowRadius: 3.84,
            elevation: 4,
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
              justifyContent: 'flex-start',
              gap: 10,
              marginEnd: 10,
              paddingHorizontal: 10,
              marginTop: 5,
              paddingTop: 10,
            }}>
            {requestsLoading ? (
              <View
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ fontSize: 16, color: '#252525' }}>Loading...</Text>
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
                    style={({ pressed }) => [
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
                    {({ pressed }) => (
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

      <View style={{ marginBottom: 10 }}>
        <View
          style={{
            padding: 10,
            marginTop: 10,
            marginHorizontal: 10,
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
            }}>
            <Text
              style={{
                fontFamily: 'Inter_28pt-Bold',
                color: '#252525',
                fontSize: 15,
                paddingHorizontal: 10,
              }}>
              Personal
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 10,
              paddingHorizontal: 10,
              marginTop: 5,
              paddingTop: 10,
            }}>
            {[
              {
                label: 'SLRY',
                count: `${myTransactionsLength && myTransactionsLength
                  ? myTransactionsLength
                  : 0
                  }`,
                screen: 'MyTransactions',
              },
              {
                label: 'ARE',
                count: `${accountabilityData && accountabilityData.length
                  ? accountabilityData.length
                  : 0
                  }`,
                screen: 'MyAccountability',
              },
            ].map((item, index, arr) => {
              if (item.condition === false) {
                return null;
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => navigation.navigate(item.screen, item.params)}
                  style={({ pressed }) => [
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
                  {({ pressed }) => (
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
      </View>

      <View
        style={
          {
            /* marginBottom: 10 */
          }
        }>
        <RecentActivity
          recentActivityData={recentActivityData}
          recentActivityError={recentActivityError}
          recentActivityLoading={recentActivityLoading}
          navigation={navigation}
        />
      </View>

      {/*FOOTER*/}
      <View
        style={{
          flex: 1,
          marginTop: 15,
          //backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingEnd: 20,
          paddingTop: 20,
          paddingBottom: 100,
          //borderTopWidth: 1,
          //borderTopColor: 'rgba(0, 0, 0, 0.05)',
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
  const [summaryDate, setSummaryDate] = useState('');
  const [transactionDate, setTransactionDate] = useState('');

  const [selected, setSelected] = useState('Unique');
  const keyMapping = { Unique: 'unique', Accumulated: 'accumulated' };
  const evaluatorSummaryData = evaluatorSummary?.[keyMapping[selected]] || [];

  // Example onDayPress functions for each view
  const onSummaryDayPress = day => {
    setSummaryDate(day.dateString);
  };
  const onTransactionDayPress = day => {
    setTransactionDate(day.dateString);
  };

  const monthOrder = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const sortedData = [...evaluatorSummaryData].sort((a, b) => {
    return (
      monthOrder.indexOf(a.Month.slice(0, 3)) -
      monthOrder.indexOf(b.Month.slice(0, 3))
    );
  });

  const renderEvaluator = () => {
    return (
      <View
        style={
          {
            backgroundColor: 'yellow'
          }
        }>


        <View style={{ marginBottom: 5 }}>
          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 6,
              /* borderBottomWidth: 1,
              borderBottomColor: 'silver',
              borderRightWidth: 1,
              borderRightColor: 'silver', */
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
                Transaction Counter -  Evaluator
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
                (() => {
                  const items = [
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
                  ];

                  // Check if all counts are 0
                  const hasResults = items.some(item => item.length > 0);

                  return hasResults ? (
                    items.map(
                      (item, index, arr) =>
                        item.length > 0 && (
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
                                backgroundColor: pressed
                                  ? '#007bff'
                                  : '#ffffff',
                                //borderBottomWidth: 1,
                                //borderBottomColor: 'silver',
                                //borderRightWidth: 1,
                                //borderRightColor: 'silver',

                                // iOS shadow properties
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                              },
                            ]}
                            android_ripple={{}}>
                            {({ pressed }) => (
                              <>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#007bff',
                                    fontFamily: 'Inter_28pt-Bold',
                                    fontSize: 26,
                                  }}>
                                  {item.length}
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
                        ),
                    )
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: 'rgb(241, 239, 239)',
                        paddingVertical: 10,
                        borderRadius: 5,
                      }}>
                      <Text style={{ fontSize: 14, color: '#252525' }}>
                        No Result Found
                      </Text>
                    </View>
                  );
                })()
              )}
            </View>
          </View>
        </View>


        <View style={{ marginBottom: 10 }}>
          {/* Personal */}
          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 8,
              /* borderBottomWidth: 1,
              borderBottomColor: 'silver',
              borderRightWidth: 1,
              borderRightColor: 'silver', */
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
                marginTop: 5,
                gap: 10,
              }}>
              {[
                {
                  label: 'SLRY',
                  count: myTransactionsLength ? myTransactionsLength : 0,
                  screen: 'MyTransactions',
                },
                {
                  label: 'ARE',
                  count: accountabilityData?.length || 0,
                  screen: 'MyAccountability',
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
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                      },
                    ]}
                    android_ripple={{}}>
                    {({ pressed }) => (
                      <>
                        <Text
                          style={{
                            color: pressed ? 'white' : '#007bff',
                            fontFamily: 'Inter_28pt-Bold',
                            fontSize: 26,
                            textShadowColor: 'rgba(0, 0, 0, 0.25)', // Shadow color (black with opacity)
                            textShadowOffset: { width: 1, height: 1 }, // Offset of the shadow
                            textShadowRadius: 1, // Blur radius
                          }}>
                          {item.count}
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
        </View>

        <View style={{ marginBottom: 5 }}>
          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 6,
              /* borderBottomWidth: 1,
              borderBottomColor: 'silver',
              borderRightWidth: 1,
              borderRightColor: 'silver', */
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
                      icon: 'calendar-today', // MaterialCommunityIcons icon name
                    },
                    {
                      label: 'Monthly',
                      screen: 'EvalMonthly',
                      icon: 'calendar-month', // Monthly icon
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
          </View>
        </View>

        {/*FOOTER*/}
        <View
          style={{
            flex: 1,
            marginTop: 15,
            //backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingEnd: 20,
            paddingTop: 20,
            paddingBottom: 100,
            //borderTopWidth: 1,
            //borderTopColor: 'rgba(0, 0, 0, 0.05)',
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
  };


  const renderReceiver = () => (
    <View style={{ backgroundColor: 'pink' }}>
      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            padding: 10,
            marginTop: 10,
            marginHorizontal: 10,
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
          {/*TRANSACTION COUNTER*/}

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
              Transaction Counter - Receiver
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginTop: 5,
              paddingHorizontal: 10,
              gap: 15,
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
                count: receivingCountData?.ReceivedPerMonth?.[0]?.Count,
                screen: 'MonthlyReceivedScreen',
              }
            ].map((item, index) => (
              <Pressable
                key={index}
                onPress={item.label === 'Received This Month' ? openModal : undefined}
                // onPress={() => {
                //   if (item.screen) {
                //     navigation.navigate(item.screen, {
                //       selectedYear,
                //     });
                //   }
                // }}
                style={({ pressed }) => ({
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
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}>
                {({ pressed }) => (
                  <>
                    <Text
                      style={{
                        color: pressed ? 'white' : '#007bff',
                        fontFamily: 'Inter_28pt-Bold',
                        fontSize: 24,
                      }}>
                      {item.count ?? 0}
                    </Text>

                    <Text
                      style={{
                        color: pressed ? 'white' : '#252525',
                        fontFamily: 'Oswald-Light',
                        fontSize: 10,
                        marginTop: 5,
                      }}>
                      {item.label}
                    </Text>
                  </>
                )}
              </Pressable>
            ))}

          </View>
        </View>

        <View
          style={{
            padding: 10,
            marginTop: 10,
            marginHorizontal: 10,
            backgroundColor: 'white',
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 8,
          }}>
          {/*PERSONAL*/}

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
              marginTop: 5,
              paddingHorizontal: 10,
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
            ].map((item, index) => {
              if (item.condition === false) {
                return null;
              }

              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    {
                      width: '32%',
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
                  android_ripple={{ color: 'rgba(200, 200, 200, 0.5)' }}
                  onPress={() => {
                    if (item.screen) {
                      navigation.navigate(item.screen);
                    } else {
                      console.log(`${item.label} card pressed`);
                    }
                  }}>
                  {({ pressed }) => (
                    <>
                      <Text
                        style={{
                          color: pressed ? 'white' : '#007bff',
                          fontFamily: 'Inter_28pt-Bold',
                          fontSize: 26,
                        }}>
                        {item.count}
                      </Text>

                      <Text
                        style={{
                          color: pressed ? 'white' : '#252525',
                          marginTop: 5,
                          textAlign: 'center',
                          fontSize: 14,
                          fontFamily: 'Inter_28pt-Regular',
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

      </View>
    </View>
  );



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

        }}
      >

        {/*TRANSACTIONS VIEW*/}
        {(caoReceiver === '1' || accountType === '4') && (
          <View style={{
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
                }}>
                Transaction Counter
              </Text>
            </View>



            {isReceivedLoading || requestsLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 16, color: '#252525' }}>Loading...</Text>
              </View>
            ) : (
              <>
                {/* RECEIVER VIEW */}
                {caoReceiver === '1' && (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
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
                          count: receivingCountData?.ReceivedPerMonth?.[0]?.Count,
                        }
                      ].map((item, index) => {
                        const isReceivedThisMonth = item.label === 'Received This Month';
                        return (
                          <Pressable
                            key={index}
                            onPress={isReceivedThisMonth ? openModal : undefined}
                            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
                            style={({ pressed }) => ({
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
                          >
                            {({ pressed }) => (
                              <>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#007bff',
                                    fontFamily: 'Inter_28pt-Bold',
                                    fontSize: 22,
                                  }}
                                >
                                  {item.count ?? 0}
                                </Text>
                                <Text
                                  style={{
                                    color: pressed ? 'white' : '#252525',
                                    fontFamily: 'Oswald-Light',
                                    fontSize: 12,
                                    marginTop: 0,
                                  }}
                                >
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

                {/* EVALUATION VIEW */}
                {accountType === '4' && (
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
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
                          style={({ pressed }) => ({
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
                          android_ripple={{}}
                        >
                          {({ pressed }) => (
                            <>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#007bff',
                                  fontFamily: 'Inter_28pt-Bold',
                                  fontSize: 22,
                                }}
                              >
                                {item.length}
                              </Text>
                              <Text
                                style={{
                                  color: pressed ? 'white' : '#252525',
                                  fontFamily: 'Oswald-Light',
                                  fontSize: 10,
                                  marginTop: 0,
                                }}
                              >
                                {item.label}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      ))}
                    </View>


                  </View>
                )}
              </>
            )}

          </View>
        )}

        {/*INSPECTOR VIEW*/}
        {permission === '10' && (
          <View>
            <View style={{
              padding: 10,
              marginVertical: 10,
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
                  }}>
                  Inspection Status
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                {requestsLoading ? (
                  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
                    <Text style={{ fontSize: 16, color: '#252525' }}>Loading...</Text>
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
                        onPress={() => navigation.navigate(item.screen, item.params)}
                        style={({ pressed }) => [
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
                        {({ pressed }) => (
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
                                fontFamily: 'Oswald-Light',
                                fontSize: 12,
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
            <View>
              <RecentActivity
                recentActivityData={recentActivityData}
                recentActivityError={recentActivityError}
                recentActivityLoading={recentActivityLoading}
                navigation={navigation}
              />
            </View>
          </View>
        )}

        {/*INSPECTOR SCHEDULER VIEW*/}
        {privilege === '10' && (
          <View
            style={{
              padding: 10,
              marginBottom: 10,
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
                }}>
                Scheduler
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 15
              }}>
              {requestsLoading ? (
                <View
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 16, color: '#252525' }}>Loading...</Text>
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
                      style={({ pressed }) => [
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
                      {({ pressed }) => (
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

        {/*DEFAULT CONTENT VIEW */}
        {!['10', '5', '8', '9', '11'].includes(privilege) &&
          permission !== '10' &&
          ['1071', '1081', '1061', '1091', '8751', '1031', 'BAAC',].includes(
            officeCode,
          ) && (
            <View>
              <View
                style={{
                  padding: 10,
                  marginVertical: 10,
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
                }}
              >
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    paddingBottom: 5,
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_28pt-SemiBold',
                      color: '#252525',
                      fontSize: 16,
                    }}
                  >
                    Tracking Summary
                  </Text>
                </View>

                {accountType === '1' ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingTop: 10,
                      paddingBottom: 10,
                      marginStart: 5,
                    }}
                  >
                    {trackSumLoading ? (
                      <Text style={{ textAlign: 'center' }}>Loading...</Text>
                    ) : trackSumError ? (
                      <Text style={{ textAlign: 'center', color: 'red' }}>
                        Error loading data
                      </Text>
                    ) : itemsToShowTrackSum?.length === 0 ? (
                      <Text style={{ textAlign: 'center' }}>No results found</Text>
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
                            android_ripple={{ color: 'rgba(0, 0, 0, 0.2)' }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: 'Inter_28pt-Bold',
                                  fontSize: 16,
                                  color: item.Status.includes('Pending')
                                    ? 'rgb(248, 12, 12)'
                                    : 'rgb(8, 112, 231)',
                                  width: '20%',
                                  textAlign: 'right',
                                  paddingRight: 10,
                                  alignSelf: 'center',
                                }}
                              >
                                {item.Count}
                              </Text>
                              <View style={{ width: '80%' }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter_28pt-Light',
                                    fontSize: 14,
                                  }}
                                >
                                  {item.Status}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        ))}

                        {trackSumData?.length > 5 && (
                          <View style={{ alignSelf: 'flex-end' }}>
                            <Pressable
                              onPress={() => setShowAll((prev) => !prev)}
                              style={{
                                padding: 10,
                                marginTop: 10,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  color: 'rgb(8, 112, 231)',
                                  fontWeight: 'bold',
                                }}
                              >
                                {showAll ? 'Show Less' : 'Show More'}
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                ) : (
                  <View>
                    {regTrackSumLoading ? (
                      <Text style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
                        Loading...
                      </Text>
                    ) : regTrackSumError ? (
                      <Text style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>
                        Error loading data
                      </Text>
                    ) : itemsToShowRegTrackSum?.length === 0 ? (
                      <Text style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
                        No results found
                      </Text>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 15,
                            marginBottom: 5
                          }}
                        >
                          {itemsToShowRegTrackSum?.map((item, index) => {
                            console.log(`Item ${index} - Status: ${item.Status}, Count: ${item.Count}`);

                            return (
                              <Pressable
                                key={index}
                                onPress={() =>
                                  navigation.navigate('RegTrackingSummaryScreen', {
                                    selectedItem: item,
                                  })
                                }
                                android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
                                style={({ pressed }) => [
                                  {
                                    width: '30%',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                    borderRadius: 5,
                                    elevation: 1,
                                    backgroundColor: pressed ? '#007bff' : '#ffffff',
                                    borderBottomWidth: 2,
                                    borderBottomColor: 'silver',
                                    borderRightWidth: 2,
                                    borderRightColor: 'silver',
                                  },
                                ]}
                              >
                                {({ pressed }) => (
                                  <>
                                    <Text
                                      style={{
                                        fontFamily: 'Inter_28pt-Bold',
                                        fontSize: 22,
                                        fontWeight: '700',
                                        color:
                                          pressed && item.Status.includes('Pending')
                                            ? 'white' : '#007bff',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {item.Count}
                                    </Text>
                                    <Text
                                      style={{
                                        color: item.Status.includes('Pending')
                                          ? 'rgb(248, 12, 12)'
                                          : '#252525',
                                        fontFamily: 'Oswald-Light',
                                        fontSize: 10,
                                        textAlign: 'center',
                                      }}
                                    >
                                      {item.Status}
                                    </Text>
                                  </>
                                )}
                              </Pressable>
                            );
                          })}

                        </View>

                        {regTrackSumData?.length > 5 && (
                          <Pressable
                            onPress={() => setShowAll((prev) => !prev)}
                            style={{
                              marginTop: 10,
                              alignItems: 'center',
                              paddingVertical: 8,
                            }}
                          >
                            <Text
                              style={{
                                color: '#0870E7',
                                fontWeight: '600',
                                fontSize: 14,
                              }}
                            >
                              {showAll ? 'Show Less' : 'Show More'}
                            </Text>
                          </Pressable>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>


            </View>

          )}


        <View
          style={{
            padding: 10,
            marginTop: 10,
            backgroundColor: 'white',
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 6,
            /* borderBottomWidth: 1,
            borderBottomColor: 'silver',
            borderRightWidth: 1,
            borderRightColor: 'silver', */
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
                    icon: 'calendar-today', // MaterialCommunityIcons icon name
                  },
                  {
                    label: 'Monthly',
                    screen: 'EvalMonthly',
                    icon: 'calendar-month', // Monthly icon
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
                        width: '30%',
                        alignItems: 'center',
                        paddingVertical: 10,
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
        </View>

        {/*PERSONAL VIEW */}
        <View style={{
          padding: 10,
          marginTop: 10,
          marginBottom: 60,
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
            ].map((item, index) => {
              if (item.condition === false) {
                return null;
              }

              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
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
                  android_ripple={{ color: 'rgba(200, 200, 200, 0.5)' }}
                  onPress={() => {
                    if (item.screen) {
                      navigation.navigate(item.screen);
                    } else {
                      console.log(`${item.label} card pressed`);
                    }
                  }}>
                  {({ pressed }) => (
                    <>
                      <Text
                        style={{
                          color: pressed ? 'white' : '#007bff',
                          fontFamily: 'Inter_28pt-Bold',
                          fontSize: 26,
                        }}>
                        {item.count}
                      </Text>

                      <Text
                        style={{
                          color: pressed ? 'white' : '#252525',
                          fontFamily: 'Oswald-Light',
                          fontSize: 12,
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
      </View>
    );
  });



  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}>
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
    transform: [{ rotate: '90deg' }],
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
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
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
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
  },
  progressBar: {
    height: '100%',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
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
  calendar: { marginBottom: 10 },
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
