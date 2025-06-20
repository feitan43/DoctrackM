import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  Alert,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import useSendNotifInspector from '../../api/useSendNotifInspector';
import {
  useOnSchedule,
  useInspectionInspectors,
  useAssignInspector,
} from '../../hooks/useInspectionScheduler';
import {useQueryClient} from '@tanstack/react-query';
import {showMessage} from 'react-native-flash-message';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import BSOnSchedule from '../../components/BSOnSchedule';

import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetScrollView, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import InspectorsList from '../../components/InspectorsList';

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May.',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

const OnScheduleScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const {
    data: scheduleData,
    error: scheduleError,
    loading: scheduleLoading,
  } = useOnSchedule();
  const {
    data: inspectors,
    loading: inspectorsLoading,
    error: inspectorsError,
  } = useInspectionInspectors();
  const {
    sendNotifInspector,
    loading: sendNotifLoading,
    error: sendNotifError,
  } = useSendNotifInspector();
  const {mutateAsync: assignInspector} = useAssignInspector();

  const [selectedInspector, setSelectedInspector] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [itemTN, setItemTN] = useState(null);

  const [loading, setLoading] = useState(false);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalInspector, setModalInspector] = useState({
    EmployeeNumber: '',
    Inspector: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const [showInspectors, setShowInspectors] = useState(false);

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['onSchedule']);
    } catch (error) {
      console.error('Error refreshing onSchedule data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const inspectorOptions = scheduleData
    ? Array.from(new Set(scheduleData.map(item => item.Inspector))).map(
        inspector => ({
          label: inspector,
          value: inspector,
        }),
      )
    : [];

  const handleAssignInspector = (requestId, trackingNumber) => {
    setSelectedRequestId(requestId);
    setItemTN(trackingNumber);
    setModalVisible(true);
  };

  const assignInspectorToRequest = async inspector => {
    const tn = itemTN;
    const requestId = selectedRequestId;
    const {EmployeeNumber, Inspector} = inspector;

    Alert.alert(
      '',
      `Assign ${Inspector} to TN ${tn}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await assignInspector({
                id: requestId,
                inspectorEmp: EmployeeNumber,
                inspectorName: Inspector,
              });

              queryClient.invalidateQueries(['onSchedule']);
              queryClient.invalidateQueries(['inspectionRequest']);

              showMessage({
                message: 'Success',
                description:
                  response.message || 'Inspector assigned successfully!',
                type: 'success',
                icon: 'success',
                duration: 3000,
                floating: true,
              });

              setModalVisible(false);
            } catch (err) {
              console.error('Error:', err);
              showMessage({
                message: 'Error',
                description: err.message || 'Failed to assign inspector.',
                type: 'danger',
                icon: 'danger',
                floating: true,
                duration: 3000,
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = useCallback(
    ({item, index}) => (
      <BSOnSchedule
        key={item.Id}
        item={item}
        index={index}
        handleAssignInspector={handleAssignInspector}
      />
    ),
    [handleAssignInspector],
  );

  const filteredScheduleData = useMemo(() => {
    let dataToFilter = scheduleData || [];

    if (selectedDate) {
      const formattedSelectedDate = selectedDate;
      dataToFilter = dataToFilter.filter(item => {
        const itemDeliveryDate = item.DeliveryDate.split(' ')[0];
        return itemDeliveryDate === formattedSelectedDate;
      });
    }

    return dataToFilter.filter(item => {
      const matchesInspector =
        !selectedInspector || item.Inspector === selectedInspector;
      const matchesSearchQuery =
        !searchQuery ||
        (item.Inspector &&
          item.Inspector.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.OfficeName &&
          item.OfficeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.TrackingNumber &&
          item.TrackingNumber.toLowerCase().includes(
            searchQuery.toLowerCase(),
          ));
      return matchesInspector && matchesSearchQuery;
    });
  }, [scheduleData, selectedInspector, searchQuery, selectedDate]);

  const markedDates = useMemo(() => {
    const dates = {};
    if (scheduleData) {
      scheduleData.forEach(item => {
        const date = item.DeliveryDate.split(' ')[0];
        if (date) {
          dates[date] = {
            marked: true,
            dotColor: '#007bff',
            selected: date === selectedDate,
            selectedColor: '#007bff',
            selectedTextColor: 'white',
          };
        }
      });
    }
    if (selectedDate && !dates[selectedDate]) {
      dates[selectedDate] = {
        selected: true,
        selectedColor: '#007bff',
        selectedTextColor: 'white',
      };
    } else if (selectedDate && dates[selectedDate]) {
      dates[selectedDate].selected = true;
      dates[selectedDate].selectedColor = '#007bff';
      dates[selectedDate].selectedTextColor = 'white';
    }
    return dates;
  }, [scheduleData, selectedDate]);

  const clearFilter = () => {
    setSelectedInspector(null);
    setSearchQuery('');
    setSelectedDate('');
  };

  const handleDayPress = useCallback(day => {
    setSelectedDate(day.dateString);
    setShowInspectors(false);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      setIsBottomSheetVisible(false);
    }
  }, []);

  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const calculateOverdue = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = scheduleData?.filter(item => {
        const deliveryDatePart = item.DeliveryDate.split(' ')[0];
        const deliveryDate = new Date(deliveryDatePart);
        deliveryDate.setHours(0, 0, 0, 0);

        const isInspected = item.DateInspected && item.DateInspected !== '';

        return deliveryDate <= today && !isInspected;
      }).length;

      setOverdueCount(count);
    };

    calculateOverdue();
  }, [scheduleData]);

  const handleShowInspectors = () => {
    setShowInspectors(true);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
    setSelectedDate('');
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}>
          <View style={styles.header}>
            {showSearchBar ? (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={toggleSearchBar}
                  style={styles.searchIcon}>
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}>
                  <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>On Schedule</Text>
                <TouchableOpacity
                  onPress={toggleSearchBar}
                  style={styles.searchIcon}>
                  <Icon name="search" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </ImageBackground>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'stretch',
            paddingHorizontal: 10,
            marginTop: 20,
          }}>
          <View style={styles.card2}>
            <Text style={styles.cardLabel}>On Schedule</Text>
            <Text style={styles.cardValue}>{scheduleData?.length}</Text>
          </View>

          <Pressable style={styles.card2} onPress={handleShowInspectors}>
            <Text style={styles.cardLabel}>Inspectors</Text>
            <Text style={styles.cardValue}>{inspectors?.length}</Text>
          </Pressable>

          <View style={styles.card2}>
            <Text style={styles.cardLabel}>Overdue</Text>
            <Text style={[styles.cardValue, {color: 'red'}]}>
              {overdueCount}
            </Text>
          </View>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#007bff',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00adf5',
              arrowColor: '#007bff',
              textDayFontFamily: 'Inter_28pt-Regular',
              textMonthFontFamily: 'Inter_28pt-Bold',
              textDayHeaderFontFamily: 'Inter_28pt-Regular',
            }}
          />
        </View>

        {isBottomSheetVisible && (
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            backdropComponent={BottomSheetBackdrop}
            style={styles.bottomSheet}>
            <View style={styles.contentContainer}>
              {showInspectors ? (
                <>
                  <Text style={styles.bottomSheetTitle}>Inspectors</Text>
                  {inspectorsLoading ? (
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  ) : (
                    <InspectorsList inspectors={inspectors} scheduleData={scheduleData} />
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.bottomSheetTitle}>
                    Schedules for {selectedDate || 'All Dates'}
                  </Text>
                  {scheduleLoading ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  ) : (
                    <BottomSheetScrollView
                      contentContainerStyle={styles.listContainer}
                      refreshing={refreshing}>
                      {filteredScheduleData.length > 0 ? (
                        filteredScheduleData.map((item, index) =>
                          renderItem({item, index}),
                        )
                      ) : (
                        <View style={styles.emptyListContainer}>
                          <Text style={styles.emptyListText}>
                            No inspections scheduled for this date or matching your
                            search.
                          </Text>
                        </View>
                      )}
                    </BottomSheetScrollView>
                  )}
                </>
              )}
            </View>
          </BottomSheet>
        )}

        <Modal visible={loading} transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                width: '80%',
                height: '10%',
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <Text style={{color: '#252525', fontSize: 16}}>Assigning...</Text>
              <ActivityIndicator size="large" color="blue" />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={successModalVisible}
          onRequestClose={() => setSuccessModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                width: '85%',
                backgroundColor: 'white',
                paddingVertical: 30,
                paddingHorizontal: 20,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon
                name="checkmark-circle"
                size={60}
                color="#28a745"
                style={{marginBottom: 20}}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: 12,
                  textAlign: 'center',
                }}>
                Success
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#555',
                  marginBottom: 25,
                  textAlign: 'center',
                }}>
                <Text style={{fontWeight: 'bold'}}>Inspector: </Text>
                {modalInspector.EmployeeNumber} - {modalInspector.Inspector}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#28a745',
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setModalVisible(false);
                  setSuccessModalVisible(false);
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={errorModalVisible}
          onRequestClose={() => setErrorModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                width: '85%',
                backgroundColor: 'white',
                paddingVertical: 30,
                paddingHorizontal: 20,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon
                name="close-circle"
                size={60}
                color="#dc3545"
                style={{marginBottom: 20}}
              />
              <Text
                style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
                Error
              </Text>
              <Text style={{fontSize: 16, marginBottom: 20}}>
                {modalMessage}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#dc3545',
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setModalVisible(false);
                  setErrorModalVisible(false);
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View
                style={{
                  borderBottomWidth: 1,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={styles.modalTitle}>Assign Inspector</Text>
              </View>
              <FlatList
                data={inspectors}
                keyExtractor={item => item.Id}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    style={styles.inspectorItem}
                    onPress={() => assignInspectorToRequest(item)}>
                    <Text style={styles.inspectorName}>{item.Inspector}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={[
                  styles.assignButton,
                  {
                    backgroundColor: '#ccc',
                    marginTop: 10,
                    paddingHorizontal: 100,
                  },
                ]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: 'space-between',
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginStart: 10,
    marginRight: 20,
    paddingStart: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 999,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    paddingBottom: 10,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  openBottomSheetButton: {
    backgroundColor: '#1a508c',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  openBottomSheetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_28pt-ExtraLight',
    color: 'gray',
    textAlign: 'right',
    flex: 0.3,
  },
  value: {
    paddingStart: 10,
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    color: 'black',
    flex: 0.7,
  },
  revertButton: {
    marginTop: 10,
    backgroundColor: 'rgb(247, 189, 80)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: 'rgb(80, 161, 247)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  assignButton: {
    marginTop: 8,
    backgroundColor: 'rgb(80, 161, 247)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: '60%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_28pt-Bold',
    marginBottom: 16,
  },
  inspectorItem: {
    padding: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  inspectorName: {
    fontSize: 16,
    color: '#333',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  contentContainer: {
    flex: 1,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    color: '#333',
    marginStart: 20,
  },
  card2: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default OnScheduleScreen;