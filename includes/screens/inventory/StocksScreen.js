import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  TextInput,
  RefreshControl, // Import RefreshControl
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import {useRequests, useStocks} from '../../hooks/useInventory';
import {width, currentYear, categoryIconMap} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {Shimmer} from '../../utils/useShimmer';
import {useQueryClient} from '@tanstack/react-query';

export default function StocksScreen({navigation}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // New state for refreshing
  const navigationHook = useNavigation();
  const queryClient = useQueryClient(); // Initialize useQueryClient

  const {
    data: inventoryData,
    isPending: inventoryDataLoading,
    isError: inventoryDataError,
  } = useStocks(currentYear);
  const {data: inventoryRequests} = useRequests();

  const totalRequests =
    inventoryRequests?.filter(
      request => request.Status.toLowerCase() === 'pending',
    ).length || 0;

  const totalForPickUp =
    inventoryRequests?.filter(
      request => request.Status.toLowerCase() === 'forpickup',
    ).length || 0;

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['40%', '80%'], []);

  useEffect(() => {
    if (selectedItem) {
      if (searchQuery.trim() === '') {
        setFilteredItems(selectedItem.items);
      } else {
        const filtered = selectedItem.items.filter(item =>
          item.Item.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredItems(filtered);
      }
    }
  }, [searchQuery, selectedItem]);

  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      setSearchQuery('');
    }
  }, []);

  const handlePresentModalPress = useCallback(item => {
    setSelectedItem(item);
    setSearchQuery('');
    setFilteredItems(item.items);
    bottomSheetRef.current?.expand();
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedItem(null);
    setSearchQuery('');
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries(['stocks', currentYear]);
      await queryClient.invalidateQueries(['requests']);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const groupedCategoryData = useMemo(() => {
    if (!inventoryData) {
      return [];
    }

    const categoriesMap = new Map();
    inventoryData.forEach(item => {
      const categoryName = item.Description
        ? item.Description.trim()
        : 'Uncategorized';

      if (!categoriesMap.has(categoryName)) {
        const iconName =
          categoryIconMap[categoryName] ||
          categoryIconMap['default'] ||
          'dots-horizontal';

        categoriesMap.set(categoryName, {
          id: categoryName,
          title: categoryName,
          totalQty: 0,
          icon: iconName,
          items: [],
        });
      }

      const categoryEntry = categoriesMap.get(categoryName);
      categoryEntry.totalQty += 1;
      categoryEntry.items.push(item);
    });

    return Array.from(categoriesMap.values());
  }, [inventoryData]);

  const totalStocks = useMemo(() => {
    if (!inventoryData) {
      return 0;
    }
    return inventoryData.length;
  }, [inventoryData]);

  const dashboardData = useMemo(() => {
    if (!inventoryData) {
      return [
        {
          label: 'Requests',
          value: 'N/A',
          screen: 'Requests',
          icon: 'file-plus',
          type: 'card', // Added type for easier distinction
        },
        {
          label: 'For Pickup',
          value: 'N/A',
          screen: 'ForPickUp',
          icon: 'truck-fast',
          type: 'card', // Added type for easier distinction
        },
        {
          label: 'Dissapproved',
          value: 'N/A',
          screen: 'DisapprovedRequests',
          icon: 'thumb-down',
          type: 'card',
        },
      ];
    }

    return [
      {
        label: 'Requests',
        value: totalRequests,
        screen: 'Requests',
        icon: 'cart',
        type: 'card',
      },
      {
        label: 'For Pickup',
        value: totalForPickUp,
        screen: 'ForPickUp',
        icon: 'truck-fast',
        type: 'card',
      },
      {
        label: 'Dissapproved',
        value:
          inventoryRequests?.filter(
            request => request.Status.toLowerCase() === 'disapproved',
          ).length || 0,
        screen: 'DisapprovedRequests',
        icon: 'thumb-down',
        type: 'card',
      },
    ];
  }, [inventoryData, totalRequests, totalForPickUp, inventoryRequests]);

  // New memoized value for inventory summary details
  const inventorySummaryDetails = useMemo(() => {
    if (!inventoryData) {
      return {
        totalItems: 0,
        totalCategories: 0,
      };
    }
    const totalCategories = new Set(inventoryData.map(item => item.Description))
      .size;
    const totalItems = inventoryData.length;
    return {totalItems, totalCategories};
  }, [inventoryData]);

  const renderShimmerDashboardItem = item => {
    return (
      <View style={styles.dashboardItemInSingleCard}>
        <Shimmer
          width={30}
          height={30}
          style={{marginBottom: 8, borderRadius: 15}}
        />
        <Shimmer width={70} height={24} style={{marginBottom: 6}} />
        <Shimmer width={80} height={16} />
      </View>
    );
  };

  const renderShimmerCategoryItem = () => (
    <View style={styles.categoryCardWrapper}>
      <View style={[styles.categoryCardGradient, {overflow: 'hidden'}]}>
        <Shimmer width={40} height={20} style={styles.categoryCountContainer} />
        <Shimmer width={60} height={60} style={{marginBottom: 8}} />
        <Shimmer width={80} height={20} />
      </View>
    </View>
  );

  const renderFlatListItem = ({item}) => {
    if (inventoryDataLoading) {
      return renderShimmerCategoryItem();
    }

    return (
      <View style={styles.categoryCardWrapper}>
        <TouchableOpacity
          style={styles.categoryCardTouchable}
          onPress={() => handlePresentModalPress(item)}
          activeOpacity={0.7}>
          <LinearGradient
            colors={['#ffffff', '#f0f0f0']}
            style={styles.categoryCardGradient}>
            <View style={styles.categoryCountContainer}>
              <Text style={styles.categoryCardCountValue}>{item.totalQty}</Text>
            </View>

            <MaterialCommunityIcons
              name={item.icon}
              size={45}
              color="#1A508C"
              style={{marginBottom: 8}}
            />
            <Text style={styles.categoryCardName} numberOfLines={2}>
              {item.title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItemInModal = ({item, index}) => {
    const isOutOfStock = item.Qty <= 0;

    return (
      <TouchableOpacity
        style={[
          styles.requestItemButton,
          isOutOfStock && styles.requestItemButtonDisabled,
        ]}
        onPress={() => {
          handleClosePress();
          navigationHook.navigate('RequestStocks', {item: item});
        }}
        disabled={isOutOfStock}
      >
        <View style={styles.modalItem}>
          <View style={styles.itemDetailsContainer}>
            <Text style={styles.modalItemIndex}>{index + 1}</Text>
            <Text style={styles.modalItemText}>{item.Item}</Text>
          </View>
          <Text
            style={[
              styles.modalItemQuantity,
              isOutOfStock && styles.outOfStockText,
            ]}>
            {isOutOfStock ? 'No Stock' : item.Qty}{' '}
            {!isOutOfStock && (
              <Text style={{fontWeight: '400', fontSize: 10}}>
                {item.Unit}
              </Text>
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.topHeaderTitle}>Stocks</Text>
        </View>
        <View style={{width: 40}} />
      </LinearGradient>

      <View style={styles.dashboardContainer}>
        <View style={styles.singleDashboardCard}>
          {inventoryDataLoading
            ? Array(3)
                .fill({type: 'shimmer'})
                .map((item, index) => (
                  <React.Fragment key={'shimmer-item-' + index}>
                    {renderShimmerDashboardItem(item)}
                    {index < 2 && (
                      <View style={styles.dashboardCardSeparator} />
                    )}
                  </React.Fragment>
                ))
            : dashboardData.map((item, index) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.dashboardItemInSingleCard}
                    onPress={() =>
                      item.screen && navigation.navigate(item.screen)
                    }
                    disabled={!item.screen}
                    activeOpacity={0.7}>
                    {item.icon != null && (
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={28}
                        color="#1A508C"
                        style={{marginBottom: 8}}
                      />
                    )}
                    <Text style={styles.dashboardValue}>{item.value}</Text>
                    <Text style={styles.dashboardLabel}>{item.label}</Text>
                  </TouchableOpacity>
                  {index < dashboardData.length - 1 && (
                    <View style={styles.dashboardCardSeparator} />
                  )}
                </React.Fragment>
              ))}
        </View>
      </View>

      {inventoryDataLoading ? (
        <Shimmer width={100} height={20} style={styles.categoriesHeader} />
      ) : (
        <Text style={styles.categoriesHeader}>Categories</Text>
      )}

      <FlatList
        data={inventoryDataLoading ? Array(6).fill({}) : groupedCategoryData}
        renderItem={renderFlatListItem}
        keyExtractor={(item, index) =>
          inventoryDataLoading ? index.toString() : item.id
        }
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        key="categoryGrid"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A508C']}
            tintColor={'#1A508C'}
          />
        }
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={BottomSheetBackdrop}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}>
        <View style={styles.bottomSheetContent}>
          {selectedItem && (
            <>
              <View style={styles.bottomSheetTitleContainer}>
                <MaterialCommunityIcons
                  name={selectedItem.icon} // Use selectedItem.icon here
                  size={45} // Increased size for prominence
                  color="#1A508C"
                  style={styles.bottomSheetTitleIcon}
                />
                <Text style={styles.bottomSheetTitle}>
                  {selectedItem.title} ({selectedItem.totalQty})
                </Text>
              </View>

              <View style={styles.searchContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search items..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <Text style={styles.bottomSheetSubtitle}>
                Items in this category:
              </Text>

              <BottomSheetFlatList
                data={
                  filteredItems.length > 0 || searchQuery
                    ? filteredItems
                    : selectedItem.items
                }
                renderItem={renderItemInModal}
                keyExtractor={(item, index) => item.Id + '-' + index}
                contentContainerStyle={styles.modalItemsList}
                ListEmptyComponent={
                  <Text style={styles.noResultsText}>No items found</Text>
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#1A508C']}
                    tintColor={'#1A508C'}
                  />
                }
              />
            </>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
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
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  dashboardContainer: {
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  singleDashboardCard: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute items evenly
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10, // Adjust padding for the whole card
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  dashboardItemInSingleCard: {
    flex: 1, // Make each item take equal width
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // Adjust vertical padding for items
    minHeight: 80, // Ensure consistent height for each item
  },
  dashboardCardSeparator: {
    width: 1, // Vertical line for division
    backgroundColor: '#e0e0e0', // Light grey color for the division
    height: '80%', // Make separator span most of the item height
    alignSelf: 'center', // Center the separator vertically
    marginHorizontal: 0, // No horizontal margin, as it's directly between items
  },
  dashboardLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    flexShrink: 1, // Still important for text wrapping
  },
  dashboardValue: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1A508C',
  },
  subHeaderLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  categoriesHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'flex-start',
  },
  categoryCardWrapper: {
    flex: 1 / 3,
    padding: 3,
  },
  categoryCardTouchable: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  categoryCardGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    position: 'relative',
  },
  categoryCountContainer: {
    position: 'absolute',
    top: 10,
    right: 5,
    backgroundColor: 'rgba(236, 236, 236, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 1,
  },
  categoryCardCountValue: {
    color: '#252525',
    fontSize: 15,
    fontWeight: 'bold',
  },
  categoryCardName: {
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontWeight: '600',
    lineHeight: 20,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetHandle: {
    backgroundColor: '#ddd',
    width: 50,
    height: 6,
    borderRadius: 3,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  bottomSheetTitleContainer: {
    //flexDirection: 'row',
    //alignItems: 'center',
    justifyContent: 'center', // Center the icon and text
    marginBottom: 8,
  },
  bottomSheetTitleIcon: {
    marginRight: 10, // Space between icon and text
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    // Removed textAlign: 'center' from here as the container will handle centering
  },
  bottomSheetSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  modalItemsList: {
    paddingVertical: 10,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //alignItems: 'center', // Align items vertically in the center
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemDetailsContainer: {
    flex: 1,
    marginRight: 10,
    flexDirection: 'row', // Add this to align index and item text horizontally
    //alignItems: 'center', // Align them vertically
  },
  modalItemIndex: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
    fontWeight: 'bold',
    minWidth: 20, // Give it a minimum width to keep alignment consistent
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flexShrink: 1, // Allow text to shrink if it's too long
  },
  modalItemQuantity: {
    fontSize: 15,
    color: '#555',
    fontWeight: 'bold',
    minWidth: 60, // Give it a minimum width to ensure quantity and unit fit
    textAlign: 'right', // Align quantity to the right
  },
  requestItemButton: {
    borderRadius: 20,
    backgroundColor: '#e6f0fa',
  },
  requestItemButtonDisabled: {
    backgroundColor: '#e0e0e0', // A lighter background for disabled items
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  outOfStockText: {
    color: 'red', // Style for "No Stock" text
    fontWeight: 'bold',
  },
});