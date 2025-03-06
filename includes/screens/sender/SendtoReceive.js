import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useNavigation} from '@react-navigation/native';

const SendToReceive = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingList, setTrackingList] = useState([]);
  const [qrValue, setQrValue] = useState('');
  const navigation = useNavigation();

  const handleAddTracking = () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid tracking number.');
      return;
    }
    if (trackingList.includes(trackingNumber)) {
      Alert.alert('Error', 'Tracking number already added.');
      return;
    }

    setTrackingList([...trackingList, trackingNumber]);
    setTrackingNumber('');
  };

  const handleGenerateQR = () => {
    if (trackingList.length === 0) {
      Alert.alert('Error', 'Please add at least one tracking number.');
      return;
    }

    const qrData = trackingList.join(',');
    setQrValue(qrData); // Generate QR based on tracking numbers
  };

  const handleClearList = () => {
    setTrackingList([]);
    setQrValue('');
    Alert.alert('Success', 'Tracking list cleared.');
  };

  const handleQrIconPress = async () => {
    try {
      const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA); // or PERMISSIONS.IOS.CAMERA based on platform

      if (cameraPermission === RESULTS.GRANTED) {
        setShowCamera(!showCamera);
      } else if (
        cameraPermission === RESULTS.DENIED ||
        cameraPermission === RESULTS.LIMITED
      ) {
        const requestResult = await request(PERMISSIONS.ANDROID.CAMERA); // or PERMISSIONS.IOS.CAMERA
        if (requestResult === RESULTS.GRANTED) {
          setShowCamera(!showCamera);
        } else {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to scan QR codes. Please enable it in the app settings.',
          );
        }
      } else if (cameraPermission === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Camera permission is blocked. Please enable it in the app settings.',
        );
      }
    } catch (error) {
      console.error('Error checking or requesting camera permission:', error);
      Alert.alert(
        'Error',
        'An error occurred while checking camera permissions.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Go Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Sender Screen</Text>
        <View>
          <TouchableOpacity
            style={styles.qrIconWrapper}
            onPress={handleQrIconPress}>
            <Icon name="scan" size={36} color="#007bff" />
            <View style={styles.qrCodeIcon}>
              <Icon name="qr-code" size={16} color="#007bff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input for Tracking Number */}
      <TextInput
        style={styles.input}
        placeholder="Enter Tracking Number"
        value={trackingNumber}
        onChangeText={setTrackingNumber}
      />
      <Button title="Add Tracking Number" onPress={handleAddTracking} />

      {/* Display Added Tracking Numbers */}
      <Text style={styles.label}>Tracking Numbers:</Text>
      <FlatList
        data={trackingList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.listItem}>
            <Text>{item}</Text>
          </View>
        )}
        style={styles.list}
      />

      {qrValue ? (
        <View style={styles.qrCode}>
          <QRCode value={qrValue} size={200} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: 'gray',
            borderRadius:18,
            marginRight:20
          }}
          onPress={handleClearList}>
            <Icon name='trash' size={20} color={'white'} paddingHorizontal={5}/>
         {/*  <Text
            style={{
              color: 'white',
              borderRadius: 20,
              padding: 12,
              backgroundColor: '#ff4d4d',
            }}>
            Clear List
          </Text> */}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: '#007bff',
            padding: 12,
          }}
          onPress={handleGenerateQR}>
          <Text style={{color: 'white', textAlign: 'center'}}>
            Generate QR Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* <TouchableOpacity style={styles.clearButton} onPress={handleClearList}>
        <Text style={styles.clearText}>Clear Tracking List</Text>
      </TouchableOpacity>

       <View style={styles.qrContainer}>
        <Button title="Generate QR Code" onPress={handleGenerateQR} />
        {qrValue ? (
          <View style={styles.qrCode}>
            <QRCode value={qrValue} size={200} />
          </View>
        ) : null}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    top: 37,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    //fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Oswald-Regular',
  },
  qrIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  qrCodeIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%', // Adjust to center within the scan icon
    left: '50%',
    transform: [{translateX: -8}, {translateY: -8}], // Adjust based on the QR code size
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  list: {
    maxHeight: 200,
    marginTop: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCode: {
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 18,
  },
  clearText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 37,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 8,
  },
  clearText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCode: {
    marginTop: 20,
  },
});

export default SendToReceive;
