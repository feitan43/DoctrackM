import React, {useState, memo, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown'; // Import Dropdown
//import {SafeAreaView} from 'react-native-safe-area-context';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import {PaperProvider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import useRegTrackingSummaryList from '../api/useRegTrackingSummaryList';
import {officeMap} from '../utils/officeMap';

// Define a consistent color palette for minimalist and modern design
const Colors = {
  primaryBackground: '#F8F9FA', // Very light off-white for main background
  cardBackground: '#FFFFFF', // Pure white for cards
  textColorPrimary: '#212529', // Darkest charcoal for main text
  primaryTextLight: '#495057', // Slightly lighter for labels
  textColorSecondary: '#6C757D', // Medium grey for secondary text/labels
  accentColor: 'rgba(12, 126, 247, 1)', // Brighter blue for highlights (Amount)
  shadowColor: 'rgba(0, 0, 0, 0.04)', // Even more subtle shadow
  borderColorLight: '#E0E0E0', // Lighter border for subtle separators and cards
  rippleColor: '#E9ECEF', // For ripple effect feedback
};

const RenderTrackingSummary = memo(({item, index, onPressItem}) => {
  return (
    <Pressable
      onPress={() => onPressItem(index, item)}
      style={({pressed}) => [
        styles.summaryCard,
        {
          backgroundColor: pressed ? '#F2F2F2' : Colors.cardBackground, // Very subtle press feedback
        },
      ]}>
      <View style={styles.cardContent}>
        {/* Index Container - Positioned absolutely at top-left */}
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        {/* Content Section */}
        <View style={styles.detailsContainer}>
          {/* Status and Updated (Emphasized) */}
          <View style={styles.statusSection}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status </Text>
              <Text style={styles.statusValue}>{item.Status}</Text>
            </View>
            {/* Only the updated value, no label, smaller font, right-aligned */}
            <View style={styles.updatedValueContainer}>
              <Text style={styles.updatedValue}>{item.DateModified}</Text>
            </View>
          </View>

          {[
            {label: 'Office ', value: officeMap[item.Office] ?? item.Office},
            {label: 'Claimant ', value: item.Claimant},
            {label: 'TN ', value: item.TrackingNumber},
            //{label: 'PR', value: item.PR_Number},
            //{label: 'PO', value: item.PO_Number},
            {label: 'Document ', value: item.Document},
            {label: 'Amount ', value: insertCommas(item.Amount ?? '')},
          ].map((field, idx) => (
            <View key={idx} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{field.label}</Text>
              <Text
                style={[
                  styles.detailValue,
                  field.label === 'Amount ' && styles.amountValue,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {field.value}
              </Text>
            </View>
          ))}
        </View>
        {/* Arrow Icon to indicate pressability */}
        <Icon
          name="chevron-forward"
          size={20}
          color={Colors.textColorSecondary}
          style={styles.arrowIcon}
        />
      </View>
    </Pressable>
  );
});

const RegTrackingSummaryScreen = ({route}) => {
  const {selectedItem} = route.params; // Get selectedItem from route.params
  const {
    regTrackingSummaryListData,
    regTrackingSummaryListLoading,
    regTrackingSummaryListError,
    refetchRegTrackingSummaryList,
  } = useRegTrackingSummaryList(selectedItem.Status, selectedItem.Year);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState('All'); // State for office filter
  const navigation = useNavigation();

  // Prepare data for the Dropdown component
  const dropdownData = useMemo(() => {
    const offices = new Set();
    regTrackingSummaryListData.forEach(item => {
      if (item.Office) {
        offices.add(officeMap[item.Office] ?? item.Office);
      }
    });
    const officeOptions = Array.from(offices).map(office => ({
      label: office,
      value: office,
    }));
    return [{label: 'All', value: 'All'}, ...officeOptions];
  }, [regTrackingSummaryListData]);


  const filteredData = useMemo(() => {
    if (selectedOffice === 'All') {
      return regTrackingSummaryListData;
    }
    return regTrackingSummaryListData.filter(
      item => (officeMap[item.Office] ?? item.Office) === selectedOffice
    );
  }, [regTrackingSummaryListData, selectedOffice]);


  // Dashboard calculations - only totalItems is needed for the requested card
  const totalItems = filteredData.length; // Use filteredData for total items

  const totalOffices = useMemo(() => {
    const offices = new Set();
    filteredData.forEach(item => { // Use filteredData
      if (item.Office) {
        offices.add(item.Office);
      }
    });
    return offices.size;
  }, [filteredData]); // Dependency on filteredData

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSelectedOffice('All'); // Reset filter on refresh
    await refetchRegTrackingSummaryList();
    setVisibleItems(10);
    setIsLoadingMore(false);
    setRefreshing(false);
  }, [refetchRegTrackingSummaryList]);

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {
        selectedItem: filteredData[index], // Use filteredData
      });
    },
    [navigation, filteredData], // Dependency on filteredData
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && filteredData.length > visibleItems) { // Use filteredData
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const renderContent = () => {
    return (
      <View style={{flex: 1}}>
        {/* Dashboard Card with three columns */}
        <View style={styles.dashboardContainerSingleCard}>
          <View style={styles.dashboardCardThreeColumns}>
            {/* Column 1: Total Tracking */}
            <View style={styles.totalTrackingColumn}>
              <Text style={styles.totalTrackingLabelColumn}>
                Total Tracking
              </Text>
              <Text style={styles.totalTrackingValueColumn}>{totalItems}</Text>
            </View>

            {/* Vertical Separator 1 */}
            <View style={styles.verticalDivider} />

            {/* Column 2: Total Offices */}
            <View style={styles.totalOfficesColumn}>
              <Text style={styles.totalOfficesLabelColumn}>
                Total{'\n'}Offices
              </Text>
              <Text style={styles.totalOfficesValueColumn}>{totalOffices}</Text>
            </View>

            {/* Vertical Separator 2 */}
            <View style={styles.verticalDivider} />

            {/* Column 3: Status and Year */}
            <View style={styles.statusYearColumn}>
              <View style={styles.statusYearRowSingle}>
                <Text style={styles.statusYearLabelColumn}>Year </Text>
                <Text style={styles.statusYearValueColumn}>
                  {selectedItem.Year}
                </Text>
              </View>
              <View style={styles.statusYearRowSingle}>
                <Text style={styles.statusYearLabelColumn}>Status </Text>
                <Text style={styles.statusYearValueColumn}>
                  {selectedItem.Status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Office Filter using Dropdown */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Office:</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={dropdownData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select item"
            searchPlaceholder="Search..."
            value={selectedOffice}
            onChange={item => {
              setSelectedOffice(item.value);
            }}
            renderLeftIcon={() => (
              <Icon style={styles.icon} color="black" name="business" size={20} />
            )}
          />
        </View>


        <FlatList
          data={filteredData.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RenderTrackingSummary
              item={item}
              index={index}
              onPressItem={onPressItem}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyExtractor={(item, index) =>
            item && item.Id ? item.Id.toString() : index.toString()
          }
          style={styles.transactionList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          initialNumToRender={10}
          windowSize={5}
          ListFooterComponent={() =>
            regTrackingSummaryListLoading && !isLoadingMore ? (
              <ActivityIndicator
                color={Colors.accentColor}
                size="small"
                style={styles.footerActivityIndicator}
              />
            ) : null
          }
        />
        {isLoadingMore && (
          <View style={styles.loadMoreIndicatorContainer}>
            <ActivityIndicator size="large" color={Colors.textColorSecondary} />
          </View>
        )}
      </View>
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.cardBackground}
        /> */}
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({pressed}) => [
                pressed && {backgroundColor: 'rgba(0, 0, 0, 0.03)'},
                styles.backButton,
              ]}
              android_ripple={{
                color: Colors.rippleColor,
                borderless: true,
                radius: 24,
              }}
              onPress={() => navigation.goBack()}>
              <Icon
                name="arrow-back"
                size={24}
                color={Colors.textColorSecondary}
              />
            </Pressable>

            <Text style={styles.headerTitle}>Tracking Summary</Text>
          </View>

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            {regTrackingSummaryListLoading &&
            (!regTrackingSummaryListData ||
              regTrackingSummaryListData.length === 0) ? (
              <View style={styles.loadingShimmerContainer}>
                {[...Array(7)].map((_, index) => (
                  <Shimmer key={index} />
                ))}
              </View>
            ) : regTrackingSummaryListError ? (
              <View style={styles.errorStateContainer}>
                <Image
                  source={require('../../assets/images/errorState.png')}
                  style={styles.errorImage}
                />
                <Text style={styles.errorText}>
                  {typeof regTrackingSummaryListError === 'string'
                    ? regTrackingSummaryListError
                    : regTrackingSummaryListError.message ||
                      'An unknown error occurred'}
                </Text>
              </View>
            ) : regTrackingSummaryListData === null ||
              regTrackingSummaryListData.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Image
                  source={require('../../assets/images/noresultsstate.png')}
                  style={styles.noResultsImage}
                />
                <Text style={styles.emptyText}>NO RESULTS FOUND</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>{renderContent()}</View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingTop:40,
    paddingVertical: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  backButton: {
    padding: 10,
    borderRadius: 24,
    marginLeft: 5,
  },
  headerTitle: {
    padding: 10,
    color: Colors.textColorPrimary,
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 20,
    flex: 1,
  },
  contentArea: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
    paddingTop: 15,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  transactionList: {},

  // Dashboard Card with three columns (formerly two)
  dashboardContainerSingleCard: {
    marginBottom: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dashboardCardThreeColumns: {
    flexDirection: 'row', // Main container is a row for three columns
    justifyContent: 'space-around', // Distribute space between columns
    alignItems: 'center', // Vertically center content of each column
    paddingVertical: 10,
    paddingHorizontal: 15,
    //backgroundColor:'#dfe8f8ff',
    borderRadius:10,
    backgroundColor:'white',
    elevation:1
  },
  totalTrackingColumn: {
    // Renamed from totalItemsColumn
    flex: 1, // Adjusted flex for a three-column layout
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  totalTrackingLabelColumn: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorSecondary,
    marginBottom: 3,
    textAlign: 'center',
  },
  totalTrackingValueColumn: {
    fontSize: 28,
    fontFamily: 'Inter_28pt-Bold',
    color: Colors.accentColor,
  },
  totalOfficesColumn: {
    // New column for Total Offices
    flex: 1, // Adjusted flex for a three-column layout
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  totalOfficesLabelColumn: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorSecondary,
    marginBottom: 3,
    textAlign: 'center',
  },
  totalOfficesValueColumn: {
    fontSize: 28,
    fontFamily: 'Inter_28pt-Bold',
    color: Colors.accentColor,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth, // Thin vertical line
    height: '80%', // Takes up most of the height
    backgroundColor: Colors.borderColorLight,
    marginHorizontal: 10, // Space around the divider
  },
  statusYearColumn: {
    flex: 1.5, // Adjusted flex to keep more space for this column
    alignItems: 'flex-start', // Align labels/values to the left within this column
    paddingLeft: 10, // Padding after the divider
  },
  statusYearRowSingle: {
    flexDirection: 'column', // Each status/year pair is a row
    //alignItems: 'center',
    marginBottom: 10, // Increased space between status and year rows
  },
  statusYearLabelColumn: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.primaryTextLight,
    marginRight: 5, // Space between label and value
    fontWeight: 'normal', // Label should not be bold
  },
  statusYearValueColumn: {
    fontSize: 15,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorPrimary,
    fontWeight: 'bold', // Value should be bold
  },

  // RenderTrackingSummary Styles (Existing, kept for completeness)
  summaryCard: {
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderColorLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingLeft: 50,
  },
  indexContainer: {
    position: 'absolute',
    top: 15,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.borderColorLight,
    borderRadius: 8,
    zIndex: 1,
  },
  indexText: {
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.primaryTextLight,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  statusSection: {
    flexDirection: 'column', // Changed to column to stack Status and Updated rows
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: Colors.borderColorLight,
  },
  statusRow: { // Style for the Status label and value row
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // No marginBottom here, as updatedValueContainer handles spacing
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Oswald Regular',
    color: Colors.primaryTextLight,
    width: '30%',
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Oswald Regular',
    color: Colors.textColorPrimary,
    flex: 1,
    textAlign: 'right',
  },
  updatedValueContainer: { // New style for the container of the updated value
    alignSelf: 'flex-end', // Aligns the value to the right within the statusSection
    marginTop: 5, // Small space below Status value
    paddingRight: 0, // No extra padding needed
  },
  updatedValue: { // New style for the smaller "Updated" value font
    fontSize: 12,
    color: Colors.textColorSecondary, // Slightly subdued color for secondary info
    fontFamily: 'Oswald Regular',
    textAlign: 'right', // Ensure it aligns right
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Oswald Regular',
    color: Colors.primaryTextLight,
    width: '40%',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textColorPrimary,
    fontFamily: 'Oswald Regular',
    flex: 1,
    textAlign: 'left',
  },
  amountValue: {
    color: Colors.accentColor,
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 15,
    alignSelf: 'center',
    position: 'absolute',
    right: 15,
    bottom: 15,
  },

  // Filter styles
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align to the right
    paddingHorizontal: 15,
    marginBottom: 10,
    zIndex: 10, // Ensure dropdown appears above list items
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorPrimary,
    marginRight: 10,
  },
  dropdown: {
    height: 40,
    width: 180, // Adjust width as needed for the dropdown
    borderColor: Colors.borderColorLight,
    borderWidth: 0.8,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorSecondary,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorPrimary,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    fontFamily: 'Oswald Regular',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  // Add itemTextStyle and containerStyle if needed for dropdown options appearance
  itemTextStyle: {
    fontSize: 14,
    fontFamily: 'Oswald Regular',
    color: Colors.textColorPrimary,
  },
  containerStyle: {
    borderRadius: 8,
    borderColor: Colors.borderColorLight,
    borderWidth: 0.8,
  },


  // Loading, Error, Empty States (Existing, kept for completeness)
  loadingShimmerContainer: {
    gap: 12,
    marginTop: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  errorImage: {
    width: '70%',
    height: '30%',
    resizeMode: 'contain',
    marginBottom: 30,
  },
  errorText: {
    fontFamily: 'Oswald-Light',
    alignSelf: 'center',
    color: Colors.textColorSecondary,
    fontSize: 18,
    textAlign: 'center',
    padding: 5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  noResultsImage: {
    width: '70%',
    height: '30%',
    resizeMode: 'contain',
    marginBottom: 30,
  },
  emptyText: {
    fontFamily: 'Oswald-Light',
    alignSelf: 'center',
    color: Colors.textColorSecondary,
    fontSize: 18,
    textAlign: 'center',
    padding: 5,
  },

  // Load More Indicator (Existing, kept for completeness)
  loadMoreIndicatorContainer: {
    paddingVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerActivityIndicator: {
    paddingVertical: 20,
  },
});

export default RegTrackingSummaryScreen;