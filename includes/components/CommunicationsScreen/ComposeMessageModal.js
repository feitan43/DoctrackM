import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ComposeMessageModal = ({ visible, onClose, onSend }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    // Basic validation
    if (recipient.trim() === '' || subject.trim() === '' || messageBody.trim() === '') {
      setError('Please fill in all fields.');
      return;
    }

    setError(''); // Clear any previous errors
    setLoading(true);

    try {
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSend(recipient, subject, messageBody);
      
      // Clear fields after successful send
      setRecipient('');
      setSubject('');
      setMessageBody('');
    } catch (e) {
      console.error("Failed to send message:", e);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      onClose(); // Automatically close the modal on success
    }
  };

  return (
    <Modal
      animationType="none"
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

          {error ? <Text style={modalStyles.errorMessage}>{error}</Text> : null}

          <TextInput
            style={modalStyles.input}
            placeholder="Recipient"
            placeholderTextColor="#999"
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={modalStyles.input}
            placeholder="Subject"
            placeholderTextColor="#999"
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[modalStyles.input, modalStyles.messageInput]}
            placeholder="Your message here..."
            placeholderTextColor="#999"
            value={messageBody}
            onChangeText={setMessageBody}
            multiline
            numberOfLines={6}
            textAlignVertical="top" // For Android to start text at the top
          />

          <TouchableOpacity
            style={[modalStyles.sendButton, loading && modalStyles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
                <Text style={modalStyles.sendButtonText}>Send</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 0,
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 20,
    width: '100%',
    height: '100%',
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
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  errorMessage: {
    color: '#DC2626', // A prominent red for error messages
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // A subtle gray border
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#3B82F6', // A professional blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF', // Lighter gray when disabled
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ComposeMessageModal;
