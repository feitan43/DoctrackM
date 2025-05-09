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
//import {SafeAreaView} from 'react-native-safe-area-context';
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
        backgroundColor: '#fff',
        borderRadius: 8, // Increased for smoother edges
        padding: 10, // More padding for better spacing
        marginVertical: 10, // Replaces marginTop & marginBottom
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15, // Slightly stronger for better visibility
        shadowRadius: 4,
        elevation: 1, // Lower elevation to match shadow
        //borderWidth: 1, // Optional: Thin border for refinement
        //borderColor: 'rgba(0, 0, 0, 0.1)', // Light border for subtle separation
      }}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
        {/* Index Badge */}
        <View
          style={{
            //backgroundColor: '#007bff',
            marginBottom: 8,
            paddingBottom: 6,
            borderRadius: 50,
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: item?.Status?.includes('Pending') ? '#FF4343' : '#007bff',
              fontWeight: 'bold',
              fontSize: 16,
            }}>
            {index + 1}
          </Text>
        </View>

        {/* Content Section */}
        <View style={{flex: 1, marginLeft: 10}}>
          {/* Status Indicator */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
              borderBottomWidth: 1,
              paddingBottom: 6,
              borderColor: item?.Status?.includes('Pending')
                ? '#FF4343'
                : '#252525',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: item?.Status?.includes('Pending') ? '#FF4343' : '#333',
                flex: 1,
              }}>
              {item?.Status ?? ''}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={{paddingVertical: 8}}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Claimant</Text>
              <Text style={styles.value}>{item.Claimant}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>TN</Text>
              <Text style={styles.value}>{item.TrackingNumber}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Document</Text>
              <Text style={styles.value}>{item.DocumentType}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Month</Text>
              <Text style={styles.value}>
                {getShortMonth(item.PeriodMonth)}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Amount</Text>
              <Text style={[styles.value, {color: '#007bff'}]}>
                {insertCommas(item.Amount)}
              </Text>
            </View>
          </View>

          {/* Actions Section */}
          <View style={{alignSelf: 'flex-end'}}>
            <Pressable
              style={({pressed}) => [
                {
                  alignSelf: 'flex-end',
                  padding: 10,
                  //elevation: 2,
                },
              ]}
              onPress={() => onPressItem(index, item)}>
              <Text style={{color: 'orange'}}>See Details</Text>
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

  /*   const years = Array.from(
    {length: 3},
    (_, index) => new Date().getFullYear() - index,
  );
 */
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
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: 'silver',
    fontFamily: 'Inter_28pt-Regular',
    flex: 0.3, // Label takes 30% width,
    textAlign: 'right',
  },
  value: {
    paddingStart: 10,
    fontSize: 14,
    color: '#252525',
    fontFamily: 'Inter_28pt-SemiBold',
    flex: 0.7,
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
