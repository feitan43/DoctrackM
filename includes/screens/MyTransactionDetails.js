import React, {useRef, useMemo, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {insertCommas} from '../utils/insertComma';
import useTransactionHistory from '../api/useTransactionHistory';
import {width, removeHtmlTags} from '../utils';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

const MyTransactionDetails = ({route, navigation}) => {
  const {selectedItem} = route.params;
  const [showHistory, setShowHistory] = useState(false);
  const {transactionsHistory} = useTransactionHistory(selectedItem);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      setShowHistory(false);
    } else {
      setShowHistory(true);
    }
  }, []);

  // --- New: Handle closing the BottomSheet ---
  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close(); // This will close the bottom sheet
  }, []);
  // --- End New ---

  const groupedTimelineData = useMemo(() => {
    const grouped = transactionsHistory.reduce((acc, item) => {
      const date = item.DateModified;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        status: item.Status,
        completion: item.Completion,
      });
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date: date,
        events: grouped[date],
      }));
  }, [transactionsHistory]);

  const getStatusColor = status => {
    if (status.includes('Pending')) return '#FFA500';
    if (status.includes('Approved')) return '#4CAF50';
    if (status.includes('Rejected')) return '#F44336';
    return '#2196F3';
  };

  const renderGroupedTimelineItem = ({item}) => (
    <View style={styles.timelineGroupContainer}>
      <View style={styles.timelineGroupDot} />
      <View style={styles.timelineGroupContent}>
        <Text style={styles.timelineGroupDate}>{item.date}</Text>
        {item.events.map((event, index) => (
          <View key={index} style={styles.timelineEvent}>
            <Text style={styles.timelineStatus}>{event.status}</Text>
            <Text
              style={
                styles.timelineCompletion
              }>{`Completion: ${event.completion}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.headerBackground}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={styles.backButtonRipple}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={{width: 40}} />
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.statusCard,
            {backgroundColor: getStatusColor(selectedItem.Status)},
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <Text style={styles.trackingType}>
              {selectedItem.TrackingType} -{' '}
            </Text>
            <Text style={styles.statusText}>{selectedItem.Status}</Text>
          </View>

          <Text style={styles.dateText}>{selectedItem.DateModified}</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="Year" value={selectedItem.Year} />
          <DetailRow label="TN" value={selectedItem.TrackingNumber} />
          <DetailRow label="Claimant" value={selectedItem.Claimant} />
          <DetailRow label="Document" value={selectedItem.DocumentType} />
          <DetailRow label="Period" value={selectedItem.PeriodMonth} />
          <DetailRow label="Fund" value={selectedItem.Fund} />
          <DetailRow
            label="Amount"
            value={`₱${insertCommas(selectedItem.Amount)}`}
            isAmount
          />
          <DetailRow
            label="Net Amount"
            value={`₱${insertCommas(selectedItem.NetAmount)}`}
            isAmount
          />

          <View style={styles.divider} />

          <DetailRow label="Encoded By" value={selectedItem.Encoder} />
          <DetailRow label="Date Encoded" value={selectedItem.DateEncoded} />
          <DetailRow label="Date Updated" value={selectedItem.DateModified} />
        </View>

        {selectedItem.Remarks && (
          <View style={styles.remarksCard}>
            <Text style={styles.sectionTitle}>Pending Notes</Text>
            <View style={styles.remarksContent}>
              <Text style={styles.remarksText}>
                {removeHtmlTags(selectedItem.Remarks)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.historyToggle}
          onPress={handlePresentPress}>
          <Text style={styles.historyToggleText}>Show History</Text>
          <Icon name="chevron-up" size={20} color="#007AFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* BottomSheet for Transaction History */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanOnContent={true}
        enableHandlePanningGesture={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
        /*  backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )} */
      >
        <View style={styles.bottomSheetContent}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.modalTitle}>Transaction Timeline</Text>

            <TouchableOpacity
              onPress={handleClosePress}
              style={styles.closeButton}>
              <Icon name="close-circle-outline" size={28} color="#999" />
            </TouchableOpacity>
          </View>
          {groupedTimelineData.length > 0 ? (
            <BottomSheetFlatList
              data={groupedTimelineData}
              keyExtractor={(item, index) => item.date + index}
              renderItem={renderGroupedTimelineItem}
              scrollEnabled={true}
              contentContainerStyle={styles.bottomSheetFlatListContent}
            />
          ) : (
            <Text style={styles.noHistoryText}>
              No transaction history available.
            </Text>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const DetailRow = ({label, value, isAmount = false}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, isAmount && styles.amountValue]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonRipple: {
    color: 'rgba(255,255,255,0.2)',
    borderless: true,
    radius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Adjust as needed to make space for the bottom sheet
  },
  statusCard: {
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingHorizontal: 10,
  },
  trackingType: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '400',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    color: '#007AFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  remarksCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  remarksContent: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  remarksText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#E0F2F7',
    borderRadius: 8,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyToggleText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomSheetBackground: {
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  bottomSheetHandle: {
    backgroundColor: '#ccc',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    // No paddingHorizontal here directly, handled by FlatList contentContainerStyle
  },
  bottomSheetFlatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10, // Add some padding at the top of the list itself
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    //textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16, // Ensure title has padding even if FlatList handles its own
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 16,
  },
  // --- New style for the close button ---
  closeButton: {
    position: 'absolute', // Position it absolutely
    //backgroundColor:'red',
    paddingHorizontal:10,
    //top: 10,
    right: 16,
    zIndex: 10, // Ensure it's above other content
    //padding: 5, // Add padding for easier tapping
  },
  // --- End new style ---
  timelineGroupContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineGroupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginRight: 15,
    marginTop: 4,
  },
  timelineGroupContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 15,
    marginLeft: -6,
  },
  timelineGroupDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#333',
    marginBottom: 8,
  },
  timelineEvent: {
    marginBottom: 5,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  timelineCompletion: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },
});

export default MyTransactionDetails;
