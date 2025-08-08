import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ComposeMessageModal from './ComposeMessageModal';

const { width } = Dimensions.get('window');

const messages = [
  {
    id: 1,
    sender: "Christian Lozano",
    subject: "Project Update - Q3 Goals",
    preview: "Here's the latest update on our project timeline...",
    fullMessage: "Hi team,\n\nJust wanted to provide a quick update on our Q3 goals project. We're on track to complete Phase 1 by next Friday. The latest test results are promising. Please review the attached document for detailed progress.\n\nBest,\nAlice",
    time: "10:30 AM",
    read: false,
  },
  {
    id: 2,
    sender: "Heddo Sanchez",
    subject: "Meeting Reminder",
    preview: "Don't forget about our team meeting tomorrow at...",
    fullMessage: "Hi everyone,\n\nThis is a friendly reminder about our team meeting scheduled for tomorrow, July 12, 2025, at 2:00 PM in Conference Room B. We'll be discussing the budget proposal and upcoming client presentations. Please come prepared.\n\nThanks,\nBob",
    time: "Yesterday",
    read: true,
  },
  {
    id: 3,
    sender: "Vanna Shane Pastor",
    subject: "Your recent query",
    preview: "We've received your support ticket and are working on...",
    fullMessage: "Dear User,\n\nThank you for contacting our support team regarding your query with ticket number #12345. We have received your request and are actively working on a resolution. You can track the status of your ticket at [link to support portal]. We will get back to you within 24 hours.\n\nSincerely,\nSupport Team",
    time: "2 days ago",
    read: false,
  },
  {
    id: 4,
    sender: "Andrei Arsenal",
    subject: "Feedback on the new app design",
    preview: "I've reviewed the design mockups and have some thoughts...",
    fullMessage: "Hi,\n\nI've reviewed the design mockups and have some thoughts on the user flow. Let me know when you're free to chat. Thanks.\n\nBest,\nJane",
    time: "3 days ago",
    read: true,
  },
];

const MessageTab = ({ navigation, showUnderDevelopment = true }) => {
  const [showComposeModal, setShowComposeModal] = useState(false);

  const toggleComposeModal = () => {
    setShowComposeModal(!showComposeModal);
  };

  const handleSendMessage = (recipient, subject, messageBody) => {
    console.log("Sending message:");
    console.log("Recipient:", recipient);
    console.log("Subject:", subject);
    console.log("Message:", messageBody);
    toggleComposeModal();
  };

  const handleViewMessage = (message) => {
    navigation.navigate('Chat', { message: message });
  };

  const renderMessageItem = (message) => (
    <TouchableOpacity
      key={message.id}
      style={[
        styles.messageCard,
        !message.read && styles.messageCardUnread,
      ]}
      onPress={() => handleViewMessage(message)}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {message.sender.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.messageSender,
              !message.read && styles.unreadSender,
            ]}
          >
            {message.sender}
          </Text>
          <Text style={styles.messageTime}>{message.time}</Text>
        </View>
        <Text
          style={[
            styles.messageSubject,
            !message.read && styles.unreadSubject,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {message.subject}
        </Text>
        <Text
          style={styles.messagePreview}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {message.preview}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (showUnderDevelopment) {
     return (
       <View style={styles.underDevelopmentContainer}>
         <MaterialCommunityIcons name="tools" size={60} color="#cbd5e1" />
         <Text style={styles.underDevelopmentText}>
           This feature is currently **under development** and will be
           available soon. Please check back later for updates!
         </Text>
       </View>
     );
   }

  return (
    <View style={styles.container}>
      {messages.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {messages.map(renderMessageItem)}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="email-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>No messages</Text>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleComposeModal}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>

      <ComposeMessageModal
        visible={showComposeModal}
        onClose={toggleComposeModal}
        onSend={handleSendMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Light background for a clean look
  },
  underDevelopmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  underDevelopmentText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 10,
  },
  listContainer: {
    paddingVertical: 8,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  messageCardUnread: {
    backgroundColor: '#F1F5F9', // Subtle background color for unread messages
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6', // A professional blue color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageSender: {
    fontWeight: '600',
    fontSize: 15,
    color: '#1E293B',
  },
  unreadSender: {
    fontWeight: '700',
    color: '#0F172A',
  },
  messageTime: {
    fontSize: 12,
    color: '#64748B',
  },
  messageSubject: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  unreadSubject: {
    fontWeight: '600',
    color: '#1E293B',
  },
  messagePreview: {
    fontSize: 13,
    color: '#64748B',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MessageTab;