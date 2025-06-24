import React, {useState, useCallback, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {showMessage} from 'react-native-flash-message';

const DeliveryDateInputModal = ({isVisible, deliveryData, onClose, onSubmit}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());

  useEffect(() => {
    const currentDateTime = new Date();
    let initialSelectedDate = currentDateTime;

    // Check if deliveryData (which contains the delivery date string) is provided
    if (deliveryData && deliveryData.DeliveryDate) {
      const parsedDeliveryDate = new Date(deliveryData.DeliveryDate); // Access the DeliveryDate property
      if (!isNaN(parsedDeliveryDate.getTime())) { // Check if parsing was successful
        initialSelectedDate = parsedDeliveryDate;
      }
      
      if (initialSelectedDate < currentDateTime) {
        initialSelectedDate = currentDateTime;
      }
    }
    
    setSelectedDateTime(initialSelectedDate);

    setMinDate(currentDateTime);

    const calculatedMaxDate = new Date();
    calculatedMaxDate.setMonth(calculatedMaxDate.getMonth() + 3);
    setMaxDate(calculatedMaxDate);

  }, [deliveryData]); // Dependency is now deliveryData

  const handleSubmitPress = useCallback(() => {
    if (!selectedDateTime) {
      showMessage({
        message: 'Date and Time Required',
        description: 'Please select a delivery date and time.',
        type: 'warning',
        icon: 'warning',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (selectedDateTime < minDate) {
      showMessage({
        message: 'Invalid Date/Time',
        description: `Delivery date and time cannot be in the past. Please select a date after ${minDate.toLocaleDateString()} ${minDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}.`,
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 5000,
      });
      return;
    }

    if (selectedDateTime > maxDate) {
      showMessage({
        message: 'Invalid Date/Time',
        description: `Delivery date and time cannot be more than 3 months in the future. Please select a date before ${maxDate.toLocaleDateString()} ${maxDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}.`,
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 5000,
      });
      return;
    }

    onSubmit(selectedDateTime);
    onClose();
  }, [selectedDateTime, onSubmit, onClose, minDate, maxDate]);

  const formatDisplayDateTime = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      let date = new Date(dateString.replace(/ AM$/, ' AM').replace(/ PM$/, ' PM'));

      if (isNaN(date.getTime())) {
          const [datePart, timePart, ampmPart] = dateString.split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          let [hours, minutes] = timePart.split(':').map(Number);

          if (ampmPart === 'PM' && hours < 12) {
              hours += 12;
          } else if (ampmPart === 'AM' && hours === 12) {
              hours = 0;
          }

          date = new Date(year, month - 1, day, hours, minutes);
      }

      if (isNaN(date.getTime())) {
          console.warn("Could not parse deliveryData string for display:", dateString);
          return 'Invalid Date';
      }

      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      return date.toLocaleString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  }, []);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContainer}>
          <Text style={modalStyles.modalTitle}>Add Delivery Date & Time</Text>

          {/* Use deliveryData.DeliveryDate for displaying previous date */}
          {deliveryData && deliveryData.DeliveryDate && (
            <Text style={modalStyles.previousDateText}>
              Previous Delivery: {formatDisplayDateTime(deliveryData.DeliveryDate)}
            </Text>
          )}

          <Pressable
            onPress={() => setOpenDatePicker(true)}
            style={modalStyles.datePickerButton}>
            <Icon name="calendar-outline" size={20} color="#1a508c" />
            <Text style={modalStyles.datePickerButtonText}>
              {selectedDateTime ? selectedDateTime.toLocaleDateString() : 'Select Date'}
            </Text>
          </Pressable>

          <DatePicker
            modal
            open={openDatePicker}
            date={selectedDateTime}
            onConfirm={date => {
              setOpenDatePicker(false);
              setSelectedDateTime(date);
            }}
            onCancel={() => {
              setOpenDatePicker(false);
            }}
            mode="date"
            minimumDate={minDate}
            maximumDate={maxDate}
          />

          <Pressable
            onPress={() => setOpenTimePicker(true)}
            style={modalStyles.datePickerButton}>
            <Icon name="time-outline" size={20} color="#1a508c" />
            <Text style={modalStyles.datePickerButtonText}>
              {selectedDateTime ? selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Select Time'}
            </Text>
          </Pressable>

          <DatePicker
            modal
            open={openTimePicker}
            date={selectedDateTime}
            onConfirm={date => {
              setOpenTimePicker(false);
              setSelectedDateTime(date);
            }}
            onCancel={() => {
              setOpenTimePicker(false);
            }}
            mode="time"
            minimumDate={minDate}
            maximumDate={maxDate}
          />

          <View style={modalStyles.buttonContainer}>
            <Pressable
              style={({pressed}) => [
                modalStyles.button,
                modalStyles.cancelButton,
                pressed && {opacity: 0.7},
              ]}
              onPress={onClose}>
              <Text style={modalStyles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                modalStyles.button,
                modalStyles.submitButton,
                pressed && {opacity: 0.7},
              ]}
              onPress={handleSubmitPress}
              >
              <Text style={modalStyles.buttonText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a508c',
    marginBottom: 10,
    textAlign: 'center',
  },
  previousDateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#1a508c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeliveryDateInputModal;