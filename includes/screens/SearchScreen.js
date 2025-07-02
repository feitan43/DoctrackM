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
import QRScanner from '../utils/qrScanner'; // Import the QRScanner
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

const RenderSearchList = memo(({item, index, onPressItem}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => onPressItem(index, item)}
        style={styles.touchable}>
        <View style={styles.headerContainer}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <LinearGradient
            colors={['#0074FF', '#005BBF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.trackingNumberGradient}>
            <Text style={styles.trackingNumberText}>
              {item.Year} | {item.TrackingNumber || 'N/A'}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.statusText}>{item.Status || 'N/A'}</Text>
          <Text style={styles.dateModifiedText}>
            {item.DateModified || 'N/A'}
          </Text>
          <Text style={styles.detailText}>{item.DocumentType || 'N/A'}</Text>
          {/*  <Text style={styles.detailText}>
            {item.Amount ? `Amount: ${item.Amount}` : 'N/A'}
          </Text>
          <Text style={styles.detailText}>
            {item.PeriodMonth ? `Period: ${item.PeriodMonth}` : 'N/A'}
          </Text> */}
        </View>
      </TouchableOpacity>
    </View>
  );
});

const STORAGE_KEY = '@search_history';

const SearchScreen = ({caoReceiver, cboReceiver}) => {
  const currentYear = new Date().getFullYear().toString();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const years = Array.from(
    {length: Math.max(0, currentYear - 2023 + 1)},
    (_, index) => ({
      label: `${currentYear - index}`,
      value: currentYear - index,
    }),
  );

  const [searchText, setSearchText] = useState(selectedSearch);
  const [selectedSearch, setSelectedSearch] = useState('');
  const [selectedView, setSelectedView] = useState('DocumentSearch');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState(false);

  const [dataError, setDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showScanner, setShowScanner] = useState(false); // State for QR Scanner visibility

  const {
    searchTrackData,
    setSearchTrackData,
    searchTrackLoading,
    error,
    fetchDataSearchTrack,
    fetchDataSearchPayroll,
  } = useSearchTrack(searchText, selectedYear, search);
  const cameraPermission = useCameraPermission();

  useEffect(() => {
    // Get the current year
    const currentYear = new Date().getFullYear();
    const startYear = 2023; // Your desired starting year

    const years = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year.toString()); // Convert to string for consistency with 'All Years'
    }
    setAvailableYears(years);
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
        // ✅ Add to history only on successful fetch
        addSearchItem(keyword);
        setSearchHistory(prev => {
          const newHistory = [
            keyword,
            ...prev.filter(item => item !== keyword),
          ];
          return newHistory.slice(0, 5);
        });

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
        console.log('No unique results found for the search.');
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

  const renderData = () => {
    if (dataError) {
      return (
        <View
          style={{
            flex: 1,
            // backgroundColor: 'rgba(255,255,255,0.2)',
          }}>
          <Animated.View // Apply the shake animation to this View
            style={[
              styles.errorContainer,
              {transform: [{translateX: shakeAnimation}]},
            ]}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        </View>
      );
    }
    if (searchTrackLoading) {
      return (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="rgba(0, 116, 255, 0.7)" />
        </View>
      );
    }
    if (error) {
      return <Text style={styles.errorText}>Error loading data: {error}</Text>;
    }

    const renderFlatList = data => (
      <FlatList
        data={data}
        renderItem={({item, index}) => (
          <RenderSearchList
            item={item}
            index={index}
            onPressItem={onPressItem}
          />
        )}
        keyExtractor={item => item.TrackingNumber}
      />
    );

    if (searchTrackData?.results?.length > 0 && searchTrackData.count > 2) {
      return renderFlatList(searchTrackData.results);
    }

    return null;
  };

  const openYearModal = () => setModalVisible(true);
  const closeYearModal = () => setModalVisible(false);

  const selectYear = year => {
    setSelectedYear(year);
    closeYearModal();
    closeMenu();
  };

  const handleSearchTextChange = text => {
    setSearchText(text.toUpperCase()); // Convert to uppercase here
  };
  const searchInputRef = useRef(null);

  const renderYearItem = ({item}) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectYear(item)}>
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSearch = () => (
    <View
      style={{
        margin: 5,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderColor: '#eee',
      }}>
      <View
        style={{
          marginTop: 10,
          paddingStart: 10,
          marginHorizontal: 5,
          marginBottom: 10,
          alignItems: 'flex-start',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 25,
            width: '100%',
          }}>
          <View>
            <Text
              style={{
                fontFamily: 'Inter_24pt-Bold',
                fontSize: 26,
                color: '#252525',
              }}>
              Search
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10,
            }}>
            <TouchableOpacity
              onPress={handlePresentYearFilterSheet}
              style={[
                styles.filterIconButton,
                {backgroundColor: 'transparent', elevation: 0, borderWidth: 0},
              ]}
              //disabled={isSearching}
            >
              <Text style={{fontSize: 16, fontWeight: '600', color: '#007AFF', }}>
                {selectedYear}
              </Text>
              <Icon name="filter-outline" size={24} color="#252525" />

              {/* <Text style={{color: '#fff', fontSize:12, fontWeight:'bold', }}>{selectedYear}</Text>
              <Icon name='close' size={24} color="#fff" /> */}

              {/*  {isSearching ? (
                        <ActivityIndicator size="small" color="#FFFFFF" /> // Color matches your button background
                      ) : (
                        <Icon name="search" size={24} color="#fff" />
                      )} */}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{paddingTop: 10}}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            {/* <Icon
                        name="search-outline"
                        size={25}
                        color={styles.searchIcon.color}
                        style={styles.searchIcon}
                      /> */}
            <TextInput
              style={styles.searchInput}
              placeholder="Tracking Number"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              autoCapitalize="characters"
              onChangeText={setSearchText}
              accessibilityHint="Type to search for inventory items by tracking number."
              //onEndEditing={handleSearch}
              onSubmitEditing={searchTrackingNumber}
              // editable={searchTrackLoading}
            />
            {searchText?.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearSearchButton}
                accessibilityLabel="Clear search query">
                <Icon
                  name="close-circle"
                  size={20}
                  color={styles.searchIcon.color}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* New Filter Icon Button */}
          {/*  <TouchableOpacity
                              onPress={handlePresentSystemFilterModalPress}
                              style={styles.filterIconButton}>
                              <Icon name="filter" size={24} color="#1a508c" />
                            </TouchableOpacity> */}
          <TouchableOpacity
            onPress={searchTrackingNumber}
            style={styles.filterIconButton} // Uses your existing style
            disabled={searchTrackLoading}>
            {/*  <Icon name="search" size={24} color="#fff" /> */}
            {searchTrackLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" /> // Color matches your button background
            ) : (
              <Icon name="search" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            //justifyContent: '',
            //backgroundColor:'red',
            paddingHorizontal: 20,
            width: '70%',
            marginBottom: 20,
            marginStart: 5,
          }}
          onPress={() => setShowScanner(true)} // Open scanner on press
        >
          <Icons name="qrcode-scan" size={26} color="#252525" />
          <Text style={{fontSize: 14, fontWeight: '400', marginLeft: 5}}>
            Search via QR
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{paddingVertical: 20}}>{renderData()}</View>
    </View>
  );

  const renderReceive = () => (
    <View
      style={{
        margin: 5,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderColor: '#eee',
      }}>
      <View
        style={{
          marginTop: 10,
          paddingStart: 10,
          marginHorizontal: 5,
          marginBottom: 10,
          alignItems: 'flex-start',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 25,
            width: '100%',
          }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
              width: '100%',
            }}>
            <Text
              style={{
                fontFamily: 'Inter_24pt-Bold',
                fontSize: 26,
                color: '#252525',
              }}>
              Receive
            </Text>
          </View>

          {/*   <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10,
            }}>
            <TouchableOpacity
              onPress={searchTrackingNumber}
              style={styles.filterIconButton}
              //disabled={isSearching}
            >
              <Icon name="filter-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View> */}
        </View>
      </View>

      <View style={{paddingTop: 0}}>
        {/*  <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tracking Number"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              autoCapitalize="characters"
              onChangeText={setSearchText}
              accessibilityHint="Type to search for inventory items by tracking number."
              //onEndEditing={handleSearch}
              onSubmitEditing={searchTrackingNumber}
              // editable={!isSearching}
            />
            {searchText?.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearSearchButton}
                accessibilityLabel="Clear search query">
                <Icon
                  name="close-circle"
                  size={20}
                  color={styles.searchIcon.color}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={searchTrackingNumber}
            style={styles.filterIconButton}
          >
            <Icon name="search" size={24} color="#fff" />
          
          </TouchableOpacity>
        </View> */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: 20,
          }}>
          <TouchableOpacity
            onPress={handleQRManual}
            style={{flexDirection: 'row', alignItems: 'center', padding: 5}}>
            <Icons name="qrcode-scan" size={26} color="#252525" />
            <Text style={{fontSize: 14, fontWeight: '400', marginLeft: 5}}>
              Manual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleQRAuto}
            style={{flexDirection: 'row', alignItems: 'center', padding: 5}}>
            <Icons name="qrcode-scan" size={26} color="#252525" />
            <Text style={{fontSize: 14, fontWeight: '400', marginLeft: 5}}>
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEvaluator = () => (
    <View
      style={{
        margin: 10,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderColor: '#eee',
      }}>
      <View
        style={{
          marginTop: 10,
          paddingStart: 10,
          marginHorizontal: 5,
          marginBottom: 10,
          alignItems: 'flex-start',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 25,
            width: '100%',
          }}>
          <View>
            <Text
              style={{
                fontFamily: 'Inter_24pt-Bold',
                fontSize: 28,
                color: '#252525',
              }}>
              Evaluate
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10,
            }}>
            <TouchableOpacity
              onPress={searchTrackingNumber}
              style={styles.filterIconButton}
              //disabled={isSearching}
            >
              <Icon name="filter-outline" size={24} color="#fff" />
              {/*  {isSearching ? (
                        <ActivityIndicator size="small" color="#FFFFFF" /> // Color matches your button background
                      ) : (
                        <Icon name="search" size={24} color="#fff" />
                      )} */}
            </TouchableOpacity>
            {(caoReceiver === '1' || cboReceiver === '1') && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Receiver')}
                style={{marginLeft: 10}}>
                <Icons name="qrcode-scan" size={40} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={{paddingTop: 10}}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            {/* <Icon
                        name="search-outline"
                        size={25}
                        color={styles.searchIcon.color}
                        style={styles.searchIcon}
                      /> */}
            <TextInput
              style={styles.searchInput}
              placeholder="Tracking Number"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              autoCapitalize="characters"
              onChangeText={setSearchText}
              accessibilityHint="Type to search for inventory items by tracking number."
              //onEndEditing={handleSearch}
              onSubmitEditing={searchTrackingNumber}
              // editable={!isSearching}
            />
            {searchText?.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearSearchButton}
                accessibilityLabel="Clear search query">
                <Icon
                  name="close-circle"
                  size={20}
                  color={styles.searchIcon.color}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* New Filter Icon Button */}
          {/*  <TouchableOpacity
                              onPress={handlePresentSystemFilterModalPress}
                              style={styles.filterIconButton}>
                              <Icon name="filter" size={24} color="#1a508c" />
                            </TouchableOpacity> */}
          <TouchableOpacity
            onPress={searchTrackingNumber}
            style={styles.filterIconButton} // Uses your existing style
            //disabled={isSearching}
          >
            <Icon name="search" size={24} color="#fff" />
            {/*  {isSearching ? (
                        <ActivityIndicator size="small" color="#FFFFFF" /> // Color matches your button background
                      ) : (
                        <Icon name="search" size={24} color="#fff" />
                      )} */}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <Icons name="qrcode-scan" size={26} color="#252525" />
          <Text style={{fontSize: 14, fontWeight: '400', marginLeft: 5}}>
            Scan using QR
          </Text>
        </View>
      </View>
    </View>
  );

  const renderInspection = () => (
    <View
      style={{
        margin: 10,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderColor: '#eee',
      }}>
      <View
        style={{
          marginTop: 10,
          paddingStart: 10,
          marginHorizontal: 5,
          marginBottom: 10,
          alignItems: 'flex-start',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 25,
            width: '100%',
          }}>
          <View>
            <Text
              style={{
                fontFamily: 'Inter_24pt-Bold',
                fontSize: 28,
                color: '#252525',
              }}>
              Inspection
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10,
            }}>
            <TouchableOpacity
              onPress={searchTrackingNumber}
              style={styles.filterIconButton}
              //disabled={isSearching}
            >
              <Icon name="filter-outline" size={24} color="#fff" />
              {/*  {isSearching ? (
                        <ActivityIndicator size="small" color="#FFFFFF" /> // Color matches your button background
                      ) : (
                        <Icon name="search" size={24} color="#fff" />
                      )} */}
            </TouchableOpacity>
            {(caoReceiver === '1' || cboReceiver === '1') && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Receiver')}
                style={{marginLeft: 10}}>
                <Icons name="qrcode-scan" size={40} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={{paddingTop: 10}}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            {/* <Icon
                        name="search-outline"
                        size={25}
                        color={styles.searchIcon.color}
                        style={styles.searchIcon}
                      /> */}
            <TextInput
              style={styles.searchInput}
              placeholder="Tracking Number"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              autoCapitalize="characters"
              onChangeText={setSearchText}
              accessibilityHint="Type to search for inventory items by tracking number."
              //onEndEditing={handleSearch}
              onSubmitEditing={searchTrackingNumber}
              // editable={!isSearching}
            />
            {searchText?.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearSearchButton}
                accessibilityLabel="Clear search query">
                <Icon
                  name="close-circle"
                  size={20}
                  color={styles.searchIcon.color}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* New Filter Icon Button */}
          {/*  <TouchableOpacity
                              onPress={handlePresentSystemFilterModalPress}
                              style={styles.filterIconButton}>
                              <Icon name="filter" size={24} color="#1a508c" />
                            </TouchableOpacity> */}
          <TouchableOpacity
            onPress={searchTrackingNumber}
            style={styles.filterIconButton} // Uses your existing style
            //disabled={isSearching}
          >
            <Icon name="search" size={24} color="#fff" />
            {/*  {isSearching ? (
                        <ActivityIndicator size="small" color="#FFFFFF" /> // Color matches your button background
                      ) : (
                        <Icon name="search" size={24} color="#fff" />
                      )} */}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <Icons name="qrcode-scan" size={26} color="#252525" />
          <Text style={{fontSize: 14, fontWeight: '400', marginLeft: 5}}>
            Scan using QR
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/images/bgasset.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.overlay} />
        
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Main Search Section */}
          <View style={styles.mainContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Search</Text>
              <TouchableOpacity
                onPress={handlePresentYearFilterSheet}
                style={styles.yearFilterButton}>
                <Text style={styles.yearFilterText}>{selectedYear}</Text>
                <Icon name="chevron-down" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Icon
                  name="search-outline"
                  size={22}
                  color="#9CA3AF"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter tracking number"
                  placeholderTextColor="#9CA3AF"
                  value={searchText}
                  autoCapitalize="characters"
                  onChangeText={setSearchText}
                  onSubmitEditing={searchTrackingNumber}
                  returnKeyType="search"
                />
                {searchText?.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={styles.clearButton}>
                    <Icon name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={searchTrackingNumber}
                style={styles.searchButton}
                disabled={searchTrackLoading}>
                {searchTrackLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="search" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setShowScanner(true)}>
              <Icons name="qrcode-scan" size={24} color="#007AFF" />
              <Text style={styles.qrButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Results Section */}
          <View style={styles.resultsContainer}>
            {renderData()}
          </View>

          {/* Receiver Section (conditionally rendered) */}
          {caoReceiver === '1' && (
            <View style={styles.receiverContainer}>
              <Text style={styles.sectionTitle}>Document Receiver</Text>
              <View style={styles.receiverButtons}>
                <TouchableOpacity
                  style={styles.receiverButton}
                  onPress={handleQRManual}>
                  <Icons name="qrcode-scan" size={28} color="#007AFF" />
                  <Text style={styles.receiverButtonText}>Manual Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.receiverButton}
                  onPress={handleQRAuto}>
                  <Icons name="qrcode-scan" size={28} color="#007AFF" />
                  <Text style={styles.receiverButtonText}>Auto Scan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modals and Bottom Sheets */}
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
    padding: 16,
    paddingBottom: 24,
  },
  mainContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#252525',
  },
  yearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  yearFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#252525',
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    alignItems: 'stretch',
  },
  indexBadge: {
    backgroundColor: '#0074FF',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  trackingNumberGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trackingNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#252525',
    marginBottom: 4,
  },
  dateModifiedText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  receiverContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 16,
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
    color: '#007AFF',
    marginTop: 8,
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
  },
  selectedYearOptionText: {
    color: 'white',
    fontWeight: 'bold',
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
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SearchScreen;