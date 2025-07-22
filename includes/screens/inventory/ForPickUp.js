import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import IssueStatusModal from './IssueStatusModal';
import { useRequests, useSubmitCompleteRequest } from '../../hooks/useInventory'; // Changed hook to useSubmitCompleteRequest
import { Shimmer } from '../../utils/useShimmer';

export default function ForPickup({ navigation }) {
  // Fetch requests data, filtering for 'For Pickup' status
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useRequests();

  // Initialize the useSubmitCompleteRequest hook for completing pickup
  const {
    mutate: submitCompleteRequest,
    isLoading: isCompleting,
    isSuccess: isCompleteSuccess,
    isError: isCompleteError,
    error: completeError,
    reset: resetCompleteStatus,
  } = useSubmitCompleteRequest();

  const [forPickupItems, setForPickupItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Changed to selectedItem
  const [issueStatusModalVisible, setIssueStatusModalVisible] = useState(false);
  const [issueStatus, setIssueStatus] = useState('');
  const [issueMessage, setIssueMessage] = useState('');

  useEffect(() => {
    if (requestsData) {
      // Filter requests to only show those with 'For Pickup' status
      const filteredItems = requestsData.filter(
        (request) => request.Status.toLowerCase() === 'forpickup'
      );
      setForPickupItems(filteredItems);
    }
  }, [requestsData]);

  // Handle the outcome of the submitCompleteRequest mutation
  useEffect(() => {
    if (isCompleteSuccess) {
      // Filter out the completed request from the local state
      setForPickupItems((prevItems) =>
        prevItems.filter((item) => item.Id !== selectedItem?.Id) // Added optional chaining
      );

      setIssueStatus('success');
      setIssueMessage(
        `"${selectedItem?.Item}" (Qty: ${selectedItem?.Qty}) has been successfully picked up by ${selectedItem?.Name}.` // Added optional chaining
      );
      setIssueStatusModalVisible(true);
      resetCompleteStatus(); // Reset the mutation status after showing message
    } else if (isCompleteError) {
      setIssueStatus('error');
      setIssueMessage(
        `Failed to complete pickup for "${selectedItem?.Item}". Error: ${completeError?.message || 'Unknown error'}. Please try again.` // Added optional chaining
      );
      setIssueStatusModalVisible(true);
      resetCompleteStatus(); // Reset the mutation status after showing message
    }
  }, [isCompleteSuccess, isCompleteError, completeError, selectedItem, resetCompleteStatus]);


  const handleCompletePickup = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const closeConfirmationModal = () => {
    setIsModalVisible(false);
    // Do NOT set selectedItem to null here.
    // It needs to be available for the useEffect that listens to `isCompleteSuccess`/`isCompleteError`.
  };

  const handleCloseIssueStatusModal = () => {
    setIssueStatusModalVisible(false);
    // Now that the status modal is closed, it's safe to clear selectedItem
    setSelectedItem(null);
  };

  const confirmPickupCompletion = () => {
    closeConfirmationModal(); // Close the confirmation modal first

    if (selectedItem) {
      // Call the completeRequest mutation
      console.log('Completing pickup for item:', selectedItem);
      submitCompleteRequest({
        requestId: selectedItem.Id, // Assuming 'Id' is the unique ID for the request
        // You might need to pass other details required by your backend for completion
      });
    }
  };

  const renderForPickupItem = useCallback(
    ({ item }) => (
      <View style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
            {item.Item}
          </Text>
          <Text
            style={[
              styles.statusBadge,
              styles.statusForPickup, // Always 'For Pickup' for this component
            ]}>
            {item.Status}
          </Text>
        </View>

        <View style={styles.requestDetails}>
            <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Requestor </Text>
            <Text style={styles.infoValue}>{item.Name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="finger-print-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Employee No </Text>
            <Text style={styles.infoValue}>{item.EmployeeNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Tracking No </Text>
            <Text style={styles.infoValue}>{item.TrackingNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="counter" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Quantity </Text>
            <Text style={styles.infoValue}>{item.Qty} {item.Units}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Date Issued </Text>
            <Text style={styles.infoValue}>{item.DateIssued || 'N/A'}</Text>
          </View>
            <View style={styles.infoRow}>
            <Ionicons name="chatbox-ellipses-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Reason </Text>
            <Text style={styles.infoValue}>{item.Reason}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.completeButton} // Changed style to completeButton
          onPress={() => handleCompletePickup(item)}
          disabled={isCompleting && selectedItem?.Id === item.Id} // Disable only the current item being processed
        >
          <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
          <Text style={styles.completeButtonText}>
            {isCompleting && selectedItem?.Id === item.Id ? 'Completing...' : 'Complete Pickup'}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [isCompleting, selectedItem, handleCompletePickup],
  );

  const ShimmerRequestCardPlaceholder = () => (
    <View style={[styles.requestCard, styles.shimmerCard]}>
      <Shimmer style={styles.shimmerTitle} />
      <Shimmer style={styles.shimmerStatus} />
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.shimmerInfoRow}>
          <Shimmer style={styles.shimmerIcon} />
          <Shimmer style={styles.shimmerText} />
        </View>
      ))}
      <Shimmer style={styles.shimmerButton} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
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
        <Text style={styles.headerTitle}>For Pickup</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {requestsLoading ? (
        <FlashList
          data={[1, 2, 3]}
          renderItem={ShimmerRequestCardPlaceholder}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={260}
        />
      ) : requestsError ? (
        <View style={styles.emptyListContainer}>
          <Ionicons name="warning-outline" size={80} color="#ff6b6b" />
          <Text style={styles.emptyListText}>Failed to load items</Text>
          <Text style={styles.emptyListSubText}>
            Please check your connection and try again
          </Text>
        </View>
      ) : forPickupItems.length > 0 ? (
        <FlashList
          data={forPickupItems}
          renderItem={renderForPickupItem}
          keyExtractor={(item) => item.Id.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={260}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <Ionicons name="cube-outline" size={80} color="#bbb" />
          <Text style={styles.emptyListText}>No items currently for pickup</Text>
          <Text style={styles.emptyListSubText}>All clear!</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        statusBarTranslucent={true}
        onRequestClose={closeConfirmationModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirm Pickup</Text>
            <Text style={styles.modalItemDetail}>
              Are you sure you want to mark{' '}
              <Text style={styles.modalHighlightText}>
                "{selectedItem?.Item}" (Qty: {selectedItem?.Qty})
              </Text>{' '}
              as picked up by{' '}
              <Text style={styles.modalHighlightText}>
                {selectedItem?.Name}
              </Text>
              ?
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={closeConfirmationModal}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonConfirm]}
                onPress={confirmPickupCompletion}
                disabled={isCompleting}
              >
                <Text style={styles.textStyle}>
                  {isCompleting ? 'Confirming...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <IssueStatusModal
        visible={issueStatusModalVisible}
        status={issueStatus}
        message={issueMessage}
        onClose={handleCloseIssueStatusModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    //textAlign: 'center',
    flex: 1,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#1A508C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    flex: 1,
    letterSpacing: 0.2,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // New status style for 'For Pickup'
  statusForPickup: {
    backgroundColor: '#FFF3E0', // Light orange/yellow background
    color: '#FF9800', // Orange text
    borderWidth: 1,
    borderColor: '#FFCC80', // Slightly darker orange border
  },
  requestDetails: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  infoIcon: {
    marginRight: 12,
    color: '#1A508C',
  },
  infoLabel: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  infoValue: {
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'right',
  },
  completeButton: { // Changed from issueButton
    backgroundColor: '#28a745', // Green color for completion
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 15,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: { // Changed from issueButtonText
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A508C',
  },
  modalItemDetail: {
    fontSize: 17,
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  modalHighlightText: {
    fontWeight: 'bold',
    color: '#1A508C',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 14,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonCancel: {
    backgroundColor: '#dc3545',
  },
  buttonConfirm: {
    backgroundColor: '#28a745',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  // Shimmer styles (unchanged from Requests.js)
  shimmerCard: {
    height: 260,
    justifyContent: 'flex-start',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  shimmerTitle: {
    height: 20,
    width: '70%',
    borderRadius: 4,
    marginBottom: 16,
  },
  shimmerStatus: {
    height: 16,
    width: 80,
    borderRadius: 8,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  shimmerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shimmerIcon: {
    height: 16,
    width: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  shimmerText: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
  shimmerButton: {
    height: 40,
    width: 120,
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginTop: 15,
  },
});