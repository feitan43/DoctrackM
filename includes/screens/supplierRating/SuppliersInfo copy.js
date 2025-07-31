import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSuppliers, useSuppliersGroup } from '../../hooks/useSuppliers';
import { categoryIconMap } from '../../utils';

// Gorhom Bottom Sheet Imports
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler'; // Ensure FlatList is from gesture-handler for BottomSheet

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const SPACING = 10;
// Adjusted for 3 columns: (screenWidth - (spacing_left + spacing_between_1 + spacing_between_2 + spacing_right)) / 3
const CARD_WIDTH = (width - SPACING * 4) / 3;

const SupplierGroupCard = ({ group, onPress }) => {
  const iconName = categoryIconMap[group.Description] || 'help-circle-outline'; // Fallback icon

  return (
    <Pressable style={groupCardStyles.card} onPress={() => onPress(group)}>
      <View style={groupCardStyles.iconContainer}>
        <MaterialCommunityIcons name={iconName} size={30} color="#1A508C" />
      </View>
      <Text style={groupCardStyles.description} numberOfLines={2} ellipsizeMode="tail">
        {group.Description}
      </Text>
      <Text style={groupCardStyles.supplierCount}>{group.SupplierCount} Suppliers</Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: CARD_WIDTH * 1.2, // Maintain aspect ratio roughly
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

const SupplierCard = ({ supplier, index }) => {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.indexColumn}>
        <Text style={cardStyles.indexText}>{index + 1}</Text>
      </View>

      <View style={cardStyles.cardContent}>
        <View style={cardStyles.header}>
          <MaterialCommunityIcons name="storefront-outline" size={24} color="#1A508C" />
          <Text style={cardStyles.name}>{supplier.SupplierName || supplier.Name}</Text>
        </View>
        {/* Note: The provided data for Suppliers inside a Category has SupplierId and SupplierName, not full supplier details.
            You might need to fetch full supplier details or adjust what's displayed here if 'Address', 'Contact', etc. are not available.
            For now, showing only SupplierName from the nested 'Suppliers' array.
            If this card is used for search results, 'supplier.Name' would be appropriate.
        */}
        {/* supplier.Alias && (
          <Text style={cardStyles.alias}>Alias: {supplier.Alias}</Text>
        ) */}
        {/* <View style={cardStyles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" style={cardStyles.detailIcon} />
          <Text style={cardStyles.detailText}>{supplier.Address}</Text>
        </View>
        <View style={cardStyles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#666" style={cardStyles.detailIcon} />
          <Text style={cardStyles.detailText}>{supplier.Contact}</Text>
        </View> */}
        {/* supplier.Proprietor && (
          <View style={cardStyles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" style={cardStyles.detailIcon} />
            <Text style={cardStyles.detailText}>Proprietor: {supplier.Proprietor}</Text>
          </View>
        ) */}
        {/* supplier.Email && (
          <View style={cardStyles.detailRow}>
            <MaterialCommunityIcons name="email-outline" size={16} color="#666" style={cardStyles.detailIcon} />
            <Text style={cardStyles.detailText}>Email: {supplier.Email}</Text>
          </View>
        ) */}
        {/* <View style={cardStyles.footer}>
          <Text style={cardStyles.classification}>{supplier.Classification} - {supplier.Type}</Text>
          {supplier.Eligible === "1" ? (
            <MaterialCommunityIcons name="check-circle" size={20} color="green" />
          ) : (
            <MaterialCommunityIcons name="close-circle" size={20} color="red" />
          )}
        </View> */}
      </View>
    </View>
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
    shadowOffset: { width: 0, height: 2 },
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A508C',
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

const SuppliersInfo = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showGroupedSuppliers, setShowGroupedSuppliers] = useState(true);

  // States for the Gorhom Bottom Sheet
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], []); // Define snap points
  const [selectedCategorySuppliers, setSelectedCategorySuppliers] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const { data: suppliersData } = useSuppliers(searchQuery);
  const { data: suppliersGroupData } = useSuppliersGroup();

  const handleSearch = () => {
    setSearchQuery(searchText);
    setShowGroupedSuppliers(false); // Hide grouped suppliers when searching
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

  const handleCategoryPress = (group) => {
    setSelectedCategorySuppliers(group.Suppliers || []);
    setSelectedCategoryName(group.Description);
    bottomSheetRef.current?.expand(); // Open the bottom sheet
  };

  // Callback for when the bottom sheet changes its state
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      // Bottom sheet is fully closed
      setSelectedCategorySuppliers([]);
      setSelectedCategoryName('');
    }
  }, []);

  // Render backdrop for Gorhom bottom sheet
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    []
  );

  const renderBottomSheetSupplierItem = useCallback(({ item, index }) => (
    <View style={bottomSheetStyles.bottomSheetSupplierItem}>
      <Text style={bottomSheetStyles.bottomSheetSupplierIndex}>{index + 1}.</Text>
      <Text style={bottomSheetStyles.bottomSheetSupplierName}>{item.SupplierName}</Text>
    </View>
  ), []);


  // Calculate header height dynamically
  const headerHeight = Platform.OS === 'android'
    ? StatusBar.currentHeight + (showSearchBar ? 120 : 70)
    : (showSearchBar ? 140 : 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { height: headerHeight }]}
      >
        <View style={styles.topHeaderRow}>
          {navigation && navigation.goBack && (
            <Pressable
              style={styles.backButton}
              android_ripple={{
                color: 'rgba(255,255,255,0.2)',
                borderless: true,
                radius: 20,
              }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          )}
          <Text style={styles.headerTitle}>Suppliers Info</Text>
          <Pressable
            style={styles.searchToggleButton}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: true,
              radius: 20,
            }}
            onPress={toggleSearchBar}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={[
          styles.searchContainer,
          {
            height: showSearchBar ? 48 : 0,
            paddingVertical: showSearchBar ? 0 : 0,
            marginBottom: showSearchBar ? 10 : 0,
            opacity: showSearchBar ? 1 : 0,
          }
        ]}>
          <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by VAT or Name"
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
            disabled={!showSearchBar}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {showGroupedSuppliers && suppliersGroupData && suppliersGroupData.length > 0 ? (
        <FlatList
          key="groupedSuppliersList" // Add unique key
          data={suppliersGroupData}
          keyExtractor={(item) => item.CategoryCode}
          renderItem={({ item }) => (
            <SupplierGroupCard group={item} onPress={handleCategoryPress} />
          )}
          numColumns={3} // Changed to 3 columns
          contentContainerStyle={styles.groupedListContent}
        />
      ) : showGroupedSuppliers && (!suppliersGroupData || suppliersGroupData.length === 0) ? (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="cloud-off-outline" size={60} color="#ccc" />
          <Text style={styles.noDataText}>No supplier categories found.</Text>
          <Text style={styles.noDataSubText}>Check your connection or try again later.</Text>
        </View>
      ) : suppliersData && suppliersData.length > 0 ? (
        <FlatList
          key="searchSuppliersList" // Add unique key
          data={suppliersData}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={({ item, index }) => <SupplierCard supplier={item} index={index} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="cloud-off-outline" size={60} color="#ccc" />
          <Text style={styles.noDataText}>No suppliers found.</Text>
          <Text style={styles.noDataSubText}>Try adjusting your search or check your connection.</Text>
        </View>
      )}

      {/* Gorhom Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // -1 means hidden by default
        snapPoints={snapPoints}
        enablePanDownToClose={true} // Allow closing by swiping down
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop} // Use custom backdrop for dimming effect
      >
        <View style={bottomSheetStyles.contentContainer}>
          <View style={bottomSheetStyles.bottomSheetHeader}>
            <Text style={bottomSheetStyles.bottomSheetTitle}>{selectedCategoryName} Suppliers</Text>
            <Pressable onPress={() => bottomSheetRef.current?.close()} style={bottomSheetStyles.closeButton}>
              <Ionicons name="close-circle-outline" size={30} color="#666" />
            </Pressable>
          </View>

          {selectedCategorySuppliers.length > 0 ? (
            <BottomSheetFlatList
              data={selectedCategorySuppliers}
              keyExtractor={(item) => item.SupplierId.toString()}
              renderItem={renderBottomSheetSupplierItem}
              contentContainerStyle={bottomSheetStyles.bottomSheetListContent}
            />
          ) : (
            <View style={bottomSheetStyles.bottomSheetNoData}>
              <Text style={bottomSheetStyles.bottomSheetNoDataText}>No suppliers in this category.</Text>
            </View>
          )}
        </View>
      </BottomSheet>
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 2 },
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

// New styles for the Gorhom Bottom Sheet
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
    backgroundColor: '#fff', // Ensure header background is white
    borderTopLeftRadius: 20, // Match BottomSheet border radius
    borderTopRightRadius: 20, // Match BottomSheet border radius
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