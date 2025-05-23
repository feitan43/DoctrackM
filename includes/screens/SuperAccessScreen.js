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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Checkbox} from 'react-native-paper';
import {
  useUserSuperAccess,
  useUpdateUserSuperAccess,
} from '../hooks/usePersonal';
import {SafeAreaView} from 'react-native-safe-area-context';

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
    {key: 'RegistrationState', label: 'Overall System Access', icon: 'key-outline'},
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
        const processedEmployee = { ...rawEmployeeData };

        // Convert all relevant access fields from string "0"/"1" to number 0/1
        systemsList.forEach(system => {
          if (rawEmployeeData[system.key] !== undefined) {
            processedEmployee[system.key] = Number(rawEmployeeData[system.key]);
          }
        });
        
        // Also ensure EmployeeNumber is a string if that's how you expect to send it back
        // Or convert it to a number if your API expects number
        if (typeof processedEmployee.EmployeeNumber === 'number') {
            processedEmployee.EmployeeNumber = String(processedEmployee.EmployeeNumber);
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

    // Ensure current RegistrationState is treated as a number for logic
    const currentRegistrationState = Number(selectedEmployee.RegistrationState);

    if (key === 'RegistrationState') {
      if (currentRegistrationState === 1) {
        Alert.alert(
          'Confirm Deactivation',
          'Turning off Overall System Access will revoke all other system access for this employee. Do you want to proceed?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Proceed',
              onPress: () => {
                const updatedEmployee = {
                  ...selectedEmployee,
                  [key]: 0, // Set overall access to 0 (number)
                };
                // Deactivate all other systems if overall access is turned off
                systemsList.forEach(system => {
                  if (system.key !== 'RegistrationState') {
                    updatedEmployee[system.key] = 0; // Set other systems to 0 (number)
                  }
                });
                setSelectedEmployee(updatedEmployee);
              },
            },
          ],
        );
      } else {
        // If turning on overall access, simply set to 1
        setSelectedEmployee(prev => ({
          ...prev,
          [key]: 1, // Set to 1 (number)
        }));
      }
    } else {
      // For individual system toggling
      if (currentRegistrationState === 1) {
        // Only allow individual toggling if Overall System Access is enabled
        setSelectedEmployee(prev => ({
          ...prev,
          // Toggle between 0 and 1, ensuring prev[key] is treated as a number
          [key]: Number(prev[key]) === 1 ? 0 : 1,
        }));
      } else {
        Alert.alert(
          'Access Denied',
          'Overall System Access must be enabled to modify individual system permissions.',
        );
      }
    }
  };

  const handleUpdateAccess = async () => {
    if (!selectedEmployee) {
      Alert.alert('No Employee Selected', 'Please search for an employee first.');
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
              // Construct the data payload for the API
              const dataToUpdate = {
                EmployeeNumber: selectedEmployee.EmployeeNumber, // Assuming EmployeeNumber is already correct type (string or number)
                ...Object.fromEntries(
                  systemsList.map(system => [
                    system.key,
                    // Ensure the values sent are in the format your API expects (e.g., number 0/1 or string "0"/"1")
                    // Since we've processed them to numbers internally, send them as numbers.
                    // If your API specifically requires strings "0" or "1", change to String(selectedEmployee[system.key])
                    selectedEmployee[system.key],
                  ]),
                ),
              };
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
        // Comparison now works correctly because selectedEmployee[item.key] is a number
        selectedEmployee?.[item.key] === 1 ? styles.systemItemActive : null,
      ]}>
      <View style={styles.systemInfo}>
        <Icon
          name={item.icon}
          size={20}
          color={selectedEmployee?.[item.key] === 1 ? '#28a745' : '#666'}
          style={styles.systemIcon}
        />
        <Text style={styles.systemText}>{item.label}</Text>
      </View>
      <Checkbox
        // Comparison now works correctly because selectedEmployee[item.key] is a number
        status={selectedEmployee?.[item.key] === 1 ? 'checked' : 'unchecked'}
        onPress={() => toggleAccess(item.key)}
        disabled={
          // Disable individual system checkboxes if RegistrationState is 0 (inactive)
          item.key !== 'RegistrationState' && selectedEmployee?.RegistrationState === 0
        }
        color="#28a745"
        uncheckedColor="#999"
      />
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f0f2f5'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingBottom: 30}}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.goBack}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#007bff" />
            <Text style={styles.goBackText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Icon name="cog-outline" size={50} color="#007bff" />
            <Text style={styles.title}> BOSS LEVEL</Text>
          </View>
        </View>

        {/* Search Section */}
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

        {/* Employee Details & Access Management */}
        {selectedEmployee && (
          <View style={styles.resultsSection}>
            <View
              style={[
                styles.resultHeader,
                // Check RegistrationState as a number
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
                color={selectedEmployee.RegistrationState === 1 ? '#28a745' : '#dc3545'}
              />
              <Text style={styles.resultHeaderText}>
                {selectedEmployee.RegistrationState === 1
                  ? 'Access Granted'
                  : 'Access Denied'}
              </Text>
            </View>

            <View style={styles.employeeCard}>
              <View style={styles.employeeAvatar}>
                <Icon name="person" size={30} color="#666" />
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{selectedEmployee.Name}</Text>
                <Text style={styles.employeeId}>
                  ID: {selectedEmployee.EmployeeNumber}
                </Text>
                <Text style={styles.employeeDetail}>
                  Office: {selectedEmployee.Office}
                </Text>
                <Text style={styles.employeeDetail}>
                  Position: {selectedEmployee.Position}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    selectedEmployee.RegistrationState === 1
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}>
                  <Text style={styles.statusText}>
                    {selectedEmployee.RegistrationState === 1 ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.systemsListContainer}>
              <Text style={styles.systemsNote}>
                Toggle access for individual systems below. Overall System Access
                must be enabled to grant other permissions.
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

        {/* Not Found/Error State */}
        {/* Only show if a search was attempted, no employee was found, and not currently loading */}
        {searchAttempted && !selectedEmployee && !isPending && (
          <View style={styles.deniedContent}>
            <Icon name="warning-outline" size={40} color="#dc3545" />
            <Text style={styles.deniedText}>Employee not found</Text>
            <Text style={styles.deniedSubtext}>
              No employee matching "{searchText}" was found in the system. Please
              check the ID or name and try again.
            </Text>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => setSearchText('')}>
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
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 25,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Subtle border
    paddingBottom: 15,
  },
  goBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goBackText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#007bff', // Standard blue
    fontWeight: '500',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26, // Slightly larger title
    fontWeight: '700',
    color: '#333', // Darker text
    marginLeft: 10,
  },
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3}, // Increased shadow for more depth
    shadowOpacity: 0.15, // Slightly more opaque shadow
    shadowRadius: 6, // Larger shadow radius
    elevation: 4, // Android elevation
  },
  sectionTitle: {
    fontSize: 18, // Slightly larger section title
    fontWeight: '600',
    color: '#444',
    marginBottom: 18, // More space below title
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Lighter border color
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
    overflow: 'hidden', // Ensures inner content respects border radius
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
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  grantedHeader: {
    backgroundColor: '#e8f5e9', // Light green for granted
  },
  deniedHeader: {
    backgroundColor: '#ffebee', // Light red for denied
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
    alignItems: 'center', // Vertically align items
  },
  employeeAvatar: {
    width: 65, // Slightly larger avatar
    height: 65,
    borderRadius: 32.5, // Half of width/height for perfect circle
    backgroundColor: '#e9ecef', // Lighter grey background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18, // More space
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 20, // Larger name
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
    paddingHorizontal: 12, // Increased padding
    paddingVertical: 5,
    borderRadius: 15, // More rounded badge
    marginTop: 10,
  },
  activeBadge: {
    backgroundColor: '#28a745', // Darker green for active
  },
  inactiveBadge: {
    backgroundColor: '#dc3545', // Red for inactive
  },
  statusText: {
    color: '#fff',
    fontSize: 13, // Slightly larger text
    fontWeight: '700',
  },
  systemsListContainer: {
    padding: 15,
  },
  systemsNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
    lineHeight: 18, // Better readability for notes
  },
  systemItem: {
    backgroundColor: '#fdfdfd', // Almost white
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000', // Subtle shadow for each item
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  systemItemActive: {
    backgroundColor: '#e8f5e9', // Light green for active system
    borderColor: '#a3d9a3', // Matching green border
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow text to take available space
  },
  systemIcon: {
    marginRight: 15, // More space for icon
  },
  systemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16, // Increased padding
    margin: 20, // Consistent margin
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Slightly higher elevation for button
    flexDirection: 'row', // For loader
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17, // Larger text
    fontWeight: '600',
  },
  deniedContent: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // White background for the alert card
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 20, // Add margin to the card
  },
  deniedText: {
    fontSize: 19, // Slightly larger
    fontWeight: '700',
    color: '#dc3545', // Red color for warning
    marginTop: 15,
    marginBottom: 8,
  },
  deniedSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25, // More space
    lineHeight: 22,
  },
  tryAgainButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30, // More horizontal padding
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