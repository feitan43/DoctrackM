import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator, 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native'; // Import useNavigation

import {useInventoryCat} from '../hooks/useInventory';
import {getIcon} from '../utils';

const inventoryDetails = {
  'CAT 10': [
    {trackingNumber: '7611-1001', itemId: 'ITEM001', UploadFiles: '1-2-3'},
    {trackingNumber: '7611-1002', itemId: 'ITEM002', UploadFiles: '1-2'},
  ],
  'CAT 10.1': [
    {trackingNumber: '7611-2001', itemId: 'ITEM101', UploadFiles: '1'},
  ],
  'CAT 13': [
    {trackingNumber: '7611-3001', itemId: 'ITEM201', UploadFiles: '1-2-3-4'},
  ],
  'CAT 44': [
    {trackingNumber: '7611-4001', itemId: 'ITEM301', UploadFiles: '1'},
    {trackingNumber: '7611-4002', itemId: 'ITEM302', UploadFiles: '1-2'},
  ],
  'CAT 99': [
    {trackingNumber: '7611-9999', itemId: 'ITEM999', UploadFiles: '1'},
  ],
};

const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const cardWidth = (screenWidth - cardMargin * 3) / 2;

const InventoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState(null); // No longer needed
  // const [modalVisible, setModalVisible] = useState(false); // No longer needed
  const {data, loading} = useInventoryCat();
  const navigation = useNavigation(); // Initialize navigation hook

  const ppmpCategoriesMap = useMemo(() => {
    if (!data) return {};
    return data.reduce((map, category) => {
      map[category.Category] = category.Name;
      return map;
    }, {});
  }, [data]);

  const filteredData = useMemo(() => {
    if (loading || !data) return [];
    return data
      .filter(item => {
        const desc = item.Name || '';
        return (
          item.Category.toLowerCase().includes(searchText.toLowerCase()) ||
          desc.toLowerCase().includes(searchText.toLowerCase())
        );
      })
      .sort((a, b) => parseInt(b.TotalCount) - parseInt(a.TotalCount));
  }, [searchText, data, loading]);

  const handleCategoryPress = category => {
    // Navigate to the new screen, passing the category and its details
    const items = inventoryDetails[category] || [];
    const categoryName = ppmpCategoriesMap[category] || category; // Get display name
    navigation.navigate('CategoryDetail', {
      category: category,
      categoryName: categoryName,
      items: items,
    });
  };

  const calculateDashboardStats = () => {
    let totalItems = 0;
    // Use the fetched data for total items and categories
    if (data) {
      totalItems = data.reduce(
        (sum, item) => sum + parseInt(item.TotalCount || '0'),
        0,
      );
    }
    const totalCategories = data ? data.length : 0;

    return {
      totalItems,
      totalCategories,
    };
  };

  const dashboard = calculateDashboardStats();

  const renderItem = ({item}) => {
    const iconName = getIcon(item.Name);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleCategoryPress(item.Category)}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={24} color="#fff" />
        </View>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.Name}
        </Text>
        <Text style={styles.itemSubtitle}>{item.Category}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.TotalCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Inventory</Text>

      {/* Dashboard section */}
      <View style={styles.dashboard}>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardValue}>{dashboard.totalItems}</Text>
          <Text style={styles.dashboardLabel}>Total Items</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardValue}>{dashboard.totalCategories}</Text>
          <Text style={styles.dashboardLabel}>Categories</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by code or description..."
        value={searchText}
        onChangeText={setSearchText}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading inventory data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => item.Category + index}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          contentContainerStyle={{paddingBottom: 20}}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
              <Text style={styles.emptyListText}>
                No inventory categories found.
              </Text>
            </View>
          )}
        />
      )}
      {/* renderDetailsModal removed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f2f2', padding: 12},
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  dashboardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
  },
  dashboardLabel: {
    fontSize: 13,
    color: '#555',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  iconWrapper: {
    backgroundColor: '#4A90E2',
    borderRadius: 999,
    padding: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: '#e1ecf4',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2e6eb5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyListText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
});

export default InventoryScreen;