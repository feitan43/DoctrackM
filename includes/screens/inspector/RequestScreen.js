import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useRequestInspection,
  useInspectionInspectors,
  useAssignInspector,
} from '../../hooks/useInspectionScheduler';
import {useQueryClient} from '@tanstack/react-query';
import {showMessage} from 'react-native-flash-message';

const RequestScreen = () => {
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const {
    data: requestData,
    loading: requestLoading,
    error: requestError,
  } = useRequestInspection();
  const {
    data: inspectors,
    loading: inspectorLoading,
    error: inspectorError,
  } = useInspectionInspectors();
  const {mutateAsync: assignInspector} = useAssignInspector();
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
  const queryClient = useQueryClient();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const years = Array.from({length: currentYear - 2024 + 1}, (_, i) => {
    const year = (2024 + i).toString();
    return {label: year, value: year};
  });

  const filteredData = Array.isArray(requestData)
    ? requestData.filter(item => {
        const searchTerm = searchQuery?.toLowerCase() || '';

        const {
          OfficeName = '',
          TrackingNumber = '',
          RefTrackingNumber = '',
          CategoryName = '',
          Year,
        } = item;

        if (selectedYear && Year !== selectedYear) {
          return false;
        }

        if (
          !String(OfficeName).toLowerCase().includes(searchTerm) && // Ensure it's a string
          !String(TrackingNumber).toLowerCase().includes(searchTerm) && // Ensure it's a string
          !String(RefTrackingNumber).toLowerCase().includes(searchTerm) &&
          !String(CategoryName).toLowerCase().includes(searchTerm) // Ensure it's a string
        ) {
          return false;
        }

        return true;
      })
    : [];

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['inspectionRequest']); // Invalidates and refetches data
    } catch (error) {
      console.error('Error refreshing inspection items:', error);
    } finally {
      setRefreshing(false);
    }
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

              queryClient.invalidateQueries(['inspectionRequest']);

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

  /* const renderItem = ({item, index}) => (
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
      <View
        style={{
          flexDirection: 'row',
          //backgroundColor: 'rgba(230, 234, 245, 1)',
          alignItems: 'center',
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
            style={{
              //flex: 0.7,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {item.OfficeName}
          </Text>
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

      <View style={{paddingVertical: 10}}>
        {[
          {label: 'Office', value: item.OfficeName},
          {
            label: 'Category',
            value: `${item.CategoryCode}\n${item.CategoryName}`,
          },
        ].map(({label, value}, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginVertical: 4,
            }}>
            <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>
              {label}
            </Text>
            <Text
              style={{
                flex: 0.7,
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333',
              }}>
              {value}
            </Text>
          </View>
        ))}
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

      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#0754FC',
          marginBottom: 5,
        }}>
        Delivery
      </Text>
      {[
        {label: 'Date', value: item.DeliveryDate},
        {label: 'Address', value: item.Address},
        {label: 'Contact', value: item.ContactPerson},
        {label: '', value: item.ContactNumber},
      ].map(({label, value}, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 4,
          }}>
          <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>{label}</Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {value}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={{
          backgroundColor: '#007bff',
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 12,
        }}
        onPress={() => handleAssignInspector(item.Id, item.TrackingNumber)}>
        <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
          Assign
        </Text>
      </TouchableOpacity>
    </View>
  ); */

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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
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

      <View style={{flexDirection: 'column', flex: 1, marginLeft: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
         {/*  <Text style={{flex: 0.2, fontSize: 14, color: '#555'}}>{''}</Text> */}
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
     <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{flex: 1, fontSize: 12, color: 'gray', fontWeight: '400'}}>{''}
            {item.OfficeName}
          </Text>
        </View>
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

    <View style={{paddingVertical: 10}}>
      {[
        {
          label: 'Category',
          value: `${item.CategoryCode}\n${item.CategoryName}`,
        },
      ].map(({label, value}, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginVertical: 4,
          }}>
          <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>
            {label}
          </Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {value}
          </Text>
        </View>
      ))}
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

    <Text
      style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0754FC',
        marginBottom: 5,
      }}>
      Delivery
    </Text>
    {[
      {label: 'Date', value: item.DeliveryDate},
      {label: 'Address', value: item.Address},
      {label: 'Contact', value: item.ContactPerson},
      {label: '', value: item.ContactNumber},
    ].map(({label, value}, idx) => (
      <View
        key={idx}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4,
        }}>
        <Text style={{flex: 0.3, fontSize: 14, color: '#555'}}>{label}</Text>
        <Text
          style={{
            flex: 0.7,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333',
          }}>
          {value}
        </Text>
      </View>
    ))}

    <TouchableOpacity
      style={{
        backgroundColor: '#007bff',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
      }}
      onPress={() => handleAssignInspector(item.Id, item.TrackingNumber)}>
      <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
        Assign
      </Text>
    </TouchableOpacity>
  </View>
);

  return (
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
              <Text style={styles.headerTitle}>Request</Text>
              <TouchableOpacity
                onPress={toggleSearchBar}
                style={styles.searchIcon}>
                <Icon name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ImageBackground>

      <View style={styles.dropdownContainer}>
        <Dropdown
          data={years}
          labelField="label"
          valueField="value"
          value={selectedYear}
          onChange={item => setSelectedYear(item.value)}
          style={[styles.dropdown, {width: selectedYear.length * 12 + 40}]} // Adjust width dynamically
          placeholder={selectedYear}
        />
      </View>
      {requestLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="rgb(80, 161, 247)" />
        </View>
      ) : filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          initialNumToRender={10}
          windowSize={5}
        />
      ) : (
        <Text
          style={{
            fontSize: 16,
            color: 'gray',
            textAlign: 'center',
            marginTop: 20,
          }}>
          No Results
        </Text>
      )}

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
              keyExtractor={(item, index) =>
                item?.TrackingNumber || index.toString()
              }
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

      <Modal visible={searchModalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '90%',
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                paddingStart: 10,
              }}
              placeholder="Search Tracking Number..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => setSearchModalVisible(false)}
              style={{
                marginLeft: 10,
                backgroundColor: '#f44336',
                padding: 8,
                borderRadius: 5,
              }}>
              <Icon name="close" size={24} color="#fff" />
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
  },
  assignButton: {
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
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchIcon: {
    marginRight: 10,
  },
  dropdownContainer: {
    marginTop: 10,
    marginStart: 20,
  },
  dropdown: {
    height: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});

export default RequestScreen;
