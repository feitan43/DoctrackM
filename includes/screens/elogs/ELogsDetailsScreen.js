import React, {useState, useEffect} from 'react';
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
  Linking,
  PermissionsAndroid,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import {launchCamera} from 'react-native-image-picker';
import {pick, types, isCancel} from '@react-native-documents/picker';
import {
  useElogsLetterTypes,
  useElogsOffices,
  useElogsStatuses,
  useElogsAttachments,
  useLatestTN,
  useUpdateLetter,
  useElogsLetterDetails, // Corrected: This import was missingf
} from '../../hooks/useElogs';
import PdfViewer from '../../utils/PDFViewer';
import {formatDate, formatDateTime} from '../../utils';

// Updated Color Palette
const COLORS = {
  primary: '#007bff',
  secondary: '#60A5FA',
  background: '#F0F4F8',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#34D399',
  error: '#DC2626',
  subtle: '#9CA3AF',
};

// Typography for Montserrat
const FONT = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  bold: 'Montserrat-Bold',
  semiBold: 'Montserrat-SemiBold',
};

const CustomDropdown = ({
  label,
  value,
  options,
  onSelect,
  keyToShow,
  colorKey,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const handleSelect = itemValue => {
    onSelect(itemValue);
    setModalVisible(false);
  };

  const displayText = value?.[keyToShow] || `Select ${label}`;
  const displayColor = value?.[colorKey] || styles.dropdownText.color;

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.dropdownButton}>
        <Text
          style={[styles.dropdownText, {color: displayColor}]}
          numberOfLines={1}>
          {displayText}
        </Text>
        <Icon
          name="chevron-down-outline"
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <ScrollView style={styles.modalScrollView}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(option)}
                  style={styles.modalItem}>
                  <Text
                    style={[
                      styles.modalItemText,
                      {color: option[colorKey] || styles.modalItemText.color},
                    ]}>
                    {option[keyToShow]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CustomDropdownTypes = ({
  label,
  value,
  options,
  onSelect,
  keyToShow,
  colorKey,
  setSelectedTypeForTN,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = options?.find(option => option.Type === value?.Type);

  const displayText = selectedItem?.[keyToShow] || `Select ${label}`;
  const displayColor = selectedItem?.[colorKey] || styles.dropdownText.color;

  const handleSelect = itemValue => {
    //console.log(itemValue)
    setSelectedTypeForTN(itemValue);
    onSelect(itemValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.dropdownButton}>
        <Text
          style={[styles.dropdownText, {color: displayColor}]}
          numberOfLines={1}>
          {displayText}
        </Text>
        <Icon
          name="chevron-down-outline"
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <ScrollView style={styles.modalScrollView}>
              {options?.map((option, index) => (
                <TouchableOpacity
                  key={option.Id || index} // Use a unique ID as the key
                  onPress={() => handleSelect(option)}
                  style={styles.modalItem}>
                  <Text
                    style={[
                      styles.modalItemText,
                      {color: option[colorKey] || styles.modalItemText.color},
                    ]}>
                    {option[keyToShow]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CustomDropdownStatus = ({
  label,
  value,
  options,
  onSelect,
  keyToShow,
  colorKey,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = options.find(
    option => option.StatusName === value?.StatusName,
  );

  const displayText = selectedItem?.[keyToShow] || `Select ${label}`;
  const displayColor = selectedItem?.[colorKey] || styles.dropdownText.color;

  const handleSelect = itemValue => {
    onSelect(itemValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.dropdownButton}>
        <Text
          style={[styles.dropdownText, {color: displayColor}]}
          numberOfLines={1}>
          {displayText}
        </Text>
        <Icon
          name="chevron-down-outline"
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <ScrollView style={styles.modalScrollView}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(option)}
                  style={styles.modalItem}>
                  <Text
                    style={[
                      styles.modalItemText,
                      {color: option[colorKey] || styles.modalItemText.color},
                    ]}>
                    {option[keyToShow]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const parseDateString = dateString => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  const trimmed = dateString.trim();

  if (trimmed.includes('T') && trimmed.includes('Z')) {
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }

  // Check for AM/PM format
  if (trimmed.includes('AM') || trimmed.includes('PM')) {
    const parts = trimmed.split(' ');
    if (parts.length < 3) return null;

    const [datePart, timePart, ampm] = parts;
    const [year, month, day] = (datePart || '').split('-').map(Number);
    let [hours, minutes] = (timePart || '').split(':').map(Number);

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const date = new Date(year, month - 1, day, hours, minutes || 0);
    return isNaN(date.getTime()) ? null : date;
  } else {
    // Handle the custom format (e.g., "YYYY-MM-DD HH:mm:ss")
    const parts = trimmed.split(' ');
    if (parts.length < 2) return null;

    const [datePart, timePart] = parts;
    const [year, month, day] = (datePart || '').split('-').map(Number);
    const [hours, minutes, seconds] = (timePart || '').split(':').map(Number);

    const date = new Date(
      year,
      month - 1,
      day,
      hours || 0,
      minutes || 0,
      seconds || 0,
    );
    return isNaN(date.getTime()) ? null : date;
  }
};

const DateSelectModal = ({visible, onClose, onSelectToday, onSelectCustom}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a date</Text>
          <TouchableOpacity onPress={onSelectToday} style={styles.modalItem}>
            <Text style={styles.modalItemText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSelectCustom}
            style={[styles.modalItem, {borderBottomWidth: 0}]}>
            <Text style={styles.modalItemText}>Select a date</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function ELogsDetailsScreen({route, navigation}) {
  const {document} = route.params;
  const {
    data: letterDetails,
    isPending: letterDetailsLoading,
    isError: letterDetailsError,
  } = useElogsLetterDetails(document?.TrackingNumber);

  const {
    data: letterTypes,
    isLoading: letterTypesLoading,
    isError: letterTypesError,
  } = useElogsLetterTypes();
  const {
    data: letterStatuses,
    isLoading: letterStatusesLoading,
    isError: letterStatusesError,
  } = useElogsStatuses();

  const {
    data: offices,
    isLoading: officesLoading,
    isError: officesError,
  } = useElogsOffices();

  const {
    data: attachments,
    isLoading: attachmentsLoading,
    isError: attachmentsError,
  } = useElogsAttachments(letterDetails?.TrackingNumber);

  const {mutateAsync: updateLetterMutation} = useUpdateLetter();

  const [documentType, setDocumentType] = useState(null);
  const [status, setStatus] = useState(null);
  const [officeFrom, setOfficeFrom] = useState(null);
  const [officeTo, setOfficeTo] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [subject, setSubject] = useState(null);
  const [remarks, setRemarks] = useState(null);
  const [dateReceived, setDateReceived] = useState(null);
  const [dateReleased, setDateReleased] = useState(null);
  const [openDateReceivedPicker, setOpenDateReceivedPicker] = useState(false);
  const [openDateReleasedPicker, setOpenDateReleasedPicker] = useState(false);
  const [
    isDateReceivedSelectionModalVisible,
    setIsDateReceivedSelectionModalVisible,
  ] = useState(false);
  const [
    isDateReleasedSelectionModalVisible,
    setIsDateReleasedSelectionModalVisible,
  ] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrlToShow, setPdfUrlToShow] = useState('');
  const [showFlashImage, setShowFlashImage] = useState(false);
  const [imageUrlToShow, setImageUrlToShow] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const MAX_ATTACHMENTS = 5;
  const [selectedTypeForTN, setSelectedTypeForTN] = useState(null); // <-- Add this new state

  const {data: latestTN, isLoading: latestTNLoading} = useLatestTN(
    selectedTypeForTN?.Type,
  );
  // Use useEffect to set the initial state once the data is loaded
  useEffect(() => {
    if (letterDetails) {
      setFrom(letterDetails.Sender);
      setTo(letterDetails.Receiver);
      setSubject(letterDetails.Subject);
      setRemarks(letterDetails.Remarks);
      setDateReceived(parseDateString(letterDetails.DateReceived) || null);
      setDateReleased(parseDateString(letterDetails.DateReleased) || null);
    }
  }, [letterDetails]);

  useEffect(() => {
    if (letterStatuses && letterDetails) {
      const initialStatus = letterStatuses.find(
        item => item.StatusName === letterDetails.Status,
      );
      setStatus(initialStatus);
    }
  }, [letterStatuses, letterDetails]);

  useEffect(() => {
    if (letterTypes && letterDetails) {
      const initialDocType = letterTypes.find(
        item => item.Type === letterDetails.Type,
      );
      setDocumentType(initialDocType);
    }
  }, [letterTypes, letterDetails]);

  useEffect(() => {
    if (offices && letterDetails) {
      const initialOfficeFrom = offices.find(
        item => item.Code === letterDetails.SenderEntity,
      );
      setOfficeFrom(initialOfficeFrom);

      const initialOfficeTo = offices.find(
        item => item.Code === letterDetails.ReceiverOffice,
      );
      setOfficeTo(initialOfficeTo);
    }
  }, [offices, letterDetails]);

  if (letterDetailsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading document details...</Text>
      </View>
    );
  }

  // Handle Error State (optional but good practice)
  if (letterDetailsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load document details.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uploadFilesToServer = async files => {
    if (files.length === 0) {
      return true;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('attachments', {
          uri: file.uri,
          type: file.type,
          name: file.name || `file_${index}.${file.type.split('/')[1]}`,
        });
      });

      // NOTE: Replace 'YOUR_UPLOAD_ENDPOINT_URL' with your actual API endpoint.
      // You'll also need to handle authentication (e.g., tokens) here.
      const response = await fetch('YOUR_UPLOAD_ENDPOINT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Authorization': `Bearer YOUR_AUTH_TOKEN`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with an error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return true;
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Error', 'Failed to upload attachments.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // const trackingNumberToUse =
      //   documentType?.Type === letterDetails?.Type
      //     ? letterDetails?.TrackingNumber
      //     : latestTN || letterDetails?.TrackingNumber || null;

      const letterType = letterDetails?.Type;
      const docType = documentType?.Type;

      const finalType = docType ?? letterType;

      //console.log("let", finalType);

      // if (!trackingNumberToUse) {
      //   Alert.alert('Error', 'Tracking number is missing.');
      //   return;
      // }

      const dateRec = formatDateTime(dateReceived);
      const dateRel = formatDateTime(dateReleased);

      //console.log(dateRec, dateRel)

      const payload = {
        id: letterDetails?.Id,
        tn: letterDetails?.TrackingNumber,
        type: finalType,
        status: status?.StatusName,
        officeFrom: officeFrom?.Code,
        from,
        officeTo: officeTo?.Code,
        to,
        subject,
        dateReceived: dateRec,
        dateReleased: dateRel,
        remarks,
        attachments: attachedFiles,
      };

      //console.log('Saving document with payload:', payload);

      //Call your mutation hook
      updateLetterMutation(payload, {
        onSuccess: () => {
          Alert.alert('Success', 'Document details updated successfully!');
          setAttachedFiles([]);
          setSelectedTypeForTN([]);
          navigation.goBack();
        },
        onError: error => {
          console.error('Update failed:', error);
          Alert.alert('Error', 'Failed to save document changes.');
        },
      });
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while saving changes.',
      );
    }
  };

  const handleImagePicker = async () => {
    try {
      const results = await pick({
        type: [types.images, types.pdf],
        allowMultiSelection: true,
      });

      if (results && results.length > 0) {
        setAttachedFiles(prevFiles => {
          const currentCount = prevFiles.length;
          const newFiles = results
            .filter(
              newFile =>
                !prevFiles.some(
                  existingFile => existingFile.name === newFile.name,
                ),
            )
            .slice(0, MAX_ATTACHMENTS - currentCount);

          if (newFiles.length === 0) {
            Alert.alert(
              'Duplicate Files',
              'The selected files are already in the list or the limit has been reached.',
            );
            return prevFiles;
          }

          if (currentCount + newFiles.length > MAX_ATTACHMENTS) {
            Alert.alert(
              'Limit Reached',
              `You can only attach a maximum of ${MAX_ATTACHMENTS} files.`,
            );
            return prevFiles;
          }

          return [...prevFiles, ...newFiles];
        });
      }
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        Alert.alert('Error', 'Failed to select files.');
        console.error(err);
      }
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleCameraLaunch = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        includeExtra: true,
      });
      if (result.assets && result.assets.length > 0) {
        setAttachedFiles(prevFiles => {
          const currentCount = prevFiles.length;
          const newFiles = result.assets.filter(
            newFile =>
              !prevFiles.some(
                existingFile => existingFile.name === newFile.name,
              ),
          );

          if (currentCount + newFiles.length > MAX_ATTACHMENTS) {
            Alert.alert(
              'Limit Reached',
              `You can only attach a maximum of ${MAX_ATTACHMENTS} files.`,
            );
            return prevFiles;
          }

          return [
            ...prevFiles,
            ...newFiles.map(file => ({
              ...file,
              name: file.fileName || 'photo.jpg',
            })),
          ];
        });
      }
    } else {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to take photos.',
      );
    }
  };

  const handleFileSelection = () => {
    if (attachedFiles.length >= MAX_ATTACHMENTS) {
      Alert.alert(
        'Limit Reached',
        `You can only attach a maximum of ${MAX_ATTACHMENTS} files.`,
      );
      return;
    }
    Alert.alert(
      'Attach File',
      'Choose an option:',
      [
        {
          text: 'Take Photo',
          onPress: () => handleCameraLaunch(),
        },
        {
          text: 'Choose from Library',
          onPress: () => handleImagePicker(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const removeFile = indexToRemove => {
    setAttachedFiles(prevFiles =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const formatDateWithTime = date => {
    if (!date) return 'Select Date & Time';
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const dateString = isToday
      ? 'Today'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
    return (
      dateString +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
  };

  const handleSelectTodayReceived = () => {
    setDateReceived(new Date());
    setIsDateReceivedSelectionModalVisible(false);
  };

  const handleSelectCustomReceived = () => {
    setIsDateReceivedSelectionModalVisible(false);
    setOpenDateReceivedPicker(true);
  };

  const handleSelectTodayReleased = () => {
    setDateReleased(new Date());
    setIsDateReleasedSelectionModalVisible(false);
  };

  const handleSelectCustomReleased = () => {
    setIsDateReleasedSelectionModalVisible(false);
    setOpenDateReleasedPicker(true);
  };

  const attachmentList = attachments?.attachments || []; // safely get the array

  const handleFilePress = file => {
    const fileUrl = `https://www.davaocityportal.com/${file.filepath_full.replace(
      '../../',
      '',
    )}`;
    const fileName = file.filename.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      setPdfUrlToShow(fileUrl);
      setShowPdfViewer(true);
    } else if (
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpeg')
    ) {
      setImageUrlToShow(fileUrl);
      setShowFlashImage(true);
    } else {
      Linking.openURL(fileUrl).catch(err =>
        console.error('Failed to open link:', err),
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{/* Document Details */}</Text>
        </View>
        <ScrollView style={styles.scrollViewContent}>
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                  <Text style={styles.tnLabel}>
                    TN:{' '}
                    {latestTNLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.secondary}
                      />
                    ) : (
                      <Text style={styles.tnValue}>
                        {documentType?.Type === letterDetails?.Type
                          ? letterDetails?.TrackingNumber
                          : latestTN || letterDetails?.TrackingNumber}
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.largeDocType}>
                    {documentType?.Type || letterDetails?.Type}
                  </Text>
                </View>
              </View>
              <View style={styles.encodedInfoContainer}>
                <View style={[styles.encodedInfoItem, {flex: 1}]}>
                  <Text style={styles.encodedLabel}>Encoded By</Text>
                  <Text style={styles.encodedValue}>
                    {letterDetails?.FirstName} {letterDetails?.LastName}
                  </Text>
                </View>
                <View style={[styles.encodedInfoItem, {flex: 1}]}>
                  <Text style={styles.encodedLabel}>Date Encoded</Text>
                  <Text style={styles.encodedValue}>
                    {formatDateWithTime(
                      parseDateString(letterDetails?.DateEncoded),
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputRow}>
                <CustomDropdownTypes
                  label="Document Type"
                  value={documentType}
                  options={letterTypes || []}
                  onSelect={setDocumentType}
                  keyToShow="Type"
                  setSelectedTypeForTN={setSelectedTypeForTN}
                />
                <CustomDropdownStatus
                  label="Status"
                  value={status}
                  options={letterStatuses || []}
                  onSelect={setStatus}
                  keyToShow="StatusName"
                  colorKey="Color"
                />
              </View>

              <View style={styles.fullWidthInputContainer}>
                <CustomDropdown
                  label="From"
                  value={officeFrom}
                  options={offices || []}
                  onSelect={setOfficeFrom}
                  keyToShow="Name"
                />
                <TextInput
                  style={[styles.textInput, {marginTop: 10}]}
                  value={from}
                  onChangeText={setFrom}
                  placeholder="Enter sender's name"
                  placeholderTextColor={COLORS.subtle}
                />
              </View>
              <View style={styles.fullWidthInputContainer}>
                <CustomDropdown
                  label="To"
                  value={officeTo}
                  options={offices || []}
                  onSelect={setOfficeTo}
                  keyToShow="Name"
                />
                <TextInput
                  style={[styles.textInput, {marginTop: 10}]}
                  value={to}
                  onChangeText={setTo}
                  placeholder="Enter receiver's name"
                  placeholderTextColor={COLORS.subtle}
                />
              </View>

              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.fieldLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Enter subject"
                  placeholderTextColor={COLORS.subtle}
                />
              </View>

              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.fieldLabel}>Date Received</Text>
                <TouchableOpacity
                  onPress={() => setIsDateReceivedSelectionModalVisible(true)}
                  style={styles.datePickerButton}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.datePickerText}>
                    {dateReceived
                      ? formatDateWithTime(dateReceived)
                      : 'Select Date & Time'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.fieldLabel}>Date Released</Text>
                <TouchableOpacity
                  onPress={() => setIsDateReleasedSelectionModalVisible(true)}
                  style={styles.datePickerButton}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.datePickerText}>
                    {dateReleased
                      ? formatDateWithTime(dateReleased)
                      : 'Select Date & Time'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.fullWidthInputContainer}>
                <Text style={styles.fieldLabel}>Remarks</Text>
                <TextInput
                  style={[styles.textInput, styles.remarksInput]}
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Add remarks..."
                  placeholderTextColor={COLORS.subtle}
                  multiline
                />
              </View>

              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsTitle}>
                  Attachments{' '}
                  {attachedFiles.length > 0 && (
                    <Text style={styles.uploadLimitText}>
                      ({attachedFiles.length}/{MAX_ATTACHMENTS})
                    </Text>
                  )}
                </Text>

                {attachmentList.length === 0 && attachedFiles.length === 0 ? (
                  <Text style={styles.noAttachmentsText}>
                    No files attached.
                  </Text>
                ) : (
                  <>
                    {attachmentList.map((file, index) => {
                      const fileName = file.filename;
                      const fileType = fileName?.toLowerCase() || '';
                      const isPdf = fileType.endsWith('.pdf');
                      const isImage =
                        fileType.endsWith('.jpg') ||
                        fileType.endsWith('.jpeg') ||
                        fileType.endsWith('.png');

                      let iconName;
                      if (isPdf) {
                        iconName = 'document-text-outline';
                      } else if (isImage) {
                        iconName = 'image-outline';
                      } else {
                        iconName = 'document-outline';
                      }

                      return (
                        <View
                          key={`current-${index}`}
                          style={styles.attachmentItem}>
                          <Icon
                            name={iconName}
                            size={20}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {fileName}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleFilePress(file)}>
                            <Icon
                              name="open-outline"
                              size={20}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}

                    {attachmentList.length > 0 && attachedFiles.length > 0 && (
                      <View style={styles.attachmentsDivider} />
                    )}

                    {attachedFiles.map((file, index) => {
                      const fileName =
                        file.name ||
                        (file.type === 'application/pdf'
                          ? 'document.pdf'
                          : 'photo.jpg');
                      const fileType = fileName?.toLowerCase() || '';
                      const isPdf = fileType.endsWith('.pdf');
                      const isImage =
                        fileType.endsWith('.jpg') ||
                        fileType.endsWith('.jpeg') ||
                        fileType.endsWith('.png');

                      let iconName;
                      if (isPdf) {
                        iconName = 'document-text-outline';
                      } else if (isImage) {
                        iconName = 'image-outline';
                      } else {
                        iconName = 'document-outline';
                      }

                      return (
                        <View
                          key={`local-${index}`}
                          style={styles.attachmentItem}>
                          <Icon
                            name={iconName}
                            size={20}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {fileName}
                          </Text>
                          <TouchableOpacity onPress={() => removeFile(index)}>
                            <Icon
                              name="trash-outline"
                              size={20}
                              color={COLORS.error}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </>
                )}
                <TouchableOpacity
                  onPress={handleFileSelection}
                  style={[
                    styles.attachButton,
                    {
                      backgroundColor:
                        attachedFiles.length >= MAX_ATTACHMENTS
                          ? COLORS.subtle
                          : COLORS.secondary,
                    },
                  ]}
                  disabled={
                    isUploading || attachedFiles.length >= MAX_ATTACHMENTS
                  }>
                  {isUploading ? (
                    <ActivityIndicator color={COLORS.card} />
                  ) : (
                    <>
                      <Icon
                        name="attach-outline"
                        size={20}
                        color={COLORS.card}
                      />
                      <Text style={styles.attachButtonText}>Attach File</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.footerButton, styles.cancelButton]}
            disabled={isUploading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveChanges}
            style={[styles.footerButton, styles.saveButton]}
            disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color={COLORS.card} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        open={openDateReceivedPicker}
        date={dateReceived || new Date()}
        onConfirm={date => {
          setOpenDateReceivedPicker(false);
          setDateReceived(date);
        }}
        onCancel={() => {
          setOpenDateReceivedPicker(false);
        }}
      />
      <DatePicker
        modal
        open={openDateReleasedPicker}
        date={dateReleased || new Date()}
        onConfirm={date => {
          setOpenDateReleasedPicker(false);
          setDateReleased(date);
        }}
        onCancel={() => {
          setOpenDateReleasedPicker(false);
        }}
      />
      <DateSelectModal
        visible={isDateReceivedSelectionModalVisible}
        onClose={() => setIsDateReceivedSelectionModalVisible(false)}
        onSelectToday={handleSelectTodayReceived}
        onSelectCustom={handleSelectCustomReceived}
      />
      <DateSelectModal
        visible={isDateReleasedSelectionModalVisible}
        onClose={() => setIsDateReleasedSelectionModalVisible(false)}
        onSelectToday={handleSelectTodayReleased}
        onSelectCustom={handleSelectCustomReleased}
      />

      <Modal
        visible={showPdfViewer}
        onRequestClose={() => setShowPdfViewer(false)}
        animationType="slide"
        statusBarTranslucent={true}>
        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: COLORS.background}}>
            <View style={styles.pdfHeader}>
              <TouchableOpacity
                onPress={() => setShowPdfViewer(false)}
                style={styles.backButton}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <Text style={styles.pdfTitle} numberOfLines={1}>
                {pdfUrlToShow.split('/').pop()}
              </Text>
            </View>
            {pdfUrlToShow && <PdfViewer pdfUrl={pdfUrlToShow} />}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showFlashImage}
        onRequestClose={() => setShowFlashImage(false)}
        animationType="slide"
        statusBarTranslucent={true}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.imageModalContainer}>
            <View style={styles.imageModalHeader}>
              <TouchableOpacity
                onPress={() => setShowFlashImage(false)}
                style={styles.backButton}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <Text style={styles.imageModalTitle} numberOfLines={1}>
                {imageUrlToShow.split('/').pop()}
              </Text>
            </View>
            {imageUrlToShow && (
              <Image
                source={{uri: imageUrlToShow}}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 20,
    color: COLORS.text,
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pdfTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.text,
    flex: 1,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imageModalTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: 'white',
    flex: 1,
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  scrollViewContent: {
    flex: 1,
  },
  content: {
    padding: 0,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  tnLabel: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  tnValue: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  largeDocType: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  encodedInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //borderTopWidth: 1,
    //borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 10,
  },
  encodedInfoItem: {
    alignItems: 'flex-start',
    flex: 1,
  },
  encodedLabel: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  encodedValue: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  formSection: {
    paddingTop: 40,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  fullWidthInputContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  remarksInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  dropdownText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePickerText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 200,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  attachmentsContainer: {
    marginTop: 16,
  },
  attachmentsTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  attachmentsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  noAttachmentsText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    fontFamily: FONT.regular,
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  attachButtonText: {
    fontFamily: FONT.bold,
    color: COLORS.card,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  footerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: FONT.medium,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    fontFamily: FONT.bold,
    color: COLORS.card,
  },
  uploadLimitText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default ELogsDetailsScreen;
