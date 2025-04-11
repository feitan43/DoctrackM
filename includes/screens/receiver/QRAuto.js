import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Divider } from '@rneui/base';

const { width, height } = Dimensions.get('window');
const squareSize = 250;

const QRAuto = () => {
  const navigation = useNavigation();
  //const cameraPermission = useCameraPermission();
  const cameraDevice = useCameraDevice('back');
  const [cameraIsActive, setCameraIsActive] = useState(true);
  const isCameraReady = cameraDevice?.isAvailable;
  const cameraRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);

  const { qrData, setQRData, qrLoading, qrError, fetchQRData } = useGetQRData();

  const { fetchDataSearchReceiver, setSearchTNData, loading, searchTNData } =
    useSearchReceiver();

  const { autoReceive, receivingData, isLoading } = useReceiving();

  const { officeCode, privilege, accountType, employeeNumber } = useUserInfo();

  const bottomSheetRef = useRef(null);

  const snapPoints = ['46%', '70%', '80%'];

  const [showCheck, setShowCheck] = useState(true);



  const renderItem = useMemo(() => {
    return ({ item }) => (
      <View>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.itemContainer}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Year:</Text>
              <Text style={styles.value}>{item.Year}</Text>
            </View>
            <Divider
              width={1.9}
              color={'rgba(217, 217, 217, 0.1)'}
              borderStyle={'dashed'}
              marginHorizontal={10}
              marginBottom={5}
              style={{ bottom: 5 }}
            />
            <View style={styles.textRow}>
              <Text style={styles.label}>Tracking Type:</Text>
              <Text style={styles.value}>{item.TrackingType}</Text>
            </View>
            <Divider
              width={1.9}
              color={'rgba(217, 217, 217, 0.1)'}
              borderStyle={'dashed'}
              marginHorizontal={10}
              marginBottom={5}
              style={{ bottom: 5 }}
            />
            <View style={styles.textRow}>
              <Text style={styles.label}>Tracking Number:</Text>
              <Text style={styles.value}>{item.TrackingNumber}</Text>
            </View>
            <Divider
              width={1.9}
              color={'rgba(217, 217, 217, 0.1)'}
              borderStyle={'dashed'}
              marginHorizontal={10}
              marginBottom={5}
              style={{ bottom: 5 }}
            />
            <View style={styles.textRow}>
              <Text style={styles.label}>Document Type:</Text>
              <Text style={styles.value} numberOfLines={2} ellipsizeMode='tail'>
                {item.DocumentType}
              </Text>
            </View>
            <Divider
              width={1.9}
              color={'rgba(217, 217, 217, 0.1)'}
              borderStyle={'dashed'}
              marginHorizontal={10}
              marginBottom={5}
              style={{ bottom: 5 }}
            />
            <View style={styles.textRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{item.Status}</Text>
            </View>
            <Divider
              width={1.9}
              color={'rgba(217, 217, 217, 0.1)'}
              borderStyle={'dashed'}
              marginHorizontal={10}
              style={{ bottom: 5 }}
            />
            <View style={styles.textRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.value}>{insertCommas(item.Amount)}</Text>
            </View>
            <Divider
              width={1.9}
              color={'rgba(217, 217, 217, 0.1)'}
              borderStyle={'dashed'}
              marginHorizontal={10}
              style={{ bottom: 5 }}
            />
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                alignSelf: 'flex-end',
                paddingTop: 10,
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: 4,
                  flexDirection: 'row',
                  // paddingTop: 10,
                }}
                onPress={() => handleShowDetails(item.TrackingNumber, item.Year)}>
                <View>
                  <Text
                    style={{
                      color: '#fff',
                      textAlign: 'right',
                      fontSize: 14,
                    }}>
                    Show More
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={'#fff'} />
              </TouchableOpacity>
            </View>
          </View>

        </View>


      </View>
    );
  }, []);

  const handleSheetChange = useCallback(index => { }, []);

  const handleShowDetails = async (trackingNumber, year) => {
    const data = await fetchDataSearchReceiver(trackingNumber, year);
    console.log("Fetched Data:", data);
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
          ToastAndroid.show(
            'No data received or data is not in the expected format.',
            ToastAndroid.SHORT,
          );
          return;
        }

        const qrData = data[0];
        const { TrackingType, Status, DocumentType, Fund } = qrData;

        const isEligibleForReceive = (() => {
          if (TrackingType === 'PY') {
            if (['CBO Released', 'Pending Released - CAO', 'CBO Received'].includes(Status))
              return true;
            if (
              Status === 'Encoded' &&
              ['Liquidation', 'Remitance - HDMF'].includes(DocumentType) &&
              Fund === 'Trust Fund'
            ) return true;
          }

          if (TrackingType === 'PX') {
            if (['Voucher Received - Inspection', 'Voucher Received - Inventory', 'Pending Released - CAO'].includes(Status))
              return true;
          }

          if (TrackingType === 'IP') {
            if (['Pending Released - CAO', 'Encoded'].includes(Status))
              return true;
          }


          return false;
        })();

        if (!isEligibleForReceive) {
          ToastAndroid.show(
            `Document is not eligible for auto-receive. (${Status})`,
            ToastAndroid.SHORT
          );
          return;
        }

        const receiveResponse = await autoReceive({
          year,
          trackingNumber,
          trackingType: TrackingType,
          documentType: DocumentType,
          status: Status,
          accountType,
          privilege,
          officeCode,
          inputParams: '',
        });

        try {
          const latestData = await fetchQRData(year, trackingNumber);

          if (
            receiveResponse?.status === 'error' &&
            latestData?.[0]?.Status === 'Admin Received'
          ) {
            ToastAndroid.show('Already Received.', ToastAndroid.SHORT);
            return;
          }
        } catch (error) {
          console.error('Error fetching QR data after autoReceive:', error);
          ToastAndroid.show(
            'An error occurred. Please try again.',
            ToastAndroid.SHORT,
          );
        }

        setScannedCodes(prev => [...prev, result]);
        setCameraIsActive(false);
      } catch (error) {
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
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}></View>
      </View>

      <View style={styles.cameraPreview}>
        {/* <View style={{ zIndex: 1, top: -300 }}>
          <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 20 }}>
            Scan QR
          </Text>
        </View> */}

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

      {receivingData /* && qrData.Status === 'Check Preparation - CTO' */ && (
        /*  qrData.length > 0 && */ <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChange}>
          <View style={styles.bottomSheetContent}>
            <ImageBackground style={{ flex: 1 }} source={require('../../../assets/images/docmobileBG.png')}>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 10,
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
                  }}>
                  <Icon
                    name="backspace-outline"
                    size={22}
                    color={'#fff'}
                    style={{ marginRight: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Inter_28pt-Bold',
                      color: '#fff',
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>

              </View>

              <View style={{ flex: 1, paddingHorizontal: 10, }}>
                <BottomSheetFlatList
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
    //fontFamily:'Oswald-Regular'
  },
  itemContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    alignItems: 'baseline',
    paddingBottom: 10,
    // paddingStart: 10,
  },
  label: {
    width: '25%',
    color: 'white',
    paddingStart: 10,
    color: 'white',
    fontSize: 12,
    fontFamily: 'Oswald-Light',
    opacity: 0.6,
  },
  value: {
    width: '70%',
    color: 'white',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
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
  animationContainer: { alignItems: 'center', marginTop: 10 },
  lottie: { width: 50, height: 50 },
  loadingContainer: {
    zIndex: 1,
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.8)',

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
    elevation: 0,
  },
});

export default QRAuto;
