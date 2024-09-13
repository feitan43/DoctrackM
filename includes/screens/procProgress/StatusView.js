import React, {useState, memo, useCallback} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ProgressBar from '../../utils/ProgressBar';

const StatusView = ({route, navigation}) => {
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {selectedItem, statusViewResults, officeName, loadingTransSum} =
    route.params;
    
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

  const RenderStatusView = memo(({item, index, onPressItem}) => (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        //marginHorizontal: 10,
        marginTop: 10,
      }}>
      <TouchableOpacity onPress={() => onPressItem(index)}>
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            paddingBottom: 10,
          }}>
          <View style={{flexDirection: 'row'}}>
            <View>
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
                colors={['transparent', '#252525']}
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
                        : //: 'rgba(252, 191, 27, 1)',
                          'rgba(255, 255, 255, 1)',
                      fontFamily: 'Oswald-Regular',
                      fontSize: 18,
                      textShadowRadius: 1,
                      elevation: 1,
                      textShadowOffset: {width: 1, height: 2},
                    }}>
                    {item.Status}
                  </Text>

                  {/* ProgressBar inserted between Status and DateModified */}
                  <View style={{width: '100%', marginVertical: 5}}>
                    <ProgressBar
                      TrackingType={item.TrackingType}
                      Status={item.Status}
                      DocumentType={item.DocumentType}
                      Mode={item.ModeOfProcurement}
                    />
                  </View>

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
                {/*  <Text
                style={{
                  color: 'white',
                  fontFamily: 'Oswald-Light',
                  fontSize: 12,
                }}>
                {item.Quarter}
              </Text> */}
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                  }}>
                  {item.Description}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                  }}>
                  {insertCommas(item.TotalAmount)}
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
        </View>
      </TouchableOpacity>
    </View>
  ));

  const renderContent = () => {
    return (
      <>
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
          ListEmptyComponent={() => <Text>No results found</Text>}
          ListFooterComponent={() =>
            loadingTransSum ? <ActivityIndicator color="white" /> : null
          }
          onScroll={handleScroll}
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
      source={require('../../../assets/images/docmobileBG.png')}
      style={{flex: 1, paddingHorizontal: 10}}>
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            marginTop: 10,
            position: 'relative',
            marginBottom: 10,
          }}>
          <View
            style={{
              position: 'absolute',
              left: 1,
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
                lineHeight: 22,
              }}>
              List of Procurement Transactions
            </Text>
          </View>
        </View>

        {/*  <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'white',
            padding: 15,
            paddingStart: 20,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                opacity: 0.5,
                width: 60,
              }}>
              Office
            </Text>
            <Text
              style={{
                fontFamily: 'Oswald-Regular',
                color: 'white',
                textAlign: 'left',
                paddingStart: 20,
                flex: 1,
                flexShrink: 1,
                flexWrap: 'wrap',
              }}>
              {officeName}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                opacity: 0.5,
                width: 60,
              }}>
              Year
            </Text>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                textAlign: 'left',
                paddingStart: 20,
              }}>
              {statusViewResults[0].Year}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                opacity: 0.5,
                width: 60,
              }}>
              Status
            </Text>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                textAlign: 'left',
                paddingStart: 20,
              }}>
              {selectedItem.Status}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                opacity: 0.5,
                width: 60,
              }}>
              Transaction
            </Text>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                textAlign: 'left',
                paddingStart: 20,
              }}>
              {statusViewResults[0].DocumentType}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                opacity: 0.5,
                width: 60,
              }}>
              Count
            </Text>
            <Text
              style={{
                fontFamily: 'Oswald-Light',
                color: 'white',
                textAlign: 'left',
                paddingStart: 20,
              }}>
              {selectedItem.StatusCount} transactions
            </Text>
          </View>
        </View> */}

        <View>
          {loadingTransSum ? (
            <ActivityIndicator
              size="large"
              color="white"
              style={{justifyContent: 'center', alignContent: 'center'}}
            />
          ) : (
            <View
              style={{
                height: '100%',
                paddingBottom: 55,
              }}>
              {renderContent()}
            </View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = {
  tableHeader: {
    flex: 1,
    color: 'white',
    fontFamily: 'Oswald-Regular',
    textAlign: 'left',
    fontSize: 13,
  },
  sectionContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 37, 37, 0.2)',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    color: 'white',
    fontFamily: 'Oswald-Regular',
    fontSize: 12,
    paddingStart: 10,
    width: 60,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0, 0.2)',
    textAlign: 'left',
  },
  rowContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    opacity: 0.8,
    color: 'white',
    fontFamily: 'Oswald-Light',
    textAlign: 'left',
  },
};

export default StatusView;
