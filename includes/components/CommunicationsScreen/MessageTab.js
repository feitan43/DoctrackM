import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import ComposeMessageModal from './ComposeMessageModal'; // Still used for composing new messages

// --- IMPORTANT: Receive 'navigation' prop here ---
const MessageTab = ({ navigation, showUnderDevelopment = true }) => { // <--- Add navigation prop
  const [showComposeModal, setShowComposeModal] = useState(false);

  // No need for selectedMessage or showDetailModal states here anymore
  // as we are navigating to a new screen.

  const messages = [
    {
      id: 1,
      sender: "Alice Johnson",
      subject: "Project Update - Q3 Goals",
      preview: "Here's the latest update on our project timeline...",
      fullMessage: "Hi team,\n\nJust wanted to provide a quick update on our Q3 goals project. We're on track to complete Phase 1 by next Friday. The latest test results are promising. Please review the attached document for detailed progress.\n\nBest,\nAlice",
      time: "10:30 AM",
      read: false
    },
    {
      id: 2,
      sender: "Bob Smith",
      subject: "Meeting Reminder",
      preview: "Don't forget about our team meeting tomorrow at...",
      fullMessage: "Hi everyone,\n\nThis is a friendly reminder about our team meeting scheduled for tomorrow, July 12, 2025, at 2:00 PM in Conference Room B. We'll be discussing the budget proposal and upcoming client presentations. Please come prepared.\n\nThanks,\nBob",
      time: "Yesterday",
      read: true
    },
    {
      id: 3,
      sender: "Support Team",
      subject: "Your recent query",
      preview: "We've received your support ticket and are working on...",
      fullMessage: "Dear User,\n\nThank you for contacting our support team regarding your query with ticket number #12345. We have received your request and are actively working on a resolution. You can track the status of your ticket at [link to support portal]. We will get back to you within 24 hours.\n\nSincerely,\nSupport Team",
      time: "2 days ago",
      read: false
    },
  ];

  const toggleComposeModal = () => {
    setShowComposeModal(!showComposeModal);
  };

  const handleSendMessage = (recipient, subject, messageBody) => {
    console.log("Sending message:");
    console.log("Recipient:", recipient);
    console.log("Subject:", subject);
    console.log("Message:", messageBody);
    toggleComposeModal();
    // In a real app, update message list or show success
  };

  // --- New navigation handler ---
  const handleViewMessage = (message) => {
    navigation.navigate('Chat', { message: message }); // Pass the entire message object
    // You might also want to mark the message as read in your actual data store here
  };

  return (
    <View style={styles.messageContainer}>
      {showUnderDevelopment ? (
        <View style={styles.underDevelopmentContainer}>
          <MaterialCommunityIcons name="tools" size={60} color="#cbd5e1" />
          <Text style={styles.underDevelopmentText}>
            This feature is currently **under development** and will be
            available soon. Please check back later for updates!
          </Text>
        </View>
      ) : (
        <>
      <View style={styles.messageHeader}>
        <Text style={styles.sectionHeader}>Your Messages</Text>
        <TouchableOpacity style={styles.composeButton} onPress={toggleComposeModal}>
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
          <Text style={styles.composeButtonText}>Compose</Text>
        </TouchableOpacity>
      </View>

      {messages.length > 0 ? (
        messages.map(message => (
          <TouchableOpacity
            key={message.id}
            style={[
              styles.messageCard,
              !message.read && styles.messageCardUnread
            ]}
            onPress={() => handleViewMessage(message)} // Call the new navigation handler
          >
            {!message.read && <View style={styles.newIndicator} />}
            <View style={styles.messageContent}>
              <View style={styles.messageHeaderRow}>
                <Text style={[
                  styles.messageSender,
                  !message.read && styles.unreadText
                ]}>
                  {message.sender}
                </Text>
                <Text style={styles.messageTime}>{message.time}</Text>
              </View>
              <Text style={[
                styles.messageSubject,
                !message.read && styles.unreadText
              ]}>
                {message.subject}
              </Text>
              <Text style={styles.messagePreview}>{message.preview}</Text>
              {!message.read && (
                <View style={styles.messageStatus}>
                  <MaterialCommunityIcons name="circle" size={12} color="#4a6da7" />
                  <Text style={styles.messageStatusText}>New</Text>
                </View>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="email-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>No messages</Text>
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>View All Messages</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Compose Message Modal remains for composing new messages */}
      <ComposeMessageModal
        visible={showComposeModal}
        onClose={toggleComposeModal}
        onSend={handleSendMessage}
      />

      {/* MessageDetailModal is no longer needed here */}
      {/* <MessageDetailModal ... /> */}
      </>
      )}
    </View>
  );
};

export default MessageTab;