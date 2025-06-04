import React, {useState, memo, useMemo, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Image,
  ImageBackground,
  SafeAreaView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button, PaperProvider} from 'react-native-paper';
import useMyTransactions from '../api/useMyTransactions';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {years, currentYear, width} from '../utils';

const RenderTransaction = memo(({item, index, onPressItem}) => {
  const getShortMonth = month => month?.slice(0, 3) || '';

  return (
    <Pressable
      onPress={() => onPressItem(index, item)}
      style={({pressed}) => [
        styles.transactionCard,
        pressed && styles.transactionCardPressed,
      ]}>
      <View style={styles.cardContainer}>
        {/* Left Column - Index Number */}
        <View style={styles.indexColumn}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        {/* Right Column - Content */}
        <View style={styles.contentColumn}>
          {/* Status Row */}
          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusText,
                item?.Status?.includes('Pending') && styles.pendingStatus,
              ]}>
              {item?.Status ?? ''}
            </Text>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Year </Text>
              <Text style={styles.value}>{item.Year}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>TN </Text>
              <Text style={styles.value}>{item.TrackingNumber}</Text>
            </View>

            {item.TrackingType !== 'PR' ? (
              <>
                <View style={styles.textRow}>
                  <Text style={styles.label}>Claimant </Text>
                  <Text style={styles.value}>{item.Claimant}</Text>
                </View>
                <View style={styles.textRow}>
                  <Text style={styles.label}>Document </Text>
                  <Text style={styles.value}>{item.DocumentType}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.textRow}>
                  <Text style={styles.label}>PR Number </Text>
                  <Text style={styles.value}>{item.PR_Number}</Text>
                </View>
                <View style={styles.textRow}>
                  <Text style={styles.label}>PR Sched </Text>
                  <Text style={styles.value}>
                    {item.PR_Month >= 1 && item.PR_Month <= 3
                      ? '1st Quarter'
                      : item.PR_Month >= 4 && item.PR_Month <= 6
                      ? '2nd Quarter'
                      : item.PR_Month >= 7 && item.PR_Month <= 9
                      ? '3rd Quarter'
                      : '4th Quarter'}
                  </Text>
                </View>
                <View style={styles.textRow}>
                  <Text style={styles.label}>Fund </Text>
                  <Text style={styles.value}>{item.Fund}</Text>
                </View>
              </>
            )}

            <View style={styles.textRow}>
              <Text style={styles.label}>Period </Text>
              <Text style={styles.value}>
                {getShortMonth(item.PeriodMonth)}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Amount </Text>
              <Text style={styles.amountText}>{insertCommas(item.Amount)}</Text>
            </View>

            {/*  <View style={styles.detailsButtonContainer}>
              <Text style={styles.detailsButtonText}>See Details</Text>
            </View> */}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const MyTransactionsScreen = ({navigation}) => {
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const {myTransactionsData, loading, error, fetchMyPersonal} =
    useMyTransactions(selectedYear);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollY = new Animated.Value(0);
  const [showTitleInHeader, setShowTitleInHeader] = useState(false);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      listener: event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowTitleInHeader(offsetY > 10); // Adjust threshold as needed
      },
      useNativeDriver: false,
    },
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyPersonal();
    setRefreshing(false);
  }, [fetchMyPersonal]);

  const onPressItem = useCallback(
    (index, item) => {
      navigation.navigate('MyTransactionsDetails', {
        selectedItem: item,
      });
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && myTransactionsData?.length > visibleItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prev => prev + 10);
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [isLoadingMore, myTransactionsData, visibleItems]);

  const renderFooter = useCallback(
      () =>
        isLoadingMore ? (
          <View style={styles.loadMoreIndicator}>
            <ActivityIndicator size="small" color="#007bff" />
          </View>
        ) : null,
      [isLoadingMore],
  );

  const renderEmptyComponent = useCallback(
      () => (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/images/noresultsstate.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ),
      [],
  );

  const renderErrorComponent = useCallback(
      () => (
        <View style={styles.errorContainer}>
          <Image
            source={require('../../assets/images/errorState.png')}
            style={styles.errorImage}
          />
          <Text style={styles.errorText}>
            {error?.message || 'An error occurred'}
          </Text>
          <Button
            mode="contained"
            onPress={fetchMyPersonal}
            style={styles.retryButton}
            labelStyle={styles.retryButtonText}>
            Retry
          </Button>
        </View>
      ),
      [error, fetchMyPersonal],
  );

  const renderLoadingComponent = useCallback(
      () => (
        <View style={styles.loadingContainer}>
          {[...Array(7)].map((_, index) => (
            <Shimmer key={`shimmer-${index}`} />
          ))}
        </View>
      ),
      [],
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          {!showTitleInHeader && (
            <Text style={styles.listHeaderTitle}>My Transactions</Text>
          )}
        </View>
      </View>
    ),
    [selectedYear, showTitleInHeader],
  );

  const handleSelectYear = year => {
    setSelectedYear(year);
    setBottomSheetVisible(false);
    fetchMyPersonal(year);
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../../assets/images/bgasset.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover">
          <View style={styles.overlay} />

          <View style={styles.container}>
            <ImageBackground
              source={require('../../assets/images/CirclesBG.png')}
              style={styles.appBar}
              resizeMode="cover">
              <View style={styles.appBarContent}>
                <Pressable
                  style={({pressed}) => [
                    styles.backButton,
                    pressed && styles.backButtonPressed,
                  ]}
                  android_ripple={styles.backButtonRipple}
                  onPress={navigation.goBack}>
                  <Icon name="arrow-back" size={24} color="#fff" />
                </Pressable>
                {showTitleInHeader && (
                  <Text style={styles.title}>My Transactions</Text>
                )}
                <Pressable
                  style={({pressed}) => [
                    styles.menuButton,
                    pressed && styles.menuButtonPressed,
                  ]}
                  android_ripple={styles.menuButtonRipple}
                  onPress={() => setBottomSheetVisible(true)}>
                  <Icon name="ellipsis-vertical" size={24} color="#fff" />
                </Pressable>
              </View>
            </ImageBackground>

            <View style={styles.contentContainer}>
              {loading && !refreshing ? (
                renderLoadingComponent()
              ) : error ? (
                renderErrorComponent()
              ) : (
                <FlatList
                  data={myTransactionsData?.slice(0, visibleItems) || []}
                  renderItem={({item, index}) => (
                    <RenderTransaction
                      item={item}
                      index={index}
                      onPressItem={onPressItem}
                    />
                  )}
                  ListEmptyComponent={renderEmptyComponent}
                  ListHeaderComponent={renderHeader}
                  ListFooterComponent={renderFooter}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#007bff']}
                      tintColor="#007bff"
                    />
                  }
                  keyExtractor={(item, index) =>
                    item?.Id ? item.Id.toString() : index.toString()
                  }
                  contentContainerStyle={styles.listContent}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.2}
                  stickyHeaderIndices={[0]}
                  showsVerticalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                />
              )}
            </View>
          </View>

          {bottomSheetVisible && (
            <BottomSheet
              ref={bottomSheetRef}
              index={0}
              snapPoints={snapPoints}
              backdropComponent={props => (
                <BottomSheetBackdrop
                  {...props}
                  disappearsOnIndex={-1}
                  appearsOnIndex={0}
                />
              )}
              onClose={() => setBottomSheetVisible(false)}>
              <View style={styles.bottomSheetContent}>
                <Text style={styles.bottomSheetTitle}>Select Year</Text>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => handleSelectYear(year)}
                    style={[
                      styles.yearItem,
                      year === selectedYear && styles.selectedYearItem,
                    ]}>
                    <Text
                      style={[
                        styles.yearText,
                        year === selectedYear && styles.selectedYearText,
                      ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BottomSheet>
          )}
        </ImageBackground>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  container: {
    flex: 1,
  },
  appBar: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  appBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonPressed: {
    transform: [{scale: 0.95}],
  },
  backButtonRipple: {
    color: 'rgba(255, 255, 255, 0.2)',
    borderless: true,
    radius: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 8,
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{scale: 0.95}],
  },
  menuButtonRipple: {
    color: 'rgba(255, 255, 255, 0.2)',
    borderless: true,
    radius: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  listContent: {
    paddingVertical: 8,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  filterButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  transactionCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    //borderWidth: 1,
    //borderColor: '#e0e0e0',
    //shadowColor: '#000',
    //shadowOffset: {width: 0, height: 1},
    //shadowOpacity: 0.05,
    //shadowRadius: 2,
    marginBottom:10,
    elevation:1
  },
  transactionCardPressed: {
    backgroundColor: '#F5F8FA'
  },
  cardContainer: {
    flexDirection: 'row',
  },
  indexColumn: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 12,
  },
  contentColumn: {
    flex: 1,
  },
  indexText: {
    fontSize: 16,
    fontFamily: 'Inter_28pt-Bold',
    color: '#007bff',
  },
  statusRow: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter_28pt-Bold',
    color: '#252525',
  },
  pendingStatus: {
    color: '#FF9800',
  },
  detailsSection: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '25%',
    fontSize: 12,
    fontFamily: 'Inter_28pt-Light',
    textAlign: 'right',
    color: '#666',
  },
  value: {
    width: '70%',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    color: '#333',
    marginLeft: 8,
  },
  amountText: {
    width: '70%',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Bold',
    color: '#007bff',
    marginLeft: 8,
  },
  detailsButtonContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  detailsButtonText: {
    color: '#007bff',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 6,
    backgroundColor: '#007bff',
  },
  retryButtonText: {
    color: '#fff',
  },
  loadMoreIndicator: {
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: width * 0.8,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  modalItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedYearItem: {
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedYearText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterButton: {
    margin: 16,
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    color: '#fff',
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },

  yearItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  selectedYearItem: {
    backgroundColor: '#f0f8ff',
  },

  yearText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },

  selectedYearText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#007bff',
  },
});

export default MyTransactionsScreen;
