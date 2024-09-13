import React, {
  useCallback,
  useState,
  useEffect,
  memo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Animated,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import useOfficeDelays from '../api/useOfficeDelays';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

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

function insertCommas(value) {
  if (value === null) {
    return '';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const RenderOfficeDelays = memo(({item, index, onPressItem}) => {
  return (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginHorizontal: 10,
        marginTop: 10,
      }}>
      <TouchableOpacity onPress={() => onPressItem(index, item)}>
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            paddingBottom: 10,
          }}>
          <View style={{flexDirection: 'row'}}>
            <View style={{}}>
              <Text
                style={{
                  backgroundColor: 'rgba(6, 70, 175, 1)',
                  paddingHorizontal: 15,
                  fontFamily: 'Oswald-SemiBold',
                  fontSize: 15,
                  color: 'white',
                  textAlign: 'center',
                }}>
                {index + 1}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                paddingStart: 10,
              }}>
              <LinearGradient
                colors={['transparent', 'black']}
                start={{x: 0, y: 0}}
                end={{x: 3, y: 0}}
                style={{
                  //alignItems: 'flex-start',
                  elevation: 1,
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    //textAlign: 'center',
                  }}>
                  {item.TrackingNumber}
                </Text>
              </LinearGradient>
              <View style={{marginVertical: 5}}>
                <View style={{rowGap: -5}}>
                  <Text
                    style={{
                      color: 'rgba(250, 135, 0, 1)',
                      fontFamily: 'Oswald-Regular',
                      fontSize: 18,
                      textShadowRadius: 1,
                      elevation: 1,
                      //letterSpacing: 1,
                      textShadowOffset: {width: 1, height: 2},
                    }}>
                    {item.DocumentStatus}
                  </Text>
                </View>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
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

                <View
                  style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  {/*   <View style={{alignSelf: 'flex-end', flexDirection: 'row'}}>
          <Text style={{fontSize: 12,color:'#808080', fontFamily: 'Oswald-ExtraLight'}}>Last Updated : </Text>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Oswald-Light',
              fontSize: 12,
              textTransform: 'uppercase',
            }}>
            {item.DateModified}
          </Text>
        </View> */}

                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginEnd: 5,
                      rowGap: -10,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Oswald-Regular',
                        fontSize: 35,
                        lineHeight: 40,
                      }}>
                      {item.DelayedDays}
                    </Text>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Oswald-ExtraLight',
                        fontSize: 8,
                        textTransform: 'uppercase',
                      }}>
                      Days Delayed
                    </Text>
                  </View>
                  <View style={{}}>
                    <Text
                      style={{
                        color: 'silver',
                        fontFamily: 'Oswald-ExtraLight',
                        fontSize: 10,
                      }}>
                      Last Updated:
                    </Text>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Oswald-Light',
                        fontSize: 10,
                      }}>
                      {item.DateModified}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{}}>
              <Text
                style={{
                  backgroundColor: 'rgba(37, 37, 37, 0.5)',
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
        </View>
      </TouchableOpacity>
    </View>
  );
});

const OfficeDelaysScreen = ({navigation}) => {
  const {officeDelaysData, delaysLoading, fetchOfficeDelays} = useOfficeDelays();

  const [visibleItems, setVisibleItems] = useState(10);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

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
    if (!isLoadingMore && officeDelaysData.length > visibleItems) {
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
          data={officeDelaysData.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RenderOfficeDelays
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
            delaysLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : null
          } // Display ActivityIndicator at the bottom when loading more data
        />
        {isLoadingMore && (
          <ActivityIndicator
            size="small"
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
              //backgroundColor: 'rgba(20, 16, 25, 0.2)',
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
                onPress={() => navigation.goBack()}>
                <Icon name="chevron-back-outline" size={26} color="white" />
              </Pressable>
            </View>
            <View style={{alignItems: 'center', rowGap: -5}}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'Oswald-Medium',
                  lineHeight: 20,
                }}>
                OFFICE DELAYS
              </Text>
            </View>
          </View>

          {delaysLoading ? (
            <View style={[styles.container2, {top: 25}]}>
              {[...Array(7)].map((_, index) => (
                <Shimmer
                  key={index}
                  width={shimmerWidth}
                  height={shimmerHeight}
                />
              ))}
            </View>
          ) : officeDelaysData === null ? (
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
          ) : officeDelaysData.length === 0 ? (
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
  },
  backButton: {
    width: 40,
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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

export default OfficeDelaysScreen;
