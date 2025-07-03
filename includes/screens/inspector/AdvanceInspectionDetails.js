// AdvanceInspectionDetails.js
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert, // Import Alert for confirmation dialogs
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useAdvanceInspectionDetails,
  useInspectItems, // Ensure useInspectItems is imported
} from '../../hooks/useInspection';
import {formatDisplayDateTime} from '../../utils/dateUtils';
import {insertCommas} from '../../utils/insertComma';
import {showMessage} from 'react-native-flash-message'; // Import showMessage

const PRItem = ({item, index, isChecked, onToggle}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hasMoreLines, setHasMoreLines] = useState(false);

  const handleTextLayout = useCallback(e => {
    if (e.nativeEvent.lines.length > 2) {
      setHasMoreLines(true);
    } else {
      setHasMoreLines(false);
    }
  }, []);

  return (
    <View
      style={[
        prItemStyles.itemContainer,
        isChecked && prItemStyles.itemContainerChecked,
      ]}>
      <View style={prItemStyles.itemHeader}>
        <Text style={prItemStyles.itemIndex}>{index + 1}</Text>
        <View style={prItemStyles.headerRightContent}>
          <View style={prItemStyles.quantityPriceHeaderContainer}>
            <View style={prItemStyles.headerColumn}>
              <Text style={prItemStyles.detailLabel}>Quantity:</Text>
              <Text style={prItemStyles.detailValue}>
                {`${item.Qty || 'N/A'} ${item.Unit || ''}`}
              </Text>
            </View>
            <View style={prItemStyles.headerColumn}>
              <Text style={prItemStyles.detailLabel}>Unit Price:</Text>
              <Text style={prItemStyles.detailValue}>
                {item.Amount ? `₱ ${insertCommas(item.Amount)}` : 'N/A'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onToggle(index)}
            style={prItemStyles.checkboxContainer}>
            <MaterialCommunityIcon
              name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={isChecked ? '#1a508c' : '#607D8B'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={prItemStyles.detailRow}>
        <View style={{flex: 1}}>
          <Text style={prItemStyles.detailLabel}>Description:</Text>

          <Text
            style={[prItemStyles.detailValue, prItemStyles.multiline]}
            numberOfLines={showFullDescription ? undefined : 2}
            onTextLayout={handleTextLayout}>
            {item.Description || 'N/A'}
          </Text>
          {hasMoreLines && (
            <Pressable
              onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={prItemStyles.showMoreLessButton}>
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      {/* <View style={{borderWidth: 1, borderColor: '#ccc'}} /> */}
      <View style={{borderTopWidth: 1, borderColor:'#ccc'}}>
        <View style={{alignSelf:'flex-end'}}>
        <Text>Total Amount</Text>
        <Text style={{fontWeight: 'bold', color: '#212529', fontSize: 16}}>
          {item.Total ? `₱ ${insertCommas(item.Total)}` : 'N/A'}
        </Text>
        </View>
      </View>
    </View>
  );
};

const AdvanceInspectionDetails = ({route, navigation}) => {
  const {Id, Year, RefTrackingNumber} = route.params;
  const [showFabButtons, setShowFabButtons] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [allChecked, setAllChecked] = useState(false);

  // Destructure refetch from useAdvanceInspectionDetails
  const {data, loading, error, refetch} = useAdvanceInspectionDetails(
    Id,
    Year,
    RefTrackingNumber,
  );

  const [isRefreshing, setIsRefreshing] = useState(false); // State for pull-to-refresh

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true); // Set refreshing to true when refresh starts
    try {
      await refetch(); // Call the refetch function from your hook
    } catch (err) {
      console.error('Failed to refetch inspection details:', err);
      showMessage({
        message: 'Error',
        description: 'Failed to refresh data.',
        type: 'danger',
      });
    } finally {
      setIsRefreshing(false); // Set refreshing to false when refresh completes
    }
  }, [refetch]);

  const deliveryData = data?.delivery[0];
  const prItems = data?.prRecord || [];

  const {mutateAsync: inspectItems, isPending: isInspecting} =
    useInspectItems();

  useEffect(() => {
    if (prItems.length > 0) {
      // Check if every item at its index is true in checkedItems
      const allAreChecked = prItems.every((_, index) => checkedItems[index]);
      setAllChecked(allAreChecked);
    } else {
      setAllChecked(false);
    }
  }, [prItems, checkedItems]);

  const handleItemToggle = useCallback(itemIndex => {
    setCheckedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex],
    }));
  }, []);

  const handleCheckAllToggle = useCallback(() => {
    const newCheckedState = !allChecked;
    const newCheckedItems = {};
    if (newCheckedState) {
      // Iterate through indices to check all
      prItems.forEach((_, index) => {
        newCheckedItems[index] = true;
      });
    }
    setCheckedItems(newCheckedItems);
    setAllChecked(newCheckedState);
  }, [allChecked, prItems]);

  const handleInspected = useCallback(() => {
    const itemsToMarkInspected = Object.keys(checkedItems).filter(
      key => checkedItems[key],
    );
    const totalItemsInPR = Array.isArray(prItems) ? prItems.length : 0;

    const deliveryYear = deliveryData?.Year;
    const deliveryId = deliveryData?.Id;
    const trackingNumber = deliveryData?.RefTrackingNumber;
    const paymentStatus = deliveryData?.Status;

    const inspectionStatus = 'InspectedPR';

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

    if (itemsToMarkInspected.length !== totalItemsInPR) {
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

    if (paymentStatus?.toLowerCase() === 'inspection on hold') {
      showMessage({
        message: 'Action Not Allowed',
        description:
          'Delivery is currently "Inspection On Hold". Please resolve before inspecting.',
        type: 'info',
        icon: 'info',
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
          onPress: async () => {
            try {
              const payload = {
                year: deliveryYear,
                deliveryId: deliveryId,
                trackingNumber: trackingNumber,
                inspectionStatus: inspectionStatus,
              };
              const result = await inspectItems(payload); // Await the mutation
              showMessage({
                message: 'Inspection Successful',
                description:
                  result?.message || 'Selected items marked as Inspected.',
                type: 'success',
                icon: 'success',
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                floating: true,
                duration: 3000,
              });
              setCheckedItems({}); // Clear checked items after successful inspection
              refetch(); // Refetch data to update UI
            } catch (error) {
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
            }
          },
        },
      ],
      {cancelable: false},
    );
  }, [checkedItems, prItems, deliveryData, inspectItems, refetch]);

  const handleOnHold = useCallback(() => {
    const itemsToMarkInspected = Object.keys(checkedItems).filter(
      key => checkedItems[key],
    );
    const totalItemsInPR = Array.isArray(prItems) ? prItems.length : 0;

    const deliveryYear = deliveryData?.Year;
    const deliveryId = deliveryData?.Id;
    const trackingNumber = deliveryData?.RefTrackingNumber;
    const paymentStatus = deliveryData?.Status;

    const inspectionStatus = 'OnHoldPR';

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

    if (itemsToMarkInspected.length !== totalItemsInPR) {
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

    if (paymentStatus?.toLowerCase() === 'inspection on hold') {
      showMessage({
        message: 'Action Not Allowed',
        description:
          'Delivery is currently "Inspection On Hold". Please resolve before inspecting.',
        type: 'info',
        icon: 'info',
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

    Alert.alert(
      'Confirm Inspection',
      `Mark ${itemsToMarkInspected.length} item(s) as "Inspection On Hold"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const payload = {
                year: deliveryYear,
                deliveryId: deliveryId,
                trackingNumber: trackingNumber,
                inspectionStatus: inspectionStatus,
              };
              const result = await inspectItems(payload); // Await the mutation
              showMessage({
                message: 'Inspection On Hold Successful',
                description:
                  result?.message ||
                  'Selected items marked as Inspection On Hold.',
                type: 'success',
                icon: 'success',
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                floating: true,
                duration: 3000,
              });
              setCheckedItems({}); // Clear checked items after successful inspection
              refetch(); // Refetch data to update UI
            } catch (error) {
              console.error('Error marking as inspected:', error);
              showMessage({
                message: 'Inspection On Hold Failed',
                description:
                  error.message ||
                  'Failed to mark items as Inspection On Hold.',
                type: 'danger',
                icon: 'danger',
                backgroundColor: '#D32F2F',
                color: '#FFFFFF',
                floating: true,
                duration: 3000,
              });
            }
          },
        },
      ],
      {cancelable: false},
    );
  }, [checkedItems, prItems, deliveryData, inspectItems, refetch]);

  const handleRevert = useCallback(() => {
    const itemsToMarkInspected = Object.keys(checkedItems).filter(
      key => checkedItems[key],
    );
    const totalItemsInPR = Array.isArray(prItems) ? prItems.length : 0;

    const deliveryYear = deliveryData?.Year;
    const deliveryId = deliveryData?.Id;
    const trackingNumber = deliveryData?.RefTrackingNumber;
    const paymentStatus = deliveryData?.Status;

    const inspectionStatus = 'RevertPR';

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

    if (itemsToMarkInspected.length !== totalItemsInPR) {
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

    Alert.alert(
      'Confirm Inspection',
      `Mark ${itemsToMarkInspected.length} item(s) to Revert"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const payload = {
                year: deliveryYear,
                deliveryId: deliveryId,
                trackingNumber: trackingNumber,
                inspectionStatus: inspectionStatus,
              };
              const result = await inspectItems(payload); // Await the mutation
              showMessage({
                message: 'Reverted Successful',
                description:
                  result?.message || 'Selected items marked to Revert.',
                type: 'success',
                icon: 'success',
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                floating: true,
                duration: 3000,
              });
              setCheckedItems({}); // Clear checked items after successful inspection
              refetch(); // Refetch data to update UI
            } catch (error) {
              console.error('Error to revert:', error);
              showMessage({
                message: 'Reverted Failed',
                description: error.message || 'Failed to Revert.',
                type: 'danger',
                icon: 'danger',
                backgroundColor: '#D32F2F',
                color: '#FFFFFF',
                floating: true,
                duration: 3000,
              });
            }
          },
        },
      ],
      {cancelable: false},
    );
  }, [checkedItems, prItems, deliveryData, inspectItems, refetch]);

  const getSelectedPRItemIndexes = useCallback(() => {
    return Object.keys(checkedItems).filter(key => checkedItems[key]);
  }, [checkedItems]);

  const renderDeliveryDetails = () => {
    if (!deliveryData) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="barcode" // Changed from "calendar" to "barcode"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Purchase Request Tracking Number" // Updated accessibility label
            />
            <Text style={styles.detailLabel}>PR TN:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.RefTrackingNumber}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="calendar"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Scheduled Delivery Date"
            />
            <Text style={styles.detailLabel}>Scheduled Delivery:</Text>
            <Text style={styles.detailValue}>
              {formatDisplayDateTime(deliveryData.DeliveryDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="map-marker"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Delivery Address"
            />
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.Address || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="account"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Contact Person"
            />
            <Text style={styles.detailLabel}>Contact Person:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.ContactPerson || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="phone"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Contact Number"
            />
            <Text style={styles.detailLabel}>Contact Number:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.ContactNumber || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="list-status" // Changed from "phone" to "list-status"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Status" // Updated accessibility label
            />
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.Status || 'N/A'}
            </Text>
          </View>

          {deliveryData.DateInspected && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcon
                name="phone"
                size={20}
                color="#607D8B"
                style={styles.iconStyle}
                accessibilityLabel="Contact Number"
              />
              <Text style={styles.detailLabel}>Date Inspected:</Text>
              <Text style={styles.detailValue}>
                {deliveryData.DateInspected}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPRItems = () => {
    if (!prItems || prItems.length === 0) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>PR Items</Text>
          <TouchableOpacity
            onPress={handleCheckAllToggle}
            style={styles.checkAllButton}>
            <Text style={styles.checkAllButtonText}>
              {allChecked ? 'Uncheck All' : 'Check All'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          {prItems.map((item, index) => (
            <PRItem
              key={item.Id || index} // Keep key as item.Id for stable list rendering if IDs are unique, otherwise index
              item={item}
              index={index}
              isChecked={!!checkedItems[index]} // Pass checked status based on index
              onToggle={handleItemToggle} // Pass toggle handler
            />
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a508c" />
        <Text style={styles.loadingText}>Loading inspection details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error fetching details: {error.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#1a508c"
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{width: 24}} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} // Pass the refreshing state
            onRefresh={onRefresh} // Pass the onRefresh callback
            tintColor="#1a508c" // Optional: customize the spinner color for iOS
            colors={['#1a508c']} // Optional: customize the spinner color for Android
          />
        }>
        {renderDeliveryDetails()}
        {renderPRItems()}
      </ScrollView>

      <View style={styles.fabContainer}>
        {showFabButtons && (
          <>
            {deliveryData.Status.toLowerCase() === 'for inspection' ||
            deliveryData.Status.toLowerCase() === 'inspection on hold' ? (
              <TouchableOpacity
                style={[styles.fab, styles.fabSmall]}
                onPress={handleInspected}
                disabled={isInspecting}>
                {isInspecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon
                    name="checkmark-done-circle-outline"
                    size={24}
                    color={'#fff'}
                  />
                )}
                <Text style={styles.fabText}>
                  {isInspecting ? 'Inspecting...' : 'Inspected'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {deliveryData.Status.toLowerCase() === 'for inspection' ? (
              <TouchableOpacity
                style={[styles.fab, styles.fabSmall]}
                onPress={handleOnHold}>
                <Icon name="pause-circle-outline" size={24} color={'#fff'} />
                <Text style={styles.fabText}>On Hold</Text>
              </TouchableOpacity>
            ) : null}
            {deliveryData.Status.toLowerCase() === 'inspection on hold' ||
            deliveryData.Status.toLowerCase() === 'inspected' ? (
              <TouchableOpacity
                style={[styles.fab, styles.fabSmall]}
                onPress={handleRevert}>
                <Icon name="arrow-undo-outline" size={24} color={'#fff'} />
                <Text style={styles.fabText}>Revert</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowFabButtons(!showFabButtons)}>
          <Icon
            name={showFabButtons ? 'close' : 'add'}
            size={30}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a508c',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1, // Added to center the title if there's space
    textAlign: 'center', // Centering the title
  },
  backButton: {
    padding: 5,
  },
  scrollViewContent: {
    paddingBottom: 100, // Adjusted padding to prevent FAB from obscuring content
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitleContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a508c',
    textAlign: 'left',
  },
  checkAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
  },
  checkAllButtonText: {
    fontSize: 14,
    color: '#1a508c',
    fontWeight: '600',
  },
  cardBody: {
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#495057',
    marginRight: 10,
    width: 100,
  },
  detailValue: {
    color: '#212529',
    flex: 1,
    textAlign: 'left',
  },
  iconStyle: {
    marginRight: 10,
    marginTop: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    flexDirection: 'row',
    backgroundColor: '#1a508c',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  fabSmall: {
    width: 120,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    paddingHorizontal: 10, // Added padding for text
    justifyContent: 'space-around', // Distribute space
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5, // Space between icon and text
  },
});

// Styles specific to PRItem component
const prItemStyles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContainerChecked: {
    borderColor: '#1a508c',
    borderWidth: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIndex: {
    fontWeight: 'bold',
    color: '#1a508c',
    fontSize: 16,
  },
  headerRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  quantityPriceHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  checkboxContainer: {
    padding: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: '400',
    color: '#495057',
    marginRight: 10,
    width: 100,
  },
  detailValue: {
    color: '#212529',
    flex: 1,
    textAlign: 'left',
    fontWeight: '500',
  },
  multiline: {
    textAlign: 'left',
  },
  showMoreLessButton: {
    color: '#1a508c',
    marginTop: 5,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: '#eaf4ff',
  },
});

export default AdvanceInspectionDetails;
