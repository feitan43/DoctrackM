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
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  ImageBackground,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {InteractionManager} from 'react-native';
import {width, currentYear, categoryIconMap} from '../utils';
import {useMyAccountability} from '../hooks/usePersonal';
import {useInventoryImages} from '../hooks/useInventory';
import { FlashList } from '@shopify/flash-list'; // Add this import

const SNAP_POINTS = ['25%', '50%', '90%'];

const MyAccountabilityScreen = ({navigation}) => {
  //const [selectedYear, setSelectedYear] = useState(currentYear);
  const {
    data: accountabilityData,
    isPending: loading, // Use isPending for initial loading state (replaces isLoading)
    isFetching, // true for any ongoing fetch (initial or refetch)
    isError: error,
    refetch,
  } = useMyAccountability();

  const {data: imageUri, isLoading: imageLoading, isError: imageError} = useInventoryImages();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const bottomSheetRef = useRef(null);

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
      bottomSheetRef.current?.snapToIndex(1);
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!accountabilityData || !selectedCategory) {
      return [];
    }
    if (selectedCategory.name === 'Uncategorized') {
      return accountabilityData.filter(
        item =>
          item.CategoryDescription === null || item.CategoryDescription === '',
      );
    }
    return accountabilityData.filter(
      item => item.CategoryDescription === selectedCategory.name,
    );
  }, [accountabilityData, selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onPressItem = useCallback(
    index => {
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('MyAccountabilityDetails', {
          selectedItem: filteredData[index],
          selectedIcon: selectedCategory?.icon,
          selectedName: selectedCategory?.name,
        });
        bottomSheetRef.current?.close();
      });
    },
    [navigation, filteredData, selectedCategory],
  );

  const dynamicCategories = useMemo(() => {
    if (!accountabilityData) {
      return [];
    }

    const categoriesMap = new Map();
    accountabilityData.forEach(item => {
      const categoryName = item.CategoryDescription || 'Uncategorized';
      if (!categoriesMap.has(categoryName)) {
        const iconName = categoryIconMap[categoryName] || 'dots-horizontal';

        categoriesMap.set(categoryName, {
          name: categoryName,
          icon: iconName,
          cat: [categoryName],
        });
      }
    });
    return Array.from(categoriesMap.values());
  }, [accountabilityData]);

  const renderShimmerCategories = () => (
    <FlatList
      data={Array.from({length: 6})}
      keyExtractor={(_, index) => `shimmer-${index}`}
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
    // Show shimmer only when data is pending (initial load, no data yet)
    if (loading && !accountabilityData) {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>Your Accountabilities</Text>
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
            <View style={styles.dashboardRow}>
              <View style={styles.dashboardLabelContainer}>
                <Shimmer width={20} height={20} style={styles.dashboardIcon} />
                <Shimmer width={120} height={18} />
              </View>
              <Shimmer width={50} height={22} />
            </View>
          </View>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          {renderShimmerCategories()}
        </View>
      );
    }

    if (error && !accountabilityData) {
      return (
        <View style={styles.errorContainer}>
          <Icons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We couldn’t load your accountabilities. Please check your connection
            and try again.
          </Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
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
          <View style={styles.dashboardRow}>
            <View style={styles.dashboardLabelContainer}>
              <Icons
                name="format-list-bulleted"
                size={20}
                color="#555"
                style={styles.dashboardIcon}
              />
              <Text style={styles.dashboardLabel}>Total Items </Text>
            </View>
            <Text style={styles.dashboardValue}>
              {accountabilityData.length}
            </Text>
          </View>
          <View style={styles.dashboardRow}>
            <View style={styles.dashboardLabelContainer}>
              <Icons
                name="folder-multiple-outline"
                size={20}
                color="#555"
                style={styles.dashboardIcon}
              />
              <Text style={styles.dashboardLabel}>Total Categories </Text>
            </View>
            <Text style={styles.dashboardValue}>
              {relevantCategories.length}
            </Text>
          </View>
          <View style={styles.dashboardRow}>
            <View style={styles.dashboardLabelContainer}>
              <Icons
                name="file-image-outline" // Icon for number of files
                size={20}
                color="#555"
                style={styles.dashboardIcon}
              />
              <Text style={styles.dashboardLabel}>Total {/* Uploaded  */}Images </Text>
            </View>
            <Text style={styles.dashboardValue}>
              {
                accountabilityData.filter(item => (item.NumOfFiles || 0) > 0)
                  .length
              }
              <Text style={{fontSize: 13, color: 'gray'}}>
                /{accountabilityData.length}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

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
              refreshing={refreshing || isFetching} // Use refreshing OR isFetching for the pull-to-refresh spinner
              onRefresh={onRefresh}
              colors={['#1A508C']}
              tintColor={'#1A508C'}
            />
          }
          renderItem={({item}) => {
            let categoryCount;
            if (item.name === 'Uncategorized') {
              categoryCount = accountabilityData.filter(
                dataItem =>
                  dataItem.CategoryDescription === null ||
                  dataItem.CategoryDescription === '',
              ).length;
            } else {
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
                    colors={['#fff', '#fff']}
                    //colors={['#1A508C', '#1A508C']}
                    style={styles.categoryCardGradient}>
                    <View style={styles.categoryCountContainer}>
                      <Text style={styles.categoryCardCountValue}>
                        {categoryCount}
                      </Text>
                    </View>

                    <Icons
                      name={item.icon}
                      size={40}
                      //color="#fff"
                      color="#1A508C"
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

        {/* Optional: Add a subtle overlay spinner when isFetching is true but not already handled by RefreshControl */}
        {isFetching && !refreshing && (
          <View style={styles.overlayLoading}>
            <ActivityIndicator size="large" color="#1A508C" />
          </View>
        )}
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
            <View style={{width: 40}} />
          </View>
        </ImageBackground>

        <View style={styles.contentArea}>{renderContent()}</View>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={SNAP_POINTS}
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
               {/*  <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Id </Text>
                  <Text style={styles.detailValue}>{item?.Id ?? 'N/A'}</Text>
                </View> */}
               {/*  <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Office </Text>
                  <Text style={styles.detailValue}>{item?.Office ?? 'N/A'}</Text>
                </View> */}

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

                <LinearGradient
                  colors={
                    (item?.NumOfFiles || 0) > 0
                      ? ['#4CAF50', '#66BB6A'] // Green for "There are Images"
                      : ['#F44336', '#EF5350'] // Red for "No Images added yet"
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.imageStatusChip}>
                  <Icons
                    name={(item?.NumOfFiles || 0) > 0 ? 'image' : 'image-off'}
                    size={16}
                    color="white"
                    style={styles.imageStatusIcon}
                  />
                  <Text style={styles.imageStatusText}>
                    {(item?.NumOfFiles || 0) > 0
                      ? 'There are Images'
                      : 'No Images added yet'}
                  </Text>
                </LinearGradient>
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
    backgroundColor: '#F8F9FB',
  },
  headerBackground: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
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
    paddingTop: 5,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 0,
    borderColor: 'transparent',
  },
  dashboardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFEFEF',
  },
  dashboardLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dashboardIcon: {
    marginRight: 8,
  },
  dashboardLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  dashboardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A508C',
    marginLeft: 10,
  },
  sectionTitle: {
    fontStyle: 'normal',
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    // Removed marginBottom as padding on sectionTitleContainer handles spacing
  },
  sectionTitleContainer: {
    backgroundColor: '#F8F9FB', // Match your screen's background color
    paddingVertical: 10, // Provides space above and below the text
    paddingHorizontal: 20,
    //zIndex: 1, // Ensures the title and its shadow appear above scrolling content
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1, // Creates a shadow below the container, mimicking a border
    },
    shadowOpacity: 0.1, // Adjust for desired shadow intensity
    shadowRadius: 1, // Adjust for desired shadow blur
    elevation: 1, // Android specific shadow property
  },
  categoryCardWrapper: {
    flex: 1 / 3,
    padding: 4,
  },
  categoryCardTouchable: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#718096',
  },
  categoryCardGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryCountContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgb(236, 236, 236)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  categoryCardCountValue: {
    color: '#252525',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryCardName: {
    //color: 'white',
    color: '#1A508C',
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
    paddingVertical: 18,
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  bottomSheetListContent: {
    paddingBottom: 50,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  itemIndex: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6C757D',
    marginRight: 8,
    textAlign: 'right',
  },
  headerRightContent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  itemIdText: {
    fontSize: 10,
    textAlign: 'right',
    color: '#A0A0A0',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343A40',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#777',
    marginRight: 10,
    minWidth: 80,
    textAlign: 'right',
  },
  detailValue: {
    flex: 1,
    fontWeight: '500',
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
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
    marginTop: 20,
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
  overlayLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  imageStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20, // Makes it look like a chip
    marginTop: 10, // Adds some space from the details above
    alignSelf: 'flex-start', // Centers the chip if it's the only thing on its line
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  imageStatusIcon: {
    marginRight: 5,
  },
  imageStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MyAccountabilityScreen;
