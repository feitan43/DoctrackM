// InventoryDetails.js
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useInventoryDetails,
  useInventoryImages,
  useUploadInventory,
  useRemoveImageInv, // Import useRemoveImageInv
} from '../hooks/useInventory';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message'; // Make sure this is installed: npm install react-native-flash-message

const InventoryDetails = ({route, navigation}) => {
  const {Id, Year, TrackingNumber, Office} = route.params;
  const getDetail = value => value ?? 'N/A';

  const {data, isLoading, error, refetch} = useInventoryDetails(
    Id,
    TrackingNumber,
    Year,
  );

  const {
    data: imageUrls,
    isLoading: imageLoading,
    refetch: refetchImages,
  } = useInventoryImages(
    // Added refetchImages
    Id,
    Office,
    TrackingNumber,
  );

  console.log(
    'imageUrls fetched by hook:',
    imageUrls,
    'for ID:',
    Id,
    'Office:',
    Office,
    'TrackingNumber:',
    TrackingNumber,
  );

  const inventoryItem = data?.inventory?.[0];
  const poDetailsItem = data?.podetails?.[0];

  const [previewImage, setPreviewImage] = useState([]); // Stores local images selected for upload
  const [uploadProgress, setUploadProgress] = useState(0); // This isn't currently updated by useUploadInventory
  const [uploadingImage, setUploadingImage] = useState(false); // To manage local UI state for upload

  const {
    mutate: uploadImages,
    isLoading: isUploading, // From react-query's useMutation
    error: uploadError,
  } = useUploadInventory();

  const {mutate: removeImage, isLoading: isRemovingImage} = useRemoveImageInv(
    () => {
      // onSuccess callback for removeImage
      showMessage({
        message: 'Image removed successfully!',
        type: 'success',
        icon: 'success',
        floating: true,
        duration: 3000,
      });
      refetchImages(); // Refetch images after successful removal
      refetch(); // Refetch details in case something changed
    },
    err => {
      // onError callback for removeImage
      showMessage({
        message: 'Image removal failed!',
        description:
          err?.message || 'Something went wrong during image removal.',
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 3000,
      });
    },
  );

  const pickImage = () => {
    Alert.alert('Select Image', 'Choose an option to select an image', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          try {
            const result = await launchImageLibrary({
              mediaType: 'photo',
              quality: 0.7,
              selectionLimit: 0, // 0 allows multiple selection
            });

            if (
              !result.didCancel &&
              result.assets &&
              result.assets.length > 0
            ) {
              console.log(
                'Selected from gallery:',
                result.assets.length,
                'images.',
              );
              setPreviewImage(prevImages => [...prevImages, ...result.assets]); // Append all selected images
            }
          } catch (err) {
            console.log('Image picker error (gallery): ', err);
            Alert.alert(
              'Error',
              'Failed to pick image from gallery. ' + (err?.message || ''),
            );
          }
        },
      },
      {
        text: 'Take Photo',
        onPress: async () => {
          try {
            const result = await launchCamera({
              mediaType: 'photo',
              quality: 0.7,
              cameraType: 'back',
            });

            if (
              !result.didCancel &&
              result.assets &&
              result.assets.length > 0
            ) {
              console.log('Took photo:', result.assets[0].uri);
              setPreviewImage(prevImages => [...prevImages, result.assets[0]]); // Add single captured photo
            }
          } catch (err) {
            console.log('Camera error: ', err);
            Alert.alert(
              'Error',
              'Failed to take photo with camera. ' + (err?.message || ''),
            );
          }
        },
      },
    ]);
  };

  const handleRemoveImage = imageUri => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        onPress: () => {
          removeImage(imageUri);
        },
        style: 'destructive',
      },
    ]);
  };

  const confirmUploadImages = useCallback(async () => {
    if (!inventoryItem) {
      Alert.alert(
        'Item Data Missing',
        'Cannot upload without complete inventory item data.',
      );
      return;
    }
    if (previewImage.length === 0) {
      Alert.alert('No Images', 'Please select images for preview first.');
      return;
    }

    setUploadingImage(true); // Set local uploading state
    setUploadProgress(0); // Reset progress (if you implement actual progress tracking)

    uploadImages(
      {
        imagePath: previewImage,
        id: Id,
        office: Office,
        tn: TrackingNumber,
        // employeeNumber: YOUR_EMPLOYEE_NUMBER_HERE // Pass if needed by backend
      },
      {
        onSuccess: data => {
          showMessage({
            message: data.message || 'Images uploaded successfully!',
            type: 'success',
            icon: 'success',
            floating: true,
            duration: 3000,
          });

          setPreviewImage([]);
          setUploadingImage(false);
        },
        onError: error => {
          console.error('Image upload failed:', error);
          showMessage({
            message: 'Upload failed!',
            description:
              error.message || 'Something went wrong during image upload.',
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 3000,
          });
        },
        onSettled: () => {
          // This runs regardless of success or failure
          setUploadProgress(0);
          setUploadingImage(false); // Reset local uploading state
        },
      },
    );
  }, [
    inventoryItem,
    previewImage,
    uploadImages,
    refetch, // Keep refetch for overall details
    refetchImages, // To explicitly refetch images from the server
    Office,
    TrackingNumber,
    Id,
  ]);

  if (
    isLoading ||
    imageLoading ||
    isUploading ||
    uploadingImage ||
    isRemovingImage
  ) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a508c" />
        <Text style={styles.loadingText}>
          {isUploading || uploadingImage
            ? 'Uploading image(s)...'
            : isRemovingImage
            ? 'Removing image...'
            : 'Loading details...'}
        </Text>
        {/* Progress bar would require more sophisticated implementation within uploadInventory to update state */}
        {isUploading && uploadProgress > 0 && (
          <Text style={styles.loadingText}>{`Progress: ${Math.round(
            uploadProgress * 100,
          )}%`}</Text>
        )}
      </SafeAreaView>
    );
  }

  if (error || uploadError) {
    // Both network errors and application-level errors from useUploadInventory will be caught here
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Oops! Something went wrong:{' '}
          {error?.message ||
            uploadError?.message ||
            'An unknown error occurred'}
          .
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!inventoryItem && !poDetailsItem) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No details found for this item.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const allImagesToDisplay = [
    ...previewImage.map(asset => ({uri: asset.uri, isLocal: true})),
    ...imageUrls.map(url => ({uri: url, isLocal: false})),
  ];

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}
          imageStyle={styles.bgHeaderImageStyle}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="chevron-back-outline" size={28} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Item Details</Text>
            <View style={{width: 28}} />
          </View>
        </ImageBackground>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {inventoryItem && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>General Details</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Tracking Number:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Year)}-
                    {getDetail(inventoryItem?.TrackingNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Brand:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Brand)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Description)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Unit:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Unit)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Model:</Text>
                  <Text style={styles.value}>
                    {getDetail(
                      inventoryItem?.ModelNumber || inventoryItem?.Model,
                    )}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Serial Number:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.SerialNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Set:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Set)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Property No.:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.PropertyNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Sticker:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.StickerNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Amount:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Amount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Unit Cost:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.UnitCost)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date Acquired:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.DateAcquired)}
                  </Text>
                </View>
              </View>
            )}

            {poDetailsItem && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>PO Details</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Claimant:</Text>
                  <Text style={styles.value}>
                    {getDetail(poDetailsItem?.Claimant)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>PO Number:</Text>
                  <Text style={styles.value}>
                    {getDetail(poDetailsItem?.PO_Number)}
                  </Text>
                </View>
              </View>
            )}

            {inventoryItem && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Assignment & Status</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Assigned To:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.NameAssignedTo)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Current User:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.CurrentUser)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Status)}
                  </Text>
                </View>
              </View>
            )}

            {/* Item Image Section - now uses previewImage, imageUrls from hook, and upload functionality */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Item Images</Text>
              </View>

              {allImagesToDisplay.length > 0 ? (
                allImagesToDisplay.map((image, index) => (
                  <View key={`image-${index}`} style={styles.imageWrapper}>
                    <Image
                      source={{uri: image.uri}}
                      style={styles.itemImage}
                      resizeMode="contain"
                      onError={e =>
                        console.log(
                          `Image ${index} loading error for ${image.uri}:`,
                          e.nativeEvent.error,
                        )
                      }
                    />
                    {!image.isLocal && ( // Only show remove button for already uploaded images
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(image.uri)}
                        disabled={isRemovingImage}>
                        <Icon name="close-circle" size={24} color="#D32F2F" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.noImageContainer}>
                  <Icon name="image-off-outline" size={50} color="#777777" />
                  <Text style={styles.noImageText}>No Images Available</Text>
                </View>
              )}

              {/* Buttons for image interaction */}
              <View style={styles.imageActionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={pickImage}
                  disabled={isUploading || uploadingImage}>
                  <Icon name="image-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Select Images</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.uploadButton]}
                  onPress={confirmUploadImages}
                  disabled={
                    previewImage.length === 0 || isUploading || uploadingImage
                  }>
                  {isUploading || uploadingImage ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Icon
                      name="cloud-upload-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                  <Text style={styles.actionButtonText}>Upload Images</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{height: 20}} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 100,
    backgroundColor: '#1a508c',
    paddingHorizontal: 20,
    marginBottom: -0,
    justifyContent: 'center',
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
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -28,
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
    fontSize: 17,
    marginLeft: 5,
    fontWeight: '500',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 50,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
    flex: 1.2,
    marginRight: 10,
  },
  value: {
    fontSize: 15,
    color: '#333333',
    flex: 2,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    // Added for remove button positioning
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#e0e0e0',
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden', // Ensures remove button stays within bounds if not absolute
  },
  itemImage: {
    width: '100%',
    height: '100%', // Take full height of wrapper
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    // Removed direct border properties as they are now on imageWrapper
  },
  removeImageButton: {
    // Style for the remove button
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 2,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  noImageText: {
    color: '#777777',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#1a508c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  imageActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InventoryDetails;
