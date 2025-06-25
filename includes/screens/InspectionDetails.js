import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
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
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useInspectionDetails,
  useInspectItems,
  useInspectorImages,
  useUploadInspector,
  useAddSchedule,
  useRemoveInspectorImage,
  useEditDeliveryDate,
} from '../hooks/useInspection';
import {formatDateTime, removeHtmlTags} from '../utils';
import {ActivityIndicator} from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImagePreviewModal from '../components/ImagePreviewModal';
import useUserInfo from '../api/useUserInfo';
import {showMessage} from 'react-native-flash-message';
import InvoiceInputModal from '../components/InvoiceInputModal';
import DeliveryDateInputModal from '../components/DeliveryDateInputModal';
import {officeMap} from '../utils/officeMap';
import FastImage from 'react-native-fast-image';
import EditDateModal from '../components/EditDateModal';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const REMARKS_OPTIONS = [
  'Incomplete Delivery',
  'Incorrect Quantity',
  'Wrong Items Delivered',
  'Others',
];

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
        <Text style={[styles.detailLabel, {width: '30%'}]}>Office </Text>
        <Text style={styles.detailValue}>{officeMap[data.Office]}</Text>
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

const DeliveryDetailsCard = ({data, deliveryHistory}) => {
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
        <View style={{flex: 1}}>
          {deliveryHistory?.[0]?.DeliveryDatesHistory ? (
            deliveryHistory[0].DeliveryDatesHistory.split(',').map(
              (date, index) => {
                const trimmedDate = date.trim();
                const isMatch =
                  trimmedDate.toLowerCase() ===
                  data.DeliveryDate?.trim().toLowerCase();

                return (
                  <Text
                    key={index}
                    style={[
                      styles.detailValue,
                      isMatch && {fontWeight: 'bold', color: '#007AFF'}, // Highlight match
                    ]}>
                    {`${index + 1}. ${trimmedDate}`}
                  </Text>
                );
              },
            )
          ) : (
            <Text style={styles.detailValue}>-</Text>
          )}
        </View>
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

const InspectionActivityCard = ({
  data,
  isLoading,
  isFetching,
  onRemoveImage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedUri, setSelectedUri] = useState(null);

  const flatListRef = useRef(null);

  const openModal = useCallback(
    index => {
      setCurrentIndex(index);
      setModalVisible(true);

      if (data && data[index]) {
        const uri = data[index];
        setSelectedUri(uri);
        //console.log('Image selected (URI):', uri);
      }
    },
    [data],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedUri(null);
  }, []);

  const handleRemoveCurrentImage = useCallback(() => {
    if (selectedUri) {
      Alert.alert(
        'Remove Image',
        'Are you sure you want to remove this image?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Remove',
            onPress: () => {
              onRemoveImage(selectedUri);
              closeModal();
            },
            style: 'destructive',
          },
        ],
        {cancelable: true},
      );
    }
  }, [onRemoveImage, selectedUri, closeModal]);

  const renderFullscreenImage = useCallback(
    ({item}) => (
      <>
        <FastImage
          source={{
            uri: `${item}?t=${new Date().getTime()}`,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.web,
          }}
          style={modalStyles.fullscreenImageStyle}
          resizeMode={FastImage.resizeMode.contain}
        />
      </>
    ),
    [],
  );

  const handleViewableItemsChanged = useCallback(
    ({viewableItems}) => {
      if (viewableItems.length > 0) {
        const sorted = viewableItems.sort((a, b) => a.index - b.index);
        const index = sorted[0].index;
        setCurrentIndex(index);
        setSelectedUri(data[index]);
      }
    },
    [data],
  );

  useEffect(() => {
    if (modalVisible && flatListRef.current && currentIndex !== null) {
      flatListRef.current.scrollToIndex({index: currentIndex, animated: false});
    }
  }, [modalVisible, currentIndex]);

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
            <FastImage
              source={{
                uri: `${uri}?t=${new Date().getTime()}`,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.web,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={closeModal}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={modalStyles.modalActionButton}
              onPress={() => handleRemoveCurrentImage(selectedUri)}
              accessibilityRole="button"
              accessibilityLabel="Remove current image">
              <Icon name="trash-outline" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.modalActionButton}
              onPress={closeModal}
              accessibilityRole="button"
              accessibilityLabel="Close image viewer">
              <Icon name="close-circle-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={data}
            renderItem={renderFullscreenImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            initialScrollIndex={currentIndex}
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

const InspectionDetails = ({route, navigation}) => {
  const {item} = route.params;
  const {employeeNumber} = useUserInfo();
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
    refetch: refetchImages,
  } = useInspectorImages(item.Year, item.TrackingNumber);

  const {
    mutate: uploadImages,
    isPending: isUploading,
    isLoading,
  } = useUploadInspector();

  const {mutateAsync: inspectItems, isPending: isInspecting} =
    useInspectItems();

  const {mutate: addDeliveryDate, isPending: isAddingDeliveryDate} =
    useAddSchedule({
      onSuccess: (data, variables, context) => {
        showMessage('Delivery date updated successfully!', 'success');
        refetch?.();
      },
      onError: (error, variables, context) => {
        showMessage(
          `Failed to update delivery date: ${error.message || 'Unknown error'}`,
          'danger',
        );
        console.error('Delivery date update error:', error);
      },
    });

  const {mutate: removeImage, isPending: isRemovingImage} =
    useRemoveInspectorImage({
      onSuccess: async data => {
        if (data?.success) {
          await refetchImages();
          showMessage({
            message: 'Image removed successfully',
            type: 'success',
            icon: 'success',
            duration: 3000,
            floating: true,
          });
        }
      },
      onError: error => {
        showMessage({
          message: 'Failed to remove image',
          description: error.message,
          type: 'danger',
          icon: 'danger',
          duration: 3000,
          floating: true,
        });
      },
    });

  const {mutate: editDeliveryDate, isPending: editDeliveryDateLoading} =
    useEditDeliveryDate();

  const paymentData = inspectionDetails?.payment?.[0];
  const poTracking = inspectionDetails?.poTracking?.[0];
  const poRecords = inspectionDetails?.poRecord;
  const deliveryData = inspectionDetails?.delivery?.[0];
  const deliveryHistory = inspectionDetails?.deliveryHistory;

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

  const [showIndividualLabels, setShowIndividualLabels] = useState({
    camera: false,
    browse: false,
    inspected: false,
    onHold: false,
    addDeliveryDate: false, // New state for the new FAB label
    revert: false,
    editDate: false,
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '',
    invoiceDates: [], // Array to hold multiple dates
  });

  const [showDeliveryDateModal, setShowDeliveryDateModal] = useState(false); // New state for delivery date modal
  const [editDateModalVisible, setEditDateModalVisible] = useState(false);

  const handleLongPress = fabName => {
    setShowIndividualLabels(prev => ({...prev, [fabName]: true}));
  };

  const handlePressOut = fabName => {
    setShowIndividualLabels(prev => ({...prev, [fabName]: false}));
  };

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
    await refetchImages();
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
    const totalItemsInPo = Array.isArray(poRecords) ? poRecords.length : 0;

    const deliveryYear = deliveryData?.Year;
    const deliveryId = deliveryData?.Id;
    const trackingNumber = deliveryData?.TrackingNumber;
    const paymentStatus = paymentData?.Status;

    const inspectionStatus = 'Inspected';

    if (itemsToMarkInspected.length === 0) {
      showMessage({
        message: 'No Items Selected',
        description: 'Please select items to mark as inspected.',
        type: 'warning',
        icon: 'warning',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (itemsToMarkInspected.length !== totalItemsInPo) {
      showMessage({
        message: 'Inspection Failed',
        description: 'Please select all items before tagging Inspected.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    // --- New Logic for 'Inspection On Hold' ---
    if (paymentStatus?.toLowerCase() === 'inspection on hold') {
      setShowInvoiceModal(true); // Open the modal
      return; // Stop further execution here
    }
    // --- End New Logic ---

    if (paymentStatus?.toLowerCase() !== 'for inspection') {
      showMessage({
        message: 'Inspection Failed',
        description: `Status should be 'For Inspection'. Current status: '${
          paymentStatus || 'N/A'
        }'`,
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    Alert.alert(
      'Confirm Inspection',
      `Mark ${itemsToMarkInspected.length} item(s) as "Inspected"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            inspectItems(
              {
                year: deliveryYear,
                deliveryId: deliveryId,
                trackingNumber: trackingNumber,
                inspectionStatus: inspectionStatus,
                selectedPoItemIndexes: itemsToMarkInspected,
              },
              {
                onSuccess: data => {
                  showMessage({
                    message: 'Inspection Successful',
                    description:
                      data?.message || 'Selected items marked as Inspected.',
                    type: 'success',
                    icon: 'success',
                    backgroundColor: '#2E7D32',
                    color: '#FFFFFF',
                    floating: true,
                    duration: 3000,
                  });
                  setSelectedPoItemIndexes(new Set());
                  refetch();
                },
                onError: error => {
                  console.error('Error marking as inspected:', error);
                  showMessage({
                    message: 'Inspection Failed',
                    description:
                      error.message || 'Failed to mark items as Inspected.',
                    type: 'danger',
                    icon: 'danger',
                    backgroundColor: '#D32F2F',
                    color: '#FFFFFF',
                    floating: true,
                    duration: 3000,
                  });
                },
              },
            );
          },
        },
      ],
      {cancelable: false},
    );
  }, [
    selectedPoItemIndexes,
    deliveryData,
    paymentData,
    poRecords,
    inspectItems,
    refetch,
    setSelectedPoItemIndexes,
  ]);

  const handleInspectionOnHoldPress = useCallback(() => {
    const itemsToMarkOnHold = Array.from(selectedPoItemIndexes);
    const totalItemsInPo = Array.isArray(poRecords) ? poRecords.length : 0;

    const paymentStatus = paymentData?.Status;

    if (itemsToMarkOnHold.length === 0) {
      showMessage({
        message: 'No Items Selected',
        description: 'Please select items to mark as Inspection On Hold.',
        type: 'warning',
        icon: 'warning',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (itemsToMarkOnHold.length !== totalItemsInPo) {
      showMessage({
        message: 'Inspection Failed',
        description:
          'Please select all items before tagging Inspection On Hold.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (paymentStatus?.toLowerCase() !== 'for inspection') {
      showMessage({
        message: 'Inspection Failed',
        description: `Status should be 'For Inspection'. Current status: '${
          paymentStatus || 'N/A'
        }'`,
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    // All initial checks passed, now show the remarks input
    setShowOnHoldRemarksInput(true);
  }, [selectedPoItemIndexes, poRecords, paymentData, showMessage]);

  const handleRevertInspection = useCallback(() => {
    const itemsToRevert = Array.from(selectedPoItemIndexes);
    const totalItemsInPo = Array.isArray(poRecords) ? poRecords.length : 0;
    const paymentStatus = paymentData?.Status;
    const inspectionStatus = 'Revert';

    if (itemsToRevert.length === 0) {
      showMessage({
        message: 'No Items Selected',
        description: 'Please select items to revert.',
        type: 'warning',
        icon: 'warning',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (itemsToRevert.length !== totalItemsInPo) {
      showMessage({
        message: 'Revert Failed',
        description: 'Please select all items before reverting inspection.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (paymentStatus?.toLowerCase() !== 'inspected') {
      showMessage({
        message: 'Action Not Allowed',
        description: `Status should be 'Inspected' to revert. Current status: '${
          paymentStatus || 'N/A'
        }'`,
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    Alert.alert(
      'Confirm Revert',
      `Are you sure you want to revert ${itemsToRevert.length} item(s) to "For Inspection"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            inspectItems(
              {
                year: deliveryData?.Year,
                deliveryId: deliveryData?.Id,
                trackingNumber: deliveryData?.TrackingNumber,
                inspectionStatus: inspectionStatus, // Revert to 'For Inspection'
                selectedPoItemIndexes: itemsToRevert,
              },
              {
                onSuccess: data => {
                  showMessage({
                    message: 'Revert Successful',
                    description:
                      data?.message ||
                      'Selected items reverted to For Inspection.',
                    type: 'success',
                    icon: 'success',
                    backgroundColor: '#2E7D32',
                    color: '#FFFFFF',
                    floating: true,
                    duration: 3000,
                  });
                  setSelectedPoItemIndexes(new Set());
                  refetch();
                },
                onError: error => {
                  console.error('Error reverting inspection:', error);
                  showMessage({
                    message: 'Revert Failed',
                    description: error.message || 'Failed to revert items.',
                    type: 'danger',
                    icon: 'danger',
                    backgroundColor: '#D32F2F',
                    color: '#FFFFFF',
                    floating: true,
                    duration: 3000,
                  });
                },
              },
            );
          },
        },
      ],
      {cancelable: false},
    );
  }, [
    selectedPoItemIndexes,
    deliveryData,
    paymentData,
    poRecords,
    inspectItems,
    refetch,
    setSelectedPoItemIndexes,
  ]);

  const handleAddDeliveryDate = useCallback(() => {
    // Check if status is "Inspection On Hold"
    if (paymentData?.Status?.toLowerCase() !== 'inspection on hold') {
      showMessage({
        message: 'Action Not Allowed',
        description: `Can only add delivery date when status is 'Inspection On Hold'. Current status: '${
          paymentData?.Status || 'N/A'
        }'`,
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }
    // Open the delivery date modal
    setShowDeliveryDateModal(true);
  }, [paymentData?.Status]);

  const handleSubmitDeliveryDate = useCallback(
  async date => {
    const deliveryId = deliveryData?.Id ?? null;
    const curdeliveryDate = deliveryData?.DeliveryDate;

    if (!deliveryId) {
      console.warn('Delivery ID is missing, cannot add delivery date.');
      Alert.alert('Error', 'Unable to process request: Delivery ID missing.');
      return;
    }

    const newDateObj = new Date(date);
    const currentDateObj = new Date(curdeliveryDate);

    if (newDateObj < currentDateObj) {
      Alert.alert(
        'Invalid Date',
        'New delivery date cannot be earlier than the current delivery date.'
      );
      return;
    }

    try {
       addDeliveryDate({
        date: date,
        deliveryId: deliveryId,
      });

      refetch?.();

      showMessage({
        message: 'Delivery Date Added',
        description: 'The delivery date has been successfully updated.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to add delivery date:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to update delivery date. Please try again.',
        type: 'danger',
      });
    }
  },

  [addDeliveryDate, refetch, deliveryData],
);

  const handlePickImagesForPreview = useCallback(
    async source => {
      /* if (previewImages.length >= 5) {
        Alert.alert(
          'Maximum Images Reached',
          'You can only select up to 5 images for preview.',
        );
        return;
      } */

      try {
        const remainingSlots = 5 - previewImages.length;

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
              name: asset.fileName || asset.uri.split('/').pop(),
              type: asset.type || 'image/jpeg',
            };
          });

          const combinedImageDetails = [...previewImages, ...newImageDetails];
          setPreviewImages(combinedImageDetails.slice(0, 5));
          setIsPreviewModalVisible(true);
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
    [selectedItem, previewImages, requestCameraPermission],
  );

  const handleUploadImages = useCallback(async () => {
    const year = paymentData?.Year;
    const pxTN = paymentData?.TrackingNumber;

    if (previewImages.length === 0) {
      showMessage({
        message: 'No images selected for upload.',
        type: 'warning',
        icon: 'warning',
      });
      return;
    }

    uploadImages(
      {
        imagePath: previewImages,
        year: year,
        pxTN: pxTN,
        employeeNumber: employeeNumber,
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

          setPreviewImages([]);
          setIsPreviewModalVisible(false);
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
        // The `onSettled` callback is useful if you want to perform actions regardless of success/error
        // onSettled: () => {
        //   setIsUploadingImages(false); // If you're managing a local state
        // }
      },
    );
  }, [
    previewImages,
    item,
    employeeNumber,
    uploadImages, // Make sure to include the mutate function in dependencies
    setPreviewImages,
    setIsPreviewModalVisible,
  ]);

  const handleDeleteImage = useCallback(
    uriToRemove => {
      removeImage(uriToRemove);
    },
    [removeImage],
  );

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
              inspectItems(
                {
                  year: deliveryData?.Year,
                  deliveryId: deliveryData?.Id,
                  trackingNumber: deliveryData?.TrackingNumber,
                  inspectionStatus: 'OnHold',
                  remarks: finalRemark,
                  selectedPoItemIndexes: itemsToHold,
                },
                {
                  onSuccess: data => {
                    showMessage({
                      message: 'Inspection On Hold Successful',
                      description:
                        data?.message ||
                        'Selected items put on Inspection On Hold.',
                      type: 'success',
                      icon: 'success',
                      backgroundColor: '#2E7D32',
                      color: '#FFFFFF',
                      floating: true,
                      duration: 3000,
                    });
                    setSelectedPoItemIndexes(new Set());
                    setSelectedRemarkOption('');
                    setCustomRemark('');
                    setShowOnHoldRemarksInput(false);
                    refetch(); // Refetch details to update status
                  },
                  onError: error => {
                    Alert.alert('Error', 'Failed to put items on hold.');
                    console.error('Error putting on hold:', error);
                    showMessage({
                      message: 'Failed to Put On Hold',
                      description: error.message || 'Something went wrong.',
                      type: 'danger',
                      icon: 'danger',
                      backgroundColor: '#D32F2F',
                      color: '#FFFFFF',
                      floating: true,
                      duration: 3000,
                    });
                  },
                },
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to put items on hold.');
              console.error('Error putting on hold:', error);
            }
          },
        },
      ],
    );
  }, [
    selectedPoItemIndexes,
    selectedRemarkOption,
    customRemark,
    deliveryData,
    inspectItems,
    refetch,
    setSelectedPoItemIndexes,
  ]);

  const handleSubmit = useCallback(
    ({invoiceNumber, invoiceDates, noInvoice}) => {
      // ... (existing logic to get itemsToMarkInspected, deliveryYear, etc.)
      const itemsToMarkInspected = Array.from(selectedPoItemIndexes);
      const deliveryYear = deliveryData?.Year;
      const deliveryId = deliveryData?.Id;
      const trackingNumber = deliveryData?.TrackingNumber;
      const inspectionStatus = 'Inspected'; // Or 'Invoice Added' if that's a status

      if (noInvoice) {
        Alert.alert(
          'Confirm Inspection (No Invoice)',
          `Are you sure you want to mark ${itemsToMarkInspected.length} item(s) as "Inspected" without an invoice?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Confirm',
              onPress: () => {
                inspectItems(
                  {
                    year: deliveryYear,
                    deliveryId: deliveryId,
                    trackingNumber: trackingNumber,
                    inspectionStatus: inspectionStatus,
                    selectedPoItemIndexes: itemsToMarkInspected,
                    invoiceDetails: {noInvoice: true},
                  },
                  // ... onSuccess, onError handlers
                );
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        // Logic for "Invoice Provided" scenario
        if (!invoiceNumber.trim() || invoiceDates.length === 0) {
          showMessage({
            message: 'Input Required',
            description: 'Please enter invoice number and at least one date.',
            type: 'warning',
            icon: 'warning',
            floating: true,
            duration: 3000,
          });
          return;
        }

        Alert.alert(
          'Confirm Inspection',
          `Are you sure you want to mark ${
            itemsToMarkInspected.length
          } item(s) as "Inspected" with Invoice Number: ${invoiceNumber} and dates: ${invoiceDates.join(
            ', ',
          )}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Confirm',
              onPress: () => {
                // Call inspectItems with invoice details
                inspectItems(
                  {
                    year: deliveryYear,
                    deliveryId: deliveryId,
                    trackingNumber: trackingNumber,
                    inspectionStatus: inspectionStatus,
                    selectedPoItemIndexes: itemsToMarkInspected,
                    invoiceDetails: {
                      invoiceNumber: invoiceNumber,
                      invoiceDates: invoiceDates,
                      noInvoice: false,
                    },
                  },
                  // ... onSuccess, onError handlers
                );
              },
            },
          ],
          {cancelable: false},
        );
      }

      setShowInvoiceModal(false);
      setInvoiceDetails({
        invoiceNumber: '',
        invoiceDates: [],
        noInvoice: false,
      });
    },
    [
      selectedPoItemIndexes,
      deliveryData,
      inspectItems,
      showMessage,
      setShowInvoiceModal,
      setInvoiceDetails,
    ],
  );

  const handleEditDate = useCallback(() => {
    setEditDateModalVisible(true);
  }, []);

  function parseCustomDateTime(dateTimeStr) {
    if (!dateTimeStr) {
      return null;
    }
    const [datePart, timePart, meridian] = dateTimeStr.split(/[\s]+/);
    const [year, month, day] = datePart.split('-').map(Number);
    let [hour, minute] = timePart.split(':').map(Number);

    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  }
  const handleSubmitEditDate = useCallback(
    async newDateString => {
      try {
        const deliveryId = deliveryData?.Id;
        const originalDeliveryDateString = deliveryData?.DeliveryDate;

        if (!deliveryId || !newDateString || !originalDeliveryDateString) {
          console.warn(
            'Missing deliveryId, newDate, or original DeliveryDate.',
          );
          Alert.alert(
            'Error',
            'Unable to process request due to missing information.',
          );
          return;
        }

        const newDate = parseCustomDateTime(newDateString);
        const originalDate = parseCustomDateTime(originalDeliveryDateString);

        if (
          !newDate ||
          isNaN(newDate.getTime()) ||
          !originalDate ||
          isNaN(originalDate.getTime())
        ) {
          console.error('Failed to parse date strings:', {
            newDateString,
            originalDeliveryDateString,
          });
          Alert.alert(
            'Error',
            'Could not process dates correctly. Please try again.',
          );
          return;
        }

        if (newDate < originalDate) {
          Alert.alert(
            'Invalid Date',
            `The selected date and time cannot be earlier than the original delivery date:\n\n${originalDate.toLocaleDateString()} ${originalDate.toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              },
            )}.`,
            [{text: 'OK'}],
            {cancelable: true},
          );
          return;
        }

        editDeliveryDate({
          deliveryId,
          deliveryDate: newDateString,
          year: deliveryData.Year,
          trackingNumber: deliveryData.TrackingNumber,
        });

        showMessage({
          message: 'Delivery Date Updated',
          description: 'The delivery date has been successfully changed.',
          type: 'success',
        });
        setEditDateModalVisible(false);
        refetch?.();
      } catch (error) {
        console.error('Error updating delivery date:', error);
        Alert.alert(
          'Update Failed',
          'An unexpected error occurred. Please try again.',
        );
      }
    },
    [editDeliveryDate, deliveryData, refetch],
  );

  // const handleSubmitEditDate = useCallback(
  //   newDate => {
  //     if (!deliveryData?.Id || !newDate) {
  //       console.warn('Missing deliveryId or newDate');
  //       return;
  //     }
  //     console.log(newDate, deliveryData.DeliveryDate);

  //    /*  editDeliveryDate({
  //       deliveryId: deliveryData.Id,
  //       deliveryDate: newDate,
  //       year: deliveryData.Year,
  //       trackingNumber: deliveryData.TrackingNumber,
  //     }); */
  //   },
  //   [editDeliveryDate, deliveryData],
  // );

  const toggleMainFabs = useCallback(() => {
    setShowAllFabs(prev => !prev);
  }, []);

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
          {/* <View style={{flex: 1, width: 40}} /> */}
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
            <DeliveryDetailsCard
              data={deliveryData}
              deliveryHistory={deliveryHistory}
            />
            <InspectionActivityCard
              data={imageData}
              isLoading={isImageLoading}
              isFetching={isImageFetching}
              onRemoveImage={handleDeleteImage}
            />
          </>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        {showAllFabs && (
          <>
            <Pressable
              style={[styles.fab, styles.fabCamera]}
              android_ripple={{
                /* color: '#F6F6F6', */ borderless: false /* radius: 28 */,
              }}
              onPress={() => handlePickImagesForPreview('camera')}
              onLongPress={() => handleLongPress('camera')}
              onPressOut={() => handlePressOut('camera')}
              accessibilityRole="button"
              accessibilityLabel="Take a new photo">
              {showIndividualLabels.camera && (
                <Text style={styles.fabText}>Take Photo</Text>
              )}
              <Icon name="camera" size={28} color="#fff" />
            </Pressable>
            <Pressable
              style={[styles.fab, styles.fabBrowse]}
              android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
              onPress={() => handlePickImagesForPreview('gallery')}
              onLongPress={() => handleLongPress('browse')}
              onPressOut={() => handlePressOut('browse')}
              accessibilityRole="button"
              accessibilityLabel="Browse existing photos">
              {showIndividualLabels.browse && (
                <Text style={styles.fabText}>Browse</Text>
              )}
              <Icon name="image" size={28} color="#fff" />
            </Pressable>

            <Pressable
              style={[styles.fab, styles.fabEditDate]}
              android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
              onPress={handleEditDate}
              onLongPress={() => handleLongPress('editDate')}
              onPressOut={() => handlePressOut('editDate')}
              accessibilityRole="button"
              accessibilityLabel="Edit delivery date and time">
              {showIndividualLabels.editDate && (
                <Text style={styles.fabText}>Edit Date</Text>
              )}
              <MaterialCommunityIcon
                name="calendar-edit" // Changed icon to a more relevant "calendar-edit"
                size={28}
                color="white"
              />
            </Pressable>

            <>
              {(paymentData?.Status?.toLowerCase() === 'for inspection' ||
                paymentData?.Status?.toLowerCase() ===
                  'inspection on hold') && (
                <Pressable
                  style={[styles.fab, styles.fabInspected]}
                  android_ripple={{
                    color: '#F6F6F6',
                    borderless: false,
                    radius: 28,
                  }}
                  onPress={handleInspected}
                  onLongPress={() => handleLongPress('inspected')}
                  onPressOut={() => handlePressOut('inspected')}
                  accessibilityRole="button"
                  accessibilityLabel="Mark selected items as inspected">
                  {showIndividualLabels.inspected && (
                    <Text style={styles.fabText}>Inspected</Text>
                  )}
                  <Icon
                    name="checkmark-done-circle-outline"
                    size={28}
                    color="#fff"
                  />
                </Pressable>
              )}

              {/* Inspection On Hold FAB */}
              {paymentData?.Status === 'For Inspection' &&
                paymentData.Status !== 'Inspection On Hold' && ( // This condition means it only shows if 'For Inspection' AND NOT 'Inspection On Hold'
                  <Pressable
                    style={[styles.fab, styles.fabOnHold]}
                    android_ripple={{
                      color: '#F6F6F6',
                      borderless: true,
                      radius: 28,
                    }}
                    onPress={handleInspectionOnHoldPress}
                    onLongPress={() => handleLongPress('onHold')}
                    onPressOut={() => handlePressOut('onHold')}
                    accessibilityRole="button"
                    accessibilityLabel="Put selected items on hold">
                    {showIndividualLabels.onHold && (
                      <Text style={styles.fabText}>On Hold</Text>
                    )}
                    <Icon name="pause-circle-outline" size={28} color="#fff" />
                  </Pressable>
                )}

              {paymentData?.Status === 'Inspected' && (
                <Pressable
                  style={[styles.fab, styles.fabOnHold]} // Using fabOnHold style for now, you can create a specific fabRevert style
                  android_ripple={{
                    color: '#F6F6F6',
                    borderless: true,
                    radius: 28,
                  }}
                  onPress={handleRevertInspection} // New handler for reverting
                  onLongPress={() => handleLongPress('revert')}
                  onPressOut={() => handlePressOut('revert')}
                  accessibilityRole="button"
                  accessibilityLabel="Revert inspection status">
                  {showIndividualLabels.revert && (
                    <Text style={styles.fabText}>Revert</Text>
                  )}
                  <Icon
                    name="arrow-undo-circle-outline"
                    size={28}
                    color="#fff"
                  />
                </Pressable>
              )}

              {/* Add Delivery Date FAB (New) */}
              {paymentData?.Status?.toLowerCase() === 'inspection on hold' && (
                <Pressable
                  style={[styles.fab, styles.fabAddDeliveryDate]}
                  android_ripple={{
                    color: '#F6F6F6',
                    borderless: false,
                    radius: 28,
                  }}
                  onPress={handleAddDeliveryDate}
                  onLongPress={() => handleLongPress('addDeliveryDate')}
                  onPressOut={() => handlePressOut('addDeliveryDate')}
                  accessibilityRole="button"
                  accessibilityLabel="Add delivery date">
                  {showIndividualLabels.addDeliveryDate && (
                    <Text style={styles.fabText}>Add Delivery Date</Text>
                  )}
                  <Icon
                    name="calendar-outline" // Choose an appropriate icon for date
                    size={28}
                    color="#fff"
                  />
                </Pressable>
              )}
            </>
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
      <>
        <View style={{zIndex: 999}}>
          <InvoiceInputModal
            isVisible={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            invoiceDetails={invoiceDetails}
            setInvoiceDetails={setInvoiceDetails}
            onSubmit={handleSubmit}
          />
        </View>
      </>
      <>
        <View style={{zIndex: 999}}>
          <EditDateModal
            isVisible={editDateModalVisible}
            onClose={() => setEditDateModalVisible(false)}
            currentDate={deliveryData?.DeliveryDate}
            onSubmit={handleSubmitEditDate}
          />
        </View>
      </>
      <>
        <Modal
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          visible={editDeliveryDateLoading || isAddingDeliveryDate || isRemovingImage}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingPanel}>
              <ActivityIndicator size="large" color="#1a508c" />
              <Text style={styles.loadingOverlayText}>Processing ...</Text>
            </View>
          </View>
        </Modal>
      </>
      <>
        <Modal
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          visible={isInspecting}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingPanel}>
              <ActivityIndicator size="large" color="#1a508c" />
              <Text style={styles.loadingOverlayText}>
                Processing Inspection...
              </Text>
            </View>
          </View>
        </Modal>
      </>
      <>
        <Modal
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          visible={isUploading}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingPanel}>
              <ActivityIndicator size="large" color="#1a508c" />
              <Text style={styles.loadingOverlayText}>Uploading Images...</Text>
            </View>
          </View>
        </Modal>
      </>
      <>
        <View style={{zIndex: 999}}>
          <DeliveryDateInputModal // New Delivery Date Modal
            isVisible={showDeliveryDateModal}
            deliveryData={deliveryData}
            onClose={() => setShowDeliveryDateModal(false)}
            onSubmit={handleSubmitDeliveryDate}
          />
        </View>
      </>
      <View style={{zIndex: 999}}>
        <ImagePreviewModal
          isVisible={isPreviewModalVisible}
          images={previewImages}
          onClose={() => {
            setIsPreviewModalVisible(false);
            setPreviewImages([]);
          }}
          onUpload={handleUploadImages}
          onRemoveImage={handleRemovePreviewImage}
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
    marginRight: 20,
  },
  fabInspected: {
    backgroundColor: '#3674B5',
  },
  fabOnHold: {
    backgroundColor: '#3674B5',
  },
  fabAddDeliveryDate: {
    backgroundColor: '#3674B5', // A neutral color for camera
  },
  fabCamera: {
    backgroundColor: '#3674B5', // A neutral color for camera
  },
  fabBrowse: {
    backgroundColor: '#3674B5', // A slightly warmer color for browse
  },
  fabEditDate: {
    backgroundColor: '#3674B5', // A slightly warmer color for browse
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it's on top of everything
  },
  loadingPanel: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a508c',
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  modalButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? 50 : 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // <- semi-transparent black
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  modalActionButton: {
    padding: 5,
  },
  fullscreenImageStyle: {
    width: screenWidth,
    height: '100%',
  },
});

export default InspectionDetails;
