import React, {useState, useEffect, useCallback} from 'react';
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
import {FlashList} from '@shopify/flash-list';
import IssueStatusModal from './IssueStatusModal';
// Assuming you have a separate hook for disapproval, or if useSubmitApproveRequest can handle both
import {useRequests, useSubmitApproveRequest, useSubmitDisapproveRequest} from '../../hooks/useInventory';
import {Shimmer} from '../../utils/useShimmer';
import useUserInfo from '../../api/useUserInfo';

// Placeholder for a disapproval hook.
// You might need to create this in your useInventory.js
// Or modify useSubmitApproveRequest to handle 'disapprove' status.
// For now, let's assume a new hook.

export default function Requests({navigation}) {
  const {officeAdmin} = useUserInfo();
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
    refetch: refetchRequests, // Added refetch to update list after actions
  } = useRequests();

  const {
    mutate: submitApproveRequest,
    isLoading: isApproving,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    error: approveError,
    reset: resetApproveStatus,
  } = useSubmitApproveRequest();

  // New hook for disapproving requests
  const {
    mutate: submitDisapproveRequest,
    isLoading: isDisapproving,
    isSuccess: isDisapproveSuccess,
    isError: isDisapproveError,
    error: disapproveError,
    reset: resetDisapproveStatus,
  } = useSubmitDisapproveRequest();

  const [requests, setRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // For Issue
  const [isDisapproveModalVisible, setIsDisapproveModalVisible] = useState(false); // For Disapprove
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [issueStatusModalVisible, setIssueStatusModalVisible] = useState(false);
  const [issueStatus, setIssueStatus] = useState('');
  const [issueMessage, setIssueMessage] = useState('');
  const [disapproveReason, setDisapproveReason] = useState(''); // State for disapproval reason

  useEffect(() => {
    if (requestsData) {
      const filteredItems = requestsData.filter(
        request => request.Status.toLowerCase() === 'pending',
      );
      setRequests(filteredItems);
    }
  }, [requestsData]);

  // useEffect(() => {
  //   // This effect runs when the approval status changes
  //   if (isApproveSuccess) {
  //     setRequests(
  //       prevRequests => prevRequests.filter(req => req.Id !== selectedRequest?.Id),
  //     );
  //     navigation.navigate('ForPickUp', {
  //       issuedItem: {
  //         id: selectedRequest?.Id,
  //         itemName: selectedRequest?.Item,
  //         quantity: issueQty,
  //         requestor: selectedRequest?.Name,
  //         employee: selectedRequest?.Name,
  //         trackingNumber: selectedRequest?.TrackingNumber,
  //         employeeNumber: selectedRequest?.EmployeeNumber,
  //       },
  //     });
  //     setIssueStatus('success');
  //     setIssueMessage(
  //       `"${selectedRequest?.Item}" (Qty: ${issueQty}) has been successfully issued to ${selectedRequest?.Name}.`,
  //     );
  //     setIssueStatusModalVisible(true);
  //     resetApproveStatus();
  //     setSelectedRequest(null); // Clear selectedRequest after successful action
  //     refetchRequests(); // Refetch requests to ensure the list is up-to-date
  //   } else if (isApproveError) {
  //     setIssueStatus('error');
  //     setIssueMessage(
  //       `Failed to issue "${selectedRequest?.Item}". Error: ${
  //         approveError?.message || 'Unknown error'
  //       }. Please try again.`,
  //     );
  //     setIssueStatusModalVisible(true);
  //     resetApproveStatus();
  //     setSelectedRequest(null); // Clear selectedRequest even on error
  //   }
  // }, [
  //   isApproveSuccess,
  //   isApproveError,
  //   approveError,
  //   selectedRequest,
  //   issueQty,
  //   navigation,
  //   resetApproveStatus,
  //   refetchRequests, // Add refetchRequests to dependencies
  // ]);

  useEffect(() => {
    // New effect for disapproval status
    if (isDisapproveSuccess) {
      setRequests(
        prevRequests => prevRequests.filter(req => req.Id !== selectedRequest?.Id),
      );
      setIssueStatus('success'); // Reusing issueStatus for general action feedback
      setIssueMessage(
        `Request for "${selectedRequest?.Item}" by ${selectedRequest?.Name} has been successfully disapproved.`,
      );
      setIssueStatusModalVisible(true);
      resetDisapproveStatus();
      setSelectedRequest(null); // Clear selectedRequest after successful action
      refetchRequests(); // Refetch requests
    } else if (isDisapproveError) {
      setIssueStatus('error');
      setIssueMessage(
        `Failed to disapprove "${selectedRequest?.Item}". Error: ${
          disapproveError?.message || 'Unknown error'
        }. Please try again.`,
      );
      setIssueStatusModalVisible(true);
      resetDisapproveStatus();
      setSelectedRequest(null); // Clear selectedRequest even on error
    }
  }, [
    isDisapproveSuccess,
    isDisapproveError,
    disapproveError,
    selectedRequest,
    resetDisapproveStatus,
    refetchRequests,
  ]);

  const handleIssueItem = request => {
    setSelectedRequest(request);
    setIssueQty(parseInt(request.Qty, 10));
    setIsModalVisible(true);
  };

  const handleDisapproveItem = request => {
    setSelectedRequest(request);
    setDisapproveReason(''); // Clear previous reason
    setIsDisapproveModalVisible(true);
  };

  const incrementQty = () => {
    if (selectedRequest && issueQty < parseInt(selectedRequest.Qty, 10)) {
      setIssueQty(prevQty => prevQty + 1);
    }
  };

  const decrementQty = () => {
    if (issueQty > 1) {
      setIssueQty(prevQty => prevQty - 1);
    }
  };

  const closeIssueSelectionModal = () => {
    setIsModalVisible(false);
    setIssueQty(1);
    // Do NOT set selectedRequest to null here.
    // It needs to be available for the useEffect that listens to `isApproveSuccess`/`isApproveError`.
  };

  const closeDisapproveModal = () => {
    setIsDisapproveModalVisible(false);
    setDisapproveReason('');
  };

  const handleCloseIssueStatusModal = () => {
    setIssueStatusModalVisible(false);
    setSelectedRequest(null); 
  };

 const confirmIssue = () => {
  closeIssueSelectionModal();

  if (selectedRequest) {
    submitApproveRequest(
      {
        requestorName: selectedRequest.Name,
        requestor: selectedRequest.EmployeeNumber,
        year: selectedRequest.Year,
        tn: selectedRequest.TrackingNumber,
        requestId: selectedRequest.Id,
        itemId: selectedRequest.ItemId,
        item: selectedRequest.Item,
        unit: selectedRequest.Units,
        invId: selectedRequest.InvId,
        approvedQty: selectedRequest.Qty,
        remarks: selectedRequest.Reason,
      },
      {
        onSuccess: data => {
          if (data.status === 'success') {
            setRequests(prevRequests =>
              prevRequests.filter(req => req.Id !== selectedRequest?.Id),
            );

            navigation.navigate('ForPickUp', {
              issuedItem: {
                id: selectedRequest?.Id,
                itemName: selectedRequest?.Item,
                quantity: selectedRequest.Qty,
                requestor: selectedRequest?.Name,
                employee: selectedRequest?.Name,
                trackingNumber: selectedRequest?.TrackingNumber,
                employeeNumber: selectedRequest?.EmployeeNumber,
              },
            });

            setIssueStatus('success');
            setIssueMessage(
              `"${selectedRequest?.Item}" (Qty: ${selectedRequest?.Qty}) has been successfully issued to ${selectedRequest?.Name}.`,
            );
            setIssueStatusModalVisible(true);

            resetApproveStatus();
            setSelectedRequest(null);
            refetchRequests();
          } else {
            setIssueStatus('error');
            setIssueMessage(data.message || 'An unknown error occurred. Please try again.');
            setIssueStatusModalVisible(true);

            resetApproveStatus();
            setSelectedRequest(null);
          }
        },
        onError: error => {
          // This block runs only for true network/server errors (e.g., 500 status code)
          console.error('Network or server error:', error);
          setIssueStatus('error');
          setIssueMessage(
            `Failed to issue "${selectedRequest?.Item}". Error: ${
              error?.message || 'Unknown network error'
            }. Please try again.`,
          );
          setIssueStatusModalVisible(true);

          resetApproveStatus();
          setSelectedRequest(null);
        },
      },
    );
  }
};
  const confirmDisapprove = () => {
    closeDisapproveModal();

    if (selectedRequest) {
      console.log('Disapproving request:', selectedRequest);
      submitDisapproveRequest({
        requestId: selectedRequest.Id,
        trackingNumber: selectedRequest.TrackingNumber,
        reason: disapproveReason, // Pass the reason for disapproval
        // Add any other necessary fields for your disapproval API
      });
    }
  };

  const renderRequestItem = useCallback(
    ({item}) => (
      <View style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
            {item.Item}
          </Text>
          <Text
            style={[
              styles.statusBadge,
              item.Status === 'Pending'
                ? styles.statusPending
                : styles.statusIssued,
            ]}>
            {item.Status}
          </Text>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Requestor:</Text>
            <Text style={styles.infoValue}>{item.Name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="finger-print-outline"
              size={18}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Employee No:</Text>
            <Text style={styles.infoValue}>{item.EmployeeNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="barcode-outline"
              size={18}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Tracking No:</Text>
            <Text style={styles.infoValue}>{item.TrackingNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="counter"
              size={18}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Requested Qty:</Text>
            <Text style={styles.infoValue}>
              {item.Qty} {item.Units}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{item.DateRequested}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={18}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Reason:</Text>
            <Text style={styles.infoValue}>{item.Reason}</Text>
          </View>
        </View>

        {officeAdmin === '1' && (
          <View style={styles.buttonGroup}> 
            <TouchableOpacity
              style={[
                styles.actionButton, // Use a generic style for both buttons
                styles.approveButton,
                (isApproving && selectedRequest?.Id === item.Id) && styles.actionButtonDisabled,
              ]}
              onPress={() => handleIssueItem(item)}
              disabled={isApproving && selectedRequest?.Id === item.Id}>
              <MaterialCommunityIcons
                name="thumb-up"
                size={18}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {isApproving && selectedRequest?.Id === item.Id
                  ? 'Issuing...'
                  : 'Issue Request'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton, // Use generic style
                styles.disapproveButton, // Specific style for disapprove
                (isDisapproving && selectedRequest?.Id === item.Id) && styles.actionButtonDisabled,
              ]}
              onPress={() => handleDisapproveItem(item)}
              disabled={isDisapproving && selectedRequest?.Id === item.Id}>
              <MaterialCommunityIcons
                name="thumb-down-outline" // Changed icon for disapprove
                size={18}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {isDisapproving && selectedRequest?.Id === item.Id
                  ? 'Disapproving...'
                  : 'Disapprove Request'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [isApproving, isDisapproving, selectedRequest, handleIssueItem, handleDisapproveItem],
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
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
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
        <Text style={styles.headerTitle}>Requests</Text>
        <View style={{width: 40}} />
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
          keyExtractor={item => item.Id.toString()}
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

      {/* Modal for Issuing Item */}
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
            <Text style={styles.modalItemDetail}>
              To:{' '}
              <Text style={styles.modalHighlightText}>
                "{selectedRequest?.Name}"
              </Text>
            </Text>
            <Text style={styles.modalItemDetail}>
              Qty:{' '}
              <Text style={styles.modalHighlightText}>
                "{selectedRequest?.Qty} {selectedRequest?.Units}"
              </Text>
            </Text>
            {/* <View style={styles.qtyControlsContainer}>
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
            </View> */}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={closeIssueSelectionModal}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonConfirm]}
                onPress={confirmIssue}
                disabled={isApproving}>
                <Text style={styles.textStyle}>
                  {isApproving ? 'Confirming...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Disapproving Item */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDisapproveModalVisible}
        statusBarTranslucent={true}
        onRequestClose={closeDisapproveModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Disapprove Request</Text>
            <Text style={styles.modalItemDetail}>
              Are you sure you want to disapprove the request for:{' '}
              <Text style={styles.modalHighlightText}>
                "{selectedRequest?.Item}"
              </Text>
              {' from '}
              <Text style={styles.modalHighlightText}>
                "{selectedRequest?.Name}"
              </Text>
              ?
            </Text>
            {/* You can add a TextInput here for a reason if needed */}
            {/*
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for disapproval (Optional)"
              value={disapproveReason}
              onChangeText={setDisapproveReason}
              multiline
            />
            */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={closeDisapproveModal}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonDisapproveConfirm]} // New style for disapprove confirm
                onPress={confirmDisapprove}
                disabled={isDisapproving}>
                <Text style={styles.textStyle}>
                  {isDisapproving ? 'Disapproving...' : 'Disapprove'}
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
    shadowOffset: {width: 0, height: 4},
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
    shadowOffset: {width: 0, height: 6},
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
  buttonGroup: { // New style to group buttons
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute buttons horizontally
    marginTop: 15,
  },
  actionButton: { // Generic style for both action buttons
    paddingVertical: 10,
    paddingHorizontal: 15, // Slightly less horizontal padding
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flex: 1, // Make buttons take equal space
    marginHorizontal: 5, // Add some space between them
  },
  approveButton: {
    backgroundColor: '#1A508C',
  },
  disapproveButton: {
    backgroundColor: '#dc3545', // Red color for disapprove
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
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
    shadowOffset: {width: 0, height: 4},
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonCancel: {
    backgroundColor: '#6c757d', // A more neutral grey for cancel
  },
  buttonConfirm: {
    backgroundColor: '#28a745',
  },
  buttonDisapproveConfirm: { // New style for disapprove confirm button
    backgroundColor: '#dc3545',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  reasonInput: { // Style for optional disapproval reason input
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
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