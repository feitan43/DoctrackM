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
              <Icon name="filter-outline" size={24} color="#252525" />
              <Text style={{fontSize: 14, fontWeight: '600', color: '#007AFF'}}>
                {selectedYear}
              </Text>
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
            justifyContent: 'center',
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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <ImageBackground
        source={require('../../assets/images/bgasset.jpg')}
        style={{flex: 1}}
        resizeMode="cover">
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <>
            {renderSearch()}
            {/* {(caoReceiver === '1' || cboReceiver === '1') && renderReceive()} */}
          </>

          {/* {caoReceiver === '1' && <>{renderReceive()}</>} */}
          {/*  {renderEvaluator()}
          {renderInspection()} */}
        </ScrollView>
        <Modal transparent={true} visible={modalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={years}
                renderItem={renderYearItem}
                keyExtractor={item => item}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeYearModal}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={searchModalVisible}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setSearchModalVisible(false)}>
          <View style={styles.safeArea}>
            <View style={styles.fullScreenModal}>
              <View style={styles.searchHeader}>
                <TouchableOpacity
                  onPress={() => setSearchModalVisible(false)}
                  style={styles.backButton}>
                  <Icon name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchInputOuterContainer}>
                  <Icon
                    name="search"
                    size={22}
                    color="#888"
                    style={styles.inputSearchIcon}
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Search tracking number"
                    value={searchText}
                    onChangeText={handleSearchTextChange}
                    // autoFocus={true} // REMOVE THIS PROP
                    clearButtonMode={
                      Platform.OS === 'ios' ? 'while-editing' : 'never'
                    } // 'never' is default on Android, 'while-editing' is useful on iOS
                    underlineColorAndroid="transparent" // Only for Android, hides the default underline
                    placeholderTextColor="#999"
                    autoCapitalize="characters" // Suggests uppercase keyboard on iOS (doesn't force on Android, so onChangeText is crucial)
                    // inputMode="search" // Modern alternative to keyboardType='default' for search fields
                    returnKeyType="search" // Changes the keyboard return key to "Search"
                  />
                  {searchText?.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchText('')}
                      style={styles.clearButton}>
                      <Icon name="close" size={22} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.searchActionButton,
                  searchText?.trim().length === 0 &&
                    styles.searchButtonDisabled,
                ]}
                onPress={searchTrackingNumber}
                disabled={searchText?.trim().length === 0 || searchTrackLoading} // Disable during loading as well
              >
                {searchTrackLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" /> // Or any color that fits your design
                ) : (
                  <Text style={styles.searchButtonText}>Search</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resultsContainer}>
                {renderData()}
                <Text>HATDOG</Text>
              </View>

              <View style={styles.contentArea}>
                {searchHistory.length > 0 && (
                  <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>Search History</Text>
                    {searchHistory.map((item, index) => (
                      <View key={index} style={styles.historyItem}>
                        <TouchableOpacity
                          onPress={() => searchTrackingNumber(item)}
                          style={styles.historyItemTextContainer}>
                          <Icon
                            name="search-outline"
                            size={20}
                            color="#555"
                            style={styles.historyItemIcon}
                          />
                          <Text style={styles.historyText} numberOfLines={1}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeSearchItem(item)}
                          style={styles.removeHistoryButton}>
                          <Icon name="close" size={20} color="#777" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {searchHistory.length === 0 &&
                  !renderData() && ( // Show if no history and no initial results
                    <Text style={styles.noHistoryText}>
                      No recent searches.
                    </Text>
                  )}
              </View>
            </View>
          </View>
        </Modal>

        <BottomSheet
          ref={yearFilterBottomSheetRef}
          index={-1}
          snapPoints={yearFilterSnapPoints}
          enablePanDownToClose={true}
          backdropComponent={BottomSheetBackdrop}
          handleIndicatorStyle={styles.bottomSheetHandle}>
          <BottomSheetFlatList
            data={[/* 'All Years', */ ...availableYears]} // 'All Years' will always be first
            keyExtractor={item => item}
            ListHeaderComponent={() => (
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.modalTitle}>Filter by Year</Text>
              </View>
            )}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.yearOptionButton,
                  (selectedYear === item ||
                    (item === 'All Years' && selectedYear === null)) &&
                    styles.selectedYearOptionButton,
                ]}
                onPress={() => {
                  setSelectedYear(item === 'All Years' ? null : item);
                  handleCloseYearFilterSheet();
                }}
                accessibilityLabel={
                  item === 'All Years'
                    ? 'Show all inventory years'
                    : `Filter by year ${item}`
                }>
                <Text
                  style={[
                    styles.yearOptionText,
                    (selectedYear === item ||
                      (item === 'All Years' && selectedYear === null)) &&
                      styles.selectedYearOptionText,
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
          onRequestClose={handleCloseScanner}>
          <QRScanner onScan={handleScanSuccess} onClose={handleCloseScanner} />
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 10,
    flexGrow: 1,
    paddingBottom: 50,
  },
  searchBarInput: {
    flex: 1,
    backgroundColor: 'rgba(245, 244, 244, 0.79)',
    flexDirection: 'row',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: 'rgba(13, 85, 199, 1)',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.01)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's on top of other components
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
  clearIconContainer: {
    padding: 10,
  },
  searchBarContainer: {
    backgroundColor: 'white',

    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: '#ffe5e5',
    borderRadius: 10,
    //borderWidth: 1,
    //borderColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    textAlign: 'center',
  },
  overlay: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    //marginTop: 20,
    //paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  dropdown: {
    width: 80,
    height: 40,
    paddingHorizontal: 10,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#fff',
  },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  backButton: {
    padding: 8,
    marginRight: 10,
  },

  backIcon: {
    fontSize: 22,
    color: '#252525',
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#252525',
    paddingVertical: 0,
  },

  clearButton: {
    marginLeft: 8,
  },

  clearIcon: {
    fontSize: 20,
    color: '#999',
  },

  searchButton: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: '#252525',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  searchButtonDisabled: {
    opacity: 0.5,
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  historyTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
  removeIcon: {
    fontSize: 18,
    color: '#f00',
    paddingHorizontal: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Modal background color
  },
  fullScreenModal: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8, // Increased touch area
    marginRight: 8,
  },
  searchInputOuterContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 25, // More rounded for modern look
    paddingHorizontal: 15,
    height: 48, // Standard height
  },
  inputSearchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10, // Ensure text is centered
  },
  clearButton: {
    padding: 8, // Increased touch area
    marginLeft: 8,
  },
  searchActionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10, // Space before history or content
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#B0C4DE',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10, // Space after search button
  },
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyItemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, // Space before the close icon
  },
  historyItemIcon: {
    marginRight: 10,
  },
  historyText: {
    fontSize: 16,
    color: '#444444',
    flexShrink: 1, // Allow text to shrink if container is too small
  },
  removeHistoryButton: {
    padding: 8, // Increased touch area
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#777777',
    fontSize: 15,
    marginTop: 40, // Give some space if no history and no initial results
  },
  resultsContainer: {
    height: 500, // If results should take remaining space and be scrollable, ensure renderData() returns a ScrollView/FlatList
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 5, // Add some horizontal margin
    marginTop: 10,
    marginBottom: 5, // Reduce bottom margin slightly
    borderRadius: 8, // Rounded corners for a softer look
    borderWidth: 1,
    borderColor: '#E0E0E0', // Lighter border color
    elevation: 3, // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  touchable: {
    padding: 0, // Remove padding from touchable, will add to inner views
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'stretch', // Stretch items to fill height
    borderTopLeftRadius: 8, // Apply radius to the top of the header
    borderTopRightRadius: 8,
    overflow: 'hidden', // Ensure children respect border radius
  },
  indexBadge: {
    backgroundColor: '#0074FF', // Primary blue for consistency
    paddingHorizontal: 12, // Adjust padding
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
  },
  indexText: {
    fontFamily: 'Oswald-Regular',
    fontSize: 14, // Slightly larger for prominence
    color: 'white',
  },
  trackingNumberGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8, // Add vertical padding
    paddingStart: 10,
  },
  trackingNumberText: {
    fontFamily: 'Oswald-Regular',
    color: 'white',
    fontSize: 16, // Consistent with index
  },
  yearBadge: {
    backgroundColor: '#0074FF', // Primary blue for consistency
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    fontFamily: 'Oswald-Regular',
    color: 'white',
    fontSize: 16, // Consistent with index
    textAlign: 'center',
  },
  detailsContainer: {
    padding: 15, // Uniform padding for details section
  },
  statusText: {
    fontFamily: 'Oswald-Regular',
    fontSize: 19, // More prominent status
    color: '#252525', // Darker text for readability
    marginBottom: 5, // Space between status and date
  },
  dateModifiedText: {
    fontFamily: 'Oswald-Light',
    color: 'gray', // Softer gray for less important info
    fontSize: 13,
    marginBottom: 10, // More space after date
  },
  detailText: {
    fontFamily: 'Oswald-Light',
    color: '#4A4A4A', // Slightly darker gray for better contrast
    fontSize: 14,
    marginBottom: 3, // Small margin for each detail line
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 15,
    marginTop: -40,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 10,
    height: 55,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 5,
    color: '#6C757D',
    padding: 5,
  },
  searchInput: {
    flex: 1,
    height: 55,
    fontSize: 15,
    color: '#343A40',
  },
  clearSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterIconButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    padding: 12, // Adjust padding to make the icon visible and clickable
    justifyContent: 'center',
    alignItems: 'center',
    height: 55, // Match height of search input
    width: 70,
  },
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 18,
  },
  filterButton: {
    backgroundColor: '#1a508c',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearYearFilter: {
    marginLeft: 8,
    padding: 2,
  },
  yearOptionsFlatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomSheetHeader: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  yearOptionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
  },
  selectedYearOptionButton: {
    backgroundColor: '#1a508c',
  },
  yearOptionText: {
    fontSize: 17,
    color: '#343A40',
    fontWeight: '500',
  },
  selectedYearOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 10,
  },
});

export default SearchScreen;
