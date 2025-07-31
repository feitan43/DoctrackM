import React, {useState, useRef} from 'react';
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
import {useSubmitInventoryRequest} from '../../hooks/useInventory';

const RequestStocks = ({navigation, route}) => {
  const {item} = route.params || {};

  const {
    mutate: submitRequestMutation,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useSubmitInventoryRequest();

  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalStatus, setModalStatus] = useState(''); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState('');

  // State and refs for long press functionality
  const intervalRef = useRef(null);
  const [isLongPressingIncrement, setIsLongPressingIncrement] = useState(false);
  const [isLongPressingDecrement, setIsLongPressingDecrement] = useState(false);

  // Constants for long press behavior
  const LONG_PRESS_INITIAL_DELAY = 300; // ms before continuous action starts
  const LONG_PRESS_INTERVAL_SPEED = 100; // ms between each quantity change

  // This function is now more focused on direct input, quantity controls handle validation
  const updateQuantity = newQtyString => {
    let quantity = parseInt(newQtyString, 10);

    if (isNaN(quantity)) {
      setRequestedQuantity(''); // Allow empty string for user to type
    } else {
      // Basic capping for direct input, more robust validation happens on blur
      if (item && item.Qty !== undefined && quantity > item.Qty) {
        quantity = item.Qty;
      } else if (quantity < 1 && newQtyString !== '') {
        quantity = 1;
      }
      setRequestedQuantity(quantity);
    }
  };

  const incrementQuantity = () => {
    setRequestedQuantity(prevQty => {
      const currentQty = typeof prevQty === 'number' ? prevQty : 1; // Treat empty/invalid as 1 for increment
      let newQty = currentQty + 1;
      if (item && item.Qty !== undefined && newQty > item.Qty) {
        newQty = item.Qty;
      }
      return newQty;
    });
  };

  const decrementQuantity = () => {
    setRequestedQuantity(prevQty => {
      const currentQty = typeof prevQty === 'number' ? prevQty : 1; // Treat empty/invalid as 1 for decrement
      if (currentQty > 1) {
        return currentQty - 1;
      }
      return 1;
    });
  };

  const handleLongPressIncrement = () => {
    setIsLongPressingIncrement(true);
    incrementQuantity(); // Call once immediately
    intervalRef.current = setInterval(
      incrementQuantity,
      LONG_PRESS_INTERVAL_SPEED,
    );
  };

  const handleLongPressDecrement = () => {
    setIsLongPressingDecrement(true);
    decrementQuantity(); // Call once immediately
    intervalRef.current = setInterval(
      decrementQuantity,
      LONG_PRESS_INTERVAL_SPEED,
    );
  };

  const stopLongPress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLongPressingIncrement(false);
    setIsLongPressingDecrement(false);
  };

  const submitRequest = () => {
    const requestDetails = {
      Year: item ? item.Year : 'N/A',
      TrackingNumber: item ? item.TrackingNumber : 'N/A',
      InvId: item ? item.Id : 'N/A',
      ItemId: item ? item.ItemId : 'N/A',
      Item: item ? item.Item : 'N/A',
      requestedQty: requestedQuantity,
      units: item ? item.Unit : 'N/A', // Using item.Unit
      reason: requestReason,
      status: 'Pending',
    };

    submitRequestMutation(requestDetails, {
      onSuccess: () => {
        setModalStatus('success');
        setModalMessage(
          `Your request for ${requestedQuantity} ${
            item && item.Unit ? item.Unit : ''
          } of ${
            item ? item.Item : 'item'
          } has been sent successfully.`,
        );
        setModalVisible(true);
        setRequestedQuantity(1);
        setRequestReason('');
      },
      onError: err => {
        setModalStatus('error');
        setModalMessage(
          `Failed to send request for ${item ? item.Item : 'item'}. Error: ${
            err.message
          }. Please try again.`,
        );
        setModalVisible(true);
      },
    });
  };

  const handleRequestSubmit = () => {
    // Ensure quantity is a valid number before submission
    let finalRequestedQuantity = parseInt(requestedQuantity, 10);
    if (isNaN(finalRequestedQuantity) || finalRequestedQuantity < 1) {
      finalRequestedQuantity = 1; // Default to 1 if invalid
      setRequestedQuantity(1); // Update state to reflect this
    }

    if (item && item.Qty !== undefined && finalRequestedQuantity > item.Qty) {
      Alert.alert(
        'Quantity Exceeded',
        `You cannot request more than the available quantity (${item.Qty}).`,
      );
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
        ],
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

  // New state to manage if the user has started typing
  const [hasTyped, setHasTyped] = useState(false);

  // Custom onChangeText handler for the TextInput
  const handleQuantityTextChange = (text) => {
    if (!hasTyped && text === '') { // If user deletes the initial '1'
      setRequestedQuantity(''); // Set to empty string for initial typing
    } else {
      const parsedQty = parseInt(text, 10);
      if (isNaN(parsedQty)) {
        setRequestedQuantity(''); // Allow empty string if user deletes all
      } else {
        let newQty = parsedQty;
        if (item && item.Qty !== undefined && newQty > item.Qty) {
          newQty = item.Qty;
        } else if (newQty < 1 && text !== '') { // Prevent setting to 0 unless completely empty
          newQty = 1;
        }
        setRequestedQuantity(newQty);
      }
    }
    setHasTyped(true); // User has initiated typing
  };

  // Custom onEndEditing handler to set quantity to 1 if empty or invalid
  const handleEndEditingQuantity = () => {
    if (String(requestedQuantity).trim() === '' || isNaN(requestedQuantity)) {
      setRequestedQuantity(1);
    }
    setHasTyped(false); // Reset for next focus
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2c6ca1', '#0056b3']}
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
        <Text style={styles.headerTitle}>Request Item</Text>
        <View style={{width: 40}} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentInner}>
              <Text style={styles.itemNameLabel}>Requesting:</Text>
              <Text style={styles.itemName}>
                {item ? item.Item : 'No Item Selected'}
              </Text>
              <Text style={styles.itemCurrentQty}>
                Available Qty: {item ? `${item.Qty} ${item.Unit || ''}` : 'N/A'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity to Request:</Text>
                <View style={styles.qtyControlsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.qtyButton,
                      requestedQuantity <= 1 && styles.qtyButtonDisabled,
                    ]}
                    onPress={decrementQuantity}
                    onLongPress={handleLongPressDecrement}
                    onPressOut={stopLongPress}
                    disabled={requestedQuantity <= 1}>
                    <Text style={[
                      styles.qtyButtonText,
                      requestedQuantity <= 1 && styles.qtyButtonTextDisabled,
                    ]}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyTextInput}
                    keyboardType="numeric"
                    value={String(requestedQuantity)}
                    onChangeText={handleQuantityTextChange} // Use custom handler
                    onEndEditing={handleEndEditingQuantity} // Use custom handler
                    onFocus={() => {
                        if (requestedQuantity === 1 && !hasTyped) {
                            setRequestedQuantity(''); // Clear if it's the initial '1' and user hasn't typed
                        }
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.qtyButton,
                      item && item.Qty !== undefined && requestedQuantity >= item.Qty && styles.qtyButtonDisabled,
                    ]}
                    onPress={incrementQuantity}
                    onLongPress={handleLongPressIncrement}
                    onPressOut={stopLongPress}
                    disabled={
                      item &&
                      item.Qty !== undefined &&
                      requestedQuantity >= item.Qty
                    }>
                    <Text style={[
                      styles.qtyButtonText,
                      item && item.Qty !== undefined && requestedQuantity >= item.Qty && styles.qtyButtonTextDisabled,
                    ]}>+</Text>
                  </TouchableOpacity>
                </View>
                {item && item.Qty !== undefined && (
                  <Text style={styles.qtyLimitText}>
                    Max available: {item.Qty} {item.Unit || ''}
                  </Text>
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

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRequestSubmit}
                disabled={isLoading} // Disable button while loading
              >
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
    shadowOffset: {width: 0, height: 4},
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
    paddingHorizontal: 10,
  },
  qtyButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  qtyButtonDisabled: {
    backgroundColor: '#f8f9fa', // Lighter background for disabled
  },
  qtyButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
  qtyButtonTextDisabled: {
    color: '#ced4da', // Lighter color for disabled text
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 6},
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