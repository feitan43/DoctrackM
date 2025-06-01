import React, {useState, useEffect, memo, useCallback, useRef} from 'react';
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
import useUserInfo from '../api/useUserInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            colors={['#0074FF', '#005BBF']} // Slightly darker blue for a more modern feel
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}} // Changed end x to 1 for a more subtle gradient
            style={styles.trackingNumberGradient}>
            <Text style={styles.trackingNumberText}>
              {item.TrackingNumber || 'N/A'}
            </Text>
          </LinearGradient>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{item.Year || 'N/A'}</Text>
          </View>
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

const SearchScreen = ({}) => {
  const currentYear = new Date().getFullYear().toString();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const years = Array.from(
    {length: Math.max(0, currentYear - 2023 + 1)},
    (_, index) => ({
      label: `${currentYear - index}`,
      value: currentYear - index,
    }),
  );

  const {caoReceiver, cboReceiver} = useUserInfo();
  const [searchText, setSearchText] = useState(selectedSearch);
  const [selectedSearch, setSelectedSearch] = useState('');
  const [selectedView, setSelectedView] = useState('DocumentSearch');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState(false);

  const [searchEmployeeNumber, setSearchEmployeeNumber] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');

  const [dataError, setDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const {
    searchTrackData,
    setSearchTrackData,
    searchTrackLoading,
    searchPayrollData,
    setSearchPayrollData,
    searchPayrollLoading,
    error,
    fetchDataSearchTrack,
    fetchDataSearchPayroll,
  } = useSearchTrack(searchText, selectedYear, search);

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
  const handleSearch = () => {
    console.log('Searching for:', searchText);
    setSearchModalVisible(truex);
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

  const filterData = text => {
    setSearchText(text);
  };

  const filterDataByEmployeeNumber = text => {
    setSearchEmployeeNumber(text);
  };

  const filterDataByLastName = text => {
    setSearchLastName(text);
  };

  const filterDataByFirstName = text => {
    setSearchFirstName(text);
  };

  /*  const searchTrackingNumber = async (searchFromHistory) => {
    if (!searchText || searchText.length < 3 || searchFromHistory) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage('at least 3 characters.');
      return;
    }
    addSearchItem(searchText);

    setSearchHistory(prev => {
      const newHistory = [
        searchText,
        ...prev.filter(item => item !== searchText),
      ];
      return newHistory.slice(0, 5); // Keep only the last 5 searches
    });

    const validText = /^[a-zA-Z0-9-]*$/;

    if (!validText.test(searchText)) {
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

      const data = await fetchDataSearchTrack(searchText);
      if (
        !data ||
        data.count === 0 ||
        !data.results ||
        data.results.length === 0
      ) {
        setDataError(true); // Set error
        triggerShakeAnimation(); // Trigger the shake animation
        setErrorMessage('No results found.');
        return;
      }

      if (data.count === 1 && data.results.length > 0) {
        const trackingNumber =
          searchText.substring(4, 5) === '-' ||
          searchText.substring(0, 3) === 'PR-'
            ? searchText
            : data.results[0].TrackingNumber;

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
      //setSearchModalVisible(false);
      setSearch(true);
    } catch (fetchError) {
      setDataError(true); // Set error
      triggerShakeAnimation(); // Trigger the shake animation
      setErrorMessage('Fetch error:', fetchError);
    }
  }; */

 /*  const searchTrackingNumber = async keywordParam => {
    const keyword =
      typeof keywordParam === 'string' ? keywordParam : searchText;

    if (!keyword || keyword.length < 3) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage('At least 3 characters.');
      return;
    }

    addSearchItem(keyword);

    setSearchHistory(prev => {
      const newHistory = [keyword, ...prev.filter(item => item !== keyword)];
      return newHistory.slice(0, 5);
    });

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
  }; */

  const searchTrackingNumber = async keywordParam => {
  const keyword = typeof keywordParam === 'string' ? keywordParam : searchText;

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
    setErrorMessage('Only alphanumeric characters and hyphen (-) are allowed.');
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
        const newHistory = [keyword, ...prev.filter(item => item !== keyword)];
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
    setErrorMessage(`Fetch error: ${fetchError.message || fetchError.toString()}`);
    console.error(fetchError);
  }
};


  const searchPayrollEmployeeNumber = async () => {
    // Clear any previous errors before starting a new search
    setDataError(false);
    setErrorMessage('');

    // Validation for employee number
    if (!searchEmployeeNumber || searchEmployeeNumber.length !== 6) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage('Employee number must be 6 digits long.');
      return;
    }

    // Proceed with the fetch if validation passes
    try {
      const data = await fetchDataSearchPayroll(searchEmployeeNumber);

      // Handle the case where no results are found
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setDataError(true);
        setSearchPayrollData(null);
        triggerShakeAnimation();
        setErrorMessage('No results found.');
      } else {
        setSearchPayrollData(data);
        setSearch(true);
      }
    } catch (fetchError) {
      triggerShakeAnimation();
      setErrorMessage('Fetch error:', fetchError);
      //console.error('Fetch error:', fetchError);
    }
  };

  const searchPayrollName = async () => {
    setDataError(false);
    setErrorMessage('');

    if (!searchLastName || searchLastName.length < 3) {
      setDataError(true);
      setSearchPayrollData(null);
      triggerShakeAnimation();
      setErrorMessage('at least 3 characters.');
      return;
    }
    const trimmedLastName = searchLastName ? searchLastName.trim() : '';
    const trimmedFirstName = searchFirstName ? searchFirstName.trim() : '';

    // Validate search term
    if (!trimmedLastName) {
      console.log('Please enter a valid search term');
      return;
    }

    let searchQuery = `${trimmedLastName}*j*`;
    if (trimmedFirstName) {
      searchQuery += `${trimmedFirstName}`;
    }

    console.log('Searching for:', searchQuery, 'in year:', selectedYear);

    try {
      const data = await fetchDataSearchPayroll(searchQuery);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setDataError(true);
        setSearchPayrollData(null);
        triggerShakeAnimation();
        setErrorMessage('No results found.');
      } else {
        setSearchPayrollData(data);
        setSearch(true);
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      triggerShakeAnimation();
      setDataError(true);
      setErrorMessage(`Fetch error: ${fetchError.message}`);
    }
  };

  const clearInput = () => {
    setSearchText('');
  };

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

  const renderContent = () => {
    if (selectedView === 'DocumentSearch') {
      return (
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '80%',
              }}>
              <View style={{flex: 1}}>
                <View style={styles.searchBarInput}>
                  <View style={{}}>
                    <YearDropdown
                      selectedYear={selectedYear}
                      setSelectedYear={setSelectedYear}
                    />
                  </View>
                  <TextInput
                    placeholder={
                      selectedView === 'DocumentSearch'
                        ? 'Search TN# or Claimant'
                        : selectedView === 'PayrollEmployeeNumber'
                        ? 'Search Employee Number'
                        : 'Search Full Name'
                    }
                    onChangeText={text => filterData(text.toUpperCase())}
                    value={searchText.toUpperCase()}
                    style={[
                      styles.searchBarInput,
                      {
                        fontSize: 14,
                        color: 'black',
                      },
                    ]}
                    autoCapitalize="characters"
                    placeholderTextColor="silver"
                    placeholderStyle={styles.placeholderText}
                    autoCorrect={false}
                    autoCompleteType="off"
                    textContentType="none"
                    keyboardType="default"
                    spellCheck={false}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity
                      onPress={clearInput}
                      style={styles.clearIconContainer}>
                      <Icon
                        name="close-circle"
                        size={20}
                        color="rgba(123, 123, 123, 1)"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={{
                width: '18%',
                backgroundColor: 'rgba(34, 150, 243, 1)',
                paddingHorizontal: 5,
                padding: 10,
                borderRadius: 5,
              }}
              onPress={searchTrackingNumber}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Icon name="search" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{padding: 8}}></View>
        </View>
      );
    } else if (selectedView === 'SearchName') {
      return (
        <>
          <View>
            <Text
              style={{
                fontSize: 12,
                color: '#252525',
                paddingBottom: 10,
                fontFamily: 'Oswald-Light',
              }}>
              Search by Name
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{width: '80%', paddingRight: 10}}>
              <View style={styles.searchBarInput}>
                <View
                  style={
                    {
                      /* width: '40%',  */
                      //borderWidth:1
                    }
                  }>
                  <YearDropdown
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                  />
                </View>
                <TextInput
                  placeholder="Last Name"
                  onChangeText={filterDataByLastName}
                  value={searchLastName.toUpperCase()}
                  style={[
                    styles.searchBarInput,
                    {
                      fontSize: 14,
                      color: 'black',
                    },
                  ]}
                  autoCapitalize="characters"
                  placeholderTextColor="silver"
                  autoFocus={true}
                  autoCorrect={false}
                  autoCompleteType="off"
                  textContentType="none"
                  keyboardType="default"
                  spellCheck={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={{
                width: '20%',
                backgroundColor: 'rgba(34, 150, 243, 1)',
                paddingHorizontal: 5,
                paddingRight: 5,
                padding: 10,
                borderRadius: 5,
              }}
              onPress={searchPayrollName}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Icon name="search" size={20} style={{}} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 10,
            }}>
            <View style={{width: '77%', paddingLeft: 80}}>
              <View style={styles.searchBarInput}>
                <TextInput
                  placeholder="First Name"
                  onChangeText={filterDataByFirstName}
                  value={searchFirstName.toUpperCase()}
                  style={[
                    styles.searchBarInput,
                    {fontSize: 14, color: 'black', textTransform: 'uppercase'},
                  ]}
                  autoCapitalize="characters"
                  placeholderTextColor="silver"
                  autoFocus={true}
                  autoCorrect={false}
                  autoCompleteType="off"
                  textContentType="none"
                  keyboardType="default"
                  spellCheck={false}
                />
              </View>
            </View>
            <View
              style={{width: '30%', padding: 10, paddingVertical: 20}}></View>
          </View>
        </>
      );
    } else if (selectedView === 'SearchEmployeeNumber') {
      return (
        <>
          <View>
            <Text
              style={{
                fontSize: 12,
                color: '#252525',
                paddingBottom: 10,
                fontFamily: 'Oswald-Light',
              }}>
              Search by Employee Number
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{width: '80%', paddingRight: 10}}>
              <View style={styles.searchBarInput}>
                <View
                  style={
                    {
                      /* width: '40%',  */
                      //borderWidth:1
                    }
                  }>
                  <YearDropdown
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                  />
                </View>
                <TextInput
                  placeholder="Employee Number"
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText.length <= 6) {
                      setSearchEmployeeNumber(numericText);
                      filterData(numericText);
                    }
                  }}
                  value={searchEmployeeNumber}
                  style={[
                    styles.searchBarContainer,
                    styles.searchBarInput,
                    {fontSize: 14, color: 'black'},
                  ]}
                  placeholderTextColor="silver"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>
            <TouchableOpacity
              style={{
                width: '20%',
                //backgroundColor: 'rgba(3, 92, 251, 1)',
                backgroundColor: 'rgba(34, 150, 243, 1)',
                paddingHorizontal: 5,
                paddingRight: 5,
                padding: 10,
                borderRadius: 5,
              }}
              onPress={searchPayrollEmployeeNumber}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Icon name="search" size={20} style={{}} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  const renderData = () => {
    if (dataError) {
      return (
        <View
          style={{
            flex: 1,
           // backgroundColor: 'rgba(255,255,255,0.2)',
            marginTop: 10,
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
    /*  if (searchTrackLoading) {
      return (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="rgba(0, 116, 255, 0.7)" />
          
        </View>
      );
    } */

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

    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}></Text>
      </View>
    );
  };

  const renderDataPayroll = () => {
    if (dataError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.2)',
            marginTop: 10,
          }}>
          <Animated.View
            style={[
              styles.errorContainer,
              {transform: [{translateX: shakeAnimation}]},
            ]}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        </View>
      );
    }

    if (searchPayrollLoading) {
      return (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading...</Text>
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

    if (searchPayrollData?.length > 0 && searchPayrollData.length > 2) {
      return renderFlatList(searchPayrollData);
    }

    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>{/* No resultsss found */}</Text>
      </View>
    );
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
  const searchInputRef = useRef(null); // Create a ref for the TextInput

  const renderYearItem = ({item}) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectYear(item)}>
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
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

        <View
          style={{
            borderWidth: 1,
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderColor: '#eee',
            marginTop: 10,
            paddingStart: 10,
            marginHorizontal: 5,
            marginBottom: 10,
            alignItems: 'flex-start',
          }}>
          {/* <TouchableOpacity
              onPress={() => navigation.navigate('Receiver')}
              style={{ top: 10, right: 10}}>
              <Icons name="qrcode-scan" size={40} color="#252525" />
            </TouchableOpacity> */}

          <View style={{marginStart: 10, marginBottom: 20, marginTop: 10}}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_24pt-Bold',
                    fontSize: 24,
                    color: '#252525',
                  }}>
                  Search
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_24pt-Regular',
                    fontSize: 14,
                    color: '#252525',
                  }}>
                  Search tracking number
                </Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                {(caoReceiver === '1' || cboReceiver === '1') && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Receiver')}
                    style={{top: 10, right: 20}}>
                    <Icons name="qrcode-scan" size={40} color="black" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  height: 40,
                  width: '95%',
                  marginEnd: 20,
                  borderColor: '#ccc',
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  marginTop: 10,
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
                onPress={() => setSearchModalVisible(true)}>
                <Icons
                  name="magnify"
                  size={24}
                  color="#252525"
                  style={{marginRight: 10}}
                />
                <Text style={{fontSize: 16, color: '#252525'}}>Enter here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
          animationType="slide"
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

              <View style={styles.resultsContainer}>{renderData()}</View>

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
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 2 },
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
    marginTop: 20,
    paddingHorizontal: 16,
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
    height: 80, // If results should take remaining space and be scrollable, ensure renderData() returns a ScrollView/FlatList
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
    fontSize: 18, // Slightly larger for prominence
    color: 'white',
  },
  trackingNumberGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10, // Add vertical padding
    paddingStart: 10,
  },
  trackingNumberText: {
    fontFamily: 'Oswald-Regular',
    color: 'white',
    fontSize: 17, // Consistent with index
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
});

export default SearchScreen;
