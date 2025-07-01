// AdvanceInspectionDetails.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDisplayDateTime } from '../../utils/dateUtils'; // Assuming this utility exists

// You'll likely need to create/import hooks for API interactions
// For example:
// import { useUpdateInspectionStatus, useAddInspectionSchedule, useUpdateInspectionDeliveryDate } from '../../hooks/useInspectionDetails';

const AdvanceInspectionDetails = ({ route, navigation }) => {
  const { itemData } = route.params; // Get the item data passed from the previous screen

  const [inspectionItem, setInspectionItem] = useState(itemData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState(false);
/*   const [newDeliveryDate, setNewDeliveryDate] = useState(
    itemData?.DeliveryDate ? new Date(itemData.DeliveryDate).toISOString().split('T')[0] : '' // YYYY-MM-DD
  ); */
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Example API call functions (replace with actual implementations)
  const markAsInspected = useCallback(async () => {
    Alert.alert(
      'Confirm Inspection',
      'Are you sure you want to mark this item as Inspected?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            setError(null);
            try {
              // Simulate API call
              console.log(`Marking item ${inspectionItem.Id} as Inspected`);
              // const response = await yourApi.markItemInspected(inspectionItem.Id);
              // if (response.success) {
              setInspectionItem(prev => ({
                ...prev,
                Status: 'Inspected',
                DateInspected: new Date().toISOString(), // Update with current date/time
              }));
              Alert.alert('Success', 'Item marked as Inspected!');
              navigation.goBack(); // Go back after successful update
              // } else {
              //   setError('Failed to mark as inspected.');
              //   Alert.alert('Error', 'Failed to mark as inspected.');
              // }
            } catch (err) {
              setError('An error occurred.');
              Alert.alert('Error', 'An error occurred while marking as inspected.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [inspectionItem, navigation]);

  const markAsOnHold = useCallback(async () => {
    Alert.alert(
      'Confirm On Hold',
      'Are you sure you want to mark this item as On Hold?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            setError(null);
            try {
              // Simulate API call
              console.log(`Marking item ${inspectionItem.Id} as On Hold`);
              // const response = await yourApi.markItemOnHold(inspectionItem.Id);
              // if (response.success) {
              setInspectionItem(prev => ({
                ...prev,
                Status: 'Inspection On Hold',
              }));
              Alert.alert('Success', 'Item marked as On Hold!');
              navigation.goBack(); // Go back after successful update
              // } else {
              //   setError('Failed to mark as on hold.');
              //   Alert.alert('Error', 'Failed to mark as on hold.');
              // }
            } catch (err) {
              setError('An error occurred.');
              Alert.alert('Error', 'An error occurred while marking as on hold.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [inspectionItem, navigation]);

 /*  const handleUpdateDeliveryDate = useCallback(async () => {
    if (!newDeliveryDate) {
      Alert.alert('Error', 'Please enter a valid date.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Simulate API call to update delivery date
      console.log(
        `Updating delivery date for ${inspectionItem.Id} to ${newDeliveryDate}`
      );
      // const response = await yourApi.updateDeliveryDate(inspectionItem.Id, newDeliveryDate);
      // if (response.success) {
      setInspectionItem(prev => ({
        ...prev,
        DeliveryDate: newDeliveryDate,
      }));
      Alert.alert('Success', 'Delivery Date updated successfully!');
      setIsEditingDeliveryDate(false);
      // } else {
      //   setError('Failed to update delivery date.');
      //   Alert.alert('Error', 'Failed to update delivery date.');
      // }
    } catch (err) {
      setError('An error occurred.');
      Alert.alert('Error', 'An error occurred while updating delivery date.');
    } finally {
      setLoading(false);
    }
  }, [inspectionItem, newDeliveryDate]);
 */
  const handleAddSchedule = useCallback(async () => {
    if (!scheduleDate || !scheduleTime) {
      Alert.alert('Error', 'Please enter both date and time for the schedule.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Simulate API call to add schedule
      const fullScheduleDateTime = `${scheduleDate}T${scheduleTime}:00`; // Assuming ISO format for backend
      console.log(
        `Adding schedule for ${inspectionItem.Id}: ${fullScheduleDateTime}, Notes: ${scheduleNotes}`
      );
      // const response = await yourApi.addInspectionSchedule(inspectionItem.Id, fullScheduleDateTime, scheduleNotes);
      // if (response.success) {
      // You might want to update the inspectionItem state to reflect the new schedule
      // setInspectionItem(prev => ({
      //   ...prev,
      //   Schedule: { date: scheduleDate, time: scheduleTime, notes: scheduleNotes } // Example
      // }));
      Alert.alert('Success', 'Schedule added successfully!');
      setScheduleModalVisible(false);
      setScheduleDate('');
      setScheduleTime('');
      setScheduleNotes('');
      // } else {
      //   setError('Failed to add schedule.');
      //   Alert.alert('Error', 'Failed to add schedule.');
      // }
    } catch (err) {
      setError('An error occurred.');
      Alert.alert('Error', 'An error occurred while adding schedule.');
    } finally {
      setLoading(false);
    }
  }, [inspectionItem, scheduleDate, scheduleTime, scheduleNotes]);

  if (!inspectionItem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>No inspection item data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.bgHeader}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.backButton}>
              <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Inspection Details</Text>
            <View style={{ width: 60 }} />
          </View>
        </View>

        {loading && (
          <ActivityIndicator size="large" color={styles.loadingIndicator.color} style={styles.loadingOverlay} />
        )}

        <ScrollView contentContainerStyle={styles.detailsContent}>
          {/* PR Details */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Purchase Request Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={styles.detailValue}>{inspectionItem?.Id ?? 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Number:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.RefTrackingNumber ?? 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Year:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.Year ?? 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.CategoryName ?? 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.Status ?? 'N/A'}
              </Text>
            </View>
            {inspectionItem.Status === 'Inspected' && inspectionItem.DateInspected && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date Inspected:</Text>
                <Text style={styles.detailValue}>
                  {/* {formatDisplayDateTime(inspectionItem?.DateInspected)} */}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Inspected By:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.Inspector ?? 'N/A'}
              </Text>
            </View>
          </View>

          {/* Delivery Details */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Date:</Text>
              {isEditingDeliveryDate ? (
                <View style={styles.editDateContainer}>
                  {/* <TextInput
                    style={styles.dateInput}
                    value={newDeliveryDate}
                    onChangeText={setNewDeliveryDate}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numeric" // Use a proper date picker for production
                  /> */}
                  <TouchableOpacity
                    onPress={handleUpdateDeliveryDate}
                    style={styles.saveButton}>
                    <Icon name="checkmark-circle-outline" size={24} color="#28A745" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsEditingDeliveryDate(false)}
                    style={styles.cancelButton}>
                    <Icon name="close-circle-outline" size={24} color="#DC3545" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.detailValueWithEdit}>
                  <Text style={styles.detailValue}>
                    {/* {formatDisplayDateTime(inspectionItem?.DeliveryDate ?? 'N/A')} */}
                  </Text>
                  {inspectionItem.Status !== 'Inspected' && ( // Allow editing if not yet inspected
                    <TouchableOpacity
                      onPress={() => setIsEditingDeliveryDate(true)}
                      style={styles.editIcon}>
                      <Icon name="pencil-outline" size={20} color="#1a508c" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.Address ?? 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact Person:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.ContactPerson ?? 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact Number:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.ContactNumber ?? 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Partner:</Text>
              <Text style={styles.detailValue}>
                {inspectionItem?.TrackingPartner ?? 'N/A'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {inspectionItem.Status === 'For Inspection' && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={markAsInspected}>
                  <Icon name="checkmark-circle-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Mark as Inspected</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.onHoldButton]}
                  onPress={markAsOnHold}>
                  <Icon name="pause-circle-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Put On Hold</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.scheduleButton]}
                  onPress={() => setScheduleModalVisible(true)}>
                  <Icon name="calendar-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Add Schedule</Text>
                </TouchableOpacity>
              </>
            )}
            {/* You can add actions for 'Inspected' or 'On Hold' items if needed */}
          </View>
        </ScrollView>

        {/* Add Schedule Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={scheduleModalVisible}
          onRequestClose={() => setScheduleModalVisible(!scheduleModalVisible)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Add Inspection Schedule</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Schedule Date (YYYY-MM-DD)"
                placeholderTextColor="#9CA3AF"
                value={scheduleDate}
                onChangeText={setScheduleDate}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Schedule Time (HH:MM)"
                placeholderTextColor="#9CA3AF"
                value={scheduleTime}
                onChangeText={setScheduleTime}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Notes (Optional)"
                placeholderTextColor="#9CA3AF"
                value={scheduleNotes}
                onChangeText={setScheduleNotes}
                multiline
              />

              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[styles.modalButton, styles.buttonClose]}
                  onPress={() => setScheduleModalVisible(!scheduleModalVisible)}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.buttonAdd]}
                  onPress={handleAddSchedule}>
                  <Text style={styles.textStyle}>Add Schedule</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 100,
    backgroundColor: '#1a508c',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 15,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '500',
  },
  detailsContent: {
    padding: 15,
    paddingTop: 20,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
    width: 130, // Fixed width for labels for alignment
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    color: '#212529',
  },
  detailValueWithEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editIcon: {
    marginLeft: 10,
    padding: 5,
  },
  editDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#343A40',
    marginRight: 10,
  },
  saveButton: {
    padding: 5,
    marginRight: 5,
  },
  cancelButton: {
    padding: 5,
  },
  actionsContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  actionButton: {
    backgroundColor: '#28A745', // Green for inspected
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  onHoldButton: {
    backgroundColor: '#FFC107', // Amber for on hold
  },
  scheduleButton: {
    backgroundColor: '#17A2B8', // Info blue for schedule
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  loadingIndicator: {
    color: '#1a508c',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  errorText: {
    textAlign: 'center',
    color: '#DC3545',
    fontSize: 16,
    marginTop: 20,
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343A40',
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#343A40',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonAdd: {
    backgroundColor: '#1a508c',
  },
  buttonClose: {
    backgroundColor: '#6C757D',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AdvanceInspectionDetails;