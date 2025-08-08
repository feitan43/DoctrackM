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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useElogsLetters} from '../../hooks/useElogs';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';

function ELogsScreen({navigation}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState('received');

  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [documentToUpdate, setDocumentToUpdate] = useState(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  const {data: elogsData, loading, error, refetch} = useElogsLetters();

  const [documentTypes, setDocumentTypes] = useState([
    {type: 'REQUEST LETTER', code: 'RL'},
    {type: '1ST INDORSEMENT', code: '1I'},
    {type: 'MEMORANDUM', code: 'MM'},
  ]);
  const [statuses, setStatuses] = useState([
    {status: 'RELEASE', color: '#28A745', dateAdded: '2025-08-01'},
    {status: 'Forwarded', color: '#FFC107', dateAdded: '2025-08-01'},
    {status: 'Pending', color: '#DC3545', dateAdded: '2025-08-01'},
    {status: 'ENCODED', color: '#17A2B8', dateAdded: '2025-08-01'},
    {status: 'Endorsement', color: '#FD7E14', dateAdded: '2025-08-01'},
    {status: 'Further Discussion', color: '#007BFF', dateAdded: '2025-08-01'},
  ]);

  const [newDocumentType, setNewDocumentType] = useState('');
  const [newDocumentTypeCode, setNewDocumentTypeCode] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('');

  const [localDatabase, setLocalDatabase] = useState(elogsData || {});

  const addDocumentTypeSheetRef = useRef(null);
  const addStatusSheetRef = useRef(null);

  const snapPointsDocumentType = useMemo(() => ['90%'], []);
  const snapPointsStatus = useMemo(() => ['50%'], []);

  // Handlers for opening bottom sheets
  const handlePresentDocumentTypeSheet = useCallback(() => {
    addDocumentTypeSheetRef.current?.present();
  }, []);

  const handlePresentStatusSheet = useCallback(() => {
    addStatusSheetRef.current?.present();
  }, []);

  useEffect(() => {
    if (elogsData) {
      setLocalDatabase(elogsData);
    }
  }, [elogsData]);

  const filteredDocuments = Object.values(localDatabase)
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
    const updatedDatabase = {...localDatabase};
    const trackingNumber = documentToUpdate.TrackingNumber;

    updatedDatabase[trackingNumber] = {
      ...updatedDatabase[trackingNumber],
      Status: newStatus,
    };

    setLocalDatabase(updatedDatabase);
    setIsStatusModalVisible(false);
    setDocumentToUpdate(null);

    Alert.alert(
      'Success',
      `Status for document ${trackingNumber} has been updated to "${newStatus}".`,
    );
  };

  const handleAddDocumentType = () => {
    if (newDocumentType.trim() !== '' && newDocumentTypeCode.trim() !== '') {
      setDocumentTypes(prev => [
        ...prev,
        {type: newDocumentType.trim(), code: newDocumentTypeCode.trim()},
      ]);
      setNewDocumentType('');
      setNewDocumentTypeCode('');
      addDocumentTypeSheetRef.current?.close();
      Alert.alert(
        'Success',
        `Document Type "${newDocumentType}" added with code "${newDocumentTypeCode}".`,
      );
    } else {
      Alert.alert('Error', 'Document type and code cannot be empty.');
    }
  };

  const handleRemoveDocumentType = typeToRemove => {
    setDocumentTypes(prev => prev.filter(type => type.type !== typeToRemove));
    setIsDeleteModalVisible(false);
  };

  const handleEditDocumentType = type => {
    Alert.alert(
      'Edit Document Type',
      `Functionality to edit ${type.type} is not yet implemented.`,
    );
  };

  const handleAddStatus = () => {
    if (newStatus.trim() !== '' && newStatusColor.trim() !== '') {
      const newStatusEntry = {
        status: newStatus.trim(),
        color: newStatusColor.trim(),
        dateAdded: new Date().toISOString().split('T')[0],
      };
      setStatuses(prev => [...prev, newStatusEntry]);
      setNewStatus('');
      setNewStatusColor('');
      addStatusSheetRef.current?.close();
      Alert.alert(
        'Success',
        `Status "${newStatus}" added with color "${newStatusColor}".`,
      );
    } else {
      Alert.alert('Error', 'Status and color cannot be empty.');
    }
  };

  const handleRemoveStatus = statusToRemove => {
    setStatuses(prev =>
      prev.filter(status => status.status !== statusToRemove),
    );
    setIsDeleteModalVisible(false);
  };

  const statusColors = statuses.reduce((acc, curr) => {
    acc[curr.status] = curr.color;
    return acc;
  }, {});

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

    if (filteredDocuments.length === 0) {
      return (
        <Text style={styles.noResultsText}>
          No documents found matching your search.
        </Text>
      );
    }
    return filteredDocuments.map((doc, index) => (
      <TouchableOpacity
        key={doc.TrackingNumber}
        style={styles.documentCard}
        onPress={() => handleDocumentPress(doc)}>
        <View style={styles.cardContentContainer}>
          <View style={styles.cardIndexColumn}>
            <Text style={styles.cardIndexText}>{index + 1}</Text>
          </View>
          <View style={styles.cardDetailsColumn}>
            <Text style={styles.cardTrackingNumber}>
              <Text style={{color: '#9c9c9cff', fontWeight: '400'}}>TN:</Text>{' '}
              {doc.TrackingNumber}
            </Text>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>{doc.Type}</Text>
              <Text style={styles.cardDate}>
                {doc.DateReceived
                  ? moment(doc.DateReceived, 'YYYY-MM-DD hh:mm A').format(
                      'MMMM D, YYYY h:mm A',
                    )
                  : ''}
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardSubject}>{doc.Subject}</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>From:</Text>
                <Text style={styles.cardValue} numberOfLines={1}>
                  {doc.Sender}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>To:</Text>
                <Text style={styles.cardValue} numberOfLines={1}>
                  {doc.Receiver}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardDate}>
                {doc.DateReleased
                  ? moment(doc.DateReleased, 'YYYY-MM-DD hh:mm A').format(
                      'MMMM D, YYYY h:mm A',
                    )
                  : ''}
              </Text>
              <View style={styles.cardStatusContainer}>
                <Text
                  style={[
                    styles.cardStatus,
                    {color: statusColors[doc.Status] || '#28A745'},
                  ]}>
                  {doc.Status}
                </Text>
                {doc.AttachmentCount > '0' ? (
                  <Icon
                    name="document-attach"
                    size={24}
                    color="#1A535C"
                    style={styles.cardAttachmentIcon}
                  />
                ) : (
                  <Icon
                    name="document-outline"
                    size={24}
                    color="#B0BEC5"
                    style={styles.cardAttachmentIcon}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderSearchBarHeader = () => (
    <LinearGradient
      colors={['#1A508C', '#004ab1']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.searchHeader}>
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
    </LinearGradient>
  );

  const renderDefaultHeader = () => (
    <LinearGradient
      colors={['#1A508C', '#004ab1']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.header}>
      {/* <View style={styles.header}> */}
      <View style={styles.headerLeft}>
        <TouchableOpacity style={{padding: 5}} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E-Logs</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={() => setIsSearching(true)}>
          <Icon
            name="search"
            size={24}
            color="#fff"
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      {/* </View> */}
    </LinearGradient>
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
        onRequestClose={() => {
          setIsStatusModalVisible(false);
          setDocumentToUpdate(null);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Update Status for {documentToUpdate.TrackingNumber}
            </Text>
            {statuses.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusOption}
                onPress={() => handleUpdateStatus(status.status)}>
                <View
                  style={[
                    styles.colorIndicator,
                    {backgroundColor: status.color},
                  ]}
                />
                <Text style={styles.statusText}>{status.status}</Text>
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

  const renderDeleteModal = () => {
    if (!isDeleteModalVisible || !itemToDelete) {
      return null;
    }

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete
              <Text style={{fontWeight: 'bold'}}>
                {' '}
                {itemToDelete.type || itemToDelete.status}
              </Text>
              ?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setIsDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={() => {
                  if (deleteType === 'documentType') {
                    handleRemoveDocumentType(itemToDelete.type);
                  } else {
                    handleRemoveStatus(itemToDelete.status);
                  }
                }}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.setupHeader}>Document Types</Text>
            <TouchableOpacity
              onPress={handlePresentDocumentTypeSheet}
              style={styles.addIcon}>
              <Icon name="add-circle-outline" size={28} color="#1A535C" />
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            {/* <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 0.5}]}>
                {" "}
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 2}]}>
                Document Type
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 1}]}>
                Code
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 1.5}]}>
                Actions
              </Text>
            </View> */}
            {documentTypes.map((type, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 0.5}]}>{index + 1}</Text>
                <Text style={[styles.tableCell, {flex: 2}]}>{type.type}</Text>
                <Text style={[styles.tableCell, {flex: 1}]}>{type.code}</Text>
                <View
                  style={[styles.tableCell, styles.actionButtons, {flex: 1.5}]}>
                  <TouchableOpacity
                    onPress={() => handleEditDocumentType(type)}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={24}
                      color="#3498DB"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setDeleteType('documentType');
                      setItemToDelete(type);
                      setIsDeleteModalVisible(true);
                    }}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color="#E74C3C"
                    />
                  </TouchableOpacity>
                </View>
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
            {/* <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 0.5}]}>
                {""}
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 2}]}>
                Status
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 0.5}]}>
                Color
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 1.5}]}>
                Date Added
              </Text>
              <Text
                style={[styles.tableCell, styles.tableHeaderCell, {flex: 1.5}]}>
                Actions
              </Text>
            </View> */}
            {statuses.map((status, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 0.5}]}>{index + 1}</Text>
                <Text style={[styles.tableCell, {flex: 2}]}>
                  {status.status}
                </Text>
                <View style={[styles.tableCell, {flex: 0.5}]}>
                  <View
                    style={[
                      styles.colorIndicator,
                      {backgroundColor: status.color},
                    ]}
                  />
                </View>
                <Text style={[styles.tableCell, {flex: 1.5}]}>
                  {status.dateAdded}
                </Text>
                <View
                  style={[styles.tableCell, styles.actionButtons, {flex: 1.5}]}>
                  <TouchableOpacity
                    onPress={() => handleEditDocumentType(status)}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={24}
                      color="#3498DB"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setDeleteType('status');
                      setItemToDelete(status);
                      setIsDeleteModalVisible(true);
                    }}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color="#E74C3C"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const AddDocumentTypeBottomSheet = () => (
    <BottomSheetModal
      ref={addDocumentTypeSheetRef}
      index={0}
      snapPoints={snapPointsDocumentType}
      keyboardBehavior="interactive" // <--- The key fix is here
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
        setNewDocumentType('');
        setNewDocumentTypeCode('');
      }}>
      <View style={styles.bottomSheetContent}>
        <Text style={styles.bottomSheetTitle}>Add New Document Type</Text>
        <Text style={styles.inputLabel}>New Document Type</Text>
        <TextInput
          style={styles.setupInput}
          placeholder="e.g., REQUEST LETTER"
          placeholderTextColor="#90A4AE"
          value={newDocumentType}
          onChangeText={setNewDocumentType}
        />
        <Text style={styles.inputLabel}>Code</Text>
        <TextInput
          style={styles.setupInput}
          placeholder="e.g., RL"
          placeholderTextColor="#90A4AE"
          value={newDocumentTypeCode}
          onChangeText={setNewDocumentTypeCode}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddDocumentType}>
          <Text style={styles.addButtonText}>Add Document Type</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );

  const AddStatusBottomSheet = () => (
    <BottomSheetModal
      ref={addStatusSheetRef}
      index={0}
      snapPoints={snapPointsStatus}
      keyboardBehavior="interactive" // <--- The key fix is here
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
        setNewStatus('');
        setNewStatusColor('');
      }}>
      <View style={styles.bottomSheetContent}>
        <Text style={styles.bottomSheetTitle}>Add New Status</Text>
        <Text style={styles.inputLabel}>New Status</Text>
        <TextInput
          style={styles.setupInput}
          placeholder="e.g., RELEASE"
          placeholderTextColor="#90A4AE"
          value={newStatus}
          onChangeText={setNewStatus}
        />
        <Text style={styles.inputLabel}>Color (Hex Code)</Text>
        <TextInput
          style={styles.setupInput}
          placeholder="e.g., #007BFF"
          placeholderTextColor="#90A4AE"
          value={newStatusColor}
          onChangeText={setNewStatusColor}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddStatus}>
          <Text style={styles.addButtonText}>Add Status</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );

  return (
    <BottomSheetModalProvider style={{flex: 1}}>
      <SafeAreaView style={styles.safeArea}>
        {isSearching ? renderSearchBarHeader() : renderDefaultHeader()}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'received' && styles.activeTab]}
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

        <ScrollView style={styles.scrollViewContent}>
          <View style={styles.content}>
            {selectedTab === 'received' ? renderList() : renderSetupScreen()}
          </View>
        </ScrollView>
        {renderStatusModal()}
        {renderDeleteModal()}
      </SafeAreaView>

      <AddDocumentTypeBottomSheet />
      <AddStatusBottomSheet />
    </BottomSheetModalProvider>
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
    justifyContent: 'space-between',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
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
    height: 40,
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
    fontSize: 16,
    color: '#34495E',
    height: '100%',
    paddingLeft: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollViewContent: {
    flex: 1,
    backgroundColor: '#e9ebee',
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
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
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
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1A535C',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#90A4AE',
  },
  activeTabText: {
    color: '#1A535C',
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
    elevation: 5,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4476e3',
  },
  cardDetailsColumn: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A535C',
    textTransform: 'uppercase',
  },
  cardDate: {
    fontSize: 12,
    color: '#546E7A',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 12,
  },
  cardSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: 'bold',
    width: 60,
  },
  cardValue: {
    fontSize: 14,
    color: '#5D7B8C',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 12,
    marginTop: 12,
  },
  cardTrackingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4476e3',
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
    marginBottom: 15,
  },
  setupHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A535C',
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
  },
  setupInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#34495E',
  },
  addButton: {
    backgroundColor: '#1A535C',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  tableCell: {
    fontSize: 14,
    color: '#34495E',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#4A6572',
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
  },
  corporateErrorCard: {
    backgroundColor: '#FFFFFF', // Light red background
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
    color: '#721C24', // Darker, more professional red
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ELogsScreen;
