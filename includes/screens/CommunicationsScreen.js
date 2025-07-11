import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Main App Component
const CommunicationsScreen = () => {
  const [activeTab, setActiveTab] = useState('announcement');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const years = ['2025', '2024', '2023', '2022'];

  const renderContent = () => {
    switch (activeTab) {
      case 'announcement':
        return <AnnouncementTab selectedYear={selectedYear} />;
      case 'forums':
        return <ForumsTab selectedYear={selectedYear} />;
      case 'message':
        return <MessageTab />;
      default:
        return <AnnouncementTab selectedYear={selectedYear} />;
    }
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerText}>Communications</Text>
            <TouchableOpacity 
              style={styles.yearSelector}
              onPress={() => setShowYearDropdown(true)}
            >
              <Text style={styles.yearText}>{selectedYear}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtext}>Stay connected with your community</Text>
        </View>

        {/* Year Dropdown Modal */}
        <Modal
          visible={showYearDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearDropdown(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowYearDropdown(false)}>
            <View style={styles.dropdownOverlay}>
              <View style={styles.dropdownContainer}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dropdownItem,
                      year === selectedYear && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={styles.dropdownItemText}>{year}</Text>
                    {year === selectedYear && (
                      <MaterialCommunityIcons name="check" size={18} color="#4a6da7" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TabButton
            title="Announcements"
            isActive={activeTab === 'announcement'}
            onClick={() => setActiveTab('announcement')}
            icon={
              <MaterialCommunityIcons 
                name="bullhorn-outline" 
                size={24} 
                color={activeTab === 'announcement' ? '#4a6da7' : '#64748b'} 
              />
            }
          />
          <TabButton
            title="Forums"
            isActive={activeTab === 'forums'}
            onClick={() => setActiveTab('forums')}
            icon={
              <MaterialCommunityIcons 
                name="forum-outline" 
                size={24} 
                color={activeTab === 'forums' ? '#4a6da7' : '#64748b'} 
              />
            }
          />
          <TabButton
            title="Messages"
            isActive={activeTab === 'message'}
            onClick={() => setActiveTab('message')}
            icon={
              <MaterialCommunityIcons 
                name="email-outline" 
                size={24} 
                color={activeTab === 'message' ? '#4a6da7' : '#64748b'} 
              />
            }
          />
        </View>

        {/* Content Area */}
        <ScrollView 
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

// Tab Button Component
const TabButton = ({ title, isActive, onClick, icon }) => {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive ? styles.tabButtonActive : styles.tabButtonInactive,
      ]}
      onPress={onClick}
    >
      <View style={styles.tabButtonContent}>
        {icon}
        <Text style={[
          styles.tabButtonText,
          isActive ? styles.tabButtonTextActive : styles.tabButtonTextInactive
        ]}>
          {title}
        </Text>
      </View>
      {isActive && <View style={styles.activeTabIndicator} />}
    </TouchableOpacity>
  );
};

// Announcement Tab Content
const AnnouncementTab = ({ selectedYear }) => {
  const announcementsByYear = {
    '2025': [
      { 
        id: 1, 
        title: "System Maintenance", 
        date: "July 15, 2025", 
        content: "Scheduled maintenance on July 15th from 2 AM to 4 AM PST. Services may be temporarily unavailable.", 
        urgent: true 
      },
      { 
        id: 2, 
        title: "New Feature Rollout", 
        date: "July 12, 2025", 
        content: "Exciting new features for messaging are now live! Check them out in the Message tab.", 
        urgent: false 
      },
    ],
    '2024': [
      { 
        id: 3, 
        title: "Year-End Review", 
        date: "December 15, 2024", 
        content: "Our annual year-end review highlights the major improvements we've made this year.", 
        urgent: false 
      },
      { 
        id: 4, 
        title: "Mobile App Update", 
        date: "October 5, 2024", 
        content: "Version 2.5 of our mobile app is now available with improved performance.", 
        urgent: true 
      },
    ],
    '2023': [
      { 
        id: 5, 
        title: "New Community Guidelines", 
        date: "March 22, 2023", 
        content: "We've updated our community guidelines to create a better experience for everyone.", 
        urgent: false 
      },
    ],
    '2022': [
      { 
        id: 6, 
        title: "Platform Launch", 
        date: "January 10, 2022", 
        content: "Welcome to our new communications platform! We're excited to have you here.", 
        urgent: false 
      },
    ]
  };

  const announcements = announcementsByYear[selectedYear] || [];

  return (
    <View style={styles.announcementContainer}>
      <Text style={styles.sectionHeader}>Announcements for {selectedYear}</Text>
      
      {announcements.length > 0 ? (
        announcements.map(announcement => (
          <View key={announcement.id} style={[
            styles.announcementCard,
            announcement.urgent && styles.urgentCard
          ]}>
            {announcement.urgent && (
              <View style={styles.urgentBadge}>
                <MaterialCommunityIcons name="alert-circle" size={14} color="#dc2626" />
                <Text style={styles.urgentBadgeText}>URGENT</Text>
              </View>
            )}
            <View style={styles.announcementHeader}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementDate}>
                <MaterialCommunityIcons name="calendar" size={12} color="#64748b" /> {announcement.date}
              </Text>
            </View>
            <Text style={styles.announcementContent}>{announcement.content}</Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read more</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#4a6da7" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bullhorn-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>No announcements for {selectedYear}</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllButtonText}>View All Announcements</Text>
      </TouchableOpacity>
    </View>
  );
};

// Forums Tab Content
const ForumsTab = ({ selectedYear }) => {
  const forumsByYear = {
    '2025': [
      { 
        id: 1, 
        title: "General Discussion", 
        posts: 124, 
        lastPost: "John Doe", 
        time: "1 hour ago", 
        newPosts: 3 
      },
      { 
        id: 2, 
        title: "Technical Support", 
        posts: 89, 
        lastPost: "Jane Smith", 
        time: "3 hours ago", 
        newPosts: 0 
      },
    ],
    '2024': [
      { 
        id: 3, 
        title: "Feature Requests", 
        posts: 56, 
        lastPost: "Community Manager", 
        time: "December 12, 2024", 
        newPosts: 0 
      },
      { 
        id: 4, 
        title: "Bug Reports", 
        posts: 34, 
        lastPost: "Developer", 
        time: "November 5, 2024", 
        newPosts: 0 
      },
    ],
    '2023': [
      { 
        id: 5, 
        title: "Archived Discussions", 
        posts: 201, 
        lastPost: "Moderator", 
        time: "June 15, 2023", 
        newPosts: 0 
      },
    ],
    '2022': [
      { 
        id: 6, 
        title: "Old Announcements", 
        posts: 78, 
        lastPost: "Admin", 
        time: "March 3, 2022", 
        newPosts: 0 
      },
    ]
  };

  const forumTopics = forumsByYear[selectedYear] || [];

  return (
    <View style={styles.forumContainer}>
      <Text style={styles.sectionHeader}>Forum Activity for {selectedYear}</Text>
      
      {forumTopics.length > 0 ? (
        forumTopics.map(topic => (
          <View key={topic.id} style={styles.forumCard}>
            <View style={styles.forumInfo}>
              <Text style={styles.forumTitle}>{topic.title}</Text>
              <View style={styles.forumStatsContainer}>
                <MaterialCommunityIcons name="comment-text-multiple" size={14} color="#64748b" />
                <Text style={styles.forumStats}>{topic.posts} posts</Text>
              </View>
            </View>
            <View style={styles.forumActivity}>
              <View style={styles.lastPostContainer}>
                <Text style={styles.lastPostLabel}>Last post:</Text>
                <Text style={styles.lastPostUser}>{topic.lastPost}</Text>
                <Text style={styles.lastPostTime}>{topic.time}</Text>
              </View>
              {topic.newPosts > 0 && (
                <View style={styles.newPostsBadge}>
                  <MaterialCommunityIcons name="message-badge" size={14} color="#4a6da7" />
                  <Text style={styles.newPostsText}>{topic.newPosts} new</Text>
                </View>
              )}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="forum-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>No forum activity for {selectedYear}</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Browse All Forums</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// Message Tab Content
const MessageTab = () => {
  const messages = [
    { 
      id: 1, 
      sender: "Alice Johnson", 
      subject: "Project Update - Q3 Goals", 
      preview: "Here's the latest update on our project timeline...", 
      time: "10:30 AM", 
      read: false 
    },
    { 
      id: 2, 
      sender: "Bob Smith", 
      subject: "Meeting Reminder", 
      preview: "Don't forget about our team meeting tomorrow at...", 
      time: "Yesterday", 
      read: true 
    },
    { 
      id: 3, 
      sender: "Support Team", 
      subject: "Your recent query", 
      preview: "We've received your support ticket and are working on...", 
      time: "2 days ago", 
      read: false 
    },
  ];

  return (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Text style={styles.sectionHeader}>Your Messages</Text>
        <TouchableOpacity style={styles.composeButton}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#4a6da7',
    padding: 24,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtext: {
    color: '#dbe4f5',
    fontSize: 14,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  yearText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#334155',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    position: 'relative',
  },
  tabButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  tabButtonTextActive: {
    color: '#4a6da7',
  },
  tabButtonTextInactive: {
    color: '#64748b',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '50%',
    height: 3,
    backgroundColor: '#4a6da7',
    borderRadius: 3,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  // Announcement Tab Styles
  announcementContainer: {
    marginBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadgeText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  announcementHeader: {
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  announcementDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  announcementContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  // Forum Tab Styles
  forumContainer: {
    marginBottom: 16,
  },
  forumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forumInfo: {
    flex: 1,
  },
  forumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  forumStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  forumStats: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  forumActivity: {
    alignItems: 'flex-end',
  },
  lastPostContainer: {
    marginBottom: 4,
  },
  lastPostLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  lastPostUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  lastPostTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  newPostsBadge: {
    backgroundColor: '#dbe4f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newPostsText: {
    color: '#4a6da7',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  // Message Tab Styles
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  composeButton: {
    backgroundColor: '#4a6da7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  composeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  messageCardUnread: {
    backgroundColor: '#f8fafc',
    borderColor: '#4a6da7',
  },
  newIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#4a6da7',
  },
  messageContent: {
    flex: 1,
    marginRight: 8,
  },
  messageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  unreadText: {
    color: '#1e293b',
    fontWeight: '700',
  },
  messageTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  messageStatusText: {
    color: '#4a6da7',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Shared Button Styles
  primaryButton: {
    width: '100%',
    backgroundColor: '#4a6da7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#4a6da7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  viewAllButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  viewAllButtonText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CommunicationsScreen;