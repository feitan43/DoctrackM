import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  ScrollView,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AnnouncementTab = ({ selectedYear }) => {
  // Static data for announcements, now including office information
  const initialAnnouncementsByYear = {
    '2025': [
      {
        id: 1,
        title: "Public Consultation on New City Ordinance",
        date: "July 20, 2025",
        content: "The City Mayor's Office invites all citizens to a public consultation regarding the proposed 'Green City Initiative' ordinance. Your input is valuable!",
        urgent: true,
        office: "CITY MAYOR'S OFFICE"
      },
      {
        id: 2,
        title: "Holiday Schedule for City Hall",
        date: "July 12, 2025",
        content: "The City Administrator's Office announces the special holiday schedule for City Hall operations on July 15th in observance of Local Heroes Day.",
        urgent: false,
        office: "CITY ADMINISTRATOR'S OFFICE"
      },
      {
        id: 7,
        title: "New Business Permit Application Process",
        date: "July 10, 2025",
        content: "The Business Permits and Licensing Office has streamlined the application process for new business permits. Visit our website for details.",
        urgent: false,
        office: "BUSINESS PERMITS & LICENSING OFFICE"
      },
    ],
    '2024': [
      {
        id: 3,
        title: "Annual Performance Review - Department Heads",
        date: "December 15, 2024",
        content: "The Human Resources Department reminds all department heads to submit their annual performance review reports by December 20th.",
        urgent: false,
        office: "HUMAN RESOURCES DEPARTMENT"
      },
      {
        id: 4,
        title: "Road Repair Project Update",
        date: "October 5, 2024",
        content: "The City Engineering Office provides an update on the ongoing road repair project on Main Street. Expect temporary traffic rerouting.",
        urgent: true,
        office: "CITY ENGINEERING OFFICE"
      },
    ],
    '2023': [
      {
        id: 5,
        title: "New Waste Management Guidelines",
        date: "March 22, 2023",
        content: "The City Environment and Natural Resources Office has issued new guidelines for waste segregation and disposal to improve city cleanliness.",
        urgent: false,
        office: "CITY ENVIRONMENT & NATURAL RESOURCES OFFICE"
      },
    ],
    '2022': [
      {
        id: 6,
        title: "Launch of E-Services Portal",
        date: "January 10, 2022",
        content: "The Information Technology Department proudly announces the launch of the new E-Services Portal, making government transactions more accessible online.",
        urgent: false,
        office: "INFORMATION TECHNOLOGY DEPARTMENT"
      },
    ]
  };

  // State to manage announcements (allowing "addition" in UI for demonstration)
  const [announcementsByYear, setAnnouncementsByYear] = useState(initialAnnouncementsByYear);

  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // States for new announcement input fields
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState(''); // Simple text input for date
  const [newUrgent, setNewUrgent] = useState(false);
  const [newOffice, setNewOffice] = useState(''); // New state for office name
  // New state for dynamic content input height
  const [contentInputHeight, setContentInputHeight] = useState(100); // Initial height for textArea

  const announcements = announcementsByYear[selectedYear] || [];

  // Function to handle submitting a new announcement
  const handleComposeAnnouncement = () => {
    if (newTitle.trim() === '' || newContent.trim() === '' || newDate.trim() === '' || newOffice.trim() === '') {
      console.warn("Please fill in all fields for the announcement.");
      return;
    }

    const newAnnouncement = {
      id: Date.now(), // Unique ID for demonstration
      title: newTitle.trim(),
      date: newDate.trim(),
      content: newContent.trim(),
      urgent: newUrgent,
      office: newOffice.trim(), // Include the new office field
    };

    setAnnouncementsByYear(prev => ({
      ...prev,
      [selectedYear]: [...(prev[selectedYear] || []), newAnnouncement]
    }));

    console.log("New Announcement:", newAnnouncement);

    // Clear form and hide the modal
    setNewTitle('');
    setNewContent('');
    setNewDate('');
    setNewUrgent(false);
    setNewOffice(''); // Clear new office field
    setContentInputHeight(100); // Reset height when form is cleared
    setModalVisible(false); // Hide the modal after submission
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewDate('');
    setNewUrgent(false);
    setNewOffice(''); // Reset new office field
    setContentInputHeight(100);
  };

  return (
    <ScrollView style={styles.announcementContainer}>
      <Text style={styles.sectionHeader}>Announcements for {selectedYear}</Text>

      {/* Compose New Announcement Button */}
      <TouchableOpacity style={styles.composeButton} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="pencil-plus" size={20} color="#fff" />
        <Text style={styles.composeButtonText}>Compose New Announcement</Text>
      </TouchableOpacity>

      {/* Compose Announcement Modal */}
      <Modal
        animationType="none"
        transparent={false}
        visible={modalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm(); // Reset form fields when modal is closed without submitting
        }}
      >
        {/* KeyboardAvoidingView wrapped around SafeAreaView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // 'padding' for iOS, 'height' or 'position' for Android
          style={styles.keyboardAvoidingContainer}
          // Adjust this offset if there's a custom header or other elements
          // For a full-screen modal, 0 might be fine, but can be tweaked if needed
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* ScrollView contentContainerStyle is for the content within ScrollView */}
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.formTitle}>New Announcement</Text>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Office (e.g., City Mayor's Office)"
                value={newOffice}
                onChangeText={setNewOffice}
              />
              <TextInput
                style={[styles.input, { height: Math.max(100, contentInputHeight) }]} // Apply dynamic height here
                placeholder="Content"
                value={newContent}
                onChangeText={setNewContent}
                multiline
                onContentSizeChange={(event) => { // This is the key prop
                  setContentInputHeight(event.nativeEvent.contentSize.height);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Date (e.g., July 12, 2025)"
                value={newDate}
                onChangeText={setNewDate}
              />
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Mark as Urgent:</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={newUrgent ? "#3b82f6" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setNewUrgent}
                  value={newUrgent}
                />
              </View>
              <View style={styles.formButtonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleComposeAnnouncement}>
                  <Text style={styles.submitButtonText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Existing Announcements Display */}
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
            {announcement.office && ( // Display office if available
              <Text style={styles.announcementOffice}>
                <MaterialCommunityIcons name="domain" size={12} color="#64748b" /> {announcement.office}
              </Text>
            )}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  announcementContainer: {
    flex: 1,
    padding: 5,
    //backgroundColor: '#f8fafc',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal:1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
    marginLeft: 4,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Adjusted for new office line
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flexShrink: 1,
    marginRight: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: '#64748b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementOffice: { // New style for office name
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8, // Space between office and content
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementContent: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  readMoreText: {
    fontSize: 14,
    color: '#4a6da7',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
  },
  viewAllButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20, // Add some bottom margin for scrollview
  },
  viewAllButtonText: {
    color: '#4a6da7',
    fontSize: 16,
    fontWeight: '600',
  },

  // Styles for Compose Announcement functionality
  composeButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  composeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal specific styles
  keyboardAvoidingContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    top:50
  },
  modalContent: {
    flexGrow: 1, // Allows content to grow and scroll if needed
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 5,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#334155',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnnouncementTab;
