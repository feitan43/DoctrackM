import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  ToastAndroid,
  Modal,
  StatusBar,
  Button,
  Pressable,
  Dimensions,
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
import useSearchReceiver from '../../api/useSearchReceiver';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import useGetQRData from '../../api/useGetQRData';
import {insertCommas} from '../../utils/insertComma';
import useUserInfo from '../../api/useUserInfo';
import BottomSheet from '@gorhom/bottom-sheet';
import {SafeAreaView} from 'react-native-safe-area-context';
//import CameraPermission from '../../utils/CameraPermission';

const {width, height} = Dimensions.get('window');
const squareSize = 250; // Size of the transparent square
const currentYear = new Date().getFullYear().toString();
const ReceiverScreen = () => {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [year, setSelectedYear] = useState(new Date().getFullYear());
  const [dataError, setDataError] = useState(false);
  const {officeCode, privilege, permission, accountType} = useUserInfo();

  const {fetchDataSearchReceiver, setSearchTNData, loading, searchTNData} =
    useSearchReceiver();

  // const { qrData, setQRData, qrLoading, qrError, fetchQRData } = useGetQRData();
  const {
    data: qrData,
    isLoading: qrLoading,
    error: qrError,
    refetch,
  } = useGetQRData({
    year,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  /*   const checkAndRequestPermission = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
  }; */

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    })();
  }, [hasPermission, requestPermission]);

  const handleQRManual = () => {
    navigation.navigate('QRManual');
  };

  const handleQRAuto = () => {
    navigation.navigate('QRAuto');
  };

  const handleQRRevert = () => {
    navigation.navigate('QRRevert');
  };

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10, // Move 10 pixels to the right
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10, // Move 10 pixels to the left
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0, // Reset to original position
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClear = () => {
    setScannedCodes([]);
    setQRData(null);
  };

  const handleReceived = async (status, trackingNumber) => {
    if (status == 'CTO Received') {
      Alert.alert(
        'Received',
        `Tracking Number: ${item.TrackingNumber} marked as received.`,
      );
    } else {
      Alert.alert(
        'Already Received',
        `This Tracking Number: ${trackingNumber} received already.`,
      );
    }
  };

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

  const navigation = useNavigation();
  const cameraPermission = useCameraPermission();
  const cameraDevice = useCameraDevice('back');
  const isCameraReady = cameraDevice?.isAvailable;
  const cameraRef = useRef(null);

  const {hasPermission, requestPermission} = cameraPermission;

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
          setShowCamera(false);
          return;
        }

        const data = await fetchQRData(year, trackingNumber);

        /*  if (!data || data.error) {
          ToastAndroid.show('No data found or invalid code.', ToastAndroid.SHORT);
          return;
        } */

        setScannedCodes(prev => [...prev, result]);
        setShowCamera(false);
      } catch (error) {
        // console.error('Error processing scanned code or fetching data:', error);

        if (error.message === 'Invalid scanned code') {
          ToastAndroid.show(
            'Invalid QR code. Please try again.',
            ToastAndroid.SHORT,
          );
          setShowCamera(false);
        } else {
          ToastAndroid.show(
            'Error fetching data. Please try again.',
            ToastAndroid.SHORT,
          );
          setShowCamera(false);
        }
      }
    },
  });

  /*   const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async codes => {
      if (codes.length > 0) {
        const scannedCode = codes[0].value;

        if (!scannedCodes.includes(scannedCode)) {
          const [year, ...trackingParts] = scannedCode.split('-');
          const trackingNumber = trackingParts.join('-');

          const isValidYear =
            /^\d{4}$/.test(year) &&
            parseInt(year) >= 2024 &&
            parseInt(year) <= 2025;
          const isValidTrackingNumber =
            trackingNumber.startsWith('PR-') || trackingNumber.includes('-');

          if (!isValidYear || !isValidTrackingNumber) {
            Alert.alert('Invalid Code', 'Please scan a valid QR code.');
            return;
          }

          const data = await fetchQRData(year, trackingNumber);
          //console.log('data', data);
          setScannedCodes(prev => [...prev, scannedCode]);
          setShowCamera(false);
        }
      }
    },
  }); */

  //REAL
  // const codeScanner = useCodeScanner({
  //   codeTypes: ['qr'],
  //   onCodeScanned: async codes => {
  //     if (codes.length > 0) {
  //       const scannedCode = codes[0].value;

  //       if (!scannedCodes.includes(scannedCode)) {
  //         const [year, ...trackingParts] = scannedCode.split('-');
  //         const trackingNumber = trackingParts.join('-');

  //         const isValidYear = /^\d{4}$/.test(year) && parseInt(year) >= 2024 && parseInt(year) <= 2025;

  //         const isValidTrackingNumber =
  //           trackingNumber.startsWith('PR-') || trackingNumber.substring(4, 5) === '-';

  //         if (!isValidYear || !isValidTrackingNumber) {
  //           Alert.alert(
  //             'Invalid Code Format',
  //             `The scanned code does not have a valid year or tracking number format.\nYear: ${year}\nTracking Number: ${trackingNumber}`
  //           );
  //           return;
  //         }

  //         setScannedCodes(prevCodes => [...prevCodes, scannedCode]);

  //         try {
  //           const data = await fetchDataSearchReceiver(trackingNumber, year);

  //           if (data.results.length > 0) {
  //             const resultTrackingNumber =
  //               trackingNumber.substring(4, 5) === '-' || trackingNumber.substring(0, 3) === 'PR-'
  //                 ? trackingNumber
  //                 : data.results[0].TrackingNumber;

  //             navigation.navigate('Detail', {
  //               index: 0,
  //               selectedItem: {
  //                 Year: year,
  //                 TrackingNumber: resultTrackingNumber,
  //                 TrackingType: data.results[0].TrackingType,
  //                 data: data.results[0],
  //               },
  //             });
  //           } else {
  //             Alert.alert('No Data Found', 'The scanned code did not match any records.');
  //           }
  //         } catch (error) {
  //           console.error('Error fetching data:', error);
  //           Alert.alert('Error', 'Failed to fetch data. Please try again.');
  //         }
  //       }
  //     }
  //   },
  // });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCodes(scannedCodes);
    } else {
      setFilteredCodes(
        scannedCodes.filter(code =>
          code.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, scannedCodes]);

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

  const handleQRBack = () => {
    setShowCamera(prevState => !prevState);
  };

  const searchTrackingNumber = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      setDataError(true);
      triggerShakeAnimation();
      ToastAndroid.show('At least 3 characters required.', ToastAndroid.SHORT);
      return;
    }

    const validText = /^[a-zA-Z0-9-]*$/;

    if (!validText.test(searchQuery)) {
      setDataError(true);
      triggerShakeAnimation();
      ToastAndroid.show(
        'Only alphanumeric characters and hyphen (-) are allowed.',
        ToastAndroid.SHORT,
      );
      return;
    } else {
      setDataError(false);
    }

    setIsLoading(true); // Start loading when the request is triggered

    try {
      const data = await fetchDataSearchReceiver(searchQuery, selectedYear);
      if (!data || !data.results || data.results.length === 0) {
        setDataError(true);
        triggerShakeAnimation();
        ToastAndroid.show('No results found.', ToastAndroid.SHORT);
        return;
      }

      const trackingNumber =
        searchQuery.substring(4, 5) === '-' ||
        searchQuery.substring(0, 3) === 'PR-'
          ? searchQuery
          : data.results[0].TrackingNumber;

      if (data.results.length > 0) {
        navigation.navigate('Detail', {
          index: 0,
          selectedItem: {
            Year: selectedYear,
            TrackingNumber: trackingNumber,
            TrackingType: data.results[0].TrackingType,
            data: data.results[0],
          },
        });
      } else {
        console.log('No unique results found for the search.');
      }
    } catch (fetchError) {
      setDataError(true);
      triggerShakeAnimation();
      console.error('Fetch error:', fetchError); // Log full error message
      setErrorMessage(`Fetch error: ${fetchError.message || fetchError}`);
    } finally {
      setIsLoading(false); // Set loading to false when done
    }
  };

  const renderItem = ({item}) => {
    const showReceivedButton =
      (officeCode === '1031' &&
        privilege === '5' &&
        accountType === '2' &&
        item.TrackingType === 'PY' &&
        (item.Status === 'Encoded' || item.Status === 'Carded - Accounting')) ||
      item.Status === 'Pending Released - Admin Operation' ||
      item.Status === 'Check Preparation - CTO' ||
      (privilege === 8 && item.Status === 'Check Preparation - CTO');

    const showPendingButton = item.Status === 'Admin Operation Received';

    const showReleasedPendingButton =
      item.Status === 'Pending at Admin Operation';

    return (
      <View style={styles.itemContainer}>
        <View style={styles.textRow}>
          <Text style={styles.label}>Year:</Text>
          <Text style={styles.value}>{item.Year}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Tracking Type:</Text>
          <Text style={styles.value}>{item.TrackingType}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Tracking Number:</Text>
          <Text style={styles.value}>{item.TrackingNumber}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Document Type:</Text>
          <Text style={styles.value}>{item.DocumentType}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{item.Status}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{insertCommas(item.Amount)}</Text>
        </View>

        <View style={{flexDirection: 'row'}}>
          {showReceivedButton && (
            <TouchableOpacity
              style={{
                flex: 1,
                marginTop: 20,
                backgroundColor: '#007bff',
                padding: 10,
                margin: 5,
                borderRadius: 4,
              }}
              onPress={() => handleReceived(item.Status, item.TrackingNumber)}>
              <View>
                <Text style={styles.buttonText}>Received</Text>
              </View>
            </TouchableOpacity>
          )}

          {showPendingButton && (
            <TouchableOpacity
              style={{
                flex: 1,
                marginTop: 20,
                backgroundColor: 'orange',
                padding: 10,
                margin: 5,
                borderRadius: 4,
              }}
              onPress={() => handlePending(item.TrackingNumber)}>
              <View>
                <Text style={styles.buttonText}>Pending</Text>
              </View>
            </TouchableOpacity>
          )}

          {showReleasedPendingButton && (
            <TouchableOpacity
              style={{
                flex: 1,
                marginTop: 20,
                backgroundColor: '#ffc107',
                padding: 10,
                margin: 5,
                borderRadius: 4,
              }}
              onPress={() => handleReleasedPending(item.TrackingNumber)}>
              <View>
                <Text style={styles.buttonText}>Released Pending</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              flex: 1,
              marginTop: 20,
              backgroundColor: 'transparent',
              padding: 10,
              margin: 5,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: 'silver',
            }}
            onPress={() => handleShowDetails(item.TrackingNumber, item.Year)}>
            <View>
              <Text
                style={{
                  color: '#007bff',
                  textAlign: 'center',
                  fontSize: 14,
                }}>
                Show Details
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  {
    cameraPermission === 'denied' && <CameraPermission />;
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            paddingBottom: 5,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 3,
            //elevation: 3,
          }}>
          <Pressable
            style={({pressed}) => [
              pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginStart: 10,
                padding: 10,
                borderRadius: 24,
              },
            ]}
            android_ripple={{
              color: '#F6F6F6',
              borderless: true,
              radius: 24,
              foreground: true,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="gray" />
          </Pressable>
          <Text
            style={{
              padding: 10,
              color: '#252525',
              fontSize: 16,
              fontFamily: 'Inter_28pt-Bold',
            }}>
            Scan QR
          </Text>
        </View>
        <View style={{flex: 1, paddingHorizontal: 5}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              paddingTop: 20,
              paddingStart: 25,
            }}>
            <Text
              style={{
                fontFamily: 'Inter_28pt-Regular',
                fontSize: 14,
                color: 'gray',
              }}>
              Select Type
            </Text>
            {/*   <TouchableOpacity
              style={styles.qrIconWrapper}
              onPress={handleQrIconPress}>
              <Icon name="scan" size={36} color="#007bff" />
              <View style={styles.qrCodeIcon}>
                <Icon name="qr-code" size={16} color="#007bff" />
              </View>
            </TouchableOpacity> */}
          </View>

          <View
            style={{
              //borderWidth: 1,
              borderRadius: 5,
              marginTop: 10,
              marginHorizontal: 20,
              alignItems: 'center',
              backgroundColor: '#fff',
            }}>
            <Pressable
              onPress={handleQRManual}
              style={({pressed}) => [
                {
                  flexDirection: 'row',
                  paddingVertical: 15,
                  //paddingHorizontal: 15,
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
                  paddingStart: 20,

                  //borderRadius: 10,
                },
              ]}
              android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
              <TouchableOpacity
                style={styles.qrIconWrapper}
                //onPress={handleQrIconPress}
              >
                <Icon name="scan" size={30} color="#007bff" />
                <View style={styles.qrCodeIcon}>
                  <Icon name="search" size={16} color="#007bff" />
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  paddingStart: 10,
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: 'black',
                  /* textAlign: 'left', */
                }}>
                Manual Receive
              </Text>
            </Pressable>

            <View
              style={{
                height: 1, // Adjust thickness if needed
                backgroundColor: 'silver',
                opacity: 0.2, // Use a clear, contrasting color
                alignSelf: 'stretch', // Ensure it spans the width
                //marginVertical: 1, // Add spacing for better visibility
              }}
            />

            <Pressable
              onPress={handleQRAuto}
              style={({pressed}) => [
                {
                  flexDirection: 'row',
                  paddingVertical: 15,
                  //paddingHorizontal: 15,
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
                  paddingStart: 20,
                  //borderRadius: 10,
                },
              ]}
              android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
              <TouchableOpacity
                style={styles.qrIconWrapper}
                //onPress={handleQrIconPress}
              >
                <Icon name="scan" size={30} color="#007bff" />
                <View style={styles.qrCodeIcon}>
                  <Icon name="qr-code" size={16} color="#007bff" />
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  paddingStart: 10,
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: 'black',
                  /* textAlign: 'left', */
                }}>
                Auto Receive
              </Text>
            </Pressable>

            {/*  <View
              style={{
                height: 1, // Adjust thickness if needed
                backgroundColor: '#ccc', // Use a clear, contrasting color
                alignSelf: 'stretch', // Ensure it spans the width
                //marginVertical: 1, // Add spacing for better visibility
              }}
            /> */}

            {/*    <Pressable
              onPress={handleQRRevert}
              style={({pressed}) => [
                {
                  flexDirection: 'row',
                  paddingVertical: 20,
                  //paddingHorizontal: 15,
                  //alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
                  paddingStart: 20,
                  //borderRadius: 10,
                },
              ]}
              android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
              <Icon name="arrow-undo-outline" size={24} color={'gray'} />
              <Text
                style={{
                  flex: 1,
                  paddingStart: 10,
                  fontFamily: 'Oswald-Regular',
                  fontSize: 16,
                  color: 'black',
                  //textAlign: 'left',
                }}>
                Revert
              </Text>
            </Pressable> */}
          </View>

          {qrData && qrData.length > 0 && (
            <View style={{paddingVertical: 10}}>
              <TouchableOpacity
                onPress={() => handleClear()}
                style={{
                  padding: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.0.5)',
                    borderWidth: 1,
                    borderColor: 'gray',
                    alignItems: 'center',
                    flexDirection: 'row',
                    borderRadius: 18,
                    padding: 5,
                  }}>
                  <Icon name="close-circle" size={16} color="#000" />
                  <Text style={{width: 'auto'}}>Clear</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={qrData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        </View>

        {/*  <BottomSheet
      index={showCamera ? 0 : -1} // Show when true, hide when false
      snapPoints={['90%']} // Adjust bottom sheet height
      onClose={() => setShowCamera(false)}
    >
      <View style={styles.bottomSheetContent}>
        {qrLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPreview}>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                codeScanner={codeScanner}
                device={cameraDevice}
                format={format}
                isActive={true}
                videoStabilization={true}
                cameraOptions={{
                  focusDepth: 0.5,
                  exposureCompensation: 0.5,
                }}
                onError={e => console.log(e)}
              />
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
          </View>
        )}
      </View>
    </BottomSheet> */}

        {showCamera && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showCamera}
            onRequestClose={() => setShowCamera(false)}>
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  qrLoading ? {backgroundColor: 'transparent'} : null,
                ]}>
                {qrLoading ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                      width: 320,
                    }}>
                    <View style={{padding: 40, backgroundColor: 'white'}}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.cameraContainer}>
                      <View style={styles.cameraPreview}>
                        <Camera
                          ref={cameraRef}
                          style={StyleSheet.absoluteFillObject}
                          codeScanner={codeScanner}
                          device={cameraDevice}
                          format={format}
                          isActive={true}
                          videoStabilization={true}
                          cameraOptions={{
                            focusDepth: 0.5,
                            exposureCompensation: 0.5,
                          }}
                          onError={e => console.log(e)}
                        />
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
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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

  backButton: {
    marginRight: 8,
    padding: 5,
  },
  headerText: {
    fontSize: 16,
    //fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Oswald-Regular',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    //marginVertical: 10,
    elevation: 2,
    fontSize: 16,
    marginEnd: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 1,
  },
  itemText: {
    width: '40%',
    fontSize: 12,
    fontFamily: 'Oswald-Light',
    textAlign: 'right',
    color: 'gray',
  },
  button: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 10,
    margin: 5,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    //fontWeight: '600',
    fontSize: 14,
    //fontFamily:'Oswald-Regular'
  },
  cameraContainer: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: 'black',
  },
  corner: {
    width: 50,
    height: 50,
    borderWidth: 2,
    //borderColor: '#007bff',
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
  cameraPreview: {
    flex: 1,
    backgroundColor: 'red',
  },
  searchBarContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    top: '50%',
    left: '50%',
    transform: [{translateX: -8}, {translateY: -8}],
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
  },
  qrScannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  transparentArea: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scannerArea: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  opaqueTop: {
    width: '100%',
    height: (height - squareSize) / 2,
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
    width: '100%',
    height: (height - squareSize) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReceiverScreen;
