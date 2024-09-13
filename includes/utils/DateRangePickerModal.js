import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';

const DateRangePickerModal = ({ isVisible, onClose, onDateRangeChange }) => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const handleDayPress = (day) => {
    if (!selectedStartDate) {
      setSelectedStartDate(day.dateString);
    } else if (!selectedEndDate) {
      setSelectedEndDate(day.dateString);
    } else {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(null);
    }
  };

  const handleConfirm = () => {
    onDateRangeChange(selectedStartDate, selectedEndDate);
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedStartDate]: { selected: true, startingDay: true },
            [selectedEndDate]: { selected: true, endingDay: true },
          }}
        />
        <Button title="Confirm" onPress={handleConfirm} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    alignItems: 'center',
  },
});

export default DateRangePickerModal;
