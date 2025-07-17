// RequestStatusModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const RequestStatusModal = ({ visible, status, message, onClose }) => {
  const isSuccess = status === 'success';
  const iconName = isSuccess ? 'checkmark-circle' : 'close-circle';
  const iconColor = isSuccess ? '#28a745' : '#dc3545'; // Green for success, Red for error
  const titleText = isSuccess ? 'Request Successful!' : 'Request Failed!';

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={isSuccess ? ['#28a745', '#218838'] : ['#dc3545', '#c82333']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Ionicons name={iconName} size={60} color="#fff" style={styles.headerIcon} />
            <Text style={styles.modalTitle}>{titleText}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.messageText}>{message}</Text>
            <TouchableOpacity style={styles.okButton} onPress={onClose}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black overlay
  },
  modalContainer: {
    width: width * 0.85, // 85% of screen width
    borderRadius: 15,
    overflow: 'hidden', // Ensures the gradient header respects border radius
    backgroundColor: '#fff',
    elevation: 10, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerGradient: {
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 25,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 17,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  okButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RequestStatusModal;