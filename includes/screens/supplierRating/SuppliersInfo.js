import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSuppliers, useSuppliersGroup} from '../../hooks/useSuppliers';
import {categoryIconMap} from '../../utils';
import {useQueryClient} from '@tanstack/react-query';

// Gorhom Bottom Sheet Imports
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const {width} = Dimensions.get('window');
const SPACING = 10;
const CARD_WIDTH = (width - SPACING * 4) / 3;

const SupplierGroupCard = ({group, onPress}) => {
  const iconName = categoryIconMap[group.Description] || 'help-circle-outline';

  return (
    <Pressable
      style={({pressed}) => [
        groupCardStyles.card,
        Platform.OS === 'ios' && pressed && groupCardStyles.cardPressed, // Apply pressed style for iOS
      ]}
      onPress={() => onPress(group)}
      android_ripple={{
        color: 'rgba(0, 0, 0, 0.1)', // Subtle ripple color for Android
        borderless: false, // Ripple effect will be contained within the card's bounds
      }}>
      <View style={groupCardStyles.iconContainer}>
        <MaterialCommunityIcons name={iconName} size={30} color="#1A508C" />
      </View>
      <Text style={groupCardStyles.supplierCount}>{group.CategoryCode}</Text>
      <Text
        style={groupCardStyles.description}
        numberOfLines={2}
        ellipsizeMode="tail">
        {group.Description}
      </Text>

      <Text style={groupCardStyles.supplierCount}>
        {group.Suppliers?.length || 0} Suppliers
      </Text>
    </Pressable>
  );
};

const groupCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING,
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
    marginVertical: SPACING / 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: CARD_WIDTH * 1.2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  supplierCount: {
    fontSize: 10,
    color: '#777',
  },
});

const SupplierCard = ({supplier, index, onPress}) => {
  // Added onPress prop
  return (
    <Pressable style={cardStyles.card} onPress={() => onPress(supplier)}>
      <View style={cardStyles.indexColumn}>
        <Text style={cardStyles.indexText}>{index + 1}</Text>
      </View>

      <View style={cardStyles.cardContent}>
        <View style={cardStyles.header}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={24}
            color="#1A508C"
          />
          <Text style={cardStyles.name}>
            {supplier.Name || supplier.SupplierName}
          </Text>
        </View>
        {/* The rest of the SupplierCard content as before, uncomment if your supplier data has these fields */}
        {supplier.Address && (
          <View style={cardStyles.detailRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#666"
              style={cardStyles.detailIcon}
            />
            <Text style={cardStyles.detailText}>{supplier.Address}</Text>
          </View>
        )}
        {supplier.Contact && (
          <View style={cardStyles.detailRow}>
            <Ionicons
              name="call-outline"
              size={16}
              color="#666"
              style={cardStyles.detailIcon}
            />
            <Text style={cardStyles.detailText}>{supplier.Contact}</Text>
          </View>
        )}
        {supplier.Email && (
          <View style={cardStyles.detailRow}>
            <MaterialCommunityIcons
              name="email-outline"
              size={16}
              color="#666"
              style={cardStyles.detailIcon}
            />
            <Text style={cardStyles.detailText}>Email: {supplier.Email}</Text>
          </View>
        )}
        {supplier.Classification && (
          <View style={cardStyles.detailRow}>
            <MaterialCommunityIcons
              name="shape-outline"
              size={16}
              color="#666"
              style={cardStyles.detailIcon}
            />
            <Text style={cardStyles.detailText}>{supplier.Classification}</Text>
          </View>
        )}
        {supplier.Type && (
          <View style={cardStyles.detailRow}>
            <MaterialCommunityIcons
              name="format-list-bulleted-type"
              size={16}
              color="#666"
              style={cardStyles.detailIcon}
            />
            <Text style={cardStyles.detailText}>{supplier.Type}</Text>
          </View>
        )}
        <View style={cardStyles.footer}>
          <Text style={cardStyles.classification}>
            {supplier.Classification && supplier.Type
              ? `${supplier.Classification} - `
              : ''}
            {supplier.Type || ''}
          </Text>
          {supplier.Eligible !== undefined && // Check if eligible exists
            (supplier.Eligible === '1' ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="red"
              />
            ))}
        </View>
      </View>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  indexColumn: {
    width: 30,
    backgroundColor: '#E6EEF5',
    alignItems: 'center',
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: '#D3DCE6',
  },
  indexText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A508C',
    textAlign: 'right',
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
    flexShrink: 1,
  },
  alias: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 5,
    marginLeft: 34,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailIcon: {
    width: 20,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  classification: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
});

const SuppliersInfo = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showGroupedSuppliers, setShowGroupedSuppliers] = useState(true);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);
  const [selectedCategorySuppliers, setSelectedCategorySuppliers] = useState(
    [],
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false); // New state to control rendering
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // const {data: suppliersData} = useSuppliers(searchQuery);
  // const {data: suppliersGroupData} = useSuppliersGroup();

  const {data: suppliersData, refetch: refetchSuppliers} =
    useSuppliers(searchQuery);
  const {data: suppliersGroupData, refetch: refetchSuppliersGroup} =
    useSuppliersGroup();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (showGroupedSuppliers) {
        await queryClient.invalidateQueries({queryKey: ['getSuppliersGroup']});
      } else {
        await queryClient.invalidateQueries({
          queryKey: ['getSuppliers', searchQuery],
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleSearch = () => {
    setSearchQuery(searchText);
    setShowGroupedSuppliers(false);
  };

  const toggleSearchBar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchText('');
      setSearchQuery('');
      setShowGroupedSuppliers(true);
    }
  };

  const handleCategoryPress = group => {
    console.log('Category Description:', group.Description);
    console.log('Advertised Supplier Count:', group.SupplierCount);
    console.log(
      'Actual Suppliers Array Length:',
      group.Suppliers ? group.Suppliers.length : 0,
    );
    setSelectedCategorySuppliers(group.Suppliers || []);
    setSelectedCategoryName(group.Description);
    setIsBottomSheetOpen(true); // Open the bottom sheet
    bottomSheetRef.current?.expand();
  };

  // New handler for navigating to SupplierDetails from search results
  const handleSupplierCardPress = useCallback(
    supplier => {
      navigation.navigate('SupplierDetails', {supplierId: supplier.Id});
    },
    [navigation],
  );

  // New handler for navigating to SupplierDetails from bottom sheet list
  const handleBottomSheetSupplierPress = useCallback(
    supplier => {
      bottomSheetRef.current?.close(); // Close bottom sheet before navigating
      // Added a slight delay to allow bottom sheet to close visually before navigation
      setTimeout(() => {
        setIsBottomSheetOpen(false); // Close the bottom sheet completely after animation
        navigation.navigate('SupplierDetails', {
          supplierId: supplier.SupplierId,
        });
      }, 100);
    },
    [navigation],
  );

  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      setSelectedCategorySuppliers([]);
      setSelectedCategoryName('');
      setIsBottomSheetOpen(false); // Set state to false when fully closed
    }
  }, []);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const renderBottomSheetSupplierItem = useCallback(
    ({item, index}) => (
      <Pressable
        style={bottomSheetStyles.bottomSheetSupplierItem}
        onPress={() => handleBottomSheetSupplierPress(item)} // Make item pressable
        android_ripple={{
          color: 'rgba(0, 0, 0, 0.1)', // Subtle ripple color for Android
          borderless: false, // Ripple effect will be contained within the card's bounds
        }}>
        <Text style={bottomSheetStyles.bottomSheetSupplierIndex}>
          {index + 1}.
        </Text>
        <Text style={bottomSheetStyles.bottomSheetSupplierName}>
          {item.SupplierName}
        </Text>
      </Pressable>
    ),
    [handleBottomSheetSupplierPress],
  );

  const headerHeight =
    Platform.OS === 'android'
      ? StatusBar.currentHeight + (showSearchBar ? 120 : 70)
      : showSearchBar
      ? 140
      : 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[styles.header, {height: headerHeight}]}>
        <View style={styles.topHeaderRow}>
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

          <Text style={styles.headerTitle}>Suppliers Info</Text>
          <Pressable
            style={styles.searchToggleButton}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: true,
              radius: 20,
            }}
            onPress={toggleSearchBar}>
            <Ionicons name="search" size={24} color="#fff" />
          </Pressable>
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              height: showSearchBar ? 48 : 0,
              paddingVertical: showSearchBar ? 0 : 0,
              marginBottom: showSearchBar ? 10 : 0,
              opacity: showSearchBar ? 1 : 0,
            },
          ]}>
          <Ionicons
            name="search"
            size={20}
            color="#fff"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Supplier Name"
            placeholderTextColor="#fff"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            editable={showSearchBar}
            pointerEvents={showSearchBar ? 'auto' : 'none'}
          />
          <Pressable
            style={styles.searchButton}
            android_ripple={{
              color: 'rgba(255,255,255,0.3)',
              borderless: false,
              radius: 25,
            }}
            onPress={handleSearch}
            disabled={!showSearchBar}>
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {showGroupedSuppliers &&
      suppliersGroupData &&
      suppliersGroupData.length > 0 ? (
        <FlatList
          key="groupedSuppliersList"
          data={suppliersGroupData}
          keyExtractor={item => item.CategoryCode}
          renderItem={({item}) => (
            <SupplierGroupCard group={item} onPress={handleCategoryPress} />
          )}
          numColumns={3}
          contentContainerStyle={styles.groupedListContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#1A508C" // Optional: customize the spinner color for iOS
            />
          }
        />
      ) : showGroupedSuppliers &&
        (!suppliersGroupData || suppliersGroupData.length === 0) ? (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={60}
            color="#ccc"
          />
          <Text style={styles.noDataText}>No supplier categories found.</Text>
          <Text style={styles.noDataSubText}>
            Check your connection or try again later.
          </Text>
        </View>
      ) : suppliersData && suppliersData.length > 0 ? (
        <FlatList
          key="searchSuppliersList"
          data={suppliersData}
          keyExtractor={item => item.Id.toString()}
          renderItem={({item, index}) => (
            <SupplierCard
              supplier={item}
              index={index}
              onPress={handleSupplierCardPress}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={60}
            color="#ccc"
          />
          <Text style={styles.noDataText}>No suppliers found.</Text>
          <Text style={styles.noDataSubText}>
            Try adjusting your search or check your connection.
          </Text>
        </View>
      )}

      {/* Conditionally render Gorhom Bottom Sheet */}
      {isBottomSheetOpen && ( // Only render when isBottomSheetOpen is true
        <BottomSheet
          ref={bottomSheetRef}
          index={0} // Start at an open index when rendered
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}>
          <View style={bottomSheetStyles.contentContainer}>
            <View style={bottomSheetStyles.bottomSheetHeader}>
              <Text style={bottomSheetStyles.bottomSheetTitle}>
                {selectedCategoryName} Suppliers
              </Text>
              <Pressable
                onPress={() => bottomSheetRef.current?.close()}
                style={bottomSheetStyles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color="#666" />
              </Pressable>
            </View>

            {selectedCategorySuppliers.length > 0 ? (
              <BottomSheetFlatList
                data={selectedCategorySuppliers}
                keyExtractor={item => item.SupplierId.toString()}
                renderItem={renderBottomSheetSupplierItem}
                contentContainerStyle={bottomSheetStyles.bottomSheetListContent}
              />
            ) : (
              <View style={bottomSheetStyles.bottomSheetNoData}>
                <Text style={bottomSheetStyles.bottomSheetNoDataText}>
                  No suppliers in this category.
                </Text>
              </View>
            )}
          </View>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 30,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 10,
    zIndex: 1, // Ensure the back button is above the gradient
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginRight: 50,
    marginLeft: -40,
  },
  searchToggleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    width: '100%',
    paddingHorizontal: 15,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: '#0D3B66',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    paddingVertical: 10,
  },
  groupedListContent: {
    paddingHorizontal: SPACING / 2,
    paddingVertical: SPACING,
    justifyContent: 'flex-start',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginTop: 10,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 5,
  },
});

const bottomSheetStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  bottomSheetListContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bottomSheetSupplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  bottomSheetSupplierIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 10,
  },
  bottomSheetSupplierName: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  bottomSheetNoData: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  bottomSheetNoDataText: {
    fontSize: 16,
    color: '#888',
  },
});

export default SuppliersInfo;
