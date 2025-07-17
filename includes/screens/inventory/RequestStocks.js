// RequestStocks.js (Updated)
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import RequestStatusModal from './RequestStatusModal'; // Import the new modal component

const RequestStocks = ({ navigation, route }) => {
  const { item } = route.params || {};

  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');

  // State for the modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStatus, setModalStatus] = useState(''); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState('');

  const updateQuantity = (newQty) => {
    let quantity = parseInt(newQty, 10);

    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    }

    if (item && item.Qty !== undefined && quantity > item.Qty) {
      quantity = item.Qty;
    }

    setRequestedQuantity(quantity);
  };

  const incrementQuantity = () => {
    let newQty = requestedQuantity + 1;
    if (item && item.Qty !== undefined && newQty > item.Qty) {
      newQty = item.Qty;
    }
    setRequestedQuantity(newQty);
  };

  const decrementQuantity = () => {
    if (requestedQuantity > 1) {
      setRequestedQuantity(requestedQuantity - 1);
    }
  };

  // Modified submitRequest to show the modal
  const submitRequest = () => {
    const requestDetails = {
      itemId: item ? item.Id : 'N/A',
      itemName: item ? item.Item : 'N/A',
      requestedQty: requestedQuantity,
      reason: requestReason,
    };

    console.log('Request Submitted:', requestDetails);

    // Simulate API call success/failure
    const success = Math.random() > 0.3; // 70% chance of success for demonstration

    if (success) {
      setModalStatus('success');
      setModalMessage(`Your request for ${requestedQuantity} of ${item ? item.Item : 'item'} has been sent successfully.`);
    } else {
      setModalStatus('error');
      setModalMessage(`Failed to send request for ${item ? item.Item : 'item'}. Please try again.`);
    }
    setModalVisible(true); // Show the modal

    setRequestedQuantity(1);
    setRequestReason('');
  };

  const handleRequestSubmit = () => {
    if (requestedQuantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please select a valid positive number for the quantity.');
      return;
    }

    if (item && item.Qty !== undefined && requestedQuantity > item.Qty) {
        Alert.alert('Quantity Exceeded', `You cannot request more than the available quantity (${item.Qty}).`);
        return;
    }

    if (!requestReason.trim()) {
      Alert.alert(
        'Reason Missing',
        'You have not provided a reason for this request. Do you want to proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Proceed',
            onPress: submitRequest,
          },
        ]
      );
    } else {
      submitRequest();
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setModalVisible(false);
    // Optionally navigate back after closing a successful modal
    if (modalStatus === 'success') {
      navigation.goBack();
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2c6ca1', '#0056b3']}
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
        <Text style={styles.headerTitle}>Request Item</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentInner}>
              <Text style={styles.itemNameLabel}>Requesting:</Text>
              <Text style={styles.itemName}>{item ? item.Item : 'No Item Selected'}</Text>
              <Text style={styles.itemCurrentQty}>Available Qty: {item ? item.Qty : 'N/A'}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity to Request:</Text>
                <View style={styles.qtyControlsContainer}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={decrementQuantity}
                    disabled={requestedQuantity <= 1}>
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyTextInput}
                    keyboardType="numeric"
                    value={String(requestedQuantity)}
                    onChangeText={updateQuantity}
                    onEndEditing={() => updateQuantity(requestedQuantity)}
                  />
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={incrementQuantity}
                    disabled={item && item.Qty !== undefined && requestedQuantity >= item.Qty}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                {item && item.Qty !== undefined && (
                    <Text style={styles.qtyLimitText}>Max available: {item.Qty}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason for Request:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., For project X, Replacement, etc."
                  multiline
                  numberOfLines={4}
                  value={requestReason}
                  onChangeText={setRequestReason}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleRequestSubmit}>
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* The new RequestStatusModal component */}
      <RequestStatusModal
        visible={modalVisible}
        status={modalStatus}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentInner: {
    padding: 20,
  },
  itemNameLabel: {
    fontSize: 16,
    color: '#606c7c',
    marginBottom: 5,
    fontWeight: '500',
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  itemCurrentQty: {
    fontSize: 16,
    color: '#8892a0',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 17,
    color: '#334155',
    marginBottom: 10,
    fontWeight: '600',
  },
  qtyControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e9ed',
    overflow: 'hidden',
    paddingVertical: 5,
  },
  qtyButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 15,
    paddingHorizontal: 25,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
  qtyTextInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c6ca1',
    textAlign: 'center',
    paddingVertical: 0,
    height: 60,
    minWidth: 80,
  },
  qtyLimitText: {
      fontSize: 14,
      color: '#8892a0',
      marginTop: 10,
      textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e9ed',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default RequestStocks;