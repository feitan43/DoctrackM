import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useInventory} from '../hooks/usePersonal';
import {FlashList} from '@shopify/flash-list';

const pickImage = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
      resolve(
        `https://placehold.co/150x150/${randomColor}/FFFFFF?text=Uploaded!`,
      );
    }, 1500);
  });
};

const InventoryScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {data, isLoading, error} = useInventory();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [originalInventoryItems, setOriginalInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [currentView, setCurrentView] = useState('grouped');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const imageUploadBottomSheetRef = useRef(null);
  const yearFilterBottomSheetRef = useRef(null);

  const imageUploadSnapPoints = useMemo(() => ['25%', '50%', '75%'], []);
  const yearFilterSnapPoints = useMemo(() => ['25%', '50%', '75%'], []);

  const handlePresentImageUploadSheet = useCallback(item => {
    setSelectedItem(item);
    imageUploadBottomSheetRef.current?.expand();
  }, []);

  const handleCloseImageUploadSheet = useCallback(() => {
    imageUploadBottomSheetRef.current?.close();
    setSelectedItem(null);
  }, []);

  const handlePresentYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.expand();
  }, []);

  const handleCloseYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.close();
  }, []);

  const handleBottomSheetChange = useCallback(index => {
    setIsBottomSheetOpen(index !== -1);
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      setOriginalInventoryItems(data);
      const years = [...new Set(data.map(item => item.Year))]
        .filter(Boolean)
        .sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(years);
    }
  }, [data]);

  useEffect(() => {
    let filtered = originalInventoryItems;

    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          (item.Item || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.Description || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.Year || '').includes(lowerCaseQuery) ||
          (item.TrackingNumber || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.Brand || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.CommonName || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.SerialNumber || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.ModelNumber || '').toLowerCase().includes(lowerCaseQuery),
      );
    }

    if (selectedYear) {
      filtered = filtered.filter(item => item.Year === selectedYear);
    }

    setInventoryItems(filtered);
    setCurrentView('grouped');
    setSelectedGroup(null);
  }, [searchQuery, selectedYear, originalInventoryItems]);

  const groupedAndFilteredData = useMemo(() => {
    if (!inventoryItems.length && !isLoading) {
      return [];
    }

    if (currentView === 'grouped') {
      const groups = {};
      inventoryItems.forEach(item => {
        const tn = item.TrackingNumber || 'No TN';
        const year = item.Year || 'No Year';
        if (!groups[tn]) {
          groups[tn] = {};
        }
        if (!groups[tn][year]) {
          groups[tn][year] = [];
        }
        groups[tn][year].push(item);
      });

      const groupHeaders = [];
      Object.keys(groups)
        .sort()
        .forEach(tn => {
          Object.keys(groups[tn])
            .sort((a, b) => parseInt(b) - parseInt(a))
            .forEach(year => {
              groupHeaders.push({
                type: 'groupHeader',
                trackingNumber: tn,
                year: year,
                itemCount: groups[tn][year].length, // Added item count here
                id: `group-${tn}-${year}`,
              });
            });
        });
      return groupHeaders;
    } else if (currentView === 'items' && selectedGroup) {
      const items = inventoryItems.filter(
        item =>
          (item.TrackingNumber || 'No TN') === selectedGroup.trackingNumber &&
          (item.Year || 'No Year') === selectedGroup.year,
      );
      return items.map((item, index) => ({
        type: 'item',
        data: item,
        id: `${item.TrackingNumber || 'no-track'}-${
          item.SerialNumber || 'no-sn'
        }-${item.Item || 'no-item'}-${index}`,
      }));
    }
    return [];
  }, [inventoryItems, currentView, selectedGroup, isLoading]);

  const handleImageUpload = useCallback(async () => {
    if (selectedItem) {
      setUploadingImage(true);
      try {
        const newImageUrl = await pickImage();
        setUploadingImage(false);

        if (newImageUrl) {
          const updatedOriginalItems = originalInventoryItems.map(item =>
            item.TrackingNumber === selectedItem.TrackingNumber &&
            item.SerialNumber === selectedItem.SerialNumber
              ? {...item, imageUrl: newImageUrl}
              : item,
          );
          setOriginalInventoryItems(updatedOriginalItems);
          setSelectedItem(prev => ({...prev, imageUrl: newImageUrl}));
          handleCloseImageUploadSheet();
          Alert.alert(
            'Success',
            `${selectedItem.Item || 'Item'}'s image has been updated!`,
          );
        } else {
          Alert.alert('Cancelled', 'Image picking cancelled.');
        }
      } catch (uploadError) {
        setUploadingImage(false);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
        console.error('Image upload error:', uploadError);
      }
    }
  }, [selectedItem, originalInventoryItems, handleCloseImageUploadSheet]);

  const renderGroupedItem = useCallback(
    ({item, index}) => {
      if (item.type === 'groupHeader') {
        return (
          <TouchableOpacity
            style={styles.groupHeaderContainer}
            onPress={() => {
              setSelectedGroup({
                trackingNumber: item.trackingNumber,
                year: item.year,
              });
              setCurrentView('items');
              setSearchQuery('');
            }}
            accessibilityLabel={`View ${
              item.itemCount || 0
            } items for tracking number ${item.trackingNumber} in year ${
              item.year
            }`}>
            <View style={styles.groupHeaderContent}>
              <Text style={{paddingHorizontal: 10}}>{index + 1}</Text>
              <Text style={styles.groupHeaderText}>
                {/*  TN:{' '} */}
                <Text style={styles.groupHighlight}>
                  <Text style={{fontWeight: 400, color: '#252525'}}>
                    {item.year} |{' '}
                  </Text>
                  {item.trackingNumber}
                </Text>
              </Text>
              {/*  <Text style={styles.groupSubText}>
                Year: <Text style={styles.groupHighlight}>{item.year}</Text>
              </Text> */}
            </View>
            <View style={styles.groupRightSection}>
              {item.itemCount > 0 && (
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountText}>{item.itemCount}</Text>
                </View>
              )}
              <Icon
                name="chevron-forward"
                size={24}
                color="#1a508c"
                style={styles.groupHeaderIcon}
              />
            </View>
          </TouchableOpacity>
        );
      } else {
        const inventoryItem = item.data;
        return (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
              handlePresentImageUploadSheet(inventoryItem);
            }}
            accessibilityLabel={`View details for ${
              inventoryItem.Item || 'No Item Name'
            }`}>
            <View style={styles.itemImageContainer}>
              <Image
                source={{
                  uri:
                    inventoryItem.imageUrl || // Keep existing imageUrl if it's already set (e.g., from an upload)
                    `https://davaocityportal.com/tempUpload/${
                      inventoryItem.Id
                    }~${inventoryItem.Office || 'UnknownOffice'}~${
                      inventoryItem.TrackingNumber || 'UnknownTracking'
                    }~1`, // Dynamic URL for placeholder
                }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.itemDetails}>
              <Text>{index + 1}</Text>
              <Text
                style={styles.itemName}
                numberOfLines={2}
                ellipsizeMode="tail">
                {inventoryItem.Item || 'N/A'}
              </Text>
              <Text
                style={styles.itemDescription}
                numberOfLines={2}
                ellipsizeMode="tail">
                {inventoryItem.Description || 'No description provided.'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Id:</Text>{' '}
                {inventoryItem.Id || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Brand:</Text>{' '}
                {inventoryItem.Brand || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Common Name:</Text>{' '}
                {inventoryItem.CommonName || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>S/N:</Text>{' '}
                {inventoryItem.SerialNumber || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Model:</Text>{' '}
                {inventoryItem.ModelNumber || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Assigned to:</Text>{' '}
                {inventoryItem.NameAssignedTo || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Current user:</Text>{' '}
                {inventoryItem.CurrentUser || 'N/A'}
              </Text>
              <Text style={styles.itemMeta}>
                <Text style={{fontWeight: 'bold'}}>Year:</Text>{' '}
                {inventoryItem.Year || 'N/A'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [handlePresentImageUploadSheet],
  );

  const handleBack = useCallback(() => {
    if (currentView === 'items') {
      setCurrentView('grouped');
      setSelectedGroup(null);
    } else {
      navigation.goBack();
    }
  }, [currentView, navigation]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ImageBackground
            source={require('../../assets/images/CirclesBG.png')}
            style={styles.bgHeader}
            imageStyle={styles.bgHeaderImageStyle}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <View style={{width: 60}} />
            </View>
          </ImageBackground>

          <View style={styles.searchFilterRow}>
            <View style={styles.searchInputWrapper}>
              <Icon
                name="search-outline"
                size={20}
                color="#6C757D"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityHint="Type to search for inventory items by name, description, tracking number, brand, model number, or year."
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                  accessibilityLabel="Clear search query">
                  <Icon name="close-circle" size={20} color="#6C757D" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={handlePresentYearFilterSheet}
              accessibilityLabel={`Currently filtered by year ${
                selectedYear || 'All Years'
              }. Tap to change.`}>
              <Icon name="filter-outline" size={22} color="#FFFFFF" />
              <Text style={styles.filterButtonText}>
                {selectedYear ? selectedYear : 'Year'}
              </Text>
              {selectedYear && (
                <TouchableOpacity
                  onPress={() => setSelectedYear(null)}
                  style={styles.clearYearFilter}
                  accessibilityLabel="Clear year filter">
                  <Icon name="close-circle" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#1a508c"
              style={styles.loadingIndicator}
            />
          ) : error ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="warning-outline" size={50} color="#DC3545" />
              <Text style={styles.noItemsText}>Error loading data</Text>
              <Text style={styles.noItemsSubText}>
                There was an issue fetching your inventory. Please check your
                connection or try again later.
              </Text>
            </View>
          ) : (
            <FlashList // Changed from FlatList to FlashList
              data={groupedAndFilteredData}
              renderItem={renderGroupedItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              estimatedItemSize={150} // Added estimatedItemSize
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Icon name="cube-outline" size={50} color="#6C757D" />
                  <Text style={styles.noItemsText}>No items found</Text>
                  <Text style={styles.noItemsSubText}>
                    {selectedYear
                      ? `No items found for year ${selectedYear}.`
                      : currentView === 'items' && selectedGroup
                      ? `No items found under TN ${selectedGroup.trackingNumber} for year ${selectedGroup.year}.`
                      : 'Try adjusting your search or filters.'}
                  </Text>
                </View>
              }
            />
          )}

          <BottomSheet
            ref={imageUploadBottomSheetRef}
            index={-1}
            snapPoints={imageUploadSnapPoints}
            enablePanDownToClose={true}
            backdropComponent={BottomSheetBackdrop}
            handleIndicatorStyle={styles.bottomSheetHandle}
            onChange={handleBottomSheetChange}>
            <BottomSheetScrollView
              contentContainerStyle={styles.bottomSheetContent}>
              <Text style={styles.modalTitle}>Upload Image for</Text>
              <Text
                style={[styles.modalTitle, {fontWeight: 'normal'}]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {selectedItem?.Item || 'Selected Item'}
              </Text>
              {selectedItem?.imageUrl ? (
                <Image
                  source={{uri: selectedItem.imageUrl}}
                  style={styles.modalImagePreview}
                  resizeMode="contain"
                  accessibilityLabel={`Current image for ${
                    selectedItem.Item || 'Selected Item'
                  }`}
                />
              ) : (
                <View style={styles.modalImagePlaceholder}>
                  <Icon name="image-outline" size={60} color="#ADB5BD" />
                  <Text style={styles.modalImagePlaceholderText}>
                    No image yet
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleImageUpload}
                disabled={uploadingImage}
                accessibilityLabel="Select and upload a new image">
                {uploadingImage ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Icon
                      name="cloud-upload-outline"
                      size={20}
                      color="#FFFFFF"
                      style={styles.uploadButtonIcon}
                    />
                    <Text style={styles.uploadButtonText}>
                      Select and Upload Image
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCloseImageUploadSheet}
                accessibilityLabel="Cancel image upload">
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </BottomSheetScrollView>
          </BottomSheet>

          <BottomSheet
            ref={yearFilterBottomSheetRef}
            index={-1}
            snapPoints={yearFilterSnapPoints}
            enablePanDownToClose={true}
            backdropComponent={BottomSheetBackdrop}
            handleIndicatorStyle={styles.bottomSheetHandle}
            onChange={handleBottomSheetChange}>
            <BottomSheetFlatList
              data={['All Years', ...availableYears]}
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
                    (selectedYear === item ||
                      (item === 'All Years' && selectedYear === null)) &&
                      styles.selectedYearOptionButton,
                  ]}
                  onPress={() => {
                    setSelectedYear(item === 'All Years' ? null : item);
                    handleCloseYearFilterSheet();
                  }}
                  accessibilityLabel={
                    item === 'All Years'
                      ? 'Show all inventory years'
                      : `Filter by year ${item}`
                  }>
                  <Text
                    style={[
                      styles.yearOptionText,
                      (selectedYear === item ||
                        (item === 'All Years' && selectedYear === null)) &&
                        styles.selectedYearOptionText,
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
    backgroundColor: '#F0F2F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 130,
    backgroundColor: '#1a508c',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 15,
    marginTop: -40,
    //zIndex: 10,
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
  clearYearFilter: {
    marginLeft: 8,
    padding: 2,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 6,
    lineHeight: 18,
  },
  itemMeta: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 2,
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
  bottomSheetContent: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
  modalImagePreview: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: '#DEE2E6',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  modalImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D6DD',
  },
  modalImagePlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#868E96',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  uploadButtonIcon: {
    marginRight: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
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
  groupHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 10,
    borderLeftWidth: 6,
    borderColor: '#1a508c',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  groupHeaderText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 4,
  },
  groupSubText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6C757D',
  },
  groupHighlight: {
    fontWeight: 'bold',
    color: '#1a508c',
  },
  groupRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  itemCountBadge: {
    backgroundColor: '#007BFF',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
    minWidth: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  groupHeaderIcon: {
    // Styles applied directly to the Icon component
  },
});

export default InventoryScreen;
