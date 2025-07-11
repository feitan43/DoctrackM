import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ComposeMessageModal = ({ visible, onClose, onSend }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const handleSend = () => {
    if (recipient.trim() === '' || subject.trim() === '' || messageBody.trim() === '') {
      alert('Please fill in all fields.'); // Simple validation
      return;
    }
    onSend(recipient, subject, messageBody);
    // Clear fields after sending
    setRecipient('');
    setSubject('');
    setMessageBody('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={modalStyles.centeredView}
      >
        <View style={modalStyles.modalView}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>New Message</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={modalStyles.input}
            placeholder="Recipient"
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={modalStyles.input}
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[modalStyles.input, modalStyles.messageInput]}
            placeholder="Your message here..."
            value={messageBody}
            onChangeText={setMessageBody}
            multiline
            numberOfLines={6}
            textAlignVertical="top" // For Android to start text at the top
          />

          <TouchableOpacity style={modalStyles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={18} color="#fff" />
            <Text style={modalStyles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// You can define these styles in your existing styles.js or create a new one
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    minHeight: 120,
    paddingTop: 12, // Ensure text starts at the top for multiline
  },
  sendButton: {
    backgroundColor: '#4a6da7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ComposeMessageModal;