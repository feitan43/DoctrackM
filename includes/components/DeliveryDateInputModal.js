import React, {useState, useCallback} from 'react';
import {Modal, View, Text, Pressable, StyleSheet, Alert} from 'react-native'; // Import Alert
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {formatDateTime} from '../utils';

const DeliveryDateInputModal = ({
  isVisible,
  deliveryData,
  onClose,
  onSubmit,
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  function parseCustomDateTime(dateTimeStr) {
    const [datePart, timePart, meridian] = dateTimeStr.split(/[\s]+/);
    const [year, month, day] = datePart.split('-').map(Number);
    let [hour, minute] = timePart.split(':').map(Number);

    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  }

  const handleSubmitPress = useCallback(() => {
    if (!selectedDateTime || !deliveryData?.DeliveryDate) {
      console.warn('Missing selectedDateTime or deliveryData.DeliveryDate');
      return;
    }

    const selected = new Date(selectedDateTime);
    const delivery = parseCustomDateTime(deliveryData.DeliveryDate);

    if (selected < delivery) {
      // Replaced showMessage with Alert.alert
      Alert.alert(
        'Invalid Date/Time',
        `Selected date and time cannot be earlier than the original delivery date: ${delivery.toLocaleDateString()} ${delivery.toLocaleTimeString(
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

    onSubmit(formatDateTime(selectedDateTime));
    onClose();
  }, [selectedDateTime, deliveryData, onSubmit, onClose]);

  const formatDisplayDateTime = useCallback(dateString => {
    if (!dateString) return '';
    try {
      let date = new Date(
        dateString.replace(/ AM$/, ' AM').replace(/ PM$/, ' PM'),
      );

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
        console.warn(
          'Could not parse deliveryData string for display:',
          dateString,
        );
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
      console.error('Error formatting date:', error);
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

          {deliveryData && deliveryData.DeliveryDate && (
            <Text style={modalStyles.previousDateText}>
              Previous Delivery:{' '}
              {formatDisplayDateTime(deliveryData.DeliveryDate)}
            </Text>
          )}

          <Pressable
            onPress={() => setOpenDatePicker(true)}
            style={modalStyles.datePickerButton}>
            <Icon name="calendar-outline" size={20} color="#1a508c" />
            <Text style={modalStyles.datePickerButtonText}>
              {selectedDateTime
                ? selectedDateTime.toLocaleDateString()
                : 'Select Date'}
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
          />

          <Pressable
            onPress={() => setOpenTimePicker(true)}
            style={modalStyles.datePickerButton}>
            <Icon name="time-outline" size={20} color="#1a508c" />
            <Text style={modalStyles.datePickerButtonText}>
              {selectedDateTime
                ? selectedDateTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'Select Time'}
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
            /* minimumDate={minDate}
            maximumDate={maxDate} */
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
              onPress={handleSubmitPress}>
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