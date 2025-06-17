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
  Pressable,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  useInventory,
  useInventoryImages,
  useUploadInventory,
  useRemoveImageInv,
} from '../hooks/useInventory';
import {FlashList} from '@shopify/flash-list';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import CameraComponent from '../utils/CameraComponent';
import useUserInfo from '../api/useUserInfo';
import {showMessage} from 'react-native-flash-message';
import {useQueryClient} from '@tanstack/react-query';

const InventoryScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {data, isLoading, error} = useInventory();
  const {
    mutate: uploadImages,
    isLoading: isUploading,
    error: uploadError,
  } = useUploadInventory();
  const {
    mutate: removeImageInv,
    isLoading: isRemovingImage,
    error: removeError,
  } = useRemoveImageInv();
  const {officeCode} = useUserInfo();
  const queryClient = useQueryClient();

  const originalInventoryData = useRef([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [modalGroupItems, setModalGroupItems] = useState([]);
  const [modalGroupHeader, setModalGroupHeader] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const imageUploadBottomSheetRef = useRef(null);
  const yearFilterBottomSheetRef = useRef(null);

  const imageUploadSnapPoints = useMemo(() => ['25%', '50%', '100%'], []);
  const yearFilterSnapPoints = useMemo(() => ['25%', '50%', '75%'], []);

  const getBaseImageUrl = useCallback(item => {
    return `https://davaocityportal.com/tempUpload/${item?.Id || 'UnknownId'}~${
      item?.Office || 'UnknownOffice'
    }~${item?.TrackingNumber || 'UnknownTracking'}~`;
  }, []);

  /* const handlePresentImageUploadSheet = useCallback(
    item => {
      let primaryImageUrl = item.imageUrl;
      let existingMultipleImageUrls = [];

      const getFileExtension = url => {
        const parts = url.split('.');
        return parts.length > 1 ? `.${parts.pop()}` : '';
      };

      const primaryExtension = primaryImageUrl
        ? getFileExtension(primaryImageUrl)
        : '.jpg';

      if (item.UploadFiles) {
        const parts = item.UploadFiles.split('-');
        const imageNumbers = parts.filter(
          part => !isNaN(parseInt(part, 10)) && part.trim() !== '',
        );

        if (imageNumbers.length > 0) {
          existingMultipleImageUrls = imageNumbers.map(num => {
            const extensionToUse = primaryExtension || '.jpg';
            return `${getBaseImageUrl(item)}${parseInt(
              num,
              10,
            )}${extensionToUse}`;
          });

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

      setPreviewImage([]);
      imageUploadBottomSheetRef.current?.expand();
    },
    [getBaseImageUrl],
  ); */

  const handlePresentImageUploadSheet = (item, imageUrls = []) => {
    setSelectedImage(imageUrls);

    setSelectedItem({
      ...item,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : null, // First image only
      multipleImageUrls: imageUrls.length > 1 ? imageUrls : [], // Only if multiple
    });

    imageUploadBottomSheetRef.current?.expand(); // Show bottom sheet
  };

  const handleCloseImageUploadSheet = useCallback(() => {
    imageUploadBottomSheetRef.current?.close();
    setSelectedItem(null);
    setPreviewImage([]);
  }, []);

  const handlePresentYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.expand();
  }, []);

  const handleCloseYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.close();
  }, []);

  const handleImagePress = imageUrl => {
    console.log('image pressed', imageUrl);
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

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
    setPreviewImage(currentUris =>
      currentUris.filter((_, index) => index !== indexToRemove),
    );
  }, []);

  const handlePickImagesForPreview = useCallback(
    async source => {
      if (selectedItem) {
        if (previewImage.length >= 5) {
          Alert.alert(
            'Maximum Images Reached',
            'You can only select up to 5 images for preview.',
          );
          return;
        }

        try {
          const remainingSlots = 5 - previewImage.length;

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
            // User cancelled the image selection
          } else if (response.errorMessage) {
            Alert.alert(
              'Error',
              `Image Picker Error: ${response.errorMessage}`,
            );
            console.error('Image Picker Error:', response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const newImageDetails = response.assets.map(asset => ({
              uri: asset.uri,
              name: asset.fileName || asset.uri.split('/').pop(), // Use fileName if available, otherwise extract from URI
              type: asset.type || 'image/jpeg', // Use type if available, otherwise default
            }));

            const combinedImageDetails = [...previewImage, ...newImageDetails];
            setPreviewImage(combinedImageDetails.slice(0, 5));
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
    [selectedItem, previewImage], // Dependencies remain the same
  );

  const handlePhotoTakenFromCamera = useCallback(photoUri => {
    if (photoUri) {
      setPreviewImage(prevUris => [...prevUris, photoUri]);
    }
    setIsCameraVisible(false);
  }, []);

  /* const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      queryClient.invalidateQueries({
        queryKey: ['getInventory', officeCode],
      });
      console.log('Simulating data refetch...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []); */

  const onRefresh = useCallback(async () => {
  setIsRefreshing(true); // Indicate that a refresh is in progress
  try {
    // Invalidate the 'getInventory' query for the specific officeCode.
    // This tells React Query to mark this data as stale and refetch it
    // the next time it's accessed or if it's currently active.
    await queryClient.invalidateQueries({
      queryKey: ['getInventory', officeCode],
    });

    console.log('Data refetch initiated by React Query.');

    // No need for a manual setTimeout to "simulate network request"
    // if React Query is handling the actual data fetching.
    // The `await queryClient.invalidateQueries` doesn't wait for the
    // *actual* refetch to complete; it just triggers it.
    // If you need to wait for the refetch, you might need to use
    // queryClient.refetchQueries or check a loading state from useQuery.
    // For a simple pull-to-refresh, invalidating is often sufficient.

  } catch (error) {
    console.error('Error during refresh:', error);
    // Optionally, you might want to show a user-facing error message here
    // e.g., Toast.show({ type: 'error', text1: 'Refresh failed', text2: error.message });
  } finally {
    // Ensure setIsRefreshing is set to false regardless of success or failure
    // This will stop any loading indicators (e.g., pull-to-refresh spinner).
    setIsRefreshing(false);
  }
}, [queryClient, officeCode]); // Add queryClient and officeCode to dependencies

  /*  const confirmUploadImages = useCallback(async () => {
    if (!selectedItem || previewImage.length === 0) {
      Alert.alert('No Images', 'Please select images for preview first.');
      return;
    }

    setUploadProgress(0);
    uploadImages(
      {
        id: selectedItem.Id,
        office: selectedItem.Office,
        tn: selectedItem.TrackingNumber,
        imagePath: previewImage,
      },
      {
        onSuccess: data => {
          if (data && data.status === 'success') {
            showMessage({
              message: data.message || 'Upload successful!',
              type: 'success',
              icon: 'success',
              floating: true,
              duration: 3000,
            });

            const finalImageUrl = data.imageUrls ? data.imageUrls[0] : null;

            const updatedOriginalItems = originalInventoryData.current.map(
              item =>
                item.Id === selectedItem.Id
                  ? {
                      ...item,
                      imageUrl: finalImageUrl,
                      multipleImageUrls: data.imageUrls,
                    }
                  : item,
            );
            originalInventoryData.current = updatedOriginalItems;

            setSelectedItem
            (prev => ({
              ...prev,
              imageUrl: finalImageUrl,
              multipleImageUrls: data.imageUrls,
            }));
            handleCloseImageUploadSheet();
          } else {
            console.warn('Upload success but server returned non-success status:', data);
            Alert.alert(
              'Upload Failed',
              data.message || 'Server did not indicate a successful upload.',
            );
          }
        },
        onError: err => {
          console.error('Mutation specific error handler in component:', err);
          showMessage({
            message: 'Upload failed!',
            description: err.message || 'Something went wrong during upload.',
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 3000,
          });

        },
        onSettled: () => {
          setUploadProgress(0);
        },
      },
    );
  }, [
    selectedItem,
    previewImage,
    uploadImages,
    handleCloseImageUploadSheet,
    originalInventoryData,
    setSelectedItem,
    // If you are using showMessage, ensure it's stable (e.g., from a context or defined once)
    // or add it to dependencies if it's a memoized function.
    // showMessage,
  ]); */

  const confirmUploadImages = useCallback(async () => {
    if (!selectedItem || previewImage.length === 0) {
      Alert.alert('No Images', 'Please select images for preview first.');
      return;
    }
    setUploadingImage(true);
    setUploadProgress(0);
    uploadImages(
      {
        id: selectedItem.Id,
        office: selectedItem.Office,
        tn: selectedItem.TrackingNumber,
        imagePath: previewImage,
      },
      {
        onSuccess: data => {
          if (data && data.status === 'success') {
            showMessage({
              message: data.message || 'Upload successful!',
              type: 'success',
              icon: 'success',
              floating: true,
              duration: 3000,
            });

            setPreviewImage([]);
            /*  handleCloseImageUploadSheet(); */
          } else {
            console.warn(
              'Upload completed but server returned non-success status:',
              data,
            );
            Alert.alert(
              'Upload Failed',
              data.message || 'Server did not indicate a successful upload.',
            );
          }
        },
        onError: err => {
          console.error('Mutation specific error handler in component:', err);
          showMessage({
            message: 'Upload failed!',
            description: err.message || 'Something went wrong during upload.',
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 3000,
          });
        },
        onSettled: () => {
          setUploadProgress(0);
          setUploadingImage(false);
        },
      },
    );
  }, [
    selectedItem,
    previewImage,
    uploadImages,
    handleCloseImageUploadSheet,
    originalInventoryData,
    setSelectedItem,
    setPreviewImage,
  ]);

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

  /*   const handleDeleteImageFromItem = imageUrlToDelete => {

    if (selectedItem && selectedItem.multipleImageUrls) {
      const updatedMultipleImageUrls = selectedItem.multipleImageUrls.filter(
        url => url !== imageUrlToDelete,
      );
      // Update the selectedItem state with the new array of image URLs
      setSelectedItem({
        ...selectedItem,
        multipleImageUrls: updatedMultipleImageUrls,
      });
      removeImageInv(imageUrlToDelete);
      // You might also want to trigger an API call here to delete the image from your backend
      // For example: deleteImageApiCall(selectedItem.id, imageUrlToDelete);
    }
  }; */

  const handleDeleteImageFromItem = imageUrlToDelete => {
    if (selectedItem && selectedItem.multipleImageUrls) {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this image?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => {
              const updatedMultipleImageUrls =
                selectedItem.multipleImageUrls.filter(
                  url => url !== imageUrlToDelete,
                );

              let newMainImageUrl = selectedItem.imageUrl;

              if (
                newMainImageUrl === imageUrlToDelete &&
                updatedMultipleImageUrls.length > 0
              ) {
                newMainImageUrl = updatedMultipleImageUrls[0];
              } else if (updatedMultipleImageUrls.length === 0) {
                newMainImageUrl = null;
              }

              setSelectedItem(prevItem => ({
                ...prevItem,
                multipleImageUrls: updatedMultipleImageUrls,
                imageUrl: newMainImageUrl,
              }));
              removeImageInv(imageUrlToDelete);
            },
            style: 'destructive',
          },
        ],
      );
    }
  };

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
    // console.log(fetchedImageUrls); // Keep this for debugging if needed

    // Determine the image source safely
    const imageSource =
      fetchedImageUrls && fetchedImageUrls.length > 0
        ? {uri: fetchedImageUrls[0]} // Use the first image URL if available
        : null; // Fallback to null if no URLs are fetched

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          handlePresentImageUploadSheet(inventoryItem, fetchedImageUrls)
        }
        accessibilityLabel={`View details for ${
          inventoryItem.Item || 'No Item Name'
        }`}>
        <View style={styles.itemImageContainer}>
          {isLoading ? (
            <View style={styles.loadingImagePlaceholder}>
              <Text style={styles.loadingImagePlaceholderText}>Loading...</Text>
            </View>
          ) : imageSource ? ( // Check if imageSource is valid (not null)
            <Image
              source={imageSource} // Use the safely determined imageSource
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
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  // You can customize colors here if needed
                  // tintColor="#F8F8F8"
                  // title="Loading..."
                  // titleColor="#000000"
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
            animationType="fade"
            presentationStyle="fullScreen"
            statusBarTranslucent={true}
            transparent={false}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalContainer}>
                <ImageBackground
                  source={require('../../assets/images/CirclesBG.png')}
                  style={[styles.bgHeader, {paddingTop: 30}]}
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
                    <View style={styles.model}>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: 24,
                        }}>
                        {modalGroupHeader?.year} |{' '}
                        {modalGroupHeader?.trackingNumber || 'Grouped Items'}
                      </Text>
                      <View>
                        <Text
                          style={{
                            fontSize: 14,
                            color: 'white',
                            fontWeight: '400',
                          }}>
                          ({modalGroupHeader?.itemCount || 0} items)
                        </Text>
                      </View>
                    </View>
                    <View style={{width: 60}} />
                    {/* <View><Text>{modalGroupHeader?.year} | {modalGroupHeader?.trackingNumber || 'Grouped Items'}</Text></View>
                    <Text> ({modalGroupHeader?.itemCount || 0} items)</Text> */}
                    {/* <View style={styles.modalTitleContainer}>
                        <Text style={styles.modalGroupTitle}>
                          <Text style={{fontWeight: 'normal'}}>
                            {modalGroupHeader?.year || ''}
                          </Text>{' '}
                          |{' '}
                          {modalGroupHeader?.trackingNumber || 'Grouped Items'}
                        </Text>
                        <Text style={styles.modalGroupSubtitle}>
                          ({modalGroupHeader?.itemCount || 0} items)
                        </Text>
                      </View> */}
                    {/*   <View style={{width: 60}} /> */}
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
                  topInset={100}
                  handleIndicatorStyle={styles.bottomSheetHandle}>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={[styles.modalTitle, {marginStart: 20}]}>
                      Upload Image {/* for */}
                    </Text>
                    <View style={{alignItems: 'center', flexDirection: 'row'}}>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 20,
                          elevation: 5,
                          backgroundColor: 'light-gray',
                          marginEnd: 10,
                        }}
                        onPress={handleCloseImageUploadSheet}>
                        <Icon name="close-outline" size={24} />
                        {/* <Text>Cancel</Text> */}
                      </TouchableOpacity>
                    </View>
                  </View>
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
                    {/* https://davaocityportal.com/tempUpload/53198~TRAC~TRAC-10~1.jpg */}
                    {/* {previewImage.length > 0 ? (
                      <View style={styles.modalMultipleImagesContainer}>
                        <FlatList
                          data={previewImage}
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
                            {previewImage.length} image(s)...
                          </Text>
                        ) : (
                          <Text style={styles.previewCountText}>
                            {previewImage.length} image(s) selected for
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
                                  <Pressable
                                    onPress={() => handleImagePress(imageUrl)}>
                                    <Image
                                      source={{uri: imageUrl}}
                                      style={styles.modalMultiImagePreview}
                                      resizeMode="contain"
                                    />
                                  </Pressable>
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
                    )} */}

                    {previewImage.length > 0 ? (
        <View style={styles.modalMultipleImagesContainer}>
          <FlatList
            data={previewImage}
            horizontal
            showsHorizontalScrollIndicator={true}
            keyExtractor={(item, index) => item.uri + '_' + index}
            renderItem={({item, index}) => (
              <View style={styles.imagePreviewWrapper}>
                <Image
                  source={{uri: item.uri}}
                  style={styles.modalMultiImagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemovePreviewImage(index)}
                  accessibilityLabel={`Remove image ${index + 1}`}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>
                    X
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {uploadingImage ? (
            <Text style={styles.uploadingProgressText}>
              Uploading {uploadProgress} of {previewImage.length}{' '}
              image(s)...
            </Text>
          ) : (
            <Text style={styles.previewCountText}>
              {previewImage.length} image(s) selected for upload
            </Text>
          )}
        </View>
      ) : (
        (() => {
          const multipleImageUrls = selectedItem?.multipleImageUrls;
          if (multipleImageUrls && multipleImageUrls.length > 0) {
            return (
              <View style={styles.modalMultipleImagesContainer}>
                <FlatList
                  data={multipleImageUrls}
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({item: imageUrl, index}) => (
                    <View style={styles.imagePreviewWrapper}>
                      <Pressable
                        onPress={() => handleImagePress(imageUrl)}
                        style={{
                          // Note: You had backgroundColor and marginHorizontal here.
                          // It might be better to move these into styles.modalMultiImagePreview
                          // if they are truly part of the image's visual style,
                          // or keep them on Pressable if they are specific to its touch area.
                          // For now, keeping as is, but consider your design.
                        }}>
                        <Image
                          source={{uri: imageUrl}}
                          style={styles.modalMultiImagePreview}
                          resizeMode="contain"
                        />
                      </Pressable>
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleDeleteImageFromItem(imageUrl)}
                        accessibilityLabel={`Remove image ${index + 1}`}>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>
                          X
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            );
          } else if (selectedItem?.imageUrl) {
            const singleImageUrl = selectedItem?.imageUrl;
            return (
              <View style={styles.imagePreviewWrapper}>
                <Pressable onPress={() => handleImagePress(singleImageUrl)}>
                  <Image
                    source={{
                      uri: singleImageUrl,
                    }}
                    style={styles.modalImagePreview}
                    resizeMode="contain"
                  />
                </Pressable>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleDeleteImageFromItem(singleImageUrl)}
                  accessibilityLabel={`Remove image`}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>
                    X
                  </Text>
                </TouchableOpacity>
              </View>
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
                        (uploadingImage || previewImage.length >= 5) &&
                          styles.selectImageButtonDisabled, // Apply disabled style
                      ]}
                      onPress={() => handlePickImagesForPreview('gallery')}
                      disabled={uploadingImage || previewImage.length >= 5}
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
                        (uploadingImage || previewImage.length >= 5) &&
                          styles.selectImageButtonDisabled,
                        {
                          /* marginTop:10 */
                        },
                      ]}
                      onPress={() => handlePickImagesForPreview('camera')}
                      disabled={uploadingImage || previewImage.length >= 5}
                      accessibilityLabel="Take a new photo with camera for preview">
                      <Icon
                        name="camera-outline"
                        size={20}
                        color="#FFFFFF" // Consider making icon color conditional too
                        style={styles.uploadButtonIcon}
                      />
                      <Text style={styles.uploadButtonText}>Take Photo</Text>
                    </TouchableOpacity>

                    {previewImage.length > 0 && (
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
                <Modal
                  animationType="fade" // or "slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    setModalVisible(!modalVisible);
                  }}>
                  <Pressable
                    style={styles.fullScreenModalContainer}
                    onPress={() => setModalVisible(false)}>
                    <Image
                      source={{uri: selectedImage}}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  </Pressable>
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
    // backgroundColor: '#F0F2F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 130,
    backgroundColor: '#1a508c',
    //alignItems: 'center',
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
    //marginTop: 10,
    // marginBottom: 20,
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
  modalMultiImagePreview: {
    width: 150, // Example width
    height: 150, // Example height
    marginHorizontal: 5,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default InventoryScreen;
