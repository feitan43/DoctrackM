import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  TouchableHighlight,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

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

const AnimatedStatusView = ({
  showStatus,
  data,
  slideAnim,
  navigation,
  officeName,
  loadingTransSum,
}) => {
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
        <View style={styles.animatedStatusViewContent}>
          {data && data.StatusCountData && data.StatusCountData.length > 0 ? (
            data.StatusCountData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusItemTouchable}
                onPress={() =>
                  navigation.navigate('StatusView', {
                    selectedItem: item,
                    statusViewResults: data.StatusViewResults[item.Status],
                    officeName,
                    loadingTransSum,
                  })
                }>
                <View style={styles.statusItemRow}>
                  <Text style={styles.statusText}>{item.Status}</Text>
                  <Text style={styles.statusCount}>{item.StatusCount}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.nothingToLoadContainer}>
              <Text style={styles.nothingToLoadText}>Nothing to Load...</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const TransactionProgress = ({
  dataPR,
  dataPO,
  dataPX,
  PRPercentage,
  POPercentage,
  PXPercentage,
  loadingTransSum,
  loadingUseOthers,
  othersVouchersData,
  othersOthersData,
  officeName,
  loadingDetails,
}) => {
  const navigation = useNavigation();

  const [showPRStatus, setShowPRStatus] = useState(false);
  const [showPOStatus, setShowPOStatus] = useState(false);
  const [showPXStatus, setShowPXPXStatus] = useState(false);
  const [visibleStatusCounts, setVisibleStatusCounts] = useState({});
  const [visibleDocuments, setVisibleDocuments] = useState(false);
  const [visibleDocumentsOthers, setVisibleDocumentsOthers] = useState(false);

  const handlePRStatus = useCallback(() => {
    setShowPRStatus(prevState => !prevState);
  }, []);

  const handlePOStatus = useCallback(() => {
    setShowPOStatus(prevState => !prevState);
  }, []);

  const handlePXStatus = useCallback(() => {
    setShowPXPXStatus(prevState => !prevState);
  }, []);

  const toggleVisibility = documentType => {
    setVisibleStatusCounts(prevState => ({
      ...prevState,
      [documentType]: !prevState[documentType],
    }));
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

  const slideAnimPR = useRef(new Animated.Value(-100)).current;
  const slideAnimPO = useRef(new Animated.Value(-100)).current;
  const slideAnimPX = useRef(new Animated.Value(-100)).current;

  return (
    <View style={styles.container}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Transaction Progress</Text>
      </View>

      {loadingTransSum || loadingUseOthers ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>PR</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={handlePRStatus}>
                <ProgressBar
                  percentage={PRPercentage}
                  color="rgba(42, 126, 216, 0.75)"
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(PRPercentage)}%
              </Text>
            </View>
            <AnimatedStatusView
              showStatus={showPRStatus}
              data={dataPR}
              slideAnim={slideAnimPR}
              navigation={navigation}
              officeName={officeName}
              loadingTransSum={loadingTransSum}
            />

            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>PO</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={handlePOStatus}>
                <ProgressBar
                  percentage={POPercentage}
                  color="rgba(42, 126, 216, 0.50)"
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(POPercentage)}%
              </Text>
            </View>
            <AnimatedStatusView
              showStatus={showPOStatus}
              data={dataPO}
              slideAnim={slideAnimPO}
              navigation={navigation}
              officeName={officeName}
              loadingTransSum={loadingTransSum}
            />

            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>PX</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={handlePXStatus}>
                <ProgressBar
                  percentage={PXPercentage}
                  color="rgba(42, 126, 216, 0.25)"
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(PXPercentage)}%
              </Text>
            </View>
            <AnimatedStatusView
              showStatus={showPXStatus}
              data={dataPX}
              slideAnim={slideAnimPX}
              navigation={navigation}
              officeName={officeName}
              loadingTransSum={loadingTransSum}
            />

            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>Vouchers</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={() => setVisibleDocuments(prevState => !prevState)}>
                <ProgressBar
                  percentage={Math.round(percentage)}
                  color="rgba(42, 126, 216, 0.15)"
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(percentage)}%
              </Text>
            </View>
            <View style={styles.subDocumentSection}>
              {visibleDocuments &&
                othersVouchersData.map((item, index) => (
                  <View key={index} style={styles.subDocumentContainer}>
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
                    </View>
                    {visibleStatusCounts[item.DocumentType] && (
                      <View style={styles.subStatusContainer}>
                        <View style={styles.subStatusList}>
                          {item.StatusCounts.map((statusItem, statusIndex) => (
                            <View
                              key={statusIndex}
                              style={styles.subStatusItemRow}>
                              <TouchableHighlight
                                activeOpacity={0.5}
                                underlayColor="rgba(223, 231, 248, 0.3)"
                                style={styles.subStatusTouchable}
                                onPress={() => {
                                  navigation.navigate('Others', {
                                    selectedItem: item.DocumentType,
                                    details: item.Details[statusItem.Status],
                                    loadingDetails,
                                  });
                                }}>
                                <View style={styles.subStatusContent}>
                                  <Text style={styles.subStatusText}>
                                    {statusItem.Status}
                                  </Text>
                                  <Text style={styles.subStatusCount}>
                                    {statusItem.StatusCount}
                                  </Text>
                                </View>
                              </TouchableHighlight>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>Others</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={() =>
                  setVisibleDocumentsOthers(prevState => !prevState)
                }>
                <ProgressBar
                  percentage={percentageOthers}
                  color="rgba(42, 126, 216, 0.15)"
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(percentageOthers)}%
              </Text>
            </View>
            <View style={styles.subDocumentSection}>
              {visibleDocumentsOthers &&
                othersOthersData.map((item, index) => (
                  <View key={index} style={styles.subDocumentContainer}>
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
                        onPress={() => toggleVisibility(item.DocumentType)}>
                        <ProgressBarOthers
                          percentage={
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
                                ? 'orange'
                                : '#448eed'
                              : ((item.StatusCounts.find(
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
                    </View>
                    {visibleStatusCounts[item.DocumentType] && (
                      <View style={styles.subStatusContainer}>
                        <View style={styles.subStatusList}>
                          {item.StatusCounts.map((statusItem, statusIndex) => (
                            <View
                              key={statusIndex}
                              style={styles.subStatusItemRow}>
                              <TouchableHighlight
                                activeOpacity={0.5}
                                underlayColor="rgba(223, 231, 248, 0.3)"
                                style={styles.subStatusTouchable}
                                onPress={() => {
                                  navigation.navigate('Others', {
                                    selectedItem: item.DocumentType,
                                    details: item.Details[statusItem.Status],
                                    loadingDetails,
                                  });
                                }}>
                                <View style={styles.subStatusContent}>
                                  <Text style={styles.subStatusText}>
                                    {statusItem.Status}
                                  </Text>
                                  <Text style={styles.subStatusCount}>
                                    {statusItem.StatusCount}
                                  </Text>
                                </View>
                              </TouchableHighlight>
                            </View>
                          ))}
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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingBottom: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#252525',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 16,
    color: '#888',
  },
  progressSection: {
    paddingVertical: 5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  documentLabel: {
    fontFamily: 'Inter_28pt-Regular',
    width: 70,
    textAlign: 'left',
    fontSize: 15,
    color: '#333',
  },
  progressBarTouchable: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  percentageText: {
    fontSize: 15,
    fontFamily: 'Inter_28pt-Bold',
    paddingHorizontal: 5,
    textAlign: 'right',
    width: 60,
    color: '#252525',
  },
  progressBarContainer: {
    height: 25,
    width: '100%',
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  animatedStatusViewContent: {
    borderRightWidth: 1,
    borderColor: 'rgba(197, 197, 197, 0.15)',
    backgroundColor: 'rgba(221, 221, 221, 0.15)',
    paddingEnd: 20,
    paddingVertical: 10,
  },
  statusItemTouchable: {
    paddingVertical: 8,
    paddingEnd: 10,
  },
  statusItemRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingStart: 20,
  },
  statusText: {
    color: '#555',
    fontSize: 13,
    fontFamily: 'Inter_28pt-Regular',
    letterSpacing: 0.5,
    textAlign: 'right',
    minWidth: 100,
  },
  statusCount: {
    width: 40,
    color: '#252525',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  nothingToLoadContainer: {
    maxWidth: 220,
    alignSelf: 'flex-end',
  },
  nothingToLoadText: {
    color: 'black',
    fontSize: 13,
    fontFamily: 'Inter_28pt-Regular',
    opacity: 0.5,
    textAlign: 'right',
    marginEnd: 10,
    paddingVertical: 15,
  },
  subDocumentSection: {
    width: '100%',
    alignSelf: 'flex-end',
  },
  subDocumentContainer: {
    backgroundColor: 'white',
    //paddingBottom: 10,
    width: '100%',
    alignSelf: 'flex-end',
  },
  documentTypeHeader: {
    backgroundColor: 'rgba(223, 231, 248, 0.5)',
    paddingVertical: 10,
    paddingStart: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  documentTypeHeaderText: {
    color: '#444',
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 13,
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  subDocumentRow: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subDocumentCount: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'right',
    width: 40,
  },
  subDocumentProgressBarTouchable: {
    flex: 0.8,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  progressBarContainerOthers: {
    height: 20,
    width: '100%',
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  subDocumentPercentageText: {
    fontSize: 14,
    fontFamily: 'Inter_28pt-Bold',
    paddingHorizontal: 5,
    textAlign: 'right',
    width: 60,
  },
  subStatusContainer: {
    backgroundColor: 'rgba(221, 221, 221, 0.1)',
    paddingEnd: 20,
    paddingVertical: 15,
  },
  subStatusList: {
    marginBottom: 10,
  },
  subStatusItemRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 6,
    paddingStart: 20,
    borderRightWidth: 1,
    borderColor: 'silver',
  },
  subStatusTouchable: {
    paddingHorizontal: 10,
  },
  subStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subStatusText: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'Inter_28pt-Regular',
    letterSpacing: 0.5,
    textAlign: 'right',
    minWidth: 90,
  },
  subStatusCount: {
    width: 35,
    color: '#252525',
    fontSize: 13,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
});

export default TransactionProgress;
