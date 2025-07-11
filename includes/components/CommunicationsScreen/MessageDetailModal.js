import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageDetailModal = ({ visible, message, onClose, onReply }) => {
  const [replyText, setReplyText] = useState('');

  if (!message) {
    return null; // Don't render if no message is selected
  }

  const handleSendReply = () => {
    if (replyText.trim() === '') {
      alert('Reply cannot be empty.');
      return;
    }
    onReply(message, replyText); // Pass original message and reply text
    setReplyText(''); // Clear reply input
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={messageDetailStyles.centeredView}
      >
        <View style={messageDetailStyles.modalView}>
          <View style={messageDetailStyles.modalHeader}>
            <Text style={messageDetailStyles.modalTitle}>Message Details</Text>
            <TouchableOpacity onPress={onClose} style={messageDetailStyles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={messageDetailStyles.messageContentContainer}>
            <Text style={messageDetailStyles.messageDetailSender}>From: {message.sender}</Text>
            <Text style={messageDetailStyles.messageDetailSubject}>Subject: {message.subject}</Text>
            <Text style={messageDetailStyles.messageDetailTime}>{message.time}</Text>
            <View style={messageDetailStyles.separator} />
            <Text style={messageDetailStyles.messageDetailBody}>{message.fullMessage}</Text>
          </ScrollView>

          {/* Reply Section */}
          <View style={messageDetailStyles.replySection}>
            <TextInput
              style={messageDetailStyles.replyInput}
              placeholder={`Reply to ${message.sender}...`}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity style={messageDetailStyles.sendReplyButton} onPress={handleSendReply}>
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
              <Text style={messageDetailStyles.sendReplyButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const messageDetailStyles = StyleSheet.create({
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
    maxHeight: '90%', // Increased max height to show more content
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  messageContentContainer: {
    flex: 1, // Allow content to scroll
    marginBottom: 15, // Space before reply section
  },
  messageDetailSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  messageDetailSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a6da7',
    marginBottom: 8,
  },
  messageDetailTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  messageDetailBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  replySection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 'auto', // Pushes the reply section to the bottom
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    minHeight: 80, // Minimum height for multiline input
    textAlignVertical: 'top', // Text starts from top
  },
  sendReplyButton: {
    backgroundColor: '#4a6da7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  sendReplyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MessageDetailModal;