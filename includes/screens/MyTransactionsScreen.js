import React, {useEffect, useState, memo, useCallback,useRef} from 'react';
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
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useMyTransactions from '../api/useMyTransactions';
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

const RenderTransaction = memo(({item, index, onPressItem}) => {
  const getShortMonth = month => {
    return month.slice(0, 3);
  };
  function insertCommas(value) {
    if (value === null) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
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
                  elevation: 1,
                }}>
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
                      fontFamily: 'Oswald-ExtraLight',
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
                  {item.Claimant}
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
                <View style={{alignSelf: 'flex-end'}}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Oswald-Light',
                      fontSize: 12,
                    }}>
                    <Text style={{color: 'silver'}}>Encoded: </Text>
                    {item.DateEncoded}
                  </Text>
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
                  textTransform: 'uppercase',
                }}>
                {getShortMonth(item.PeriodMonth)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const currentYear = new Date().getFullYear();

const MyTransactionsScreen = ({navigation}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const {myTransactionsData, loading, fetchMyPersonal} =
    useMyTransactions(selectedYear);
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  /*   useFocusEffect(
    useCallback(() => {
      fetchMyPersonal();
    }, [fetchMyPersonal]),
  ); */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyPersonal();
    setRefreshing(false);
  }, [fetchMyPersonal]);

  const years = Array.from(
    {length: 2},
    (_, index) => new Date().getFullYear() - index,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const togglePickerModal = () => {
    setShowPickerModal(!showPickerModal);
  };

  const pickSample = () => {
    console.log('Sample picked:', selectedYear);
    togglePickerModal();
  };

  const onPressItem = useCallback(
    index => {
      navigation.navigate('MyTransactionsDetails', {
        selectedItem: myTransactionsData[index],
      });
    },
    [navigation, myTransactionsData],
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && myTransactionsData.length > visibleItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const handleYearClick = year => {
    console.log('Clicked year:', year);
    setSelectedYear(year);
  };

  const renderContent = () => {
      return (
        <>
          <FlatList
            data={myTransactionsData.slice(0, visibleItems)}
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
            extraData={selectedItems}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() =>
              loading ? <ActivityIndicator color="white" /> : null
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
    }

  return (
    <ImageBackground
      source={require('../../assets/images/docmobileBG.png')}
      style={{flex: 1}}>
      <View style={styles.container}>
        <SafeAreaView style={{flex: 1}}>
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
                MY PERSONAL
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={[styles.container2, {top: 25}]}>
              {[...Array(7)].map((_, index) => (
                <Shimmer key={index} width={shimmerWidth} height={shimmerHeight} />
              ))}
            </View>
          ) : myTransactionsData === null ? (
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
          ) : myTransactionsData.length === 0 ? (
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
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  transactionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },
  transactionList: {
    marginBottom: 10,
    width: '100%',
  },
  backButton: {
    width: 40,
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
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

export default MyTransactionsScreen;
