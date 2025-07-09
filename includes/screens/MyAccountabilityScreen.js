import React, {
  useEffect,
  useState,
  memo,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator, // Make sure ActivityIndicator is imported
  TouchableOpacity,
  Pressable,
  ImageBackground,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Modal,
  Button,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import useMyAccountability from '../api/useMyAccountabilty';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {InteractionManager} from 'react-native';
import {width, currentYear, categoryIconMap} from '../utils';

const MyAccountabilityScreen = ({navigation}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const {accountabilityData, loading, error, fetchMyAccountability} =
    useMyAccountability();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  useEffect(() => {
    // No animations tied to fixed categories anymore.
  }, [loading, error, accountabilityData]);

  const handleClose = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      bottomSheetRef.current?.close();
      setSelectedCategory(null);
    });
  }, []);

  const handlePress = useCallback(item => {
    setSelectedCategory(item);
    InteractionManager.runAfterInteractions(() => {
      bottomSheetRef.current?.snapToIndex(1); // Open the bottom sheet to the first snap point
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!accountabilityData || !selectedCategory) {
      return [];
    }
    // Filter by the CategoryDescription from the selectedCategory item
    // For 'Uncategorized', filter items where CategoryDescription is null or empty
    if (selectedCategory.name === 'Uncategorized') {
      return accountabilityData.filter(
        item => item.CategoryDescription === null || item.CategoryDescription === '',
      );
    }
    return accountabilityData.filter(
      item => item.CategoryDescription === selectedCategory.name,
    );
  }, [accountabilityData, selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchMyAccountability();
    setRefreshing(false);
  }, [fetchMyAccountability]);

  const onPressItem = useCallback(
    index => {
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('MyAccountabilityDetails', {
          selectedItem: filteredData[index],
          selectedIcon: selectedCategory?.icon,
          selectedName: selectedCategory?.name,
        });
        bottomSheetRef.current?.close(); // Close bottom sheet after navigating
      });
    },
    [navigation, filteredData, selectedCategory],
  );

  // Dynamically generate categories from accountabilityData based on CategoryDescription
  const dynamicCategories = useMemo(() => {
    if (!accountabilityData) {
      return [];
    }

    const categoriesMap = new Map();
    accountabilityData.forEach(item => {
      // Use CategoryDescription for grouping, falling back to 'Uncategorized'
      const categoryName = item.CategoryDescription || 'Uncategorized';
      if (!categoriesMap.has(categoryName)) {
        const iconName = categoryIconMap[categoryName] || 'dots-horizontal';

        categoriesMap.set(categoryName, {
          name: categoryName,
          icon: iconName,
          cat: [categoryName], // Kept for consistency, though 'name' is the primary identifier
        });
      }
    });
    return Array.from(categoriesMap.values());
  }, [accountabilityData]);

  const renderShimmerCategories = () => (
    <FlatList
      data={Array.from({length: 6})}
      keyExtractor={(item, index) => `shimmer-${index}`}
      numColumns={3}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingVertical: 10, paddingHorizontal: 12}}
      renderItem={({index}) => (
        <View style={{flex: 1 / 3, margin: 8, alignItems: 'center'}}>
          <Shimmer
            width={width * 0.29}
            height={width * 0.29}
            style={{borderRadius: 12}}
            key={`shimmer-${index}`}
          />
        </View>
      )}
    />
  );

  const renderContent = () => {
    if (loading && !accountabilityData) { // Check both loading and if data is null/empty
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>Your Accountabilities</Text>
            {/* Shimmer for dashboard rows */}
            <View style={styles.dashboardRow}>
              <View style={styles.dashboardLabelContainer}>
                <Shimmer width={20} height={20} style={styles.dashboardIcon} />
                <Shimmer width={100} height={18} />
              </View>
              <Shimmer width={50} height={22} />
            </View>
            <View style={styles.dashboardRow}>
              <View style={styles.dashboardLabelContainer}>
                <Shimmer width={20} height={20} style={styles.dashboardIcon} />
                <Shimmer width={120} height={18} />
              </View>
              <Shimmer width={50} height={22} />
            </View>
          </View>
          <Text style={styles.sectionTitle}>Categories</Text>
          {renderShimmerCategories()}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We couldn’t load your accountabilities. Please check your connection
            and try again.
          </Text>
          <TouchableOpacity
            onPress={fetchMyAccountability}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!accountabilityData || accountabilityData.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Icons
              name="clipboard-text-off-outline"
              size={80}
              color="#b0b0b0"
            />
            <Text style={styles.emptyStateTitle}>
              No Accountabilities Found
            </Text>
            <Text style={styles.emptyStateMessage}>
              You currently have no items assigned to you.
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const relevantCategories = dynamicCategories;

    return (
      <View style={{flex: 1}}>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardTitle}>Your Accountabilities</Text>
          {/* Changed dashboardRow for Total Items */}
          <View style={styles.dashboardRow}>
            <View style={styles.dashboardLabelContainer}>
                <Icons name="format-list-bulleted" size={20} color="#555" style={styles.dashboardIcon} />
                <Text style={styles.dashboardLabel}>Total Items:</Text>
            </View>
            <Text style={styles.dashboardValue}>
              {accountabilityData.length}
            </Text>
          </View>
          {/* Changed dashboardRow for Total Categories */}
          <View style={styles.dashboardRow}>
            <View style={styles.dashboardLabelContainer}>
                <Icons name="folder-multiple-outline" size={20} color="#555" style={styles.dashboardIcon} />
                <Text style={styles.dashboardLabel}>Total Categories:</Text>
            </View>
            <Text style={styles.dashboardValue}>
              {relevantCategories.length}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        <FlatList
          data={relevantCategories}
          keyExtractor={(item, index) =>
            item?.name ? String(item.name) : `fallback-${index}`
          }
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 10, paddingHorizontal: 12}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1A508C']}
              tintColor={'#1A508C'}
            />
          }
          renderItem={({item, index}) => {
            let categoryCount;
            if (item.name === 'Uncategorized') {
              // Count items with null or empty CategoryDescription for 'Uncategorized'
              categoryCount = accountabilityData.filter(
                dataItem =>
                  dataItem.CategoryDescription === null ||
                  dataItem.CategoryDescription === '',
              ).length;
            } else {
              // Count items based on CategoryDescription for other categories
              categoryCount = accountabilityData.filter(
                dataItem => dataItem.CategoryDescription === item.name,
              ).length;
            }

            return (
              <View style={styles.categoryCardWrapper}>
                <TouchableOpacity
                  style={styles.categoryCardTouchable}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={['#1A508C', '#1A508C']}
                    style={styles.categoryCardGradient}>
                    {/* Position the count at the top right */}
                    <View style={styles.categoryCountContainer}>
                      <Text style={styles.categoryCardCountValue}>
                        {categoryCount}
                      </Text>
                    </View>

                    <Icons
                      name={item.icon}
                      size={40}
                      color="#fff"
                      style={{marginBottom: 6}}
                    />
                    <Text style={styles.categoryCardName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F8F9FB'}}>
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/CirclesBG.png')}
          style={styles.headerBackground}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              android_ripple={styles.backButtonRipple}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </Pressable>
            {/* <Text style={styles.headerTitle}>Accountabilities</Text> */}
            <View style={{width: 40}} />
          </View>
        </ImageBackground>

        <View style={styles.contentArea}>{renderContent()}</View>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={handleClose}
          backgroundStyle={styles.bottomSheetBackground}
          handleComponent={null}
          backdropComponent={props => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
            />
          )}>
          <LinearGradient
            colors={['#1A508C', '#004ab1']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHeaderContent}>
              <Icons
                name={selectedCategory?.icon}
                size={48}
                color="white"
                style={{marginBottom: 8}}
              />
              <Text style={styles.bottomSheetCategoryName}>
                {selectedCategory?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.bottomSheetCloseButton}>
              <Icons name="close-circle-outline" size={30} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <BottomSheetFlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.Id?.toString() || index.toString()
            }
            contentContainerStyle={styles.bottomSheetListContent}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => onPressItem(index)}
                activeOpacity={0.8}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIndex}>{index + 1} </Text>
                  <View style={styles.headerRightContent}>
                    <Text style={styles.itemTrackingNumber}>
                      {item?.Year} |{' '}
                      <Text style={styles.itemName}>
                        {item?.TrackingNumber ?? 'N/A'}
                      </Text>
                    </Text>
                    <Text style={styles.itemIdText}>
                      Set:{' '}
                      <Text style={{fontWeight: 'bold', fontSize: 16}}>
                        {item?.Set ?? '0'}
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand </Text>
                  <Text style={styles.detailValue}>{item?.Brand ?? 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cost </Text>
                  <Text style={styles.detailValue}>
                    ₱{insertCommas(item?.UnitCost) ?? '0.00'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total </Text>
                  <Text style={styles.detailValue}>
                    ₱{insertCommas(item?.Amount) ?? '0.00'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Assigned To </Text>
                  <Text style={styles.detailValue}>
                    {item?.NameAssignedTo ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current User </Text>
                  <Text style={styles.detailValue}>
                    {item?.CurrentUser ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status </Text>
                  <Text style={styles.detailValue}>
                    {item?.Status ?? 'N/A'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.bottomSheetEmpty}>
                <Icons name="magnify-minus-outline" size={50} color="gray" />
                <Text style={styles.bottomSheetEmptyText}>
                  No items found for this category.
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Light background for the overall screen
  },
  headerBackground: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2, // Softer elevation
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonRipple: {
    color: 'rgba(255,255,255,0.2)',
    borderless: true,
    radius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingTop: 5, // Reduced padding top
  },
  // Refined Dashboard Card Styles
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 15,
    padding: 20, // Increased padding slightly for more spacious feel
    borderRadius: 15, // Slightly more rounded
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2}, // Softer shadow
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 0, // Removed border for cleaner look
    borderColor: 'transparent', // Ensure no residual border
  },
  dashboardTitle: {
    fontSize: 17, // Slightly smaller
    fontWeight: '700', // Bolder title
    color: '#333', // Darker, more professional color
    marginBottom: 12,
    borderBottomWidth: 0, // Removed bottom border
    paddingBottom: 0,
    textAlign: 'center', // Center align title
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0, // No margin bottom as padding takes over
    paddingVertical: 12, // More vertical padding for separation and larger touch area
    borderBottomWidth: StyleSheet.hairlineWidth, // Very thin separator
    borderBottomColor: '#EFEFEF', // Light separator color
  },
  dashboardLabelContainer: { // New style for icon and label grouping
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allows it to take available space
  },
  dashboardIcon: { // Style for the new icons
    marginRight: 8,
  },
  dashboardLabel: {
    fontSize: 16, // Slightly larger for better readability
    color: '#555', // Softer black
    fontWeight: '500',
  },
  dashboardValue: {
    fontSize: 22, // Emphasized larger value for impact
    fontWeight: 'bold',
    color: '#1A508C', // Highlight with primary color
    marginLeft: 10, // Space from label
  },
  sectionTitle: {
    paddingHorizontal: 20,
    fontStyle: 'normal', // Removed italic
    color: '#718096',
    fontSize: 14, // Slightly smaller
    marginBottom: 10, // More space
    fontWeight: '600',
    textTransform: 'uppercase', // Uppercase for a modern feel
    letterSpacing: 0.5, // Add letter spacing
  },
  categoryCardWrapper: {
    flex: 1 / 3 ,
    //alignItems: 'center',
    padding: 4, // Increased padding for more spacing around cards
  },
  categoryCardTouchable: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15, // Softer shadow
    shadowRadius: 3,
    //elevation: 5, // Adjusted elevation
    overflow: 'hidden', // Ensures content stays within rounded corners
    position: 'relative', // Crucial for absolute positioning of children
  },
  categoryCountContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle white background
    borderRadius: 10, // Rounded background
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1, // Ensure it's above other content
  },
  categoryCardCountValue: {
    color: 'white', // White text for visibility on gradient
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryCardName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontWeight: '600',
    lineHeight: 18,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bottomSheetHeader: {
    paddingVertical: 18, // More vertical padding
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 2,
  },
  bottomSheetHeaderContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  bottomSheetCategoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  bottomSheetCloseButton: {
    padding: 8, // Larger touch area
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', // Slightly more opaque
  },
  bottomSheetListContent: {
    paddingBottom: 50,
    paddingVertical: 15, // Reduced vertical padding
    paddingHorizontal: 10, // Reduced horizontal padding
  },
  // Refined Item Container (for Bottom Sheet list)
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 18, // Slightly reduced padding
    marginVertical: 6, // Reduced vertical margin
    marginHorizontal: 8, // Reduced horizontal margin
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, // Softer shadow
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4, // Adjusted elevation
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8, // Reduced margin
    borderBottomWidth: StyleSheet.hairlineWidth, // Thin separator
    borderBottomColor: '#F0F0F0', // Light separator
    paddingBottom: 8,
  },
  itemIndex: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6C757D', // Softer color
    marginRight: 8,
    textAlign: 'right',
  },
  headerRightContent: {
    alignItems: 'flex-end',
    flex: 1, // Allow it to take available space
  },
  itemIdText: {
    fontSize: 10,
    textAlign: 'right',
    color: '#A0A0A0', // Lighter grey
    marginBottom: 2,
    fontWeight: '500',
  },
  itemTrackingNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
    textAlign: 'right',
  },
  itemName: {
    fontSize: 18, // Slightly smaller for balance
    fontWeight: 'bold',
    color: '#343A40',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6, // Reduced spacing
    alignItems: 'center', // Align items vertically
  },
  detailLabel: {
    fontSize: 13, // Slightly smaller
    fontWeight: '400', // Lighter weight
    color: '#777', // Softer color
    marginRight: 10,
    minWidth: 80, // Consistent label width
    textAlign: 'right',
  },
  detailValue: {
    flex: 1,
    fontWeight: '500', // Medium weight
    fontSize: 13, // Slightly smaller
    color: '#333',
    lineHeight: 18, // Adjusted line height
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fb',
    marginTop:20
    // flex: 1,
  },
  emptyStateCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyStateMessage: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyAccountabilityScreen;