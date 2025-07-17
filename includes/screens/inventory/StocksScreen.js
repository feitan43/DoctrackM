import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList, // Ensure FlatList is imported for the other FlatLists
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import {useStocks} from '../../hooks/useInventory';
import {width, currentYear, categoryIconMap} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {Shimmer} from '../../utils/useShimmer';

export default function StocksScreen({navigation}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const navigationHook = useNavigation();

  const {data: inventoryData} = useStocks(currentYear);

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['40%', '75%'], []);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

  const handlePresentModalPress = useCallback(item => {
    setSelectedItem(item);
    bottomSheetRef.current?.expand();
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedItem(null);
  }, []);

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
        {label: 'Total Items', value: 0, screen: null},
        {label: 'Total Categories', value: 0, screen: null},
        {label: 'Requests', value: 'N/A', screen: 'Requests'}, // Added screen name
        {label: 'For PickUp', value: 'N/A', screen: 'ForPickUp'}, // Added screen name
      ];
    }
    const totalCategories = new Set(inventoryData.map(item => item.Description))
      .size;
    const totalItems = inventoryData.length;

    return [
      {label: 'Total Items', value: totalItems, screen: null},
      {label: 'Total Categories', value: totalCategories, screen: null},
      {label: 'Requests', value: 'N/A', screen: 'Requests'}, // Added screen name
      {label: 'For PickUp', value: 'N/A', screen: 'ForPickUp'}, // Added screen name
    ];
  }, [inventoryData]);

  const renderFlatListItem = ({item}) => {
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

  const renderDashboardItem = ({item}) => (
    <TouchableOpacity
      style={styles.dashboardCard}
      onPress={() => item.screen && navigation.navigate(item.screen)} // Navigate if screen is defined
      disabled={!item.screen} // Disable if no screen is defined
      activeOpacity={0.7}>
      <Text style={styles.dashboardLabel}>{item.label}</Text>
      <Text style={styles.dashboardValue}>{item.value}</Text>
    </TouchableOpacity>
  );

  const renderItemInModal = ({item}) => (
    <View style={styles.modalItem}>
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.modalItemText}>{item.Item}</Text>
        <Text style={styles.modalItemQuantity}>Qty: {item.Qty}</Text>
      </View>
      <TouchableOpacity
        style={styles.requestItemButton}
        onPress={() => {
          handleClosePress(); // Close the bottom sheet
          navigationHook.navigate('RequestStocks', {item: item}); // Navigate to RequestStocks screen
        }}>
        <MaterialCommunityIcons name="send" size={24} color="#1A508C" />
      </TouchableOpacity>
    </View>
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
          <Text style={styles.topHeaderTitle}>Stocks</Text>
          <Text style={styles.totalStocksCount}>Total {totalStocks} Items</Text>
        </View>
        <View style={{width: 40}} />
      </LinearGradient>
      <View style={{}}>
        <FlatList
          data={dashboardData}
          renderItem={renderDashboardItem}
          keyExtractor={item => item.label}
          numColumns={2}
          contentContainerStyle={styles.dashboardListContent}
          //columnWrapperStyle={styles.dashboardRow}
          scrollEnabled={false}
        />
      </View>
      <Text style={styles.categoriesHeader}>Categories</Text>

      <FlatList
        data={groupedCategoryData}
        renderItem={renderFlatListItem}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        key="categoryGrid"
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
              <Text style={styles.bottomSheetTitle}>
                {selectedItem.title} (Total: {selectedItem.totalQty})
              </Text>
              <Text style={styles.bottomSheetSubtitle}>
                Items in this category:
              </Text>

              <BottomSheetFlatList
                data={selectedItem.items}
                renderItem={renderItemInModal}
                keyExtractor={(item, index) => item.Id + '-' + index}
                contentContainerStyle={styles.modalItemsList}
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
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  totalStocksCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginTop: 4,
  },
  dashboardListContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dashboardRow: {
    justifyContent: 'space-between',
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 90,
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  dashboardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A508C',
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
    padding: 6,
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
    borderWidth:1,
    borderColor: '#ddd',
    //elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryCountContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  bottomSheetSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItemsList: {
    paddingVertical: 10,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemDetailsContainer: {
    flex: 1,
    marginRight: 10,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalItemQuantity: {
    fontSize: 15,
    color: '#555',
    fontWeight: 'bold',
  },
  requestItemButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e6f0fa',
  },
});
