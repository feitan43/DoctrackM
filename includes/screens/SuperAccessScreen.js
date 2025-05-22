import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SuperAccessScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [accessResult, setAccessResult] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleEmployees = [
    {
      id: '1001',
      name: 'Juan Dela Cruz',
      office: 'Finance Department',
      position: 'Accountant',
      procurement: 1,
      payroll: 1,
      elogs: 1,
      fms: 0,
      registration: 1,
    },
    {
      id: '2002',
      name: 'Maria Santos',
      office: 'Human Resources',
      position: 'HR Manager',
      procurement: 0,
      payroll: 1,
      elogs: 1,
      fms: 0,
      registration: 1,
    },
    {
      id: '3003',
      name: 'Carlos Reyes',
      office: 'Operations',
      position: 'Logistics Supervisor',
      procurement: 1,
      payroll: 0,
      elogs: 1,
      fms: 1,
      registration: 0,
    },
  ];

  const systemsList = [
    {key: 'procurement', label: 'Procurement', icon: 'cart-outline'},
    {key: 'payroll', label: 'Payroll', icon: 'cash-outline'},
    {key: 'elogs', label: 'E-logs', icon: 'document-text-outline'},
    {key: 'fms', label: 'FMS', icon: 'car-outline'},
  ];

  const handleSearch = () => {
    if (!searchText.trim()) {
      Alert.alert('Empty Search', 'Please enter an employee ID or name');
      return;
    }
    Keyboard.dismiss();

    setIsLoading(true);
    setAccessResult(null);
    setSelectedEmployee(null);

    // Simulate API call
    setTimeout(() => {
      const found = sampleEmployees.find(
        emp =>
          emp.id.toLowerCase() === searchText.toLowerCase() ||
          emp.name.toLowerCase().includes(searchText.toLowerCase()),
      );

      if (found) {
        setAccessResult('Granted');
        setSelectedEmployee({...found});
      } else {
        setAccessResult('Denied');
      }

      setIsLoading(false);
    }, 800);
  };

  const toggleAccess = key => {
    if (!selectedEmployee) return;
    setSelectedEmployee(prev => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  const renderSystemItem = ({item}) => (
    <View style={[
      styles.systemItem,
      selectedEmployee[item.key] === 1 ? styles.systemItemActive : null
    ]}>
      <View style={styles.systemInfo}>
        <Icon 
          name={item.icon} 
          size={20} 
          color={selectedEmployee[item.key] === 1 ? '#4caf50' : '#666'} 
          style={styles.systemIcon}
        />
        <Text style={styles.systemText}>{item.label}</Text>
      </View>
      <Switch
        value={selectedEmployee[item.key] === 1}
        onValueChange={() => toggleAccess(item.key)}
        disabled={selectedEmployee.registration === 0}
        trackColor={{false: '#e0e0e0', true: '#81c784'}}
        thumbColor={selectedEmployee[item.key] === 1 ? '#fff' : '#f5f5f5'}
      />
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{paddingBottom: 30}}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBack}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#007bff" />
          <Text style={styles.goBackText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Icon name="glasses-outline" size={40} color="#007bff" />
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
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="search" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Search Employee</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      {accessResult && (
        <View style={styles.resultsSection}>
          <View style={[
            styles.resultHeader,
            accessResult === 'Granted' ? styles.grantedHeader : styles.deniedHeader
          ]}>
            <Icon 
              name={accessResult === 'Granted' ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={accessResult === 'Granted' ? '#4caf50' : '#f44336'} 
            />
            <Text style={styles.resultHeaderText}>
              Access {accessResult}
            </Text>
          </View>

          {accessResult === 'Granted' && selectedEmployee && (
            <>
              <View style={styles.employeeCard}>
                <View style={styles.employeeAvatar}>
                  <Icon name="person" size={36} color="#555" />
                </View>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{selectedEmployee.name}</Text>
                  <Text style={styles.employeeId}>ID: {selectedEmployee.id}</Text>
                  <Text style={styles.employeeDetail}>{selectedEmployee.position}</Text>
                  <Text style={styles.employeeDetail}>{selectedEmployee.office}</Text>
                  
                  <View style={[
                    styles.statusBadge,
                    selectedEmployee.registration ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {selectedEmployee.registration ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>System Access Controls</Text>
              
              <FlatList
                data={systemsList}
                keyExtractor={item => item.key}
                renderItem={renderSystemItem}
                scrollEnabled={false}
                contentContainerStyle={styles.systemsList}
                ListHeaderComponent={
                  <Text style={styles.systemsNote}>
                    {selectedEmployee.registration === 0 ? 
                      "Account is deactivated. Activate registration to modify access." : 
                      "Toggle switches to grant/revoke access"}
                  </Text>
                }
              />

              <TouchableOpacity 
                style={styles.saveButton}
                disabled={selectedEmployee.registration === 0}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </>
          )}

          {accessResult === 'Denied' && (
            <View style={styles.deniedContent}>
              <Icon name="warning-outline" size={40} color="#f44336" />
              <Text style={styles.deniedText}>Employee not found</Text>
              <Text style={styles.deniedSubtext}>
                No employee matching "{searchText}" was found in the system.
              </Text>
              <TouchableOpacity 
                style={styles.tryAgainButton}
                onPress={() => setSearchText('')}
              >
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default SuperAccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 25,
  paddingTop: 10,
  borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    color: '#007bff',
    fontWeight: '500',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  employeeDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: '#4caf50',
  },
  inactiveBadge: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  systemsList: {
    padding: 15,
  },
  systemsNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  systemItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemItemActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#c8e6c9',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemIcon: {
    marginRight: 12,
  },
  systemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deniedContent: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deniedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginTop: 15,
    marginBottom: 5,
  },
  deniedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tryAgainText: {
    color: '#fff',
    fontWeight: '500',
  },
});