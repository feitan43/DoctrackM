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
  useRemoveImageInv,
} from '../hooks/useInventory';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import FastImage from 'react-native-fast-image';
import {insertCommas} from '../utils/insertComma';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

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
  } = useInventoryImages(Id, Office, TrackingNumber);

  const inventoryItem = data?.inventory?.[0];
  const poDetailsItem = data?.podetails?.[0];

  const [previewImage, setPreviewImage] = useState([]);
  // We'll manage upload status for each image separately
  const [imageUploadStatus, setImageUploadStatus] = useState({}); // {uri: 'uploading' | 'uploaded' | 'failed'}

  const {
    mutate: uploadImages,
    isLoading: isUploading,
    error: uploadError,
    // If your useUploadInventory hook provides progress for the entire batch:
    // progress: overallUploadProgress,
  } = useUploadInventory();

  const {mutate: removeImage, isLoading: isRemovingImage} = useRemoveImageInv(
    () => {
      showMessage({
        message: 'Image removed successfully!',
        type: 'success',
        icon: 'success',
        floating: true,
        duration: 3000,
      });
      refetchImages();
      refetch();
    },
    err => {
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

  /*  const pickImage = () => {
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
              selectionLimit: 0,
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
              setPreviewImage(prevImages => {
                const newAssets = result.assets.filter(
                  newAsset => !prevImages.some(p => p.uri === newAsset.uri),
                );
                // Initialize status for new images
                const newStatus = newAssets.reduce((acc, asset) => {
                  acc[asset.uri] = 'pending';
                  return acc;
                }, {});
                setImageUploadStatus(prevStatus => ({
                  ...prevStatus,
                  ...newStatus,
                }));
                return [...prevImages, ...newAssets];
              });
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
              setPreviewImage(prevImages => {
                const newAsset = result.assets[0];
                if (prevImages.some(p => p.uri === newAsset.uri)) {
                  return prevImages; // Avoid duplicates
                }
                setImageUploadStatus(prevStatus => ({
                  ...prevStatus,
                  [newAsset.uri]: 'pending',
                }));
                return [...prevImages, newAsset];
              });
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
  }; */

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
              selectionLimit: 0,
            });

            if (
              !result.didCancel &&
              result.assets &&
              result.assets.length > 0
            ) {
              /*  console.log(
                'Selected from gallery:',
                result.assets.length,
                'images.',
              ); */
              setPreviewImage(prevImages => {
                const newAssets = result.assets.filter(
                  newAsset => !prevImages.some(p => p.uri === newAsset.uri),
                );
                // Initialize status for new images
                const newStatus = newAssets.reduce((acc, asset) => {
                  acc[asset.uri] = 'pending';
                  return acc;
                }, {});
                setImageUploadStatus(prevStatus => ({
                  ...prevStatus,
                  ...newStatus,
                }));
                return [...prevImages, ...newAssets];
              });
            }
          } catch (err) {
            /*  console.log('Image picker error (gallery): ', err); */
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
            // --- Permission Request Logic ---
            let cameraPermissionStatus;

            // Check platform-specific camera permission
            if (Platform.OS === 'ios') {
              cameraPermissionStatus = await check(PERMISSIONS.IOS.CAMERA);
            } else if (Platform.OS === 'android') {
              cameraPermissionStatus = await check(PERMISSIONS.ANDROID.CAMERA);
            }

            if (cameraPermissionStatus !== RESULTS.GRANTED) {
              // Request permission if not granted
              let requestResult;
              if (Platform.OS === 'ios') {
                requestResult = await request(PERMISSIONS.IOS.CAMERA);
              } else if (Platform.OS === 'android') {
                requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
              }

              if (requestResult !== RESULTS.GRANTED) {
                Alert.alert(
                  'Permission Denied',
                  'Camera permission is required to take photos. Please enable it in your device settings.',
                );
                return; // Stop execution if permission is not granted
              }
            }
            // --- End Permission Request Logic ---

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
              /* console.log('Took photo:', result.assets[0].uri); */
              setPreviewImage(prevImages => {
                const newAsset = result.assets[0];
                if (prevImages.some(p => p.uri === newAsset.uri)) {
                  return prevImages; // Avoid duplicates
                }
                setImageUploadStatus(prevStatus => ({
                  ...prevStatus,
                  [newAsset.uri]: 'pending',
                }));
                return [...prevImages, newAsset];
              });
            }
          } catch (err) {
            /* console.log('Camera error: ', err); */
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

  const handleRemovePreviewImage = uriToRemove => {
    Alert.alert(
      'Remove Preview Image',
      'Are you sure you want to remove this image from the preview list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setPreviewImage(currentImages =>
              currentImages.filter(asset => asset.uri !== uriToRemove),
            );
            setImageUploadStatus(prevStatus => {
              const newStatus = {...prevStatus};
              delete newStatus[uriToRemove];
              return newStatus;
            });
            showMessage({
              message: 'Image removed from preview!',
              type: 'info',
              icon: 'info',
              floating: true,
              duration: 2000,
            });
          },
          style: 'destructive',
        },
      ],
    );
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

    // Set all preview images to 'uploading' status
    setImageUploadStatus(prevStatus => {
      const newStatus = {...prevStatus};
      previewImage.forEach(img => {
        newStatus[img.uri] = 'uploading';
      });
      return newStatus;
    });

    uploadImages(
      {
        imagePath: previewImage,
        id: Id,
        office: Office,
        tn: TrackingNumber,
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

          setPreviewImage([]); // Clear preview images after successful upload
          setImageUploadStatus({}); // Clear all upload statuses
          refetchImages();
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
          // Set failed status for images
          setImageUploadStatus(prevStatus => {
            const newStatus = {...prevStatus};
            previewImage.forEach(img => {
              newStatus[img.uri] = 'failed';
            });
            return newStatus;
          });
        },
        onSettled: () => {
          // This runs regardless of success or failure
          // If you decide to keep preview images on failure, adjust here
        },
      },
    );
  }, [
    inventoryItem,
    previewImage,
    uploadImages,
    refetchImages,
    Office,
    TrackingNumber,
    Id,
  ]);

  const isOverallLoading = isLoading || imageLoading || isRemovingImage;
  const isActionDisabled = isUploading || isOverallLoading; // Combine all loading states for action buttons

  // Modified logic for allImagesToDisplay
  /* const allImagesToDisplay = previewImage.length > 0
    ? previewImage.map(asset => ({ uri: asset.uri, isLocal: true, status: imageUploadStatus[asset.uri] || 'pending' }))
    : imageUrls.map(url => ({ uri: url, isLocal: false })); */

  const allImagesToDisplay =
    previewImage.length > 0
      ? previewImage.map(asset => ({
          uri: asset.uri,
          isLocal: true,
          status: imageUploadStatus[asset.uri] || 'pending',
        }))
      : (imageUrls || []).map(url => ({uri: url, isLocal: false})); // Added || []

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
                  <Text style={styles.label}>Tracking Number </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Year)}-
                    {getDetail(inventoryItem?.TrackingNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Id </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Id)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Brand </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Brand)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Description </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Description)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Unit </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Unit)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Model </Text>
                  <Text style={styles.value}>
                    {getDetail(
                      inventoryItem?.ModelNumber || inventoryItem?.Model,
                    )}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Serial Number </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.SerialNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Set </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Set)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Property No. </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.PropertyNumber)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Sticker </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.StickerNumber)}
                  </Text>
                </View> 
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Unit Cost </Text>
                  <Text style={styles.value}>
                    {getDetail(insertCommas(inventoryItem?.UnitCost))}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Total </Text>
                  <Text style={styles.value}>
                    {getDetail(insertCommas(inventoryItem?.Amount))}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date Acquired </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.DateAcquired)}
                  </Text>
                </View>
               {/*  <View style={styles.detailRow}>
                  <Text style={styles.label}>NumOfFiles </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.NumOfFiles)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>UploadFiles </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.UploadFiles)}
                  </Text>
                </View> */}
              </View>
            )}

            {poDetailsItem && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>PO Details</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Claimant </Text>
                  <Text style={styles.value}>
                    {getDetail(poDetailsItem?.Claimant)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>PO Number </Text>
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
                  <Text style={styles.label}>Assigned To </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.NameAssignedTo)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Current User </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.CurrentUser)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Status </Text>
                  <Text style={styles.value}>
                    {getDetail(inventoryItem?.Status)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sectionContainer}>
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Item Images</Text>
              </View>

              {isOverallLoading ? ( // Show a global loading indicator for all images
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1a508c" />
                  <Text style={styles.loadingText}>Loading images...</Text>
                </View>
              ) : allImagesToDisplay.length > 0 ? (
                allImagesToDisplay.map((image, index) => (
                  <View
                    key={`image-${image.uri}-${index}`}
                    style={styles.imageWrapper}>
                    <FastImage
                      source={{
                        uri: image.uri, // Corrected to remove timestamp
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.web,
                      }}
                      style={styles.itemImage}
                      resizeMode="contain"
                      onError={e =>
                        console.log(
                          `Image ${index} loading error for ${image.uri}:`,
                          e.nativeEvent.error,
                        )
                      }
                    />
                    {image.isLocal ? ( // Show controls for local preview images
                      <>
                        {image.status === 'uploading' && (
                          <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.uploadingText}>
                              Uploading...
                            </Text>
                          </View>
                        )}
                        {image.status === 'failed' && (
                          <View
                            style={[
                              styles.uploadingOverlay,
                              styles.failedOverlay,
                            ]}>
                            <Icon
                              name="warning-outline"
                              size={30}
                              color="#FFFFFF"
                            />
                            <Text style={styles.uploadingText}>Failed</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemovePreviewImage(image.uri)}
                          disabled={isActionDisabled} // Disable removal during upload
                        >
                          <Icon name="close-circle" size={24} color="#D32F2F" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Show controls for already uploaded images
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(image.uri)}
                        disabled={isActionDisabled} // Disable removal during any action
                      >
                        <Icon name="close-circle" size={24} color="#D32F2F" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageText}>No Images Available</Text>
                </View>
              )}

              <View style={styles.imageActionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isActionDisabled && styles.actionButtonDisabled,
                  ]}
                  onPress={pickImage}
                  disabled={isActionDisabled}>
                  <Icon name="image-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Select Images</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.uploadButton,
                    (previewImage.length === 0 || isActionDisabled) &&
                      styles.uploadButtonDisabled,
                  ]}
                  onPress={confirmUploadImages}
                  disabled={previewImage.length === 0 || isActionDisabled}>
                  {isUploading ? (
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
    fontWeight: 'normal',
    color: '#555555',
    flex: 1.2,
    marginRight: 10,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    flex: 2,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#e0e0e0',
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 2,
    zIndex: 10, // Ensure it's above the overlay
  },
  // New styles for uploading overlay
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 5, // Ensure it's below the remove button but above the image
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  failedOverlay: {
    backgroundColor: 'rgba(211, 47, 47, 0.7)', // Redder overlay for failed
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
  actionButtonDisabled: {
    opacity: 0.6, // Visual cue for disabled buttons
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  uploadButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InventoryDetails;
