import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ImageBackground,
  Image,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DeviceInfo from 'react-native-device-info';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const version = DeviceInfo.getVersion();

const SettingsScreen = ({fullName, employeeNumber, officeName, navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  const handleProfile = async () => {
    if (navigation) {
      navigation.navigate('Profile');
    }
  };

  const handleNotifications = async () => {
    if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  const handleContactUs = async () => {
    if (navigation) {
      navigation.navigate('ContactUs');
    }
  };

  const logout = async () => {
    setModalVisible(false); // Close confirmation modal
    setProgressModalVisible(true); // Show progress modal

    try {
      const storedToken = await AsyncStorage.getItem('token');

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({EmployeeNumber: employeeNumber}),
      };

      const response = await fetch(`${BASE_URL}/logoutApi`, requestOptions);

      if (!response.ok) {
        throw new Error(
          `Logout request failed with status: ${response.status}`,
        );
      }

      await AsyncStorage.removeItem('token');
      navigation.replace('Login'); 

      setProgressModalVisible(false);
    } catch (error) {
      console.error('Error while logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
      setProgressModalVisible(false); 
    }
  };

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.container}>
          {/*   <ImageBackground
          source={require('../../assets/images/docmobileBG.png')}
          style={{flex: 1, paddingTop: 30}}> */}
          {/* <View>
            <Text>Settings</Text>
          </View> */}
          {/*  <View
            style={{
              //backgroundColor: 'rgba(239, 239, 239, 1)',
              backgroundColor: 'white',
              margin: 20,
              borderWidth: 1,
              borderColor: 'silver',
              borderRadius: 5,
            }}>
            <Pressable
              onPress={handleProfile} // Add onPress to handle navigation
              style={({pressed}) => [
                {
                  flexDirection: 'row',
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
                  borderRadius: 10,
                },
              ]}
              android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
              <View style={{padding: 10}}>
                <Image
                  source={require('../../assets/images/doctracklogo.png')}
                  style={{height: 50, width: 40}}
                />
              </View>
              <View style={{flex: 1}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: '#333',
                    textTransform: 'capitalize',
                    fontFamily: 'Oswald-Regular',
                    fontSize: 18,
                    flexShrink: 1,
                  }}>
                  {fullName}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: '#333',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                    flexShrink: 1,
                  }}>
                  {officeName}
                </Text>
              </View>
            </Pressable>
          </View> */}

          <View style={{flex: 1, backgroundColor: 'rgba(232, 232, 232, 1)'}}>
            <View
              style={{
                backgroundColor: 'white',
                margin: 20,
                borderRadius: 10,
              }}>
              <Pressable
                onPress={handleProfile}
                style={({pressed}) => [
                  {
                    flexDirection: 'row',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    alignItems: 'center',
                    backgroundColor: pressed
                      ? 'rgba(0,0,0,0.05)'
                      : 'transparent',
                    borderRadius: 10,
                  },
                ]}
                android_ripple={{color: 'rgba(232, 232, 232, 1)'}}>
                <Icon
                  name="person-outline"
                  size={20}
                  padding={10}
                  color="gray"
                />
                <Text
                  style={{
                    flex: 1,
                    paddingStart: 10,
                    color: '#252525',
                    fontFamily: 'Inter_28pt-Regular',
                    fontSize: 14,
                  }}>
                  Profile
                </Text>
                <Icon
                  name="chevron-forward"
                  size={18}
                  padding={10}
                  color="rgba(123, 123, 123, 1)"
                />
              </Pressable>
              <View style={{height:1,backgroundColor:'#ccc', marginHorizontal:20}}/>
              <Pressable
                onPress={handleNotifications}
                style={({pressed}) => [
                  {
                    flexDirection: 'row',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    alignItems: 'center',
                    backgroundColor: pressed
                      ? 'rgba(0,0,0,0.05)'
                      : 'transparent',
                    borderRadius: 10,
                  },
                ]}
                android_ripple={{color: 'rgba(232, 232, 232, 1)'}}>
                <Icon
                  name="notifications-outline"
                  size={20}
                  padding={10}
                  color="gray"
                />
                <Text
                  style={{
                    flex: 1,
                    paddingStart: 10,
                    color: '#252525',
                    fontFamily: 'Inter_28pt-Regular',
                    fontSize: 14,
                  }}>
                  Notifications
                </Text>
                <Icon
                  name="chevron-forward"
                  size={20}
                  padding={10}
                  color="rgba(123, 123, 123, 1)"
                />
              </Pressable>

              <View style={{height:1,backgroundColor:'#ccc', marginHorizontal:20}}/>

              <Pressable
                onPress={handleContactUs}
                style={({pressed}) => [
                  {
                    flexDirection: 'row',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    alignItems: 'center',
                    backgroundColor: pressed
                      ? 'rgba(0,0,0,0.05)'
                      : 'transparent',
                    borderRadius: 10,
                  },
                ]}
                android_ripple={{color: 'rgba(232, 232, 232, 1)'}}>
                <Icon name="call-outline" size={20}
                  padding={10}
                  color="rgba(123, 123, 123, 1)" />
                <Text
                  style={{
                    flex: 1,
                    paddingStart: 10,
                    color: '#252525',
                    fontFamily: 'Inter_28pt-Regular',
                    fontSize: 14,
                  }}>
                Contact Us
                </Text>
                <Icon
                  name="chevron-forward"
                  size={20}
                  padding={10}
                  color="rgba(123, 123, 123, 1)"
                />
              </Pressable>

              <View style={{height:1,backgroundColor:'#ccc', marginHorizontal:20}}/>


              <Pressable
                onPress={() => setModalVisible(true)}
                style={({pressed}) => [
                  {
                    flexDirection: 'row',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    alignItems: 'center',
                    backgroundColor: pressed
                      ? 'rgba(0,0,0,0.05)'
                      : 'transparent',
                    borderRadius: 10,
                  },
                ]}
                android_ripple={{color: 'rgba(232, 232, 232, 1)'}}>
                <View style={{}}>
                  <Icon
                    name="exit-outline"
                    size={20}
                    padding={10}
                    color={'rgb(253, 0, 0)'}
                  />
                </View>

                <Text
                  style={{
                    flex: 1,
                    paddingStart: 10,
                    color: 'rgb(253, 0, 0)',
                    fontFamily: 'Inter_28pt-Regular',
                    fontSize: 14,
                  }}>
                  Log out
                </Text>
              </Pressable>
            </View>

            <View style={{alignSelf: 'center'}}>
              <Text style={{fontFamily: 'Inter_28pt-Thin', fontSize: 16}}>
                Version {version}{' '}
              </Text>
            </View>
          </View>
          {/* </ImageBackground> */}

          {/* Logout Confirmation Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Confirm Logout</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to log out?
                </Text>

                <View style={styles.modalActions}>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  {/* Confirm Logout Button */}
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={logout}>
                    <Text style={styles.buttonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Progress Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={progressModalVisible}
            onRequestClose={() => {}}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <ActivityIndicator size="large" color="rgba(42, 125, 216, 1)" />
                <Text style={styles.modalMessage}>Logging out...</Text>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff3b3b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalMessage: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  confirmButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
