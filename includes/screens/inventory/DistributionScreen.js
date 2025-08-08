import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import {Shimmer} from '../../utils/useShimmer'; // Assuming this path is correct
import {useDistribution} from '../../hooks/useInventory'; // Assuming this path is correct

const monthAbbreviations = [
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

export default function DistributionScreen({navigation}) {
  const [selectedReceiver, setSelectedReceiver] = useState('All Receivers');

  // State for which month is selected in the calendar (0-indexed)
  // Initially set to the current month.
  const [selectedCalendarMonthIndex, setSelectedCalendarMonthIndex] = useState(
    () => new Date().getMonth(),
  );

  // State to manage the expansion of item details for inline display
  const [expandedItemId, setExpandedItemId] = useState(null);

  const {
    data: distributionData,
    isLoading: distributionDataLoading,
    isError: distributionDataError,
  } = useDistribution();

  const bottomSheetRefReceiver = useRef(null);
  const snapPointsReceiver = useMemo(() => ['30%', '60%'], []);

  // Aggregate all data by month, including individual transactions, applying receiver filter
  const monthlySummaryAll = useMemo(() => {
    if (!distributionData) return [];

    const monthDataMap = new Map();

    // Initialize all months (0-11) to ensure they exist even if no data
    monthAbbreviations.forEach((month, index) => {
      monthDataMap.set(index, {
        month: month,
        monthIndex: index,
        distributedItems: new Map(), // Map<itemName, { Item, Unit, totalQty, transactions: [] }>
      });
    });

    distributionData.forEach(entry => {
      if (!entry.DateEncoded) return;

      // Apply receiver filter during aggregation
      if (selectedReceiver !== 'All Receivers' && entry.Name !== selectedReceiver) {
        return; // Skip this entry if it doesn't match the selected receiver
      }

      const dateParts = entry.DateEncoded.split(' ')[0].split('-');
      const month = parseInt(dateParts[1]) - 1; // 0-based month

      const qty = parseFloat(entry.IssuedQty) || 0;
      const itemName = entry.Item;
      const itemUnit = entry.Unit;

      const currentMonthData = monthDataMap.get(month);
      if (currentMonthData) { // Ensure the month exists in the map
        const itemsMapForMonth = currentMonthData.distributedItems;

        if (itemsMapForMonth.has(itemName)) {
          const existingItem = itemsMapForMonth.get(itemName);
          existingItem.totalQty += qty;
          existingItem.transactions.push(entry); // Add transaction to existing item
        } else {
          itemsMapForMonth.set(itemName, {
            Item: itemName,
            Unit: itemUnit,
            totalQty: qty,
            transactions: [entry], // Start transactions array for new item
          });
        }
      }
    });

    return Array.from(monthDataMap.values()).map(monthEntry => {
      const distributedItemsArray = Array.from(
        monthEntry.distributedItems.values(),
      ).sort((a, b) => a.Item.localeCompare(b.Item)); // Sort items alphabetically

      const totalQtyForMonth = distributedItemsArray.reduce(
        (sum, item) => sum + item.totalQty,
        0,
      );

      return {
        ...monthEntry,
        distributedItems: distributedItemsArray,
        totalQtyForMonth: totalQtyForMonth,
      };
    });
  }, [distributionData, selectedReceiver]); // Recalculate if raw data or receiver filter changes

  // Modified: Generate all 12 months for the calendar display
  const allMonthsCalendar = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) { // Loop for all 12 months (0 to 11)
      const monthIdx = i;
      // Find the aggregated data for this month, or create a placeholder if no data
      const monthSummary = monthlySummaryAll.find(m => m.monthIndex === monthIdx);
      months.push(
        monthSummary || {
          month: monthAbbreviations[monthIdx],
          monthIndex: monthIdx,
          distributedItems: [],
          totalQtyForMonth: 0,
        },
      );
    }
    return months;
  }, [monthlySummaryAll]); // Recalculate if the full monthly summary changes

  // Derived: Items for the currently selected calendar month to display in the main list
  const itemsForSelectedCalendarMonth = useMemo(() => {
    const selectedMonthData = allMonthsCalendar.find( // Use allMonthsCalendar here
      m => m.monthIndex === selectedCalendarMonthIndex,
    );
    return selectedMonthData ? selectedMonthData.distributedItems : [];
  }, [allMonthsCalendar, selectedCalendarMonthIndex]); // Depend on allMonthsCalendar

  // Overall total distributed items (sum across all months, considering receiver filter)
  const totalDistributedItems = useMemo(() => {
    return monthlySummaryAll.reduce(
      (sum, monthEntry) => sum + monthEntry.totalQtyForMonth,
      0,
    );
  }, [monthlySummaryAll]);

  // Unique receivers for the filter bottom sheet
  const uniqueReceivers = useMemo(() => {
    if (!distributionData) return ['All Receivers'];

    const receivers = new Set(distributionData.map(item => item.Name));
    return ['All Receivers', ...Array.from(receivers).sort()];
  }, [distributionData]);

  // Handler to open receiver filter bottom sheet
  const handlePresentReceiverFilter = useCallback(() => {
    bottomSheetRefReceiver.current?.expand();
  }, []);

  // Handler for selecting a receiver from the filter bottom sheet
  const handleSelectReceiver = useCallback(receiver => {
    setSelectedReceiver(receiver);
    bottomSheetRefReceiver.current?.close();
    setExpandedItemId(null); // Collapse any expanded item when receiver changes
  }, []);

  // Handler to close receiver filter bottom sheet
  const handleCloseReceiverSheet = useCallback(() => {
    bottomSheetRefReceiver.current?.close();
  }, []);

  // Handler for clicking an item in the main list to show/hide details inline
  const handleItemClickForDetails = useCallback(itemId => {
    setExpandedItemId(prevId => (prevId === itemId ? null : itemId)); // Toggle expansion
  }, []);

  // Render function for each month cell in the horizontal calendar
  const renderMonthCalendarCell = useCallback(
    ({item: monthData}) => (
      <Pressable
        style={[
          styles.monthCalendarCell,
          selectedCalendarMonthIndex === monthData.monthIndex &&
            styles.monthCalendarCellSelected,
        ]}
        android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: false}}
        onPress={() => {
          setSelectedCalendarMonthIndex(monthData.monthIndex);
          setExpandedItemId(null); // Collapse any previously expanded item when month changes
        }}>
        <Text
          style={[
            styles.monthCalendarText,
            selectedCalendarMonthIndex === monthData.monthIndex &&
              styles.monthCalendarTextSelected,
          ]}>
          {monthData.month}
        </Text>
        <Text
          style={[
            styles.monthCalendarQty,
            selectedCalendarMonthIndex === monthData.monthIndex &&
              styles.monthCalendarQtySelected,
          ]}>
          {monthData.totalQtyForMonth > 0 ? monthData.totalQtyForMonth : '-'}
        </Text>
      </Pressable>
    ),
    [selectedCalendarMonthIndex],
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#004ab1']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.topHeader}>
        <Pressable
          style={styles.backButton}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: true,
            radius: 20,
          }}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.topHeaderTitle}>Distributed Items</Text>
          {/* <Text style={styles.totalStocksCount}>
             Total {totalDistributedItems} Items Distributed (All Months)
           </Text> */}
        </View>
        <View style={{width: 40}} />
      </LinearGradient>

      <View style={styles.filterContainer}>
        <Pressable
          style={styles.filterButton}
          android_ripple={{
            color: 'rgba(0,0,0,0.1)',
            borderless: false,
          }}
          onPress={handlePresentReceiverFilter}>
          <MaterialCommunityIcons
            name="account-filter"
            size={20}
            color="#1A508C"
          />
          <Text style={styles.filterButtonText}>
            {selectedReceiver}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#1A508C"
          />
        </Pressable>
      </View>

      {/* All Months Calendar Selector */}
       <View style={styles.calendarContainer}>
        <FlatList
          horizontal
          data={allMonthsCalendar} // Use the new allMonthsCalendar data
          keyExtractor={item => `${item.month}-${item.monthIndex}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarListContent}
          renderItem={renderMonthCalendarCell}
          initialScrollIndex={selectedCalendarMonthIndex}
          style={{zIndex:1}}
          getItemLayout={(data, index) => (
            {length: 75, offset: 75 * index, index} // Adjust item length based on your cell styling (width + margin)
          )}
        />
      </View>

      {distributionDataLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading distribution data...</Text>
          <Shimmer width={320} height={120} style={{borderRadius: 10}} />
          <Shimmer
            width={320}
            height={120}
            style={{borderRadius: 10, marginVertical: 8}}
          />
          <Shimmer
            width={320}
            height={120}
            style={{borderRadius: 10, marginVertical: 8}}
          />
        </View>
      ) : distributionDataError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading distribution data. Please try again.
          </Text>
        </View>
      ) : (
        /* Main content area below the calendar: Items for selected month */
        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>
            Items Distributed in{' '}
            {monthAbbreviations[selectedCalendarMonthIndex]}
          </Text>
          {itemsForSelectedCalendarMonth.length > 0 ? (
            <FlatList
              data={itemsForSelectedCalendarMonth}
              keyExtractor={item => item.Item} // Item Name is unique within a month
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <View>
                  <Pressable
                    style={styles.detailItemRow}
                    android_ripple={{
                      color: 'rgba(0,0,0,0.05)',
                      borderless: false,
                    }}
                    onPress={() => handleItemClickForDetails(item.Item)}>
                    <Text style={styles.detailItemName}>{item.Item}</Text>
                    <Text style={styles.detailItemQty}>
                      {item.totalQty} {item.Unit}
                      <Ionicons
                        name={
                          expandedItemId === item.Item
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={18}
                        color="#555"
                        style={styles.expandIcon}
                      />
                    </Text>
                  </Pressable>
                  {/* Inline transaction details, visible when item is expanded */}
                  {expandedItemId === item.Item && (
                    <View style={styles.itemTransactionDetailsContainer}>
                      {item.transactions.length > 0 ? (
                        item.transactions.map((transaction, transIdx) => (
                          <View
                            key={`${item.Item}-${transaction.Id}-${transIdx}`}
                            style={styles.itemDetailTransactionCard}>
                            <Text style={styles.itemDetailReceiver}>
                              Receiver: {transaction.Name}
                            </Text>
                            <Text style={styles.itemDetailDate}>
                              Date: {transaction.DateEncoded}
                            </Text>
                            <Text style={styles.itemDetailQuantity}>
                              Quantity: {transaction.IssuedQty}{' '}
                              {transaction.Unit}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View>
                          <Text style={styles.noTransactionsText}>
                            No individual transactions for this item.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyDetailsContainer}>
              <MaterialCommunityIcons
                name="archive-outline"
                size={60}
                color="#B0BEC5"
              />
              <Text style={styles.emptyDetailsText}>
                No items distributed in{' '}
                {monthAbbreviations[selectedCalendarMonthIndex]} matching filters.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Receiver Filter Bottom Sheet - Remains */}
      <BottomSheet
        ref={bottomSheetRefReceiver}
        index={-1}
        snapPoints={snapPointsReceiver}
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Select Receiver</Text>
            <Pressable
              onPress={handleCloseReceiverSheet}
              style={styles.closeButton}
              android_ripple={{
                color: 'rgba(0,0,0,0.1)',
                borderless: true,
                radius: 18,
              }}>
              <Ionicons name="close-circle" size={24} color="#777" />
            </Pressable>
          </View>
          <BottomSheetFlatList
            data={uniqueReceivers}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedReceiver === item && styles.filterOptionSelected,
                ]}
                onPress={() => handleSelectReceiver(item)}>
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedReceiver === item && styles.filterOptionTextSelected,
                  ]}>
                  {item}
                </Text>
                {selectedReceiver === item && (
                  <Ionicons name="checkmark-circle" size={20} color="#1A508C" />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  topHeader: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  totalStocksCount: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F9FC',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E6EE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexShrink: 1,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginHorizontal: 8,
  },
  // --- Calendar Styles ---
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
  },
  calendarListContent: {
    paddingHorizontal: 5, // This is padding *around* the cells inside the scroll view
  },
  monthCalendarCell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4, // This adds 4px on left and 4px on right
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    width: 67, // Explicit width
    aspectRatio: 1, // Ensures height matches width
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D5DCE4',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0.5},
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  monthCalendarCellSelected: {
    backgroundColor: '#1A508C',
    borderColor: '#1A508C',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  monthCalendarText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 2,
  },
  monthCalendarTextSelected: {
    color: '#FFFFFF',
  },
  monthCalendarQty: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7F8C8D',
    textAlign:'right'
  },
  monthCalendarQtySelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  // --- Main Details Section (below calendar) ---
  detailsSection: {
    flex: 1,
    paddingTop: 15,
    marginHorizontal:10
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  detailItemRow: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    //borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 5,
    //borderWidth: 1,
    borderColor: '#E0E6EE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  detailItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34495E',
    flex: 1,
  },
  detailItemQty: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A508C',
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 5,
  },
  itemTransactionDetailsContainer: {
    //paddingHorizontal: 5,
    //paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#E0E0E0',
  },
  itemDetailTransactionCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEE',
  },
  itemDetailReceiver: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A508C',
    marginBottom: 2,
  },
  itemDetailDate: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  itemDetailQuantity: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  noTransactionsText: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingVertical: 10,
  },
  emptyDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 30,
  },
  emptyDetailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
    textAlign: 'center',
    marginTop: 15,
  },
  // --- General & Loading/Error Styles ---
  loadingContainer: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    rowGap:20
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  // Bottom Sheet general styles
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 20,
  },
  bottomSheetHandle: {
    backgroundColor: '#E0E0E0',
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    paddingLeft: 24,
    paddingRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 6,
  },
  filterOptionSelected: {
    backgroundColor: '#EBF5FF',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#34495E',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    fontWeight: '700',
    color: '#1A508C',
  },
});