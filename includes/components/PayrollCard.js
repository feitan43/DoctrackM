import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  TouchableHighlight,
  ActivityIndicator, // Import ActivityIndicator for better loading UI
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for chevron icons

// --- Reusable ProgressBar Component ---
// Unified ProgressBar to handle both main and sub-progress bars
const ProgressBar = React.memo(({percentage, color, trackColor = '#E0E0E0', height = 18}) => {
  const widthAnim = useRef(new Animated.Value(parseInt(percentage, 10) || 0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 750, // Smoother animation duration
      easing: Easing.out(Easing.ease), // Natural easing effect
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBarContainer, {backgroundColor: trackColor, height: height, borderRadius:5/* borderRadius: height / 2 */}]}>
      <Animated.View
        style={[
          styles.progressBar,
          {width: animatedWidth, backgroundColor: color, /* borderRadius: height / 2 */ borderRadius:5},
        ]}
      />
    </View>
  );
});

// --- PayrollCard Component ---
const PayrollCard = ({
  loadingTransSum,
  loadingUseOthers,
  othersVouchersData,
  othersOthersData,
  loadingDetails,
}) => {
  const navigation = useNavigation();

  // State and Animated values for top-level document sections (Vouchers, Others)
  const [visibleDocuments, setVisibleDocuments] = useState(false);
  const vouchersHeightAnim = useRef(new Animated.Value(0)).current;

  const [visibleDocumentsOthers, setVisibleDocumentsOthers] = useState(false);
  const othersHeightAnim = useRef(new Animated.Value(0)).current;

  // State for toggling visibility of status counts within each document type (e.g., PR, PO)
  const [visibleStatusCounts, setVisibleStatusCounts] = useState({});
  // Ref to hold Animated values for each individual document type's status list
  const statusHeights = useRef({});

  // Animation effect for Vouchers list expansion/collapse
  useEffect(() => {
    Animated.timing(vouchersHeightAnim, {
      toValue: visibleDocuments ? 500 : 0, // A sufficiently large max height for content, adjust as needed
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [visibleDocuments]);

  // Animation effect for Others list expansion/collapse
  useEffect(() => {
    Animated.timing(othersHeightAnim, {
      toValue: visibleDocumentsOthers ? 500 : 0, // A sufficiently large max height
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [visibleDocumentsOthers]);

  // Handler for toggling individual document type status counts with animation
  const toggleStatusVisibility = useCallback(documentType => {
    setVisibleStatusCounts(prevState => {
      const isVisible = !prevState[documentType];
      // Initialize Animated.Value for this documentType if it doesn't exist
      if (!statusHeights.current[documentType]) {
        statusHeights.current[documentType] = new Animated.Value(0);
      }
      Animated.timing(statusHeights.current[documentType], {
        toValue: isVisible ? 300 : 0, // Max height for status list, adjust if content varies greatly
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

  // Memoized utility functions for calculations
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

  const getPercentage = useCallback((checkReleasedCount, totalDocumentTypeCount) => {
    if (totalDocumentTypeCount === 0) {
      return 0;
    }
    return (checkReleasedCount / totalDocumentTypeCount) * 100;
  }, []);

  const getPercentageOthers = useCallback((
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
  }, []);

  // Calculate percentages
  const checkReleasedCount = getTotalCheckReleasedCount(othersVouchersData);
  const totalDocumentTypeCount = getSumOfDocumentTypeCount(othersVouchersData);
  const checkReleasedOthersCount = getTotalCheckReleasedCount(othersOthersData);
  const caoReleasedOthersCount = getTotalCAOReleasedCount(othersOthersData);
  const totalDocumentTypeOthersCount = getSumOfDocumentTypeCount(othersOthersData);

  const percentageVouchers = getPercentage(checkReleasedCount, totalDocumentTypeCount);
  const percentageOthers = getPercentageOthers(
    checkReleasedOthersCount,
    caoReleasedOthersCount,
    totalDocumentTypeOthersCount,
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Payroll Overview</Text>
      </View>

      {loadingTransSum || loadingUseOthers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading payroll data...</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressSection}>
            {/* Vouchers Section */}
            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>Vouchers</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={() => setVisibleDocuments(prevState => !prevState)}>
                <ProgressBar
                  percentage={Math.round(percentageVouchers)}
                  color="#3498DB" // Primary blue for overall progress
                  height={18}
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(percentageVouchers)}%
              </Text>
              <TouchableOpacity onPress={() => setVisibleDocuments(prevState => !prevState)} style={styles.expandIconContainer}>
                <Ionicons
                  name={visibleDocuments ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            <Animated.View style={[styles.subDocumentSection, {maxHeight: vouchersHeightAnim}]}>
              {visibleDocuments && othersVouchersData && othersVouchersData.length > 0 ? (
                othersVouchersData.map((item, index) => (
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
                        onPress={() => toggleStatusVisibility(item.DocumentType)}>
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
                              ? '#2ECC71' // Success green for 100%
                              : '#4A90E2' // Lighter blue for sub-progress
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
                      <TouchableOpacity onPress={() => toggleStatusVisibility(item.DocumentType)} style={styles.expandIconContainer}>
                        <Ionicons
                          name={visibleStatusCounts[item.DocumentType] ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#777"
                        />
                      </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.subStatusContainer, {maxHeight: statusHeights.current[item.DocumentType] || 0}]}>
                      {visibleStatusCounts[item.DocumentType] && (
                        <View style={styles.subStatusList}>
                          {item.StatusCounts.map((statusItem, statusIndex) => (
                            <TouchableHighlight
                              key={statusIndex}
                              activeOpacity={0.6}
                              underlayColor="#F0F0F0" // Light highlight on press
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
                          ))}
                        </View>
                      )}
                    </Animated.View>
                  </View>
                ))
              ) : visibleDocuments && ( // Show no data message if expanded but no data
                <View style={styles.nothingToLoadContainer}>
                  <Text style={styles.nothingToLoadText}>No Vouchers data available.</Text>
                </View>
              )}
            </Animated.View>

            {/* Others Section */}
            <View style={styles.progressRow}>
              <Text style={styles.documentLabel}>Others</Text>
              <TouchableOpacity
                style={styles.progressBarTouchable}
                onPress={() =>
                  setVisibleDocumentsOthers(prevState => !prevState)
                }>
                <ProgressBar
                  percentage={Math.round(percentageOthers)}
                  color="#3498DB"
                  height={18}
                />
              </TouchableOpacity>
              <Text style={styles.percentageText}>
                {Math.round(percentageOthers)}%
              </Text>
              <TouchableOpacity onPress={() => setVisibleDocumentsOthers(prevState => !prevState)} style={styles.expandIconContainer}>
                <Ionicons
                  name={visibleDocumentsOthers ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            <Animated.View style={[styles.subDocumentSection, {maxHeight: othersHeightAnim}]}>
              {visibleDocumentsOthers && othersOthersData && othersOthersData.length > 0 ? (
                othersOthersData.map((item, index) => (
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
                        onPress={() => toggleStatusVisibility(item.DocumentType)}>
                        <ProgressBar
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
                                ? '#2ECC71'
                                : '#4A90E2'
                              : ((item.StatusCounts.find(
                                  status => status.Status === 'Check Released',
                                )?.StatusCount || 0) /
                                  parseInt(item.DocumentTypeCount, 10)) *
                                  100 ===
                                100
                                ? '#2ECC71'
                                : '#4A90E2'
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
                      <TouchableOpacity onPress={() => toggleStatusVisibility(item.DocumentType)} style={styles.expandIconContainer}>
                        <Ionicons
                          name={visibleStatusCounts[item.DocumentType] ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#777"
                        />
                      </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.subStatusContainer, {maxHeight: statusHeights.current[item.DocumentType] || 0}]}>
                      {visibleStatusCounts[item.DocumentType] && (
                        <View style={styles.subStatusList}>
                          {item.StatusCounts.map((statusItem, statusIndex) => (
                            <TouchableHighlight
                              key={statusIndex}
                              activeOpacity={0.6}
                              underlayColor="#F0F0F0"
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
                          ))}
                        </View>
                      )}
                    </Animated.View>
                  </View>
                ))
              ) : visibleDocumentsOthers && ( // Show no data message if expanded but no data
                <View style={styles.nothingToLoadContainer}>
                  <Text style={styles.nothingToLoadText}>No Others data available.</Text>
                </View>
              )}
            </Animated.View>
          </View>
        </>
      )}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    padding: 18, // Increased padding for more breathing room
    marginTop: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 5, // More rounded corners
    elevation: 4, // Slightly stronger shadow for a lifted appearance
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1, // Subtle shadow for depth
    shadowRadius: 6, // Larger shadow radius for a softer look
  },
  sectionTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE', // Lighter, more modern separator
    paddingBottom: 12, // More padding below title
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Inter_28pt-Bold',
    color: '#2C3E50', // Darker, more prominent title color
    fontSize: 20, // Slightly larger font for main title
    marginStart: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30, // Ample vertical padding for loading state
  },
  loadingText: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 16,
    color: '#7F8C8D', // Muted text color for loading message
    marginTop: 10,
  },
  progressSection: {
    paddingVertical: 5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12, // More vertical padding for each main row
    borderBottomWidth: StyleSheet.hairlineWidth, // Very thin separator
    borderBottomColor: '#F5F5F5', // Light separator between main sections
  },
  documentLabel: {
    fontFamily: 'Inter_28pt-Regular',
    width: 80, // Slightly wider to accommodate labels
    textAlign: 'left',
    fontSize: 16, // Consistent font size with percentage
    color: '#34495E', // Darker text for labels
  },
  progressBarTouchable: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: 10, // Increased horizontal margin around the progress bar
  },
  percentageText: {
    fontSize: 16,
    fontFamily: 'Inter_28pt-Bold',
    paddingHorizontal: 5,
    textAlign: 'right',
    width: 60,
    color: '#2C3E50', // Darker, bold percentage text
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#E0E0E0', // Light gray track for all progress bars
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  expandIconContainer: {
    paddingLeft: 10, // Provides a good touch target for the icon
  },

  // Sub-Document Section (for Vouchers/Others lists of specific document types)
  subDocumentSection: {
    overflow: 'hidden', // Essential for animated height
    paddingVertical: 5, // Small padding for spacing from the top row
  },
  subDocumentItemWrapper: {
    backgroundColor: '#FFFFFF', // Each sub-document gets its own card look
    marginBottom: 10, // Space between each document type item
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth, // Very subtle border
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04, // Very subtle shadow
    shadowRadius: 2,
    elevation: 1,
  },
  documentTypeHeader: {
    backgroundColor: '#F5F8FA', // Distinct background for sub-document type headers
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  documentTypeHeaderText: {
    color: '#34495E',
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 14,
    textAlign: 'left',
    textTransform: 'capitalize',
    fontWeight: '500', // Slightly bolder for better readability
  },
  subDocumentRow: {
    paddingHorizontal: 15,
    paddingVertical: 12, // Consistent padding
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth, // Separator for status list trigger
    borderBottomColor: '#F0F0F0',
  },
  subDocumentCount: {
    color: '#34495E',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'right',
    width: 40,
    marginRight: 5,
  },
  subDocumentProgressBarTouchable: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: 10,
  },
  subDocumentPercentageText: {
    fontSize: 14,
    fontFamily: 'Inter_28pt-Bold',
    paddingHorizontal: 5,
    textAlign: 'right',
    width: 60,
    color: '#34495E',
  },

  // Sub-Status Container (for specific statuses like "Check Released")
  subStatusContainer: {
    overflow: 'hidden', // Essential for animated height
    backgroundColor: '#FDFDFD', // Very light background for status list
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  subStatusList: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  subStatusTouchable: {
    paddingVertical: 8, // Generous touch area
    paddingHorizontal: 15,
    borderRadius: 5, // Subtle rounding on press feedback
  },
  subStatusItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4, // Tighter spacing for individual status items
  },
  subStatusText: {
    color: '#555555', // Slightly lighter text for status names
    fontSize: 13,
    fontFamily: 'Inter_28pt-Regular',
    letterSpacing: 0.2,
    textAlign: 'left',
    flex: 1, // Allows text to take available space
  },
  subStatusCount: {
    color: '#34495E', // Consistent darker count color
    fontSize: 13,
    fontFamily: 'Inter_28pt-Bold', // Bold for counts
    textAlign: 'right',
    width: 40, // Fixed width for alignment
    letterSpacing: 0.2,
  },
  nothingToLoadContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    borderRadius: 8,
    marginTop: 5,
  },
  nothingToLoadText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'center',
  },
});

export default PayrollCard;