import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Keyboard,
  ImageBackground,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Checkbox} from 'react-native-paper';
import {
  useUserSuperAccess,
  useUpdateUserSuperAccess,
} from '../hooks/usePersonal';
import {officeMap} from '../utils/officeMap';
//import {SafeAreaView} from 'react-native-safe-area-context';

const SuperAccessScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false); // To show "not found" only after a search

  const {mutateAsync: fetchAccess, isPending, error} = useUserSuperAccess();
  const {mutateAsync: updateUserAccess, isPending: isUpdatingAccess} =
    useUpdateUserSuperAccess();

  const systemsList = [
    {key: 'PROCUREMENT', label: 'Procurement', icon: 'cart-outline'},
    {key: 'OFFICEADMIN', label: 'Office Admin', icon: 'briefcase-outline'},
    {key: 'PAYROLL', label: 'Payroll', icon: 'cash-outline'},
    {key: 'ELOGS', label: 'E-logs', icon: 'document-text-outline'},
    {key: 'FMS', label: 'FMS', icon: 'car-outline'},
    {key: 'SURE', label: 'Supplier Registry', icon: 'people-outline'},
    {key: 'CAORECEIVER', label: 'CAO Receiver', icon: 'person-outline'},
    {key: 'CAOEVALUATOR', label: 'CAO Evaluator', icon: 'person-outline'},
    {key: 'CBORECEIVER', label: 'CBO Receiver', icon: 'person-outline'},
    // { // Removed Overall System Access
    //   key: 'RegistrationState',
    //   label: 'Overall System Access',
    //   icon: 'key-outline',
    // },
  ];

  const handleSearch = async () => {
    const trimmed = searchText.trim();
    Keyboard.dismiss();

    setSelectedEmployee(null); // Clear previous employee data
    setSearchAttempted(true); // Mark that a search has been initiated

    if (!trimmed) {
      Alert.alert('Empty Search', 'Please enter an employee ID or name.');
      setSearchAttempted(false); // Reset if search is empty/invalid
      return;
    }

    const isNumber = /^\d+$/.test(trimmed);

    if (isNumber && trimmed.length !== 6) {
      Alert.alert('Invalid Input', 'Employee ID must be 6 digits.');
      setSearchAttempted(false); // Reset if input is invalid
      return;
    }

    try {
      const data = await fetchAccess(trimmed);
      if (data && data.length > 0) {
        const rawEmployeeData = data[0];
        const processedEmployee = {...rawEmployeeData};

        const allPossibleKeys = [
          ...systemsList.map(s => s.key),
          'RegistrationState', // Keep processing it if it comes from API
        ];
        allPossibleKeys.forEach(key => {
          if (rawEmployeeData[key] !== undefined) {
            processedEmployee[key] = Number(rawEmployeeData[key]);
          }
        });

        if (typeof processedEmployee.EmployeeNumber === 'number') {
          processedEmployee.EmployeeNumber = String(
            processedEmployee.EmployeeNumber,
          );
        }

        setSelectedEmployee(processedEmployee);
      } else {
        setSelectedEmployee(null); // Explicitly set to null if no data found
      }
      console.log('Fetched user access:', data);
    } catch (err) {
      console.error('Error fetching user access:', err);
      Alert.alert(
        'Search Error',
        'Failed to fetch employee data. Please try again.',
      );
      setSelectedEmployee(null);
    }
  };

  const toggleAccess = key => {
    if (!selectedEmployee) return;

    // Simplified toggle logic: directly toggle the system's access state
    setSelectedEmployee(prev => ({
      ...prev,
      // Toggle between 0 and 1, ensuring prev[key] is treated as a number
      [key]: Number(prev[key]) === 1 ? 0 : 1,
    }));
  };

  const handleUpdateAccess = async () => {
    if (!selectedEmployee) {
      Alert.alert(
        'No Employee Selected',
        'Please search for an employee first.',
      );
      return;
    }

    Alert.alert(
      'Confirm Update',
      `Are you sure you want to update ${selectedEmployee.Name}'s access?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Update',
          onPress: async () => {
            try {
              const dataToUpdate = {
                EmployeeNumber: selectedEmployee.EmployeeNumber,
                ...Object.fromEntries(
                  systemsList.map(system => [
                    system.key,
                    selectedEmployee[system.key], // Assumes these are numbers (0/1)
                  ]),
                ),
              };
              // If your API still expects RegistrationState, you might need to add it back here explicitly.
              // For example, if it should always be 1 or based on some other logic:
              // dataToUpdate.RegistrationState = selectedEmployee.RegistrationState !== undefined ? selectedEmployee.RegistrationState : 1; // Example

              await updateUserAccess(dataToUpdate);
              Alert.alert('Success', 'Employee access updated successfully!');
            } catch (updateError) {
              console.error('Error updating user access:', updateError);
              Alert.alert('Error', 'Failed to update employee access.');
            }
          },
        },
      ],
    );
  };

  const renderSystemItem = ({item}) => (
    <View
      style={[
        styles.systemItem,
        selectedEmployee?.[item.key] === 1 ? styles.systemItemActive : null,
      ]}>
      <View style={styles.systemInfo}>
       {/*  <Icon
          name={item.icon}
          size={20}
          color={selectedEmployee?.[item.key] === 1 ? '#28a745' : '#666'}
          style={styles.systemIcon}
        /> */}
        <Text style={styles.systemText}>{item.label}</Text>
      </View>
      <Checkbox
        status={selectedEmployee?.[item.key] === 1 ? 'checked' : 'unchecked'}
        onPress={() => toggleAccess(item.key)}
        // Checkbox is no longer disabled based on RegistrationState
        color="#28a745"
        uncheckedColor="#999"
      />
    </View>
  );

  // Determine if any system access is granted for general status display
  // This is an assumption. If RegistrationState still comes from the API and should be used for display, adjust accordingly.
  const hasAnyAccess =
    selectedEmployee &&
    systemsList.some(system => selectedEmployee[system.key] === 1);
  const displayRegistrationState = selectedEmployee?.RegistrationState === 1; // Or use hasAnyAccess depending on desired behavior

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f0f2f5'}}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.headerBackground}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={styles.backButtonRipple}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>ADMIN</Text>
          <View style={{width: 40}} />
        </View>
      </ImageBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 30}}
        keyboardShouldPersistTaps="handled">
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Employee Lookup</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Employee ID or Name"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSearch}
            disabled={isPending}>
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon
                  name="search"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Search Employee</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {selectedEmployee && (
          <View style={styles.resultsSection}>
            {selectedEmployee.RegistrationState !== 1 && (
              <View
                style={[
                  styles.resultHeader,
                  selectedEmployee.RegistrationState === 1
                    ? styles.grantedHeader
                    : styles.deniedHeader,
                ]}>
                <Icon
                  name={
                    selectedEmployee.RegistrationState === 1
                      ? 'shield-checkmark-outline'
                      : 'close-circle-outline'
                  }
                  size={24}
                  color={
                    selectedEmployee.RegistrationState === 1
                      ? '#28a745'
                      : '#dc3545'
                  }
                />
                <Text style={styles.resultHeaderText}>
                  {selectedEmployee.RegistrationState === 1
                    ? 'User Active' // Changed text to be more generic
                    : 'User Inactive'}
                </Text>
              </View>
            )}

            <View style={styles.employeeCard}>
              <View style={styles.employeeAvatar}>
                <Icon name="person" size={30} color="#666" />
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{selectedEmployee.Name}</Text>
                <Text style={styles.employeeId}>
                  {selectedEmployee.EmployeeNumber}
                </Text>
                <Text style={styles.employeeDetail}>
                 {selectedEmployee.Office} - {officeMap[selectedEmployee.Office] ||
                    selectedEmployee.Office}
                </Text>

                {selectedEmployee.RegistrationState !== undefined && (
                  <View
                    style={[
                      styles.statusBadge,
                      selectedEmployee.RegistrationState === 1
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}>
                    <Text style={styles.statusText}>
                      {selectedEmployee.RegistrationState === 1
                        ? 'ACTIVE'
                        : 'INACTIVE'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.systemsListContainer}>
              <Text style={styles.systemsNote}>
                Toggle access for individual systems below.
              </Text>
              {systemsList.map(item => (
                <View key={item.key}>{renderSystemItem({item})}</View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateAccess}
              disabled={isUpdatingAccess}>
              {isUpdatingAccess ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {searchAttempted && !selectedEmployee && !isPending && (
          <View style={styles.deniedContent}>
            <Icon name="warning-outline" size={40} color="#dc3545" />
            <Text style={styles.deniedText}>Employee not found</Text>
            <Text style={styles.deniedSubtext}>
              No employee matching "{searchText}" was found in the system.
              Please check the ID or name and try again.
            </Text>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => {
                setSearchText('');
                setSearchAttempted(false); // Reset search attempted state
              }}>
              <Text style={styles.tryAgainText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SuperAccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Lighter grey background for the whole screen
    //paddingHorizontal: 20, // Keep padding on inner components for more control
  },
  headerBackground: {
    height: 80, // Adjust as needed, considering safe area
    paddingTop: 30, // This might need adjustment based on SafeAreaView handling on different devices
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4, // For Android shadow
    // backgroundColor: '#007bff', // Example: Set a solid background color if image is not preferred or for fallback
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonRipple: {
    color: 'rgba(255,255,255,0.2)', // Ripple color for Android
    borderless: true,
    radius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1, // Allows title to center properly between back button and placeholder
  },
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16, // Added horizontal margin
    marginTop: 20, // Added top margin
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 18,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16, // Added horizontal margin
    marginBottom: 20, // Added bottom margin
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  grantedHeader: {
    backgroundColor: '#e8f5e9',
  },
  deniedHeader: {
    backgroundColor: '#ffebee',
  },
  resultHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  employeeCard: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 15,
    color: '#666',
    marginBottom: 3,
  },
  employeeDetail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
  },
  activeBadge: {
    backgroundColor: '#28a745',
  },
  inactiveBadge: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  systemsListContainer: {
    paddingHorizontal: 20, // Matched padding with employeeCard
    paddingVertical: 15, // Added vertical padding
  },
  systemsNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  systemItem: {
    backgroundColor: '#fdfdfd',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  systemItemActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#a3d9a3',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemIcon: {
    marginRight: 15,
  },
  systemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007bff', // Primary button color
    paddingVertical: 16, // Standard padding
    borderRadius: 10, // Consistent border radius
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20, // Horizontal margin
    marginBottom: 20, // Bottom margin
    marginTop: 10, // Top margin to separate from list
    elevation: 3,
    flexDirection: 'row',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  deniedContent: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16, // Added horizontal margin
    marginTop: 20, // Added top margin
  },
  deniedText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#dc3545',
    marginTop: 15,
    marginBottom: 8,
  },
  deniedSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  tryAgainButton: {
    backgroundColor: '#007bff', // Consistent button styling
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  tryAgainText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
