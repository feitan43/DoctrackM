import React, {useState, useEffect, useCallback} from 'react';
import {Modal, View, Text, Pressable, StyleSheet, Alert} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {formatDateTime} from '../utils'; // formats to 'YYYY-MM-DD hh:mm A'

const EditDateModal = ({isVisible, currentDate, onClose, onSubmit}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  // Parse date string into JS Date object
  const parseCustomDateTime = dateTimeStr => {
    if (!dateTimeStr) return new Date();
    try {
      const [datePart, timePart, meridian] = dateTimeStr.split(/[\s]+/);
      const [year, month, day] = datePart.split('-').map(Number);
      let [hour, minute] = timePart.split(':').map(Number);

      if (meridian === 'PM' && hour !== 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;

      return new Date(year, month - 1, day, hour, minute);
    } catch (error) {
      console.warn('Failed to parse date:', error);
      return new Date();
    }
  };

  // Update selected date when modal is opened
  useEffect(() => {
    if (isVisible) {
      setSelectedDateTime(parseCustomDateTime(currentDate));
    }
  }, [isVisible, currentDate]);

  const handleSubmit = useCallback(() => {
    if (!selectedDateTime || isNaN(selectedDateTime.getTime())) {
      Alert.alert('Invalid Date', 'Please select a valid date and time.');
      return;
    }

    onSubmit(formatDateTime(selectedDateTime));
  }, [selectedDateTime, onSubmit, onClose]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContainer}>
          <Text style={modalStyles.modalTitle}>Edit Delivery Date & Time</Text>

          {currentDate && (
            <Text style={modalStyles.previousDateText}>
              Current Delivery: {currentDate}
            </Text>
          )}

          {/* Date Picker Button */}
          <Pressable
            onPress={() => setOpenDatePicker(true)}
            style={modalStyles.datePickerButton}>
            <Icon name="calendar-outline" size={20} color="#1a508c" />
            <Text style={modalStyles.datePickerButtonText}>
              {selectedDateTime.toLocaleDateString()}
            </Text>
          </Pressable>

          <DatePicker
            modal
            open={openDatePicker}
            date={selectedDateTime}
            onConfirm={date => {
              setOpenDatePicker(false);
              setSelectedDateTime(prev => new Date(
                date.getFullYear(), date.getMonth(), date.getDate(),
                prev.getHours(), prev.getMinutes()
              ));
            }}
            onCancel={() => setOpenDatePicker(false)}
            mode="date"
          />

          {/* Time Picker Button */}
          <Pressable
            onPress={() => setOpenTimePicker(true)}
            style={modalStyles.datePickerButton}>
            <Icon name="time-outline" size={20} color="#1a508c" />
            <Text style={modalStyles.datePickerButtonText}>
              {selectedDateTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </Pressable>

          <DatePicker
            modal
            open={openTimePicker}
            date={selectedDateTime}
            onConfirm={time => {
              setOpenTimePicker(false);
              setSelectedDateTime(prev => new Date(
                prev.getFullYear(), prev.getMonth(), prev.getDate(),
                time.getHours(), time.getMinutes()
              ));
            }}
            onCancel={() => setOpenTimePicker(false)}
            mode="time"
          />

          {/* Buttons */}
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
              onPress={handleSubmit}>
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

export default EditDateModal;
