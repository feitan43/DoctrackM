import React, {useState, useEffect, useCallback, useMemo} from 'react'; // Add useCallback, useMemo
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  // Add these for debounce
  Platform, // For iOS specific shadow
  // AccessibilityInfo, // For screen reader announcements if needed
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useUserAccess, useUpdateUserAccess} from '../hooks/usePersonal';
import {showMessage} from 'react-native-flash-message';
import {useQueryClient} from '@tanstack/react-query';

const systems = [
  {key: 'PROCUREMENT', label: 'Procurement'},
  {key: 'PAYROLL', label: 'Payroll'},
  {key: 'ELOGS', label: 'E-logs'},
  {key: 'FMS', label: 'FMS'},
  /* {key: 'GSOINVENTORY', label: 'GSO Inventory'},
  {key: 'GSOINSPECTION', label: 'GSO Inspection'},
  {key: 'BACATTACHMENT', label: 'BAC Attachment'}, */
];

const AccessScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [showSystemFilters, setShowSystemFilters] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // New state for debounced search

  const {data, error, loading: userLoading} = useUserAccess();
  const {mutateAsync: updateUserAccess} = useUpdateUserAccess();
  const queryClient = useQueryClient();

  // Debounce effect for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const transformedUsers = data.map(user => {
        const getAccess = key => (user[key] === '1' ? 'access' : 'no-access');
        return {
          id: user.Id,
          name: user.Name,
          employeeNumber: user.EmployeeNumber,
          isActive: user.RegistrationState === '1',
          access: {
            PROCUREMENT: getAccess('PROCUREMENT'),
            PAYROLL: getAccess('PAYROLL'),
            ELOGS: getAccess('ELOGS'),
            FMS: getAccess('FMS'),
            GSOINVENTORY: getAccess('GSOINVENTORY'),
            GSOINSPECTION: getAccess('GSOINSPECTION'),
            BACATTACHMENT: getAccess('BACATTACHMENT'),
          },
        };
      });

      setUsers(transformedUsers);
      // setFilteredUsers(transformedUsers); // This will be handled by the filterUsers useEffect
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    filterUsers();
  }, [debouncedSearchQuery, selectedSystems, users]); // Use debouncedSearchQuery here

  const filterUsers = useCallback(() => { // Wrap with useCallback
    let result = [...users];

    // Apply search filter
    if (debouncedSearchQuery) { // Use debounced search query
      result = result.filter(
        user =>
          (user.employeeNumber &&
            user.employeeNumber
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())) ||
          (user.name &&
            user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())),
      );
    }

    // Apply system filter
    if (selectedSystems.length > 0) {
      result = result.filter(user =>
        selectedSystems.every(sys => user.access[sys] === 'access'),
      );
    }

    setFilteredUsers(result);
  }, [users, debouncedSearchQuery, selectedSystems]); // Dependencies for useCallback

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['getUserAccess']);
    } catch (error) {
      console.error('Failed to refresh getUserAccess:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Count based on filteredUsers now
  const {activeCount, inactiveCount, overallCount} = useMemo(() => { // Wrap with useMemo
    let active = 0;
    let inactive = 0;
    let overall = filteredUsers.length; // Count from filteredUsers

    filteredUsers.forEach(user => {
      if (user.isActive) { // Use isActive from transformed data
        active++;
      } else {
        inactive++;
      }
    });

    return {activeCount: active, inactiveCount: inactive, overallCount: overall};
  }, [filteredUsers]);


  const toggleSystemFilter = systemKey => {
    setSelectedSystems(prev =>
      prev.includes(systemKey)
        ? prev.filter(sys => sys !== systemKey)
        : [...prev, systemKey],
    );
  };

  const toggleAccess = async (user, systemKey) => {
    // Optimistic UI updates
    const originalUsers = [...users]; // Store original for rollback
    const originalSelectedUser = {...selectedUser}; // Store original selected user for modal rollback

    let newStateForUser = null;
    let newAccessValue = null;

    if (systemKey === 'RegistrationState') {
      newStateForUser = user.isActive ? '0' : '1';

      // Update local state immediately
      setUsers(prevUsers =>
        prevUsers.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              isActive: newStateForUser === '1',
            };
          }
          return u;
        }),
      );
      // Update selectedUser for modal
      setSelectedUser(prev => ({
        ...prev,
        isActive: newStateForUser === '1',
      }));

    } else {
      const currentAccess = user.access[systemKey];
      newAccessValue = currentAccess === 'access' ? 'no-access' : 'access';

      // Update local state immediately
      setUsers(prevUsers =>
        prevUsers.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              access: {
                ...u.access,
                [systemKey]: newAccessValue,
              },
            };
          }
          return u;
        }),
      );
      // Update selectedUser for modal
      setSelectedUser(prev => ({
        ...prev,
        access: {
          ...prev.access,
          [systemKey]: newAccessValue,
        },
      }));
    }

    try {
      const result = await updateUserAccess({
        employeeNumber: user.employeeNumber,
        system: systemKey,
        access: newStateForUser !== null ? newStateForUser : (newAccessValue === 'access' ? '1' : '0'),
      });

      if (result.success) {
        showMessage({
          message: 'Update Successful',
          description: `User ${systemKey === 'RegistrationState' ? 'account status' : 'access'} updated successfully.`,
          type: 'success',
          icon: 'success',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });
        // No need to close modal immediately unless desired,
        // as the UI is already updated.
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      showMessage({
        message: 'Update Failed',
        description:
          error.message || 'There was an issue updating user access.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#C62828',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });

      // Rollback UI on error
      setUsers(originalUsers);
      setSelectedUser(originalSelectedUser); // Rollback selected user for modal
    }
  };

  const renderAccessChip = (user, system) => {
    const hasAccess = user.access[system.key] === 'access';
    return (
      <TouchableOpacity
        key={system.key}
        style={[
          styles.chip,
          hasAccess ? styles.chipEnabled : styles.chipDisabled,
        ]}
        disabled={true}>
        <Text style={styles.chipText}>{system.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(({item, index}) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        setSelectedUser(item);
        setEditModalVisible(true);
      }}>
      <View style={styles.rowContainer}>
        <View style={styles.indexColumn}>
          <Text style={styles.userIndex}>{index + 1}</Text>
        </View>

        <View style={styles.centerColumn}>
          <Text style={styles.userName}>{item.employeeNumber}</Text>
          <Text style={styles.userFullName}>{item.name}</Text>

          <Text style={styles.userStatus}>
            {'Status: '}
            <Text
              style={item.isActive ? styles.activeStatusText : styles.inactiveStatusText}>
              {item.isActive ? 'Active' : 'Deactivated'}
            </Text>
          </Text>
          <View style={styles.chipsContainer}>
            {systems
              .filter(system => item.access[system.key] === 'access')
              .map(system => renderAccessChip(item, system))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsColumn}
          onPress={() => {
            setSelectedUser(item);
            setEditModalVisible(true);
          }}>
          <Icon name="settings-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [renderAccessChip]); 


  if (loading || userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a508c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Added hitSlop
              >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Access</Text>
            <TouchableOpacity style={styles.searchIcon}>
              {/* <Icon name="ellipsis-vertical" size={20} color="#fff" /> */}
            </TouchableOpacity>
          </>
        </View>
      </ImageBackground>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or employee number..."
          value={searchQuery}
          onChangeText={setSearchQuery} // Update immediate searchQuery state
          numberOfLines={1}
        />
        {searchQuery.length > 0 && ( 
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchButton}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
            <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={styles.activeLegend}></View>
          <Text style={styles.legendText}>Active: {activeCount}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.inactiveLegend}></View>
          <Text style={styles.legendText}>Deactivated: {inactiveCount}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.overallLegend}></View>
          <Text style={styles.legendText}>Overall: {overallCount}</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowSystemFilters(!showSystemFilters)}>
          <Text style={styles.filterToggleButtonText}>
            {showSystemFilters ? 'Hide System Filters' : 'Filter by System'}
          </Text>
          <Icon
            name={showSystemFilters ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#1a508c"
          />
        </TouchableOpacity>

        {showSystemFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.systemFiltersContainer}>
            {systems.map(system => (
              <TouchableOpacity
                key={system.key}
                style={[
                  styles.systemFilterButton,
                  selectedSystems.includes(system.key) &&
                    styles.systemFilterButtonSelected,
                ]}
                onPress={() => toggleSystemFilter(system.key)}>
                <Text
                  style={[
                    styles.systemFilterButtonText,
                    selectedSystems.includes(system.key) &&
                      styles.systemFilterButtonTextSelected,
                  ]}>
                  {system.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedSystems.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersText}>Active filters:</Text>
            <View style={styles.activeFiltersChips}>
              {selectedSystems.map(systemKey => {
                const system = systems.find(s => s.key === systemKey);
                return (
                  <View key={systemKey} style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>
                      {system?.label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleSystemFilter(systemKey)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                      <Icon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="person-remove-outline" size={50} color="#ccc" /> 
            <Text style={styles.emptyText}>No users found</Text>
            {selectedSystems.length > 0 && (
              <Text style={styles.emptySubtext}>
                No users have access to all selected systems
              </Text>
            )}
          </View>
        }
      />

      <Modal
  animationType="slide"
  transparent={true}
  visible={editModalVisible}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Modal Header with Close Button */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Edit Access</Text>
        <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseButton}>
          <Icon name="close-circle-outline" size={28} color="#999" />
        </TouchableOpacity>
      </View>

      <Text style={styles.modalSubtitle}>
        {selectedUser?.name} ({selectedUser?.employeeNumber})
      </Text>

      {/* Account Status Section */}
      <View style={styles.modalSection}>
        <Text style={styles.modalSectionTitle}>Account Status</Text>
        <View style={styles.modalRegistrationContainer}>
          <Text style={styles.modalSystemLabel}>User Account</Text>
          <TouchableOpacity
            style={[
              styles.modalToggleButton,
              selectedUser?.isActive
                ? styles.modalToggleButtonEnabled
                : styles.modalToggleButtonDisabled,
            ]}
            onPress={() => toggleAccess(selectedUser, 'RegistrationState')}
          >
            <Text style={styles.modalToggleButtonText}>
              {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Access Section */}
      <View style={styles.modalSection}>
        <Text style={styles.modalSectionTitle}>System Access</Text>
        {systems.map(system => {
          const hasAccess = selectedUser?.access[system.key] === 'access';
          return (
            <View key={system.key} style={styles.modalSystemRow}>
              <Text style={styles.modalSystemLabel}>{system.label}</Text>
              <TouchableOpacity
                style={[
                  styles.modalToggleButton,
                  hasAccess
                    ? styles.modalToggleButtonRevoke // Use a specific style for revoke
                    : styles.modalToggleButtonGrant, // Use a specific style for grant
                ]}
                onPress={() => toggleAccess(selectedUser, system.key)}
              >
                <Text style={styles.modalToggleButtonText}>
                  {hasAccess ? 'Revoke' : 'Grant'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setEditModalVisible(false)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
    // iOS Shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure space-between for correct centering
    flex: 1, // Allow header to take full width
  },
  headerTitle: {
    flex: 1, // Take available space for centering
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  searchIcon: {marginRight: 10, width: 30}, // Keep for potential future use or if you add other icons
  backButton: {padding: 8, borderRadius: 20},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: { // New style for clear button
    padding: 5,
    marginLeft: 10,
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    //alignItems: 'center', // Aligned to center vertically for better appearance
    paddingVertical: 5,
    marginBottom: 8,
  },
  indexColumn: {
    width: 30,
    alignItems: 'center',
  },
  userIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  centerColumn: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18, // Slightly larger
    fontWeight: 'bold',
    color: '#333',
  },
  userFullName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666', // Slightly subdued
  },
  userStatus: {
    fontSize: 14,
    color: '#555',
    marginTop: 4, // Added small margin
  },
  // Renamed for clarity, original activeIcon/inactiveIcon used for `countUsersByStatus`
  activeStatusText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactiveStatusText: {
    color: '#E57373',
    fontWeight: 'bold',
  },
  settingsColumn: {
    padding: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    maxHeight: 50, // Limit height, consider scrollable if many
    overflow: 'hidden', // Hide overflow
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  chipEnabled: {
    backgroundColor: '#4CAF50',
  },
  chipDisabled: {
    backgroundColor: '#F44336',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  chipIcon: {
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10, // Added margin for icon
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center', // Center text
  },
    modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker overlay
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12, // More rounded corners
    padding: 20,
    maxHeight: '85%', // Slightly more height
    elevation: 10, // Stronger shadow for Android
    shadowColor: '#000', // Stronger shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalHeader: { // New style for header with close button
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22, // Slightly larger title
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allow title to take space
    textAlign: 'center', // Center the title
  },
  modalCloseButton: { // New style for close button
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#777', // Slightly lighter color for subtitle
    marginBottom: 20,
    borderBottomWidth: 1, // Separator line
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  modalSection: { // New style for grouping sections
    marginBottom: 20,
  },
  modalSectionTitle: { // New style for section titles
    fontSize: 18,
    fontWeight: '600',
    color: '#1a508c', // Primary app color for section titles
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalRegistrationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduced padding
    // Removed borderBottomWidth and borderBottomColor as section title handles it
  },
  modalSystemsContainer: {
    // Removed marginVertical as modalSection handles spacing
  },
  modalSystemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Lighter separator for individual rows
  },
  modalSystemLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1, // Allow label to grow
  },
  modalToggleButton: {
    paddingHorizontal: 18, // Slightly more horizontal padding
    paddingVertical: 8,   // Slightly more vertical padding
    borderRadius: 20,     // More rounded buttons
    minWidth: 90,         // Ensure consistent width
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
    marginLeft: 10, // Space from label
  },
  modalToggleButtonEnabled: { // For 'Deactivate' (account status)
    backgroundColor: '#D32F2F', // A stronger red for deactivation
  },
  modalToggleButtonDisabled: { // For 'Activate' (account status)
    backgroundColor: '#388E3C', // A stronger green for activation
  },
  modalToggleButtonRevoke: { // For 'Revoke' (system access)
    backgroundColor: '#F44336', // Original red for revoke
  },
  modalToggleButtonGrant: { // For 'Grant' (system access)
    backgroundColor: '#4CAF50', // Original green for grant
  },
  modalToggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600', // Slightly bolder text
  },
  modalButtons: {
    marginTop: 30, // More space before the done button
    // Align button to center
    alignItems: 'center',
  },
  doneButton: {
    paddingVertical: 14, // Taller button
    paddingHorizontal: 30, // Wider button
    backgroundColor: '#1a508c',
    borderRadius: 8, // More rounded
    width: '80%', // Make button take more width
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16, // Larger text
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeLegend: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  inactiveLegend: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E57373',
    marginRight: 5,
  },
  overallLegend: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  filterToggleButtonText: {
    color: '#1a508c',
    fontWeight: 'bold',
  },
  systemFiltersContainer: {
    paddingVertical: 10,
  },
  systemFilterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a508c',
    marginRight: 10,
    marginBottom: 10,
  },
  systemFilterButtonSelected: {
    backgroundColor: '#1a508c',
  },
  systemFilterButtonText: {
    color: '#1a508c',
  },
  systemFilterButtonTextSelected: {
    color: '#fff',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  activeFiltersText: {
    marginRight: 10,
    color: '#666',
  },
  activeFiltersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a508c',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  activeFilterChipText: {
    color: '#fff',
    marginRight: 5,
  },
});

export default AccessScreen;