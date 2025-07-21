import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import IssueStatusModal from './IssueStatusModal';
import { useRequests, useSubmitApproveRequest } from '../../hooks/useInventory'; // Import useSubmitApproveRequest
import { Shimmer } from '../../utils/useShimmer';

export default function Requests({ navigation }) {
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useRequests();

  // Initialize the useSubmitApproveRequest hook
  const {
    mutate: submitApproveRequest,
    isLoading: isApproving,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    error: approveError,
    reset: resetApproveStatus, 
  } = useSubmitApproveRequest(); 

  const [requests, setRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [issueStatusModalVisible, setIssueStatusModalVisible] = useState(false);
  const [issueStatus, setIssueStatus] = useState('');
  const [issueMessage, setIssueMessage] = useState('');

  useEffect(() => {
    if (requestsData) {
      setRequests(requestsData);
    }
  }, [requestsData]);

  // Handle the outcome of the submitApproveRequest mutation
  // useEffect(() => {
  //   if (isApproveSuccess) {
  //     // Filter out the approved request from the local state
  //     setRequests((prevRequests) =>
  //       prevRequests.filter((req) => req.Id !== selectedRequest.Id) // Use .Id as per your data structure
  //     );

  //     // Navigate to ForPickUp screen
  //     navigation.navigate('ForPickUp', {
  //       issuedItem: {
  //         id: selectedRequest.Id, // Use .Id
  //         itemName: selectedRequest.Item,
  //         quantity: issueQty,
  //         requestor: selectedRequest.Name,
  //         employee: selectedRequest.Name, // Assuming requestor is also the employee for pickup
  //         trackingNumber: selectedRequest.TrackingNumber,
  //         employeeNumber: selectedRequest.EmployeeNumber,
  //       },
  //     });

  //     setIssueStatus('success'); //
  //     setIssueMessage(
  //       `"${selectedRequest.Item}" (Qty: ${issueQty}) has been successfully issued to ${selectedRequest.Name}.`
  //     );
  //     setIssueStatusModalVisible(true);
  //     resetApproveStatus(); // Reset the mutation status after showing message
  //   } else if (isApproveError) {
  //     setIssueStatus('error'); //
  //     setIssueMessage(
  //       `Failed to issue "${selectedRequest.Item}". Error: ${approveError?.message || 'Unknown error'}. Please try again.`
  //     );
  //     setIssueStatusModalVisible(true);
  //     resetApproveStatus(); // Reset the mutation status after showing message
  //   }
  // }, [isApproveSuccess, isApproveError, approveError, selectedRequest, issueQty, navigation, resetApproveStatus]);

  const handleIssueItem = (request) => {
    setSelectedRequest(request);
    setIssueQty(parseInt(request.Qty, 10));
    setIsModalVisible(true);
  };

  const incrementQty = () => {
    if (selectedRequest && issueQty < parseInt(selectedRequest.Qty, 10)) {
      setIssueQty((prevQty) => prevQty + 1);
    }
  };

  const decrementQty = () => {
    if (issueQty > 1) {
      setIssueQty((prevQty) => prevQty - 1);
    }
  };

  const closeIssueSelectionModal = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
    setIssueQty(1);
  };

  const handleCloseIssueStatusModal = () => {
    setIssueStatusModalVisible(false);
  };

  const confirmIssue = () => {
    closeIssueSelectionModal(); // Close the selection modal first

    if (selectedRequest) {
      // Call the approveRequest mutation
      console.log('Issuing request:', selectedRequest);
      submitApproveRequest({
        requestId: selectedRequest.Id, // Assuming 'Id' is the unique ID for the request
        itemId: selectedRequest.ItemId, // Make sure your request object has an ItemId
        invId: selectedRequest.InvId,
        approvedQty: issueQty,

        // You might need to pass other details required by your backend for approval
        // e.g., trackingNumber: selectedRequest.TrackingNumber, employeeNumber: selectedRequest.EmployeeNumber
      });
    }
  };

  const renderRequestItem = useCallback(
    ({ item }) => (
      <View style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
            {item.Item}
          </Text>
          <Text
            style={[
              styles.statusBadge,
              item.Status === 'Pending' ? styles.statusPending : styles.statusIssued,
            ]}>
            {item.Status}
          </Text>
        </View>

        <View style={styles.requestDetails}>
           <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Requestor:</Text>
            <Text style={styles.infoValue}>{item.Name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="finger-print-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Employee No:</Text>
            <Text style={styles.infoValue}>{item.EmployeeNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Tracking No:</Text>
            <Text style={styles.infoValue}>{item.TrackingNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="counter" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Requested Qty:</Text>
            <Text style={styles.infoValue}>{item.Qty} {item.Units}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{item.DateRequested}</Text>
          </View>
           <View style={styles.infoRow}>
            <Ionicons name="chatbox-ellipses-outline" size={18} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Reason:</Text>
            <Text style={styles.infoValue}>{item.Reason}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.issueButton}
          onPress={() => handleIssueItem(item)}
          disabled={isApproving && selectedRequest?.Id === item.Id} // Disable only the current item being processed
        >
          <MaterialCommunityIcons name="send-check-outline" size={18} color="#fff" />
          <Text style={styles.issueButtonText}>
            {isApproving && selectedRequest?.Id === item.Id ? 'Issuing...' : 'Issue Item'}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [isApproving, selectedRequest, handleIssueItem], // Add isApproving and selectedRequest to useCallback dependencies
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
        <Text style={styles.headerTitle}>Inventory Requests</Text>
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
          <Text style={styles.emptyListText}>Failed to load requests</Text>
          <Text style={styles.emptyListSubText}>
            Please check your connection and try again
          </Text>
        </View>
      ) : requests.length > 0 ? (
        <FlashList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.Id.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={260}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <Ionicons name="cube-outline" size={80} color="#bbb" />
          <Text style={styles.emptyListText}>No pending requests</Text>
          <Text style={styles.emptyListSubText}>All clear!</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        statusBarTranslucent={true}
        onRequestClose={closeIssueSelectionModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Issue Item</Text>
            <Text style={styles.modalItemDetail}>
              Issuing:{' '}
              <Text style={styles.modalHighlightText}>
                "{selectedRequest?.Item}"
              </Text>
            </Text>

            <View style={styles.qtyControlsContainer}>
              <Text style={styles.qtyLabel}>Quantity to Issue</Text>
              <View style={styles.qtyInputContainer}>
                <TouchableOpacity
                  style={[styles.qtyButton, issueQty <= 1 && styles.qtyButtonDisabled]}
                  onPress={decrementQty}
                  disabled={issueQty <= 1}>
                  <Text style={[styles.qtyButtonText, issueQty <= 1 && styles.qtyButtonTextDisabled]}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyDisplay}>{issueQty}</Text>
                <TouchableOpacity
                  style={[styles.qtyButton, issueQty >= parseInt(selectedRequest?.Qty, 10) && styles.qtyButtonDisabled]}
                  onPress={incrementQty}
                  disabled={issueQty >= parseInt(selectedRequest?.Qty, 10)}>
                  <Text style={[styles.qtyButtonText, issueQty >= parseInt(selectedRequest?.Qty, 10) && styles.qtyButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.qtyMaxText}>Max: {selectedRequest?.Qty} {selectedRequest?.Units || ''}</Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={closeIssueSelectionModal}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonConfirm]}
                onPress={confirmIssue}
                disabled={isApproving} // Disable confirm button while approving
              >
                <Text style={styles.textStyle}>
                  {isApproving ? 'Confirming...' : 'Confirm'}
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
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
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
  statusPending: {
    backgroundColor: '#FFF9E6',
    color: '#E6A700',
    borderWidth: 1,
    borderColor: '#FFE999',
  },
  statusIssued: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  requestDetails: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    // Add justifyContent to push label left and value right
    justifyContent: 'space-between',
  },
  infoIcon: {
    marginRight: 12,
    color: '#1A508C',
  },
  infoLabel: { // New style for the label part
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    // No flex: 1 here, let it take its natural width
  },
  infoValue: {
    fontWeight: '600',
    color: '#222',
    // Removed marginLeft as justifyContent handles spacing
    flex: 1, // Take up remaining space
    textAlign: 'right', // Align text to the right
  },
  issueButton: {
    backgroundColor: '#1A508C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 15,
    shadowColor: '#1A508C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  issueButtonText: {
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
  qtyControlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  qtyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  qtyButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  qtyButtonDisabled: {
    opacity: 0.5,
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  qtyButtonTextDisabled: {
    color: '#999',
  },
  qtyDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#1A508C',
    minWidth: 40,
    textAlign: 'center',
  },
  qtyMaxText: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
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
  // Shimmer styles (unchanged)
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