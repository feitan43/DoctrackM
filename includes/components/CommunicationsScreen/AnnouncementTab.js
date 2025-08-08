import React, {useState} from 'react';
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
  Alert,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock library for file/image picking
const mockImagePicker = {
  launchImageLibrary: () => {
    return new Promise(resolve => {
      // Simulate user picking a file
      setTimeout(() => {
        resolve({
          assets: [
            {
              uri: 'https://i.pinimg.com/1200x/27/e9/23/27e923eb3a86a3dab2e54fbd1d4302f0.jpg',
              fileName: 'sample-image-1.jpg',
              type: 'image/jpeg',
            },
            {
              uri: 'https://i.pinimg.com/1200x/27/e9/23/27e923eb3a86a3dab2e54fbd1d4302f0.jpg',
              fileName: 'document-file.pdf',
              type: 'application/pdf',
            },
          ],
        });
      }, 500);
    });
  },
};

const AnnouncementDetailsModal = ({visible, onClose, announcement}) => {
  if (!announcement) {
    return null;
  }

  const renderAttachments = () => {
    if (!announcement.attachments || announcement.attachments.length === 0) {
      return null;
    }
    return (
      <View style={announcementDetailsStyles.attachmentsContainer}>
        <Text style={announcementDetailsStyles.attachmentsHeader}>
          Attachments
        </Text>
        {announcement.attachments.map((attachment, index) => (
          <View key={index}>
            {attachment.type === 'image' ? (
              <Image
                source={{uri: attachment.uri}}
                style={announcementDetailsStyles.attachmentImage}
              />
            ) : (
              <TouchableOpacity
                style={announcementDetailsStyles.attachmentItem}
                onPress={() =>
                  Alert.alert(
                    'Attachment Clicked',
                    `You clicked on: ${attachment.fileName}`,
                  )
                }>
                <MaterialCommunityIcons name="file" size={20} color="#3b82f6" />
                <Text style={announcementDetailsStyles.attachmentText}>
                  {attachment.fileName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}>
      <SafeAreaView style={announcementDetailsStyles.modalContainer}>
        <View style={announcementDetailsStyles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={announcementDetailsStyles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#334155"
            />
          </TouchableOpacity>
          <Text style={announcementDetailsStyles.headerTitle}>
            Announcement Details
          </Text>
          <View style={announcementDetailsStyles.placeholder} />
        </View>
        <ScrollView contentContainerStyle={announcementDetailsStyles.content}>
          <Text style={announcementDetailsStyles.title}>
            {announcement.title}
          </Text>
          {announcement.urgent && (
            <View style={announcementDetailsStyles.urgentBadge}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={14}
                color="#dc2626"
              />
              <Text style={announcementDetailsStyles.urgentBadgeText}>
                URGENT
              </Text>
            </View>
          )}
          <View style={announcementDetailsStyles.metaContainer}>
            <Text style={announcementDetailsStyles.metaText}>
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color="#64748b"
              />{' '}
              {announcement.date}
            </Text>
            <Text style={announcementDetailsStyles.metaText}>
              <MaterialCommunityIcons name="domain" size={14} color="#64748b" />{' '}
              {announcement.office}
            </Text>
          </View>
          <View style={announcementDetailsStyles.divider} />
          <Text style={announcementDetailsStyles.bodyContent}>
            {announcement.content}
          </Text>
          {renderAttachments()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const AnnouncementTab = ({selectedYear, showUnderDevelopment = true}) => {
  const initialAnnouncementsByYear = {
    2025: [
      {
        id: 1,
        title: 'Public Consultation on New City Ordinance',
        date: 'July 20, 2025',
        content:
          "The City Mayor's Office invites all citizens to a public consultation regarding the proposed 'Green City Initiative' ordinance. This is a crucial step in our city's journey towards a more sustainable and environmentally friendly future. We encourage all residents, business owners, and community leaders to attend and provide their valuable insights and feedback. The consultation will be held at the City Convention Center from 9:00 AM to 12:00 PM. Your participation is vital for shaping the future of our city.",
        urgent: true,
        office: "CITY MAYOR'S OFFICE",
        attachments: [
          {
            uri: 'https://via.placeholder.com/150/9b2c2c/ffffff?text=Proposed+Ordinance',
            fileName: 'Proposed-Ordinance-Draft.pdf',
            type: 'file',
          },
          {
            uri: 'https://via.placeholder.com/300/2c5282/ffffff?text=Consultation+Poster',
            fileName: 'Consultation-Poster.png',
            type: 'image',
          },
        ],
      },
      {
        id: 2,
        title: 'Holiday Schedule for City Hall',
        date: 'July 12, 2025',
        content:
          "The City Administrator's Office announces the special holiday schedule for City Hall operations on July 15th in observance of Local Heroes Day. All non-essential services will be suspended. Essential services, such as emergency response and public safety, will remain operational. Normal office hours will resume on July 16th. We wish everyone a meaningful and reflective holiday.",
        urgent: false,
        office: "CITY ADMINISTRATOR'S OFFICE",
        attachments: [],
      },
      {
        id: 7,
        title: 'New Business Permit Application Process',
        date: 'July 10, 2025',
        content:
          'The Business Permits and Licensing Office has streamlined the application process for new business permits to make it faster and more convenient for entrepreneurs. The new process involves an online pre-screening and a simplified one-stop-shop approach. Visit our official website for the detailed step-by-step guide and to access the new application forms. This initiative is part of our commitment to fostering a business-friendly environment in the city.',
        urgent: false,
        office: 'BUSINESS PERMITS & LICENSING OFFICE',
        attachments: [
          {
            uri: 'https://via.placeholder.com/300/6b46c1/ffffff?text=BPLO+Flowchart',
            fileName: 'BPLO-Process-Flowchart.png',
            type: 'image',
          },
        ],
      },
    ],
    2024: [
      {
        id: 3,
        title: 'Annual Performance Review - Department Heads',
        date: 'December 15, 2024',
        content:
          'The Human Resources Department reminds all department heads to submit their annual performance review reports by December 20th. Timely submission is essential for the year-end evaluation and planning for the next fiscal year. Please ensure all necessary documentation is attached and submitted through the official HR portal.',
        urgent: false,
        office: 'HUMAN RESOURCES DEPARTMENT',
        attachments: [],
      },
      {
        id: 4,
        title: 'Road Repair Project Update',
        date: 'October 5, 2024',
        content:
          'The City Engineering Office provides an update on the ongoing road repair project on Main Street. Phase 2 of the project is now underway, focusing on the section between Oak Avenue and Elm Street. Expect temporary traffic rerouting and lane closures during this period. We advise motorists to seek alternate routes and drive with caution. The project is expected to be completed by the end of October.',
        urgent: true,
        office: 'CITY ENGINEERING OFFICE',
        attachments: [
          {
            uri: 'https://via.placeholder.com/300/dd6b20/ffffff?text=Main+Street+Rerouting+Map',
            fileName: 'Main-Street-Rerouting-Map.pdf',
            type: 'file',
          },
          {
            uri: 'https://via.placeholder.com/300/38a169/ffffff?text=Construction+Photo',
            fileName: 'Construction-Photo.png',
            type: 'image',
          },
        ],
      },
    ],
    2023: [
      {
        id: 5,
        title: 'New Waste Management Guidelines',
        date: 'March 22, 2023',
        content:
          "The City Environment and Natural Resources Office has issued new guidelines for waste segregation and disposal to improve city cleanliness and promote a more sustainable community. The new policy includes specific schedules for the collection of biodegradable and non-biodegradable waste. Educational seminars will be conducted in various barangays to ensure residents are well-informed. Let's work together to make our city cleaner and greener.",
        urgent: false,
        office: 'CITY ENVIRONMENT & NATURAL RESOURCES OFFICE',
        attachments: [],
      },
    ],
    2022: [
      {
        id: 6,
        title: 'Launch of E-Services Portal',
        date: 'January 10, 2022',
        content:
          'The Information Technology Department proudly announces the launch of the new E-Services Portal, a major step towards digital governance. This portal allows citizens to access a variety of government services online, including applying for certain permits, paying taxes, and checking the status of their requests, all from the comfort of their homes. This initiative aims to make government transactions more accessible, efficient, and transparent.',
        urgent: false,
        office: 'INFORMATION TECHNOLOGY DEPARTMENT',
        attachments: [],
      },
    ],
  };

  const [announcementsByYear, setAnnouncementsByYear] = useState(
    initialAnnouncementsByYear,
  );
  const [composeModalVisible, setComposeModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newUrgent, setNewUrgent] = useState(false);
  const [newOffice, setNewOffice] = useState('');
  const [newAttachments, setNewAttachments] = useState([]);
  const [contentInputHeight, setContentInputHeight] = useState(100);

  const announcements = announcementsByYear[selectedYear] || [];

  const handleComposeAnnouncement = () => {
    if (
      newTitle.trim() === '' ||
      newContent.trim() === '' ||
      newDate.trim() === '' ||
      newOffice.trim() === ''
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (Title, Content, Date, Office).',
      );
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: newTitle.trim(),
      date: newDate.trim(),
      content: newContent.trim(),
      urgent: newUrgent,
      office: newOffice.trim(),
      attachments: newAttachments,
    };

    setAnnouncementsByYear(prev => ({
      ...prev,
      [selectedYear]: [...(prev[selectedYear] || []), newAnnouncement],
    }));

    console.log('New Announcement:', newAnnouncement);
    resetForm();
    setComposeModalVisible(false);
  };

  const handlePickAttachment = async () => {
    try {
      const result = await mockImagePicker.launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 5,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const newAttachedFiles = result.assets.map(asset => ({
          uri: asset.uri,
          fileName: asset.fileName || 'file.jpg',
          type:
            asset.type && asset.type.startsWith('image/') ? 'image' : 'file',
        }));
        setNewAttachments(prev => [...prev, ...newAttachedFiles]);
      }
    } catch (e) {
      console.error('Error picking attachment:', e);
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const handleRemoveAttachment = index => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewDate('');
    setNewUrgent(false);
    setNewOffice('');
    setNewAttachments([]);
    setContentInputHeight(100);
  };

  const handleOpenDetails = announcement => {
    setSelectedAnnouncement(announcement);
    setDetailsModalVisible(true);
  };

  if (showUnderDevelopment) {
    return (
      <View style={styles.underDevelopmentContainer}>
        <MaterialCommunityIcons name="tools" size={60} color="#cbd5e1" />
        <Text style={styles.underDevelopmentText}>
          This feature is currently **under development** and will be available
          soon. Please check back later for updates!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.announcementContainer}>
      <Text style={styles.sectionHeader}>Announcements for {selectedYear}</Text>

      <TouchableOpacity
        style={styles.composeButton}
        onPress={() => setComposeModalVisible(true)}>
        <MaterialCommunityIcons name="pencil-plus" size={20} color="#fff" />
        <Text style={styles.composeButtonText}>Compose New Announcement</Text>
      </TouchableOpacity>

      {/* Compose Announcement Modal */}
      <Modal
        animationType="none"
        transparent={false}
        visible={composeModalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setComposeModalVisible(!composeModalVisible);
          resetForm();
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.formTitle}>New Announcement</Text>
                <TouchableOpacity
                  onPress={() => {
                    setComposeModalVisible(false);
                    resetForm();
                  }}
                  style={styles.closeButton}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={24}
                    color="#64748b"
                  />
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
                style={[
                  styles.input,
                  {height: Math.max(100, contentInputHeight)},
                ]}
                placeholder="Content"
                value={newContent}
                onChangeText={setNewContent}
                multiline
                onContentSizeChange={event => {
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
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={newUrgent ? '#3b82f6' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setNewUrgent}
                  value={newUrgent}
                />
              </View>
              <View style={styles.attachmentsPickerContainer}>
                <Text style={styles.attachmentsPickerLabel}>Attachments</Text>
                <TouchableOpacity
                  style={styles.attachmentsPickerButton}
                  onPress={handlePickAttachment}>
                  <MaterialCommunityIcons
                    name="paperclip"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.attachmentsPickerButtonText}>
                    Attach File/Image
                  </Text>
                </TouchableOpacity>
              </View>
              {newAttachments.length > 0 && (
                <View style={styles.attachedFilesContainer}>
                  {newAttachments.map((attachment, index) => (
                    <View key={index} style={styles.attachedFileItem}>
                      <View style={styles.attachedFileInfo}>
                        <MaterialCommunityIcons
                          name={attachment.type === 'image' ? 'image' : 'file'}
                          size={18}
                          color="#475569"
                        />
                        <Text style={styles.attachedFileName}>
                          {attachment.fileName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveAttachment(index)}>
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={18}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.formButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setComposeModalVisible(false);
                    resetForm();
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleComposeAnnouncement}>
                  <Text style={styles.submitButtonText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Announcement Details Modal */}
      <AnnouncementDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        announcement={selectedAnnouncement}
      />

      {/* Existing Announcements Display */}
      {announcements.length > 0 ? (
        announcements.map(announcement => (
          <TouchableOpacity
            key={announcement.id}
            onPress={() => handleOpenDetails(announcement)}
            style={[
              styles.announcementCard,
              announcement.urgent && styles.urgentCard,
            ]}>
            {announcement.urgent && (
              <View style={styles.urgentBadge}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={14}
                  color="#dc2626"
                />
                <Text style={styles.urgentBadgeText}>URGENT</Text>
              </View>
            )}
            <View style={styles.announcementHeader}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementDate}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={12}
                  color="#64748b"
                />{' '}
                {announcement.date}
              </Text>
            </View>
            {announcement.office && (
              <Text style={styles.announcementOffice}>
                <MaterialCommunityIcons
                  name="domain"
                  size={12}
                  color="#64748b"
                />{' '}
                {announcement.office}
              </Text>
            )}
            <Text
              style={styles.announcementContent}
              numberOfLines={3}
              ellipsizeMode="tail">
              {announcement.content}
            </Text>
            <View style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read more</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color="#4a6da7"
              />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="bullhorn-outline"
            size={48}
            color="#cbd5e1"
          />
          <Text style={styles.emptyStateText}>
            No announcements for {selectedYear}
          </Text>
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
    marginHorizontal: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
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
    marginBottom: 4,
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
  announcementOffice: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
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
    shadowOffset: {width: 0, height: 1},
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
    marginBottom: 20,
  },
  viewAllButtonText: {
    color: '#4a6da7',
    fontSize: 16,
    fontWeight: '600',
  },
  // Compose Announcement specific styles
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
    shadowOffset: {width: 0, height: 1},
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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    top: 50,
  },
  modalContent: {
    flexGrow: 1,
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
  attachmentsPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attachmentsPickerLabel: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  attachmentsPickerButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  attachmentsPickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  attachedFilesContainer: {
    marginBottom: 16,
  },
  attachedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  attachedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  attachedFileName: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    flexShrink: 1,
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

const announcementDetailsStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  urgentBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
    marginLeft: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  bodyContent: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  attachmentsContainer: {
    marginTop: 24,
  },
  attachmentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 14,
    color: '#4a6da7',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 12,
  },
});

export default AnnouncementTab;
