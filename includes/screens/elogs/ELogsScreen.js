import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
  Keyboard,
  Modal,
  ImageBackground,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {
  useElogsLetters,
  useElogsLetterTypes,
  useElogsStatuses,
  useUpdateLetterStatus,
  useAddLetterTypes,
  useDeleteLetterType,
  useAddLetterStatus,
  useDeleteLetterStatus,
  useElogsOffices,
  useAddLetter,
} from '../../hooks/useElogs';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import ColorPicker, {Panel1, HueSlider} from 'reanimated-color-picker';
import {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import {pick} from '@react-native-documents/picker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import {formatDateTime, formatDateWithTime, parseDateString} from '../../utils';

// -------------------------------------------------
// Refactored Bottom Sheet Components
// -------------------------------------------------
// Add these two new components to your file
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

const EditLetterTypeBottomSheet = React.memo(
  ({
    editLetterTypeSheetRef,
    snapPointsEditLetterType,
    editedLetterType,
    setEditedLetterType,
    handleSaveEditLetterType,
  }) => {
    const handleClosePress = useCallback(() => {
      editLetterTypeSheetRef.current?.close();
    }, [editLetterTypeSheetRef]);

    return (
      <BottomSheetModal
        ref={editLetterTypeSheetRef}
        index={0}
        snapPoints={snapPointsEditLetterType}
        keyboardBehavior="interactive"
        enablePanDownToClose={true}
        backdropComponent={({style}) => (
          <View
            style={[
              StyleSheet.absoluteFill,
              style,
              {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
            ]}
          />
        )}
        onDismiss={() => {
          setEditedLetterType('');
        }}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Edit Letter Type</Text>
          <Text style={styles.inputLabel}>New Name</Text>
          <BottomSheetTextInput
            style={styles.setupInput}
            placeholder="e.g., REQUEST LETTER"
            placeholderTextColor="#90A4AE"
            value={editedLetterType}
            onChangeText={setEditedLetterType}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSaveEditLetterType}>
            <Text style={styles.addButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  },
);

const EditStatusBottomSheet = React.memo(
  ({
    editStatusSheetRef,
    snapPointsEditStatus,
    editedStatus,
    setEditedStatus,
    editedStatusColor,
    setEditedStatusColor,
    handleSaveEditStatus,
  }) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const selectedColor = useSharedValue(editedStatusColor);

    useEffect(() => {
      selectedColor.value = editedStatusColor;
    }, [editedStatusColor, selectedColor]);

    useAnimatedReaction(
      () => selectedColor.value,
      hex => {
        runOnJS(setEditedStatusColor)(hex);
      },
      [setEditedStatusColor],
    );

    const onCompleteWorklet = color => {
      'worklet';
      selectedColor.value = color.hex;
    };

    return (
      <BottomSheetModal
        ref={editStatusSheetRef}
        index={0}
        snapPoints={snapPointsEditStatus}
        keyboardBehavior="interactive"
        enablePanDownToClose={true}
        handleIndicatorStyle={{backgroundColor: '#BDC3C7', width: 40}}
        backdropComponent={({style}) => (
          <View
            style={[
              StyleSheet.absoluteFill,
              style,
              {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
            ]}
          />
        )}
        onDismiss={() => {
          setEditedStatus('');
          setEditedStatusColor('');
          setIsPickerVisible(false);
        }}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Edit Status</Text>
          <Text style={styles.inputLabel}>New Status Name</Text>
          <BottomSheetTextInput
            style={styles.setupInput}
            placeholder="e.g., RELEASE"
            placeholderTextColor="#90A4AE"
            value={editedStatus}
            onChangeText={setEditedStatus}
          />
          <View style={{marginTop: 20}}>
            <Text style={styles.inputLabel}>Color</Text>
            <TouchableOpacity
              onPress={() => setIsPickerVisible(!isPickerVisible)}
              style={styles.colorInputContainer}>
              <View
                style={[
                  styles.colorBox,
                  {backgroundColor: editedStatusColor || '#FFFFFF'},
                ]}
              />
              <BottomSheetTextInput
                style={[styles.setupInput, {flex: 1}]}
                placeholder="e.g., #007BFF"
                placeholderTextColor="#90A4AE"
                value={editedStatusColor}
                onChangeText={setEditedStatusColor}
              />
            </TouchableOpacity>
          </View>
          {isPickerVisible && (
            <ColorPicker
              style={{width: '100%', marginBottom: 20}}
              value={editedStatusColor || '#FFFFFF'}
              onComplete={onCompleteWorklet}>
              <Panel1 style={{marginBottom: 10}} />
              <HueSlider />
            </ColorPicker>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSaveEditStatus}>
            <Text style={styles.addButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  },
);

const AddLetterTypeBottomSheet = React.memo(
  ({
    addLetterTypeSheetRef,
    snapPointsLetterType,
    setNewLetterType,
    setNewLetterTypeCode,
    newLetterType,
    newLetterTypeCode,
    handleAddLetterType,
  }) => {
    return (
      <BottomSheetModal
        ref={addLetterTypeSheetRef}
        index={0}
        snapPoints={snapPointsLetterType}
        keyboardBehavior="interactive"
        backdropComponent={({style}) => (
          <View
            style={[
              StyleSheet.absoluteFill,
              style,
              {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
            ]}
          />
        )}
        onDismiss={() => {
          setNewLetterType('');
          setNewLetterTypeCode('');
        }}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add New Letter Type</Text>
          <Text style={styles.inputLabel}>New Letter Type</Text>
          <BottomSheetTextInput
            style={styles.setupInput}
            placeholder="e.g., REQUEST LETTER"
            placeholderTextColor="#90A4AE"
            value={newLetterType}
            onChangeText={setNewLetterType}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {/* <Text style={styles.inputLabel}>Code</Text>
          <BottomSheetTextInput
            style={styles.setupInput}
            placeholder="e.g., RL"
            placeholderTextColor="#90A4AE"
            value={newLetterTypeCode}
            onChangeText={setNewLetterTypeCode}
          /> */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddLetterType}>
            <Text style={styles.addButtonText}>Add Letter Type</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  },
);

const AddStatusBottomSheet = React.memo(
  ({
    addStatusSheetRef,
    snapPointsStatus,
    setNewStatus,
    setNewStatusColor,
    newStatus,
    newStatusColor,
    handleAddStatus,
  }) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const selectedColor = useSharedValue('#FFFFFF');

    // The logic below ensures that the color picker's internal
    // state is synchronized with the newStatusColor state
    useAnimatedReaction(
      () => selectedColor.value,
      hex => {
        runOnJS(setNewStatusColor)(hex);
      },
      [setNewStatusColor],
    );

    const onCompleteWorklet = color => {
      'worklet';
      selectedColor.value = color.hex;
    };

    return (
      <BottomSheetModal
        ref={addStatusSheetRef}
        index={0}
        snapPoints={snapPointsStatus}
        keyboardBehavior="interactive"
        enablePanDownToClose={true}
        handleIndicatorStyle={{backgroundColor: '#BDC3C7', width: 40}}
        backdropComponent={({style}) => (
          <View
            style={[
              StyleSheet.absoluteFill,
              style,
              {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
            ]}
            onTouchEnd={() => addStatusSheetRef.current?.close()}
          />
        )}
        onDismiss={() => {
          setNewStatus('');
          setNewStatusColor('');
          selectedColor.value = '#FFFFFF';
          setIsPickerVisible(false);
        }}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add New Status</Text>
          <Text style={styles.inputLabel}>New Status</Text>
          <BottomSheetTextInput
            style={styles.setupInput}
            placeholder="e.g., RELEASE"
            placeholderTextColor="#90A4AE"
            value={newStatus}
            onChangeText={setNewStatus}
          />
          <View style={{marginTop: 20}}>
            <Text style={styles.inputLabel}>Color</Text>

            <TouchableOpacity
              onPress={() => setIsPickerVisible(!isPickerVisible)}
              style={styles.colorInputContainer}>
              <View
                style={[
                  styles.colorBox,
                  {backgroundColor: newStatusColor || '#FFFFFF'},
                ]}
              />
              <BottomSheetTextInput
                style={[styles.setupInput, {flex: 1}]}
                placeholder="e.g., #007BFF"
                placeholderTextColor="#90A4AE"
                value={newStatusColor}
                onChangeText={setNewStatusColor}
              />
            </TouchableOpacity>
          </View>

          {isPickerVisible && (
            <ColorPicker
              style={{width: '100%', marginBottom: 20}}
              // This is the key change: provide a default valid color
              value={newStatusColor || '#FFFFFF'}
              onComplete={onCompleteWorklet}>
              <Panel1 style={{marginBottom: 10}} />
              <HueSlider />
            </ColorPicker>
          )}

          <TouchableOpacity style={styles.addButton} onPress={handleAddStatus}>
            <Text style={styles.addButtonText}>Add Status</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  },
);

const ActionOptionsBottomSheet = React.memo(
  ({
    actionOptionsSheetRef,
    snapPointsActionOptions,
    actionItemType,
    handleEditLetterType,
    handleEditStatus,
    handleRemoveLetterType,
    handleRemoveStatus,
  }) => (
    <BottomSheetModal
      ref={actionOptionsSheetRef}
      index={0}
      snapPoints={snapPointsActionOptions}
      enablePanDownToClose={true}
      backdropComponent={({style}) => (
        <View
          style={[
            StyleSheet.absoluteFill,
            style,
            {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
          ]}
        />
      )}
      onDismiss={() => {}}>
      <View style={styles.actionOptionsContent}>
        <TouchableOpacity
          style={styles.actionOptionButton}
          onPress={
            actionItemType === 'letterType'
              ? handleEditLetterType
              : handleEditStatus
          }>
          <Icon name="pencil-outline" size={24} color="#ccc" />
          <Text style={styles.actionOptionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionOptionButton, styles.deleteActionOptionButton]}
          onPress={
            actionItemType === 'letterType'
              ? handleRemoveLetterType
              : handleRemoveStatus
          }>
          <Icon name="trash-outline" size={24} color="#ccc" />
          <Text style={styles.actionOptionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  ),
);

const NewDocumentForm = React.memo(
  ({newFormSheetRef, letterTypes, offices, addLetter}) => {
    const snapPoints = useMemo(() => ['95%'], []);
    const scrollViewRef = useRef(null);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [selectedDocumentType, setSelectedDocumentType] = useState(null);
    const [selectedFromOffice, setSelectedFromOffice] = useState(null);
    const [selectedToOffice, setSelectedToOffice] = useState(null);

    // New states for form inputs
    const [sender, setSender] = useState('');
    const [receiver, setReceiver] = useState('');
    const [subject, setSubject] = useState('');
    const [remarks, setRemarks] = useState('');

    // State for date selection
    const [
      isDateReceivedSelectionModalVisible,
      setIsDateReceivedSelectionModalVisible,
    ] = useState(false);
    const [openDateReceivedPicker, setOpenDateReceivedPicker] = useState(false);
    const [dateReceived, setDateReceived] = useState(null);

    const MAX_FILES = 5;

    useEffect(() => {
      if (attachedFiles.length > 0 && scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }
    }, [attachedFiles]);

    const handleClosePress = useCallback(() => {
      newFormSheetRef.current?.close();
    }, [newFormSheetRef]);

    const handleRemoveFile = useCallback(index => {
      Alert.alert(
        'Remove File',
        `Are you sure you want to remove this file?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              setAttachedFiles(prevFiles =>
                prevFiles.filter((_, i) => i !== index),
              );
            },
          },
        ],
        {cancelable: true},
      );
    }, []);

    const handleChooseFiles = useCallback(() => {
      Alert.alert(
        'Attach Files',
        'Choose an option to attach files',
        [
          {
            text: 'Choose from Documents',
            onPress: async () => {
              if (attachedFiles.length >= MAX_FILES) {
                Alert.alert(
                  'File Limit Reached',
                  `You can only attach a maximum of ${MAX_FILES} files.`,
                );
                return;
              }
              try {
                if (Platform.OS === 'android') {
                  const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                      title: 'Storage Permission',
                      message:
                        'This app needs access to your storage to select files.',
                      buttonNeutral: 'Ask Me Later',
                      buttonNegative: 'Cancel',
                      buttonPositive: 'OK',
                    },
                  );

                  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert(
                      'Permission Denied',
                      'You have denied storage access. Please enable it in your device settings to select files.',
                    );
                    return;
                  }
                }
                const res = await pick({
                  type: ['application/pdf', 'image/*'],
                  allowMultiSelection: true,
                });

                if (res.length > 0) {
                  const newTotal = attachedFiles.length + res.length;
                  if (newTotal > MAX_FILES) {
                    const numFilesToTake = MAX_FILES - attachedFiles.length;
                    const filesToAdd = res.slice(0, numFilesToTake);
                    Alert.alert(
                      'File Limit Exceeded',
                      `You can only add ${numFilesToTake} more file(s) to reach the maximum of ${MAX_FILES}.`,
                    );
                    setAttachedFiles(prevFiles => [
                      ...prevFiles,
                      ...filesToAdd,
                    ]);
                  } else {
                    setAttachedFiles(prevFiles => [...prevFiles, ...res]);
                  }
                }
              } catch (err) {
                /* if (pick.isCancel(err)) {
                  console.log('User cancelled the picker');
                } else {
                  console.log(err);
                } */
              }
            },
          },
          {
            text: 'Take a Photo',
            onPress: async () => {
              if (attachedFiles.length >= MAX_FILES) {
                Alert.alert(
                  'File Limit Reached',
                  `You can only attach a maximum of ${MAX_FILES} files.`,
                );
                return;
              }

              try {
                if (Platform.OS === 'android') {
                  const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                      title: 'Camera Permission',
                      message: 'This app needs camera access to take photos.',
                      buttonNeutral: 'Ask Me Later',
                      buttonNegative: 'Cancel',
                      buttonPositive: 'OK',
                    },
                  );

                  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert(
                      'Permission Denied',
                      'You have denied camera access. Please enable it in your device settings to take photos.',
                    );
                    return;
                  }
                }
                const result = await launchCamera({
                  mediaType: 'photo',
                  quality: 0.7,
                });

                if (result.assets && result.assets.length > 0) {
                  if (attachedFiles.length < MAX_FILES) {
                    setAttachedFiles(prevFiles => [
                      ...prevFiles,
                      result.assets[0],
                    ]);
                  } else {
                    Alert.alert(
                      'File Limit Reached',
                      `You can only attach a maximum of ${MAX_FILES} files.`,
                    );
                  }
                }
              } catch (err) {
                console.log('Camera launch error:', err);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        {cancelable: true},
      );
    }, [attachedFiles]);

    const handleDocumentTypeSelect = useCallback(item => {
      setSelectedDocumentType(item);
    }, []);

    const handleFromOfficeSelect = useCallback(item => {
      setSelectedFromOffice(item);
    }, []);

    const handleToOfficeSelect = useCallback(item => {
      setSelectedToOffice(item);
    }, []);

    const handleSelectTodayReceived = useCallback(() => {
      setDateReceived(new Date());
      setIsDateReceivedSelectionModalVisible(false);
    }, []);

    const handleSelectCustomReceived = useCallback(() => {
      setIsDateReceivedSelectionModalVisible(false);
      setOpenDateReceivedPicker(true);
    }, []);

    const handleSubmit = useCallback(async () => {
      // 1. Map form data to the correct payload for createLetter
      const payload = {
        type: selectedDocumentType?.Type,
        sender: sender,
        senderEntity: selectedFromOffice?.Code, // Assuming sender and senderEntity are the same for this form
        receiver: receiver,
        receiverOffice: selectedToOffice?.Code,
        subject: subject,
        dateReceived: formatDateTime(dateReceived?.toISOString()),
        remarks: remarks,
        attachments: attachedFiles,
      };

      // 2. Perform basic validation
      if (
        !payload.type ||
        !payload.receiverOffice ||
        !payload.dateReceived ||
        !payload.sender ||
        !payload.receiver ||
        !payload.subject
      ) {
        Alert.alert('Validation Error', 'Please fill out all required fields.');
        return; // Stop the submission
      }

      try {
        // 3. Call the mutation function with the payload
        await addLetter(payload);

        // 4. Handle success
        Alert.alert('Success', 'Document submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              //handleClosePress();
            },
          },
        ]);
      } catch (error) {
        // 5. Handle error
        console.error('Submission error:', error);
        Alert.alert(
          'Submission Failed',
          'An error occurred while submitting the document. Please try again.',
        );
      }
    }, [
      addLetter,
      selectedDocumentType,
      selectedFromOffice,
      selectedToOffice,
      dateReceived,
      sender,
      receiver,
      subject,
      remarks,
      attachedFiles,
      handleClosePress,
    ]);
    return (
      <BottomSheetModal
        ref={newFormSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleComponent={null}
        keyboardBehavior="interactive"
        handleIndicatorStyle={{backgroundColor: '#ccc', width: 40}}
        backdropComponent={({style}) => (
          <View
            style={[
              StyleSheet.absoluteFill,
              style,
              {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
            ]}
          />
        )}
        onDismiss={() => {
          // Reset all form state here
          setAttachedFiles([]);
          setSelectedDocumentType(null);
          setSelectedFromOffice(null);
          setSelectedToOffice(null);
          setDateReceived(null);
          setSender('');
          setReceiver('');
          setSubject('');
          setRemarks('');
        }}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>New Document</Text>
            <TouchableOpacity onPress={handleClosePress} style={{}}>
              <Icon name="close-circle-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView
            contentContainerStyle={styles.formScrollView}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}>
            {/* Document Type Dropdown */}
            <CustomDropdown
              label="Document Type"
              value={selectedDocumentType}
              options={letterTypes || []}
              onSelect={handleDocumentTypeSelect}
              keyToShow="Type"
              colorKey="color"
            />

            {/* Corrected 'From' field layout */}
            <View style={styles.formRow}>
              <View style={styles.formHalfWidth}>
                <CustomDropdown
                  label="From Office"
                  value={selectedFromOffice}
                  options={offices || []}
                  onSelect={handleFromOfficeSelect}
                  keyToShow="Name"
                  colorKey="color"
                />
              </View>
              <View style={styles.formHalfWidth}>
                <Text style={styles.fieldLabel}>Sender</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Name of Sender"
                  value={sender} // Connected to state
                  onChangeText={setSender} // Connected to state
                />
              </View>
            </View>

            {/* Corrected 'To' field layout */}
            <View style={styles.formRow}>
              <View style={styles.formHalfWidth}>
                <CustomDropdown
                  label="To Office"
                  value={selectedToOffice}
                  options={offices || []}
                  onSelect={handleToOfficeSelect}
                  keyToShow="Name"
                  colorKey="color"
                />
              </View>
              <View style={styles.formHalfWidth}>
                <Text style={styles.fieldLabel}>Receiver</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Name of Receiver"
                  value={receiver} // Connected to state
                  onChangeText={setReceiver} // Connected to state
                />
              </View>
            </View>

            {/* Other form fields */}
            <Text style={styles.fieldLabel}>Subject</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Subject"
              value={subject} // Connected to state
              onChangeText={setSubject} // Connected to state
            />

            {/* Date Received section with modal trigger */}
            <Text style={styles.fieldLabel}>Date Received</Text>
            <TouchableOpacity
              onPress={() => setIsDateReceivedSelectionModalVisible(true)}
              style={styles.datePickerButton}>
              <Icon name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerText}>
                {dateReceived
                  ? formatDateWithTime(dateReceived)
                  : 'Select Date & Time'}
              </Text>
            </TouchableOpacity>
            <View style={{marginTop: 15}}>
              <Text style={styles.fieldLabel}>Remarks</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                multiline
                placeholder="Remarks"
                value={remarks} // Connected to state
                onChangeText={setRemarks} // Connected to state
              />
            </View>

            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleChooseFiles}>
              <Icon name="attach-outline" size={20} color={COLORS.card} />
              <Text style={styles.attachButtonText}>Attach Files</Text>
            </TouchableOpacity>
            <Text style={styles.attachHint}>
              (Max 5 files, PDF and Images only)
            </Text>
            {attachedFiles.length > 0 && (
              <View style={styles.attachedFilesContainer}>
                <Text style={styles.attachedFilesHeader}>Attached Files:</Text>
                {attachedFiles.map((file, index) => (
                  <View key={index} style={styles.attachedFileItem}>
                    <Icon name="document" size={16} color="#4A6572" />
                    <Text style={styles.attachedFileName} numberOfLines={1}>
                      {file.name || file.fileName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveFile(index)}
                      style={styles.removeFileButton}>
                      <Icon name="trash-outline" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </BottomSheetScrollView>
          <View
            style={{
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: '#ccc',
            }}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Date selection components */}
        <DateSelectModal
          visible={isDateReceivedSelectionModalVisible}
          onClose={() => setIsDateReceivedSelectionModalVisible(false)}
          onSelectToday={handleSelectTodayReceived}
          onSelectCustom={handleSelectCustomReceived}
        />
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
      </BottomSheetModal>
    );
  },
);

// -------------------------------------------------
// New Component for the Document Card UI/UX
// -------------------------------------------------
const DocumentCard = React.memo(
  ({doc, documentIndex, handleDocumentPress, statusColors}) => {
    return (
      <TouchableOpacity
        style={styles.documentCardNew}
        onPress={() => handleDocumentPress(doc)}>
        <View style={styles.cardContentContainerNew}>
          <View style={styles.cardIndexColumn}>
            <Text style={styles.cardIndexText}>{documentIndex}</Text>
          </View>

          <View style={styles.cardDetailsColumnNew}>
            <View style={styles.cardHeaderNew}>
              <View style={[styles.statusBadge]}>
                <Text style={styles.statusBadgeText}>
                  {doc.Status}
                  {'  '}
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderWidth: 1,
                      borderRadius: 999,
                      backgroundColor: statusColors[doc.Status] || '#B0BEC5',
                      borderColor: statusColors[doc.Status] || '#B0BEC5',
                    }}
                  />
                </Text>
                {doc.DateModified && (
                  <Text style={[styles.cardDateNew, {textAlign: 'right'}]}>
                    {moment(doc.DateModified, 'YYYY-MM-DD hh:mm A').format(
                      'MMMM D, YYYY h:mm A',
                    )}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.cardBodyNew}>
              <Text style={styles.cardTrackingNumberNew}>
                {/* <Text style={{fontFamily: 'Montserrat-Regular', color: 'gray'}}>
                </Text>{' '} */}
                {doc.TrackingNumber}
              </Text>
              <Text style={styles.cardSubjectNew}>{doc.Subject}</Text>

              <View style={styles.cardInfoRow}>
                {/* <Icon name="mail-outline" size={16} color="#7F8C8D" /> */}
                <Text style={styles.cardInfoText}>Type</Text>
                <Text style={styles.cardInfoValue}> {doc.Type}</Text>
              </View>

              <View style={styles.cardInfoRow}>
                {/* <Icon name="person-circle-outline" size={16} color="#7F8C8D" /> */}
                <Text style={styles.cardInfoText}>From</Text>
                <Text style={styles.cardInfoValue} /* numberOfLines={1} */>
                  {doc.Sender}
                </Text>
              </View>

              <View style={styles.cardInfoRow}>
                {/* <Icon name="person-circle-outline" size={16} color="#7F8C8D" /> */}
                <Text style={styles.cardInfoText}>To</Text>
                <Text style={styles.cardInfoValue} /* numberOfLines={1} */>
                  {doc.Receiver}
                </Text>
              </View>

              {doc.DateReleased && (
                <View style={styles.cardInfoRow}>
                  {/* <Icon name="send-outline" size={16} color="#7F8C8D" /> */}
                  <Text style={styles.cardInfoText}>Released</Text>
                  <Text style={styles.cardInfoValue}>
                    {moment(doc.DateReleased, 'YYYY-MM-DD hh:mm A').format(
                      'MMMM D, YYYY h:mm A',
                    )}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.cardFooterNew}>
              <View style={styles.cardFooterLeft}>
                {/*  <Icon name="calendar-outline" size={16} color="#7F8C8D" /> */}
                <Text style={styles.cardDateNew}>
                  {/*  {moment(doc.DateReceived, 'YYYY-MM-DD hh:mm A').format(
                    'MMMM D, YYYY h:mm A',
                  )} */}
                </Text>
              </View>
              <View style={styles.cardFooterRight}>
                {doc.AttachmentCount > '0' ? (
                  <Icon name="document-attach" size={20} color="#1A535C" />
                ) : (
                  <Icon name="document-outline" size={20} color="#B0BEC5" />
                )}
                <Text style={styles.attachmentCountText}>
                  {doc.AttachmentCount > '0' ? doc.AttachmentCount : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

// -------------------------------------------------
// Main Component
// -------------------------------------------------

function ELogsScreen({navigation}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState('received');

  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [documentToUpdate, setDocumentToUpdate] = useState(null);

  const [actionItem, setActionItem] = useState(null);
  const [actionItemType, setActionItemType] = useState('');

  const {
    data: elogsData,
    isPending: loading,
    isError: error,
    refetch,
  } = useElogsLetters();
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
    mutateAsync: updateLetterStatus,
    isLoading: updateLetterStatusLoading,
  } = useUpdateLetterStatus();
  const {
    mutateAsync: addLetterTypes,
    isPending: addLetterTypesLoading,
    isError: addLetterTypesError,
  } = useAddLetterTypes();
  const {
    mutateAsync: deleteLetterType,
    isPending: deleteLetterTypeLoading,
    isError: deleteLetterTypeError,
  } = useDeleteLetterType();

  const {
    mutateAsync: addLetterStatus,
    isPending: addLetterStatusLoading,
    isError: addLetterStatusError,
  } = useAddLetterStatus();

  const {
    mutateAsync: deleteLetterStatus,
    isPending: deleteLetterStatusLoading,
    isError: deleteLetterStatusError,
  } = useDeleteLetterStatus();
  const {
    mutateAsync: addLetter,
    isPending: addLetterLoading,
    isError: addLetterError,
  } = useAddLetter();

  const [refreshing, setRefreshing] = useState(false);

  const [newLetterType, setNewLetterType] = useState('');
  const [newLetterTypeCode, setNewLetterTypeCode] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('');

  const [editedLetterType, setEditedLetterType] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedStatusColor, setEditedStatusColor] = useState('');
  const [editedItemId, setEditedItemId] = useState(null);

  //const [localDatabase, setLocalDatabase] = useState(elogsData || {});

  const addLetterTypeSheetRef = useRef(null);
  const addStatusSheetRef = useRef(null);
  const actionOptionsSheetRef = useRef(null);
  const newFormSheetRef = useRef(null);
  // New refs for editing
  const editLetterTypeSheetRef = useRef(null);
  const editStatusSheetRef = useRef(null);

  const snapPointsLetterType = useMemo(() => ['90%'], []);
  const snapPointsStatus = useMemo(() => ['90%'], []);
  const snapPointsActionOptions = useMemo(() => ['25%'], []);
  const snapPointsNewForm = useMemo(() => ['75%'], []);
  // New snap points for editing
  const snapPointsEditLetterType = useMemo(() => ['50%'], []);
  const snapPointsEditStatus = useMemo(() => ['90%'], []);

  // useEffect(() => {
  //   if (elogsData) {
  //     setLocalDatabase(elogsData);
  //   }
  // }, [elogsData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Call the refetch function to get new data
    setRefreshing(false);
  }, [refetch]);

  /*  useEffect(() => {
    if (actionItem && actionItemType) {
      actionOptionsSheetRef.current?.present();
    }
  }, [actionItem, actionItemType]); */

  const handlePresentLetterTypeSheet = useCallback(() => {
    addLetterTypeSheetRef.current?.present();
  }, []);

  const handlePresentStatusSheet = useCallback(() => {
    addStatusSheetRef.current?.present();
  }, []);

  const handlePresentActionOptionsSheet = useCallback((item, type) => {
    actionOptionsSheetRef.current?.present();
    setActionItem(item);
    setActionItemType(type);
  }, []);

  // New handler to present the new form sheet
  const handlePresentNewFormSheet = useCallback(() => {
    newFormSheetRef.current?.present();
  }, []);

  const filteredDocuments = useMemo(() => {
    return Object.values(elogsData || [])
      .filter(
        doc =>
          doc?.TrackingNumber?.toLowerCase()?.includes(
            searchTerm.toLowerCase(),
          ) ||
          doc?.Subject?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          doc?.Sender?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          doc?.Receiver?.toLowerCase()?.includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => new Date(b.DateReceived) - new Date(a.DateReceived));
  }, [elogsData, searchTerm]);

  const groupedDocuments = useMemo(() => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;

    const groups = filteredDocuments.reduce((acc, doc) => {
      const dateMatch = doc.DateReceived?.match(dateRegex);
      const date = dateMatch ? dateMatch[0] : 'No Date';

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(doc);
      return acc;
    }, {});

    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(b) - new Date(a);
    });

    return sortedDates.map(date => ({
      date,
      documents: groups[date].sort(
        (a, b) => new Date(b.DateReceived) - new Date(a.DateReceived),
      ),
    }));
  }, [filteredDocuments]);

  const handleDocumentPress = document => {
    Alert.alert(
      'Document Options',
      `What would you like to do with document ${document.TrackingNumber}?`,
      [
        {
          text: 'View Details',
          onPress: () => navigation.navigate('ELogsDetails', {document}),
        },
        {
          text: 'Update Status',
          onPress: () => {
            setDocumentToUpdate(document);
            setIsStatusModalVisible(true);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleUpdateStatus = newStatus => {
    // Check if there's a document to update
    if (!documentToUpdate) {
      console.error('No document selected for update.');
      return;
    }

    const trackingNumber = documentToUpdate.TrackingNumber;

    updateLetterStatus(
      {tn: trackingNumber, status: newStatus},
      {
        onSuccess: () => {
          Alert.alert(
            'Success',
            `Status for document ${trackingNumber} has been updated to "${newStatus}".`,
          );
        },
        onError: error => {
          // This will run if the API call fails.
          console.error('Update failed:', error);
          Alert.alert(
            'Error',
            `Failed to update status for document ${trackingNumber}. Please try again.`,
          );
        },
        onSettled: () => {
          setIsStatusModalVisible(false);
          setDocumentToUpdate(null);
        },
      },
    );
  };

  const handleAddLetterType = useCallback(async () => {
    if (newLetterType.trim() === '') {
      Alert.alert('Error', 'Letter type cannot be empty.');
      return;
    }

    try {
      // 1. Call the async mutation function.
      // This will trigger the API call and wait for it to complete.
      await addLetterTypes({letterType: newLetterType});

      // 2. Only proceed with success actions if the API call was successful.
      setNewLetterType('');
      addLetterTypeSheetRef.current?.close();

      Alert.alert(
        'Success',
        `Letter Type "${newLetterType}" added successfully.`,
      );
    } catch (error) {
      // 3. Handle any errors that occurred during the API call.
      console.error('Failed to add letter type:', error);
      Alert.alert(
        'Error',
        `Failed to add letter type "${newLetterType}". Please try again.`,
      );
    }
  }, [newLetterType, addLetterTypes]);

  // const handleRemoveLetterType = useCallback(() => {
  //   actionOptionsSheetRef.current?.close();

  //   Alert.alert(
  //     'Success',
  //     `Letter Type "${actionItem.Id}" has been removed.`,
  //   );
  // }, [actionItem]);

  const handleRemoveLetterType = useCallback(async () => {
    if (!actionItem || !actionItem.Id) {
      Alert.alert('Error', 'No letter type selected for deletion.');
      return;
    }

    try {
      await deleteLetterType({letterTypeId: actionItem.Id});

      actionOptionsSheetRef.current?.close();

      Alert.alert(
        'Success',
        `Letter Type "${actionItem.Id}" has been removed.`,
      );
    } catch (error) {
      console.error('Failed to delete letter type:', error);
      Alert.alert(
        'Error',
        `Failed to remove letter type "${actionItem.Type}". Please try again.`,
      );
    }
  }, [actionItem, actionOptionsSheetRef, deleteLetterType]);

  const handleEditLetterType = useCallback(() => {
    // Close the options menu first
    actionOptionsSheetRef.current?.close();

    // Set the state with the selected item's data
    if (actionItem && actionItem.Type) {
      setEditedItemId(actionItem.Id); // Store the ID
      setEditedLetterType(actionItem.Type);
      // Open the edit bottom sheet
      editLetterTypeSheetRef.current?.present();
    }
  }, [actionItem]);

  const handleAddStatus = useCallback(async () => {
    if (newStatus.trim() === '' || newStatusColor.trim() === '') {
      Alert.alert('Error', 'Status and color cannot be empty.');
      return;
    }

    try {
      // Call the async mutation function from the hook
      await addLetterStatus({status: newStatus, color: newStatusColor});

      // These actions are only performed if the API call is successful
      setNewStatus('');
      setNewStatusColor('');
      addStatusSheetRef.current?.close();

      Alert.alert('Success', `Status "${newStatus}" added successfully.`);
    } catch (error) {
      // If an error occurs during the API call, catch it here and alert the user
      console.error('Failed to add status:', error);
      Alert.alert(
        'Error',
        `Failed to add status "${newStatus}". Please try again.`,
      );
    }
  }, [newStatus, newStatusColor, addLetterStatus, addStatusSheetRef]);

  const handleRemoveStatus = useCallback(async () => {
    if (!actionItem || !actionItem.Id) {
      Alert.alert('Error', 'No letter type selected for deletion.');
      return;
    }

    try {
      await deleteLetterStatus({letterTypeId: actionItem.Id});

      actionOptionsSheetRef.current?.close();

      Alert.alert('Success', `Status "${actionItem.Id}" has been removed.`);
    } catch (error) {
      console.error('Failed to delete status:', error);
      Alert.alert(
        'Error',
        `Failed to remove status "${actionItem.StatusName}". Please try again.`,
      );
    }
  }, [actionItem, actionOptionsSheetRef, deleteLetterStatus]);

  const handleEditStatus = useCallback(() => {
    // Close the options menu first
    actionOptionsSheetRef.current?.close();

    // Set the state with the selected item's data
    if (actionItem && actionItem.StatusName) {
      setEditedItemId(actionItem.Id); // Store the ID
      setEditedStatus(actionItem.StatusName);
      setEditedStatusColor(actionItem.Color);
      // Open the edit bottom sheet
      editStatusSheetRef.current?.present();
    }
  }, [actionItem]);

  const handleSaveEditLetterType = useCallback(() => {
    // This is where you would call your mutation hook
    console.log(
      `Saving edited letter type for ID ${editedItemId}: ${editedLetterType}`,
    );
    // For now, just close the sheet
    editLetterTypeSheetRef.current?.close();
  }, [editedItemId, editedLetterType, editLetterTypeSheetRef]);

  const handleSaveEditStatus = useCallback(() => {
    // This is where you would call your mutation hook
    console.log(
      `Saving edited status for ID ${editedItemId}: ${editedStatus} with color ${editedStatusColor}`,
    );
    // For now, just close the sheet
    editStatusSheetRef.current?.close();
  }, [editedItemId, editedStatus, editedStatusColor, editStatusSheetRef]);

  const statusColors = Array.isArray(letterStatuses)
    ? letterStatuses.reduce((acc, curr) => {
        acc[curr.StatusName] = curr.Color;
        return acc;
      }, {})
    : {};

  const renderList = () => {
    if (loading) {
      return (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#DC3545" />
          <Text style={styles.errorTitle}>Something Went Wrong</Text>
          <Text style={styles.errorText}>
            An unexpected error occurred. Please try again later or contact
            support if the issue persists.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (groupedDocuments.length === 0) {
      return (
        <Text style={styles.noResultsText}>
          No documents found matching your search.
        </Text>
      );
    }

    let documentIndex = 0;
    return groupedDocuments.map((group, groupIndex) => (
      <View key={group.date} style={styles.dateSection}>
        <Text style={styles.dateHeader}>
          {moment(group.date).format('MMMM D, YYYY')}
        </Text>
        {group.documents.map((doc, docIndex) => {
          documentIndex += 1;
          return (
            <DocumentCard
              key={doc.TrackingNumber}
              doc={doc}
              documentIndex={documentIndex}
              handleDocumentPress={handleDocumentPress}
              statusColors={statusColors}
            />
          );
        })}
      </View>
    ));
  };

  const renderSearchBarHeader = () => (
    <ImageBackground
      source={require('../../../assets/images/CirclesBG.png')}
      style={styles.searchHeader}>
      <View style={styles.overlay} />
      <View style={styles.searchBarContainerExpanded}>
        <Icon
          name="search"
          size={20}
          color="#90A4AE"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#90A4AE"
          value={searchTerm}
          autoCapitalize="characters"
          onChangeText={setSearchTerm}
          onSubmitEditing={Keyboard.dismiss}
          autoFocus
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          setIsSearching(false);
          setSearchTerm('');
          Keyboard.dismiss();
        }}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ImageBackground>
  );

  const renderDefaultHeader = () => (
    <ImageBackground
      source={require('../../../assets/images/CirclesBG.png')}
      style={styles.header}
      imageStyle={styles.bgHeaderImageStyle}>
      <View style={styles.overlay} />
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={{padding: 5}}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E-Logs</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={handlePresentNewFormSheet}>
          <Icon
            name="add-circle-outline"
            size={24}
            color="#fff"
            style={{marginRight: 15}}
          />
        </TouchableOpacity>
        {selectedTab === 'received' && (
          <TouchableOpacity onPress={() => setIsSearching(true)}>
            <Icon
              name="search"
              size={24}
              color="#fff"
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );

  const renderStatusModal = () => {
    if (!isStatusModalVisible || !documentToUpdate) {
      return null;
    }

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isStatusModalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setIsStatusModalVisible(false);
          setDocumentToUpdate(null);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Update Status for {documentToUpdate.TrackingNumber}
            </Text>
            {(letterStatuses || []).map((status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusOption}
                onPress={() => handleUpdateStatus(status.StatusName)}>
                <View
                  style={[
                    styles.colorIndicator,
                    {backgroundColor: status.Color},
                  ]}
                />
                <Text style={styles.statusText}>{status.StatusName}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsStatusModalVisible(false);
                setDocumentToUpdate(null);
              }}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSetupScreen = () => {
    return (
      <ScrollView contentContainerStyle={styles.setupScrollView}>
        <View style={styles.setupContainer}>
          <View style={styles.setupSectionHeader}>
            <Text style={styles.setupHeader}>Letter Types</Text>
            <TouchableOpacity
              onPress={handlePresentLetterTypeSheet}
              style={styles.addIcon}>
              <Icon name="add-circle-outline" size={28} color="#1A535C" />
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            {(letterTypes || []).map((type, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 0.5}]}>{index + 1}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    {flex: 2, fontFamily: 'Montserrat-Medium'},
                  ]}>
                  {type.Type}
                </Text>
                <Text style={[styles.tableCell, {flex: 1}]}>{type.Code}</Text>
                <TouchableOpacity
                  style={[styles.tableCell, styles.actionButtonContainer]}
                  onPress={() =>
                    handlePresentActionOptionsSheet(type, 'letterType')
                  }>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color="#4A6572"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.setupSectionHeader}>
            <Text style={[styles.setupHeader, {marginTop: 10}]}>Statuses</Text>
            <TouchableOpacity
              onPress={handlePresentStatusSheet}
              style={styles.addIcon}>
              <Icon name="add-circle-outline" size={28} color="#1A535C" />
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            {(letterStatuses || []).map((status, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 0.5}]}>{index + 1}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    {flex: 2, fontFamily: 'Montserrat-Medium'},
                  ]}>
                  {status.StatusName}
                </Text>
                <View style={[styles.tableCell, {flex: 0.5}]}>
                  <View
                    style={[
                      styles.colorIndicator,
                      {backgroundColor: status.Color},
                    ]}
                  />
                </View>
                <Text style={[styles.tableCell, {flex: 1.5}]}>
                  {status.DateAdded}
                </Text>
                <TouchableOpacity
                  style={[styles.tableCell, styles.actionButtonContainer]}
                  onPress={() =>
                    handlePresentActionOptionsSheet(status, 'status')
                  }>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color="#4A6572"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <BottomSheetModalProvider style={{flex: 1}}>
        <SafeAreaView style={styles.safeArea}>
          {isSearching ? renderSearchBarHeader() : renderDefaultHeader()}

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'received' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('received')}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'received' && styles.activeTabText,
                ]}>
                Documents Received
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                {marginLeft: 20},
                selectedTab === 'setup' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('setup')}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'setup' && styles.activeTabText,
                ]}>
                Setup
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollViewContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.content}>
              {selectedTab === 'received' ? renderList() : renderSetupScreen()}
            </View>
          </ScrollView>
          {renderStatusModal()}
        </SafeAreaView>

        <AddLetterTypeBottomSheet
          addLetterTypeSheetRef={addLetterTypeSheetRef}
          snapPointsLetterType={snapPointsLetterType}
          setNewLetterType={setNewLetterType}
          setNewLetterTypeCode={setNewLetterTypeCode}
          newLetterType={newLetterType}
          newLetterTypeCode={newLetterTypeCode}
          handleAddLetterType={handleAddLetterType}
        />
        <AddStatusBottomSheet
          addStatusSheetRef={addStatusSheetRef}
          snapPointsStatus={snapPointsStatus}
          setNewStatus={setNewStatus}
          setNewStatusColor={setNewStatusColor}
          newStatus={newStatus}
          newStatusColor={newStatusColor}
          handleAddStatus={handleAddStatus}
        />
        <ActionOptionsBottomSheet
          actionOptionsSheetRef={actionOptionsSheetRef}
          snapPointsActionOptions={snapPointsActionOptions}
          actionItemType={actionItemType}
          handleEditLetterType={handleEditLetterType}
          handleEditStatus={handleEditStatus}
          handleRemoveLetterType={handleRemoveLetterType}
          handleRemoveStatus={handleRemoveStatus}
        />
        <NewDocumentForm
          newFormSheetRef={newFormSheetRef}
          letterTypes={letterTypes}
          offices={offices}
          addLetter={addLetter}
        />
        <EditLetterTypeBottomSheet
          editLetterTypeSheetRef={editLetterTypeSheetRef}
          snapPointsEditLetterType={snapPointsEditLetterType}
          editedLetterType={editedLetterType}
          setEditedLetterType={setEditedLetterType}
          handleSaveEditLetterType={handleSaveEditLetterType}
        />
        <EditStatusBottomSheet
          editStatusSheetRef={editStatusSheetRef}
          snapPointsEditStatus={snapPointsEditStatus}
          editedStatus={editedStatus}
          setEditedStatus={setEditedStatus}
          editedStatusColor={editedStatusColor}
          setEditedStatusColor={setEditedStatusColor}
          handleSaveEditStatus={handleSaveEditStatus}
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafaff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    fontFamily: 'Montserrat-Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  searchBarContainerExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    flex: 1,
  },
  searchIcon: {
    padding: 5,
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#34495E',
    height: '100%',
    paddingLeft: 5,
    fontFamily: 'Montserrat-Regular',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Montserrat-Bold',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollViewContent: {
    flex: 1,
    backgroundColor: '#fafafaff',
  },
  content: {
    padding: 5,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  successContainer: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 200,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 15,
    marginBottom: 5,
    fontFamily: 'Montserrat-Bold',
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
    paddingHorizontal: 16,
  },
  tab: {
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1A535C',
  },
  tabText: {
    fontSize: 13,
    color: '#90A4AE',
    fontFamily: 'Montserrat-Bold',
  },
  activeTabText: {
    color: '#1A535C',
    fontFamily: 'Montserrat-Bold',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  cardContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIndexColumn: {
    paddingHorizontal: 10,
    alignSelf: 'stretch',
  },
  cardIndexText: {
    fontSize: 18,
    color: '#4476e3',
    fontFamily: 'Montserrat-Bold',
  },
  cardDetailsColumn: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000000ff',
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A535C',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat-Bold',
  },
  cardDate: {
    fontSize: 12,
    color: '#546E7A',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  cardBody: {
    marginBottom: 12,
  },
  cardSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardRowHorizontal: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardColumn: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    width: 60,
    fontFamily: 'Montserrat-Regular',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D7B8C',
    flex: 1,
    fontFamily: 'Montserrat-Bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 12,
    marginTop: 12,
  },
  cardTrackingNumber: {
    color: '#1A237E',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
  },
  cardStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28A745',
    marginRight: 8,
    fontFamily: 'Montserrat-SemiBold',
  },

  cardAttachmentIcon: {
    marginLeft: 5,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Italic',
  },
  setupContainer: {
    padding: 5,
  },
  setupScrollView: {
    paddingBottom: 40,
  },
  setupSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  setupHeader: {
    fontSize: 16,
    color: '#1A535C',
    fontFamily: 'Montserrat-Bold',
  },
  addIcon: {
    padding: 5,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A6572',
    marginBottom: 5,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  setupInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    //padding: 10,
    //marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#34495E',
    fontFamily: 'Montserrat-Regular',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 20,
    //borderWidth: 1,
    borderColor: '#E0E6ED',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#4A6572',
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  tableCell: {
    fontSize: 12,
    color: '#34495E',
    paddingHorizontal: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButtonContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    alignSelf: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#1A535C',
    fontFamily: 'Montserrat-Regular',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1A535C',
    fontFamily: 'Montserrat-Bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#4A6572',
    fontFamily: 'Montserrat-Regular',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  statusText: {
    fontSize: 16,
    color: '#34495E',
    fontFamily: 'Montserrat-Regular',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#90A4AE',
  },
  deleteModalButton: {
    backgroundColor: '#E74C3C',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A535C',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  actionOptionsContent: {
    padding: 20,
  },
  actionOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  actionOptionText: {
    fontSize: 18,
    color: '#34495E',
    marginLeft: 15,
    fontFamily: 'Montserrat-Regular',
  },
  deleteActionOptionButton: {
    borderBottomWidth: 0,
  },
  corporateErrorCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E74C3C',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  corporateErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#721C24',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  dateSection: {
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 13,
    color: '#7F8C8D',
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    fontFamily: 'Montserrat-Bold',
  },
  // Styles for the NewDocumentForm component
  formContainer: {
    padding: 20,
    flex: 1,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  formTitle: {
    fontSize: 20,
    color: '#1A535C',
    fontFamily: FONT.bold,
  },
  formScrollView: {
    paddingBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#4A6572',
    marginBottom: 5,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#34495E',
    fontFamily: 'Montserrat-Regular',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    marginTop: 20,
  },
  formHalfWidth: {
    width: '48%',
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
  attachHint: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 5,
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
  attachedFilesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  attachedFilesHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#34495E',
    fontFamily: 'Montserrat-Bold',
  },
  attachedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingRight: 10,
  },
  attachedFileName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#546E7A',
    flex: 1,
    fontFamily: 'Montserrat-Regular',
  },
  removeFileButton: {
    marginLeft: 10,
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },

  // NEW STYLES FOR THE REFACTORED CARD
  documentCardNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContentContainerNew: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardDetailsColumnNew: {
    flex: 1,
  },
  cardHeaderNew: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-end',
    //paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  cardTrackingNumberNew: {
    fontSize: 14,
    //fontWeight: 'bold',
    color: '#1A535C',
    fontFamily: 'Montserrat-Bold',
  },
  statusBadge: {
    flex: 1,
    //backgroundColor:'red',
    // paddingHorizontal: 10,
    //paddingVertical: 4,
    marginBottom: 5,
    borderRadius: 12,
    //flex:1,
  },
  statusBadgeText: {
    color: '#000000ff',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-end',
  },
  cardBodyNew: {
    paddingTop: 10,
    // paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  cardSubjectNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardInfoRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    //alignItems: 'center',
    marginBottom: 5,
  },
  cardInfoText: {
    fontSize: 12,
    color: '#7F8C8D',
    //marginLeft: 8,
    fontFamily: 'Montserrat-Regular',
  },
  cardInfoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5D7B8C',
    marginStart: 10,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
    textAlign: 'right',
  },
  cardFooterNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDateNew: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 5,
    fontFamily: 'Montserrat-Regular',
  },
  attachmentCountText: {
    fontSize: 14,
    color: '#1A535C',
    marginLeft: 5,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  // New styles for the CustomDropdown
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
});

export default ELogsScreen;
