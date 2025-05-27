import React, {useState, useCallback} from 'react';
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
  useSystemsList,
} from '../hooks/usePersonal';
import {officeMap} from '../utils/officeMap';

const EmployeeCard = ({employee, officeMap}) => (
  <View style={styles.employeeCard}>
    <View style={styles.employeeAvatar}>
      <Icon name="person" size={30} color="#666" />
    </View>
    <View style={styles.employeeInfo}>
      <Text style={styles.employeeName}>{employee.Name}</Text>
      <Text style={styles.employeeId}>{employee.EmployeeNumber}</Text>
      <Text style={styles.employeeDetail}>
        {employee.Office} - {officeMap[employee.Office] || employee.Office}
      </Text>
      {employee.RegistrationState !== undefined && (
        <View
          style={[
            styles.statusBadge,
            employee.RegistrationState === 1
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}>
          <Text style={styles.statusText}>
            {employee.RegistrationState === 1 ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const SystemAccessToggle = ({system, employeeAccess, onToggle, currentlyUpdatingSystemKey}) => {
  const isUpdating = currentlyUpdatingSystemKey === system.key; // Check if this specific system is updating

  return (
    <TouchableOpacity
      onPress={() => onToggle(system.key)}
      style={[
        styles.systemItem,
        employeeAccess === 1 ? styles.systemItemActive : null,
      ]}
      disabled={isUpdating} // Disable interaction while updating
      accessibilityLabel={`Toggle ${system.label} access`}>
      <View style={styles.systemInfo}>
      {/*   <Icon
          name={system.icon}
          size={20}
          color={employeeAccess === 1 ? '#28a745' : '#666'}
          style={styles.systemIcon}
        /> */}
        <Text style={styles.systemText}>{system.label}</Text>
      </View>
      {isUpdating ? ( // Show spinner only for the updating system
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Checkbox
          status={employeeAccess === 1 ? 'checked' : 'unchecked'}
          // onPress handled by parent TouchableOpacity
          color="#28a745"
          uncheckedColor="#999"
        />
      )}
    </TouchableOpacity>
  );
};


const SuperAccessScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [currentlyUpdatingSystemKey, setCurrentlyUpdatingSystemKey] = useState(null); // New state for granular loading

  const {mutateAsync: fetchAccess, isPending, error} = useUserSuperAccess();
  const {mutateAsync: updateUserAccess} = useUpdateUserSuperAccess();
  const { data: dynamicSystemsList, isLoading: loadingSystems, error: systemsError } = useSystemsList();
  console.log(dynamicSystemsList)

  const handleSearch = useCallback(async () => {
    const trimmed = searchText.trim();
    Keyboard.dismiss();

    setSelectedEmployee(null);
    setSearchAttempted(true);

    if (!trimmed) {
      Alert.alert('Empty Search', 'Please enter an employee ID or name.');
      setSearchAttempted(false);
      return;
    }

    const isNumber = /^\d+$/.test(trimmed);

    if (isNumber && trimmed.length !== 6) {
      Alert.alert('Invalid Input', 'Employee ID must be 6 digits.');
      setSearchAttempted(false);
      return;
    }

    try {
      const data = await fetchAccess(trimmed);
      if (data && data.length > 0) {
        const rawEmployeeData = data[0];
        const processedEmployee = {...rawEmployeeData};

        dynamicSystemsList.forEach(s => {
          if (rawEmployeeData[s.key] !== undefined) {
            processedEmployee[s.key] = Number(rawEmployeeData[s.key]);
          }
        });
        if (rawEmployeeData.RegistrationState !== undefined) {
          processedEmployee.RegistrationState = Number(
            rawEmployeeData.RegistrationState,
          );
        }

        if (typeof processedEmployee.EmployeeNumber === 'number') {
          processedEmployee.EmployeeNumber = String(
            processedEmployee.EmployeeNumber,
          );
        }

        setSelectedEmployee(processedEmployee);
      } else {
        setSelectedEmployee(null);
      }
    } catch (err) {
      console.error('Error fetching user access:', err);
      Alert.alert(
        'Search Error',
        'Failed to fetch employee data. Please try again.',
      );
      setSelectedEmployee(null);
    }
  }, [searchText, fetchAccess, dynamicSystemsList]);

  const toggleAccess = useCallback(
    async key => {
      if (!selectedEmployee) {
        Alert.alert('Error', 'No employee selected to update access.');
        return;
      }

      const currentAccessValue = Number(selectedEmployee[key]);
      const newAccessValue = currentAccessValue === 1 ? 0 : 1;

      const originalAccessValue = selectedEmployee[key];

      // Optimistic UI update
      setSelectedEmployee(prev => {
        const updated = {
          ...prev,
          [key]: newAccessValue,
        };
        return updated;
      });

      setCurrentlyUpdatingSystemKey(key); // Set the key of the system being updated

      const employeeNumber = selectedEmployee.EmployeeNumber;
      const system = key;
      const access = newAccessValue;

      try {
        await updateUserAccess({employeeNumber, system, access});
        // You might want a toast message here: Toast.show({ type: 'success', text1: 'Access Updated!', text2: `${system} access changed.` });
      } catch (updateError) {
        console.error('Error updating user access:', updateError);
        Alert.alert('Update Error', `Failed to update access for ${key}.`);
        // Revert UI on error
        setSelectedEmployee(prev => ({
          ...prev,
          [key]: originalAccessValue,
        }));
      } finally {
        setCurrentlyUpdatingSystemKey(null); // Clear the updating key
      }
    },
    [selectedEmployee, updateUserAccess],
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f0f2f5'}}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.headerBackground}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={styles.backButtonRipple}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back">
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
            disabled={isPending}
            accessibilityLabel="Search Employee">
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
                    ? 'User Active'
                    : 'User Inactive'}
                </Text>
              </View>
            )}

            <EmployeeCard employee={selectedEmployee} officeMap={officeMap} />

            <View style={styles.systemsListContainer}>
              <Text style={styles.systemsNote}>
                Toggle access for individual systems below. Changes are saved automatically.
              </Text>
              {dynamicSystemsList.map(item => (
                <SystemAccessToggle
                  key={item.key}
                  system={item}
                  employeeAccess={selectedEmployee?.[item.key]}
                  onToggle={toggleAccess}
                  currentlyUpdatingSystemKey={currentlyUpdatingSystemKey} // Pass the new state
                />
              ))}
            </View>

            {/* Removed the 'Save' button as access is auto-saved */}
            {/* <TouchableOpacity
              style={styles.saveButton}
              onPress={() => Alert.alert('Info', 'Access is updated automatically on toggle.')}>
              <Text style={styles.saveButtonText}>Access is Auto-Saved</Text>
            </TouchableOpacity> */}
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
                setSearchAttempted(false);
              }}
              accessibilityLabel="Clear search and try again">
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
    backgroundColor: '#f0f2f5',
  },
  headerBackground: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
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
    color: 'rgba(255,255,255,0.2)',
    borderless: true,
    radius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
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
    marginHorizontal: 16,
    marginBottom: 20,
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
  // Added for potential stacked office details
  employeeSubDetail: {
    fontSize: 13,
    color: '#777',
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
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
    marginHorizontal: 16,
    marginTop: 20,
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
    backgroundColor: '#007bff',
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