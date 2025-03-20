import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
  ToastAndroid,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  Button,
  Image,
  TextInput,
  ImageBackground,
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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import useGetQRData from '../../api/useGetQRData';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import useUserInfo from '../../api/useUserInfo';
import { insertCommas } from '../../utils/insertComma';
import useSearchReceiver from '../../api/useSearchReceiver';
import useReceiving from '../../api/useReceiving';
import { IconButton } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const squareSize = 250;

const QRManual = () => {
  const navigation = useNavigation();
  const cameraPermission = useCameraPermission();
  const cameraDevice = useCameraDevice('back');
  const isCameraReady = cameraDevice?.isAvailable;
  const cameraRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [cameraIsActive, setCameraIsActive] = useState(true);

  const [inputParams, setInputParams] = useState('');

  const { qrData, setQRData, qrLoading, qrError, fetchQRData } = useGetQRData();
  const { fetchDataSearchReceiver, setSearchTNData, loading, searchTNData } =
    useSearchReceiver();

  const { officeCode, privilege, permission, accountType, employeeNumber, caoReceiver } =
    useUserInfo();

  const { autoReceive, revertReceived, isLoading } = useReceiving();

  const bottomSheetRef = useRef(null);

  const snapPoints = ['50%', '70%', '80%'];

  const handleReceived = async (
    year,
    trackingNumber,
    trackingType,
    documentType,
    status,
    inputParams,
  ) => {

    try {
      const response = await autoReceive(
        year,
        trackingNumber,
        trackingType,
        documentType,
        status,
        accountType,
        privilege,
        officeCode,
        employeeNumber,
        inputParams,
      );

      if (response?.status === 'success') {
        console.log('Receive successful:', response);
        await fetchQRData(year, trackingNumber);
        setModalMessage(response?.message || 'Unknown error');
        setModalVisible(true);
        setModalType(true);
      } else if (response?.status === 'error') {
        console.warn('Receive failed:', response);
        setModalMessage(response?.message || 'Unknown error');
        setModalType(false);
        setModalVisible(true);
      } else {
        console.warn('Unexpected response status:', response);
        Alert.alert(
          'Warning',
          'Receive operation did not succeed. Please check the status.',
        );
        setModalType(false);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error in handleReceived:', error);
      Alert.alert(
        'Error',
        'An error occurred while processing. Please try again later.',
      );
      setModalType(false);
      setModalVisible(true);
    }
  };


  const handleRevert = async (
    year,
    trackingNumber,
    trackingType,
    documentType,
    status,
  ) => {
    try {
      const response = await revertReceived(
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

      if (response?.status === 'success') {
        console.log('Reverted successful:', response);
        // Call fetchQRData with appropriate arguments
        await fetchQRData(year, trackingNumber);
      } else {
        console.warn('Revert was not successful:', response);
        Alert.alert('Warning', 'Revert operation did not succeed.');
      }
    } catch (error) {
      console.error('Error in handleRevert:', error);
      Alert.alert(
        'Error',
        'An error occurred while processing. Please try again later.',
      );
    }
  };

  // --------- Render Item QR Manual

  const renderItem = ({ item }) => {
    const showReceivedButton = (() => {
      const isPO = item.TrackingType === 'PO';
      const isPY = item.TrackingType === 'PY';
      const isPX = item.TrackingType === 'PX';

      const validStatuses = [
        'CBO Received',
        'CBO Released',
        'Voucher Received - Inspection',
        'Voucher Received - Inventory',
        'Pending Released - CAO'
      ];

      if (isPO && item.Status === 'Supplier Conformed') {
        return true;
      }

      if (
        isPY &&
        item.Status === 'Admin Operation Received' &&
        item.OBRType === '1'
      ) {
        return true;
      }

      if (isPX && item.Status === 'Check Preparation - CTO') {
        return true;
      }

      if (validStatuses.includes(item.Status)) {
        return true;
      }

      return false;
    })();

    const showPendingButton =
      officeCode === '1031' &&
      privilege === '8' &&
      accountType === '2' &&
      item.TrackingType === 'PX' &&
      item.Status === 'Admin Received';

    const showRevertButton = (() => {
      if (item.TrackingType === 'PX') {
        if (officeCode === '1031') {
          if (
            privilege === '8' &&
            item.Status === 'Check Received - Administration'
          ) {
            return true;
          }
          if (
            privilege === '5' &&
            item.Status === 'Check Received - Operation'
          ) {
            return true;
          }
        }
      }

      if (item.TrackingType === 'PO') {
        if (officeCode === '1071') {
          if (privilege === '9' && item.Status === 'Fund Control') {
            return true;
          }
        }
      }

      if (item.TrackingType === 'PY') {
        if (officeCode === '1071') {
          if (privilege === '9' && item.Status === 'CBO Received') {
            return true;
          }
        }
      }

      return false;
    })();

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
          <Text style={styles.value} numberOfLines={2} ellipsizeMode='tail' >{item.DocumentType}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{item.Status}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{insertCommas(item.Amount)}</Text>
        </View>

        {/* <View style={styles.textRow}>
          <Text style={styles.label}>OBRType:</Text>
          <Text style={styles.value}>{item.OBRType}</Text>
        </View> */}

        <View style={{ flexDirection: 'column' }}>
          {showReceivedButton && (
            <>
              {item.Status === 'Supplier Conformed' && (
                <View
                  style={{
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center',
                  }}>
                  {item.OBR_Number && (
                    <Text
                      style={{
                        marginRight: 10, // Space between the label and the TextInput
                        color: '#000', // Label color
                        marginTop: 10,
                      }}>
                      OBR #
                    </Text>
                  )}

                  <TextInput
                    style={{
                      height: 40,
                      borderColor: '#ccc',
                      borderWidth: 1,
                      borderRadius: 4,
                      padding: 10,
                      marginTop: 10,
                      color: '#000',
                    }}
                    placeholder={'Enter OBR #'}
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    maxLength={10}
                    value={inputParams || item.OBR_Number} // Use inputParams if it exists, otherwise fallback to item.OBR_Number
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                      setInputParams(numericText); // Update inputParams state with valid numeric text
                    }}
                    editable={false} // Always make the TextInput editable
                  />
                </View>
              )}
              {/* Received Button */}
              <TouchableOpacity
                /*  value={
                      inputParams === '' || inputParams === null
                        ? item.OBR_Number
                        : inputParams
                    }  */
                style={{
                  flex: 1,
                  marginTop: 20,
                  backgroundColor: isLoading ? '#ccc' : '#007bff',
                  padding: 10,
                  margin: 5,
                  borderRadius: 4,
                  shadowColor: '#000', // Shadow color for iOS
                  shadowOffset: { width: 0, height: 2 }, // Offset for iOS
                  shadowOpacity: 0.25, // Opacity for iOS shadow
                  shadowRadius: 3.84, // Blur radius for iOS
                  elevation: 5, // Shadow for Android
                }}
                onPress={() => {
                  /*  if (item.TrackingType === 'PY') {
      if (officeCode === '1071' && privilege === '9') {
      }
    } */
                  if (item.TrackingType === 'PO') {
                    if (officeCode === '1071' && privilege === '9') {
                      if (item.Status === 'Supplier Conformed') {
                        if (!item.OBR_Number || item.OBR_Number.trim() === '') {
                          if (inputParams === '') {
                            Alert.alert(
                              'OBR Number Required',
                              'Please enter a valid OBR number.',
                            );
                            return; // Exit early if no OBR_Number or inputParams
                          }
                        }
                      }
                    }
                  }

                  // Call handleReceived if all conditions pass
                  handleReceived(
                    item.Year,
                    item.TrackingNumber,
                    item.TrackingType,
                    item.DocumentType,
                    item.Status,
                    inputParams,
                  );
                }}
                disabled={isLoading}>
                <View>
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Received</Text>
                  )}
                </View>
              </TouchableOpacity>
              {/* if (item.Status === 'Admin Operation Received') {
          if (inputParams === '') {
            Alert.alert(
              'OBR Number Required',
              'Please enter a valid OBR number.'
            );
            return; // Exit early if no inputParams
          }
        } 
         
          if {
          Alert.alert(
            'Action Restricted',
            'You do not have permission to perform this action.'
          );
          return; // Exit if status is not valid
        }*/}
            </>
          )}

          {showRevertButton && (
            <TouchableOpacity
              style={{
                flex: 1,
                marginTop: 20,
                backgroundColor: 'orange',
                padding: 10,
                margin: 5,
                borderRadius: 4,
              }}
              onPress={() =>
                handleRevert(
                  item.Year,
                  item.TrackingNumber,
                  item.TrackingType,
                  item.DocumentType,
                  item.Status,
                )
              }
              disabled={isLoading}>
              <View>
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Revert</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/*        {showPendingButton && (
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
          )} */}
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

  const handleSheetChange = useCallback(index => {
    // handle new index
  }, []);

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
    { videoResolution: { width: 1280, height: 720 } },
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

      // Check if the code has already been scanned
      /*    if (scannedCodes.includes(scannedCode)) {
        //setCameraIsActive(false); // Deactivate the camera
          Alert.alert(
            'Code Already Scanned',
            'The QR code has already been scanned.',
            [
              {
                text: 'Scan Again',
                onPress: () => setCameraIsActive(true), // Reactivate the camera to scan again
              },
            ]
          );
          return;
      } */

      try {
        // Decrypt and extract the year and tracking number
        const result = decryptScannedCode(scannedCode);
        const [year, ...trackingParts] = result.split('-');
        const trackingNumber = trackingParts.join('-');

        // Validate the year and tracking number
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


        if (!data?.length) {
          // Handle invalid QR code
          setCameraIsActive(false); // Deactivate the camera
          Alert.alert(
            'Invalid QR Code',
            'The QR code you scanned is not valid.',
            [
              {
                text: 'Scan Again',
                onPress: () => setCameraIsActive(true), // Reactivate the camera to scan again
              },
            ],
          );
          return;
        }

        // Process the valid data
        console.log('QR Data:', data);

        // Mark the code as scanned
        setScannedCodes(prev => [...prev, scannedCode]);
        setCameraIsActive(false);
      } catch (error) {
        console.error('Error fetching QR data:', error);
        Alert.alert(
          'Error',
          'Something went wrong while fetching the QR data.',
        );
      }
    },
  });

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          paddingBottom: 5,
          // shadowColor: '#000',
          // shadowOffset: { width: 0, height: 2 },
          // shadowOpacity: 0.2,
          // shadowRadius: 3,
          zIndex: 1,
          width: '100%',
          //elevation: 3,
        }}>
        <Pressable
          style={({ pressed }) => [
            pressed && { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
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
            fontFamily: 'Inter_24pt-Bold',
          }}>
          Search via QR Code
        </Text>
      </View>

      <View style={styles.cameraPreview}>
        {/*<View style={{zIndex: 1, top: -300}}>
          <Text style={{color: 'gray', fontWeight: 'bold', fontSize: 20}}>
            Scan QR
          </Text>
        </View>*/}
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
            isActive={cameraIsActive}
            videoStabilization={true}
            cameraOptions={{ focusDepth: 0.5, exposureCompensation: 0.5 }}
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

      <View>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 20,
                width: '80%',
              }}>
              <Image
                source={
                  modalType
                    ? require('./../../../assets/images/successState.png')
                    : require('./../../../assets/images/errorState.png')
                }
                style={{
                  width: 200,
                  height: 160,
                  alignSelf: 'center',
                  marginBottom: 10,
                }}
              />

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  textAlign: 'center',
                  marginVertical: 15,
                }}>
                {modalMessage}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: '#007bff', // Button background color
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  marginTop: 10,
                  alignItems: 'center', // Center the text
                  justifyContent: 'center', // Center the text
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: 'Inter_28pt-Bold',
                  }}>
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>

      {qrData && qrData.length > 0 && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
        >

          <View style={styles.bottomSheetContent}>
            <ImageBackground style={{ flex: 1 }} source={require('../../../assets/images/docmobileBG.png')}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  // borderBottomWidth: 1,
                  // borderBottomColor: '#ddd',
                }}>
                <View
                  style={{
                    flex: 1, // Take available space
                    flexDirection: 'row',
                    justifyContent: 'flex-end', // Align to the right
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      bottomSheetRef.current?.close();
                      setCameraIsActive(true);
                    }}
                    style={{
                      padding: 5,
                      borderColor: 'gray',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Icon
                      name="backspace-outline"
                      size={22}
                      // color={'#252525'}
                      color={'#fff'}
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Inter_28pt-Bold',
                        // color: '#252525',
                        color: '#fff',
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>


                </View>
              </View>

              <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
                <BottomSheetFlatList // Use regular FlatList here
                  data={qrData}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.bottomSheetList}
                />
              </View>

            </ImageBackground>

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
    //backgroundColor: 'black',
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
    shadowOffset: { width: 0, height: 2 },
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
    fontFamily: 'Inter_28pt-Bold',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 0,
    justifyContent: 'center'
    // width: '100%',
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
    width: '55%',
    fontSize: 13,
    fontFamily: 'Inter_28pt-Regular',
    textAlign: 'right',
    color: 'silver',

  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    width: '100%',
    color: '#252525',
    marginStart: 10,
  },
  cameraPreview: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
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
  animationContainer: { alignItems: 'center', marginTop: 10 },
  lottie: { width: 50, height: 50 },
  loadingContainer: {
    zIndex: 1,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingIndicator: {
    top: -150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default QRManual;
