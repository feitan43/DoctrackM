import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const handleSelect = (itemValue) => {
    onSelect(itemValue);
    setModalVisible(false);
  };
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.dropdownButton}
      >
        <Text style={styles.dropdownText} numberOfLines={1}>{value}</Text>
        <Icon name="chevron-down-outline" size={20} color="#90A4AE" />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <ScrollView style={styles.modalScrollView}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(option)}
                  style={styles.modalItem}
                >
                  <Text style={styles.modalItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function ELogsDetailsScreen({ route, navigation }) {
  const { document } = route.params;

  const [documentType, setDocumentType] = useState(document.Type);
  const [status, setStatus] = useState(document.Status);
  const [from, setFrom] = useState(document.Sender);
  const [to, setTo] = useState(document.Receiver);
  const [subject, setSubject] = useState(document.Subject);
  const [remarks, setRemarks] = useState(document.Remarks);

  const [dateReceived, setDateReceived] = useState(() => {
    const dateValue = document.DateReceived;
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return new Date();
  });

  const [dateReleased, setDateReleased] = useState(() => {
    const dateValue = document.DateReleased;
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  });

  const [openDateReceivedPicker, setOpenDateReceivedPicker] = useState(false);
  const [openDateReleasedPicker, setOpenDateReleasedPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Mock data for dropdowns
  const mockDocumentTypes = [
    'Endorsement',
    'REQUEST LETTER',
    '1ST INDORSEMENT',
    'MEMORANDUM',
  ];
  const mockStatuses = [
    'ENCODED',
    'RELEASE',
    'Forwarded',
    'Pending',
    'Endorsement',
    'Further Discussion',
  ];
  const mockFromTo = ['N/A', 'CITY ADMIN OFFICE', 'VAL BALANGUE'];

  const handleSaveChanges = () => {
    Alert.alert('Success', 'Document details updated successfully!');
    navigation.goBack();
  };

  const handleImagePicker = async (type) => {
    let result;
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    if (type === 'library') {
      result = await launchImageLibrary(options);
    } else {
      result = await launchCamera(options);
    }

    if (result.assets && result.assets.length > 0) {
      setAttachedFiles(prevFiles => [...prevFiles, ...result.assets]);
    }
  };

  const removeFile = (indexToRemove) => {
    setAttachedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date & Time';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={30} color="#1A535C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Details</Text>
        </View>

        <ScrollView style={styles.scrollViewContent}>
          <View style={styles.content}>
            {/* Document Info Section */}
            <View style={styles.card}>
              <Text style={styles.tnLabel}>Tracking Number:</Text>
              <Text style={styles.tnValue}>{document.TrackingNumber}</Text>

              <View style={styles.encodedInfo}>
                <Text style={styles.encodedLabel}>Encoded By: <Text style={styles.encodedValue}>{document.EncodedBy}</Text></Text>
                <Text style={styles.encodedLabel}>Date Encoded: <Text style={styles.encodedValue}>{document.DateEncoded}</Text></Text>
              </View>
            </View>

            {/* Form Fields Section */}
            <View style={styles.formSection}>
              <View style={styles.inputRow}>
                <CustomDropdown
                  label="Document Type"
                  value={documentType}
                  options={mockDocumentTypes}
                  onSelect={setDocumentType}
                />
                <CustomDropdown
                  label="Status"
                  value={status}
                  options={mockStatuses}
                  onSelect={setStatus}
                />
              </View>

              <View style={styles.inputRow}>
                <CustomDropdown
                  label="From"
                  value={from}
                  options={mockFromTo}
                  onSelect={setFrom}
                />
                <CustomDropdown
                  label="To"
                  value={to}
                  options={mockFromTo}
                  onSelect={setTo}
                />
              </View>

              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.fieldLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Enter subject"
                  placeholderTextColor="#90A4AE"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.fieldLabel}>Date Received</Text>
                  <TouchableOpacity onPress={() => setOpenDateReceivedPicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>{formatDate(dateReceived)}</Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={openDateReceivedPicker}
                    date={dateReceived}
                    onConfirm={(date) => {
                      setOpenDateReceivedPicker(false);
                      setDateReceived(date);
                    }}
                    onCancel={() => {
                      setOpenDateReceivedPicker(false);
                    }}
                  />
                </View>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.fieldLabel}>Date Released</Text>
                  <TouchableOpacity onPress={() => setOpenDateReleasedPicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>{formatDate(dateReleased)}</Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={openDateReleasedPicker}
                    date={dateReleased || new Date()}
                    onConfirm={(date) => {
                      setOpenDateReleasedPicker(false);
                      setDateReleased(date);
                    }}
                    onCancel={() => {
                      setOpenDateReleasedPicker(false);
                    }}
                  />
                </View>
              </View>

              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.fieldLabel}>Remarks</Text>
                <TextInput
                  style={[styles.textInput, styles.remarksInput]}
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  placeholder="Add remarks here..."
                  placeholderTextColor="#90A4AE"
                />
              </View>
            </View>

            {/* Attach Files Section */}
            <View style={styles.card}>
              <Text style={styles.attachFilesLabel}>Attach Files</Text>
              <View style={styles.attachButtonsContainer}>
                <TouchableOpacity onPress={() => handleImagePicker('library')} style={[styles.attachButton, { marginRight: 10 }]}>
                  <Icon name="image-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.attachButtonText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleImagePicker('camera')} style={styles.attachButton}>
                  <Icon name="camera-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.attachButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fileListContainer}>
                {attachedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <View style={styles.fileIconContainer}>
                      {file.uri ? (
                        <Image source={{ uri: file.uri }} style={styles.fileThumbnail} />
                      ) : (
                        <Icon name="document-outline" size={20} color="#4A6572" />
                      )}
                      <Text style={styles.fileName}>{file.fileName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFile(index)} style={styles.deleteButton}>
                      <Icon name="close-circle" size={24} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Changes Button */}
        <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e9ebee',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A535C',
  },
  scrollViewContent: {
    flex: 1,
    backgroundColor: '#e9ebee',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  formSection: {
    marginBottom: 20,
  },
  tnLabel: {
    fontSize: 16,
    color: '#4A6572',
  },
  tnValue: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#1A535C',
    marginBottom: 10,
  },
  encodedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#CFD8DC',
    paddingTop: 10,
  },
  encodedLabel: {
    fontSize: 12,
    color: '#90A4AE',
  },
  encodedValue: {
    fontWeight: '600',
    color: '#4A6572',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 10,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#34495E',
    flex: 1,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A6572',
  },
  fullWidthInputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    color: '#34495E',
    fontSize: 16,
  },
  remarksInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    fontSize: 16,
    color: '#34495E',
  },
  attachFilesLabel: {
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 16,
    color: '#1A535C',
  },
  attachButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  attachButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  attachButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 5,
  },
  fileListContainer: {
    marginTop: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  fileIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginRight: 10,
  },
  fileName: {
    marginLeft: 10,
    color: '#34495E',
    flexShrink: 1,
  },
  deleteButton: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#1A535C',
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1A535C',
  },
  modalScrollView: {
    maxHeight: 250,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#34495E',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
  },
});

export default ELogsDetailsScreen;