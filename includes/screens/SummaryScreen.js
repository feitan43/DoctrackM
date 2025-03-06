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
  Pressable,
  ImageBackground,
  Animated,
  Dimensions
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import useDelaysRegOffice from '../api/useDelaysRegOffice';
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

const monthMap = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
};

const getMonthName = (PMonth) => {
  return monthMap[PMonth] || PMonth; // Return month name or PMonth if not valid
};

const RegOfficeDelaysData = memo(
  ({item, index, onPressItem}) => {
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
                        color: item.DocumentStatus.includes('Pending')
                          ? 'rgba(250, 135, 0, 1)'
                          : 'rgba(252, 191, 27, 1)',
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
                    {item.OfficeName}
                  </Text>
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
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Oswald-Light',
                      fontSize: 12,
                    }}>
                    {getMonthName(item.PMonth)}
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
                          fontSize: 12,
                        }}>
                        Last Updated:
                      </Text>
                      <Text
                        style={{
                          color: 'white',
                          fontFamily: 'Oswald-Light',
                          fontSize: 12,
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
  },
  (prevProps, nextProps) => {
    return prevProps.delaysRegOfficeData === nextProps.delaysRegOfficeData;
  },
);

const SummaryScreen = React.memo(
  () => {
    const navigation = useNavigation();
    const {delaysRegOfficeData, delaysLoading} = useDelaysRegOffice();
    const [visibleItems, setVisibleItems] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);

    const onPressItem = useCallback(
      index => {
        navigation.navigate('Detail', {
          selectedItem: delaysRegOfficeData[index],
        });
      },
      [navigation, delaysRegOfficeData],
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
          handleLoadMore();
        }
      },
      [handleLoadMore],
    );

    /*   const { genInformationData, genInfoLoading, token, error } =
    useGenInformation(
      selectedItemIndex,
      Array.isArray(delaysRegOfficeData) && selectedItemIndex !== null
        ? delaysRegOfficeData[selectedItemIndex] || {}
        : {}
    ) || {}; */

    const renderContent = () => {
      return (
        <>
          <FlatList
            data={delaysRegOfficeData.slice(0, visibleItems)}
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
        {/*  <StatusBar
        backgroundColor={'rgba(20, 16, 25, 0.2)'}
        barStyle={'light-content'}
      /> */}
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.container}>
            <View
              style={{
                //backgroundColor: 'rgba(20, 16, 25, 0.2)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 15,
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
              <View style={{alignItems: 'center'}}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontFamily: 'Oswald-Medium',
                    lineHeight: 20,
                  }}>
                  REGULATORY OFFICE DELAYS
                </Text>
              </View>
            </View>
            {delaysLoading ? (
              <View style={[styles.container2, {top: 25}]}>
                {[...Array(7)].map((_, index) => (
                  <Shimmer key={index} width={shimmerWidth} height={shimmerHeight} />
                ))}
              </View>
            ) : delaysRegOfficeData === null ? (
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
            ) : delaysRegOfficeData.length === 0 ? (
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
  },
  () => true,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  summaryText: {
    fontSize: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  backButton: {
    width: 40,
    backgroundColor: 'transparent',
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
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

export default SummaryScreen;
