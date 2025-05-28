import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');
const squareSize = 250;
const QRScanner = ({onScan, onClose}) => {
  const cameraDevice = useCameraDevice('back');
  const [cameraIsActive, setCameraIsActive] = useState(true);

  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    const checkPermissions = async () => {
      const status = Camera.getCameraPermissionStatus();
      if (status !== 'granted') {
        const newStatus = await Camera.requestCameraPermission();
        setPermissionStatus(newStatus);
      } else {
        setPermissionStatus(status);
      }
    };
    checkPermissions();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async codes => {
      if (codes.length === 0) return;

      const scannedCode = codes[0].value;

      try {
        const result = decryptScannedCode(scannedCode);
        const [yearStr, ...trackingParts] = result.split('-');
        const scannedTrackingNumber = trackingParts.join('-');
        const scannedYear = parseInt(yearStr);

        const isValidYear = scannedYear >= 2024 && scannedYear <= 2025;
        const isValidTrackingNumber =
          scannedTrackingNumber.startsWith('PR-') ||
          scannedTrackingNumber.includes('-');

        if (!isValidYear || !isValidTrackingNumber) {
          ToastAndroid.show('Please scan a valid QR code.', ToastAndroid.SHORT);
          return;
        }

        setCameraIsActive(false);
        onScan({year: scannedYear, trackingNumber: scannedTrackingNumber});
        onClose();
      } catch (error) {
        console.error('Error fetching QR data:', error);
        Alert.alert(
          'Error',
          'Something went wrong while fetching the QR data.',
        );
      }
    },
  });

  const decryptScannedCode = scannedCode => {
    if (!scannedCode || scannedCode.length < 6) {
      throw new Error('Invalid scanned code');
    }

    const yearCode = scannedCode[1];
    const specialCode = scannedCode[2];
    const officeCode = scannedCode.slice(3, 7);
    const series = scannedCode.slice(7);

    const year = 2023 + (yearCode.charCodeAt(0) - 'A'.charCodeAt(0) + 1);

    const prSegment = specialCode === 'Y' ? 'PR-' : '';

    const combinedCode = `${year}-${prSegment}${officeCode}-${series}`;

    return combinedCode;
  };

  if (!cameraDevice) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  /* if (permissionStatus !== 'granted') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Camera permission is required.</Text>
        <TouchableOpacity
          onPress={async () => {
            const status = await Camera.requestCameraPermission();
            setPermissionStatus(status);
          }}
          style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  } */

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Camera
          style={{flex: 1}}
          codeScanner={codeScanner}
          device={cameraDevice}
          isActive={cameraIsActive}
        />
        <View style={styles.qrScannerOverlay}>
          <View style={styles.opaqueTop} />

          <View style={styles.row}>
            <View style={styles.opaqueSide} />
            <View style={styles.transparentSquare}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.opaqueSide} />
          </View>
          <View style={styles.opaqueBottom} />
        </View>
        <View style={styles.overlay}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {fontSize: 16, marginBottom: 20},
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {color: 'white', fontWeight: 'bold'},
  overlay: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  qrScannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  opaqueTop: {
    width: '100%',
    height: (height - squareSize) / 3,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    height: squareSize,
  },
  opaqueSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  transparentSquare: {
    width: squareSize,
    height: squareSize,
    backgroundColor: 'transparent',
    position: 'relative',
    borderColor: 'white',
  },
  opaqueBottom: {
    flex: 1,
    width: '100%',
    height: (height - squareSize) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  corner: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
});

export default QRScanner;
