import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import IssueStatusModal from './IssueStatusModal'; // Import the new modal component
import { useRequests } from '../../hooks/useInventory'; // Assuming useRequests fetches data
import { Shimmer } from '../../utils/useShimmer'; // Assuming Shimmer is also available here

export default function Requests({ navigation }) {
  // Destructure data, isLoading, and isError from the useRequests hook
  const { data: requestsData, isLoading: requestsLoading, isError: requestsError } = useRequests();

  // State to hold the requests that will be displayed and filtered
  const [requests, setRequests] = useState([]);

  // Use useEffect to update the requests state when requestsData from the hook changes
  useEffect(() => {
    if (requestsData) {
      setRequests(requestsData);
    }
  }, [requestsData]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [issueQty, setIssueQty] = useState(1);

  const [issueStatusModalVisible, setIssueStatusModalVisible] = useState(false);
  const [issueStatus, setIssueStatus] = useState(''); // 'success' or 'error'
  const [issueMessage, setIssueMessage] = useState('');

  const handleIssueItem = (request) => {
    setSelectedRequest(request);
    // Use request.Qty (uppercase) as per the new data structure
    setIssueQty(parseInt(request.Qty, 10)); // Ensure it's a number
    setIsModalVisible(true);
  };

  const incrementQty = () => {
    // Use selectedRequest.Qty (uppercase)
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
    setSelectedRequest(null);
    setIssueQty(1);
  };

  const handleCloseIssueStatusModal = () => {
    setIssueStatusModalVisible(false);
  };

  const confirmIssue = () => {
    closeIssueSelectionModal();

    const simulatedSuccess = Math.random() > 0.2; // 80% chance of success for demonstration

    if (simulatedSuccess) {
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== selectedRequest.id)
      );

      navigation.navigate('ForPickUp', {
        issuedItem: {
          id: selectedRequest.id,
          // Use selectedRequest.Item as per the new data structure
          itemName: selectedRequest.Item,
          quantity: issueQty,
          // Use selectedRequest.Name as per the new data structure
          requestor: selectedRequest.Name,
          // Use selectedRequest.Name as per the new data structure
          employee: selectedRequest.Name,
          // Use selectedRequest.TrackingNumber as per the new data structure
          trackingNumber: selectedRequest.TrackingNumber,
          // Use selectedRequest.EmployeeNumber as per the new data structure
          employeeNumber: selectedRequest.EmployeeNumber,
        }
      });

      // Use selectedRequest.Item as per the new data structure
      // Use selectedRequest.Name as per the new data structure
      setIssueStatus('success');
      setIssueMessage(`"${selectedRequest.Item}" (Qty: ${issueQty}) has been successfully issued to ${selectedRequest.Name}.`);
    } else {
      // Use selectedRequest.Item as per the new data structure
      setIssueStatus('error');
      setIssueMessage(`Failed to issue "${selectedRequest.Item}". Please try again.`);
    }

    setIssueStatusModalVisible(true);
  };

  // Memoized render function for FlatList items to prevent unnecessary re-renders
  const renderRequestItem = useCallback(({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        {/* Use item.Item as per the new data structure */}
        <Text style={styles.itemName}>{item.Item}</Text>
        {/* Use item.Status as per the new data structure */}
        <Text style={[styles.statusBadge, item.Status === 'Pending' ? styles.statusPending : styles.statusIssued]}>
          {item.Status}
        </Text>
      </View>
      <View style={styles.requestDetails}>
     
        <View style={styles.infoRow}>
          <Ionicons name="barcode-outline" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.TrackingNumber as per the new data structure */}
          <Text style={styles.requestInfo}>Tracking No: <Text style={styles.infoValue}>{item.TrackingNumber}</Text></Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.EmployeeNumber as per the new data structure */}
          <Text style={styles.requestInfo}>Employee No: <Text style={styles.infoValue}>{item.EmployeeNumber}</Text></Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="numeric" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.Qty as per the new data structure */}
          <Text style={styles.requestInfo}>Requested Qty: <Text style={styles.infoValue}>{item.Qty}</Text></Text>
        </View>
           <View style={styles.infoRow}>
          <MaterialCommunityIcons name="numeric" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.Qty as per the new data structure */}
          <Text style={styles.requestInfo}>Units: <Text style={styles.infoValue}>{item.Units}</Text></Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="text-outline" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.Reason as per the new data structure */}
          <Text style={styles.requestInfo}>Reason: <Text style={styles.infoValue}>{item.Reason}</Text></Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="at-outline" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.Name as per the new data structure */}
          <Text style={styles.requestInfo}>Requestor: <Text style={styles.infoValue}>{item.Name}</Text></Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" style={styles.infoIcon} />
          {/* Use item.DateRequested as per the new data structure */}
          <Text style={styles.requestInfo}>Date Requested: <Text style={styles.infoValue}>{item.DateRequested}</Text></Text>
        </View>
       
      </View>
      <TouchableOpacity
        style={styles.issueButton}
        onPress={() => handleIssueItem(item)}
      >
        <MaterialCommunityIcons name="send-check-outline" size={20} color="#fff" />
        <Text style={styles.issueButtonText}>Issue</Text>
      </TouchableOpacity>
    </View>
  ), []); // Empty dependency array because item properties are directly accessed

  // Shimmer placeholder for the request cards
  const ShimmerRequestCardPlaceholder = () => (
    <View style={[styles.requestCard, styles.shimmerCard]}>
      <Shimmer
        style={{
          height: 20,
          width: '70%',
          borderRadius: 4,
          marginBottom: 10,
        }}
      />
      <Shimmer
        style={{
          height: 12,
          width: '30%',
          borderRadius: 4,
          alignSelf: 'flex-end',
          position: 'absolute',
          top: 20,
          right: 20,
        }}
      />
      <View style={styles.shimmerInfoRow}>
        <Shimmer style={{ height: 16, width: 16, borderRadius: 8, marginRight: 8 }} />
        <Shimmer style={{ height: 14, width: '60%', borderRadius: 4 }} />
      </View>
      <View style={styles.shimmerInfoRow}>
        <Shimmer style={{ height: 16, width: 16, borderRadius: 8, marginRight: 8 }} />
        <Shimmer style={{ height: 14, width: '50%', borderRadius: 4 }} />
      </View>
      <View style={styles.shimmerInfoRow}>
        <Shimmer style={{ height: 16, width: 16, borderRadius: 8, marginRight: 8 }} />
        <Shimmer style={{ height: 14, width: '70%', borderRadius: 4 }} />
      </View>
      <Shimmer
        style={{
          height: 40,
          width: 100,
          borderRadius: 10,
          alignSelf: 'flex-end',
          marginTop: 15,
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#004ab1']}
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
        <Text style={styles.headerTitle}>Requests</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {requestsLoading ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={ShimmerRequestCardPlaceholder}
          keyExtractor={(item) => item.Id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : requestsError ? (
        <View style={styles.emptyListContainer}>
          <Ionicons name="warning-outline" size={80} color="#ff6347" />
          <Text style={styles.emptyListText}>Failed to load requests.</Text>
          <Text style={styles.emptyListSubText}>Please check your connection and try again.</Text>
        </View>
      ) : requests.length > 0 ? (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <Ionicons name="cube-outline" size={80} color="#bbb" />
          <Text style={styles.emptyListText}>No pending requests to display.</Text>
          <Text style={styles.emptyListSubText}>All clear here!</Text>
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
              Issuing: <Text style={styles.modalHighlightText}>"{selectedRequest?.Item}"</Text> 
            </Text>

            <View style={styles.qtyControlsContainer}>
              <Text style={styles.qtyLabel}>Quantity:</Text>
              <View style={styles.qtyInputContainer}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={decrementQty}
                  disabled={issueQty <= 1}>
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyDisplay}>{issueQty}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={incrementQty}
                  disabled={issueQty >= parseInt(selectedRequest?.Qty, 10)}> 
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.qtyMaxText}>Requested: {selectedRequest?.Qty}</Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={closeIssueSelectionModal}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonConfirm]}
                onPress={confirmIssue}>
                <Text style={styles.textStyle}>Confirm Issue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Issue Status Modal (Success/Error) */}
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
    backgroundColor: '#F8F9FB',
  },
  header: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
  },
  listContent: {
    padding: 15,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A508C',
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statusPending: {
    backgroundColor: '#ffeb3b',
    color: '#333',
  },
  statusIssued: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  requestDetails: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
  },
  requestInfo: {
    fontSize: 14,
    color: '#555',
  },
  infoValue: {
    fontWeight: '600',
    color: '#333',
  },
  issueButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  issueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyListContainer: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginTop: 15,
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 15,
    color: '#999',
    marginTop: 5,
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
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  qtyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#007bff',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  // Shimmer specific styles for Requests screen
  shimmerCard: {
    height: 250, // Approximate height of a request card
    justifyContent: 'flex-start',
    padding: 18,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  shimmerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
});