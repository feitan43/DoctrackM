import React, {useState, useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import {Menu, Provider, Searchbar} from 'react-native-paper';
import useInspection from '../api/useInspection';
import LinearGradient from 'react-native-linear-gradient';
import {ScrollView} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('window');
const shimmerWidth = width * 0.95;
const shimmerHeight = height * 0.17;

const Shimmer = ({width, height, borderRadius}) => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnimatedValue]);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.shimmerWrapper, {width, height, borderRadius}]}>
      <Animated.View
        style={{...StyleSheet.absoluteFillObject, transform: [{translateX}]}}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.0)',
            'transparent',
            'rgba(255,255,255,0.2)',
          ]}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const InspectionList = memo(
  ({item, index, onPressItem}) => {
    return (
      <Pressable
      style={{/* backgroundColor:'#F0F4F7', */ borderColor:'#ccc', /* borderRadius: 10, */ borderBottomWidth:1, paddingVertical: 20}}
        android_ripple={{color: '#F0F4F7', borderless: false}}
        onPress={() => onPressItem(item)}>
        <View style={{flexDirection: 'row', padding: 10, borderBottomColor:'#ccc'}}>
          <View style={{paddingHorizontal: 10}}>
            <Text style={{textAlignVertical: 'top'}}>{index + 1}</Text>
          </View>
          <View style={{width: '90%', maxWidth: '90%'}}>
            <Text style={{fontSize: 13, color: '#434343', fontWeight: '600'}}>
              {item.OfficeName}
            </Text>
            <Text style={{fontSize: 13, fontWeight: '400'}}>
              {item.CategoryCode} - {item.CategoryName}
            </Text>
            <View style={{paddingTop: 10, paddingStart: 20}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{fontSize: 13, color: '#434343', fontWeight: '500'}}>
                  {item.Year}
                </Text>
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 3,
                    backgroundColor: '#ccc',
                    marginHorizontal: 5,
                  }}
                />
                <Text
                  style={{fontSize: 13, color: '#434343', fontWeight: '500'}}>
                  {item.TrackingNumber}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 12, fontWeight: '300'}}>PO TN: </Text>
                <Text style={{fontSize: 12, fontWeight: '500'}}>
                  {item.TrackingPartner}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 12, fontWeight: '300'}}>
                  Delivery Date:{' '}
                </Text>
                <Text style={{fontSize: 12, fontWeight: '500'}}>
                  {item.DeliveryDate}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
  (prevProps, nextProps) =>
    prevProps.delaysRegOfficeData === nextProps.delaysRegOfficeData,
);

const TabNavigator = ({
  inspectionListData,
  inspectionListLoading,
  onPressItem,
  indexTab,
  inspectionList,
}) => {
  const [index, setIndex] = useState(indexTab ?? 0);
  const [refreshing, setRefreshing] = useState(false);

  const routes = [
    {key: 'forInspection', title: 'For Inspection'},
    {key: 'inspected', title: 'Inspected'},
    {key: 'inspectionOnHold', title: 'Inspection on Hold'},
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await inspectionList();
    } catch (error) {
      console.error('Error fetching inspection items:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderScene = ({route}) => {
    if (inspectionListLoading) {
      return (
        <View
          style={[
            {
              gap: 10,
              marginTop: 10,
              justifyContent: 'center',
              alignItems: 'center',
            },
            {top: 0},
          ]}>
          {[...Array(3)].map((_, index) => (
            <Shimmer key={index} width={shimmerWidth} height={shimmerHeight} />
          ))}
        </View>
      );
    }

    const filteredData = inspectionListData.filter(item => {
      switch (route.key) {
        case 'forInspection':
          return item.Status === 'For Inspection';
        case 'inspected':
          return (
            item.DateInspected &&
            item.Status !== 'For Inspection' &&
            item.Status !== 'Inspection on hold'
          );
        case 'inspectionOnHold':
          return item.Status === 'Inspection on hold';
        default:
          return null;
      }
    });

    return (
      <View style={{paddingBottom: 50}}>
        <FlatList
          data={filteredData}
          keyExtractor={item => item.TrackingNumber}
          renderItem={({item, index}) => (
            <View style={{paddingHorizontal:10}}>
            <InspectionList
              item={item}
              index={index}
              onPressItem={onPressItem}
            />
          </View>
           
          )}
          onRefresh={handleRefresh} 
          refreshing={refreshing} 
        />
      </View>
    );
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      indicatorContainerStyle={styles.indicatorContainer}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#0D55C7"
      inactiveColor="gray"
      scrollEnabled={true}
      tabStyle={{width: 'auto', paddingHorizontal: 10}}
      pressColor="#F0F4F7"
      android_ripple={{color: '#F0F4F7', borderless: false}} 
    />
  );

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: Dimensions.get('window').width}}
      renderTabBar={renderTabBar}
    />
  );
};

const InspectionScreen = ({route, navigation}) => {
  const {indexTab} = route.params;

  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const officeBottomSheetRef = useRef(null);
  const yearBottomSheetRef = useRef(null);
  const [openOfficeSheet, setOpenOfficeSheet] = useState(false);
  const [openYearSheet, setOpenYearSheet] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    inspectionListData,
    inspectionListLoading,
    fetchInspectionDetails,
    fetchInspectionItems,
    inspectionList,
  } = useInspection();

  const offices = Array.from(
    new Set(
      (Array.isArray(inspectionListData) ? inspectionListData : [])
        .map(item => item.OfficeName)
        .filter(name => name !== undefined && name !== null),
    ),
  ).map(name => ({label: name, value: name}));

  const years = Array.from(
    new Set(
      (Array.isArray(inspectionListData) ? inspectionListData : [])
        .map(item => item.Year)
        .filter(year => year !== undefined && year !== null),
    ),
  ).map(year => ({label: year.toString(), value: year.toString()}));

  useEffect(() => {
    fetchInspectionDetails(selectedYear, indexTab.TrackingPartner);
    fetchInspectionItems(selectedYear, indexTab.TrackingPartner);
  }, []);

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

  const onPressItem = item => {
    navigation.navigate('InspectionDetails', {item});
  };

  const filteredInspectionListData = (
    Array.isArray(inspectionListData) ? inspectionListData : []
  ).filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    const officeMatch = selectedOffice
      ? item.OfficeName.includes(selectedOffice)
      : true;
    const yearMatch = selectedYear ? item.Year === selectedYear : true;
    return (
      officeMatch &&
      yearMatch &&
      (item.OfficeName.toLowerCase().includes(searchTerm) ||
        item.TrackingNumber.toLowerCase().includes(searchTerm) ||
        item.CategoryName.toLowerCase().includes(searchTerm))
    );
  });

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

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Pressable
                style={{
                  padding: 10,
                  backgroundColor: '#F8F8F8',
                  borderRadius: 999,
                }}
                onPress={() => navigation.goBack()}
                /* android_ripple={{color: 'gray',borderRadius:999,borderless: false}} */
              >
                <Icon name="chevron-back" size={20} color={'black'} />
              </Pressable>
              <Text style={styles.headerTitle}>Inspection</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                columnGap: 20,
              }}>
              <Pressable
                onPress={toggleSearch}
                style={{
                  backgroundColor: showSearch ? '#F0F4F7' : '#F8F8F8',
                  padding: 5,
                  borderRadius: 10,
                }}>
                <Icon name="search-outline" size={20} color={'black'} />
              </Pressable>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Pressable
                    onPress={handleFiltersPress}
                    style={styles.filtersButton}>
                    <Icon name="ellipsis-vertical" size={20} color="#252525" />
                  </Pressable>
                }
                style={{
                  position: 'absolute',
                  top: 90,
                  right: 10,
                  left: 200,
                }}
                contentStyle={{backgroundColor: '#F0F4F7', borderRadius: 10}}>
                <Menu.Item
                  onPress={openOfficeSheetHandler}
                  title="Select Office"
                />
                <Menu.Item onPress={openYearSheetHandler} title="Select Year" />
              </Menu>
            </View>
          </View>
        </View>

        {showSearch && (
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        )}

        <TabNavigator
          inspectionListData={filteredInspectionListData}
          inspectionListLoading={inspectionListLoading}
          onPressItem={onPressItem}
          indexTab={indexTab}
          selectedYear={selectedYear}
          trackingPartner={indexTab.TrackingPartner}
          inspectionList={inspectionList}
        />

        {openOfficeSheet && (
          <View style={styles.overlay}>
            <BottomSheet
              ref={officeBottomSheetRef}
              index={0}
              snapPoints={['50%', '25%']}
              onClose={() => setOpenOfficeSheet(false)}>
              <View style={styles.bottomSheetContent}>
                <View
                  style={{
                    padding: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Icon name="storefront-outline" size={20} color={'#ccc'} />
                    <Text style={styles.sheetHeaderText}>Select Office</Text>
                  </View>
                  <Pressable onPress={() => setOpenOfficeSheet(false)}>
                    <Icon
                      name="close-outline"
                      size={24}
                      color={'#ccc'}
                      style={{}}
                    />
                  </Pressable>
                </View>
                <View style={{paddingHorizontal: 20, rowGap: 10}}>
                  <ScrollView>
                    {offices.map(office => (
                      <Pressable
                        key={office.value} // Key should be here for each item
                        style={{padding: 10, paddingStart: 20}}
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
              index={0}
              snapPoints={['50%', '25%']}
              onClose={() => setOpenYearSheet(false)}>
              <View style={styles.bottomSheetContent}>
                <View
                  style={{
                    padding: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Icon name="calendar" size={20} color={'#ccc'} />
                    <Text style={styles.sheetHeaderText}>Select Year</Text>
                  </View>
                  <Pressable onPress={() => setOpenYearSheet(false)}>
                    <Icon
                      name="close-outline"
                      size={24}
                      color={'#ccc'}
                      style={{}}
                    />
                  </Pressable>
                </View>
                <View style={{paddingHorizontal: 20, rowGap: 10}}>
                  <ScrollView>
                    {years.map(year => (
                      <Pressable
                        android_ripple={{color: '#F0F4F7', borderless: false}}
                        key={year.value}
                        style={{padding: 10, paddingStart: 20}}
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
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 37,
    //paddingTop: 37,
    backgroundColor: 'white',
  },
  searchBar: {
    backgroundColor: '#E9ECF5',
    marginHorizontal: 10,
    marginVertical: 5,
    height: 55,
    borderRadius: 10,
    fontSize: 14,
    paddingVertical: 0,
    textAlignVertical: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1D1D1',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: 'black',
    marginStart: 10,
  },
  filtersButton: {
    padding: 5,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  bottomSheetBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    height: 5,
    width: 40,
    alignSelf: 'center',
    marginTop: 10,
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  option: {
    padding: 20,
    paddingVertical: 10,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: 'white',
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1D1D1',
    elevation: 0,
  },
  tabLabel: {
    fontWeight: '500',
    fontSize: 13,
    textTransform: 'none',
  },
  indicator: {
    backgroundColor: '#0D55C7',
    height: 3,
    borderRadius: 2,
    width: 0.5,
  },
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmerWrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0, 0.05)',
  },
  gradient: {
    flex: 1,
  },
  container2: {
    gap: 5,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InspectionScreen;
