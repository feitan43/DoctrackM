import React, {useState, useCallback, useRef, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground, // Keep if desired, but image source needs to be external or locally bundled
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {FlashList} from '@shopify/flash-list';
import {useAdvanceInspection} from '../../hooks/useInspection';
import {formatDisplayDateTime} from '../../utils/dateUtils';
import {officeMap} from '../../utils/officeMap';

const AdvanceInspection = ({navigation}) => {
  // Keep navigation prop for a real RN app
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('ForInspection'); // Added state for active tab

  const {
    data,
    loading: dataLoading,
    error: dataError,
    refetch,
  } = useAdvanceInspection();

  const [invLoading, setInvLoading] = useState(false); // Used for search/refresh indication
  const [invError, setInvError] = useState(false); // Used for search/refresh error

  const handleSearch = useCallback(() => {
    setInvLoading(true);
    setInvError(false);
    setHasSearched(true);
    refetch();
    setTimeout(() => {
      setInvLoading(false);
    }, 500); // Shorter timeout for search
  }, []);

  // Filter data based on search query and active tab
  /*  const filteredData = useMemo(() => {
    if (!data) return [];
    let currentFiltered = data;

    if (hasSearched && searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentFiltered = currentFiltered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(lowerCaseQuery)
        )
      );
    } */

  const parseDeliveryDateString = useCallback(dateString => {
    if (
      !dateString ||
      dateString.trim() === '' ||
      dateString.toLowerCase() === 'n/a'
    ) {
      return null; // Return null for invalid or missing dates
    }

    const parts = dateString.match(
      /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+(AM|PM)/i,
    );
    if (parts) {
      const year = parseInt(parts[1], 10);
      const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[3], 10);
      let hour = parseInt(parts[4], 10);
      const minute = parseInt(parts[5], 10);
      const ampm = parts[6].toLowerCase();

      if (ampm === 'pm' && hour < 12) {
        hour += 12;
      } else if (ampm === 'am' && hour === 12) {
        hour = 0; // Midnight (12 AM)
      }

      const date = new Date(year, month, day, hour, minute);
      return isNaN(date.getTime()) ? null : date;
    }

    // Fallback for other formats, or if the custom format regex fails
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }, []);

  const sortedData = useMemo(() => {
    if (!data?.length) return [];

    // Filter data based on active tab
    const filteredByTab = data.filter(item => {
      switch (activeTab) {
        case 'ForInspection':
          return item.Status === 'For Inspection';
        case 'Inspected':
          // For 'Inspected', check status and if DateInspected exists and is not empty
          return (
            /* item.Status === 'Inspected' && */ item.DateInspected &&
            item.DateInspected.trim() !== ''
          );
        case 'OnHold':
          return item.Status === 'Inspection On Hold';
        default:
          return true; // Should not happen if tabs are controlled, but as a fallback
      }
    });

    // Apply search query filter
    const searchedData =
      hasSearched && searchQuery.length > 0
        ? filteredByTab.filter(
            item =>
              item.RefTrackingNumber?.toLowerCase().includes(
                searchQuery.toLowerCase(),
              ) ||
              item.Inspector?.toLowerCase().includes(
                searchQuery.toLowerCase(),
              ) ||
              item.CategoryName?.toLowerCase().includes(
                searchQuery.toLowerCase(),
              ) ||
              item.Status?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : filteredByTab;

    return [...searchedData].sort((a, b) => {
      const dateA = parseDeliveryDateString(a.DeliveryDate);
      const dateB = parseDeliveryDateString(b.DeliveryDate);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.getTime() - dateA.getTime();
    });
  }, [data, activeTab, hasSearched, searchQuery, parseDeliveryDateString]);

  const InspectionItem = ({item, navigation, index}) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          navigation?.navigate('AdvanceInspectionDetails', {
            Id: item?.Id,
            Year: item?.Year,
            RefTrackingNumber: item?.RefTrackingNumber,
            itemData: item,
          })
        }>
        <View style={styles.itemHeader}>
          <Text style={styles.itemIndex}>{index + 1} </Text>
          <View style={styles.headerRightContent}>
            <Text style={styles.itemTrackingNumber}>
              {item?.Year} |{' '}
              <Text style={styles.itemName}>
                {item?.RefTrackingNumber ?? 'N/A'}
              </Text>
            </Text>
            <Text style={styles.itemIdText}>{item?.Id ?? 'Unknown Item'}</Text>
          </View>
        </View>

        <View style={[styles.detailRow, {alignItems: 'center'}]}>
          {/* <Text style={styles.detailLabel}>Delivery Date:</Text> */}
          <Icon name="calendar-outline" size={25} color="#6C757D" />
          <Text style={[styles.detailLabel, {marginStart: 10, fontSize: 15}]}>
            {formatDisplayDateTime(item?.DeliveryDate ?? 'N/A')}
          </Text>
        </View>
        <View style={[styles.detailRow, {alignItems: 'center'}]}>
          {/* <Text style={styles.detailLabel}>Delivery Date:</Text> */}
          <Icon name="cube-outline" size={25} color="#6C757D" />
          <Text style={[styles.detailLabel, {marginStart: 10, fontSize: 13}]}>
            {item?.CategoryName ?? 'N/A'}
          </Text>
        </View>
        <View style={[styles.detailRow, {alignItems: 'center'}]}>
          {/* <Text style={styles.detailLabel}>Delivery Date:</Text> */}
          <Icon name="location-outline" size={25} color="#6C757D" />
          <Text style={[styles.detailLabel, {marginStart: 10, fontSize: 13}]}>
            {item?.Address ?? 'N/A'}
          </Text>
        </View>
        <View style={[styles.detailRow, {alignItems: 'center'}]}>
          {/* <Text style={styles.detailLabel}>Delivery Date:</Text> */}
          <Icon name="person-outline" size={25} color="#6C757D" />
          <Text style={[styles.detailLabel, {marginStart: 10, fontSize: 13}]}>
            {item?.ContactPerson ?? 'N/A'}
          </Text>
        </View>

        {/*  <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Office:</Text>
          <Text style={styles.detailValue}>{officeMap[item?.Office ?? 'N/A']}</Text>
        </View> */}
        {/* <View style={styles.detailRow}>
          <Text style={styles.detailLabel}><Icon name='cube-outline' size={30}/></Text>
          <Text style={styles.detailValue}>{item?.CategoryName ?? 'N/A'}</Text>
        </View> */}

        {/* <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Inspected By:</Text>
          <Text style={styles.detailValue}>{item?.Inspector ?? 'N/A'}</Text>
        </View> */}
        {/* <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date Inspected:</Text>
          <Text style={styles.detailValue}>{item?.DateInspected ?? 'N/A'}</Text>
        </View> */}
        {/*  <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue}>{item?.Address ?? 'N/A'}</Text>
        </View> */}
        {/* <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact Person:</Text>
          <Text style={styles.detailValue}>{item?.ContactPerson ?? 'N/A'}</Text>
        </View> */}
        {/*   <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact Number:</Text>
          <Text style={styles.detailValue}>{item?.ContactNumber ?? 'N/A'}</Text>
        </View> */}
        {/*     <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tracking Partner:</Text>
          <Text style={styles.detailValue}>
            {item?.TrackingPartner ?? 'N/A'}
          </Text>
        </View> */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={styles.detailValue}>{item?.Status ?? 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Replaced ImageBackground source for general compatibility */}
          <View style={styles.bgHeader}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation?.goBack()} // Use optional chaining
                style={styles.backButton}>
                <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.screenTitle}>Advanced Inspection</Text>
              <View style={{width: 60}} />
            </View>
          </View>

          <View style={styles.searchFilterRow}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  setHasSearched(false);
                }}
                //onSubmitEditing={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setHasSearched(false);
                  }}
                  style={styles.clearSearchButton}>
                  <Icon
                    name="close-circle"
                    size={20}
                    color={styles.searchIcon.color}
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSearch}
              style={[styles.filterButton, {marginLeft: 10}]}
              disabled={invLoading}>
              {invLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="search" size={20} color="#fff" />
                  <Text style={styles.filterButtonText}>Search</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'ForInspection' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('ForInspection')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'ForInspection' && styles.activeTabText,
                ]}>
                For Inspection
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Inspected' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('Inspected')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Inspected' && styles.activeTabText,
                ]}>
                Inspected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'OnHold' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('OnHold')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'OnHold' && styles.activeTabText,
                ]}>
                On Hold
              </Text>
            </TouchableOpacity>
          </View>

          {(dataLoading || invLoading) && hasSearched ? (
            <ActivityIndicator
              size="large"
              color={styles.loadingIndicator.color}
              style={styles.loadingIndicator}
            />
          ) : (dataError || invError) && hasSearched ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="warning-outline" size={50} color="#DC3545" />
              <Text style={styles.noItemsText}>Error loading data</Text>
              <Text style={styles.noItemsSubText}>
                There was an issue fetching inspection data. Please check your
                connection or try again later.
              </Text>
            </View>
          ) : (
            <FlashList
              data={sortedData}
              renderItem={({item, index}) => (
                <InspectionItem
                  item={item}
                  navigation={navigation}
                  index={index}
                />
              )}
              keyExtractor={item => item?.Id?.toString()}
              contentContainerStyle={styles.listContent}
              estimatedItemSize={250} // Adjust based on your item layout
              ListEmptyComponent={
                hasSearched || activeTab !== 'ForInspection' ? ( // Show empty state based on search or active tab filter
                  <View style={styles.emptyStateContainer}>
                    <Icon
                      name="cube-outline"
                      size={50}
                      color={styles.noItemsText?.color ?? '#999'}
                    />
                    <Text style={styles.noItemsText}>
                      No inspection items found
                    </Text>
                    <Text style={styles.noItemsSubText}>
                      Try adjusting your search or switching tabs.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Icon
                      name="search-outline"
                      size={50}
                      color={styles.noItemsText?.color ?? '#999'}
                    />
                    <Text style={styles.noItemsText}>Start Searching</Text>
                    <Text style={styles.noItemsSubText}>
                      Enter keywords to find inspection items.
                    </Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // A light background for the whole app
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 130, // Adjusted height
    backgroundColor: '#1a508c', // Solid color instead of image
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20, // Rounded bottom corners
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  // bgHeaderImageStyle: { // No longer needed without ImageBackground source
  //   opacity: 0.8,
  // },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    // Removed negative margin as the dummy View handles spacing now
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 15,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '500',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 15,
    marginTop: -40, // Pull search bar up into header area
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 10,
    height: 55,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 8,
    color: '#6C757D',
  },
  searchInput: {
    flex: 1,
    height: 55,
    fontSize: 15,
    color: '#343A40',
    paddingHorizontal: 5, // Add some padding
  },
  clearSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#1a508c',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingIndicator: {
    marginTop: 50,
    color: '#1a508c',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 10,
  },
  noItemsSubText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#868E96',
    lineHeight: 22,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343A40',
    marginRight: 10,
    textAlign: 'right',
  },
  headerRightContent: {
    alignItems: 'flex-end',
  },
  itemIdText: {
    fontSize: 10,
    textAlign: 'right',
    color: '#6C757D',
    marginBottom: 2,
  },
  itemTrackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    textAlign: 'right',
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginRight: 10,
    minWidth: 120,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  showMoreLessButton: {
    color: '#1a508c',
    marginTop: 5,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: '#eaf4ff',
    borderRadius: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 15,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
  },
  activeTab: {
    backgroundColor: '#1a508c',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default AdvanceInspection;
