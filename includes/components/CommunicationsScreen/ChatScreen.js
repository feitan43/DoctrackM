import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// A simple function to determine if a message was sent today or yesterday
const isToday = (someDate) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

const isYesterday = (someDate) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return someDate.getDate() === yesterday.getDate() &&
    someDate.getMonth() === yesterday.getMonth() &&
    someDate.getFullYear() === yesterday.getFullYear();
};

const ChatScreen = ({ navigation, route }) => {
  const { message } = route.params;
  const [replyText, setReplyText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    // When the screen loads, display the original message
    if (message) {
      setChatMessages([
        {
          id: message.id,
          sender: message.sender,
          text: message.fullMessage,
          time: message.time,
          isMine: false,
          timestamp: new Date(), // Add a timestamp for proper sorting and display
        },
      ]);
    }

    // Set the header title dynamically
    navigation.setOptions({
      headerTitle: message.sender,
    });
  }, [message, navigation]);

  const handleSendReply = () => {
    if (replyText.trim() === '') {
      return; // Do nothing if the message is empty
    }

    const newReply = {
      id: Math.random().toString(),
      sender: "You",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: new Date(),
      isMine: true,
    };

    setChatMessages([...chatMessages, newReply]);
    setReplyText(''); // Clear the input field

    // In a real application, you would send this reply to a backend API
    console.log("Sending reply:", newReply);
  };

  const renderDateSeparator = (timestamp, prevTimestamp) => {
    const currentDate = new Date(timestamp);
    const prevDate = prevTimestamp ? new Date(prevTimestamp) : null;

    if (!prevDate || currentDate.toDateString() !== prevDate.toDateString()) {
      let dateString;
      if (isToday(currentDate)) {
        dateString = 'Today';
      } else if (isYesterday(currentDate)) {
        dateString = 'Yesterday';
      } else {
        dateString = currentDate.toLocaleDateString();
      }
      return (
        <View style={chatStyles.dateSeparator}>
          <Text style={chatStyles.dateSeparatorText}>{dateString}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={chatStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={chatStyles.messagesContainer}
        contentContainerStyle={chatStyles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {chatMessages.map((msg, index) => {
          const prevTimestamp = index > 0 ? chatMessages[index - 1].timestamp : null;
          return (
            <React.Fragment key={msg.id}>
              {renderDateSeparator(msg.timestamp, prevTimestamp)}
              <View
                style={[
                  chatStyles.messageBubble,
                  msg.isMine ? chatStyles.myMessageBubble : chatStyles.otherMessageBubble,
                ]}
              >
                {!msg.isMine && <Text style={chatStyles.messageSenderName}>{msg.sender}</Text>}
                <Text style={chatStyles.messageText}>{msg.text}</Text>
                <Text style={chatStyles.messageTime}>{msg.time}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      <View style={chatStyles.replyInputContainer}>
        <TextInput
          style={chatStyles.replyTextInput}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxHeight={100}
        />
        <TouchableOpacity
          style={chatStyles.sendButton}
          onPress={handleSendReply}
          disabled={replyText.trim() === ''}
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
    backgroundColor: '#F0F2F5', // Light background for the chat screen
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContentContainer: {
    paddingBottom: 20,
  },
  dateSeparator: {
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#666',
  },
  messageBubble: {
    maxWidth: width * 0.75, // Messages take up to 75% of the screen width
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6', // A professional blue for sent messages
    marginRight: 5,
    borderBottomRightRadius: 5, // A subtle detail for sent messages
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White for received messages
    marginLeft: 5,
    borderBottomLeftRadius: 5, // A subtle detail for received messages
  },
  messageSenderName: {
    fontSize: 12,
    color: '#3B82F6', // Match the sender's color to the brand color
    marginBottom: 3,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Aligns items to the bottom, useful for multiline input
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  replyTextInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 120, // Prevents input from growing too large
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
