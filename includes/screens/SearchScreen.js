import React, {
  useState,
  useEffect,
  memo,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  Animated,
  Alert,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dropdown} from 'react-native-element-dropdown';
import {Menu, Divider, IconButton, PaperProvider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import useSearchTrack from '../api/useSearchTrack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  useCodeScanner,
  useCameraFormat,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';
import QRScanner from '../utils/qrScanner';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

const RenderSearchList = memo(({item, index, onPressItem}) => {
  return (
    <TouchableOpacity
      onPress={() => onPressItem(index, item)}
      style={styles.cardTouchable}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#0074FF', '#005BBF']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.cardHeader}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <Text style={styles.trackingNumberText}>
            {item.Year} | {item.TrackingNumber || 'N/A'}
          </Text>
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{item.Status || 'N/A'}</Text>
            <Text style={styles.dateModifiedText}>
              {item.DateModified || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailText}>{item.DocumentType || 'N/A'}</Text>
            {item.Amount && (
              <Text style={styles.detailText}>Amount: {item.Amount}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const STORAGE_KEY = '@search_history';

const SearchScreen = ({caoReceiver, cboReceiver, caoEvaluator}) => {
  const currentYear = new Date().getFullYear().toString();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const years = Array.from(
    {length: Math.max(0, currentYear - 2023 + 1)},
    (_, index) => ({
      label: `${currentYear - index}`,
      value: currentYear - index,
    }),
  );

  const [searchText, setSearchText] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [selectedView, setSelectedView] = useState('DocumentSearch');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState(false);

  const [dataError, setDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  const {
    searchTrackData,
    setSearchTrackData,
    searchTrackLoading,
    error,
    fetchDataSearchTrack,
  } = useSearchTrack(searchText, selectedYear, search);
  const cameraPermission = useCameraPermission();

  useEffect(() => {
    const currentYearNum = new Date().getFullYear();
    const startYear = 2023;

    const yearsArray = [];
    for (let year = startYear; year <= currentYearNum; year++) {
      yearsArray.push(year.toString());
    }
    setAvailableYears(yearsArray);
  }, []);

  const handleCloseYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.close();
  }, []);

  const [availableYears, setAvailableYears] = useState([]);

  const {hasPermission, requestPermission} = cameraPermission;

  const yearFilterBottomSheetRef = useRef(null);

  const handlePresentYearFilterSheet = useCallback(() => {
    yearFilterBottomSheetRef.current?.expand();
  }, []);

  const yearFilterSnapPoints = useMemo(() => ['25%', '50%', '75%'], []);

  const handleScanSuccess = async ({
    year: scannedYear,
    trackingNumber: scannedTrackingNumber,
  }) => {
    setShowScanner(false);
    if (scannedYear && scannedTrackingNumber) {
      setSelectedYear(scannedYear.toString());
      setSearchText(scannedTrackingNumber);
      await searchTrackingNumber(scannedTrackingNumber);
    } else {
      Alert.alert('Scan Error', 'Could not decode QR data properly.');
    }
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const getSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.log('Error retrieving search history:', error);
    }
  };

  const addSearchItem = async item => {
    const trimmedItem = item.trim();
    if (trimmedItem.length === 0) return;

    const newHistory = [
      trimmedItem,
      ...searchHistory.filter(i => i !== trimmedItem),
    ];
    const limitedHistory = newHistory.slice(0, 5);
    setSearchHistory(limitedHistory);
    await saveSearchHistory(limitedHistory);
  };

  const removeSearchItem = async item => {
    const updatedHistory = searchHistory.filter(i => i !== item);
    setSearchHistory(updatedHistory);
    await saveSearchHistory(updatedHistory);
  };

  const handleHistorySelect = async item => {
    console.log(item);
    setSearchText(item);
  };

  useEffect(() => {
    getSearchHistory();
  }, []);

  const saveSearchHistory = async newHistory => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.log('Error saving search history:', error);
    }
  };

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleQRManual = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
    navigation.navigate('QRManual');
  };

  const handleQRAuto = () => {
    navigation.navigate('QRAuto');
  };

  const navigation = useNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onPressItem = useCallback(
    (index, item) => {
      const selectedYear = item.Year;
      const trackingNumber = item.TrackingNumber;

      navigation.navigate('Detail', {
        index,
        selectedItem: {
          Year: selectedYear,
          TrackingNumber: trackingNumber,
          TrackingType: item.TrackingType,
          data: item,
        },
      });
    },
    [navigation],
  );

  const searchTrackingNumber = async keywordParam => {
    const keyword =
      typeof keywordParam === 'string' ? keywordParam : searchText;

    if (!keyword || keyword.length < 3) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage('At least 3 characters.');
      return;
    }

    const validText = /^[a-zA-Z0-9-]*$/;
    if (!validText.test(keyword)) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage(
        'Only alphanumeric characters and hyphen (-) are allowed.',
      );
      return;
    } else {
      setDataError(false);
    }

    setSearchTrackData(null);

    try {
      const data = await fetchDataSearchTrack(keyword);

      if (
        !data ||
        data.count === 0 ||
        !data.results ||
        data.results.length === 0
      ) {
        setDataError(true);
        triggerShakeAnimation();
        setErrorMessage('No results found.');
        return;
      }

      if (data.count === 1 && data.results.length > 0) {
        const trackingNumber =
          keyword.substring(4, 5) === '-' || keyword.substring(0, 3) === 'PR-'
            ? keyword
            : data.results[0].TrackingNumber;
        addSearchItem(keyword);
        setSearchModalVisible(false);
        setSearchText('');

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
        addSearchItem(keyword);
        console.log('Multiple results found for the search.');
      }

      setSearch(true);
    } catch (fetchError) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage(
        `Fetch error: ${fetchError.message || fetchError.toString()}`,
      );
      console.error(fetchError);
    }
  };

  const clearInput = () => {
    setSearchText('');
  };

  const handleForDevelopment = () => {
    Alert.alert('Notice', 'This feature is under development.');
  };

  const renderCAOReceiver = () => (
    <View style={styles.corporateReceiverContainer}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          paddingBottom: 5,
          marginBottom: 5,
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}>
        <Text style={styles.corporateSectionTitle}>CAO Receiver</Text>
        <Text style={styles.corporateSectionSubtitle}>
          Choose an action to receive documents.
        </Text>
      </View>
      <View style={styles.corporateReceiverButtons}>
        <Pressable
          style={styles.corporateReceiverButton}
          onPress={handleQRManual}
          android_ripple={{color: 'rgba(0, 122, 255, 0.1)'}}>
          <View style={styles.iconBackground}>
            <Icons name="qrcode-scan" size={28} color="#007AFF" />
          </View>
          <Text style={styles.corporateReceiverButtonText}>Manual Receive</Text>
        </Pressable>
        <Pressable
          style={styles.corporateReceiverButton}
          onPress={handleQRAuto}
          android_ripple={{color: 'rgba(0, 122, 255, 0.1)'}}>
          <View style={styles.iconBackground}>
            <Icons name="qrcode-scan" size={28} color="#007AFF" />
          </View>
          <Text style={styles.corporateReceiverButtonText}>Auto Receive</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderCBOReceiver = () => (
    <View style={styles.receiverContainer}>
      <Text style={styles.sectionTitle}>CBO Receiver</Text>
      <View style={styles.receiverButtons}>
        <TouchableOpacity
          style={styles.receiverButton}
          onPress={handleQRManual}>
          <Icons name="qrcode-scan" size={28} color="#007AFF" />
          <Text style={styles.receiverButtonText}>Manual Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.receiverButton} onPress={handleQRAuto}>
          <Icons name="qrcode-scan" size={28} color="#007AFF" />
          <Text style={styles.receiverButtonText}>Auto Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCAOEvaluator = () => (
    <View style={styles.receiverContainer}>
      <Text style={styles.sectionTitle}>CAO Evaluator</Text>
      <View style={styles.receiverButtons}>
        <TouchableOpacity
          style={styles.receiverButton}
          onPress={handleForDevelopment}>
          <Icons name="qrcode-scan" size={28} color="#007AFF" />
          <Text style={styles.receiverButtonText}>Evaluate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.receiverButton}
          onPress={handleForDevelopment}>
          <Icons name="qrcode-scan" size={28} color="#007AFF" />
          <Text style={styles.receiverButtonText}>For Evaluation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.combinedSearchInput}>
        <TouchableOpacity
          onPress={handlePresentYearFilterSheet}
          style={styles.yearDropdown}>
          <Text style={styles.yearDropdownText}>{selectedYear}</Text>
          <Icon name="chevron-down" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter tracking number"
          placeholderTextColor="#9CA3AF"
          value={searchText}
          autoCapitalize="characters"
          onChangeText={setSearchText}
          onSubmitEditing={searchTrackingNumber}
        />
        {searchText?.length > 0 ? (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.clearButton}>
            <Icon name="close-circle" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowScanner(true)}
            style={styles.scanButton}>
            <Icons name="qrcode-scan" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={searchTrackingNumber}
        disabled={searchTrackLoading}>
        {searchTrackLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon name="search" size={24} color="#fff" />
            <Text style={styles.searchButtonText}>Search</Text>
          </>
        )}
      </TouchableOpacity>

      {dataError && (
        <Animated.View
          style={[
            styles.errorContainer,
            {transform: [{translateX: shakeAnimation}]},
          ]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </Animated.View>
      )}

      {error && (
        <Text style={styles.errorText}>Error loading data: {error}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/images/bgasset.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.overlay} />

        {searchTrackData?.results?.length > 0 && searchTrackData.count > 1 ? (
          <FlatList
            data={searchTrackData.results}
            renderItem={({item, index}) => (
              <RenderSearchList
                item={item}
                index={index}
                onPressItem={onPressItem}
              />
            )}
            keyExtractor={item => item.TrackingNumber + item.Year}
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {renderListHeader()}
            {caoReceiver === '1' && renderCAOReceiver()}
          </ScrollView>
        )}

        <BottomSheet
          ref={yearFilterBottomSheetRef}
          index={-1}
          snapPoints={yearFilterSnapPoints}
          enablePanDownToClose={true}
          backdropComponent={BottomSheetBackdrop}
          handleIndicatorStyle={styles.bottomSheetHandle}>
          <BottomSheetFlatList
            data={[...availableYears]}
            keyExtractor={item => item}
            ListHeaderComponent={() => (
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.modalTitle}>Select Year</Text>
              </View>
            )}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.yearOptionButton,
                  selectedYear === item && styles.selectedYearOptionButton,
                ]}
                onPress={() => {
                  setSelectedYear(item);
                  handleCloseYearFilterSheet();
                }}>
                <Text
                  style={[
                    styles.yearOptionText,
                    selectedYear === item && styles.selectedYearOptionText,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.yearOptionsFlatListContent}
          />
        </BottomSheet>

        <Modal
          visible={showScanner}
          animationType="none"
          statusBarTranslucent={true}
          onRequestClose={handleCloseScanner}>
          <QRScanner onScan={handleScanSuccess} onClose={handleCloseScanner} />
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  scrollViewContent: {
    padding: 5,
    paddingBottom: 100,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  mainContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#a9b7c8',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal:10,
    paddingBottom:20,
    //marginHorizontal: 0,
  },
  header: {
    //borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#252525',
   // borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    borderColor: '#eee',
    fontFamily: 'Montserrat-Bold',
  },
  combinedSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5fF5F5',
    borderRadius: 12,
    marginBottom: 10,
    height: 52,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal:10
  },
  yearDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    height: '100%',
  },
  yearDropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
    marginRight: 4,
    fontFamily: 'Montserrat-SemiBold',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#252525',
    paddingHorizontal: 10,
    fontFamily: 'Montserrat-Regular',
  },
  clearButton: {
    padding: 8,
  },
  scanButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 8,
    fontFamily: 'Montserrat-Medium',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTouchable: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  indexBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  trackingNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: 'Montserrat-Bold',
  },
  cardBody: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
    fontFamily: 'Montserrat-SemiBold',
  },
  dateModifiedText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Montserrat-Regular',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Montserrat-Regular',
  },
  receiverContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 16,
    fontFamily: 'Montserrat-Bold',
  },
  receiverButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiverButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  receiverButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'gray',
    marginTop: 8,
    fontFamily: 'Montserrat-Medium',
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    fontFamily: 'Montserrat-Bold',
  },
  yearOptionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  selectedYearOptionButton: {
    backgroundColor: '#007AFF',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Montserrat-Regular',
  },
  selectedYearOptionText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  yearOptionsFlatListContent: {
    paddingBottom: 24,
  },
  bottomSheetHandle: {
    backgroundColor: '#E5E7EB',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginBottom: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  // New styles for the improved UI
  corporateReceiverContainer: {
    marginHorizontal: 0,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#a9b7c8',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    //marginHorizontal: 10,
  },
  corporateSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  corporateSectionSubtitle: {
    fontSize: 14,
    color: '#616161',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
  },
  corporateReceiverButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  corporateReceiverButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    //borderWidth: 1,
    borderColor: '#E3E9F2',
  },
  corporateReceiverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginTop: 8,
    fontFamily: 'Montserrat-SemiBold',
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchScreen;
