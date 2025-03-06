import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
  ToastAndroid,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native';
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  useCodeScanner,
  useCameraFormat,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import useGetQRData from '../../api/useGetQRData';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import useUserInfo from '../../api/useUserInfo';
import {insertCommas} from '../../utils/insertComma';
import useSearchReceiver from '../../api/useSearchReceiver';
import useReceiving from '../../api/useReceiving';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');
const squareSize = 250;

const QRAuto = () => {
  const navigation = useNavigation();
  //const cameraPermission = useCameraPermission();
  const cameraDevice = useCameraDevice('back');
  const isCameraReady = cameraDevice?.isAvailable;
  const cameraRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);

  const {qrData, setQRData, qrLoading, qrError, fetchQRData} = useGetQRData();
  const {fetchDataSearchReceiver, setSearchTNData, loading, searchTNData} =
    useSearchReceiver();

  const {autoReceive, receivingData,isLoading} = useReceiving();

  const {officeCode, privilege, accountType, employeeNumber} = useUserInfo();

  const bottomSheetRef = useRef(null);

  const snapPoints = ['25%', '50%', '75%'];

  const [showCheck, setShowCheck] = useState(true);

  /* useEffect(() => {
    handleCameraPermission();
  }, []);

  const handleCameraPermission = async () => {
    try {
      const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA); // Replace with PERMISSIONS.IOS.CAMERA for iOS

      if (cameraPermission === RESULTS.GRANTED) {
        //console.log('Camera permission granted.');
      } else if (
        cameraPermission === RESULTS.DENIED ||
        cameraPermission === RESULTS.LIMITED
      ) {
        const requestResult = await request(PERMISSIONS.ANDROID.CAMERA); // Replace with PERMISSIONS.IOS.CAMERA for iOS
        if (requestResult === RESULTS.GRANTED) {
          console.log('Camera permission granted after request.');
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
  }; */

  const renderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <View style={{flexDirection: 'row'}}>
          {showCheck && receivingData && (
            <>
              {receivingData.status === 'success' && (
                <Icon
                  name="checkmark-circle-outline"
                  size={60}
                  color="green"
                  style={{alignSelf: 'center'}}
                />
              )}
              {receivingData.status === 'error' &&
                item.Status !== 'Admin Received' && (
                  <Icon
                    name="close-circle-outline"
                    size={60}
                    color="red"
                    style={{alignSelf: 'center'}}
                  />
                )}
              {receivingData.status === 'error' &&
                item.Status === 'Admin Received' && (
                  <Icon
                    name="checkmark-done-circle-outline"
                    size={60}
                    color="green"
                    style={{alignSelf: 'center'}}
                  />
                )}
            </>
          )}

          <View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Year:</Text>
              <Text style={styles.value}>{item.Year}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Tracking Number:</Text>
              <Text style={styles.value}>{item.TrackingNumber}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{item.Status}</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            alignSelf: 'flex-end',
            paddingTop: 10,
          }}>
          <TouchableOpacity
            style={{
              //marginTop: 20,
              backgroundColor: 'transparent',
              borderRadius: 4,
              flexDirection: 'row',
              paddingTop: 10,
            }}
            onPress={() => handleShowDetails(item.TrackingNumber, item.Year)}>
            <View>
              <Text
                style={{
                  color: '#007bff',
                  textAlign: 'right',
                  fontSize: 14,
                }}>
                Show More
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={'blue'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleSheetChange = useCallback(index => {}, []);

  const handleShowDetails = async (trackingNumber, year) => {
    const data = await fetchDataSearchReceiver(trackingNumber, year);

    if (data.results.length > 0) {
      const resultTrackingNumber =
        trackingNumber.substring(4, 5) === '-' ||
        trackingNumber.substring(0, 3) === 'PR-'
          ? trackingNumber
          : data.results[0].TrackingNumber;

      navigation.navigate('Detail', {
        index: 0,
        selectedItem: {
          Year: year,
          TrackingNumber: resultTrackingNumber,
          TrackingType: data.results[0].TrackingType,
          data: data.results[0],
        },
      });
    }
  };

  const format = useCameraFormat(cameraDevice, [
    {videoResolution: {width: 1280, height: 720}},
  ]);

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

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async codes => {
      if (codes.length === 0) return;

      const scannedCode = codes[0].value;

      if (scannedCodes.includes(scannedCode)) {
        Alert.alert(
          'Code Already Scanned',
          'This QR code has already been scanned.',
        );
        return;
      }

      try {
        const result = decryptScannedCode(scannedCode);
        const [year, ...trackingParts] = result.split('-');
        const trackingNumber = trackingParts.join('-');

        const isValidYear =
          /^\d{4}$/.test(year) &&
          parseInt(year) >= 2024 &&
          parseInt(year) <= 2025;

        const isValidTrackingNumber =
          trackingNumber.startsWith('PR-') || trackingNumber.includes('-');

        if (!isValidYear || !isValidTrackingNumber) {
          ToastAndroid.show('Please scan a valid QR code.', ToastAndroid.SHORT);
          return;
        }

        const data = await fetchQRData(year, trackingNumber);

        if (!Array.isArray(data) || data.length === 0) {
          /*   console.error(
            'No data received or data is not in the expected format',
          ); */
          ToastAndroid.show(
            'No data received or data is not in the expected format.',
            ToastAndroid.SHORT,
          );

          return;
        }

        const qrData = data[0];
        //year, trackingNumber, trackingType, documentType, status, accountType, privilege, officeCode, employeeNumber
        const trackingType = qrData.TrackingType || '';
        const documentType = qrData.DocumentType || '';
        const status = qrData.Status || '';

        const data2 = await autoReceive(
          year,
          trackingNumber,
          trackingType,
          documentType,
          status,
          accountType,
          privilege,
          officeCode,
          employeeNumber,
        );

        try {
          if (data2 && data2.status === 'success') {
            console.log('data2', data2);

            const data = await fetchQRData(year, trackingNumber);

            /*  if (
              data &&
              data.length > 0 &&
              data[0].Status === 'Admin Received'
            ) {
              ToastAndroid.show('Already Received.', ToastAndroid.SHORT);
              return;
            } */

            /*   console.log(data.Status);
        
            if (data3.Status === 'Admin Received') {
              ToastAndroid.show('Already Received.', ToastAndroid.SHORT);
            } */
          }
          if (data2 && data2.status === 'error') {
            const data = await fetchQRData(year, trackingNumber);
            /* console.log(data);
            console.log(data[0].Status); */

            // Check the Status in the response data
            if (
              data &&
              data.length > 0 &&
              data[0].Status === 'Admin Received'
            ) {
              ToastAndroid.show('Already Received.', ToastAndroid.SHORT);
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching QR data:', error);
          ToastAndroid.show(
            'An error occurred. Please try again.',
            ToastAndroid.SHORT,
          );
        }

        setScannedCodes(prev => [...prev, result]);
        // Handle successful scan and data retrieval (optional: navigate to success screen)
      } catch (error) {
        // console.error('Error processing scanned code or fetching data:', error);

        if (error.message === 'Invalid scanned code') {
          ToastAndroid.show(
            'Invalid QR code. Please try again.',
            ToastAndroid.SHORT,
          );
        } else {
          ToastAndroid.show(
            'Error fetching data. Please try again.',
            ToastAndroid.SHORT,
          );
        }
      }
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Auto Receiving</Text>
        <View style={{paddingHorizontal: 10, marginVertical: 10}}></View>
      </View>

      <View style={styles.cameraPreview}>
        <View style={{zIndex: 1, top: -300}}>
          <Text style={{color: 'gray', fontWeight: 'bold', fontSize: 20}}>
            Scan QR
          </Text>
        </View>

        {qrLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          </View>
        ) : (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            codeScanner={codeScanner}
            device={cameraDevice}
            format={format}
            isActive={true}
            videoStabilization={true}
            cameraOptions={{focusDepth: 0.5, exposureCompensation: 0.5}}
            onError={e => console.log(e)}
          />
        )}
      </View>

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

      {receivingData /* && qrData.Status === 'Check Preparation - CTO' */ && (
        /*  qrData.length > 0 && */ <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
          style={{backgroundColor: 'transparent'}}>
          <View style={styles.bottomSheetContent}>
            {/*  <Text style={styles.bottomSheetTitle}>Scanned Codes</Text> */}
            {/*     <View style={{paddingVertical: 10, paddingStart: 20}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    fontSize: 18,
                    color: 'black',
                  }}>
                  Received
                </Text>
              </View> */}
            <View style={{flex: 1, paddingHorizontal: 10, paddingTop: 10}}>
              <BottomSheetFlatList // Use regular FlatList here
                data={qrData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.bottomSheetList}
              />
            </View>
          </View>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //top: 37,
    paddingTop: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    //marginBottom: 16,
    //marginBottom:5,
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // Set background color for better visibility of the shadow
    // Android shadow
    elevation: 1,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    zIndex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    //fontWeight: '600',
    fontSize: 14,
    //fontFamily:'Oswald-Regular'
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    //marginVertical: 8,
    borderRadius: 10,
    elevation: 1,
    //borderStartWidth:10,
    //borderStartColor:'red'
  },
  itemText: {
    width: '40%',
    fontSize: 12,
    fontFamily: 'Oswald-Light',
    textAlign: 'right',
    color: 'gray',
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
  textRow: {
    flexDirection: 'row',
    width: '65%',
  },
  label: {
    width: '50%',
    fontSize: 13,
    fontFamily: 'Oswald-Light',
    textAlign: 'right',
    color: 'gray',
  },
  value: {
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    width: '100%',
    color: 'black',
    marginStart: 10,
  },
  cameraPreview: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomSheetList: {
    flexGrow: 1,
  },
  scannedCodeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  animationContainer: {alignItems: 'center', marginTop: 10},
  lottie: {width: 50, height: 50},
  loadingContainer: {
    zIndex: 1,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default QRAuto;
