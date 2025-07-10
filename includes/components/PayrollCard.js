import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProgressBar = React.memo(
  ({percentage, color, trackColor = '#E0E0E0', height = 18}) => {
    const widthAnim = useRef(
      new Animated.Value(parseInt(percentage, 10) || 0),
    ).current;

    useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 750,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, [percentage]);

    const animatedWidth = widthAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <View
        style={[
          styles.progressBarContainer,
          {backgroundColor: trackColor, height: height, borderRadius: 5},
        ]}>
        <Animated.View
          style={[
            styles.progressBar,
            {width: animatedWidth, backgroundColor: color, borderRadius: 5},
          ]}
        />
      </View>
    );
  },
);

const PayrollCard = ({
  loadingTransSum,
  loadingUseOthers,
  othersVouchersData,
  othersOthersData,
  loadingDetails,
}) => {
  const navigation = useNavigation();

  const [visibleDocuments, setVisibleDocuments] = useState(false);
  const vouchersHeightAnim = useRef(new Animated.Value(0)).current;

  const [visibleDocumentsOthers, setVisibleDocumentsOthers] = useState(false);
  const othersHeightAnim = useRef(new Animated.Value(0)).current;

  const [visibleStatusCounts, setVisibleStatusCounts] = useState({});
  const statusHeights = useRef({});

  useEffect(() => {
    Animated.timing(vouchersHeightAnim, {
      toValue: visibleDocuments ? 3000 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [visibleDocuments]);

  useEffect(() => {
    Animated.timing(othersHeightAnim, {
      toValue: visibleDocumentsOthers ? 3000 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [visibleDocumentsOthers]);

  const toggleStatusVisibility = useCallback(documentType => {
    setVisibleStatusCounts(prevState => {
      const isVisible = !prevState[documentType];
      if (!statusHeights.current[documentType]) {
        statusHeights.current[documentType] = new Animated.Value(0);
      }
      Animated.timing(statusHeights.current[documentType], {
        toValue: isVisible ? 3000 : 0,
        duration: 250,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
      return {
        ...prevState,
        [documentType]: isVisible,
      };
    });
  }, []);

  const getSumOfDocumentTypeCount = useCallback(data => {
    if (!data || !Array.isArray(data)) {
      return 0;
    }
    return data.reduce((sum, item) => {
      const count = parseInt(item.DocumentTypeCount, 10) || 0;
      return sum + count;
    }, 0);
  }, []);

  const getTotalCheckReleasedCount = useCallback(data => {
    if (!Array.isArray(data)) {
      return 0;
    }
    return data
      .flatMap(doc =>
        Array.isArray(doc.StatusCounts)
          ? doc.StatusCounts.filter(item => item.Status === 'Check Released')
          : [],
      )
      .reduce((sum, item) => sum + parseInt(item.StatusCount, 10) || 0, 0);
  }, []);

  const getTotalCAOReleasedCount = useCallback(data => {
    if (!Array.isArray(data)) {
      return 0;
    }
    return data
      .flatMap(doc =>
        doc.DocumentType === 'Liquidation' && Array.isArray(doc.StatusCounts)
          ? doc.StatusCounts.filter(item => item.Status === 'CAO Released')
          : [],
      )
      .reduce((sum, item) => sum + parseInt(item.StatusCount, 10) || 0, 0);
  }, []);

  const getPercentage = useCallback(
    (checkReleasedCount, totalDocumentTypeCount) => {
      if (totalDocumentTypeCount === 0) {
        return 0;
      }
      return (checkReleasedCount / totalDocumentTypeCount) * 100;
    },
    [],
  );

  const getPercentageOthers = useCallback(
    (checkReleasedCount, caoReleasedOthersCount, totalDocumentTypeCount) => {
      if (totalDocumentTypeCount === 0) {
        return 0;
      }
      return (
        ((checkReleasedCount + caoReleasedOthersCount) /
          totalDocumentTypeCount) *
        100
      );
    },
    [],
  );

  const checkReleasedCount = getTotalCheckReleasedCount(othersVouchersData);
  const totalDocumentTypeCount = getSumOfDocumentTypeCount(othersVouchersData);
  const checkReleasedOthersCount = getTotalCheckReleasedCount(othersOthersData);
  const caoReleasedOthersCount = getTotalCAOReleasedCount(othersOthersData);
  const totalDocumentTypeOthersCount =
    getSumOfDocumentTypeCount(othersOthersData);

  const percentageVouchers = getPercentage(
    checkReleasedCount,
    totalDocumentTypeCount,
  );
  const percentageOthers = getPercentageOthers(
    checkReleasedOthersCount,
    caoReleasedOthersCount,
    totalDocumentTypeOthersCount,
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Vouchers and Others</Text>
      </View>

      {loadingTransSum || loadingUseOthers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading payroll data...</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>Vouchers</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={() => setVisibleDocuments(prevState => !prevState)}>
                <ProgressBar
                  percentage={Math.round(percentageVouchers)}
                  color="#4A90E2"
                  height={18}
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(percentageVouchers)}%
              </Text>
              <TouchableOpacity
                onPress={() => setVisibleDocuments(prevState => !prevState)}
                style={styles.expandIconContainer}>
                <Ionicons
                  name={visibleDocuments ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <Animated.View
              style={[
                styles.subDocumentSection,
                {maxHeight: vouchersHeightAnim},
              ]}>
              {visibleDocuments &&
              othersVouchersData &&
              othersVouchersData.length > 0
                ? othersVouchersData.map((item, index) => (
                    <View key={index} style={styles.subDocumentItemWrapper}>
                      <View style={styles.documentTypeHeader}>
                        <Text style={styles.documentTypeHeaderText}>
                          {item.DocumentType}
                        </Text>
                      </View>
                      <View style={styles.subDocumentRow}>
                        <Text style={styles.subDocumentCount}>
                          {item.DocumentTypeCount}
                        </Text>
                        <TouchableOpacity
                          style={styles.subDocumentProgressBarTouchable}
                          onPress={() =>
                            toggleStatusVisibility(item.DocumentType)
                          }>
                          <ProgressBar
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
                                ? '#2ECC71'
                                : '#87CEEB'
                            }
                            height={16}
                          />
                        </TouchableOpacity>
                        <Text style={styles.subDocumentPercentageText}>
                          {Math.round(
                            ((item.StatusCounts.find(
                              status => status.Status === 'Check Released',
                            )?.StatusCount || 0) /
                              parseInt(item.DocumentTypeCount, 10)) *
                              100,
                          )}{' '}
                          %
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            toggleStatusVisibility(item.DocumentType)
                          }
                          style={styles.expandIconContainer}>
                          <Ionicons
                            name={
                              visibleStatusCounts[item.DocumentType]
                                ? 'chevron-up'
                                : 'chevron-down'
                            }
                            size={18}
                            color="#777"
                          />
                        </TouchableOpacity>
                      </View>
                      <Animated.View
                        style={[
                          styles.subStatusContainer,
                          {
                            maxHeight:
                              statusHeights.current[item.DocumentType] || 0,
                          },
                        ]}>
                        {visibleStatusCounts[item.DocumentType] && (
                          <View style={styles.subStatusList}>
                            {item.StatusCounts.map(
                              (statusItem, statusIndex) => (
                                <TouchableHighlight
                                  key={statusIndex}
                                  activeOpacity={0.7}
                                  underlayColor="#EFEFEF"
                                  style={styles.subStatusTouchable}
                                  onPress={() => {
                                    navigation.navigate('Others', {
                                      selectedItem: item.DocumentType,
                                      details: item.Details[statusItem.Status],
                                      loadingDetails,
                                    });
                                  }}>
                                  <View style={styles.subStatusItemRow}>
                                    <Text style={styles.subStatusText}>
                                      {statusItem.Status}
                                    </Text>
                                    <Text style={styles.subStatusCount}>
                                      {statusItem.StatusCount}
                                    </Text>
                                  </View>
                                </TouchableHighlight>
                              ),
                            )}
                          </View>
                        )}
                      </Animated.View>
                    </View>
                  ))
                : visibleDocuments && (
                    <View style={styles.nothingToLoadContainer}>
                      <Text style={styles.nothingToLoadText}>
                        No Vouchers data available.
                      </Text>
                    </View>
                  )}
            </Animated.View>

            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>Others</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={() =>
                  setVisibleDocumentsOthers(prevState => !prevState)
                }>
                <ProgressBar
                  percentage={Math.round(percentageOthers)}
                  color="#4A90E2"
                  height={18}
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(percentageOthers)}%
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setVisibleDocumentsOthers(prevState => !prevState)
                }
                style={styles.expandIconContainer}>
                <Ionicons
                  name={visibleDocumentsOthers ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <Animated.View
              style={[
                styles.subDocumentSection,
                {maxHeight: othersHeightAnim},
              ]}>
              {visibleDocumentsOthers &&
              othersOthersData &&
              othersOthersData.length > 0
                ? othersOthersData.map((item, index) => (
                    <View key={index} style={styles.subDocumentItemWrapper}>
                      <View style={styles.documentTypeHeader}>
                        <Text style={styles.documentTypeHeaderText}>
                          {item.DocumentType}
                        </Text>
                      </View>
                      <View style={styles.subDocumentRow}>
                        <Text style={styles.subDocumentCount}>
                          {item.DocumentTypeCount}
                        </Text>
                        <TouchableOpacity
                          style={styles.subDocumentProgressBarTouchable}
                          onPress={() =>
                            toggleStatusVisibility(item.DocumentType)
                          }>
                          <ProgressBar
                            percentage={
                              item.DocumentType === 'Liquidation'
                                ? ((item.StatusCounts.find(
                                    status => status.Status === 'CAO Released',
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
                                    status => status.Status === 'CAO Released',
                                  )?.StatusCount || 0) /
                                    parseInt(item.DocumentTypeCount, 10)) *
                                    100 ===
                                  100
                                  ? '#2ECC71'
                                  : '#87CEEB'
                                : ((item.StatusCounts.find(
                                    status =>
                                      status.Status === 'Check Released',
                                  )?.StatusCount || 0) /
                                    parseInt(item.DocumentTypeCount, 10)) *
                                    100 ===
                                  100
                                ? '#2ECC71'
                                : '#87CEEB'
                            }
                            height={16}
                          />
                        </TouchableOpacity>
                        <Text style={styles.subDocumentPercentageText}>
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
                          )}{' '}
                          %
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            toggleStatusVisibility(item.DocumentType)
                          }
                          style={styles.expandIconContainer}>
                          <Ionicons
                            name={
                              visibleStatusCounts[item.DocumentType]
                                ? 'chevron-up'
                                : 'chevron-down'
                            }
                            size={18}
                            color="#777"
                          />
                        </TouchableOpacity>
                      </View>
                      <Animated.View
                        style={[
                          styles.subStatusContainer,
                          {
                            maxHeight:
                              statusHeights.current[item.DocumentType] || 0,
                          },
                        ]}>
                        {visibleStatusCounts[item.DocumentType] && (
                          <View style={styles.subStatusList}>
                            {item.StatusCounts.map(
                              (statusItem, statusIndex) => (
                                <TouchableHighlight
                                  key={statusIndex}
                                  activeOpacity={0.7}
                                  underlayColor="#EFEFEF"
                                  style={styles.subStatusTouchable}
                                  onPress={() => {
                                    navigation.navigate('Others', {
                                      selectedItem: item.DocumentType,
                                      details: item.Details[statusItem.Status],
                                      loadingDetails,
                                    });
                                  }}>
                                  <View style={styles.subStatusItemRow}>
                                    <Text style={styles.subStatusText}>
                                      {statusItem.Status}
                                    </Text>
                                    <Text style={styles.subStatusCount}>
                                      {statusItem.StatusCount}
                                    </Text>
                                  </View>
                                </TouchableHighlight>
                              ),
                            )}
                          </View>
                        )}
                      </Animated.View>
                    </View>
                  ))
                : visibleDocumentsOthers && (
                    <View style={styles.nothingToLoadContainer}>
                      <Text style={styles.nothingToLoadText}>
                        No Others data available.
                      </Text>
                    </View>
                  )}
            </Animated.View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionTitleContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_28pt-Bold',
    color: '#5d5d5d',
    fontSize: 18,
    //marginStart: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 10,
  },
  progressSection: {
    paddingVertical: 5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  documentLabel: {
    fontFamily: 'Inter_28pt-Regular',
    width: 90,
    textAlign: 'left',
    fontSize: 16,
    color: '#34495E',
    fontWeight: '500',
  },
  progressBarTouchable: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: 12,
  },
  percentageText: {
    fontSize: 16,
    fontFamily: 'Inter_28pt-Bold',
    paddingHorizontal: 5,
    textAlign: 'right',
    width: 65,
    color: '#2C3E50',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  expandIconContainer: {
    paddingLeft: 12,
  },

  subDocumentSection: {
    overflow: 'hidden',
    paddingVertical: 8,
  },
  subDocumentItemWrapper: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  documentTypeHeader: {
    backgroundColor: '#F7F9FA',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  documentTypeHeaderText: {
    color: '#34495E',
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 15,
    textAlign: 'left',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  subDocumentRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F5F5F5',
  },
  subDocumentCount: {
    color: '#34495E',
    fontSize: 15,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'right',
    width: 45,
    marginRight: 8,
  },
  subDocumentProgressBarTouchable: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: 10,
  },
  subDocumentPercentageText: {
    fontSize: 15,
    fontFamily: 'Inter_28pt-Bold',
    paddingHorizontal: 5,
    textAlign: 'right',
    width: 60,
    color: '#34495E',
  },

  subStatusContainer: {
    overflow: 'hidden',
    backgroundColor: '#FDFDFD',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  subStatusList: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  subStatusTouchable: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  subStatusItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subStatusText: {
    color: '#555555',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    letterSpacing: 0.1,
    textAlign: 'left',
    flex: 1,
  },
  subStatusCount: {
    color: '#34495E',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Bold',
    textAlign: 'right',
    width: 45,
    letterSpacing: 0.1,
  },
  nothingToLoadContainer: {
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    borderRadius: 8,
    marginTop: 5,
  },
  nothingToLoadText: {
    color: '#7F8C8D',
    fontSize: 15,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'center',
  },
});

export default PayrollCard;
