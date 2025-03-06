import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
  Animated,
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
import {useOnEvaluation} from '../../api/useOnEvaluation';
import {useQueryClient} from '@tanstack/react-query';
import {useEvaluationByStatus} from '../../hooks/useEvaluationByStatus';
import {useEvaluate} from '../../hooks/useEvaluate';
import {showMessage} from 'react-native-flash-message';
import {insertCommas} from '../../utils/insertComma';
import EvaluationList from '../../components/EvaluationList'; // Adjust the path as necessary

const {width, height} = Dimensions.get('window');

const OnEvaluationScreen = ({route}) => {
  const {selectedYear} = route.params;
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const [showScanner, setShowScanner] = useState(false);
  const devices = useCameraDevice();
  const cameraDevice = useCameraDevice('back');
  const cameraRef = useRef(null);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [cameraIsActive, setCameraIsActive] = useState(false);
  const queryClient = useQueryClient();

  const {data, isLoading, isError, refetch} = useEvaluationByStatus(
    selectedYear,
    'On Evaluation - Accounting',
  );

  const {
    mutate: evaluate,
    isLoading: evaluatingLoading,
    isError: evaluatingError,
    isSuccess: evaluatingSuccess,
  } = useEvaluate();

  const filteredEvaluations = (data || []).filter(item =>
    item?.TrackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /*  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]); */

  const handleScanQR = scannedData => {
    setShowScanner(false); // Close scanner
    setSearchQuery(scannedData);
    Alert.alert('QR Scanned', `Tracking Number: ${scannedData}`);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        handleScanQR(codes[0].value);
      }
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    //refetch();
    queryClient.invalidateQueries({
      queryKey: ['evaluation', selectedYear, 'On Evaluation - Accounting'],
    });
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleEvaluated = item => {
    Alert.alert('Evaluate', `Tracking Number ${item.TrackingNumber}?`, [
      {
        text: 'OK',
        onPress: () => {
          evaluate(item, {
            onSuccess: () => {
              queryClient.invalidateQueries([
                'evaluation',
                selectedYear,
                'On Evaluation - Accounting',
              ]);
              setTimeout(() => {
                queryClient.refetchQueries([
                  'evaluation',
                  selectedYear,
                  'On Evaluation - Accounting',
                ]);
              }, 500);

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

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {selectedItem: data[index]});
    },
    [navigation, data],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#ffffff" /> */}

      {/* Header */}
      <ImageBackground
        source={require('../../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={{color: '#F6F6F6', borderless: true, radius: 24}}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.title}>On Evaluation</Text>

          <Pressable
            style={[
              styles.searchButton,
              showSearchBar && styles.searchButtonActive,
            ]}
            onPress={() => setShowSearchBar(!showSearchBar)}>
            <Icon
              name="search"
              size={20}
              color={showSearchBar ? '#fff' : '#fff'}
            />
          </Pressable>
        </View>
      </ImageBackground>

      {/* Search Bar */}
      {showSearchBar && (
        <View>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by TN"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
                autoFocus={true}
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            {/* <View
              style={{
                alignSelf: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingVertical: 10,
              }}>
              <TouchableOpacity
                onPress={() => setShowScanner(true)}
                style={styles.scanButton}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{}}>Scan QR</Text>
                  <Icon name="scan-outline" size={24} color="#252525" />
                </View>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      )}

      <View style={{alignSelf: 'flex-end'}}>
        {data?.length > 0 && (
          <Text style={{marginHorizontal: 10, paddingEnd: 10, paddingTop: 10}}>
            {filteredEvaluations.length} results
          </Text>
        )}
      </View>

      {isLoading || !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052e3" />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again later.
          </Text>
        </View>
      ) : data.length === 0 ? (
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
              borderBottomColor: 'silver',
            }}>
            <Image
              source={require('../../../assets/images/noresultsstate.png')}
              style={{
                width: 200,
                height: 200,
                alignSelf: 'center',
                marginBottom: 30,
              }}
            />
            <Text
              style={{
                backgroundColor: 'rgba(238, 238, 238, 0.49)',
                fontSize: 16,
                fontFamily: 'Inter_28pt-SemiBold',
                textAlign: 'center',
              }}>
              No results found.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{paddingVertical: 10}}
          data={filteredEvaluations}
          keyExtractor={(item, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({item, index}) => (
            <EvaluationList
              item={item}
              index={index}
              onPressItem={onPressItem}
              handleEvaluated={handleEvaluated}
            />
          )}
        />
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
    backgroundColor: '#1A508C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
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
    borderRadius: 50,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchButtonActive: {
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
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent background to indicate loading
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFDDC1',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OnEvaluationScreen;
