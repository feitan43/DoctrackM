import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform,
  Switch,
  StatusBar,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useUserAccess,
  useUpdateUserAccess,
  useSystemsListAO,
} from '../hooks/usePersonal';
import {showMessage} from 'react-native-flash-message';
import {useQueryClient} from '@tanstack/react-query';

import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const AccessScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSystemFilterBottomSheet, setShowSystemFilterBottomSheet] =
    useState(false);

  const {
    data,
    error,
    isLoading: userLoading,
    isFetching: userFetching,
  } = useUserAccess();
  const {
    data: systems,
    isLoading: loadingSystems,
    isFetching: systemsFetching,
  } = useSystemsListAO();
  const {mutateAsync: updateUserAccess, isPending: isUpdatingAccess} =
    useUpdateUserAccess();
  const [updatingSystemKey, setUpdatingSystemKey] = useState(null);

  const queryClient = useQueryClient();

  // Ref and snap points for the user access bottom sheet
  const userAccessBottomSheetRef = useRef(null);
  const userAccessSnapPoints = useMemo(() => ['25%', '50%', '95%'], []);

  // Ref and snap points for the system filter bottom sheet
  const systemFilterBottomSheetRef = useRef(null);
  const systemFilterSnapPoints = useMemo(() => ['30%', '50%', '95%'], []); // Adjust as needed

  // Handlers for user access bottom sheet
  const handlePresentUserAccessModalPress = useCallback(() => {
    userAccessBottomSheetRef.current?.expand();
  }, []);
  const handleCloseUserAccessModalPress = useCallback(() => {
    userAccessBottomSheetRef.current?.close();
  }, []);

  // Handlers for system filter bottom sheet
  const handlePresentSystemFilterModalPress = useCallback(() => {
    systemFilterBottomSheetRef.current?.expand();
    setShowSystemFilterBottomSheet(true);
  }, []);
  const handleCloseSystemFilterModalPress = useCallback(() => {
    systemFilterBottomSheetRef.current?.close();
    setShowSystemFilterBottomSheet(false);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      handlePresentUserAccessModalPress();
    } else {
      handleCloseUserAccessModalPress();
    }
    setUpdatingSystemKey(null);
  }, [
    selectedUser,
    handlePresentUserAccessModalPress,
    handleCloseUserAccessModalPress,
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (Array.isArray(data) && systems) {
      const transformedUsers = data.map(user => {
        const getAccess = key => (user[key] === '1' ? 'access' : 'no-access');

        const dynamicAccess = systems.reduce((acc, system) => {
          acc[system.key] = getAccess(system.key);
          return acc;
        }, {});

        return {
          id: user.Id,
          name: user.Name,
          employeeNumber: user.EmployeeNumber,
          isActive: user.RegistrationState === '1',
          access: dynamicAccess,
        };
      });

      setUsers(transformedUsers);
    }
  }, [data, systems]);

  useEffect(() => {
    if (systems) {
      filterUsers();
    }
  }, [debouncedSearchQuery, selectedSystems, users, systems]);

  const filterUsers = useCallback(() => {
    let result = [...users];

    if (debouncedSearchQuery) {
      result = result.filter(
        user =>
          (user.employeeNumber &&
            user.employeeNumber
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())) ||
          (user.name &&
            user.name
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())),
      );
    }

    if (selectedSystems.length > 0) {
      result = result.filter(user =>
        selectedSystems.every(sys => user.access[sys] === 'access'),
      );
    }

    setFilteredUsers(result);
  }, [users, debouncedSearchQuery, selectedSystems]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['getUserAccess']);
      await queryClient.invalidateQueries(['systemsListAO']);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const {activeCount, inactiveCount, overallCount} = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let overall = filteredUsers.length;

    filteredUsers.forEach(user => {
      if (user.isActive) {
        active++;
      } else {
        inactive++;
      }
    });

    return {
      activeCount: active,
      inactiveCount: inactive,
      overallCount: overall,
    };
  }, [filteredUsers]);

  const toggleSystemFilter = systemKey => {
    setSelectedSystems(prev =>
      prev.includes(systemKey)
        ? prev.filter(sys => sys !== systemKey)
        : [...prev, systemKey],
    );
  };

  const toggleAccess = async (user, systemKey) => {
    if (isUpdatingAccess || updatingSystemKey !== null) {
      showMessage({
        message: 'Please wait',
        description: 'An update is already in progress.',
        type: 'info',
        icon: 'info',
        backgroundColor: '#FFA000',
        color: '#FFFFFF',
        floating: true,
        duration: 2000,
      });
      return;
    }

    setUpdatingSystemKey(systemKey);

    const originalUsers = [...users];
    const originalSelectedUser = {...selectedUser};

    let newStateForUser = null;
    let newAccessValue = null;

    if (systemKey === 'RegistrationState') {
      newStateForUser = user.isActive ? '0' : '1';

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
      setSelectedUser(prev => ({
        ...prev,
        isActive: newStateForUser === '1',
      }));
    } else {
      const currentAccess = user.access[systemKey];
      newAccessValue = currentAccess === 'access' ? 'no-access' : 'access';

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
        access:
          newStateForUser !== null
            ? newStateForUser
            : newAccessValue === 'access'
            ? '1'
            : '0',
      });

      if (result.success) {
        showMessage({
          message: 'Update Successful',
          description: `User ${
            systemKey === 'RegistrationState' ? 'account status' : 'access'
          } updated successfully.`,
          type: 'success',
          icon: 'success',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });
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

      setUsers(originalUsers);
      setSelectedUser(originalSelectedUser);
    } finally {
      setUpdatingSystemKey(null);
    }
  };

  const CustomCheckboxIcon = ({value}) => {
    return (
      <Icon
        name={value ? 'checkbox-outline' : 'square-outline'}
        size={26}
        color={value ? '#4CAF50' : '#888'}
      />
    );
  };

  const renderAccessChip = useCallback(
    (user, system) => {
      if (!systems) return null;

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
    },
    [systems],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => {
          setSelectedUser(item);
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
                style={
                  item.isActive
                    ? styles.activeStatusText
                    : styles.inactiveStatusText
                }>
                {item.isActive ? 'Active' : 'Deactivated'}
              </Text>
            </Text>
            <View style={styles.chipsContainer}>
              {systems &&
                systems
                  .filter(system => item.access[system.key] === 'access')
                  .map(system => renderAccessChip(item, system))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsColumn}
            onPress={() => {
              setSelectedUser(item);
            }}>
            <Icon name="settings-outline" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [renderAccessChip, systems],
  );

  const renderListFooter = () => {
    if ((userLoading || loadingSystems) && filteredUsers.length === 0) {
      return (
        <View style={styles.listLoadingContainer}>
          <ActivityIndicator size="large" color="#1a508c" />
          <Text style={styles.loadingText}>Fetching users...</Text>
        </View>
      );
    }
    if (
      !userLoading &&
      !loadingSystems &&
      (userFetching || systemsFetching) &&
      filteredUsers.length > 0
    ) {
      return (
        <View style={styles.listLoadingContainer}>
          <ActivityIndicator size="small" color="#1a508c" />
          <Text style={styles.loadingText}>Updating...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}
          imageStyle={styles.bgHeaderImageStyle}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
              <Text style={{color: '#fff', fontSize: 16, fontWeight: 'normal'}}>
                Access
              </Text>
            </TouchableOpacity>
            <View style={{width: 60}} />
          </View>
        </ImageBackground>

        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            <Icon
              name="search-outline"
              size={25}
              color={styles.searchIcon.color}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search EmployeeNumber or Name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              autoCapitalize="characters"
              onChangeText={setSearchQuery}
              accessibilityHint="Type to search for inventory items by tracking number."
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
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
          {/* New Filter Icon Button */}
          <TouchableOpacity
            onPress={handlePresentSystemFilterModalPress}
            style={styles.filterIconButton}>
            <Icon name="filter" size={24} color="#1a508c" />
          </TouchableOpacity>
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

        {selectedSystems.length > 0 && (
          <View style={styles.activeFiltersWrapper}>
            <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersChipsContainer}>
              {selectedSystems.map(systemKey => {
                const system = systems?.find(s => s.key === systemKey);
                return (
                  <View key={systemKey} style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>
                      {system?.label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleSystemFilter(systemKey)}
                      hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
                      <Icon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !userLoading && !loadingSystems && filteredUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
               {/*  <Icon name="person-remove-outline" size={60} color="#999" /> */}
                  <Image
                              source={require('../../assets/images/noresultsstate.png')}
                              style={{
                                width: 200,
                                height: 200,
                                resizeMode: 'contain',
                                marginBottom: 10,
                              }}
                            />

                <Text style={styles.emptyTitle}>No Users Found</Text>

                {selectedSystems.length > 0 ? (
                  <>
                    <Text style={styles.emptySubtext}>
                      No users have access to **all** of the currently selected
                      systems.
                    </Text>
                    <Text style={styles.emptyHint}>
                      Try adjusting your system filters to find users.
                    </Text>
                  </>
                ) : (
                  <Text style={styles.emptySubtext}>
                    There are no users to display based on your current attempted search.
                  </Text>
                )}

                <TouchableOpacity style={styles.clearFiltersButton}>
                  <Text style={styles.clearFiltersButtonText}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListFooterComponent={renderListFooter}
        />

        {/* User Access Bottom Sheet */}
        {selectedUser && (
          <BottomSheet
            ref={userAccessBottomSheetRef}
            index={1}
            snapPoints={userAccessSnapPoints}
            enablePanDownToClose={true}
            onClose={() => setSelectedUser(null)}
            backdropComponent={({style}) => (
              <TouchableOpacity
                style={[style, styles.backdrop]}
                onPress={handleCloseUserAccessModalPress}
              />
            )}>
            <BottomSheetView style={styles.bottomSheetContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Access</Text>
                <TouchableOpacity
                  onPress={() => setSelectedUser(null)}
                  style={styles.modalCloseButton}>
                  <Icon name="close-circle-outline" size={28} color="#999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                {selectedUser?.name} ({selectedUser?.employeeNumber})
              </Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Account Status</Text>
                {systems &&
                  systems
                    .filter(system => system.key === 'RegistrationState')
                    .map(system => {
                      const isAccountActive = selectedUser?.isActive;

                      return (
                        <TouchableOpacity
                          key={system.key}
                          style={styles.modalSystemRow}
                          onPress={() =>
                            toggleAccess(selectedUser, system.key)
                          }>
                          <Text style={styles.modalSystemLabel}>
                            {system.label}
                          </Text>
                          <CustomCheckboxIcon value={isAccountActive} />
                        </TouchableOpacity>
                      );
                    })}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>System Access</Text>
                <ScrollView
                  style={styles.modalSystemAccessScrollView}
                  showsVerticalScrollIndicator={false}>
                  {systems &&
                    systems
                      .filter(system => system.key !== 'RegistrationState')
                      .map(system => {
                        const hasAccess =
                          selectedUser?.access[system.key] === 'access';
                        const isThisRowUpdating =
                          isUpdatingAccess && updatingSystemKey === system.key;

                        return (
                          <TouchableOpacity
                            key={system.key}
                            style={styles.modalSystemRow}
                            onPress={() =>
                              toggleAccess(selectedUser, system.key)
                            }
                            disabled={isThisRowUpdating}>
                            <Text style={styles.modalSystemLabel}>
                              {system.label}
                            </Text>
                            {isThisRowUpdating ? (
                              <ActivityIndicator size="small" color="#1a508c" />
                            ) : (
                              <CustomCheckboxIcon value={hasAccess} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                </ScrollView>
              </View>
            </BottomSheetView>
          </BottomSheet>
        )}

        {/* System Filter Bottom Sheet */}
        {showSystemFilterBottomSheet && (
          <BottomSheet
            ref={systemFilterBottomSheetRef}
            index={0} // Start at 0 to show the first snap point
            snapPoints={systemFilterSnapPoints}
            enablePanDownToClose={true}
            onClose={handleCloseSystemFilterModalPress}
            backdropComponent={({style}) => (
              <TouchableOpacity
                style={[style, styles.backdrop]}
                onPress={handleCloseSystemFilterModalPress}
              />
            )}>
            <BottomSheetView style={styles.bottomSheetContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter</Text>
                <TouchableOpacity
                  onPress={handleCloseSystemFilterModalPress}
                  style={styles.modalCloseButton}>
                  <Icon name="close-circle-outline" size={28} color="#999" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.systemFiltersScrollView}
                showsVerticalScrollIndicator={false}>
                {systems &&
                  systems.map(system => (
                    <TouchableOpacity
                      key={system.key}
                      style={[
                        styles.systemFilterButtonBottomSheet,
                        selectedSystems.includes(system.key) &&
                          styles.systemFilterButtonSelectedBottomSheet,
                      ]}
                      onPress={() => toggleSystemFilter(system.key)}>
                      <Text
                        style={[
                          styles.systemFilterButtonTextBottomSheet,
                          selectedSystems.includes(system.key) &&
                            styles.systemFilterButtonTextSelectedBottomSheet,
                        ]}>
                        {system.label}
                      </Text>
                      <CustomCheckboxIcon
                        value={selectedSystems.includes(system.key)}
                      />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </BottomSheetView>
          </BottomSheet>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    padding: 12, // Adjust padding to make the icon visible and clickable
    justifyContent: 'center',
    alignItems: 'center',
    height: 55, // Match height of search input
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userFullName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  userStatus: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
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
    overflow: 'hidden',
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
    padding: 20,
    backgroundColor: '#f9f9f9', // Light background for the empty state
    borderRadius: 8,
    margin: 20, // Add some margin around the container
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#777',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a508c',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalRegistrationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalSystemRow: {
    elevation: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalSystemLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
  modalToggleButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modalToggleButtonEnabled: {
    backgroundColor: '#D32F2F',
  },
  modalToggleButtonDisabled: {
    backgroundColor: '#388E3C',
  },
  modalToggleButtonRevoke: {
    backgroundColor: '#F44336',
  },
  modalToggleButtonGrant: {
    backgroundColor: '#4CAF50',
  },
  modalToggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  // Removed filterContainer, filterToggleButton, filterToggleButtonText, showSystemFilters as they are replaced by BottomSheet
  activeFiltersWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 15, // Added padding to align with search bar
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeFiltersLabel: {
    marginRight: 10,
    color: '#666',
    fontSize: 14,
  },
  activeFiltersChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexGrow: 1, // Allow chips to grow and take available space
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a508c',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4, // Adjust for spacing when wrapping
    marginTop: 4,
  },
  activeFilterChipText: {
    color: '#fff',
    marginRight: 5,
    fontSize: 13,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  systemFiltersScrollView: {
    flex: 1, // Ensure the scroll view takes up available space
  },
  systemFilterButtonBottomSheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8, // Space between buttons
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  systemFilterButtonSelectedBottomSheet: {
    backgroundColor: '#E3F2FD', // Light blue background for selected
    borderColor: '#2196F3', // Blue border for selected
  },
  systemFilterButtonTextBottomSheet: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  systemFilterButtonTextSelectedBottomSheet: {
    color: '#2196F3', // Blue text for selected
  },
});

export default AccessScreen;
