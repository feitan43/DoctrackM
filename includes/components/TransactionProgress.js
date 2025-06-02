// components/TransactionProgress.js
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
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

const AnimatedStatusView = ({showStatus, data, slideAnim, navigation, officeName, loadingTransSum}) => {
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
  const [showPXStatus, setShowPXStatus] = useState(false);
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
    setShowPXStatus(prevState => !prevState);
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
    <View
      style={{
        padding: 10,
        marginTop: 15,
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 1,
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
                  navigation={navigation}
                  officeName={officeName}
                  loadingTransSum={loadingTransSum}
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
                  navigation={navigation}
                  officeName={officeName}
                  loadingTransSum={loadingTransSum}
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
                  navigation={navigation}
                  officeName={officeName}
                  loadingTransSum={loadingTransSum}
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
                    flex: 1,
                    marginVertical: 10,
                  }}
                  onPress={() => setVisibleDocuments(prevState => !prevState)}>
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
                            color: 'black',
                            fontSize: 14,
                            fontFamily: 'Inter_28pt-Regular',
                            textAlign: 'right',
                          }}>
                          {item.DocumentTypeCount}
                        </Text>
                        <View style={{flex: 1}}>
                          <TouchableOpacity
                            style={{marginVertical: 10}}
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
                            fontSize: 14,
                            fontFamily: 'Inter_28pt-Bold',
                            paddingHorizontal: 5,
                            textAlign: 'right',
                            width: 50,
                          }}>
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
                        <View
                          style={{
                            width: '100%',
                            backgroundColor: 'rgba(221, 221, 221, 0.23)',
                            paddingEnd: 20,
                            paddingVertical: 10,
                          }}>
                          <View style={{}}>
                            <View style={{marginBottom: 10}}>
                              {item.StatusCounts.map((statusItem, statusIndex) => (
                                <View
                                  key={statusIndex} // Moved key here
                                  style={{
                                    flexDirection: 'row',
                                    paddingStart: 20,
                                    paddingBottom: 10,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                  }}>
                                  <TouchableOpacity
                                    activeOpacity={0.5}
                                    style={{
                                      paddingHorizontal: 10,
                                    }}
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
                                          fontFamily: 'Inter_28pt-Regular',
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
                                          fontFamily: 'Inter_28pt-Regular',
                                          textAlign: 'right',
                                          letterSpacing: 1,
                                        }}>
                                        {statusItem.StatusCount}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              ))}
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
                    flex: 1,
                    marginVertical: 10,
                  }}
                  onPress={() => setVisibleDocumentsOthers(prevState => !prevState)}>
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
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'Inter_28pt-Regular',
                          textAlign: 'right',
                        }}>
                        {item.DocumentTypeCount}
                      </Text>
                      <View style={{flex: 5, justifyContent: 'flex-end', marginEnd: 5}}>
                        <TouchableOpacity
                          style={{paddingVertical: 10}}
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
                      <View style={[styles.table, {}]}>
                        <View style={styles.column}></View>
                        <View style={styles.column}></View>
                        <View style={[styles.column, {flexGrow: 5}]}>
                          <View style={{marginBottom: 10}}>
                            {item.StatusCounts.map((statusItem, statusIndex) => (
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
                                      details: item.Details[statusItem.Status],
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
                                        fontFamily: 'Inter_28pt-Regular',
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
                                        fontFamily: 'Inter_28pt-Regular',
                                        textAlign: 'right',
                                        letterSpacing: 1,
                                      }}>
                                      {statusItem.StatusCount}
                                    </Text>
                                  </View>
                                </TouchableHighlight>
                              </View>
                            ))}
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
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    height: 25,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressBarContainerOthers: {
    height: 25,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  table: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
  },
});

export default TransactionProgress;