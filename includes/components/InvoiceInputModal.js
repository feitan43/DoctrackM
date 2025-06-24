import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import ImmersiveMode from 'react-native-immersive-mode';
import {showMessage} from 'react-native-flash-message'; // Import showMessage

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const Colors = {
  primary: '#2c3e50',
  secondary: '#3498db',
  textDark: '#333333',
  textLight: '#555555',
  border: '#e0e0e0',
  background: '#f9f9f9',
  white: '#ffffff',
  success: '#27ae60',
  danger: '#e74c3c',
  grey: '#a0a0a0', // Added for disabled states
};

const InvoiceInputModal = ({
  isVisible,
  onClose,
  invoiceDetails, // This will now be the initial state from parent
  setInvoiceDetails: setParentInvoiceDetails, // Use a different name to avoid conflict
  onSubmit, // This is the function from the parent to handle submission
}) => {
  // Local state to manage the modal's inputs
  const [localInvoiceNumber, setLocalInvoiceNumber] = useState(
    invoiceDetails.invoiceNumber,
  );
  const [localInvoiceDates, setLocalInvoiceDates] = useState(
    invoiceDetails.invoiceDates,
  );
  const [noInvoice, setNoInvoice] = useState(invoiceDetails.noInvoice || false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateForPicker, setCurrentDateForPicker] = useState(new Date());

  // Effect to sync parent's invoiceDetails with local state when modal opens/updates
  useEffect(() => {
    if (isVisible) {
      setLocalInvoiceNumber(invoiceDetails.invoiceNumber);
      setLocalInvoiceDates(invoiceDetails.invoiceDates);
      setNoInvoice(invoiceDetails.noInvoice || false);
    }
  }, [isVisible, invoiceDetails]);

  // Handle Immersive Mode for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      ImmersiveMode.fullLayout(true);
      ImmersiveMode.setBarMode('BottomSticky');
    }
  }, []);

  // Update local state and clear fields if "No Invoice" is toggled
  useEffect(() => {
    if (noInvoice) {
      setLocalInvoiceNumber('');
      setLocalInvoiceDates([]);
    }
  }, [noInvoice]);

  const handleDateConfirm = date => {
    setShowDatePicker(false);
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    setLocalInvoiceDates(prev => [...new Set([...prev, formattedDate])].sort()); // Add and sort unique dates
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleAddDatePress = () => {
    setCurrentDateForPicker(new Date());
    setShowDatePicker(true);
  };

  const handleRemoveDate = indexToRemove => {
    setLocalInvoiceDates(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const toggleNoInvoice = () => {
    setNoInvoice(prev => !prev);
  };

  // Corrected handleSubmit within the modal
  const handleModalSubmit = () => {
    // Perform local validation based on 'noInvoice' state
    if (!noInvoice) {
      if (!localInvoiceNumber.trim()) {
        showMessage({
          message: 'Invoice Number Required',
          description: 'Please enter an invoice number.',
          type: 'warning',
          icon: 'warning',
          floating: true,
          duration: 3000,
        });
        return;
      }
      if (localInvoiceDates.length === 0) {
        showMessage({
          message: 'Invoice Date Required',
          description: 'Please add at least one invoice date.',
          type: 'warning',
          icon: 'warning',
          floating: true,
          duration: 3000,
        });
        return;
      }
    }

    // Call the onSubmit prop (from parent) with the validated data
    onSubmit({
      invoiceNumber: localInvoiceNumber,
      invoiceDates: localInvoiceDates,
      noInvoice: noInvoice,
    });

    onClose(); // Close the modal after submission
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none" // Changed to none for better control or specific animation if desired
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Invoice Details</Text>

          <TextInput
            placeholder="Invoice Number"
            placeholderTextColor={noInvoice ? Colors.grey : Colors.textLight}
            style={[styles.textInput, noInvoice && styles.disabledInput]}
            value={localInvoiceNumber}
            onChangeText={setLocalInvoiceNumber}
            editable={!noInvoice} // Disable input when noInvoice is true
          />

          <TouchableOpacity
            style={[styles.addDateButton, noInvoice && styles.disabledButton]}
            onPress={handleAddDatePress}
            activeOpacity={0.7}
            disabled={noInvoice}>
            <Text style={styles.addDateButtonText}>Add Invoice Date</Text>
          </TouchableOpacity>

          {/* DatePicker only appears when showDatePicker is true, its disabled state is managed by the showDatePicker state */}
          <DatePicker
            modal
            open={showDatePicker && !noInvoice} // Prevent date picker from opening if noInvoice is true
            date={currentDateForPicker}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={handleDateCancel}
            confirmText="Select"
            cancelText="Close"
          />

          {localInvoiceDates.length > 0 && (
            <View
              style={[
                styles.invoiceDatesListContainer,
                noInvoice && styles.disabledContainer,
              ]}>
              <Text style={styles.invoiceDatesLabel}>Selected Invoice Dates:</Text>
              <ScrollView style={styles.invoiceDatesScrollView}>
                {localInvoiceDates.map((date, index) => (
                  <View key={index} style={styles.invoiceDateItem}>
                    <Text style={styles.invoiceDateText}>{date}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveDate(index)}
                      style={styles.removeDateButton}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                      disabled={noInvoice}>
                      <Icon
                        name="close-circle"
                        size={24}
                        color={noInvoice ? Colors.grey : Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text> ---or---</Text>
          </View>

          <Pressable
            style={({pressed}) => [
              styles.noInvoiceCheckboxContainer,
              pressed && {opacity: 0.7},
            ]}
            onPress={toggleNoInvoice}>
            <View
              style={[styles.checkbox, noInvoice && styles.checkboxChecked]}>
              {noInvoice && (
                <Icon name="checkmark" size={18} color={Colors.white} />
              )}
            </View>
            <Text style={styles.noInvoiceText}>No Invoice</Text>
          </Pressable>
          {/* --- */}

          <View style={styles.modalButtonsContainer}>
            <Pressable
              style={({pressed}) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed && {opacity: 0.8},
              ]}
              onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.modalButton,
                styles.modalSubmitButton,
                pressed && {opacity: 0.8},
              ]}
              onPress={handleModalSubmit}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 25,
    borderRadius: 12,
    width: screenWidth * 0.95,
    maxHeight: screenHeight * 0.85,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  // New styles for the "No Invoice" checkbox
  noInvoiceCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  noInvoiceText: {
    fontSize: 18,
    color: Colors.textDark,
    fontWeight: '600',
  },
  // End of new styles for "No Invoice" checkbox
  textInput: {
    height: 55,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 25,
    fontSize: 17,
    color: Colors.textDark,
    backgroundColor: Colors.background,
  },
  disabledInput: {
    backgroundColor: Colors.background, // Keep background, but dim text/border
    color: Colors.grey,
    borderColor: Colors.grey,
  },
  addDateButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    shadowColor: Colors.secondary,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.grey, // Grey out the button when disabled
    shadowColor: 'transparent',
    elevation: 0,
  },
  addDateButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  invoiceDatesListContainer: {
    maxHeight: screenHeight * 0.3,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 25,
    backgroundColor: Colors.background,
  },
  disabledContainer: {
    backgroundColor: Colors.background, // Keep background, but dim content
    opacity: 0.6, // Visually dim the content
  },
  invoiceDatesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.textLight,
  },
  invoiceDatesScrollView: {},
  invoiceDateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  invoiceDateText: {
    fontSize: 17,
    color: Colors.textDark,
  },
  removeDateButton: {
    padding: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingHorizontal: 0,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  modalCancelButton: {
    backgroundColor: Colors.danger,
  },
  modalSubmitButton: {
    backgroundColor: Colors.success,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default InvoiceInputModal;
