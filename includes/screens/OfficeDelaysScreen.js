import React, {
  useCallback,
  useState,
  useEffect,
  memo,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Animated,
  RefreshControl,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import useOfficeDelays from '../api/useOfficeDelays';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('window');

const shimmerWidth = width * 0.95;
const shimmerHeight = 100;

const Shimmer = ({width, height, borderRadius}) => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1500,
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
          colors={['transparent', 'rgba(0,0,0,0.1)', 'transparent']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

function insertCommas(value) {
  if (value === null) {
    return '';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const monthMap = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

const getMonthName = PMonth => {
  return monthMap[PMonth] || PMonth;
};

const RenderOfficeDelays = memo(({item, index, onPressItem}) => {
  return (
    <TouchableOpacity onPress={onPressItem} style={styles.cardContainer}>
      <View style={styles.cardLayout}>
        <View style={styles.indexColumn}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.mainInfoContainer}>
            <View style={styles.mainInfoLeft}>
              <View style={styles.trackingNumberRow}>
                <Text style={styles.trackingNumber}>{item.TrackingNumber}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.documentStatus}>
                    {item.DocumentStatus}
                  </Text>
                </View>
              </View>
              <View style={styles.documentTypeRow}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={16}
                  color="#616161"
                />
                <Text style={styles.documentType}>{item.DocumentType}</Text>
              </View>
            </View>
            <View style={styles.delayedDaysContainer}>
              <Text style={styles.delayedDays}>{item.DelayedDays}</Text>
              <Text style={styles.daysDelayedText}>Days Delayed</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View>
              {/* <Text style={styles.amountText}>
                Amount: ${insertCommas(item.Amount)}
              </Text> */}
              <Text style={styles.monthYearText}>
                {getMonthName(item.PMonth)} {item.Year}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="update" size={16} color="#9E9E9E" />
              <Text style={styles.dateText}>
                Last Updated: {item.DateModified}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const OfficeDelaysScreen = ({navigation}) => {
  const {officeDelaysData, delaysLoading, fetchOfficeDelays} =
    useOfficeDelays();

  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    year: null,
    status: null,
    sortBy: 'latest',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOfficeDelays();
    setRefreshing(false);
  }, [fetchOfficeDelays]);

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {selectedItem: officeDelaysData[index]});
    },
    [navigation, officeDelaysData],
  );

  const loadMore = () => {
    if (
      !isLoadingMore &&
      officeDelaysData &&
      officeDelaysData.length > visibleItems
    ) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 2000);
    }
  };

  const clearFilters = () => {
    setFilterCriteria({
      year: null,
      status: null,
      sortBy: 'latest',
    });
    setIsFilterModalVisible(false);
  };

  const filteredData = useMemo(() => {
    if (!officeDelaysData) {
      return [];
    }

    let data = [...officeDelaysData];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      data = data.filter(item => {
        return (
          item.TrackingNumber.toLowerCase().includes(lowercasedQuery) ||
          item.DocumentType.toLowerCase().includes(lowercasedQuery)
        );
      });
    }

    if (filterCriteria.year) {
      data = data.filter(item => item.Year.toString() === filterCriteria.year);
    }

    if (filterCriteria.status && filterCriteria.status !== 'All Status') {
      data = data.filter(item => item.DocumentStatus === filterCriteria.status);
    }

    if (filterCriteria.sortBy === 'highestDelay') {
      data.sort((a, b) => b.DelayedDays - a.DelayedDays);
    } else if (filterCriteria.sortBy === 'lowestDelay') {
      data.sort((a, b) => a.DelayedDays - b.DelayedDays);
    } else if (filterCriteria.sortBy === 'latest') {
      data.sort((a, b) => new Date(b.DateModified) - new Date(a.DateModified));
    } else if (filterCriteria.sortBy === 'oldest') {
      data.sort((a, b) => new Date(a.DateModified) - new Date(b.DateModified));
    }

    return data;
  }, [officeDelaysData, searchQuery, filterCriteria]);

  const delayedCount =
    filteredData?.filter(item => item.DelayedDays > 3).length || 0;

  const getUniqueYears = () => {
    const years = officeDelaysData?.map(item => item.Year.toString()) || [];
    return [...new Set(years)].sort();
  };

  const getUniqueStatuses = () => {
    const statuses = officeDelaysData?.map(item => item.DocumentStatus) || [];
    return ['All Status', ...new Set(statuses)];
  };

  const renderFilterModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.bottomSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter & Sort</Text>
          <Pressable
            onPress={() => setIsFilterModalVisible(false)}
            style={styles.modalCloseButton}>
            <Icon name="close" size={24} color="#333" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptionsContainer}>
              <Pressable
                onPress={() =>
                  setFilterCriteria({...filterCriteria, sortBy: 'highestDelay'})
                }
                style={[
                  styles.filterOptionButton,
                  filterCriteria.sortBy === 'highestDelay' &&
                    styles.filterOptionButtonActive,
                ]}>
                <Text
                  style={[
                    styles.filterOptionText,
                    filterCriteria.sortBy === 'highestDelay' &&
                      styles.filterOptionTextActive,
                  ]}>
                  Highest Delay
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setFilterCriteria({...filterCriteria, sortBy: 'lowestDelay'})
                }
                style={[
                  styles.filterOptionButton,
                  filterCriteria.sortBy === 'lowestDelay' &&
                    styles.filterOptionButtonActive,
                ]}>
                <Text
                  style={[
                    styles.filterOptionText,
                    filterCriteria.sortBy === 'lowestDelay' &&
                      styles.filterOptionTextActive,
                  ]}>
                  Lowest Delay
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setFilterCriteria({...filterCriteria, sortBy: 'latest'})
                }
                style={[
                  styles.filterOptionButton,
                  filterCriteria.sortBy === 'latest' &&
                    styles.filterOptionButtonActive,
                ]}>
                <Text
                  style={[
                    styles.filterOptionText,
                    filterCriteria.sortBy === 'latest' &&
                      styles.filterOptionTextActive,
                  ]}>
                  Latest
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setFilterCriteria({...filterCriteria, sortBy: 'oldest'})
                }
                style={[
                  styles.filterOptionButton,
                  filterCriteria.sortBy === 'oldest' &&
                    styles.filterOptionButtonActive,
                ]}>
                <Text
                  style={[
                    styles.filterOptionText,
                    filterCriteria.sortBy === 'oldest' &&
                      styles.filterOptionTextActive,
                  ]}>
                  Oldest
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter by Year</Text>
            <View style={styles.filterOptionsContainer}>
              {getUniqueYears().map(year => (
                <Pressable
                  key={year}
                  onPress={() => setFilterCriteria({...filterCriteria, year})}
                  style={[
                    styles.filterOptionButton,
                    filterCriteria.year === year &&
                      styles.filterOptionButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterCriteria.year === year &&
                        styles.filterOptionTextActive,
                    ]}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter by Status</Text>
            <View style={styles.filterOptionsContainer}>
              {getUniqueStatuses().map(status => (
                <Pressable
                  key={status}
                  onPress={() => setFilterCriteria({...filterCriteria, status})}
                  style={[
                    styles.filterOptionButton,
                    filterCriteria.status === status &&
                      styles.filterOptionButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterCriteria.status === status &&
                        styles.filterOptionTextActive,
                    ]}>
                    {status}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsFilterModalVisible(false)}
            style={styles.applyFiltersButton}>
            <Text style={styles.applyFiltersText}>Apply</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    const dataToRender = filteredData.slice(0, visibleItems);

    return (
      <FlashList
        data={dataToRender}
        renderItem={({item, index}) => (
          <RenderOfficeDelays
            item={item}
            index={index}
            onPressItem={() => onPressItem(index)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item, index) =>
          item && item.Id ? item.Id.Id.toString() : index.toString()
        }
        style={styles.transactionList}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          isLoadingMore ? (
            <ActivityIndicator
              size="small"
              color="#1A237E"
              style={styles.loadingMoreIndicator}
            />
          ) : null
        }
        ListEmptyComponent={() =>
          !delaysLoading &&
          dataToRender.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>NO RESULTS FOUND</Text>
            </View>
          )
        }
        estimatedItemSize={shimmerHeight + 16}
      />
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.mainContainer}>
        <LinearGradient
          colors={['#1A508C', '#004ab1']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.topHeader}>
          <Pressable
            style={styles.backButton}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: true,
              radius: 20,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          {isSearching ? (
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#ccc"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <Pressable
                style={styles.iconButton}
                android_ripple={{
                  color: 'rgba(255,255,255,0.2)',
                  borderless: true,
                  radius: 20,
                }}
                onPress={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }}>
                <Icon name="close" size={24} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.topHeaderTitle}>Office Delays</Text>
              </View>
              <View style={styles.headerRightIcons}>
                <Pressable
                  style={styles.iconButton}
                  android_ripple={{
                    color: 'rgba(255,255,255,0.2)',
                    borderless: true,
                    radius: 20,
                  }}
                  onPress={() => setIsSearching(true)}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={26}
                    color="#fff"
                  />
                </Pressable>
                <Pressable
                  style={styles.iconButton}
                  android_ripple={{
                    color: 'rgba(255,255,255,0.2)',
                    borderless: true,
                    radius: 20,
                  }}
                  onPress={() => setIsFilterModalVisible(true)}>
                  <MaterialCommunityIcons
                    name="filter-menu-outline"
                    size={26}
                    color="#fff"
                  />
                </Pressable>
              </View>
            </>
          )}
        </LinearGradient>
        {showWarningBanner && (
          <View style={styles.warningBanner}>
            <View style={styles.warningBannerContent}>
              <Text style={styles.warningTitle}>
                You have {delayedCount} Delayed Transactions!
              </Text>
              <Text style={styles.warningText}>
                Hello there! 👋 This list shows transactions delayed by more
                than 3 days. Please cancel the tracking if not continued,
                otherwise, take action.
              </Text>
              <Text style={styles.warningSignature}>
                — from Project Doctrack
              </Text>
            </View>
            <Pressable
              onPress={() => setShowWarningBanner(false)}
              style={styles.closeButton}
              android_ripple={{
                color: 'rgba(255,255,255,0.2)',
                borderless: true,
                radius: 15,
              }}>
              <Icon name="close-circle" size={24} color="#856404" />
            </Pressable>
          </View>
        )}
        {delaysLoading ? (
          <View style={styles.shimmerList}>
            {[...Array(7)].map((_, index) => (
              <Shimmer
                key={index}
                width={shimmerWidth}
                height={shimmerHeight}
                borderRadius={12}
              />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>{renderContent()}</View>
        )}
      </View>
      {isFilterModalVisible && renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F7F9',
  },
  topHeader: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingLeft: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    //alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRightIcons: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  warningBanner: {
    backgroundColor: '#fff3cd',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  warningBannerContent: {
    flex: 1,
    marginRight: 10,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 5,
  },
  warningSignature: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'right',
  },
  closeButton: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    height: 30,
    width: 30,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLayout: {
    flexDirection: 'row',
    padding: 16,
  },
  indexColumn: {
    marginRight: 10,
    alignItems: 'center',
  },
  indexText: {
    color: '#007bff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mainInfoLeft: {
    flex: 1,
    marginRight: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  trackingNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  trackingNumber: {
    color: '#1A237E',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  documentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  documentType: {
    marginLeft: 5,
    color: '#616161',
    fontFamily: 'Montserrat-Light',
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  documentStatus: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  delayedDaysContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  delayedDays: {
    color: '#FF9800',
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
  },
  daysDelayedText: {
    color: '#FF9800',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  amountText: {
    color: '#333',
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  monthYearText: {
    color: '#616161',
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 5,
    color: '#9E9E9E',
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
  },
  shimmerWrapper: {
    overflow: 'hidden',
    backgroundColor: '#EAEAEA',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
  },
  shimmerList: {
    gap: 10,
    marginTop: 20,
  },
  gradient: {
    flex: 1,
  },
  noResultsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  noResultsText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#616161',
    fontSize: 18,
  },
  loadingMoreIndicator: {
    paddingVertical: 20,
  },

  // Bottom Sheet styles
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    fontFamily: 'Montserrat-Bold',
  },
  modalCloseButton: {
    padding: 5,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOptionButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  filterOptionButtonActive: {
    backgroundColor: '#1A237E',
  },
  filterOptionText: {
    color: '#333',
    fontFamily: 'Montserrat-Medium',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  clearFiltersButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F4F7F9',
  },
  clearFiltersText: {
    color: '#616161',
    fontFamily: 'Montserrat-Bold',
  },
  applyFiltersButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#007bff',
  },
  applyFiltersText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
});

export default OfficeDelaysScreen;
