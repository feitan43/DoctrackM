import React, {useState, useCallback, useRef, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  PermissionsAndroid,
  Alert,
  RefreshControl,
  Pressable, // Import Pressable for show more/less button
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useInventory} from '../hooks/useInventory';
import {FlashList} from '@shopify/flash-list';
import useUserInfo from '../api/useUserInfo';
import {insertCommas} from '../utils/insertComma';

const InventoryScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const yearFilterBottomSheetRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const startYear = 2023;

  const availableYears = Array.from(
    {length: currentYear - startYear + 1},
    (_, i) => (startYear + i).toString(),
  );

  const {officeCode} = useUserInfo();

  const {
    data,
    isLoading: invLoading,
    error: invError,
    refetch,
  } = useInventory(searchQuery, selectedYear, {
    enabled: hasSearched && Boolean(officeCode), 
  });

  const yearFilterSnapPoints = useMemo(() => ['25%', '50%', '75%'], []);

  const handlePresentYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.expand();
  }, []);

  const handleCloseYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.close();
  }, []);

  const handleSearch = useCallback(() => {
    setHasSearched(true); 
    refetch(); 
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const COLLAPSED_DESCRIPTION_MIN_HEIGHT = 60;

  const InventoryItem = ({item, navigation, index}) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [hasMoreLines, setHasMoreLines] = useState(false);

    const handleTextLayout = useCallback(e => {
      if (e.nativeEvent.lines.length > 3) {
        setHasMoreLines(true);
      } else {
        setHasMoreLines(false);
      }
    }, []);

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          navigation.navigate('InventoryDetails', {
            Id: item?.Id,
            Year: item?.Year,
            TrackingNumber: item?.TrackingNumber,
            Office: item?.Office,
          })
        }>
        <View style={styles.itemHeader}>
          <Text style={styles.itemIndex}>{index + 1} </Text>
          <View style={styles.headerRightContent}>
            <Text style={styles.itemTrackingNumber}>
              {item?.Year} |{' '}
              <Text style={styles.itemName}>
                {item?.TrackingNumber ?? 'N/A'}
              </Text>
            </Text>
            <Text style={styles.itemIdText}>{item?.Id ?? 'Unknown Item'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Brand:</Text>
          <Text style={styles.detailValue}>{item?.Brand ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text
            style={[
              styles.detailValue,
              !showFullDescription &&
                hasMoreLines && {minHeight: COLLAPSED_DESCRIPTION_MIN_HEIGHT},
            ]}
            numberOfLines={showFullDescription ? undefined : 3}
            onTextLayout={handleTextLayout}>
            {item?.Description ?? 'N/A'}
          </Text>
        </View>
        {hasMoreLines && (
          <Pressable
            onPress={() => setShowFullDescription(!showFullDescription)}
            accessibilityRole="button"
            accessibilityLabel={
              showFullDescription
                ? 'Show less description'
                : 'Show full description'
            }>
            <Text style={styles.showMoreLessButton}>
              {showFullDescription ? 'Show Less' : 'Show More'}
            </Text>
          </Pressable>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Unit:</Text>
          <Text style={styles.detailValue}>{item?.Unit ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Model:</Text>
          <Text style={styles.detailValue}>{item?.Model ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Serial No.:</Text>
          <Text style={styles.detailValue}>{item?.SerialNumber ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Set:</Text>
          <Text style={styles.detailValue}>{item?.Set ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Property No.:</Text>
          <Text style={styles.detailValue}>
            {item?.PropertyNumber ?? 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sticker No.:</Text>
          <Text style={styles.detailValue}>{item?.StickerNumber ?? 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>
            ₱{insertCommas(item?.Amount) ?? '0.00'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={styles.detailValue}>₱{item?.Total ?? '0.00'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assigned To:</Text>
          <Text style={styles.detailValue}>
            {item?.NameAssignedTo ?? 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current User:</Text>
          <Text style={styles.detailValue}>{item?.CurrentUser ?? 'N/A'}</Text>
        </View>
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
          <ImageBackground
            source={require('../../assets/images/CirclesBG.png')}
            style={styles.bgHeader}
            imageStyle={styles.bgHeaderImageStyle}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}>
                <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <View style={{width: 60}} />
            </View>
          </ImageBackground>

          <View style={styles.searchFilterRow}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by TN..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  setHasSearched(false); // Reset hasSearched when text changes
                }}
                onSubmitEditing={handleSearch} // Trigger search on keyboard submit
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setHasSearched(false); // Reset hasSearched when clearing input
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
              disabled={invLoading} // optional: disable while loading
            >
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

          <TouchableOpacity
            onPress={handlePresentYearFilterSheet}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 30,
              marginHorizontal: 30,
              marginTop: -5,
            }}>
            <Icon name="calendar-clear-outline" size={25} color={'#1a508c'} />
            <Text
              style={{
                fontSize: 16,
                color: '#1a508c',
                fontWeight: '500',
                marginStart: 5,
              }}>
              {selectedYear}
            </Text>
          </TouchableOpacity>

          {invLoading && hasSearched ? ( // Only show loading if a search has been initiated
            <ActivityIndicator
              size="large"
              color={styles.loadingIndicator.color}
              style={styles.loadingIndicator}
            />
          ) : invError && hasSearched ? ( // Only show error if a search has been initiated
            <View style={styles.emptyStateContainer}>
              <Icon name="warning-outline" size={50} color="#DC3545" />
              <Text style={styles.noItemsText}>Error loading data</Text>
              <Text style={styles.noItemsSubText}>
                There was an issue fetching your inventory. Please check your
                connection or try again later.
              </Text>
            </View>
          ) : (
            <FlashList
              data={hasSearched ? data : []} // Only show data if a search has been initiated
              renderItem={(
                {item, index}, // Destructure index here
              ) => (
                <InventoryItem
                  item={item}
                  navigation={navigation}
                  index={index}
                /> // Pass index to InventoryItem
              )}
              keyExtractor={item => item?.Id?.toString()}
              contentContainerStyle={styles.listContent}
              estimatedItemSize={150}
              ListEmptyComponent={
                hasSearched ? ( // Only show empty state if a search has been initiated
                  <View style={styles.emptyStateContainer}>
                    <Icon
                      name="cube-outline"
                      size={50}
                      color={styles.noItemsText?.color ?? '#999'}
                    />
                    <Text style={styles.noItemsText}>No items found</Text>
                    <Text style={styles.noItemsSubText}>
                      {selectedYear
                        ? `No items found for year ${selectedYear}.`
                        : 'Try adjusting your search or filters.'}
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
                      Enter a tracking number and/or select a year to find
                      inventory items.
                    </Text>
                  </View>
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={invLoading && hasSearched}
                  onRefresh={onRefresh}
                />
              }
            />
          )}

          <BottomSheet
            ref={yearFilterBottomSheetRef}
            index={-1}
            snapPoints={yearFilterSnapPoints}
            enablePanDownToClose={true}
            backdropComponent={BottomSheetBackdrop}
            handleIndicatorStyle={styles.bottomSheetHandle}>
            <BottomSheetFlatList
              data={availableYears}
              keyExtractor={item => item}
              ListHeaderComponent={() => (
                <View style={styles.bottomSheetHeader}>
                  <Text style={styles.modalTitle}>Filter by Year</Text>
                </View>
              )}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.yearOptionButton,
                    selectedYear === item && styles.selectedYearOptionButton,
                  ]}
                  onPress={() => {
                    setSelectedYear(item);
                    handleCloseYearFilterSheet();
                    handleSearch(); // Trigger search when the year changes
                  }}
                  accessibilityLabel={`Filter by year ${item}`}>
                  <Text
                    style={[
                      styles.yearOptionText,
                      selectedYear === item && styles.selectedYearOptionText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.yearOptionsFlatListContent}
            />
          </BottomSheet>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 130,
    backgroundColor: '#1a508c',
    paddingHorizontal: 20,
  },
  bgHeaderImageStyle: {
    opacity: 0.2,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
    marginTop: -40,
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
    // New style for the ID text
    fontSize: 10,
    textAlign: 'right',
    color: '#6C757D', // You can adjust the color
    marginBottom: 2, // Small margin below ID
  },
  itemTrackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    textAlign: 'right', // Align text to the right
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
    minWidth: 90,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  bottomSheetHandle: {
    backgroundColor: '#CED4DA',
    width: 50,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#212529',
  },
  yearOptionsFlatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  yearOptionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
  },
  selectedYearOptionButton: {
    backgroundColor: '#1a508c',
  },
  yearOptionText: {
    fontSize: 17,
    color: '#343A40',
    fontWeight: '500',
  },
  selectedYearOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  showMoreLessButton: {
    color: '#1a508c',
    marginTop: 5,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: '#eaf4ff',
  },
});

export default InventoryScreen;
