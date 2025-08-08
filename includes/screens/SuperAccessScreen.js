import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
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
  StatusBar,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Checkbox} from 'react-native-paper';
import {
  useUserSuperAccess,
  useUpdateUserSuperAccess,
  useSystemsList,
  useUpdateUserInfo,
} from '../hooks/usePersonal';
import {officeMap} from '../utils/officeMap';

// Import BottomSheet and its components
import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// Transform officeMap into an array suitable for selection
const officeOptions = Object.keys(officeMap).map(key => ({
  label: officeMap[key],
  value: key,
}));

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

const SystemAccessToggle = ({
  system,
  employeeAccess,
  onToggle,
  currentlyUpdatingSystemKey,
}) => {
  const isUpdating = currentlyUpdatingSystemKey === system.key;

  return (
    <TouchableOpacity
      onPress={() => onToggle(system.key)}
      style={[
        styles.systemItem,
        employeeAccess === 1 ? styles.systemItemActive : null,
      ]}
      disabled={isUpdating}
      accessibilityLabel={`Toggle ${system.label} access`}>
      <View style={styles.systemInfo}>
        <Text style={styles.systemText}>{system.label}</Text>
      </View>
      {isUpdating ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Checkbox
          status={employeeAccess === 1 ? 'checked' : 'unchecked'}
          color="#28a745"
          uncheckedColor="#999"
        />
      )}
    </TouchableOpacity>
  );
};

const SuperAccessScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('501573');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [currentlyUpdatingSystemKey, setCurrentlyUpdatingSystemKey] =
    useState(null);

  // States for editable fields
  const [editingAccountType, setEditingAccountType] = useState('');
  const [editingPermission, setEditingPermission] = useState('');
  const [editingPrivilege, setEditingPrivilege] = useState('');

  const [editingFMS, setEditingFMS] = useState('');

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);

  const [selectedOffice, setSelectedOffice] = useState(''); // Holds the office CODE (e.g., "1081")

  // BottomSheet State and Ref
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []); // Define snap points for the bottom sheet
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false); // New state to control visibility

  // State for office search within BottomSheet
  const [officeSearchText, setOfficeSearchText] = useState('');

  // Hooks for data fetching and mutation
  const {
    mutateAsync: fetchAccess,
    isPending: isSearching,
    error: searchError,
  } = useUserSuperAccess();

  const {mutateAsync: updateUserAccess} = useUpdateUserSuperAccess();
  const {mutateAsync: updateUserInfo, isLoading: isUpdatingUserInfo} =
    useUpdateUserInfo();

  const {
    data: dynamicSystemsList,
    isLoading: loadingSystems,
    error: systemsError,
  } = useSystemsList();

  // Open Bottom Sheet handler
  const handleOpenBottomSheet = useCallback(() => {
    Keyboard.dismiss(); // Dismiss keyboard when opening bottom sheet
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand(); // Expands to the largest snap point
  }, []);

  // Close Bottom Sheet handler
  const handleCloseBottomSheet = useCallback(() => {
    setIsBottomSheetVisible(false);
    bottomSheetRef.current?.close();
    setOfficeSearchText(''); // Clear search text when closing
  }, []);

  // Handle sheet changes (e.g., when swiped down)
  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      setIsBottomSheetVisible(false);
      setOfficeSearchText('');
    }
  }, []);

  const handleSearch = useCallback(async () => {
    const trimmed = searchText.trim();
    Keyboard.dismiss();

    setSelectedEmployee(null);
    setSearchAttempted(true);
    setIsEditingMode(false);
    setCurrentlyUpdatingSystemKey(null);

    if (!trimmed) {
      Alert.alert('Empty Search', 'Please enter an employee ID or name.');
      setSearchAttempted(false);
      return;
    }

    const isNumber = /^\d+$/.test(trimmed);

    if (isNumber) {
      if (trimmed.length !== 6) {
        Alert.alert('Invalid Input', 'Employee ID must be 6 digits.');
        setSearchAttempted(false);
        return;
      }
    } else {
      const isValidName = /^[a-zA-Z0-9ñÑ\s]+$/.test(trimmed);
      if (!isValidName) {
        Alert.alert(
          'Invalid Characters',
          "Only alphanumeric characters, spaces, and 'ñ' are allowed for names.",
        );
        setSearchAttempted(false);
        return;
      }
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
        setSelectedOffice(processedEmployee.Office || '');
        setEditingAccountType(processedEmployee.AccountType || '');
        setEditingPermission(processedEmployee.Permission ?? '');
        setEditingPrivilege(processedEmployee.Privilege ?? '');
        setEditingFMS(processedEmployee.FMS || '');
      } else {
        setSelectedEmployee(null);
        setSelectedOffice('');
        setEditingAccountType('');
        setEditingPermission('');
        setEditingPrivilege('');
        setEditingFMS('');
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

      setSelectedEmployee(prev => {
        const updated = {
          ...prev,
          [key]: newAccessValue,
        };
        return updated;
      });

      setCurrentlyUpdatingSystemKey(key);

      const employeeNumber = selectedEmployee.EmployeeNumber;
      const system = key;
      const access = newAccessValue;

      try {
        await updateUserAccess({employeeNumber, system, access});
      } catch (updateError) {
        console.error('Error updating user access:', updateError);
        Alert.alert('Update Error', `Failed to update access for ${key}.`);
        setSelectedEmployee(prev => ({
          ...prev,
          [key]: originalAccessValue,
        }));
      } finally {
        setCurrentlyUpdatingSystemKey(null);
      }
    },
    [selectedEmployee, updateUserAccess],
  );

  const handleSaveChanges = useCallback(async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'No employee selected to update.');
      return;
    }

    const normalize = val => (val ?? '').toString().trim();

    const currentOffice = selectedEmployee.Office;
    const currentAccountType = selectedEmployee.AccountType;
    const currentPermission = selectedEmployee.Permission;
    const currentPrivilege = selectedEmployee.Privilege;
    const currentFMS = selectedEmployee.FMS;

    if (
      selectedOffice === currentOffice &&
      editingAccountType === currentAccountType &&
      normalize(editingPermission) === normalize(currentPermission) &&
      normalize(editingPrivilege) === normalize(currentPrivilege) &&
      normalize(currentFMS) === normalize(currentFMS)
    ) {
      Alert.alert('No Changes', 'Employee details are already up to date.');
      setIsEditingMode(false);
      return;
    }

    const employeeNumber = selectedEmployee.EmployeeNumber;
    const updatePayload = {
      employeeNumber,
      Office: selectedOffice,
      AccountType: editingAccountType,
      Permission:
        normalize(editingPermission) === '' ? null : editingPermission,
      Privilege: normalize(editingPrivilege) === '' ? null : editingPrivilege,
      FMS: normalize(editingFMS) === '' ? null : editingFMS,
    };

    try {
      await updateUserInfo(updatePayload);
      setSelectedEmployee(prev => ({
        ...prev,
        Office: selectedOffice,
        AccountType: editingAccountType,
        Permission: editingPermission,
        Privilege: editingPrivilege,
        FMS: editingFMS,
      }));
      setIsEditingMode(false);
      Alert.alert('Success', 'Employee details updated successfully!');
    } catch (error) {
      console.error('Error updating employee details:', error);
      Alert.alert(
        'Update Error',
        'Failed to update employee details. Please try again.',
      );
    }
  }, [
    selectedEmployee,
    selectedOffice,
    editingAccountType,
    editingPermission,
    editingPrivilege,
    editingFMS,
    updateUserInfo,
    setIsEditingMode,
    setSelectedEmployee,
  ]);

  const filteredOfficeOptions = officeOptions.filter(
    option =>
      option.label.toLowerCase().includes(officeSearchText.toLowerCase()) ||
      option.value.toLowerCase().includes(officeSearchText.toLowerCase()),
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: '#f0f2f5'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#f0f2f5'}}>
          <ImageBackground
            source={require('../../assets/images/CirclesBG.png')}
            style={styles.bgHeader}
            imageStyle={styles.bgHeaderImageStyle}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}>
                <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
                <Text
                  style={{color: '#fff', fontSize: 16, fontWeight: 'normal'}}>
                  Boss Level
                </Text>
              </TouchableOpacity>
              <View style={{width: 60}} />
            </View>
          </ImageBackground>

          <View style={styles.searchFilterRow}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search EmployeeNumber or Name..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                autoCapitalize="words"
                onChangeText={setSearchText}
                accessibilityHint="Type to search for employee by ID or name."
                onSubmitEditing={handleSearch}
                editable={!isSearching}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearSearchButton}
                  accessibilityLabel="Clear search query">
                  <Icon
                    name="close-circle"
                    size={20}
                    color={styles.searchIcon.color}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.filterIconButton}
              disabled={isSearching}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="search" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={{paddingBottom: 30}}
            keyboardShouldPersistTaps="handled">
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

                <EmployeeCard
                  employee={selectedEmployee}
                  officeMap={officeMap}
                />

                <View style={styles.employeeDetailsContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditingMode(prev => !prev)}>
                    {isEditingMode ? (
                      <Text style={styles.editButtonText}>Cancel Edit</Text>
                    ) : (
                      <>
                        <View style={{flexDirection: 'row'}}>
                          <Icon name="pencil" size={20} color="#fff" />
                          <Text style={{color: '#fff', marginLeft: 5}}>
                            Edit
                          </Text>
                        </View>
                      </>
                    )}
                  </TouchableOpacity>

                  {isEditingMode ? (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Office</Text>
                        <TouchableOpacity
                          style={styles.selectableInput}
                          onPress={handleOpenBottomSheet}>
                          <Text style={styles.selectableInputText}>
                            {officeMap[selectedOffice] || 'Select Office'}
                          </Text>
                          <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Type </Text>
                        <TextInput
                          style={styles.editableInput}
                          value={editingAccountType}
                          onChangeText={setEditingAccountType}
                          autoCapitalize="words"
                          inputMode="numeric"
                        />
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Privilege </Text>
                        <TextInput
                          style={styles.editableInput}
                          value={editingPrivilege}
                          onChangeText={setEditingPrivilege}
                          autoCapitalize="words"
                          inputMode="numeric"
                        />
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Permission </Text>
                        <TextInput
                          style={styles.editableInput}
                          value={editingPermission}
                          onChangeText={setEditingPermission}
                          autoCapitalize="words"
                          inputMode="numeric"
                        />
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>FMS </Text>
                        <TextInput
                          style={styles.editableInput}
                          value={editingFMS.toString()}
                          onChangeText={setEditingFMS}
                          autoCapitalize="words"
                          inputMode="numeric"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.saveChangesButton}
                        onPress={handleSaveChanges}
                        disabled={isUpdatingDetails}>
                        {isUpdatingUserInfo ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.saveChangesButtonText}>
                            Save Changes
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Office </Text>
                        <Text style={styles.detailValue}>
                          {officeMap[selectedEmployee.Office] || '—'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Type </Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.AccountType || '—'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Privilege </Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.Privilege || '—'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Permission </Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.Permission || '—'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>FMS </Text>
                        <Text style={styles.detailValue}>
                          {selectedEmployee.FMS || '—'}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.systemsListContainer}>
                  <Text style={styles.systemsNote}>
                    Toggle access for individual systems below. Changes are
                    saved automatically.
                  </Text>
                  {loadingSystems ? (
                    <ActivityIndicator size="large" color="#007bff" />
                  ) : systemsError ? (
                    <Text style={styles.errorText}>
                      Error loading systems: {systemsError.message}
                    </Text>
                  ) : (
                    dynamicSystemsList.map(item => (
                      <SystemAccessToggle
                        key={item.key}
                        system={item}
                        employeeAccess={selectedEmployee?.[item.key]}
                        onToggle={toggleAccess}
                        currentlyUpdatingSystemKey={currentlyUpdatingSystemKey}
                      />
                    ))
                  )}
                </View>
              </View>
            )}

            {searchAttempted && !selectedEmployee && !isSearching && (
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
      </KeyboardAvoidingView>

      {/* Gorhom BottomSheet for Office Selection */}
      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1} // Start at the second snap point (50%)
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true} // Allow swiping down to close
          backdropComponent={({style}) => (
            <TouchableOpacity
              activeOpacity={1}
              style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]} // Overlay background
              onPress={handleCloseBottomSheet} // Dismiss on backdrop press
            />
          )}
          // Optional: Add container style if needed for specific spacing
          // containerStyle={{ paddingHorizontal: 10 }}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Select Office</Text>
              <TouchableOpacity onPress={handleCloseBottomSheet}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.bottomSheetSearchInput}
              placeholder="Search office by name or code..."
              placeholderTextColor="#9CA3AF"
              value={officeSearchText}
              onChangeText={setOfficeSearchText}
              autoCapitalize="words"
            />
            <ScrollView
              style={styles.bottomSheetScrollView}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent:
                  filteredOfficeOptions.length === 0 ? 'center' : 'flex-start',
                paddingBottom: 20,
              }}
              keyboardShouldPersistTaps="handled">
              {filteredOfficeOptions.length > 0 ? (
                filteredOfficeOptions.map((item, index) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.bottomSheetItem}
                    onPress={() => {
                      setSelectedOffice(item.value);
                      handleCloseBottomSheet();
                    }}>
                    <Text style={styles.bottomSheetItemText}>
                      {item.label} ({item.value})
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>No offices found.</Text>
              )}
            </ScrollView>
          </View>
        </BottomSheet>
      )}
    </GestureHandlerRootView>
  );
};

export default SuperAccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 130,
    backgroundColor: '#1a508c',
    paddingHorizontal: 20,
  },
  bgHeaderImageStyle: {
    opacity: 0.8,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 15,
    marginTop: -40,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 10,
    height: 55,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 5,
    color: '#6C757D',
    padding: 5,
  },
  searchInput: {
    flex: 1,
    height: 55,
    fontSize: 15,
    color: '#343A40',
  },
  clearSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterIconButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    width: 70,
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
  employeeDetailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#444',
    width: '30%',
    minWidth: 90,
  },
  detailValue: {
    color: '#000',
    flex: 1,
    marginStart: 20,
  },
  // New styles for editing
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editableInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    height: 40,
  },
  selectableInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
    height: 40,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectableInputText: {
    fontSize: 15,
    color: '#333',
  },
  saveChangesButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveChangesButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },

  // Gorhom Bottom Sheet Styles
  bottomSheetContent: {
    flex: 1, // Ensures content takes up available space
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 15,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomSheetSearchInput: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  bottomSheetScrollView: {
    flexGrow: 1,
  },
  bottomSheetItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetItemText: {
    fontSize: 17,
    color: '#333',
  },
  noResultsText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#666',
    fontSize: 16,
  },
});