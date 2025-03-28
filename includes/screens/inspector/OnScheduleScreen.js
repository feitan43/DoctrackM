import React, {useState, useEffect} from 'react';
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

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['onSchedule']); // Invalidate and refetch data
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
  const fixEncoding = text => {
    return String(text || '').replace(/�/g, 'Ñ');
  };

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

              /* setSuccessModalVisible(true);
                setModalMessage(
                  response.message || 'Inspector assigned successfully!',
                );
                setModalInspector({EmployeeNumber, Inspector}); */

              queryClient.invalidateQueries(['inspectionRequest']);

              // Show success message
              showMessage({
                message: 'Success',
                description:
                  response.message || 'Inspector assigned successfully!',
                type: 'success',
                icon: 'success',
                duration: 3000,
                floating: true,
                duration: 3000,
              });

              setModalVisible(false);

              // await sendNotifInspector(itemTN, EmployeeNumber);
            } catch (err) {
              console.error('Error:', err);
              /*  setErrorModalVisible(true);
                setModalMessage(err.message || 'An unexpected error occurred.'); */

              // Show error message
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

  const renderItem = ({item, index}) => (
    <View
      style={{
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
        marginHorizontal: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2},
      }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderRadius: 5,
        }}>
        <View
          style={{
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            backgroundColor: 'rgba(230, 234, 245, 1)',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'rgb(7, 84, 252)',
              textAlign: 'center',
            }}>
            {index + 1}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Text style={{flex: 0.2, fontSize: 14, color: '#555'}}>{''}</Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {item.Year}{' '}
            <Text
              style={{
                fontSize: 16,
                textAlign: 'center',
                color: 'rgb(80, 161, 247)',
              }}>
              |
            </Text>{' '}
            {item.TrackingNumber}
          </Text>
        </View>
      </View>

      <View
        style={{
          alignSelf: 'center',
          height: 1,
          backgroundColor: '#ddd',
          width: '100%',
          marginVertical: 5,
          borderRadius: 10,
        }}
      />

      {/* Inspection Details */}
      <View style={{marginTop: 10}}>
        <View style={{flexDirection: 'row', marginBottom: 5}}>
          <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>Office</Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {item.OfficeName}
          </Text>
        </View>

        <View style={{flexDirection: 'row', marginBottom: 5}}>
          <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>Category</Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {item.CategoryCode} - {item.CategoryName}
          </Text>
        </View>

        <View style={{flexDirection: 'row', marginBottom: 5}}>
          <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>
            Inspector
          </Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {fixEncoding(item.Inspector)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          alignSelf: 'center',
          height: 1,
          width: '90%',
          backgroundColor: '#ddd',
          marginVertical: 10,
        }}
      />

      {/* Delivery Information */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#0754FC',
          marginBottom: 5,
        }}>
        Delivery
      </Text>
      {/* <View style={{ flexDirection: "row",gap: 10, marginBottom: 5 }}> */}

      <View style={{flexDirection: 'row', marginBottom: 5}}>
        <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>Date</Text>
        <Text
          style={{flex: 0.7, fontSize: 14, fontWeight: 'bold', color: '#333'}}>
          {item.DeliveryDate}
        </Text>
      </View>

      <View style={{flexDirection: 'row', marginBottom: 5}}>
        <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>Address</Text>
        <Text
          style={{flex: 0.7, fontSize: 14, fontWeight: 'bold', color: '#333'}}>
          {item.Address}
        </Text>
      </View>

      <View style={{flexDirection: 'row', marginBottom: 5}}>
        <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>Contact #</Text>
        <Text
          style={{flex: 0.7, fontSize: 14, fontWeight: 'bold', color: '#333'}}>
          {item.ContactNumber}
        </Text>
      </View>

      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>Person: </Text>
        <Text
          style={{flex: 0.7, fontSize: 14, fontWeight: 'bold', color: '#333'}}>
          {item.ContactPerson}
        </Text>
      </View>
      {/* </View>
       */}

      {/* Buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
          marginTop: 15,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#ff8400',
            padding: 10,
            borderRadius: 5,
            minWidth: 130,
            alignItems: 'center',
          }}
          onPress={() => handleAssignInspector(item.Id, item.TrackingNumber)}>
          <Text style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}>
            Change Inspector
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#007bff',
            padding: 10,
            borderRadius: 5,
            minWidth: 130,
            alignItems: 'center',
          }}
          onPress={() =>
            navigation.navigate('InspectionDetails', {item, scheduleData})
          }>
          <Text style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredScheduleData = scheduleData
    ? scheduleData.filter(item => {
        const matchesInspector =
          !selectedInspector || item.Inspector === selectedInspector;
        const matchesSearchQuery =
          !searchQuery ||
          (item.Inspector &&
            item.Inspector.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.OfficeName &&
            item.OfficeName.toLowerCase().includes(
              searchQuery.toLowerCase(),
            )) ||
          (item.TrackingNumber &&
            item.TrackingNumber.toLowerCase().includes(
              searchQuery.toLowerCase(),
            ));
        return matchesInspector && matchesSearchQuery;
      })
    : [];

  const clearFilter = () => {
    setSelectedInspector(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/images/CirclesBG.png')} // Change this to your background image
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

      {/* Search Bar */}
      {/* {showSearchBar && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon
              name="search"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Inspector, Office, or TN"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              autoCapitalize="characters"
              //placeholderTextColor="silver"
              autoFocus={true}
              autoCorrect={false}
              autoCompleteType="off"
              textContentType="none"
              keyboardType="default"
              spellCheck={false}
            />
          </View>
        </View>
      )} */}

      {/* Inspector Dropdown Filter */}
      <View style={styles.filterContainer}>
        {/*    <Text style={styles.filterLabel}>
          Filter by <Text style={{color: 'rgb(0, 123, 255)'}}>Inspector</Text>
        </Text>

        <Dropdown
          data={inspectorOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Inspector"
          value={selectedInspector}
          onChange={item => setSelectedInspector(item.value)}
          style={styles.dropdown}
        /> */}

        {/* Clear Filter Button */}
        {selectedInspector && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilter}>
            <Text style={styles.buttonText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Schedule List */}
      <View style={{alignSelf: 'flex-end'}}>
        <Text style={{marginHorizontal: 10, paddingEnd: 10, paddingTop: 10}}>
          {filteredScheduleData.length} results
        </Text>
      </View>
      {scheduleLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={filteredScheduleData}
          renderItem={renderItem}
          keyExtractor={item => item.Id}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          initialNumToRender={10}
          windowSize={5}
        />
      )}

      {/* Loading Overlay */}
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

      {/* Success Modal */}
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

      {/* Error Modal */}
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
            <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
              Error
            </Text>
            <Text style={{fontSize: 16, marginBottom: 20}}>{modalMessage}</Text>
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
                  <Text style={styles.inspectorName}>
                    {/* {item.EmployeeNumber} -  */}
                    {item.Inspector}
                  </Text>
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
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    // paddingBottom: 10,
  },
  filterLabel: {
    paddingTop: 10,
    fontSize: 14,
    paddingStart: 10,
    color: '#252525',
    marginBottom: 8,
    fontFamily: 'Inter_28pt-Regular',
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginHorizontal: 16,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: '#FF6B6B', // Red for clear filter button
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
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
    flexDirection: 'row', // Align label and value horizontally
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_28pt-ExtraLight',
    color: 'gray',
    textAlign: 'right',
    flex: 0.3, // Label takes 30% width
  },
  value: {
    paddingStart: 10,
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    color: 'black',
    flex: 0.7, // Value takes 70% width
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
});

export default OnScheduleScreen;
