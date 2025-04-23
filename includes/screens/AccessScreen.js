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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUserAccess, useUpdateUserAccess } from '../hooks/usePersonal';
import {showMessage} from 'react-native-flash-message';

// Define the systems we want to show in the access control
const systems = [
  { key: 'PROCUREMENT', label: 'Procurement' },
  { key: 'PAYROLL', label: 'Payroll' },
  { key: 'ELOGS', label: 'E-logs' },
  { key: 'FMS', label: 'FMS' },
  /* { key: 'GSOINVENTORY', label: 'GSO Inventory' },
  { key: 'GSOINSPECTION', label: 'GSO Inspection' },
  { key: 'BACATTACHMENT', label: 'BAC Attachment' }, */
];

const AccessScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState('');
  
  const {data, error, loading: userLoading} = useUserAccess();
  const { mutateAsync : updateUserAccess } = useUpdateUserAccess();

  useEffect(() => {
    if (data) {
      // Transform the API data into our required format
      const transformedUsers = data.map(user => ({
        id: user.Id,
        name: user.Name,
        employeeNumber: user.EmployeeNumber,
        isActive: user.LoginState === "1",
        access: {
          PROCUREMENT: user.PROCUREMENT === "1" ? "access" : "no-access",
          PAYROLL: user.PAYROLL === "1" ? "access" : "no-access",
          ELOGS: user.ELOGS === "1" ? "access" : "no-access",
          FMS: user.FMS === "1" ? "access" : "no-access",
          GSOINVENTORY: user.GSOINVENTORY === "1" ? "access" : "no-access",
          GSOINSPECTION: user.GSOINSPECTION === "1" ? "access" : "no-access",
          BACATTACHMENT: user.BACATTACHMENT === "1" ? "access" : "no-access",
        }
      }));
      
      setUsers(transformedUsers);
      setLoading(false);
    }
  }, [data]);

  const handleFiltersPress = () => {
    alert('Filters button pressed');
  };

  const handleRoleChange = (user, systemKey) => {
    setSelectedUser(user);
    setSelectedSystem(systemKey);
    setModalVisible(true);
  };

  const saveRoleChange = async (newAccess) => {
    if (!selectedUser || !selectedSystem) return;
  
    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          access: {
            ...u.access,
            [selectedSystem]: newAccess,
          },
        };
      }
      return u;
    });
  
    setUsers(updatedUsers);
    setModalVisible(false);
  
    try {
      console.log(
        selectedUser.employeeNumber,
        selectedSystem,
        newAccess === "access" ? "1" : "0"
      );
  
      const result = await updateUserAccess({
        employeeNumber: selectedUser.employeeNumber,
        system: selectedSystem,
        access: newAccess === "access" ? "1" : "0",
      });
  
      console.log("res", result);
  
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
  
        console.log('User access updated successfully');
      } else {
        throw new Error(result.message || 'Update failed');
      }
  
    } catch (error) {
      console.error('Error updating user access:', error);
  
      showMessage({
        message: 'Update Failed',
        description: error.message || 'There was an issue updating user access.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#C62828',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
    }
  };
  
  
  const filteredUsers = users.filter(user =>
    user.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSystemAccess = (user, system) => {
    const hasAccess = user.access[system.key] === 'access';
    return (
      <TouchableOpacity
        key={system.key}
        style={[
          styles.systemAccessButton,
          hasAccess ? styles.accessButton : styles.noAccessButton,
        ]}
        onPress={() => handleRoleChange(user, system.key)}>
        <Text style={styles.systemAccessText}>
          {hasAccess ? 'Access' : 'No Access'}
        </Text>
        <Icon 
          name={hasAccess ? 'checkmark-circle' : 'close-circle'} 
          size={16} 
          color="#fff" 
          style={styles.accessIcon} 
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{/* Employee # */}{item.employeeNumber}</Text>
        <Text style={styles.userFullName}>{item.name}</Text>
        <Text style={styles.userStatus}>
          {'Status: '}
          <Text style={item.isActive ? styles.activeIcon : styles.inactiveIcon}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </Text>
      
        <View style={styles.systemsContainer}>
          {systems.map(system => (
            <View key={system.key} style={styles.systemRow}>
              <Text style={styles.systemLabel}>{system.label}:</Text>
              {renderSystemAccess(item, system)}
            </View>
          ))}
        </View>
      </View>
    </View>
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
            <TouchableOpacity
              onPress={handleFiltersPress}
              style={styles.searchIcon}>
              <Icon name="ellipsis-vertical" size={20} color="#fff" />
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
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* Role Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Change {systems.find(s => s.key === selectedSystem)?.label || selectedSystem} Access
            </Text>
            <Text style={styles.modalSubtitle}>
              for {selectedUser?.name} {/* (#{selectedUser?.employeeNumber}) */}
            </Text>
            
            <View style={styles.roleOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedUser?.access[selectedSystem] === 'access' && styles.selectedRoleOption,
                  styles.accessOption,
                ]}
                onPress={() => saveRoleChange('access')}>
                <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.roleOptionText}>Grant Access</Text>
                {selectedUser?.access[selectedSystem] === 'access' && (
                  <Icon name="checkmark" size={24} color="#1a508c" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedUser?.access[selectedSystem] === 'no-access' && styles.selectedRoleOption,
                  styles.noAccessOption,
                ]}
                onPress={() => saveRoleChange('no-access')}>
                <Icon name="close-circle" size={24} color="#F44336" />
                <Text style={styles.roleOptionText}>Revoke Access</Text>
                {selectedUser?.access[selectedSystem] === 'no-access' && (
                  <Icon name="checkmark" size={24} color="#1a508c" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
  searchIcon: {marginRight: 10},
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
    height: 40,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userFullName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  userStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  systemsContainer: {
    marginTop: 10,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemLabel: {
    width: 120,
    fontSize: 14,
    color: '#555',
  },
  systemAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 100,
  },
  systemAccessText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  accessButton: {
    backgroundColor: '#4CAF50',
  },
  noAccessButton: {
    backgroundColor: '#F44336',
  },
  accessIcon: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  roleOptionsContainer: {
    marginVertical: 15,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedRoleOption: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#1a508c',
  },
  accessOption: {
    backgroundColor: '#E8F5E9',
  },
  noAccessOption: {
    backgroundColor: '#FFEBEE',
  },
  roleOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  modalButtons: {
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeIcon: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactiveIcon: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default AccessScreen;