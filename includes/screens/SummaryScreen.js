import React, {
  useEffect,
  useState,
  useCallback,
  memo,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import useDelaysRegOffice from '../api/useDelaysRegOffice';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const shimmerWidth = width * 0.95;
const shimmerHeight = height * 0.17;

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
        style={[{...StyleSheet.absoluteFillObject, transform: [{translateX}]}, { borderRadius, overflow: 'hidden' }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

function insertCommas(value) {
  if (value === null || value === undefined) {
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

const RegOfficeDelaysData = memo(
  ({item, index, onPressItem}) => {
    const itemStyles = StyleSheet.create({
      container: {
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
      },
      contentWrapper: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        paddingHorizontal: 15,
      },
      rowStart: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      indexContainer: {
        marginRight: 10,
      },
      indexText: {
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 12,
        paddingVertical: 3,
        fontWeight: '600',
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        borderRadius: 4,
      },
      detailsColumn: {
        flex: 1,
        paddingStart: 0,
      },
      trackingNumberRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
      },
      yearText: {
        paddingHorizontal: 5,
        fontWeight: 'normal',
        color: '#6C757D',
        fontSize: 14,
        textAlign: 'center',
      },
      separatorText: {
        color: '#6C757D',
        fontSize: 16,
        marginHorizontal: 5,
      },
      trackingNumberText: {
        fontWeight: 'bold',
        color: '#343A40',
        fontSize: 18,
      },
      infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
        justifyContent: 'space-between',
        //alignItems: 'baseline',
      },
      infoRowLast: {
        flexDirection: 'row',
        marginBottom: 15,
        justifyContent: 'space-between',
        alignItems: 'baseline',
      },
      infoLabel: {
        color: 'black',
        fontWeight: 'normal',
        fontSize: 13,
        fontFamily: 'Inter-Regular',
      },
      infoValue: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        textAlign: 'right',
        flexShrink: 1,
      },
      statusValue: {
        fontWeight: 'bold',
        fontSize: 16,
        textShadowRadius: 0,
        elevation: 0,
        textShadowOffset: {width: 0, height: 0},
        fontFamily: 'Inter-Bold',
        textAlign: 'right',
        flexShrink: 1,
      },
      delayedDaysCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(6, 70, 175, 0.08)',
        borderRadius: 8,
        alignSelf: 'stretch',
      },
      delayedDaysColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        rowGap: -5,
      },
      delayedDaysValue: {
        color: '#0D6EFD',
        fontWeight: 'bold',
        fontSize: 42,
        lineHeight: 48,
        fontFamily: 'Inter-Bold',
      },
      delayedDaysLabel: {
        color: '#495057',
        fontWeight: '600',
        fontSize: 11,
        textTransform: 'uppercase',
        fontFamily: 'Inter-SemiBold',
      },
      lastUpdatedColumn: {
        alignItems: 'flex-end',
      },
      lastUpdatedLabel: {
        color: '#6C757D',
        fontWeight: '300',
        fontSize: 11,
        fontFamily: 'Inter-Light',
      },
      lastUpdatedValue: {
        color: '#495057',
        fontWeight: '400',
        fontSize: 13,
        fontFamily: 'Inter-Regular',
      },
      // Added for status indicator
      statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
      },
    });

    return (
      <View style={itemStyles.container}>
        <TouchableOpacity onPress={() => onPressItem(index, item)}>
          <View style={itemStyles.contentWrapper}>
            <View style={itemStyles.rowStart}>
              <View style={itemStyles.indexContainer}>
                <Text style={itemStyles.indexText}>
                  {index + 1}
                </Text>
              </View>
              <View style={itemStyles.detailsColumn}>
                <View style={itemStyles.trackingNumberRow}>
                  <Text style={itemStyles.yearText}>
                    {item.Year}
                  </Text>
                  <Text style={itemStyles.separatorText}>
                    |
                  </Text>
                  <Text style={itemStyles.trackingNumberText}>
                    {item.TrackingNumber}
                  </Text>
                </View>

                <View style={{marginVertical: 5}}>
                  <View style={itemStyles.infoRow}>
                    <Text style={itemStyles.infoLabel}>
                      Status
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View
                        style={[
                          itemStyles.statusIndicator,
                          {
                            backgroundColor:
                              item.DocumentStatus && item.DocumentStatus.includes('Pending')
                                ? 'rgba(250, 135, 0, 1)'
                                : 'rgba(252, 191, 27, 1)',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          itemStyles.statusValue,
                          {
                            color: item.DocumentStatus && item.DocumentStatus.includes('Pending')
                              ? 'rgba(250, 135, 0, 1)'
                              : 'rgba(252, 191, 27, 1)',
                          },
                        ]}>
                        {item.DocumentStatus}
                      </Text>
                    </View>
                  </View>

                  <View style={itemStyles.infoRow}>
                    <Text style={itemStyles.infoLabel}>
                      Office
                    </Text>
                    <Text style={itemStyles.infoValue}>
                      {item.OfficeName}
                    </Text>
                  </View>

                  <View style={itemStyles.infoRow}>
                    <Text style={itemStyles.infoLabel}>
                      Document
                    </Text>
                    <Text style={itemStyles.infoValue}>
                      {item.DocumentType}
                    </Text>
                  </View>

                  <View style={itemStyles.infoRow}>
                    <Text style={itemStyles.infoLabel}>
                      Amount
                    </Text>
                    <Text style={itemStyles.infoValue}>
                      {insertCommas(item.Amount)}
                    </Text>
                  </View>

                  <View style={itemStyles.infoRowLast}>
                    <Text style={itemStyles.infoLabel}>
                      Month
                    </Text>
                    <Text style={itemStyles.infoValue}>
                      {getMonthName(item.PMonth)}
                    </Text>
                  </View>

                  <View style={itemStyles.delayedDaysCard}>
                    <View style={itemStyles.delayedDaysColumn}>
                      <Text style={itemStyles.delayedDaysValue}>
                        {item.DelayedDays}
                      </Text>
                      <Text style={itemStyles.delayedDaysLabel}>
                        Days Delayed
                      </Text>
                    </View>
                    <View style={itemStyles.lastUpdatedColumn}>
                      <Text style={itemStyles.lastUpdatedLabel}>
                        Last Updated:
                      </Text>
                      <Text style={itemStyles.lastUpdatedValue}>
                        {item.DateModified}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.item === nextProps.item && prevProps.onPressItem === nextProps.onPressItem;
  },
);

const Dropdown = ({ label, options, selectedValue, onSelect, iconName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setIsOpen(false);
  };

  const isFilterActive = selectedValue !== 'All';

  return (
    <View style={dropdownStyles.container}>
      <TouchableOpacity onPress={() => setIsOpen(true)} style={dropdownStyles.button}>
        <Icon name={iconName} size={16} color="#007BFF" />
        <Text style={[
            dropdownStyles.buttonText,
            isFilterActive && dropdownStyles.buttonTextActive
          ]}>
          {selectedValue || label}
        </Text>
        <Icon name={"chevron-down-outline"} size={16} color="#007BFF" />
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={isOpen}
        statusBarTranslucent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={bottomSheetStyles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <Pressable style={bottomSheetStyles.bottomSheet}>
            <View style={bottomSheetStyles.handle} />
            <Text style={bottomSheetStyles.title}>Select {label}</Text>

            <ScrollView style={bottomSheetStyles.scrollView}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    bottomSheetStyles.optionItem,
                    selectedValue === option && bottomSheetStyles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(option)}>
                  <Text style={[
                    bottomSheetStyles.optionItemText,
                    selectedValue === option && bottomSheetStyles.optionItemTextSelected,
                  ]}>
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Icon name="checkmark-outline" size={18} color="#007BFF" style={{ marginLeft: 5 }} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const dropdownStyles = StyleSheet.create({
  container: {
    zIndex: 1,
    marginRight: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
    minWidth: 90,
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#007BFF',
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  buttonTextActive: {
    fontWeight: 'bold', // Make text bolder when filter is active
  },
});

const bottomSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  scrollView: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  optionItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionItemSelected: {
    backgroundColor: '#EBF5FF',
  },
  optionItemText: {
    fontSize: 16,
    color: '#333',
  },
  optionItemTextSelected: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
});

const SummaryScreen = React.memo(
  () => {
    const navigation = useNavigation();
    const {delaysRegOfficeData, delaysLoading} = useDelaysRegOffice();
    const [visibleItems, setVisibleItems] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedOffice, setSelectedOffice] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortOrder, setSortOrder] = useState('desc');


    const filterOptions = useMemo(() => {
      if (!delaysRegOfficeData) {
        return { years: ['All'], offices: ['All'], statuses: ['All'] };
      }

      const years = ['All', ...new Set(delaysRegOfficeData.map(item => item.Year).filter(Boolean))].sort((a,b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a - b;
      });
      const offices = ['All', ...new Set(delaysRegOfficeData.map(item => item.OfficeName).filter(Boolean))].sort();
      const statuses = ['All', ...new Set(delaysRegOfficeData.map(item => item.DocumentStatus).filter(Boolean))].sort();

      return { years, offices, statuses };
    }, [delaysRegOfficeData]);


    const filteredAndSortedData = useMemo(() => {
      if (!delaysRegOfficeData) {
        return [];
      }

      let filteredData = [...delaysRegOfficeData];

      if (selectedYear !== 'All') {
        filteredData = filteredData.filter(item => item.Year === selectedYear);
      }

      if (selectedOffice !== 'All') {
        filteredData = filteredData.filter(item => item.OfficeName === selectedOffice);
      }

      if (selectedStatus !== 'All') {
        filteredData = filteredData.filter(item => item.DocumentStatus === selectedStatus);
      }

      filteredData.sort((a, b) => {
        const delayedDaysA = a.DelayedDays || 0;
        const delayedDaysB = b.DelayedDays || 0;

        if (sortOrder === 'asc') {
          return delayedDaysA - delayedDaysB;
        } else {
          return delayedDaysB - delayedDaysA;
        }
      });

      return filteredData;
    }, [delaysRegOfficeData, selectedYear, selectedOffice, selectedStatus, sortOrder]);


    const onPressItem = useCallback(
      index => {
        navigation.navigate('Detail', {
          selectedItem: filteredAndSortedData[index],
        });
      },
      [navigation, filteredAndSortedData],
    );

    const handleLoadMore = useCallback(() => {
      if (!isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
          setIsLoadingMore(false);
        }, 1000);
      }
    }, [isLoadingMore]);

    const handleScroll = useCallback(
      ({nativeEvent}) => {
        const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
        const paddingToBottom = 20;
        if (
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom
        ) {
          if (visibleItems < filteredAndSortedData.length) {
            handleLoadMore();
          }
        }
      },
      [handleLoadMore, visibleItems, filteredAndSortedData.length],
    );

    const handleFilterChange = useCallback((filterType, value) => {
      if (filterType === 'year') {
        setSelectedYear(value);
      } else if (filterType === 'office') {
        setSelectedOffice(value);
      } else if (filterType === 'status') {
        setSelectedStatus(value);
      } else if (filterType === 'sort') {
        setSortOrder(value);
      }
      setVisibleItems(10);
    }, []);

    const handleResetFilters = useCallback(() => {
      setSelectedYear('All');
      setSelectedOffice('All');
      setSelectedStatus('All');
      setSortOrder('desc');
      setVisibleItems(10);
    }, []);


    const renderContent = () => {
      if (delaysLoading) {
        return (
          <View style={{top: 25}}>
            {[...Array(7)].map((_, index) => (
              <Shimmer
                key={index}
                width={shimmerWidth}
                height={shimmerHeight}
                borderRadius={12} // Match RegOfficeDelaysData borderRadius
              />
            ))}
          </View>
        );
      } else if (delaysRegOfficeData === null || delaysRegOfficeData.length === 0) {
        return (
          <View
            style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              NO DATA AVAILABLE
            </Text>
            {/* Optional: Add an icon here */}
            <Icon name="cloud-offline-outline" size={50} color="#6C757D" style={{marginTop: 10}} />
          </View>
        );
      } else if (filteredAndSortedData.length === 0) {
        return (
          <View
            style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              NO RESULTS FOUND FOR THE APPLIED FILTERS
            </Text>
            {/* Optional: Add an icon here */}
            <Icon name="search-outline" size={50} color="#6C757D" style={{marginTop: 10}} />
          </View>
        );
      }

      return (
        <FlatList
          data={filteredAndSortedData.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RegOfficeDelaysData
              item={item}
              index={index}
              onPressItem={onPressItem}
            />
          )}
          keyExtractor={(item, index) =>
            item && item.Id ? item.Id.toString() : index.toString()
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          ListFooterComponent={() =>
            isLoadingMore && visibleItems < filteredAndSortedData.length ? (
              <ActivityIndicator
                size="small"
                color="black"
                style={{justifyContent: 'center', alignContent: 'center', paddingVertical: 10}}
              />
            ) : null
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      );
    };

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#f0f2f5'}}>
        <ImageBackground
          source={require('../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}
          imageStyle={styles.bgHeaderImageStyle}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="chevron-back-outline" size={26} color="#FFFFFF" />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  marginLeft: 5,
                  fontWeight: 'normal',
                }}>
                Regulatory Office Delays
              </Text>
            </TouchableOpacity>
            <View style={{width: 60}} />
          </View>
        </ImageBackground>

        <View style={styles.filterSortHeader}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterSortScrollViewContent}>
            <Dropdown
              label="Year"
              options={filterOptions.years}
              selectedValue={selectedYear}
              onSelect={(value) => handleFilterChange('year', value)}
              iconName="calendar-outline"
            />
            <Dropdown
              label="Office"
              options={filterOptions.offices}
              selectedValue={selectedOffice}
              onSelect={(value) => handleFilterChange('office', value)}
              iconName="business-outline"
            />
            <Dropdown
              label="Status"
              options={filterOptions.statuses}
              selectedValue={selectedStatus}
              onSelect={(value) => handleFilterChange('status', value)}
              iconName="document-text-outline"
            />
            <Dropdown
              label="Sort"
              options={['Ascending', 'Descending']}
              selectedValue={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              onSelect={(value) => handleFilterChange('sort', value === 'Ascending' ? 'asc' : 'desc')}
              iconName="swap-vertical-outline"
            />
          </ScrollView>
          <View style={styles.filterFooter}>
            <Text style={styles.totalItemsText}>
              Total : <Text style={{fontSize:16, fontWeight:'bold', color: '#007BFF'}}>{filteredAndSortedData.length}</Text>
            </Text>
            <TouchableOpacity onPress={handleResetFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
              <Icon name="close-circle-outline" size={16} color="#007BFF" style={{marginLeft: 5}} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{flex: 1, marginTop: 10}}>
          {renderContent()}
        </View>
      </SafeAreaView>
    );
  },
  () => true,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 30,
    height: 90,
    backgroundColor: '#1a508c',
    paddingHorizontal: 20,
  },
  bgHeaderImageStyle: {
    opacity: 0.8,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 15,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '500',
  },
  noResultsContainer: {
    justifyContent: 'center',
    alignItems: 'center', // Centered horizontally
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 20, // Increased padding
    marginTop: 25,
  },
  noResultsText: {
    fontWeight: '300',
    alignSelf: 'center',
    color: 'black',
    fontSize: 18, // Increased font size
    padding: 5,
    textAlign: 'center', // Center align text
  },
  shimmerWrapper: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    width: shimmerWidth,
    height: shimmerHeight,
  },
  gradient: {
    flex: 1,
  },
  filterSortHeader: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 10,
    overflow: 'visible',
  },
  filterSortScrollViewContent: {
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 10,
    paddingBottom: 5,
  },
  totalItemsText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row', // Align icon and text
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#007BFF',
    fontSize: 13,
    fontWeight: '600',
  },
  itemSeparator: {
    height: 0, // No visible separator if using margin for separation
  },
});

export default SummaryScreen;