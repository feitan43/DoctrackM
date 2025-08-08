import React, {useState, memo, useCallback, useRef, useEffect} from 'react';
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
  Image,
  Modal,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useTrackingSummaryList from '../api/useTrackingSummaryList';
import {Menu, PaperProvider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

// Reusable utility functions
const insertCommas = value => {
  if (value === null) {
    return '';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Function to get the quarter from the month number (1-12)
const getQuarter = monthNumber => {
  if (monthNumber >= 1 && monthNumber <= 3) {
    return 'Q1';
  } else if (monthNumber >= 4 && monthNumber <= 6) {
    return 'Q2';
  } else if (monthNumber >= 7 && monthNumber <= 9) {
    return 'Q3';
  } else if (monthNumber >= 10 && monthNumber <= 12) {
    return 'Q4';
  }
  return '';
};

// Shimmer component from OfficeDelaysScreen
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

const RenderTrackingSummary = memo(({item, index, onPressItem}) => {
  const isPending = item?.Status?.includes('Pending');
  const statusColor = isPending ? '#FF9800' : '#28A745';
  const statusBgColor = isPending ? '#FFF3E0' : '#E6F4EA';

  return (
    <Pressable
      onPress={() => onPressItem(index, item)}
      style={({pressed}) => [
        styles.cardContainer,
        pressed && styles.cardContainerPressed,
      ]}>
      <View style={styles.cardLayout}>
        <View style={styles.indexColumn}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        <View style={styles.contentColumn}>
          <View style={styles.mainInfoContainer}>
            <View style={styles.mainInfoLeft}>
              <View style={styles.trackingNumberRow}>
                <Text style={styles.trackingNumberText}>
                  {item.TrackingNumber || 'N/A'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: statusBgColor},
                  ]}>
                  <Text style={[styles.statusBadgeText, {color: statusColor}]}>
                    {item?.Status ?? 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.documentAndFundRow}>
                <Text style={styles.documentTypeText}>
                  {item.DocumentType || ''}
                </Text>
              </View>
              <Text style={styles.fundText}>{item.Fund || ''}</Text>
              {(item.TrackingType === 'PR' || item.TrackingType === 'PO') &&
                item.PR_Quarter?.trim() !== '' && (
                  <Text style={styles.fundText}>{item.PR_Quarter}</Text>
                )}
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>{insertCommas(item.Amount)}</Text>
              <Text style={styles.amountLabel}>Amount</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            {item.TrackingType !== 'PR' ? (
              <View style={styles.leftDetailContainer}>
                <Text style={styles.detailLabel}>Claimant</Text>
                <Text style={styles.detailValue}>{item.Claimant || 'N/A'}</Text>
              </View>
            ) : (
              <View style={styles.leftDetailContainer}>
                <Text style={styles.detailLabel}>PR Number</Text>
                <Text style={styles.detailValue}>
                  {item.PR_Number || 'N/A'}
                </Text>
              </View>
            )}
            <View style={styles.rightDetailContainer}>
              <Text style={styles.detailLabel}>Date Modified</Text>
              <Text style={styles.dateModifiedValue}>
                {item.DateModified || 'N/A'}
              </Text>
              {item.PeriodMonth && (
                <Text style={styles.quarterText}>
                  {getQuarter(item.PeriodMonth)} {item.Year}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const TrackingSummaryScreen = ({route}) => {
  const {selectedItem} = route.params;
  const {
    trackingSummaryListData,
    trackingSummaryListLoading,
    trackingSummaryListError,
    refetchTrackingSummaryList,
  } = useTrackingSummaryList(selectedItem.Status, selectedItem.Year);
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchTrackingSummaryList();
    setRefreshing(false);
  }, [refetchTrackingSummaryList]);

  const years = Array.from(
    {length: Math.max(0, new Date().getFullYear() - 2023 + 1)},
    (_, index) => new Date().getFullYear() - index,
  );

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {
        selectedItem: trackingSummaryListData[index],
      });
    },
    [navigation, trackingSummaryListData],
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && trackingSummaryListData?.length > visibleItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const renderContent = () => {
    const dataToRender =
      trackingSummaryListData && Array.isArray(trackingSummaryListData)
        ? trackingSummaryListData.slice(0, visibleItems)
        : [];

    return (
      <FlatList
        data={dataToRender}
        renderItem={({item, index}) => (
          <RenderTrackingSummary
            item={item}
            index={index}
            onPressItem={() => onPressItem(index)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item, index) =>
          item && item.Id ? item.Id.toString() : index.toString()
        }
        style={styles.transactionList}
        extraData={selectedItems}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        initialNumToRender={10}
        windowSize={5}
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
          !trackingSummaryListLoading &&
          dataToRender.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>NO RESULTS FOUND</Text>
            </View>
          )
        }
      />
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: '#F4F7F9'}}>
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
            <View style={styles.headerTitleContainer}>
              <Text style={styles.topHeaderTitle}>Tracking Summary</Text>
            </View>
            <View style={styles.headerRightIcons}>
              {/*  <Pressable
                style={styles.iconButton}
                android_ripple={{
                  color: 'rgba(255,255,255,0.2)',
                  borderless: true,
                  radius: 20,
                }}>
                <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                android_ripple={{
                  color: 'rgba(255,255,255,0.2)',
                  borderless: true,
                  radius: 20,
                }}>
                <MaterialCommunityIcons name="filter" size={24} color="#fff" />
              </Pressable> */}
            </View>
          </LinearGradient>

          {trackingSummaryListLoading ? (
            <View style={styles.shimmerList}>
              {[...Array(7)].map((_, index) => (
                <Shimmer
                  key={index}
                  width={width * 0.95}
                  height={100}
                  borderRadius={12}
                />
              ))}
            </View>
          ) : trackingSummaryListError ? (
            <View style={styles.errorContainer}>
              <Image
                source={require('../../assets/images/errorState.png')}
                style={styles.errorImage}
              />
              <Text style={styles.errorText}>
                {typeof trackingSummaryListError === 'string'
                  ? trackingSummaryListError
                  : trackingSummaryListError.message ||
                    'An unknown error occurred'}
              </Text>
            </View>
          ) : trackingSummaryListData?.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Image
                source={require('../../assets/images/noresultsstate.png')}
                style={styles.noResultsImage}
              />
              <Text style={styles.noResultsText}>NO RESULTS FOUND</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>{renderContent()}</View>
          )}
        </View>
      </SafeAreaView>
    </PaperProvider>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    // alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
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
  cardContainerPressed: {
    backgroundColor: '#F0F4F7',
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
  },
  mainInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainInfoLeft: {
    flex: 1,
    marginRight: 10,
  },
  trackingNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  trackingNumberText: {
    color: '#1A237E',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  documentAndFundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  documentTypeText: {
    color: '#616161',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    marginRight: 8,
  },
  fundText: {
    color: '#616161',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: '#007bff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
  },
  amountLabel: {
    color: '#616161',
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftDetailContainer: {
    flex: 1,
    marginRight: 10,
  },
  rightDetailContainer: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    color: '#9E9E9E',
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: '#424242',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  dateModifiedValue: {
    color: '#424242',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    textAlign: 'right',
  },
  quarterText: {
    color: '#424242',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    textAlign: 'right',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  noResultsImage: {
    width: '60%',
    height: '25%',
    resizeMode: 'contain',
  },
  noResultsText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#616161',
    fontSize: 18,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  errorImage: {
    width: '60%',
    height: '25%',
    resizeMode: 'contain',
  },
  errorText: {
    fontFamily: 'Montserrat-Light',
    alignSelf: 'center',
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    padding: 5,
  },
  loadingMoreIndicator: {
    paddingVertical: 20,
  },
  transactionList: {
    flex: 1,
  },
});

export default TrackingSummaryScreen;
