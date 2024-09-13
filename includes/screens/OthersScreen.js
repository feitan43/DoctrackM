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
import useOthers from '../api/useOthers';
import ProgressBar from '../utils/ProgressBar'; // Import your ProgressBar component

const OthersScreen = ({route, navigation}) => {
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {selectedItem, details, loadingDetails} = route.params;

  function insertCommas(value) {
    if (value === null) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {selectedItem: details[index]});
    },
    [navigation, details],
  );

  const loadMore = () => {
    if (!isLoadingMore && details.length > visibleItems) {
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

  const RenderOthersView = memo(({item, index, onPressItem}) => (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        //marginHorizontal: 10,
        marginTop: 10,
      }}>
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          paddingBottom: 10,
        }}>
        <TouchableOpacity onPress={() => onPressItem(index)}>
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
                {/*  <TouchableOpacity onPress={() => onPressItem(index)}> */}
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                  }}>
                  {item.TrackingNumber}
                </Text>
                {/*  </TouchableOpacity> */}
              </LinearGradient>
              <View style={{marginVertical: 5}}>
                <View style={{rowGap: -5}}>
                  <Text
                    style={{
                      /* color: item.Status.includes('Pending')
            ? 'rgba(250, 135, 0, 1)'
            : 'rgba(252, 191, 27, 1)', */
                      color: 'white',
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
                      DocumentType={selectedItem}
                      ClaimType={item.ClaimType}
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
                    fontFamily: 'Oswald-Regular',
                    fontSize: 12,
                    marginTop: 10,
                  }}>
                  {selectedItem}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Oswald-Regular',
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
  ));

  const renderContent = () => {
    return (
      <>
        <FlatList
          data={details.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RenderOthersView
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
            loadingDetails ? <ActivityIndicator color="white" /> : null
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
      source={require('../../assets/images/docmobileBG.png')}
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
              List of Others Transactions
            </Text>
          </View>
        </View>

        <View>
          {loadingDetails ? (
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

export default OthersScreen;
