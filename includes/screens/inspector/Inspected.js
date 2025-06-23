import React, {useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import {Menu, Provider} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import {Shimmer} from '../../utils/useShimmer';
import {InspectionList} from './InspectionList';
import {useQueryClient} from '@tanstack/react-query';
import {FlashList} from '@shopify/flash-list';
import LinearGradient from 'react-native-linear-gradient';
import {useInspection} from '../../hooks/useInspection';
import {BlurView} from '@react-native-community/blur';

const Inspected = ({navigation}) => {
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

  const baseFilteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter(
      item =>
        item.DateInspected !== null &&
        item.DateInspected !== '' &&
        item?.Status?.toLowerCase() !== 'for inspection' &&
        item?.Status?.toLowerCase() !== 'inspection on hold',
    );
  }, [data]);

  const offices = useMemo(() => {
    const uniqueOffices = Array.from(
      new Set(baseFilteredData.map(item => item.OfficeName).filter(Boolean)),
    );
    return [
      {label: 'All Offices', value: null, key: 'all-offices'},
      ...uniqueOffices.map(name => ({
        label: name,
        value: name,
        key: name,
      })),
    ];
  }, [baseFilteredData]);

  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(baseFilteredData.map(item => item.Year).filter(Boolean)),
    );
    return [
      {label: 'All Years', value: null, key: 'all-years'},
      ...uniqueYears.map(name => ({
        label: name,
        value: name,
        key: name,
      })),
    ];
  }, [baseFilteredData]);

  const filteredInspectionList = useMemo(() => {
    let filtered = baseFilteredData;

    if (selectedOffice) {
      filtered = filtered.filter(item => item.OfficeName === selectedOffice);
    }

    if (selectedYear) {
      filtered = filtered.filter(item => item.Year === selectedYear);
    }

    const searchTerm = searchQuery?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const {
          OfficeName = '',
          TrackingNumber = '',
          RefTrackingNumber = '',
          CategoryName = '',
        } = item;

        return (
          String(OfficeName).toLowerCase().includes(searchTerm) ||
          String(TrackingNumber).toLowerCase().includes(searchTerm) ||
          String(RefTrackingNumber).toLowerCase().includes(searchTerm) ||
          String(CategoryName).toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered.sort((a, b) => {
      const getValidDate = dateString => {
        if (!dateString || typeof dateString !== 'string') {
          return null;
        }
        const datePart = dateString.substring(0, 10);
        const date = new Date(datePart);
        return isNaN(date.getTime()) ? null : date;
      };

      const dateA = getValidDate(a.DateInspected);
      const dateB = getValidDate(b.DateInspected);

      if (dateA && dateB) {
        return dateB.getTime() - dateA.getTime();
      } else if (dateA) {
        return -1;
      } else if (dateB) {
        return 1;
      } else {
        return 0;
      }
    });
  }, [baseFilteredData, selectedOffice, selectedYear, searchQuery]);

  const flashListData = useMemo(() => {
    const groupedInspections = filteredInspectionList.reduce((acc, item) => {
      const office = item.OfficeName || 'Unassigned Office';
      if (!acc[office]) {
        acc[office] = [];
      }
      acc[office].push(item);
      return acc;
    }, {});

    const flattenedList = [];
    let sectionIndex = 0;
    let overallItemIndex = 0;

    Object.keys(groupedInspections).forEach(officeName => {
      flattenedList.push({
        type: 'header',
        id: `header-${officeName}`,
        title: officeName,
        sectionIndex: sectionIndex++,
      });
      groupedInspections[officeName].forEach((item, index) => {
        flattenedList.push({
          type: 'item',
          ...item,
          id: item.Id ? item.Id.toString() : `item-${officeName}-${index}`,
          itemIndexInGroup: index,
          overallItemIndex: overallItemIndex++,
        });
      });
    });
    return flattenedList;
  }, [filteredInspectionList]);

  const renderFlashListItem = useCallback(
    ({item}) => {
      if (item.type === 'header') {
        return (
          <LinearGradient
            colors={['rgb(209, 238, 248)', '#fff']}
            style={styles.gradientContainer}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <View style={styles.officeHeaderContent}>
              <Text style={styles.officeIndexText}>
                {item.sectionIndex + 1}
              </Text>
              <Text style={styles.officeSectionTitle}>{item.title}</Text>
            </View>
          </LinearGradient>
        );
      } else if (item.type === 'item') {
        return (
          <View style={styles.inspectionItemContainer}>
            <InspectionList
              item={item}
              // Pass the relevant index here
              index={item.itemIndexInGroup} // Or item.overallItemIndex for a continuous index
              onPressItem={onPressItem}
              filteredInspectionList={filteredInspectionList}
            />
          </View>
        );
      }
      return null;
    },
    [onPressItem, filteredInspectionList],
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['inspection'],
    });
  }, [queryClient]);

  const handleOfficeSelect = useCallback(office => {
    setSelectedOffice(office);
    setOpenOfficeSheet(false);
  }, []);

  const handleYearSelect = useCallback(year => {
    setSelectedYear(year);
    setOpenYearSheet(false);
  }, []);

  const handleFiltersPress = useCallback(() => {
    setMenuVisible(prev => !prev);
  }, []);

  const onPressItem = useCallback(
    (item, list) => {
      // When navigating, ensure you pass the original filteredInspectionList
      // since the 'item' passed here is already part of the flattened data.
      navigation.navigate('InspectionDetails', {
        item,
        filteredInspectionList: list,
      });
    },
    [navigation],
  );

  const openOfficeSheetHandler = useCallback(() => {
    setMenuVisible(false);
    setOpenYearSheet(false);
    setOpenOfficeSheet(true);
    officeBottomSheetRef.current?.expand();
  }, []);

  const openYearSheetHandler = useCallback(() => {
    setMenuVisible(false);
    setOpenOfficeSheet(false);
    setOpenYearSheet(true);
    yearBottomSheetRef.current?.expand();
  }, []);

  const toggleSearchBar = useCallback(() => {
    setShowSearch(prev => {
      if (prev) {
        setSearchQuery(''); // Clear search when closing
      }
      return !prev;
    });
  }, []);

  /* const renderFlashListItem = useCallback(({item, index}) => {
  if (item.type === 'header') {
    return (
      <LinearGradient
        colors={['rgb(209, 238, 248)', '#fff']}
        style={styles.gradientContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={styles.officeHeaderContent}>
          <Text style={styles.officeIndexText}>{item.sectionIndex + 1}</Text>
          <Text style={styles.officeSectionTitle}>{item.title}</Text>
        </View>
      </LinearGradient>
    );
  } else if (item.type === 'item') {
    return (

      <View style={styles.inspectionItemContainer}>
        <InspectionList
          item={item} // 'item' is already the inspectionItem
          index={index} // This index is the index within the flat list
          onPressItem={onPressItem}
          filteredInspectionList={filteredInspectionList}
        />
      </View>
    );
  }
  return null;
}, [onPressItem, filteredInspectionList]); */

  const renderInspectionContent = () => {
    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong!</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredInspectionList?.length === 0) {
      return (
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
      );
    }

    return (
      <FlashList
        data={flashListData}
        keyExtractor={item => item.id}
        renderItem={renderFlashListItem}
        onRefresh={handleRefresh}
        refreshing={isFetching}
        estimatedItemSize={100}
        contentContainerStyle={styles.flashListContentContainer}
      />
    );
  };

  if (/* !isLoading && */ /* data */ isLoading || isFetching) {
    return (
      <View style={styles.initialLoadingContainer}>
        <BlurView style={styles.blurView} blurType="light" blurAmount={5} />
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
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  autoCapitalize="characters"
                  placeholderTextColor="#888"
                />
                <TouchableOpacity
                  onPress={toggleSearchBar}
                  style={styles.searchCloseIcon}>
                  {/* <Icon name="close" size={24} color="#fff" /> */}
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
                <Text style={styles.headerTitle}>Inspected</Text>
                <TouchableOpacity
                  onPress={toggleSearchBar}
                  style={styles.headerIcon}>
                  <Icon name="search" size={24} color="#fff" />
                </TouchableOpacity>

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
              </>
            )}
          </View>
        </ImageBackground>

        {isLoading && data && (
          <View style={styles.loadingContainer}>
            {[...Array(5)].map((_, index) => (
              <Shimmer key={index} />
            ))}
          </View>
        )}

        <View style={styles.resultsCountContainer}>
          <Text>{filteredInspectionList.length} results</Text>
        </View>

        <View style={styles.mainContent}>{renderInspectionContent()}</View>

        {openOfficeSheet && (
          <View style={styles.overlay}>
            <BottomSheet
              ref={officeBottomSheetRef}
              index={0}
              snapPoints={['50%', '25%', '80%']}
              onClose={() => setOpenOfficeSheet(false)}
              style={styles.bottomSheetShadow}>
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
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {offices.map(office => (
                      <Pressable
                        key={office.key}
                        style={({pressed}) => [
                          styles.bottomSheetOption,
                          pressed && styles.pressedOption,
                        ]}
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
              snapPoints={['50%', '25%', '80%']}
              onClose={() => setOpenYearSheet(false)}
              style={styles.bottomSheetShadow}>
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
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {years.map(year => (
                      <Pressable
                        key={year.key}
                        style={({pressed}) => [
                          styles.bottomSheetOption,
                          pressed && styles.pressedOption,
                        ]}
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcon: {
    padding: 8,
  },
  searchCloseIcon: {
    padding: 8,
    marginRight: 5,
  },
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginStart: 10,
    marginRight: 10,
    paddingHorizontal: 15,
    color: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 5,
  },
  menuItemTitle: {
    color: 'black',
    fontSize: 16,
  },
  menuStyle: {
    position: 'absolute',
    top: 65,
    right: 5,
  },
  menuContentStyle: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 0,
  },
  loadingContainer: {
    gap: 10,
    marginTop: 15,
    paddingHorizontal: 10,
  },
  initialLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#1a508c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultsCountContainer: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginEnd: 20,
  },
  noResultsContainer: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    //padding: 20,
  },
  noResultsImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 15,
    //opacity: 0.7,
  },
  noResultsText: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  flashListContentContainer: {
    paddingBottom: 20,
  },
  // officeSection is no longer needed as a wrapper around items
  gradientContainer: {
    paddingVertical: 10,
    marginBottom: 5,
  },
  officeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  officeIndexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
  },
  officeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  inspectionItemContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    flex: 1,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetHeaderText: {
    marginStart: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomSheetOptionsContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
    flex: 1,
  },
  bottomSheetOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  pressedOption: {
    backgroundColor: '#e0e0e0',
  },
  menuItem: {
    fontSize: 16,
    color: '#333',
  },
  bottomSheetShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default Inspected;
