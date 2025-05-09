import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Button,
  Keyboard,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
//import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useEvaluateData} from '../../hooks/useEvaluateData';
import {useQueryClient} from '@tanstack/react-query';
import {Dropdown} from 'react-native-element-dropdown';
import {useEvaluate} from '../../hooks/useEvaluate';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import {insertCommas} from '../../utils/insertComma';
import {useEvaluateRevert} from '../../hooks/useEvaluateRevert';
import EvaluationList from '../../components/EvaluationList';

const {width, height} = Dimensions.get('window');

const currentYear = new Date().getFullYear().toString();

const YearDropdown = ({selectedYear, setSelectedYear}) => {
  const years = Array.from(
    {length: Math.max(0, currentYear - 2023 + 1)},
    (_, index) => ({
      label: `${currentYear - index}`,
      value: currentYear - index,
    }),
  );

  return (
    <View
      style={{
        position: 'relative',
        zIndex: 1,
        //borderWidth: 1,
        borderColor: 'silver',
        borderRadius: 5,
      }}>
      <Dropdown
        style={[styles.dropdown, {elevation: 10}]}
        data={years}
        labelField="label"
        valueField="value"
        placeholder={`${selectedYear}`}
        selectedTextStyle={{color: '#252525'}}
        placeholderStyle={{color: '#252525'}}
        icon={null} // Removes the icon
        value={selectedYear}
        onChange={item => {
          setSelectedYear(item.value);
        }}
      />
    </View>
  );
};

const EvaluateScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');

  const [showSearchBar, setShowSearchBar] = useState(false);

  const [showScanner, setShowScanner] = useState(false);
  const devices = useCameraDevice();
  const cameraDevice = useCameraDevice('back');
  const cameraRef = useRef(null);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [cameraIsActive, setCameraIsActive] = useState(false);
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  //const [selectedYear, setSelectedYear] = useState('2024');
  const [shouldFetch, setShouldFetch] = useState(false);

  const {data, isLoading, isError, refetch} = useEvaluateData(
    selectedYear,
    searchText,
    shouldFetch,
  );

  const {
    mutate: evaluate,
    isLoading: evaluatingLoading,
    isError: evaluatingError,
    isSuccess: evaluatingSuccess,
  } = useEvaluate();
  const {
    mutate: revert,
    isLoading: revertLoading,
    isError: revertError,
    isSuccess: revertSuccess,
  } = useEvaluateRevert();

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data?.results?.length === 0) {
      triggerShakeAnimation();
    }
  }, [data?.results]);

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

  /*   useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]); */

  const handleScanQR = scannedData => {
    if (!hasPermission) {
      requestPermission();
      return; // Exit function if permission is not granted
    }

    setShowScanner(true);

    if (scannedData) {
      setSearchQuery(scannedData);
      Alert.alert('QR Scanned', `Tracking Number: ${scannedData}`);
    }
  };

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
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        const qrCodeValue = codes[0].value.trim(); // Trim whitespace

        if (qrCodeValue.length >= 3) {
          try {
            // Correctly pass qrCodeValue to decryptScannedCode
            const result = decryptScannedCode(qrCodeValue);
            const [year, ...trackingParts] = result.split('-');
            const trackingNumber = trackingParts.join('-');

            // Validate year and tracking number
            const isValidYear =
              /^\d{4}$/.test(year) &&
              parseInt(year) >= 2024 &&
              parseInt(year) <= 2025;
            const isValidTrackingNumber =
              trackingNumber.startsWith('PR-') || trackingNumber.includes('-');

            if (!isValidYear || !isValidTrackingNumber) {
              ToastAndroid.show(
                'Please scan a valid QR code.',
                ToastAndroid.SHORT,
              );
              return;
            }

            // Set the search query
            setSearchQuery(result);
            setSearchText(result);
            setShouldFetch(false);

            setTimeout(() => {
              setShouldFetch(true);
              queryClient.invalidateQueries(['evaluateData']);
            }, 0);

            setShowScanner(false);
          } catch (error) {
            ToastAndroid.show('Invalid QR code scanned.', ToastAndroid.SHORT);
          }
        } else {
          Alert.alert(
            'Search Error',
            'Tracking Number must be at least 3 characters long.',
          );
        }
      }
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    setShouldFetch(false); // Temporarily disable fetching
    setTimeout(() => {
      setShouldFetch(true); // Re-enable fetching
      setRefreshing(false);
    }, 0);
  };

  const handleOnEvaluation = item => {
    Alert.alert('On Evaluation', `Tracking Number ${item.TrackingNumber}?`, [
      {
        text: 'OK',
        onPress: () => {
          evaluate(item, {
            onSuccess: () => {
              setShouldFetch(true);
              queryClient.invalidateQueries(['evaluateData']);

              showMessage({
                message: 'Evaluation Successful!',
                description: 'The evaluation has been processed successfully.',
                type: 'success',
              });
            },
            onError: error => {
              console.error('Evaluation failed:', error);

              showMessage({
                message: 'Evaluation Failed',
                description:
                  error.message || 'Something went wrong during evaluation.',
                type: 'danger',
              });
            },
          });
        },
      },
      {text: 'Cancel'},
    ]);
  };

  const handleEvaluated = item => {
    Alert.alert('Evaluate', `Tracking Number ${item.TrackingNumber}?`, [
      {
        text: 'OK',
        onPress: () => {
          evaluate(item, {
            onSuccess: () => {
              setShouldFetch(true); // Re-enable fetching
              queryClient.invalidateQueries(['evaluateData']); // Force refetch of evaluateData

              // Show success flash message
              showMessage({
                message: 'Evaluation Successful!',
                description: 'The evaluation has been processed successfully.',
                type: 'success',
              });
            },
            onError: error => {
              console.error('Evaluation failed:', error);

              // Show error flash message
              showMessage({
                message: 'Evaluation Failed',
                description:
                  error.message || 'Something went wrong during evaluation.',
                type: 'danger',
              });
            },
          });
        },
      },
      {text: 'Cancel'},
    ]);
  };

  const handleRevert = item => {
    Alert.alert('Revert', `Tracking Number ${item.TrackingNumber}?`, [
      {
        text: 'OK',
        onPress: () => {
          revert(item, {
            onSuccess: () => {
              setShouldFetch(true);
              queryClient.invalidateQueries(['evaluateData']);

              showMessage({
                message: 'Evaluation Successful!',
                description: 'The evaluation has been processed successfully.',
                type: 'success',
              });
            },
            onError: error => {
              console.error('Evaluation failed:', error);

              showMessage({
                message: 'Evaluation Failed',
                description:
                  error.message || 'Something went wrong during evaluation.',
                type: 'danger',
              });
            },
          });
        },
      },
      {text: 'Cancel'},
    ]);
  };

  const onPressItem = useCallback(
    (index) => {
      if (!data || !data.results || !data.results[index]) return;
      navigation.navigate('Detail', { selectedItem: data.results[index] });
    },
    [navigation, data]
  );
  

  const handleSearch = () => {
    Keyboard.dismiss();
    if (searchQuery.trim().length >= 3) {
      setSearchText(searchQuery);
      setShouldFetch(false);
      setTimeout(() => {
        setShouldFetch(true);
        queryClient.invalidateQueries(['evaluateData']);
      }, 0);
    } else {
      showMessage({
        message: 'Search Error',
        description: 'Tracking Number must be at least 3 characters long.',
        type: 'danger',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <FlashMessage position="top" /> */}
      {/*  <StatusBar barStyle="dark-content" backgroundColor="#ffffff" /> */}
      <ImageBackground
        source={require('../../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            //android_ripple={{color: 'red'}}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.title}>Evaluate</Text>

          <View style={{width: 40, alignItems: 'flex-end', marginEnd: 10}}>
            {!showSearchBar && (
              <Pressable
                style={[
                  styles.scanButton,
                  showSearchBar && styles.scanButtonActive,
                ]}
                onPress={async () => {
                  if (!hasPermission) {
                    const granted = await requestPermission();
                    if (granted) {
                      setShowScanner(true);
                    }
                  } else {
                    setShowScanner(true);
                  }
                }}>
                <Icon name="scan-outline" size={24} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      </ImageBackground>

      {!showSearchBar && (
        <View>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <YearDropdown
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
              <View style={styles.container}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by TN"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="characters"
                  //autoFocus={true}
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch} // Trigger search on keyboard button
                />
              </View>
              <TouchableOpacity
                style={styles.searchButton} // Custom style for the button
                onPress={handleSearch}>
                <Icon
                  name="search" // Icon name (you can choose any other icon)
                  size={20} // Icon size
                  color="#fff" // Icon color (white)
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052e3" />
          <Text>Searching...</Text>
        </View>
      ) : data?.results?.length > 0 ? (
        <FlatList
          contentContainerStyle={{paddingVertical: 10}}
          data={data?.results || []}
          keyExtractor={(item, index) =>
            item && item.Id ? item.Id.toString() : index.toString()
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={{backgroundColor: '#F5F7FA', borderRadius: 5}}>
              <View style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={{fontSize: 16, color: 'gray'}}>
                    No Results Found
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({item, index}) => (
            <EvaluationList
              item={item}
              index={index}
              onPressItem={onPressItem}
              handleOnEvaluation={handleOnEvaluation}
              handleEvaluated={handleEvaluated}
              handleRevert={handleRevert}
            />
          )}
        />
      ) : (
        <View
          style={{
            backgroundColor: '#F5F7FA',
            borderRadius: 5,
            paddingTop: 10,
            flex: 1,
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFF',
              padding: 16,
              marginHorizontal: 10,
              borderRadius: 8,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
              //elevation: 1,
              //borderBottomWidth: 1,
              borderBottomColor: 'silver',
              //borderRightWidth: 1,
              borderRightColor: 'silver',
            }}>
            <Animated.View // Apply the shake animation to this View
              style={[
                styles.errorContainer,
                {transform: [{translateX: shakeAnimation}]},
              ]}>
              <Text
                style={{
                  fontSize: 14,
                  fontStyle: 'italic',
                  fontFamily: 'Inter_28pt-Regular',
                  color: 'gray',
                }}>
                No Results Found
              </Text>
            </Animated.View>
          </View>
        </View>
      )}

      <Modal visible={showScanner} animationType="slide" transparent={true}>
        <View style={styles.scannerContainer}>
          {cameraDevice ? (
            <Camera
              ref={cameraRef}
              device={cameraDevice}
              style={styles.camera}
              isActive={showScanner}
              codeScanner={codeScanner}>
              {/* QR Code Scanner Frame */}
              <View style={styles.overlay}>
                <View style={styles.scannerFrame}>
                  {/* Top-left */}
                  <View style={[styles.corner, styles.topLeft]} />
                  {/* Top-right */}
                  <View style={[styles.corner, styles.topRight]} />
                  {/* Bottom-left */}
                  <View style={[styles.corner, styles.bottomLeft]} />
                  {/* Bottom-right */}
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
            </Camera>
          ) : (
            <Text style={styles.noCameraText}>No Camera Found</Text>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowScanner(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 4, // Shadow effect
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  scanButton: {
    padding: 8,
    borderRadius: 20,
  },
  scanButtonActive: {
    backgroundColor: '#007bff',
  },
  searchContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F6',
    borderRadius: 8,
    //paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A508C',
    marginBottom: 6,
  },
  cardInfo: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    marginVertical: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontFamily: 'Inter_28pt-ExtraLight',
    flex: 0.3, // Label takes 30% width,
    textAlign: 'right',
    //backgroundColor:'red'
  },
  cardValue: {
    paddingStart: 10,
    fontSize: 14,
    color: '#252525',
    fontFamily: 'Inter_28pt-SemiBold',
    flex: 0.7,
    //backgroundColor:'blue'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  evaluateButton: {
    flex: 1,
    backgroundColor: 'rgb(80, 161, 247)',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    borderBottomWidth: 2,
    borderColor: 'silver',
    borderRightWidth: 2,
    borderRightColor: 'silver',
  },
  revertButton: {
    flex: 1,
    backgroundColor: '#E6EDF1',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    borderBottomWidth: 2,
    borderColor: 'silver',
    borderRightWidth: 2,
    borderRightColor: 'silver',
  },

  pendingButton: {
    flex: 1,
    backgroundColor: 'rgb(255, 109, 73)',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    borderBottomWidth: 2,
    borderColor: 'silver',
    borderRightWidth: 2,
    borderRightColor: 'silver',
  },
  evaluateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonText: {
    //color: '#252525',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanButton: {},
  scannerContainer: {flex: 1},
  camera: {flex: 1},
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  closeText: {color: '#fff', fontSize: 16},
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: 'white',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 10,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 10,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  noCameraText: {
    color: 'white',
    fontSize: 18,
  },
  dropdown: {
    width: 80,
    height: 40,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent background to indicate loading
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchButton: {
    backgroundColor: '#2196F3', // Change to your preferred color
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EvaluateScreen;
