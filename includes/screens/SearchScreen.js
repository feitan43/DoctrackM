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

const RenderSearchList = memo(({item, index, onPressItem}) => {
  // const modifiedDate = item.DateModified.split(' ')[0];
  // const isDateMatched = modifiedDate === formattedDate;
  // const dateTextColor = isDateMatched ? 'rgba(6, 70, 175, 1)' : 'gray';

  return (
    <View
      style={{
        backgroundColor: 'white',
        //marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'silver',
        //elevation: 2,
      }}>
      <View
        style={{
          backgroundColor: 'white',
          //paddingBottom: 10,
          //borderWidth: 1,
          //borderColor: '#252525',
        }}>
        <TouchableOpacity onPress={() => onPressItem(index, item)}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                backgroundColor: 'rgba(134, 140, 163, 0.2)',
                alignSelf: 'baseline',
              }}>
              <Text
                style={{
                  //backgroundColor: dateTextColor,
                  // backgroundColor: 'rgba(37, 89, 200, 1)',
                  backgroundColor: 'rgba(0, 116, 255, 0.7)',

                  paddingHorizontal: 15,
                  fontFamily: 'Oswald-Regular',
                  fontSize: 16,
                  color: 'white',
                  textAlign: 'center',
                }}>
                {index + 1}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <LinearGradient
                colors={['rgba(0, 116, 255, 0.7)', 'rgba(0, 116, 255, 0.7)']}
                start={{x: 0, y: 0}}
                end={{x: 3, y: 0}}
                style={{elevation: 1}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: '#252525',
                    fontSize: 16,
                    color: 'white',
                    paddingStart: 5,
                  }}>
                  {item.TrackingNumber ? item.TrackingNumber : ''}
                </Text>
              </LinearGradient>
              <View
                style={{
                  /* marginVertical: 5,  */ /* paddingStart: 10, */
                  paddingBottom: 10,
                  paddingStart: 5,
                }}>
                <View style={{rowGap: -5}}>
                  <Text
                    style={{
                      /* color: item.Status.includes('Pending')
                        ? 'rgba(250, 135, 0, 1)'
                        : 'rgba(252, 191, 27, 1)', */
                      color: '#252525',
                      fontFamily: 'Oswald-Regular',
                      fontSize: 18,
                      //textShadowRadius: 1,
                      //elevation: 1,
                      //textShadowOffset: {width: 1, height: 2},
                    }}>
                    {item.Status ? item.Status : ''}
                  </Text>
                  <Text
                    style={{
                      color: 'silver',
                      fontFamily: 'Oswald-Light',
                      fontSize: 12,
                    }}>
                    {item.DateModified ? item.DateModified : ''}
                  </Text>
                </View>
                <Text
                  style={{
                    color: '#252525',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                    marginTop: 5,
                  }}>
                  {item.DocumentType ? item.DocumentType : ''}
                </Text>
                <Text
                  style={{
                    color: '#252525',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                  }}>
                  {
                    /* insertCommas */ item.Amount
                      ? /* insertCommas */ item.Amount
                      : ''
                  }
                </Text>
                <Text
                  style={{
                    color: '#252525',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                  }}>
                  {
                    /* insertCommas */ item.PeriodMonth
                      ? /* insertCommas */ item.PeriodMonth
                      : ''
                  }
                </Text>
              </View>
            </View>
            <View>
              <Text
                style={{
                  backgroundColor: 'rgba(0, 116, 255, 0.7)',
                  paddingHorizontal: 10,
                  fontFamily: 'Oswald-Regular',
                  color: 'white',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                {item.Year ? item.Year : ''}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

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

  const {caoReceiver, receiver} = useUserInfo();

  const [searchText, setSearchText] = useState('');
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

  const searchTrackingNumber = async () => {
    if (!searchText || searchText.length < 3) {
      setDataError(true);
      triggerShakeAnimation();
      setErrorMessage('at least 3 characters.');
      return;
    }

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
      const data = await fetchDataSearchTrack();
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
      setDataError(true); // Set error
      triggerShakeAnimation(); // Trigger the shake animation
      setErrorMessage('Fetch error:', fetchError);
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
                      color: 'black' /* textTransform:'uppercase' */,
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
                //backgroundColor: 'rgba(3, 92, 251, 1)',
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
            {/* <View
              style={{
                width: '30%',
                //backgroundColor: 'rgba(3, 92, 251, 1)',
                backgroundColor: 'rgba(34, 150, 243, 1)',
                paddingHorizontal: 5,
                paddingRight: 5,
                elevation: 5,
                borderWidth: 0.5,
                borderColor: 'silver',
                padding: 10,
              }}
              //onPress={searchPayrollName}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Icon name="search" size={20} style={{}} color="transparent" />

                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                  }}>
                  Search
                </Text>
              </View>
            </View> */}
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
            backgroundColor: 'rgba(255,255,255,0.2)',
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
    if (searchTrackLoading) {
      return (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="rgba(0, 116, 255, 0.7)" />
          {/*   <Text style={styles.loadingText}>Loading...</Text> */}
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
            backgroundColor:'rgba(255,255,255,0.5)',
            borderColor: '#eee',
            marginTop: 10,
            paddingStart: 10,
            marginHorizontal: 5,
            marginBottom: 10,
            alignItems: 'flex-start',
          }}>
          {(caoReceiver === '0' || receiver === '0') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Receiver')}
              style={{position: 'absolute', top: 10, right: 10}}>
              <Icons name="qrcode-scan" size={40} color="black" />
            </TouchableOpacity>
          )}
        
          <View style={{marginStart: 10, marginBottom: 20}}>
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

            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  height: 40,
                  width: '90%',
                  borderColor: '#ccc',
                  borderWidth: 1,
                  paddingHorizontal: 10,
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

         {/* <View
          style={{
            backgroundColor: 'rgba(232, 232, 232, 1)',
            backgroundColor: 'white',
            flex: 1,
            paddingHorizontal: 20,
          }}>
          {selectedView === 'DocumentSearch'
            ? renderData()
            : renderDataPayroll()}
        </View> */}

        <Modal visible={searchModalVisible} transparent animationType="slide">
          <View style={styles.fullScreenModal}>
            <View style={styles.searchHeader}>
              <TouchableOpacity
                onPress={() => setSearchModalVisible(false)}
                style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#252525" />
              </TouchableOpacity>

              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search tracking number"
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus={true}
                  clearButtonMode="never"
                  underlineColorAndroid="transparent"
                  placeholderTextColor="#999"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={styles.clearButton}>
                    <Text style={styles.clearIcon}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.searchButton,
                searchText.trim().length === 0 && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={searchText.trim().length === 0}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
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
    marginTop: 10,
    padding: 10,
    //backgroundColor:'rgba(255,255,255,0.2)',
    //backgroundColor: 'rgba(255, 0, 0, 0.1)', // Light red background for error
    borderRadius: 5,
  },
  errorText: {
    color: '#252525',
    fontFamily: 'Oswald-Light',
    fontSize: 16,
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
});

export default SearchScreen;
