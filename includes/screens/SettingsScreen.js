import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  Button,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DeviceInfo from 'react-native-device-info';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Rate, {AndroidMarket} from 'react-native-rate';
import {Linking, Platform} from 'react-native';
import {
  withStallion,
  useStallionUpdate,
  restart,
  useStallionModal,
} from 'react-native-stallion';
const version = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const statusBarContentStyle = 'dark-content';
const statusBarHeight =
  Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;

const SettingsScreen = ({fullName, employeeNumber, officeName, navigation}) => {
  const {showModal} = useStallionModal();

  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  const handleProfile = () => navigation?.navigate('Profile');
  const handleNotifications = () => navigation?.navigate('Notifications');
  const handleContactUs = () => navigation?.navigate('ContactUs');
  const handleHelpCenter = () => navigation?.navigate('HelpCenter');

  /* const handleFeedback = () => {
    const options = {
      GooglePackageName: 'com.doctrackm',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
      openAppStoreIfInAppFails: true,
    };

    Rate.rate(options, success => {
      if (success) {
        console.log('User successfully interacted with the rating UI');
      }
    });
  }; */

  /*   const handleFeedback = () => {
  const packageName = 'com.doctrackm'; // 🔁 replace with your actual package name
  const url = Platform.select({
    android: `market://details?id=${packageName}`,
    ios: `itms-apps://itunes.apple.com/app/idYOUR_APP_ID`, // optional for iOS
  });

  Linking.openURL(url).catch(() => {
    // fallback to web URL
    Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
  });
}; */

  const logout = async () => {
    setModalVisible(false);
    setProgressModalVisible(true);

    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${BASE_URL}/logoutApi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({EmployeeNumber: employeeNumber}),
      });

      if (!response.ok) throw new Error(`Logout failed: ${response.status}`);

      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (err) {
      console.error(err);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    } finally {
      setProgressModalVisible(false);
    }
  };

  const SettingItem = ({icon, label, onPress, danger}) => (
    <Pressable
      onPress={onPress}
      unstable_pressDelay={20}
      delayHoverIn={1000}
      delayPressIn={5000} // 🕒 Add a 100ms delay before ripple starts
      android_ripple={{color: '#eee' /* borderless: false */}}
      style={({pressed}) => [
        styles.settingItem,
        pressed /* && {backgroundColor: '#f0f0f0'} */,
      ]}>
      <Icon name={icon} size={22} color={danger ? '#ff3b30' : '#666'} />
      <Text style={[styles.settingLabel, danger && {color: '#ff3b30'}]}>
        {label}
      </Text>
      <Icon name="chevron-forward" size={20} color="#bbb" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/bgasset.jpg')}
        style={{flex: 1}}
        resizeMode="cover">
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        />
        <View style={styles.sectionCard}>
          <SettingItem
            icon="person-outline"
            label="Profile"
            onPress={handleProfile}
          />
          <SettingItem
            icon="notifications-outline"
            label="Notifications"
            onPress={handleNotifications}
          />
          <SettingItem
            icon="call-outline"
            label="Contact Us"
            onPress={handleContactUs}
          />
          {/*  <SettingItem
            icon="chatbubbles-outline"
            label="Feedback and Suggestions"
            onPress={handleFeedback}
          /> */}
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={handleHelpCenter}
          />
          <SettingItem
            icon="exit-outline"
            label="Log out"
            onPress={() => setModalVisible(true)}
            danger
          />
        </View>

        {employeeNumber === '391091' && (
          <Button title="Open Stallion" onPress={showModal} />
        )}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version {version}</Text>
          <Text style={[styles.versionText, {opacity: 0.5}]}>
            Build No. {buildNumber}
          </Text>
        </View>

        {/* Logout Confirmation Modal */}
        <Modal
          transparent
          animationType="none"
          visible={modalVisible}
          statusBarTranslucent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to log out?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
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
          transparent
          animationType="fade"
          visible={progressModalVisible}
          statusBarTranslucent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ActivityIndicator size="large" color="#2a7dd8" />
              <Text style={styles.modalMessage}>Logging out...</Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    //paddingVertical: 14,
    //paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    //marginStart: 10,
  },
  settingLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#222',
    fontFamily: 'Inter_28pt-Regular',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalMessage: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#ff3b30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SettingsScreen;
