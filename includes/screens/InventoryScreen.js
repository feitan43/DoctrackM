import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  FlatList,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useInventory, useInventoryImages} from '../hooks/useInventory';
import {FlashList} from '@shopify/flash-list';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import CameraComponent from '../utils/CameraComponent';
import useSearchTrack from '../api/useSearchTrack';
import useUserInfo from '../api/useUserInfo';

const InventoryScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {data, isLoading, error} = useInventory();
  const {officeCode} = useUserInfo();

  const originalInventoryData = useRef([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUris, setPreviewImageUris] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [modalGroupItems, setModalGroupItems] = useState([]);
  const [modalGroupHeader, setModalGroupHeader] = useState(null);

  const imageUploadBottomSheetRef = useRef(null);
  const yearFilterBottomSheetRef = useRef(null);

  const imageUploadSnapPoints = useMemo(() => ['25%', '50%', '100%'], []);
  const yearFilterSnapPoints = useMemo(() => ['25%', '50%', '75%'], []);

  const getBaseImageUrl = useCallback(item => {
    return `https://davaocityportal.com/tempUpload/${item?.Id || 'UnknownId'}~${
      item?.Office || 'UnknownOffice'
    }~${item?.TrackingNumber || 'UnknownTracking'}~`;
  }, []);


  /*  const handlePresentImageUploadSheet = useCallback(
    item => {
      let primaryImageUrl = item.imageUrl;

      if (!primaryImageUrl && item.UploadFiles) {
        const parts = item.UploadFiles.split('-');
        if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) {
          primaryImageUrl = `${getBaseImageUrl(item)}${parseInt(parts[0], 10)}`;
        }
      }

      setSelectedItem({...item, imageUrl: primaryImageUrl});
      setPreviewImageUris([]);
      imageUploadBottomSheetRef.current?.expand();
    },
    [getBaseImageUrl],
  ); */

  const handlePresentImageUploadSheet = useCallback(
    item => {
      let primaryImageUrl = item.imageUrl;
      let existingMultipleImageUrls = [];

      if (item.UploadFiles) {
        const parts = item.UploadFiles.split('-');
        const imageNumbers = parts.filter(
          part => !isNaN(parseInt(part, 10)) && part.trim() !== '',
        );

        if (imageNumbers.length > 0) {
          existingMultipleImageUrls = imageNumbers.map(
            num => `${getBaseImageUrl(item)}${parseInt(num, 10)}`,
          );
          if (!primaryImageUrl && existingMultipleImageUrls.length > 0) {
            primaryImageUrl = existingMultipleImageUrls[0];
          }
        }
      }
      setSelectedItem({
        ...item,
        imageUrl: primaryImageUrl,
        multipleImageUrls: existingMultipleImageUrls,
      });

      setPreviewImageUris([]);
      imageUploadBottomSheetRef.current?.expand();
    },
    [getBaseImageUrl],
  );

  const handleCloseImageUploadSheet = useCallback(() => {
    imageUploadBottomSheetRef.current?.close();
    setSelectedItem(null);
    setPreviewImageUris([]);
  }, []);

  const handlePresentYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.expand();
  }, []);

  const handleCloseYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      originalInventoryData.current = data;
      const years = [...new Set(data.map(item => item.Year))]
        .filter(Boolean)
        .sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(years);
    }
  }, [data]);

  const filteredInventoryItems = useMemo(() => {
    let items = originalInventoryData.current;

    if (selectedYear) {
      items = items.filter(item => item.Year === selectedYear);
    }

    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      items = items.filter(item =>
        (item.TrackingNumber || '').toLowerCase().includes(lowerCaseQuery),
      );
    }
    return items;
  }, [searchQuery, selectedYear, data]);

  const displayData = useMemo(() => {
    if (!filteredInventoryItems.length && !isLoading) {
      return [];
    }

    if (searchQuery.trim() !== '') {
      const groups = {};
      filteredInventoryItems.forEach(item => {
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
                itemCount: groups[tn][year].length,
                id: `group-${tn}-${year}`,
                items: groups[tn][year],
              });
            });
        });
      return groupHeaders;
    }

    const groups = {};
    filteredInventoryItems.forEach(item => {
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
              itemCount: groups[tn][year].length,
              id: `group-${tn}-${year}`,
              items: groups[tn][year],
            });
          });
      });
    return groupHeaders;
  }, [filteredInventoryItems, searchQuery, isLoading]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Your app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleRemovePreviewImage = useCallback(indexToRemove => {
    setPreviewImageUris(currentUris =>
      currentUris.filter((_, index) => index !== indexToRemove),
    );
  }, []);

  /* const handlePickImagesForPreview = useCallback(
    async source => {
      if (selectedItem) {
        try {
          const options = {
            mediaType: 'photo',
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.7,
            includeBase64: false,
            selectionLimit: 5,
          };

          let response;
          if (source === 'camera') {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
              Alert.alert(
                'Permission Denied',
                'Camera permission is required.',
              );
              return;
            }
            response = await launchCamera(options);
          } else if (source === 'gallery') {
            response = await launchImageLibrary(options);
          } else {
            Alert.alert('Error', 'Invalid image source provided.');
            return;
          }

          if (response.didCancel) {
            // User cancelled
          } else if (response.errorMessage) {
            Alert.alert(
              'Error',
              `Image Picker Error: ${response.errorMessage}`,
            );
            console.error('Image Picker Error:', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const newUris = response.assets.map(asset => asset.uri);
            // This is the key: append new URIs to the existing ones
            setPreviewImageUris(prevUris => [...prevUris, ...newUris]);
          } else {
            Alert.alert('Info', 'No image(s) selected.');
          }
        } catch (pickerError) {
          Alert.alert(
            'Error',
            'An unexpected error occurred during image selection.',
          );
          console.error('Image picking error:', pickerError);
        }
      }
    },
    [selectedItem],
  ); */

  const handlePickImagesForPreview = useCallback(
    async source => {
      if (selectedItem) {
        if (previewImageUris.length >= 5) {
          Alert.alert(
            'Maximum Images Reached',
            'You can only select up to 5 images for preview.',
          );
          return;
        }

        try {
          const remainingSlots = 5 - previewImageUris.length;

          const options = {
            mediaType: 'photo',
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.7,
            includeBase64: false,
            selectionLimit: remainingSlots,
          };

          let response;
          if (source === 'camera') {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
              Alert.alert(
                'Permission Denied',
                'Camera permission is required.',
              );
              return;
            }
            response = await launchCamera(options);
          } else if (source === 'gallery') {
            response = await launchImageLibrary(options);
          } else {
            Alert.alert('Error', 'Invalid image source provided.');
            return;
          }

          if (response.didCancel) {
          } else if (response.errorMessage) {
            Alert.alert(
              'Error',
              `Image Picker Error: ${response.errorMessage}`,
            );
            console.error('Image Picker Error:', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const newUris = response.assets.map(asset => asset.uri);

            const combinedUris = [...previewImageUris, ...newUris];
            setPreviewImageUris(combinedUris.slice(0, 5));
          } else {
            Alert.alert('Info', 'No image(s) selected.');
          }
        } catch (pickerError) {
          Alert.alert(
            'Error',
            'An unexpected error occurred during image selection.',
          );
          console.error('Image picking error:', pickerError);
        }
      }
    },
    [selectedItem, previewImageUris], // Add previewImageUris to dependencies
  );

  const handlePhotoTakenFromCamera = useCallback(photoUri => {
    if (photoUri) {
      setPreviewImageUris(prevUris => [...prevUris, photoUri]);
    }
    setIsCameraVisible(false);
  }, []);

  /* const confirmUploadImages = useCallback(async () => {
    if (!selectedItem || previewImageUris.length === 0) {
      Alert.alert('No Images', 'Please select images for preview first.');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedImageUrls = [];
      for (const imageUri of previewImageUris) {
        console.log(`Simulating upload for: ${imageUri}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        uploadedImageUrls.push(imageUri);
      }

      const finalImageUrl = uploadedImageUrls[0] || null;

      const updatedOriginalItems = originalInventoryData.current.map(item =>
        item.Id === selectedItem.Id
          ? {
              ...item,
              imageUrl: finalImageUrl,
              allUploadFilesUris: uploadedImageUrls,
            }
          : item,
      );
      originalInventoryData.current = updatedOriginalItems;
      setSelectedItem(prev => ({
        ...prev,
        imageUrl: finalImageUrl,
        allUploadFilesUris: uploadedImageUrls,
      }));

      handleCloseImageUploadSheet();
      Alert.alert(
        'Success',
        `${previewImageUris.length} image(s) for ${
          selectedItem.Item || 'Item'
        } updated!`,
      );
    } catch (uploadError) {
      Alert.alert(
        'Upload Error',
        'Failed to upload images to server. Please try again.',
      );
      console.error('Image upload to server error:', uploadError);
    } finally {
      setUploadingImage(false);
    }
  }, [selectedItem, previewImageUris, handleCloseImageUploadSheet]); */

  const confirmUploadImages = useCallback(async () => {
    if (!selectedItem || previewImageUris.length === 0) {
      Alert.alert('No Images', 'Please select images for preview first.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0); // Reset progress at the start of upload**
    try {
      const uploadedImageUrls = [];
      for (const imageUri of previewImageUris) {
        console.log(`Simulating upload for: ${imageUri}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Shorter timeout for quicker demo
        uploadedImageUrls.push(imageUri);
        setUploadProgress(prev => prev + 1); // Increment progress after each "upload"**
      }

      const finalImageUrl = uploadedImageUrls[0] || null;

      const updatedOriginalItems = originalInventoryData.current.map(item =>
        item.Id === selectedItem.Id
          ? {
              ...item,
              imageUrl: finalImageUrl,
              allUploadFilesUris: uploadedImageUrls,
            }
          : item,
      );
      originalInventoryData.current = updatedOriginalItems;
      setSelectedItem(prev => ({
        ...prev,
        imageUrl: finalImageUrl,
        allUploadFilesUris: uploadedImageUrls,
      }));

      handleCloseImageUploadSheet();
      Alert.alert(
        'Success',
        `${previewImageUris.length} image(s) for ${
          selectedItem.Item || 'Item'
        } updated!`,
      );
    } catch (uploadError) {
      Alert.alert(
        'Upload Error',
        'Failed to upload images to server. Please try again.',
      );
      console.error('Image upload to server error:', uploadError);
    } finally {
      setUploadingImage(false);
      setUploadProgress(0); // Reset progress after upload finishes (success or failure)**
    }
  }, [selectedItem, previewImageUris, handleCloseImageUploadSheet]);

  const handleViewGroup = useCallback(group => {
    setModalGroupItems(group.items);
    setModalGroupHeader(group);
    setIsGroupModalVisible(true);
  }, []);

  const handleCloseGroupModal = useCallback(() => {
    setIsGroupModalVisible(false);
    setModalGroupItems([]);
    setModalGroupHeader(null);
    setSearchQuery('');
    setSelectedYear(null);
  }, []);

 const InventoryItemComponent = ({
  inventoryItem,
  index,
  handlePresentImageUploadSheet,
  }) => {
  const {data: fetchedImageUrls, isLoading} = useInventoryImages( 
    inventoryItem.Id,
    inventoryItem.Office,
    inventoryItem.TrackingNumber,
  );

    const fetchedImageUrl = fetchedImageUrls && fetchedImageUrls.length > 0
      ? fetchedImageUrls[0]
      : null;

 /*  console.log(fetchedImageUrl, inventoryItem.Id,
    inventoryItem.Office,
    inventoryItem.TrackingNumber)
 */
    const imageSource = fetchedImageUrl
    ? {uri: fetchedImageUrl}
    : inventoryItem.imageUrl
    ? {uri: inventoryItem.imageUrl}
    : inventoryItem.UploadFiles &&
    !isNaN(parseInt(inventoryItem.UploadFiles.split('-')[0], 10))
    ? {
      uri: `${getBaseImageUrl(inventoryItem)}${parseInt(
      inventoryItem.UploadFiles.split('-')[0],
      10,
      )}`,
    }
  : {uri: `${getBaseImageUrl(inventoryItem)}1`};

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePresentImageUploadSheet(inventoryItem)}
      accessibilityLabel={`View details for ${
        inventoryItem.Item || 'No Item Name'
      }`}>
      <View style={styles.itemImageContainer}>
        {isLoading ? (
          <View style={styles.loadingImagePlaceholder}>
            <Text style={styles.loadingImagePlaceholderText}>Loading...</Text>
          </View>
        ) : fetchedImageUrl ||
          inventoryItem.imageUrl ||
          inventoryItem.UploadFiles ? (
          <Image
            source={imageSource}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Icon
              name="image-outline"
              size={30}
              color={styles.noImagePlaceholderText.color}
            />
            <Text style={styles.noImagePlaceholderText}>No image</Text>
          </View>
        )}
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemIndex}>{index + 1}</Text>
        <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
          {inventoryItem.Item || 'N/A'}
        </Text>
        <Text style={styles.itemMeta}>
          <Text style={styles.itemMetaLabel}>Brand:</Text>{' '}
          {inventoryItem.Brand || 'N/A'}
        </Text>
        <Text style={styles.itemMeta}>
          <Text style={styles.itemMetaLabel}>Common Name:</Text>{' '}
          {inventoryItem.CommonName || 'N/A'}
        </Text>
        <Text style={styles.itemMeta}>
          <Text style={styles.itemMetaLabel}>Assigned to:</Text>{' '}
          {inventoryItem.NameAssignedTo || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
  };


  const renderListItem = useCallback(
    ({item, index}) => {
      if (item.type === 'groupHeader') {
        return (
          <TouchableOpacity
            style={styles.groupHeaderContainer}
            onPress={() => handleViewGroup(item)}
            accessibilityLabel={`View ${
              item.itemCount || 0
            } items for tracking number ${item.trackingNumber} in year ${
              item.year
            }`}>
            <View style={styles.groupHeaderContent}>
              <Text style={styles.groupIndex}>{index + 1}</Text>
              <Text style={styles.groupHeaderText}>
                <Text style={styles.groupHeaderYear}>{item.year} | </Text>
                <Text style={styles.groupHeaderTrackingNumber}>
                  {item.trackingNumber}
                </Text>
              </Text>
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
                color={styles.groupHeaderIcon.color}
              />
            </View>
          </TouchableOpacity>
        );
      } else {
        //const inventoryItem = item.data;
        return (
          <InventoryItemComponent
            inventoryItem={item.data}
            index={index}
            handlePresentImageUploadSheet={handlePresentImageUploadSheet}
          />
        );
      }
    },
    [handlePresentImageUploadSheet, handleViewGroup, getBaseImageUrl],
  );

  

  const handleBack = useCallback(() => {
    if (isGroupModalVisible) {
      handleCloseGroupModal();
    } else if (searchQuery.trim() !== '') {
      setSearchQuery('');
    } else if (selectedYear) {
      setSelectedYear(null);
    } else {
      navigation.goBack();
    }
  }, [
    isGroupModalVisible,
    searchQuery,
    selectedYear,
    navigation,
    handleCloseGroupModal,
  ]);

  const renderImageUploadBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.3}
        pressBehavior="close"
      />
    ),
    [],
  );

  const getMultipleImageUrls = useCallback(
    item => {
      const baseUrl = getBaseImageUrl(item);

      if (item?.UploadFiles) {
        const parts = item.UploadFiles.split('-');
        if (parts.length > 1) {
          const start = parseInt(parts[0], 10);
          const end = parseInt(parts[parts.length - 1], 10);

          if (!isNaN(start) && !isNaN(end) && start <= end) {
            const urls = [];
            for (let i = start; i <= end; i++) {
              urls.push(`${baseUrl}${i}`);
            }
            return urls;
          }
        }
      }
      return null;
    },
    [getBaseImageUrl],
  );

  return (
    <GestureHandlerRootView style={styles.safeArea}>
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
                color={styles.searchIcon.color}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by TN..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                autoCapitalize="characters"
                onChangeText={setSearchQuery}
                accessibilityHint="Type to search for inventory items by tracking number."
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                  accessibilityLabel="Clear search query">
                  <Icon
                    name="close-circle"
                    size={20}
                    color={styles.searchIcon.color}
                  />
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
              color={styles.loadingIndicator.color}
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
            <FlashList
              data={displayData}
              renderItem={renderListItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              estimatedItemSize={150}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Icon
                    name="cube-outline"
                    size={50}
                    color={styles.noItemsText.color}
                  />
                  <Text style={styles.noItemsText}>No items found</Text>
                  <Text style={styles.noItemsSubText}>
                    {selectedYear
                      ? `No items found for year ${selectedYear}.`
                      : 'Try adjusting your search or filters.'}
                  </Text>
                </View>
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

          <Modal
            visible={isGroupModalVisible}
            onRequestClose={handleCloseGroupModal}
            animationType="slide"
            presentationStyle="fullScreen">
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalContainer}>
                <ImageBackground
                  source={require('../../assets/images/CirclesBG.png')}
                  style={[styles.bgHeader, {paddingTop: 0}]}
                  imageStyle={styles.bgHeaderImageStyle}>
                  <View style={styles.header}>
                    <TouchableOpacity
                      onPress={handleCloseGroupModal}
                      style={styles.backButton}>
                      <Icon
                        name="chevron-back-outline"
                        size={26}
                        color="#FFFFFF"
                      />
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <View style={{width: 60}} />
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalGroupTitle}>
                      <Text style={{fontWeight: 'normal'}}>
                        {modalGroupHeader?.year || ''}
                      </Text>{' '}
                      | {modalGroupHeader?.trackingNumber || 'Grouped Items'}
                    </Text>
                    <Text style={styles.modalGroupSubtitle}>
                      ({modalGroupHeader?.itemCount || 0} items)
                    </Text>
                  </View>
                </ImageBackground>

                {modalGroupItems.length > 0 ? (
                  <FlashList
                    data={modalGroupItems.map((item, index) => ({
                      type: 'item',
                      data: item,
                      id: `${item.TrackingNumber || 'no-track'}-${
                        item.SerialNumber || 'no-sn'
                      }-${item.Item || 'no-item'}-${index}`,
                    }))}
                    renderItem={renderListItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    estimatedItemSize={150}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Icon
                      name="cube-outline"
                      size={50}
                      color={styles.noItemsText.color}
                    />
                    <Text style={styles.noItemsText}>
                      No items in this group
                    </Text>
                    <Text style={styles.noItemsSubText}>
                      This group currently has no items.
                    </Text>
                  </View>
                )}

                <BottomSheet
                  ref={imageUploadBottomSheetRef}
                  index={-1}
                  snapPoints={imageUploadSnapPoints}
                  enablePanDownToClose={true}
                  backdropComponent={renderImageUploadBackdrop}
                  handleIndicatorStyle={styles.bottomSheetHandle}>
                  <Text style={[styles.modalTitle, {marginStart: 20}]}>
                    Upload Image for
                  </Text>

                  <BottomSheetScrollView
                    contentContainerStyle={styles.bottomSheetContent}>
                    <View style={styles.itemDetailsContainer}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Id:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?./* Item */ Id || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Common Name:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.CommonName || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Brand:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.Brand || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Unit:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.Unit || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Model:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.ModelNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Serial:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.SerialNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Set:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.Set || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Property #:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.PropertyNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Sticker #:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.StickerNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Assigned to:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.NameAssignedTo || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Used by:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.CurrentUser || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>NumOfFiles:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.NumOfFiles || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>UploadFiles:</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem?.UploadFiles || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <Text>Description</Text>
                    <View>
                      <Text
                        style={[
                          styles.modalTitle,
                          {fontWeight: 'normal', fontSize: 18, marginBottom: 5},
                        ]}
                        numberOfLines={isTextExpanded ? 0 : 2}
                        ellipsizeMode="tail"
                        onTextLayout={e => {
                          if (
                            e.nativeEvent.lines.length > 2 &&
                            !isTextExpanded
                          ) {
                          }
                        }}>
                        {selectedItem?.Item || 'Selected Item'}
                      </Text>
                      {(selectedItem?.Item?.length > 70 ||
                        (selectedItem?.Item &&
                          selectedItem.Item.split('\n').length > 2)) && (
                        <TouchableOpacity
                          onPress={() => setIsTextExpanded(prev => !prev)}>
                          <Text style={styles.showMoreLessText}>
                            {isTextExpanded ? 'Show Less' : 'Show More'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {previewImageUris.length > 0 ? (
                      <View style={styles.modalMultipleImagesContainer}>
                        <FlatList
                          data={previewImageUris}
                          horizontal
                          showsHorizontalScrollIndicator={true}
                          keyExtractor={(item, index) => item + '_' + index}
                          renderItem={({item: imageUrl, index}) => (
                            <View style={styles.imagePreviewWrapper}>
                              <Image
                                source={{uri: imageUrl}}
                                style={styles.modalMultiImagePreview}
                                resizeMode="contain"
                              />
                              <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => handleRemovePreviewImage(index)}
                                accessibilityLabel={`Remove image ${
                                  index + 1
                                }`}>
                                <Text
                                  style={{color: 'white', fontWeight: 'bold'}}>
                                  X
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        />
                        {uploadingImage ? (
                          <Text style={styles.uploadingProgressText}>
                            Uploading {uploadProgress} of{' '}
                            {previewImageUris.length} image(s)...
                          </Text>
                        ) : (
                          <Text style={styles.previewCountText}>
                            {previewImageUris.length} image(s) selected for
                            upload
                          </Text>
                        )}
                      </View>
                    ) : (
                      (() => {
                        const multipleImageUrls =
                          selectedItem?.multipleImageUrls;
                        if (multipleImageUrls && multipleImageUrls.length > 0) {
                          return (
                            <View style={styles.modalMultipleImagesContainer}>
                              <FlatList
                                data={multipleImageUrls}
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                keyExtractor={(item, index) => item + index}
                                renderItem={({item: imageUrl}) => (
                                  <Image
                                    source={{uri: imageUrl}}
                                    style={styles.modalMultiImagePreview}
                                    resizeMode="contain"
                                  />
                                )}
                              />
                            </View>
                          );
                        } else if (selectedItem?.imageUrl) {
                          return (
                            <Image
                              source={{uri: selectedItem.imageUrl}}
                              style={styles.modalImagePreview}
                              resizeMode="contain"
                            />
                          );
                        } else {
                          return (
                            <View style={styles.modalImagePlaceholder}>
                              <Text style={styles.modalImagePlaceholderText}>
                                No image(s) yet
                              </Text>
                            </View>
                          );
                        }
                      })()
                    )}

                    <TouchableOpacity
                      style={[
                        styles.selectImageButton,
                        (uploadingImage || previewImageUris.length >= 5) &&
                          styles.selectImageButtonDisabled, // Apply disabled style
                      ]}
                      onPress={() => handlePickImagesForPreview('gallery')}
                      disabled={uploadingImage || previewImageUris.length >= 5}
                      accessibilityLabel="Select image(s) from your photo album for preview">
                      <Icon
                        name="images-outline"
                        size={20}
                        color="#FFFFFF" // Consider making icon color conditional too
                        style={styles.uploadButtonIcon}
                      />
                      <Text style={styles.uploadButtonText}>
                        Select Image(s)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.selectImageButton,
                        (uploadingImage || previewImageUris.length >= 5) &&
                          styles.selectImageButtonDisabled,
                        {
                          /* marginTop:10 */
                        },
                      ]}
                      onPress={() => handlePickImagesForPreview('camera')}
                      disabled={uploadingImage || previewImageUris.length >= 5}
                      accessibilityLabel="Take a new photo with camera for preview">
                      <Icon
                        name="camera-outline"
                        size={20}
                        color="#FFFFFF" // Consider making icon color conditional too
                        style={styles.uploadButtonIcon}
                      />
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>

                    {previewImageUris.length > 0 && (
                      <TouchableOpacity
                        style={styles.uploadNowButton}
                        onPress={confirmUploadImages}
                        disabled={uploadingImage}
                        accessibilityLabel="Confirm and upload selected image(s)">
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
                              Upload Now
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={handleCloseImageUploadSheet}
                      disabled={uploadingImage}
                      accessibilityLabel="Cancel image selection and upload">
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </BottomSheetScrollView>
                </BottomSheet>

                <Modal
                  visible={isCameraVisible}
                  onRequestClose={() => setIsCameraVisible(false)} // Allows closing with hardware back button
                  animationType="slide" // Or 'fade', 'none'
                  presentationStyle="fullScreen">
                  <CameraComponent
                    onPhotoTaken={handlePhotoTakenFromCamera} // Pass the callback to get the photo URI
                    onClose={() => setIsCameraVisible(false)} // Pass a callback to close the camera modal
                  />
                </Modal>
              </View>
            </SafeAreaView>
          </Modal>
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
  clearYearFilter: {
    marginLeft: 8,
    padding: 2,
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
  groupIndex: {
    paddingHorizontal: 10,
    color: '#495057',
    fontSize: 15,
  },
  groupHeaderText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 4,
  },
  groupHeaderYear: {
    fontWeight: '400',
    color: '#252525',
  },
  groupHeaderTrackingNumber: {
    fontWeight: 'bold',
    color: '#1a508c',
  },
  groupRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  itemCountBadge: {
    backgroundColor: '#1a508c',
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
    color: '#1a508c',
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
  itemIndex: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 4,
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

  modalMultipleImagesContainer: {
    height: 200, // Fixed height for the horizontal FlatList
    marginBottom: 25,
    width: '100%',
  },
  modalMultiImagePreview: {
    width: 200, // Each image width
    height: 200, // Each image height
    borderRadius: 15,
    marginHorizontal: 5, // Spacing between images
    backgroundColor: '#E9ECEF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  modalImagePreview: {
    // For single image display
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: '#DEE2E6',
    borderWidth: 1,
    borderColor: '#CED4DA',
    alignSelf: 'center', // Center the single image
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
    alignSelf: 'center', // Center the placeholder
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

  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalTitleContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  modalGroupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalGroupSubtitle: {
    fontSize: 16,
    color: '#E9ECEF',
    textAlign: 'center',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0', // Light grey background
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  noImagePlaceholderText: {
    fontSize: 12,
    color: '#888888', // Darker grey text
    marginTop: 5,
  },
  itemDetails: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
    justifyContent: 'center',
  },
  itemIndex: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 12,
    color: '#ADB5BD',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 5,
  },
  itemMeta: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 1,
  },
  itemMetaLabel: {
    fontWeight: 'bold',
    color: '#343A40',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  noItemsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 15,
  },
  noItemsSubText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: 'flex-start',
  },
  modalGroupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  modalGroupSubtitle: {
    fontSize: 16,
    color: '#DEE2E6',
  },
  bottomSheetHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 10,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 30, // Extra padding for buttons at the bottom
  },
  modalImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#E9ECEF',
    marginBottom: 20,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImagePlaceholderText: {
    color: '#6C757D',
    marginTop: 10,
  },
  bottomSheetHandle: {
    backgroundColor: '#CED4DA',
    width: 50,
  },
  yearOptionsFlatListContent: {
    paddingVertical: 10,
  },
  yearOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#E9ECEF',
  },
  selectedYearOptionButton: {
    backgroundColor: '#1a508c',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
  selectedYearOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalMultipleImagesContainer: {
    height: 150,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMultiImagePreview: {
    width: 120,
    height: 120,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  previewCountText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  selectImageButtonDisabled: {
    backgroundColor: '#cccccc', // Gray out the button when disabled
    // You might also want to change opacity or add other visual cues
    opacity: 0.7,
  },
  uploadNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  uploadButtonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  /*   imagePreviewWrapper: {
    position: 'relative', // To position the remove button
    margin: 5,
  }, */
  /*  modalMultiImagePreview: {
    width: 120, // Or whatever size you need
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  }, */
  removeImageButton: {
    position: 'absolute',
    top: -0, // Adjust position as needed
    right: -0, // Adjust position as needed
    backgroundColor: 'red', // To give it a background
    borderRadius: 15, // Makes it round
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 1, // Ensure it's above the image
  },
  itemDetailsContainer: {
    paddingVertical: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5, // Spacing between rows
    alignItems: 'flex-start', // Align text at the top
  },
  detailLabel: {
    marginRight: 5,
    color: '#333', // Slightly darker for labels
    minWidth: 120, // Ensure labels have a consistent width for alignment
  },
  detailValue: {
    flex: 1, // Allow value to take up remaining space
    fontWeight: 'bold',
    color: '#555',
  },
  showMoreLessText: {
    color: '#007bff', // A noticeable color for the link
    marginTop: 5,
    marginBottom: 15, // Add some space below the button
    textAlign: 'center',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
});

export default InventoryScreen;
