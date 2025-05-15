import React, {useState, memo, useCallback} from 'react';
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
  StatusBar,
  Modal,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useMyTransactions from '../api/useMyTransactions';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import {Menu, PaperProvider} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';

const currentYear = new Date().getFullYear();

const RenderTransaction = memo(({item, index, onPressItem}) => {
  const getShortMonth = month => month.slice(0, 3);

  return (
    <View
      style={{
        //backgroundColor: 'rgba(179, 196, 233, 0.1)',
        marginVertical: 5,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
        <View style={{paddingHorizontal: 10, justifyContent: 'center'}}>
          <Text
            style={{
              fontSize: 15,
              textAlign: 'right',
              fontFamily: 'Inter_28pt-Bold',
              color: '#007bff',
            }}>
            {index + 1}
          </Text>
        </View>

        {/* Content Section */}
        <View style={{flexDirection: 'column', flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
              borderBottomWidth: 1,
              paddingBottom: 5,
              borderColor: item?.Status?.includes('Pending')
                ? '#FF9800'
                : '#252525',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_28pt-Bold',
                color: item?.Status?.includes('Pending')
                  ? '#FF9800'
                  : '#252525',
                width: '100%',
                textAlign: 'left',
              }}>
              {item?.Status ?? ''}
            </Text>
          </View>

          <View style={styles.textRow}>
            <Text style={styles.label}>TN </Text>
            <Text style={styles.value}>{item.TrackingNumber}</Text>
          </View>

          {item.TrackingType !== 'PR' && (
            <View>
              <View style={styles.textRow}>
                <Text style={styles.label}>Claimant </Text>
                <Text style={styles.value}>{item.Claimant}</Text>
              </View>
              <View style={styles.textRow}>
                <Text style={styles.label}>Document </Text>
                <Text style={styles.value}>{item.DocumentType}</Text>
              </View>
            </View>
          )}

          {item.TrackingType === 'PR' && (
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
                    : item.PR_Month >= 10 && item.PR_Month <= 12
                    ? '4th Quarter'
                    : ''}
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
            <Text style={styles.value}>{getShortMonth(item.PeriodMonth)}</Text>
          </View>

          <View style={styles.textRow}>
            <Text style={styles.label}>Amount </Text>
            <Text
              style={[
                styles.value,
                {
                  color: 'rgba(8, 106, 235, 1)',
                  fontFamily: 'Inter_28pt-Bold',
                },
              ]}>
              {insertCommas(item.Amount)}
            </Text>
          </View>

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
                    : 'rgba(227, 230, 247, 0.3)',
                },
              ]}
              onPress={() => onPressItem(index, item)}>
              <Text
                style={{
                  color: 'rgb(27, 126, 255)',
                  fontWeight: '500',
                  textAlign: 'right',
                }}>
                See Details
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const MyTransactionsScreen = ({navigation}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const {myTransactionsData, loading, error, fetchMyPersonal} =
    useMyTransactions(selectedYear);
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyPersonal();
    setRefreshing(false);
  }, [fetchMyPersonal]);

  const years = Array.from(
    {length: Math.max(0, new Date().getFullYear() - 2023 + 1)},
    (_, index) => new Date().getFullYear() - index,
  );

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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

  const YearDropdown = ({selectedYear, setSelectedYear}) => {
    const years = Array.from(
      {length: Math.max(0, currentYear - 2023 + 1)},
      (_, index) => ({
        label: `${currentYear - index}`,
        value: currentYear - index,
      }),
    );

    return (
      <View
        style={{
          position: 'relative',
          zIndex: 1,
          borderWidth: 1,
          borderColor: 'silver',
          borderRadius: 5,
        }}>
        <Dropdown
          style={[styles.dropdown, {elevation: 10}]}
          data={years}
          labelField="label"
          valueField="value"
          placeholder={`${selectedYear}`}
          selectedTextStyle={{color: '#fff'}}
          placeholderStyle={{color: '#fff'}}
          iconStyle={{tintColor: '#fff'}}
          value={selectedYear}
          onChange={item => {
            setSelectedYear(item.value);
          }}
        />
      </View>
    );
  };

  const renderContent = () => {
    return (
      <>
        <FlatList
          contentContainerStyle={{paddingVertical: 10}}
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
      </>
    );
  };
  return (
    <PaperProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
         <ImageBackground
                source={require('../../assets/images/bgasset.jpg')}
                style={{flex: 1}}
                resizeMode="cover">
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                />
        <View style={styles.container}>
          <ImageBackground
            source={require('../../assets/images/CirclesBG.png')}
            style={styles.bgHeader}>
            <View style={styles.header}>
              <Pressable
                style={({pressed}) => [
                  pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                  styles.backButton,
                ]}
                android_ripple={{
                  color: '#F6F6F6',
                  borderless: true,
                  radius: 24,
                }}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </Pressable>

              <Text style={styles.title}>Salaries</Text>
              <View>
                <YearDropdown
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                />
              </View>
            </View>
          </ImageBackground>

          <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
            {loading ? (
              <View style={[styles.container2, {top: 80}]}>
                {[...Array(7)].map((_, index) => (
                  <Shimmer key={index} />
                ))}
              </View>
            ) : error ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}>
                <Image
                  source={require('../../assets/images/errorState.png')}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: 'contain',
                    marginBottom: 10,
                  }}
                />
                <Text
                  style={{
                    alignSelf: 'center',
                    color: 'gray',
                    fontSize: 14,
                    textAlign: 'center',
                    paddingHorizontal: 10,
                  }}>
                  {typeof error === 'string'
                    ? error
                    : error.message || 'An unknown error occurred'}
                </Text>
              </View>
            ) : myTransactionsData === null ? (
              <View style={[styles.container2, {top: 80}]}>
                {[...Array(7)].map((_, index) => (
                  <Shimmer key={index} />
                ))}
              </View>
            ) : myTransactionsData.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}>
                <Image
                  source={require('../../assets/images/noresultsstate.png')}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: 'contain',
                    marginBottom: 10,
                  }}
                />
                <Text
                  style={{
                    alignSelf: 'center',
                    color: 'gray',
                    fontSize: 14,
                    textAlign: 'center',
                    paddingHorizontal: 10,
                  }}>
                  No Result Found
                </Text>
              </View>
            ) : (
              <View style={{height: '100%' /* paddingBottom: 55 */}}>
                {renderContent()}
              </View>
            )}
          </View>
        </View>

        <Modal transparent={true} visible={modalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={years}
                renderItem={renderYearItem}
                keyExtractor={item => item}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeYearModal}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </ImageBackground>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
  dropdown: {
    width: 80,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    //backgroundColor:'red',
    width: '30%',
    fontSize: 12,
    fontFamily: 'Inter_28pt-Light',
    textAlign: 'right',
    color: 'gray',
  },
  value: {
    //backgroundColor:'blue',
    width: '70%',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    color: 'black',
    marginStart: 10,
  },
  bgHeader: {
    paddingTop: 30,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 4, // Shadow effect
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    //elevation: 2,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    //padding: 10,
  },
});

export default MyTransactionsScreen;
