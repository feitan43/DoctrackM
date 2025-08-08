import React, {useState, memo, useCallback} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ProgressBar from '../../utils/ProgressBar';

const {width} = Dimensions.get('window');

const StatusView = ({route, navigation}) => {
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {selectedItem, statusViewResults, loadingTransSum} = route.params;

  function insertCommas(value) {
    if (value === null) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {selectedItem: statusViewResults[index]});
    },
    [navigation, statusViewResults],
  );

  const loadMore = () => {
    if (!isLoadingMore && statusViewResults.length > visibleItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 2000);
    }
  };

  const handleScroll = ({nativeEvent}) => {
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMore();
    }
  };

  const calculateProgress = status => {
    if (status && status.includes('Pending')) {
      return '50%';
    }
    return '100%';
  };

  const RenderStatusView = memo(({item, index, onPressItem}) => {
    const isPending = item?.Status?.includes('Pending');
    const statusColor = isPending ? '#FF9800' : '#28A745';
    const statusBgColor = isPending ? '#FFF3E0' : '#E6F4EA';
    const progressPercentage = calculateProgress(item?.Status);

    return (
      <Pressable
        onPress={() => onPressItem(index)}
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
                  <View style={[styles.statusBadge, {backgroundColor: statusBgColor}]}>
                    <Text style={[styles.statusBadgeText, {color: statusColor}]}>
                      {item?.Status ?? 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.documentAndFundRow}>
                  <Text style={styles.documentTypeText}>
                    {item.DocumentType || 'N/A'}
                  </Text>
                  <Text style={styles.fundText}>
                    {item.Fund || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amountText}>
                  {insertCommas(item.TotalAmount)}
                </Text>
                <Text style={styles.amountLabel}>Total Amount</Text>
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
                  <Text style={styles.detailValue}>{item.PR_Number || 'N/A'}</Text>
                </View>
              )}
              <View style={styles.rightDetailContainer}>
                <Text style={styles.detailLabel}>Date Modified</Text>
                <Text style={styles.dateModifiedValue}>
                  {item.DateModified || 'N/A'}
                </Text>
                <Text style={styles.quarterText}>{item.Year || 'N/A'}</Text>
              </View>
            </View>

           {/*  <View style={{width: '100%', marginVertical: 5, backgroundColor:'red'}}>
                    <ProgressBar
                      TrackingType={item.TrackingType}
                      Status={item.Status}
                      DocumentType={item.DocumentType}
                      Mode={item.ModeOfProcurement}
                    />
                  </View> */}


            {/* <View style={styles.progressBarContainer}>
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarInner}>
                  <ProgressBar
                    TrackingType={item.TrackingType}
                    Status={item.Status}
                    DocumentType={item.DocumentType}
                    Mode={item.ModeOfProcurement}
                  />
                </View>
                <Text style={styles.progressPercentageText}>
                  {progressPercentage}
                </Text>
              </View>
            </View> */}
          </View>
        </View>
      </Pressable>
    );
  });

  const renderContent = () => {
    return (
      <View style={styles.listContainer}>
        <FlatList
          data={statusViewResults.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RenderStatusView
              item={item}
              index={index}
              onPressItem={onPressItem}
            />
          )}
          keyExtractor={(item, index) =>
            item && item.Id ? item.Id.toString() : index.toString()
          }
          ListFooterComponent={() =>
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color="#1A237E"
                style={styles.loadingMoreIndicator}
              />
            ) : null
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={() => (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>NO RESULTS FOUND</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
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
            <Text style={styles.topHeaderTitle}>Procurement Transactions</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <Pressable
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
            </Pressable>
          </View>
        </LinearGradient>

        {loadingTransSum ? (
          <ActivityIndicator
            size="large"
            color="#1A237E"
            style={{justifyContent: 'center', alignContent: 'center', flex: 1}}
          />
        ) : (
          renderContent()
        )}
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
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
  progressBarContainer: {
    marginTop: 10,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarInner: {
    flex: 1,
    marginRight: 10,
  },
  progressPercentageText: {
    color: '#1A237E',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
  },
  loadingMoreIndicator: {
    paddingVertical: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  noResultsText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#616161',
    fontSize: 18,
    marginTop: 20,
  },
});

export default StatusView;