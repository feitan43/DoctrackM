import React, {useState, memo, useCallback} from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import {Menu, PaperProvider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import useRegTrackingSummaryList from '../api/useRegTrackingSummaryList';

const RenderTrackingSummary = memo(({item, index, onPressItem}) => {
  return (
    <View
      style={{
        backgroundColor: 'rgba(179, 196, 233, 0.1)',
        marginVertical: 5,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#B0C4DE',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
        <View style={{paddingHorizontal: 10, justifyContent: 'center'}}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 14,
              fontFamily: 'Oswald Regular',
              textAlignVertical: 'top',
            }}>
            {index + 1}
          </Text>
        </View>

        {/* Content Section */}
        <View style={{flexDirection: 'column', flex: 1}}>
          {/* Status (Emphasized) */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 5,
              borderBottomWidth: 1,
              paddingBottom: 5,
              borderColor: '#333',
            }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                fontFamily: 'Oswald Regular',
                color: '#333',
                width: '20%',
              }}>
              Status:
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                fontFamily: 'Oswald Regular',
                color: '#333',
                width: '80%',
                textAlign: 'right',
              }}>
              {item.Status}
            </Text>
          </View>

          {[
            {label: 'Claimant:', value: item.Claimant},
            {label: 'Tracking Number:', value: item.TrackingNumber},
            {label: 'PR', value: item.PR_Number},
            {label: 'PO', value: item.PO_Number},
            {label: 'Document', value: item.Document},
            {label: 'Updated', value: item.DateModified},
            {label: 'Amount:', value: insertCommas(item.Amount ?? '')},
          ].map((field, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 5,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  fontFamily: 'Oswald Regular',
                  color: '#333',
                  width: '50%',
                }}>
                {field.label}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: field.label === 'Amount:' ? 'rgba(8, 106, 235, 1)' : '#666',
                  fontWeight: field.label === 'Amount:' ? 'bold' : 'normal',
                  fontFamily: 'Oswald Regular',
                  width: '50%',
                  textAlign: 'right',
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {field.value}
              </Text>
            </View>
          ))}

          {/* Show More Button */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-end',
            }}>
            <Pressable
              style={({pressed}) => [
                {
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 18,
                  backgroundColor: pressed
                    ? 'rgba(189, 198, 236, 0.3)'
                    : 'transparent',
                },
              ]}
              onPress={() => onPressItem(index, item)}>
              <Text
                style={{
                  color: 'rgba(8, 106, 235, 1)',
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}>
                Show More
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const RegTrackingSummaryScreen = ({route}) => {
  const {selectedItem} = route.params;
  const {
    regTrackingSummaryListData,
    regTrackingSummaryListLoading,
    regTrackingSummaryListError,
    refetchRegTrackingSummaryList,
  } = useRegTrackingSummaryList(selectedItem.Status, selectedItem.Year);
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchRegTrackingSummaryList();
    setRefreshing(false);
  }, [refetchRegTrackingSummaryList]);

  const years = Array.from(
    {length: Math.max(0, new Date().getFullYear() - 2023 + 1)},
    (_, index) => new Date().getFullYear() - index,
  );

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onPressItem = useCallback(
    index => {
      navigation.navigate('Detail', {
        selectedItem: regTrackingSummaryListData[index],
      });
    },
    [navigation, regTrackingSummaryListData],
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && regTrackingSummaryListData.length > visibleItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const openYearModal = () => setModalVisible(true);
  const closeYearModal = () => setModalVisible(false);

  const selectYear = year => {
    setSelectedYear(year);
    closeYearModal();
    closeMenu();
  };

  const renderYearItem = ({item}) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectYear(item)}>
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    return (
      <View>
        <FlatList
          data={regTrackingSummaryListData.slice(0, visibleItems)}
          renderItem={({item, index}) => (
            <RenderTrackingSummary
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
          initialNumToRender={10}
          windowSize={5}
          ListFooterComponent={() =>
            regTrackingSummaryListLoading ? (
              <ActivityIndicator color="white" />
            ) : null
          }
        />
        {isLoadingMore && (
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignSelf: 'center',
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}>
            <ActivityIndicator size="large" color="gray" />
          </View>
        )}
      </View>
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingBottom: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}>
            <Pressable
              style={({pressed}) => [
                pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginStart: 10,
                  padding: 10,
                  borderRadius: 24,
                },
              ]}
              android_ripple={{
                color: '#F6F6F6',
                borderless: true,
                radius: 24,
              }}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="gray" />
            </Pressable>

            <Text
              style={{
                padding: 10,
                color: '#252525',
                fontFamily: 'Inter_28pt-Bold',
                fontSize: 16,
                flex: 1,
              }}>
              Tracking Summary
            </Text>
          </View>

          <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
            {regTrackingSummaryListLoading ? (
              <View style={[styles.container2, {top: 80}]}>
                {[...Array(7)].map((_, index) => (
                  <Shimmer key={index} />
                ))}
              </View>
            ) : regTrackingSummaryListError ? (
              <View
                style={{
                  flex: 1,
                  top: 80,
                }}>
                <Image
                  source={require('../../assets/images/errorState.png')}
                  style={{
                    width: '60%',
                    height: '25%',
                    alignSelf: 'center',
                  }}
                />
                <Text
                  style={{
                    fontFamily: 'Oswald-Light',
                    alignSelf: 'center',
                    color: 'gray',
                    fontSize: 16,
                    textAlign: 'center',
                    padding: 5,
                  }}>
                  {typeof regTrackingSummaryListError === 'string'
                    ? regTrackingSummaryListError
                    : regTrackingSummaryListError.message ||
                      'An unknown error occurred'}
                </Text>
              </View>
            ) : regTrackingSummaryListData === null ? (
              <View style={[styles.container2, {top: 80}]}>
                {[...Array(7)].map((_, index) => (
                  <Shimmer key={index} />
                ))}
              </View>
            ) : regTrackingSummaryListData.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  top: 80,
                }}>
                <Image
                  source={require('../../assets/images/noresultsstate.png')}
                  style={{
                    width: '60%',
                    height: '25%',
                    alignSelf: 'center',
                  }}
                />
                <Text
                  style={{
                    fontFamily: 'Oswald-Light',
                    alignSelf: 'center',
                    color: 'gray',
                    fontSize: 16,
                    textAlign: 'center',
                    padding: 5,
                  }}>
                  NO RESULTS FOUND
                </Text>
              </View>
            ) : (
              <View style={{flex: 1 /* paddingBottom: 55 */}}>
                {renderContent()}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </PaperProvider>
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
  transactionListContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Example background
  },
  transactionList: {
    padding: 10, // Inner padding for list items
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: 'rgba(13, 85, 199, 1)',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default RegTrackingSummaryScreen;
