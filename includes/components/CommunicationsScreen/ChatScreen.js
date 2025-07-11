import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// This is the new component for your full-screen chat view
const ChatScreen = ({ navigation, route }) => {
  const { message } = route.params; // Get the message passed from the previous screen

  const [replyText, setReplyText] = useState('');
  const [chatMessages, setChatMessages] = useState([]); // To simulate a conversation

  useEffect(() => {
    // When the screen loads, display the original message
    if (message) {
      setChatMessages([
        { id: message.id, sender: message.sender, text: message.fullMessage, time: message.time, isMine: false },
      ]);
    }
  }, [message]);

  const handleSendReply = () => {
    if (replyText.trim() === '') {
      alert('Reply cannot be empty.');
      return;
    }

    const newReply = {
      id: Math.random().toString(), // Simple unique ID
      sender: "You", // Or your user's name
      text: replyText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      isMine: true, // This message is from the current user
    };

    setChatMessages([...chatMessages, newReply]);
    setReplyText(''); // Clear the input field

    // In a real application, you would send this reply to a backend API
    console.log("Sending reply:", newReply);
    console.log("To original message:", message.id, message.subject);
    // You might also want to show a success message or update a global message state
  };

  return (
    <KeyboardAvoidingView
      style={chatStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust as needed
    >
      {/* Header for the chat screen */}
      <View style={chatStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={chatStyles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={chatStyles.headerTitle}>{message.sender}</Text>
        <View style={chatStyles.headerRightPlaceholder} /> 
      </View>

      {/* Chat Messages Area */}
      <ScrollView
        style={chatStyles.messagesContainer}
        contentContainerStyle={chatStyles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef => { this.scrollView = scrollViewRef; }} // For auto-scrolling
        onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })} // Auto-scroll to bottom
      >
        {chatMessages.map((msg) => (
          <View
            key={msg.id}
            style={[
              chatStyles.messageBubble,
              msg.isMine ? chatStyles.myMessageBubble : chatStyles.otherMessageBubble,
            ]}
          >
            {!msg.isMine && <Text style={chatStyles.messageSenderName}>{msg.sender}</Text>}
            <Text style={chatStyles.messageText}>{msg.text}</Text>
            <Text style={chatStyles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Reply Input Area */}
      <View style={chatStyles.replyInputContainer}>
        <TextInput
          style={chatStyles.replyTextInput}
          placeholder="Type your message..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxHeight={100} // Limit height to prevent excessive expansion
        />
        <TouchableOpacity
          style={chatStyles.sendButton}
          onPress={handleSendReply}
          disabled={replyText.trim() === ''} // Disable if empty
        >
          <MaterialCommunityIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background for the chat screen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4a6da7',
    paddingTop: Platform.OS === 'ios' ? 50 : 15, // Adjust for notch/status bar
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1, // Allow title to take available space
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 34, // Same width as backButton (icon size + padding) for centering
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContentContainer: {
    paddingBottom: 20, // Space at the bottom
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Light green for sent messages
    marginRight: 5,
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White for received messages
    marginLeft: 5,
  },
  messageSenderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  replyTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Adjust for vertical centering
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100, // Prevents input from growing too large
  },
  sendButton: {
    backgroundColor: '#4a6da7',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;