import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList, // This will be changed to FlashList
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
import {Menu, Provider} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import {Shimmer} from '../../utils/useShimmer';
import {InspectionList} from './InspectionList';
import {useQueryClient} from '@tanstack/react-query';
import {useInspection} from '../../hooks/useInspection';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient'; // Added for the gradient header
import {FlashList} from '@shopify/flash-list'; // Added FlashList

const InspectionOnHold = ({navigation}) => {
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const officeBottomSheetRef = useRef(null);
  const yearBottomSheetRef = useRef(null);
  const [openOfficeSheet, setOpenOfficeSheet] = useState(false);
  const [openYearSheet, setOpenYearSheet] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const queryClient = useQueryClient();

  const {data, isLoading, isError, isFetching, refetch} = useInspection();

  // Helper function to get unique values for filters
  const getUniqueValues = (key, filterStatus = true) => {
    const filteredData = Array.isArray(data)
      ? data.filter(item =>
          filterStatus
            ? item?.Status?.toLowerCase() === 'inspection on hold'
            : true,
        )
      : [];
    return Array.from(
      new Set(
        filteredData
          .map(item => item[key])
          .filter(value => value !== undefined && value !== null),
      ),
    ).map(value => ({
      label: value,
      value: value,
      key: value,
    }));
  };

  const offices = [
    {label: 'All Offices', value: null, key: 'all-offices'},
  ].concat(getUniqueValues('OfficeName'));

  const years = [{label: 'All Years', value: null, key: 'all-years'}].concat(
    getUniqueValues('Year'),
  );

  const handleRefresh = () => {
    refetch(); // Use refetch to trigger data fetching
  };

  // Function to parse the date string (copied from ForInspection)
  const parseDeliveryDateString = dateString => {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    try {
      const parts = dateString.trim().split(' ');
      if (parts.length !== 3) {
        console.warn(
          `Debug: Unexpected date string format: "${dateString}". Expected "YYYY-MM-DD HH:MM AM/PM"`,
        );
        return null;
      }

      const [datePart, timePart, ampmPart] = parts;
      const [year, month, day] = datePart.split('-').map(Number);
      let [hours, minutes] = timePart.split(':').map(Number);

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hours) ||
        isNaN(minutes)
      ) {
        console.warn(
          `Debug: Failed to parse date/time numbers from "${dateString}"`,
        );
        return null;
      }

      if (ampmPart.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampmPart.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }

      const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      if (isNaN(date.getTime())) {
        console.error(
          `Debug: Created an Invalid Date object from: "${dateString}"`,
        );
        return null;
      }
      return date;
    } catch (e) {
      console.error(`Debug: Error parsing date string "${dateString}":`, e);
      return null;
    }
  };

  let filteredInspectionListData = Array.isArray(data)
    ? data.filter(item => {
        const searchTerm = searchQuery?.toLowerCase() || '';

        const {
          OfficeName = '',
          TrackingNumber = '',
          RefTrackingNumber = '',
          CategoryName = '',
          Year,
          Status = '',
        } = item;

        // Filter by 'inspection on hold' status
        if (
          typeof Status === 'string' &&
          Status.toLowerCase() !== 'inspection on hold'
        ) {
          return false;
        }
        if (typeof Status !== 'string') {
          return false;
        }

        if (selectedOffice && OfficeName !== selectedOffice) {
          return false;
        }

        if (selectedYear && Year !== selectedYear) {
          return false;
        }

        if (
          !String(OfficeName).toLowerCase().includes(searchTerm) &&
          !String(TrackingNumber).toLowerCase().includes(searchTerm) &&
          !String(RefTrackingNumber).toLowerCase().includes(searchTerm) &&
          !String(CategoryName).toLowerCase().includes(searchTerm)
        ) {
          return false;
        }

        return true;
      })
    : [];

  // Sort the filtered data by DeliveryDate
  filteredInspectionListData = filteredInspectionListData.sort((a, b) => {
    const dateA = parseDeliveryDateString(a.DeliveryDate);
    const dateB = parseDeliveryDateString(b.DeliveryDate);

    if (dateA === null && dateB === null) return 0;
    if (dateA === null) return -1;
    if (dateB === null) return 1;

    return dateA.getTime() - dateB.getTime();
  });

  // Group inspections by office name
  const groupedInspections = filteredInspectionListData.reduce((acc, item) => {
    const office = item.OfficeName || 'Unassigned Office';
    if (!acc[office]) {
      acc[office] = [];
    }
    acc[office].push(item);
    return acc;
  }, {});

  const officeSections = Object.keys(groupedInspections).map(officeName => ({
    title: officeName,
    data: groupedInspections[officeName],
  }));

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

  const onPressItem = (item, fullList) => {
    navigation.navigate('InspectionDetails', {
      item,
      filteredInspectionList: fullList,
    });
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

  const toggleSearchBar = () => {
    setShowSearch(!showSearch);
    setSearchQuery('');
  };

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
          <Text>{filteredInspectionListData.length} results</Text>
        </View>
        {filteredInspectionListData?.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
            <Image
              source={require('../../../assets/images/noresultsstate.png')}
              style={{
                width: 200,
                height: 200,
                resizeMode: 'contain',
                marginBottom: 10,
              }}
            />
            <Text
              style={{
                alignSelf: 'center',
                color: 'gray',
                fontSize: 14,
                textAlign: 'center',
                paddingHorizontal: 10,
              }}>
              No Result Found
            </Text>
          </View>
        ) : (
          <FlashList
            data={officeSections} // Use grouped data for FlashList
            keyExtractor={(item, index) => item.title + index.toString()}
            renderItem={({item, index}) => (
              <View style={styles.officeSection}>
                <LinearGradient // Added LinearGradient for section headers
                  colors={['rgb(209, 238, 248)', '#fff']}
                  style={styles.gradientContainer}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <View style={styles.officeHeaderContent}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        paddingHorizontal: 15,
                        color: 'gray',
                      }}>
                      {index + 1}
                    </Text>
                    <Text style={styles.officeSectionTitle}>{item.title}</Text>
                  </View>
                </LinearGradient>
                {item.data.map((inspectionItem, subIndex) => (
                  <View
                    key={
                      inspectionItem.Id
                        ? inspectionItem.Id.toString()
                        : subIndex.toString()
                    }
                    style={styles.inspectionItemContainer}>
                    <InspectionList
                      item={inspectionItem}
                      index={subIndex}
                      onPressItem={onPressItem}
                      filteredInspectionList={filteredInspectionListData}
                    />
                  </View>
                ))}
              </View>
            )}
            onRefresh={handleRefresh}
            refreshing={isFetching}
            estimatedItemSize={100} // Essential for FlashList performance
          />
        )}
      </View>
    );
  };

  if (isFetching && !data) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <BlurView
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
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
            {showSearch ? (
              <>
                <View style={styles.searchContainer}>
                  <Icon
                    name="search"
                    size={24}
                    color="gray"
                    style={styles.searchIconInsideInput}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity
                  onPress={toggleSearchBar}
                  style={styles.cancelButton}>
                  <Text style={{color: '#fff'}}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}>
                  <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inspection On Hold</Text>
                <TouchableOpacity
                  onPress={toggleSearchBar}
                  style={styles.searchIcon}>
                  <Icon name="search" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFiltersPress}
                  style={styles.searchIcon}>
                  <Icon name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>

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
              index={0}
              snapPoints={['50%', '25%']}
              onClose={() => setOpenYearSheet(false)}>
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: 'space-between',
    flex: 1, // Added flex: 1 to header to allow searchContainer to take space
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    //textAlign: 'center',
    color: '#fff',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingStart: 40, // Increased padding to make space for the icon
    paddingEnd: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  menuItemTitle: {
    color: 'black',
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
  clearButton: {
    padding: 5,
    marginEnd: 5,
    borderRadius: 15,
    backgroundColor: 'rgb(221, 220, 220)',
    alignItems: 'center',
  },
  // New styles from ForInspection for search and grouping
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 10,
  },
  searchIconInsideInput: {
    position: 'absolute',
    left: 10,
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
  },
  officeSection: {
    marginBottom: 5, // Small margin between sections
  },
  gradientContainer: {
    paddingVertical: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
    elevation: 2, // Subtle shadow for the header
  },
 officeHeaderContent: {
    flexDirection: 'row',
    //alignItems: 'center',
    flex: 1,
    paddingRight: 15,
  },
  officeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
});

export default InspectionOnHold;
