import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import {Menu, Provider, Searchbar} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import {Shimmer} from '../../utils/useShimmer';
import {InspectionList} from './InspectionList';
import {useQueryClient} from '@tanstack/react-query';

//import useInspection from '../../api/useInspection';
import {useInspection} from '../../hooks/useInspection';
import {BlurView} from '@react-native-community/blur';

const ForInspection = ({navigation}) => {
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const officeBottomSheetRef = useRef(null);
  const yearBottomSheetRef = useRef(null);
  const [openOfficeSheet, setOpenOfficeSheet] = useState(false);
  const [openYearSheet, setOpenYearSheet] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const {data, isLoading, isError, isFetching, refetch} = useInspection();
  //cons

  const offices = [
    {label: 'All Offices', value: null, key: 'all-offices'},
    ...Array.from(
      new Set(
        (Array.isArray(data) ? data : [])
          .filter(item => item?.Status?.toLowerCase() === 'for inspection')
          .map(item => item.OfficeName)
          .filter(name => name !== undefined && name !== null),
      ),
    ).map(name => ({
      label: name,
      value: name,
      key: name,
    })),
  ];

  const years = [
    {label: 'All Years', value: null, key: 'all-years'},
    ...Array.from(
      new Set(
        (Array.isArray(data) ? data : [])
        .filter(item => item?.Status?.toLowerCase() === 'for inspection')
          .map(item => item.Year)
          .filter(name => name !== undefined && name !== null),
      ),
    ).map(name => ({
      label: name,
      value: name,
      key: name,
    })),
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    console.log('refresh');
    //refetch();
    queryClient.invalidateQueries({
      queryKey: ['inspection'],
    });
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredInspectionListData = Array.isArray(data) 
  ? data.filter(item => {
      const searchTerm = searchQuery?.toLowerCase() || '';

      const {
        OfficeName = '',
        TrackingNumber = '',
        CategoryName = '',
        Year,
      } = item;

      if (selectedOffice && !OfficeName.includes(selectedOffice)) {
        return false;
      }

      if (selectedYear && Year !== selectedYear) {
        return false;
      }

      if (
        !OfficeName.toLowerCase().includes(searchTerm) &&
        !TrackingNumber.toLowerCase().includes(searchTerm) &&
        !CategoryName.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }

      return true;
    })
  : []; 


  const handleOfficeSelect = office => {
    setSelectedOffice(office);
    setOpenOfficeSheet(false);
  };

  const handleYearSelect = year => {
    setSelectedYear(year);
    setOpenYearSheet(false);
  };

  const handleFiltersPress = () => {
    setMenuVisible(prev => !prev);
  };

  const toggleSearch = () => {
    setShowSearch(prevState => !prevState);
  };

  const onPressItem = (item, filteredInspectionList) => {
    navigation.navigate('InspectionDetails', {item, filteredInspectionList});
  };

  const openOfficeSheetHandler = () => {
    setMenuVisible(false);
    setOpenYearSheet(false);
    setOpenOfficeSheet(true);
    officeBottomSheetRef.current?.expand();
  };

  const openYearSheetHandler = () => {
    setMenuVisible(false);
    setOpenOfficeSheet(false);
    setOpenYearSheet(true);
    yearBottomSheetRef.current?.expand();
  };

  /* const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await inspectionList();
    } catch (error) {
      console.error('Error fetching inspection items:', error);
    } finally {
      setRefreshing(false);
    }
  }; */

  const filteredInspectionList = filteredInspectionListData?.filter(
    item => item?.Status?.toLowerCase() === 'for inspection',
  );

  const renderInspection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          {[...Array(5)].map((_, index) => (
            <Shimmer key={index} />
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <View style={{alignItems: 'center', marginTop: 20}}>
          <Text style={{color: 'red', fontSize: 16, fontWeight: 'bold'}}>
            Something went wrong!
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={{
              marginTop: 10,
              backgroundColor: '#007bff',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
            }}>
            <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{flex: 1, marginBottom: 100}}>
        <View
          style={{
            alignSelf: 'flex-end',
            marginTop: 5,
            marginEnd: 20,
          }}>
          <Text>{filteredInspectionList.length} results</Text>
        </View>

        {filteredInspectionList?.length === 0 ? (
          <View
            style={{
              flex: 1,
              top: 80,
            }}>
            <Image
              source={require('../../../assets/images/noresultsstate.png')}
              style={{
                width: '60%',
                height: '25%',
                alignSelf: 'center',
              }}
            />
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                alignSelf: 'center',
                color: 'gray',
                fontSize: 16,
                textAlign: 'center',
                padding: 5,
              }}>
              NO RESULTS FOUND
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredInspectionList}
            keyExtractor={(item, index) =>
              item && item.Id ? item.Id.toString() : index.toString()
            }
            renderItem={({item, index}) => (
              <View style={styles.inspectionItemContainer}>
                <InspectionList
                  item={item}
                  index={index}
                  onPressItem={onPressItem}
                />
              </View>
            )}
            onRefresh={handleRefresh}
            refreshing={isFetching} // Show refreshing state when refetching
            initialNumToRender={10}
            windowSize={5}
            //contentContainerStyle={{paddingVertical: 10}}
          />
        )}
      </View>
    );
  };

  if (isFetching && !data) {
    return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <BlurView
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        blurType="light"
        blurAmount={5}
      />
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.title}>For Inspection</Text>
            <View
              style={{width: 40, alignItems: 'flex-end', marginEnd: 10}}></View>
          </View>

          <Pressable
            style={({pressed}) => ({
              flexDirection: 'row',
              alignSelf: 'center',
              marginHorizontal: 20,
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              backgroundColor: showSearch ? '#007bff' : 'transparent',
            })}
            onPress={() => setShowSearch(!showSearch)}>
            <Icon
              name="search"
              size={20}
              color={showSearch ? '#fff' : '#fff'}
              style={{alignSelf: 'center'}}
            />
          </Pressable>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable
                onPress={handleFiltersPress}
                style={{
                  padding: 5,
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                }}>
                <Icon name="ellipsis-vertical" size={20} color="#fff" />
              </Pressable>
            }
            style={{
              position: 'absolute',
              top: 90,
              right: 10,
              left: 200,
            }}
            contentStyle={{backgroundColor: '#fff', borderRadius: 10}}>
            <Menu.Item
              onPress={openOfficeSheetHandler}
              title="Select Office"
              titleStyle={styles.menuItemTitle}
            />
            <Menu.Item
              onPress={openYearSheetHandler}
              title="Select Year"
              titleStyle={styles.menuItemTitle}
            />
          </Menu>
        </ImageBackground>

        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search Office, Payment TN"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchInput}
                placeholderTextColor="gray"
                autoCapitalize="characters"
                autoFocus={true}
                autoCorrect={false}
                autoCompleteType="off"
                textContentType="none"
                keyboardType="default"
                spellCheck={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}>
                  <Icon name="close" size={20} color="black" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={{height: '100%'}}>{renderInspection()}</View>

        {openOfficeSheet && (
          <View style={styles.overlay}>
            <BottomSheet
              ref={officeBottomSheetRef}
              index={0}
              snapPoints={['50%', '25%']}
              onClose={() => setOpenOfficeSheet(false)}>
              <View style={styles.bottomSheetContent}>
                <View style={styles.bottomSheetHeader}>
                  <View style={styles.bottomSheetTitleContainer}>
                    <Icon name="storefront-outline" size={20} color={'#ccc'} />
                    <Text style={styles.sheetHeaderText}>Select Office</Text>
                  </View>
                  <Pressable onPress={() => setOpenOfficeSheet(false)}>
                    <Icon name="close-outline" size={24} color={'#ccc'} />
                  </Pressable>
                </View>
                <View style={styles.bottomSheetOptionsContainer}>
                  <ScrollView>
                    {offices.map(office => (
                      <Pressable
                        key={office.key}
                        style={styles.bottomSheetOption}
                        android_ripple={{color: '#F0F4F7', borderless: false}}
                        onPress={() => handleOfficeSelect(office.value)}>
                        <Text style={styles.menuItem}>{office.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </BottomSheet>
          </View>
        )}

        {openYearSheet && (
          <View style={styles.overlay}>
            <BottomSheet
              ref={yearBottomSheetRef}
              enablePanDownToClose={true}
              index={0}
              snapPoints={['50%', '25%']}
              onClose={() => setOpenYearSheet(false)}
              onChange={index => {
                if (index === -1) setOpenYearSheet(false); // Close state when dismissed
              }}>
              <View style={styles.bottomSheetContent}>
                <View style={styles.bottomSheetHeader}>
                  <View style={styles.bottomSheetTitleContainer}>
                    <Icon name="calendar" size={20} color={'#ccc'} />
                    <Text style={styles.sheetHeaderText}>Select Year</Text>
                  </View>
                  <Pressable onPress={() => setOpenYearSheet(false)}>
                    <Icon name="close-outline" size={24} color={'#ccc'} />
                  </Pressable>
                </View>
                <View style={styles.bottomSheetOptionsContainer}>
                  <ScrollView>
                    {years.map(year => (
                      <Pressable
                        key={year.key}
                        style={styles.bottomSheetOption}
                        android_ripple={{color: '#F0F4F7', borderless: false}}
                        onPress={() => handleYearSelect(year.value)}>
                        <Text style={styles.menuItem}>{year.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </BottomSheet>
          </View>
        )}
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  menuItemTitle: {
    color: 'black',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 50,
    marginTop: 10,
    //paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 14,
  },
  headerContainer: {
    //backgroundColor: 'white',
    //paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: 'space-between',
    //elevation: 3,
    //borderBottomWidth: 1,
    //borderBottomColor: 'rgb(224, 224, 224)',
  },
  headerContent: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
  },
  headerLeft: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
    backgroundColor: '#F8F8F8',
    borderRadius: 999,
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 16,
    marginStart: 10,
  },
  headerRight: {
    flexDirection: 'row',
    //alignItems: 'center',
    //justifyContent: 'space-between',
    //columnGap: 20,
  },
  searchToggle: {
    backgroundColor: '#F8F8F8',
    padding: 5,
    borderRadius: 10,
  },
  searchActive: {
    backgroundColor: '#F0F4F7',
  },
  filtersButton: {
    padding: 5,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  menuStyle: {
    position: 'absolute',
    top: 90,
    right: 10,
    left: 200,
  },
  menuContentStyle: {
    backgroundColor: '#F0F4F7',
    borderRadius: 10,
  },
  mainContent: {
    height: '100%',
    paddingBottom: 55,
  },
  loadingContainer: {
    gap: 10,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
  },
  inspectionListContainer: {
    flex: 1,
  },
  noResultsContainer: {
    flex: 1,
    top: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsImage: {
    width: '60%',
    height: '25%',
    alignSelf: 'center',
  },
  noResultsText: {
    fontFamily: 'Oswald-Light',
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    padding: 5,
  },
  inspectionItemContainer: {
    paddingHorizontal: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomSheetTitleContainer: {
    flexDirection: 'row',
  },
  sheetHeaderText: {
    marginStart: 10,
  },
  bottomSheetOptionsContainer: {
    paddingHorizontal: 20,
    rowGap: 10,
  },
  bottomSheetOption: {
    padding: 10,
    paddingStart: 20,
  },
  menuItem: {
    fontSize: 16,
  },
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
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
  },
  backButton: {
    padding: 8,
    //backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  clearButton: {
    padding: 5,
    marginEnd: 5,
    borderRadius: 15,
    backgroundColor: 'rgb(221, 220, 220)',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForInspection;
