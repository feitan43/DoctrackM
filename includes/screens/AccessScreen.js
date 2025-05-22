import React, {useState, useEffect} from 'react';
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

  const {data, error, loading: userLoading} = useUserAccess();
  const {mutateAsync: updateUserAccess} = useUpdateUserAccess();
  const queryClient = useQueryClient();

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
      setFilteredUsers(transformedUsers);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedSystems, users]);

  const filterUsers = () => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        user =>
          (user.employeeNumber &&
            user.employeeNumber
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (user.name &&
            user.name.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Apply system filter
    if (selectedSystems.length > 0) {
      result = result.filter(user =>
        selectedSystems.every(sys => user.access[sys] === 'access'),
      );
    }

    setFilteredUsers(result);
  };

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

  const countUsersByStatus = (users = []) => {
    let activeCount = 0;
    let inactiveCount = 0;
    let overallCount = users.length;

    users.forEach(user => {
      if (user.RegistrationState === '1') {
        activeCount++;
      } else if (user.RegistrationState === '0') {
        inactiveCount++;
      }
    });

    return {activeCount, inactiveCount, overallCount};
  };

  const {activeCount, inactiveCount, overallCount} = countUsersByStatus(data);

  const toggleSystemFilter = systemKey => {
    setSelectedSystems(prev =>
      prev.includes(systemKey)
        ? prev.filter(sys => sys !== systemKey)
        : [...prev, systemKey],
    );
  };

  const toggleAccess = async (user, systemKey) => {
    const currentAccess = user.access[systemKey];

    if (systemKey === 'RegistrationState') {
      const newState = user.isActive ? '0' : '1';

      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            isActive: newState === '1',
          };
        }
        return u;
      });

      setUsers(updatedUsers);

      try {
        const result = await updateUserAccess({
          employeeNumber: user.employeeNumber,
          system: systemKey,
          access: newState,
        });

        if (result.success) {
          showMessage({
            message: 'Update Successful',
            description: 'User account status updated successfully.',
            type: 'success',
            icon: 'success',
            backgroundColor: '#2E7D32',
            color: '#FFFFFF',
            floating: true,
            duration: 3000,
          });
          setEditModalVisible(false);
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } catch (error) {
        showMessage({
          message: 'Update Failed',
          description:
            error.message || 'There was an issue updating user status.',
          type: 'danger',
          icon: 'danger',
          backgroundColor: '#C62828',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });

        const revertedUsers = users.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              isActive: !user.isActive,
            };
          }
          return u;
        });
        setUsers(revertedUsers);
      }
      return;
    }

    const newAccess = currentAccess === 'access' ? 'no-access' : 'access';

    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          access: {
            ...u.access,
            [systemKey]: newAccess,
          },
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    try {
      const result = await updateUserAccess({
        employeeNumber: user.employeeNumber,
        system: systemKey,
        access: newAccess === 'access' ? '1' : '0',
      });

      if (result.success) {
        showMessage({
          message: 'Update Successful',
          description: 'User access updated successfully.',
          type: 'success',
          icon: 'success',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });
        setEditModalVisible(false);
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

      const revertedUsers = users.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            access: {
              ...u.access,
              [systemKey]: currentAccess,
            },
          };
        }
        return u;
      });
      setUsers(revertedUsers);
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
        {/*  <Icon
          name={hasAccess ? 'checkmark' : 'close'}
          size={14}
          color="#fff"
          style={styles.chipIcon}
        /> */}
      </TouchableOpacity>
    );
  };

  const renderItem = ({item, index}) => (
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
              style={item.isActive ? styles.activeIcon : styles.inactiveIcon}>
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
  );

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
              style={styles.backButton}>
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
          onChangeText={setSearchQuery}
          numberOfLines={1}
        />
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

      {/* System Filters */}
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
                      onPress={() => toggleSystemFilter(systemKey)}>
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
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Access</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUser?.name} ({selectedUser?.employeeNumber})
            </Text>

            <View style={styles.modalRegistrationContainer}>
              <Text style={styles.modalSystemLabel}>Account</Text>
              {/*  <Text>{selectedUser?.isActive ? 'Active' : 'Inactive'}</Text> */}
              <TouchableOpacity
                style={[
                  styles.modalToggleButton,
                  selectedUser?.isActive
                    ? styles.modalToggleButtonEnabled
                    : styles.modalToggleButtonDisabled,
                ]}
                onPress={() => toggleAccess(selectedUser, 'RegistrationState')}>
                <Text style={styles.modalToggleButtonText}>
                  {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSystemsContainer}>
              {systems.map(system => {
                const hasAccess = selectedUser?.access[system.key] === 'access';
                return (
                  <View key={system.key} style={styles.modalSystemRow}>
                    <Text style={styles.modalSystemLabel}>{system.label}</Text>
                    <TouchableOpacity
                      style={[
                        styles.modalToggleButton,
                        hasAccess
                          ? styles.modalToggleButtonEnabled
                          : styles.modalToggleButtonDisabled,
                      ]}
                      onPress={() => toggleAccess(selectedUser, system.key)}>
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
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.doneButtonText}>Cancel</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  searchIcon: {marginRight: 10, width: 30},
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
    //alignItems: 'center',
    paddingVertical:5,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userFullName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
  },
  userStatus: {
    fontSize: 14,
    color: '#555',
  },
  settingsColumn: {
    padding: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  modalSystemsContainer: {
    marginVertical: 10,
  },
  modalSystemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalSystemLabel: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  modalToggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  modalToggleButtonEnabled: {
    backgroundColor: '#F44336',
  },
  modalToggleButtonDisabled: {
    backgroundColor: '#4CAF50',
  },
  modalToggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    marginTop: 20,
  },
  doneButton: {
    padding: 12,
    backgroundColor: '#1a508c',
    borderRadius: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeIcon: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactiveIcon: {
    //color: '#F44336',
    color: '#E57373',
    fontWeight: 'bold',
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
    //backgroundColor: '#F44336',
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
  editButton: {
    backgroundColor: '#1a508c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
