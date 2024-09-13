import React, {useState, memo, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import notifee from '@notifee/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useRecentlyUpdated from '../api/useRecentlyUpdated';
import useRefresh from '../utils/useRefresh';

const {width, height} = Dimensions.get('window');

const shimmerWidth = width * 0.95; // 90% of device width
const shimmerHeight = height * 0.17; // 15% of device height

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
          colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const insertCommas = value => {
  if (value === null) {
    return '';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const currentDate = new Date();
const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const formattedDate = formatDate(currentDate);

const RenderTransaction = memo(({item, index, onPressItem}) => {
  const modifiedDate = item.DateModified.split(' ')[0];
  const isDateMatched = modifiedDate === formattedDate;
  const dateTextColor = isDateMatched ? 'rgba(6, 70, 175, 1)' : 'gray';

  return (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginHorizontal: 10,
        marginTop: 10,
      }}>
      <View style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', paddingBottom: 10}}>
        <TouchableOpacity onPress={() => onPressItem(index, item)}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <Text
                style={{
                  backgroundColor: dateTextColor,
                  paddingHorizontal: 15,
                  fontFamily: 'Oswald-SemiBold',
                  fontSize: 15,
                  color: 'white',
                  textAlign: 'center',
                }}>
                {index + 1}
              </Text>
            </View>
            <View style={{flex: 1, paddingStart: 10}}>
              <LinearGradient
                colors={['transparent', '#252525']}
                start={{x: 0, y: 0}}
                end={{x: 3, y: 0}}
                style={{elevation: 1}}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                  }}>
                  {item.TrackingNumber}
                </Text>
              </LinearGradient>
              <View style={{marginVertical: 5}}>
                <View style={{rowGap: -5}}>
                  <Text
                    style={{
                      color: item.Status.includes('Pending')
                        ? 'rgba(250, 135, 0, 1)'
                        : 'rgba(252, 191, 27, 1)',
                      fontFamily: 'Oswald-Regular',
                      fontSize: 18,
                      textShadowRadius: 1,
                      elevation: 1,
                      textShadowOffset: {width: 1, height: 2},
                    }}>
                    {item.Status}
                  </Text>
                  <Text
                    style={{
                      color: 'silver',
                      fontFamily: 'Oswald-Light',
                      fontSize: 12,
                    }}>
                    {item.DateModified}
                  </Text>
                </View>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                    marginTop: 5,
                  }}>
                  {item.DocumentType}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                  }}>
                  {insertCommas(item.Amount)}
                </Text>
              </View>
            </View>
            <View>
              <Text
                style={{
                  backgroundColor: 'rgba(37, 37, 37, 0.4)',
                  paddingHorizontal: 10,
                  fontFamily: 'Oswald-Regular',
                  color: 'white',
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                {item.Year}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const RecentUpdatedScreen = ({navigation}) => {
  const {recentlyUpdatedData, recentLoading, fetchRecentlyUpdatedData} =
    useRecentlyUpdated();
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {refreshing, onRefresh} = useRefresh(fetchRecentlyUpdatedData);

  useEffect(() => {
    const retrieveInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        console.log('Initial Notification:', initialNotification);
      }
    };
    retrieveInitialNotification();
  }, []);

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {selectedItem: recentlyUpdatedData[index]});
    },
    [navigation, recentlyUpdatedData],
  );

  const loadMore = () => {
    if (!isLoadingMore && recentlyUpdatedData.length > visibleItems) {
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

  const renderContent = () => {
    return (
      <>
        <FlatList
          data={recentlyUpdatedData.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RenderTransaction
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          ListEmptyComponent={() => <Text>No results found</Text>}
          ListFooterComponent={() =>
            recentLoading ? <ActivityIndicator color="white" /> : null
          }
        />

        {isLoadingMore && (
          <ActivityIndicator
            size="large"
            color="white"
            style={{justifyContent: 'center', alignContent: 'center'}}
          />
        )}
      </>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/docmobileBG.png')}
      style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              position: 'relative',
              paddingTop: 20,
            }}>
            <View
              style={{
                position: 'absolute',
                left: 10,
                borderRadius: 999,
                overflow: 'hidden',
              }}>
              <Pressable
                style={({pressed}) => [
                  pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                  {
                    backgroundColor: 'transparent',
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
                android_ripple={{color: 'gray'}}
                onPress={() => {
                  navigation.goBack();
                }}>
                <Icon name="chevron-back-outline" size={26} color="white" />
              </Pressable>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'Oswald-Medium',
                  lineHeight: 20,
                }}>
                RECENTLY UPDATED
              </Text>
            </View>
          </View>

          {recentLoading ? (
            <View style={[styles.container2, {top: 25}]}>
              {[...Array(7)].map((_, index) => (
                <Shimmer
                  key={index}
                  width={shimmerWidth}
                  height={shimmerHeight}
                />
              ))}
            </View>
          ) : recentlyUpdatedData === null ? (
            <View style={[styles.container2, {top: 25}]}>
              {[...Array(7)].map((_, index) => (
                <Shimmer
                  key={index}
                  width={shimmerWidth}
                  height={shimmerHeight}
                  borderRadius={4}
                />
              ))}
            </View>
          ) : recentlyUpdatedData.length === 0 ? (
            <View
              style={{
                justifyContent: 'center',
                marginHorizontal: 10,
                borderWidth: 1,
                borderColor: 'white',
                backgroundColor: 'rgba(0,0,0,0.1)',
              }}>
              <Text
                style={{
                  fontFamily: 'Oswald-Light',
                  alignSelf: 'center',
                  color: 'white',
                  fontSize: 18,
                  padding: 5,
                }}>
                NO RESULTS FOUND
              </Text>
            </View>
          ) : (
            <View style={{height: '100%', paddingBottom: 55}}>
              {renderContent()}
            </View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  transactionList: {
    flex: 1,
  },
  shimmerWrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0, 0.1)',
  },
  gradient: {
    flex: 1,
  },
  container2: {
    gap: 10,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(RecentUpdatedScreen);
