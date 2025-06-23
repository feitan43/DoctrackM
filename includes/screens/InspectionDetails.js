import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  Modal,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useInspectionDetails, useInspectorImages} from '../hooks/useInspection'; // Assuming these hooks exist
import {removeHtmlTags} from '../utils'; // Assuming this utility exists
import {ActivityIndicator} from 'react-native-paper'; // Assuming react-native-paper is installed
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CameraComponent from '../utils/CameraComponent';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImagePreviewModal from '../components/ImagePreviewModal';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const REMARKS_OPTIONS = [
  'Incomplete Delivery',
  'Incorrect Quantity',
  'Wrong Items Delivered',
  'Others',
];

// --- Start of refactored components ---

const PaymentDetailsCard = ({data}) => {
  if (!data) return null;

  const [showFullRemarks, setShowFullRemarks] = useState(false);
  const [hasMoreRemarks, setHasMoreRemarks] = useState(false);

  const handleRemarksTextLayout = useCallback(e => {
    if (e.nativeEvent.lines.length > 2) {
      setHasMoreRemarks(true);
    }
  }, []);

  const cleanedRemarks = data.Remarks ? removeHtmlTags(data.Remarks) : '';

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>Payment Details</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, {width: '30%'}]}>TN </Text>
        <Text style={styles.detailValue}>{data.TrackingNumber}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, {width: '30%'}]}>Year </Text>
        <Text style={styles.detailValue}>{data.Year}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, {width: '30%'}]}>Status </Text>
        <Text style={styles.detailValue}>{data.Status}</Text>
      </View>
      {cleanedRemarks ? (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {width: '30%'}]}>Remarks </Text>
          <View style={{flexShrink: 1}}>
            <Text
              style={styles.detailValue}
              numberOfLines={showFullRemarks ? undefined : 2}
              onTextLayout={handleRemarksTextLayout}>
              {cleanedRemarks}
            </Text>
            {hasMoreRemarks && (
              <Pressable
                onPress={() => setShowFullRemarks(!showFullRemarks)}
                accessibilityRole="button"
                accessibilityLabel={
                  showFullRemarks ? 'Show less remarks' : 'Show more remarks'
                }>
                <Text style={styles.showMoreLessButton}>
                  {showFullRemarks ? 'Show Less' : 'Show More'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const POItem = ({itemData, index, isSelected, onToggleSelection}) => {
  if (!itemData) return null;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hasMoreLines, setHasMoreLines] = useState(false);

  const handleTextLayout = useCallback(e => {
    if (e.nativeEvent.lines.length > 2) {
      setHasMoreLines(true);
    }
  }, []);

  return (
    <View
      style={[
        styles.poItemCard,
        {
          borderColor: isSelected ? '#1a508c' : '#eee',
        },
      ]}>
      <Pressable
        onPress={() => onToggleSelection(index)}
        style={styles.poItemHeader}
        accessibilityRole="button"
        accessibilityLabel={
          isSelected
            ? `Deselect item ${itemData.Description}`
            : `Select item ${itemData.Description}`
        }>
        <Icon
          name={isSelected ? 'checkbox-outline' : 'square-outline'}
          size={28}
          color={isSelected ? '#1a508c' : '#555'}
          accessibilityLabel={
            isSelected ? 'Item selected' : 'Item not selected'
          }
        />

        <View style={styles.headerContentRow}>
          <View style={styles.labelValueColumn}>
            <Text style={styles.detailLabel}>Qty/Unit:</Text>
            <Text style={styles.detailValue}>
              {itemData.Qty} / {itemData.Unit}
            </Text>
          </View>

          <View style={styles.amountRightAlign}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              ₱{' '}
              {parseFloat(itemData.Amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Description:</Text>
      </View>
      <View style={{flexShrink: 1}}>
        <Text
          style={styles.detailValue}
          numberOfLines={showFullDescription ? undefined : 2}
          onTextLayout={handleTextLayout}>
          {itemData.Description}
        </Text>
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
      </View>
      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#f0f0f0',
          marginTop: 10,
        }}>
        <View style={[styles.labelValueColumn, styles.totalRightAlign]}>
          <Text style={styles.detailLabel}>Total </Text>
          <Text style={styles.detailValue}>
            ₱{' '}
            {parseFloat(itemData.Total).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const PurchaseOrderCard = ({
  poTracking,
  poRecords,
  selectedPoItemIndexes,
  togglePoItemSelection,
  allPoItemsSelected,
  toggleSelectAllPoItems,
}) => {
  if (!poRecords || poRecords.length === 0) return null;

  const overallTotal = poRecords.reduce(
    (sum, item) => sum + parseFloat(item.Total || 0),
    0,
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>Purchase Order</Text>
        {poRecords.length > 0 && (
          <Pressable
            style={styles.selectAllButton}
            android_ripple={{color: '#F6F6F6', borderless: true, radius: 20}}
            onPress={toggleSelectAllPoItems}
            accessibilityRole="button"
            accessibilityLabel={
              allPoItemsSelected
                ? 'Deselect all purchase order items'
                : 'Select all purchase order items'
            }>
            <Icon
              name={allPoItemsSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={allPoItemsSelected ? '#1a508c' : '#555'}
              accessibilityLabel={
                allPoItemsSelected ? 'All items selected' : 'No items selected'
              }
            />
            <Text style={styles.selectAllButtonText}>
              {allPoItemsSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>
        )}
      </View>
      <View style={{marginBottom: 10}}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {width: '30%'}]}>Supplier </Text>
          <Text style={styles.detailValue}>{poTracking.Claimant}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {width: '30%'}]}>Year </Text>
          <Text style={styles.detailValue}>{poTracking.Year}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {width: '30%'}]}>TN </Text>
          <Text style={styles.detailValue}>{poTracking.TrackingNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {width: '30%'}]}>PO Number </Text>
          <Text style={styles.detailValue}>{poTracking.PO_Number}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {width: '30%'}]}>Status </Text>
          <Text style={styles.detailValue}>{poTracking.Status}</Text>
        </View>
      </View>
      {poRecords.map((item, index) => (
        <View key={index} style={styles.poItemSeparator}>
          <POItem
            itemData={item}
            index={index}
            isSelected={selectedPoItemIndexes.has(index)}
            onToggleSelection={togglePoItemSelection}
          />
        </View>
      ))}

      <View style={[styles.detailRow, styles.overallTotalRow]}>
        <Text style={styles.detailLabel}>Overall PO Total:</Text>
        <Text style={styles.overallTotalValue}>
          ₱{' '}
          {overallTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </View>
  );
};

const DeliveryDetailsCard = ({data}) => {
  if (!data) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>Delivery Details</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcon
          name="calendar"
          size={20}
          color="#607D8B"
          style={styles.iconStyle}
          accessibilityLabel="Delivery Date"
        />
        <Text style={styles.detailValue}>{data.DeliveryDate ?? '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcon
          name="calendar"
          size={20}
          color="#607D8B"
          style={styles.iconStyle}
          accessibilityLabel="Delivery Date"
        />
        <Text style={styles.detailValue}>
          {data.DeliveryDatesHistory ?? '-'}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcon
          name="map-marker"
          size={20}
          color="#607D8B"
          style={styles.iconStyle}
          accessibilityLabel="Address"
        />
        <Text style={styles.detailValue}>{data.Address ?? '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcon
          name="phone"
          size={20}
          color="#607D8B"
          style={styles.iconStyle}
          accessibilityLabel="Contact Number"
        />
        <Text style={styles.detailValue}>{data.ContactNumber ?? '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcon
          name="account"
          size={20}
          color="#607D8B"
          style={styles.iconStyle}
          accessibilityLabel="Contact Person"
        />
        <Text style={styles.detailValue}>{data.ContactPerson ?? '-'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={styles.detailValue}>{data.Status}</Text>
      </View>
    </View>
  );
};

const InspectionActivityCard = ({data, isLoading, isFetching}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = useCallback(index => {
    setCurrentIndex(index);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const renderFullscreenImage = useCallback(
    ({item}) => (
      <Image
        source={{uri: item}}
        style={modalStyles.fullscreenImageStyle}
        resizeMode="contain"
      />
    ),
    [],
  );

  const handleViewableItemsChanged = useCallback(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems.sort((a, b) => a.index - b.index)[0].index);
    }
  }, []);

  if (isLoading || isFetching) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inspection Activity</Text>
        <ActivityIndicator
          size="small"
          color="#1a508c"
          style={{marginTop: 10}}
        />
        <Text style={styles.detailText}>Loading inspection images...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Inspection Activity</Text>
        </View>
        <Text style={styles.detailText}>
          No inspection activity images available.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>Inspection Activity</Text>
      </View>
      <View style={styles.imageContainer}>
        {data.map((uri, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openModal(index)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`View image ${index + 1}`}>
            <Image source={{uri}} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}>
        <View style={modalStyles.modalContainer}>
          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={closeModal}
            accessibilityRole="button"
            accessibilityLabel="Close image viewer">
            <Text style={modalStyles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <FlatList
            data={data}
            renderItem={renderFullscreenImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

// --- End of refactored components ---

const InspectionDetails = ({route, navigation}) => {
  const {item} = route.params;
  const {
    data: inspectionDetails,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    error: detailsError,
    refetch,
  } = useInspectionDetails(
    item.Id,
    item.Year,
    item.TrackingNumber,
    item.TrackingPartner,
  );

  const {
    data: imageData,
    isLoading: isImageLoading,
    isFetching: isImageFetching,
  } = useInspectorImages(item.Year, item.TrackingNumber);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPoItemIndexes, setSelectedPoItemIndexes] = useState(new Set());
  const [showOnHoldRemarksInput, setShowOnHoldRemarksInput] = useState(false);
  const [selectedRemarkOption, setSelectedRemarkOption] = useState('');
  const [customRemark, setCustomRemark] = useState('');
  const [allPoItemsSelected, setAllPoItemsSelected] = useState(false);
  const [showAllFabs, setShowAllFabs] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]); // Stores { uri: string, name: string, type: string }
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    const poRecords = inspectionDetails?.poRecord;

    if (poRecords && poRecords.length > 0) {
      const areAllCurrentlySelected = Array.from(
        {length: poRecords.length},
        (_, i) => i,
      ).every(index => selectedPoItemIndexes.has(index));
      setAllPoItemsSelected(areAllCurrentlySelected);
    } else {
      setAllPoItemsSelected(false);
    }
  }, [selectedPoItemIndexes, inspectionDetails?.poRecord]);

  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos.',
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
    return true; // iOS permissions are handled automatically when accessing camera
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const togglePoItemSelection = useCallback(poItemIndex => {
    setSelectedPoItemIndexes(prevSelectedIndexes => {
      const newSet = new Set(prevSelectedIndexes);
      if (newSet.has(poItemIndex)) {
        newSet.delete(poItemIndex);
      } else {
        newSet.add(poItemIndex);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAllPoItems = useCallback(() => {
    const poRecords = inspectionDetails?.poRecord;
    if (!poRecords || poRecords.length === 0) {
      return;
    }

    if (allPoItemsSelected) {
      setSelectedPoItemIndexes(new Set());
    } else {
      const allIndexes = new Set(
        Array.from({length: poRecords.length}, (_, i) => i),
      );
      setSelectedPoItemIndexes(allIndexes);
    }
  }, [allPoItemsSelected, inspectionDetails?.poRecord]);

  const handleInspected = useCallback(() => {
    const itemsToMarkInspected = Array.from(selectedPoItemIndexes);
    if (itemsToMarkInspected.length === 0) {
      Alert.alert(
        'No Items Selected',
        'Please select items to mark as inspected.',
      );
      return;
    }
    Alert.alert(
      'Mark as Inspected',
      `Are you sure you want to mark ${itemsToMarkInspected.length} item(s) as "Inspected"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              Alert.alert('Success', 'Selected items marked as Inspected.');
              setSelectedPoItemIndexes(new Set());
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark items as Inspected.');
              console.error('Error marking as inspected:', error);
            }
          },
        },
      ],
    );
  }, [selectedPoItemIndexes, refetch]);

  const handlePickImagesForPreview = useCallback(
    async source => {
      if (previewImages.length >= 5) {
        Alert.alert(
          'Maximum Images Reached',
          'You can only select up to 5 images for preview.',
        );
        return;
      }

      try {
        const remainingSlots = 5 - previewImages.length;

        const options = {
          mediaType: 'photo',
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.7,
          includeBase64: false,
          selectionLimit: remainingSlots, // Limit based on remaining slots
        };

        let response;
        if (source === 'camera') {
          const hasPermission = await requestCameraPermission();
          if (!hasPermission) {
            Alert.alert(
              'Permission Denied',
              'Camera permission is required to take photos.',
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
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          Alert.alert('Error', `Image Picker Error: ${response.errorMessage}`);
          console.error('Image Picker Error:', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const newImageDetails = response.assets.map(asset => {
            // *** ADD CONSOLE.LOG HERE FOR EACH PHOTO URI ***
            console.log(
              'Photo URI (from Image Picker/Camera Component):',
              asset.uri,
            );

            return {
              uri: asset.uri,
              name: asset.fileName || asset.uri.split('/').pop(), // Use fileName if available, otherwise extract from URI
              type: asset.type || 'image/jpeg', // Use type if available, otherwise default
            };
          });

          // Combine existing and new images, ensuring not to exceed 5
          const combinedImageDetails = [...previewImages, ...newImageDetails];
          setPreviewImages(combinedImageDetails.slice(0, 5)); // Take only the first 5
          setIsPreviewModalVisible(true); // <--- ADDED LINE: Show the preview modal
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
    },
    [selectedItem, previewImages, requestCameraPermission], // Dependencies for useCallback
  );

  const handleInspectionOnHoldPress = useCallback(() => {
    const itemsToHold = Array.from(selectedPoItemIndexes);
    if (itemsToHold.length === 0) {
      Alert.alert('No Items Selected', 'Please select items to put on hold.');
      return;
    }
    setSelectedRemarkOption('');
    setCustomRemark('');
    setShowOnHoldRemarksInput(true);
  }, [selectedPoItemIndexes]);

  const handleUploadImages = useCallback(async () => {
    if (previewImages.length === 0) {
      Alert.alert('No Images', 'Please select images to upload first.');
      return;
    }

    setIsUploadingImages(true);
    // --- START: Your actual image upload logic here ---
    console.log('Attempting to upload these images:', previewImages);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request

    try {
      // In a real app, you would send `previewImages` to your backend.
      // This might involve FormData, fetch, axios, etc.
      // Example (conceptual, replace with your actual API call):
      /*
      const formData = new FormData();
      previewImages.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        });
      });
      const response = await fetch('YOUR_UPLOAD_API_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
        },
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const result = await response.json();
      console.log('Upload success:', result);
      */
      Alert.alert('Success', 'Images uploaded successfully!');
      setPreviewImages([]); // Clear preview images after successful upload
      setIsPreviewModalVisible(false); // Close the modal
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Upload Failed', 'There was an error uploading images.');
    } finally {
      setIsUploadingImages(false);
      // You might want to refetch inspection images here if they are immediately visible
      // refetch();
    }
    // --- END: Your actual image upload logic here ---
  }, [previewImages]);

  const handleRemovePreviewImage = useCallback(indexToRemove => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image from preview?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          onPress: () => {
            setPreviewImages(prevImages =>
              prevImages.filter((_, index) => index !== indexToRemove),
            );
          },
        },
      ],
    );
  }, []);

  const submitOnHoldRemarks = useCallback(async () => {
    const itemsToHold = Array.from(selectedPoItemIndexes);
    let finalRemark = selectedRemarkOption;

    if (selectedRemarkOption === 'Others') {
      if (!customRemark.trim()) {
        Alert.alert('Reason Required', 'Please enter a reason for "Others".');
        return;
      }
      finalRemark = customRemark.trim();
    } else if (!selectedRemarkOption) {
      Alert.alert(
        'Select a Reason',
        'Please select a reason or choose "Others".',
      );
      return;
    }

    Alert.alert(
      'Confirm On Hold',
      `Are you sure you want to put ${itemsToHold.length} item(s) on "Inspection On Hold" with reason: "${finalRemark}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setShowOnHoldRemarksInput(false);
            setSelectedRemarkOption('');
            setCustomRemark('');
          },
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              Alert.alert(
                'Success',
                'Selected items put on Inspection On Hold.',
              );
              setSelectedPoItemIndexes(new Set());
              setSelectedRemarkOption('');
              setCustomRemark('');
              setShowOnHoldRemarksInput(false);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to put items on hold.');
              console.error('Error putting on hold:', error);
            }
          },
        },
      ],
    );
  }, [selectedPoItemIndexes, selectedRemarkOption, customRemark, refetch]);

  const toggleMainFabs = useCallback(() => {
    setShowAllFabs(prev => !prev);
  }, []);

  const paymentData = inspectionDetails?.payment?.[0];
  const poTracking = inspectionDetails?.poTracking?.[0];
  const poRecords = inspectionDetails?.poRecord;
  const deliveryData = inspectionDetails?.delivery?.[0];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={{color: '#F6F6F6', borderless: true, radius: 24}}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Inspection Details</Text>
          <View style={{flex: 1, width: 40}} />
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {(isDetailsLoading && isDetailsFetching && !refreshing) ||
        (isImageLoading && isImageFetching && !refreshing) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a508c" />
            <Text style={styles.loadingText}>
              Loading inspection details and images...
            </Text>
          </View>
        ) : detailsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {detailsError.message}</Text>
          </View>
        ) : (
          <>
            <PaymentDetailsCard data={paymentData} />
            <PurchaseOrderCard
              poTracking={poTracking}
              poRecords={poRecords}
              selectedPoItemIndexes={selectedPoItemIndexes}
              togglePoItemSelection={togglePoItemSelection}
              allPoItemsSelected={allPoItemsSelected}
              toggleSelectAllPoItems={toggleSelectAllPoItems}
            />
            <DeliveryDetailsCard data={deliveryData} />
            <InspectionActivityCard
              data={imageData}
              isLoading={isImageLoading}
              isFetching={isImageFetching}
            />
          </>
        )}
      </ScrollView>

      {/* FAB Container for all sub-FABs */}
      <View style={styles.fabContainer}>
        {showAllFabs && (
          <>
            <Pressable
              style={[styles.fab, styles.fabCamera]}
              android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
              onPress={() => handlePickImagesForPreview('camera')}
              accessibilityRole="button"
              accessibilityLabel="Take a new photo">
              <Icon name="camera" size={28} color="#fff" />
              {/* <Text style={styles.fabText}>Took Photo</Text> */}
            </Pressable>
            <Pressable
              style={[styles.fab, styles.fabBrowse]}
              android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
              onPress={() => handlePickImagesForPreview('gallery')}
              accessibilityRole="button"
              accessibilityLabel="Browse existing photos">
              <Icon name="image" size={28} color="#fff" />
              {/* <Text style={styles.fabText}>Browse</Text> */}
            </Pressable>
            <Pressable
              style={[styles.fab, styles.fabInspected]}
              android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
              onPress={handleInspected}
              accessibilityRole="button"
              accessibilityLabel="Mark selected items as inspected">
              <Icon
                name="checkmark-done-circle-outline"
                size={28}
                color="#fff"
              />
              {/* <Text style={styles.fabText}>Inspected</Text> */}
            </Pressable>
            <Pressable
              style={[styles.fab, styles.fabOnHold]}
              android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
              onPress={handleInspectionOnHoldPress}
              accessibilityRole="button"
              accessibilityLabel="Put selected items on hold">
              <Icon name="pause-circle-outline" size={28} color="#fff" />
              {/* <Text style={styles.fabText}>On Hold</Text> */}
            </Pressable>
          </>
        )}
        {/* Main FAB to toggle all other FABs */}
        <Pressable
          style={[styles.fab, styles.fabMainToggle]}
          android_ripple={{color: '#F6F6F6', borderless: false, radius: 30}}
          onPress={toggleMainFabs}
          accessibilityRole="button"
          accessibilityLabel={
            showAllFabs ? 'Hide action buttons' : 'Show action buttons'
          }>
          <Icon name={showAllFabs ? 'close' : 'add'} size={30} color="#fff" />
        </Pressable>
      </View>

      {showOnHoldRemarksInput && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.remarksOverlay}>
          <Pressable
            style={styles.remarksOverlayBackground}
            onPress={() => setShowOnHoldRemarksInput(false)}
            accessibilityRole="button"
            accessibilityLabel="Close remarks input"
          />
          <View style={styles.remarksInputContainer}>
            <Text style={styles.remarksTitle}>Reason for On Hold</Text>

            <FlatList
              data={REMARKS_OPTIONS}
              keyExtractor={item => item}
              renderItem={({item: option}) => (
                <Pressable
                  style={({pressed}) => [
                    styles.remarkOption,
                    selectedRemarkOption === option &&
                      styles.remarkOptionSelected,
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() => {
                    setSelectedRemarkOption(option);
                    if (option !== 'Others') {
                      setCustomRemark('');
                    }
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={`Select reason: ${option}`}
                  accessibilityState={{
                    selected: selectedRemarkOption === option,
                  }}>
                  <Text
                    style={[
                      styles.remarkOptionText,
                      selectedRemarkOption === option &&
                        styles.remarkOptionTextSelected,
                    ]}>
                    {option}
                  </Text>
                  {selectedRemarkOption === option && (
                    <Icon
                      name="checkmark-circle"
                      size={20}
                      color="#1a508c"
                      style={styles.remarkOptionCheck}
                    />
                  )}
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.remarksOptionsList}
            />

            {selectedRemarkOption === 'Others' && (
              <TextInput
                style={styles.remarksTextInput}
                placeholder="Enter specific reason..."
                placeholderTextColor="#888"
                multiline={true}
                numberOfLines={3}
                value={customRemark}
                onChangeText={setCustomRemark}
                accessibilityLabel="Custom remark input"
              />
            )}

            <View style={styles.remarksButtonsContainer}>
              <Pressable
                style={({pressed}) => [
                  styles.remarksButton,
                  styles.remarksCancelButton,
                  pressed && {opacity: 0.7},
                ]}
                onPress={() => {
                  setShowOnHoldRemarksInput(false);
                  setSelectedRemarkOption('');
                  setCustomRemark('');
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel on hold action">
                <Text style={styles.remarksButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [
                  styles.remarksButton,
                  styles.remarksSubmitButton,
                  pressed && {opacity: 0.7},
                ]}
                onPress={submitOnHoldRemarks}
                accessibilityRole="button"
                accessibilityLabel="Submit on hold reason">
                <Text style={styles.remarksButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
      <View style={{zIndex: 999}}>
        <ImagePreviewModal
          isVisible={isPreviewModalVisible}
          images={previewImages}
          onClose={() => setIsPreviewModalVisible(false)}
          onUpload={handleUploadImages}
          onRemoveImage={handleRemovePreviewImage}
          // Add these new props:
          onPickMoreImages={handlePickImagesForPreview} // Pass the function
          currentImageCount={previewImages.length} // Pass current count for limiting
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f2f5',
    flex: 1,
  },
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  contentContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a508c',
    marginBottom: 10,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#eaf4ff',
  },
  selectAllButtonText: {
    color: '#1a508c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#555',
    marginRight: 8,
    flexShrink: 0,
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  poItemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  poItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#333',
    flex: 1,
    marginLeft: 5,
  },
  poItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  headerContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  labelValueColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  totalRightAlign: {
    alignItems: 'flex-end',
    marginTop: 5,
    paddingEnd: 8,
  },
  amountRightAlign: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  poItemSeparator: {
    marginBottom: 10,
  },
  overallTotalRow: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    justifyContent: 'flex-end',
  },
  overallTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a508c',
  },
  showMoreLessButton: {
    color: '#1a508c',
    marginTop: 5,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: '#eaf4ff',
  },
  amountTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    height: 56,
    paddingHorizontal: 16,
    marginVertical: 5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fabInspected: {
    backgroundColor: '#607D8B',
  },
  fabOnHold: {
    backgroundColor: '#607D8B',
  },
  fabCamera: {
    backgroundColor: '#607D8B', // A neutral color for camera
  },
  fabBrowse: {
    backgroundColor: '#607D8B', // A slightly warmer color for browse
  },
  fabMainToggle: {
    backgroundColor: '#1a508c', // Main toggle FAB color
    width: 60, // Make it a circle
    height: 60, // Make it a circle
    borderRadius: 30, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Space it from other FABs
  },
  remarksOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  remarksOverlayBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  remarksInputContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: '80%',
  },
  remarksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a508c',
    textAlign: 'center',
  },
  remarksOptionsList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  remarkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  remarkOptionSelected: {
    borderColor: '#1a508c',
    backgroundColor: '#eaf4ff',
  },
  remarkOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  remarkOptionTextSelected: {
    fontWeight: 'bold',
    color: '#1a508c',
  },
  remarkOptionCheck: {
    marginLeft: 10,
  },
  remarksTextInput: {
    minHeight: 80,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
    color: '#333',
  },
  remarksButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  remarksButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  remarksCancelButton: {
    backgroundColor: '#dc3545',
  },
  remarksSubmitButton: {
    backgroundColor: '#1a508c',
  },
  remarksButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    margin: 5,
    resizeMode: 'cover',
  },
  iconStyle: {
    marginRight: 20,
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullscreenImageStyle: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default InspectionDetails;
