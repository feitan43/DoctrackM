import React, {
  useEffect,
  useState,
  memo,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  Dimensions,
  Image,
  StatusBar,
  Modal,
  Button,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useMyTransactions from '../api/useMyTransactions';
//import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Shimmer} from '../utils/useShimmer';
import {insertCommas} from '../utils/insertComma';
import {FlashList} from '@shopify/flash-list';
import useMyAccountability from '../api/useMyAccountabilty';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import Loading from '../utils/Loading';
import { InteractionManager } from 'react-native';

const currentYear = new Date().getFullYear();

const categories = [
  {
    name: 'Audio-Video Equipment',
    icon: 'television',
    cat: ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5'],
  },
  {
    name: 'Computer Equipment',
    icon: 'laptop',
    cat: ['CAT 10', 'CAT 10.1', 'CAT 11', 'CAT 12', 'CAT 13', 'CAT 36'],
  },
  {
    name: 'Electrical Equipment',
    icon: 'lightbulb-outline',
    cat: ['CAT 18', 'CAT 19', 'CAT 20', 'CAT 21', 'CAT 22'],
  },
  {
    name: 'Furniture & Fixtures',
    icon: 'sofa',
    cat: ['CAT 27', 'CAT 27.1', 'CAT 28', 'CAT 29'],
  },
  {
    name: 'Medical Supplies',
    icon: 'hospital-box',
    cat: [
      'CAT 16',
      'CAT 17',
      'CAT 38',
      'CAT 39',
      'CAT 39.1',
      'CAT 39.2',
      'CAT 39.3',
    ],
  },
  {
    name: 'Office Equipment',
    icon: 'printer',
    cat: ['CAT 41', 'CAT 41.1', 'CAT 42', 'CAT 43', 'CAT 86'],
  },
  {name: 'Plumbing Supplies', icon: 'pipe', cat: ['CAT 47', 'CAT 48']},
  {
    name: 'Sports Equipment',
    icon: 'basketball',
    cat: ['CAT 57', 'CAT 58', 'CAT 59', 'CAT 59.1'],
  },
  {
    name: 'Vehicles & Accessories',
    icon: 'car',
    cat: ['CAT 60', 'CAT 61', 'CAT 62', 'CAT 63'],
  },
  {
    name: 'Security & Safety',
    icon: 'shield-lock-outline',
    cat: ['CAT 54', 'CAT 78', 'CAT 88', 'CAT 89', 'CAT 101'],
  },
  {
    name: 'Construction Materials',
    icon: 'tools',
    cat: [
      'CAT 14',
      'CAT 14.1',
      'CAT 15',
      'CAT 24',
      'CAT 30',
      'CAT 53',
      'CAT 73',
      'CAT 100',
    ],
  },
  {name: 'Groceries', icon: 'cart', cat: ['CAT 35', 'CAT 35.1', 'CAT 98']},
  {name: 'IT Services', icon: 'server', cat: ['CAT 36']},
  {name: 'Food & Catering', icon: 'silverware-fork-knife', cat: ['CAT 25']},
  {name: 'Tailoring', icon: 'needle', cat: ['CAT 90']},
  {name: 'Subscription Services', icon: 'credit-card-outline', cat: ['CAT 69']},
  {
    name: 'Others',
    icon: 'dots-horizontal',
    cat: [
      'CAT 6',
      'CAT 7',
      'CAT 8',
      'CAT 9',
      'CAT 9.1',
      'CAT 26',
      'CAT 31',
      'CAT 32',
      'CAT 33',
      'CAT 34',
      'CAT 37',
      'CAT 40',
      'CAT 44',
      'CAT 45',
      'CAT 46',
      'CAT 49',
      'CAT 50',
      'CAT 51',
      'CAT 52',
      'CAT 55',
      'CAT 56',
      'CAT 64',
      'CAT 65',
      'CAT 66',
      'CAT 67',
      'CAT 68',
      'CAT 70',
      'CAT 71',
      'CAT 72',
      'CAT 74',
      'CAT 75',
      'CAT 76',
      'CAT 77',
      'CAT 79',
      'CAT 80',
      'CAT 81',
      'CAT 82',
      'CAT 83',
      'CAT 84',
      'CAT 85',
      'CAT 87',
      'CAT 91',
      'CAT 92',
      'CAT 93',
      'CAT 94',
      'CAT 95',
      'CAT 96',
      'CAT 97',
      'CAT 99',
      'CAT 102',
      'NO CAT',
      '',
      null,
    ],
  },
];

const MyAccountabilityScreen = ({navigation}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const {accountabilityData, loading, error, fetchMyAccountability} =
    useMyAccountability();

    console.log(accountabilityData)
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '95%'], []);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    setModalVisible(false);
  }, []);

  const handlePress = item => {
    setSelectedCategory(item);
    setModalVisible(true);
  };

  const filteredData = selectedCategory
    ? accountabilityData.filter(item =>
        selectedCategory.cat.includes(item.Category),
      )
    : accountabilityData;

  const [showAll, setShowAll] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyAccountability();
    setRefreshing(false);
  }, [fetchMyAccountability]);

  const years = Array.from(
    {length: 2},
    (_, index) => new Date().getFullYear() - index,
  );

  const handleShowMore = () => {
    setVisibleItems(prev => prev + 6);
  };

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
      navigation.navigate('MyAccountabilityDetails', {
        selectedItem: filteredData[index],
        selectedIcon: selectedCategory?.icon,
        selectedName: selectedCategory?.name,
      });
      setModalVisible(false);
    },
    [navigation, filteredData, selectedCategory],
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && accountabilityData.length > visibleItems) {
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
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.8)',
          }}>
          <Loading />
        </View>
      );
    }

    if (!accountabilityData) {
      return null;
    }

    return (
      <View style={{flex: 1}}>
        {accountabilityData.length > 0 ? (
          <View>
            <View style={{alignSelf: 'center', margin: 10}}>
              <Text>
                You have{' '}
                <Text
                  style={{fontSize: 20, fontWeight: 'bold', color: '#252525'}}>
                  {accountabilityData.length}
                </Text>{' '}
                items in your name
              </Text>
            </View>

            <Text
              style={{
                paddingHorizontal: 20,
                fontStyle: 'italic',
                color: 'gray',
              }}>
              Categories
            </Text>

            <FlatList
              data={categories.filter(item =>
                accountabilityData.some(dataItem =>
                  item?.cat?.includes(dataItem.Category),
                ),
              )}
              keyExtractor={(item, index) =>
                item?.Id ? String(item.Id) : `fallback-${index}`
              }
              numColumns={3}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 10}}
              renderItem={({ item }) => {
                const categoryCount = accountabilityData.filter(dataItem =>
                  item.cat.includes(dataItem.Category),
                ).length;

                return (
                  <TouchableOpacity
                    style={{
                      flex: 1 / 3,
                      margin: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handlePress(item)}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#1E40AF']}
                      style={{
                        width: 100,
                        height: 90,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        //elevation: 4,
                      }}
                    >
                      <Icons
                        name={item.icon}
                        size={30}
                        color="#fff"
                        style={{ marginBottom: 4 }}
                      />
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 10,
                          textAlign: 'center',
                          paddingHorizontal: 5,
                        }}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text style={{ color: 'white', fontSize: 10 }}>
                        ({categoryCount})
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}

            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              padding: 20,
              backgroundColor: '#f8f9fb',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: {width: 0, height: 4},
                elevation: 5,
                alignItems: 'center',
              }}>
              <Icons name="clipboard" size={50} color="#b0b0b0" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                  marginTop: 10,
                }}>
                No Accountabilities
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'gray',
                  textAlign: 'center',
                  marginTop: 5,
                }}>
                You currently have no items assigned to you.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
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

            <Text style={styles.title}>Accountabilities</Text>
          </View>
        </ImageBackground>

        <View style={{flex: 1}}>{renderContent()}</View>

        <BottomSheet
          ref={bottomSheetRef}
          index={modalVisible ? 1 : -1} // Open when modalVisible is true
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={handleClose}
          backgroundStyle={{backgroundColor: 'white', borderRadius: 10}}
          handleComponent={() => null} // 👈 This removes the header/handle
        >
          {/* Header Section */}
          <View style={{backgroundColor: '#004ab1', padding: 10}}>
            <TouchableOpacity
              onPress={handleClose}
              style={{alignSelf: 'flex-start', padding: 10}}>
              <Icons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View style={{alignItems: 'center', marginBottom: 10}}>
              <Icons name={selectedCategory?.icon} size={40} color="white" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: 'white',
                }}>
                {selectedCategory?.name}
              </Text>
            </View>
          </View>

          <BottomSheetFlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.Id?.toString() || index.toString()
            }
            contentContainerStyle={{paddingBottom: 50, paddingVertical: 20}}
            renderItem={({item, index}) => (
              <View style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>TN</Text>
                  <Text style={styles.cardValue}>
                    {item.Year} - {item.TrackingNumber}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Common</Text>
                  <Text style={styles.cardValue}>{item.CommonName}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Brand</Text>
                  <Text style={styles.cardValue}>{item.Brand}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Date</Text>
                  <Text style={styles.cardValue}>{item.DateAcquired}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Amount</Text>
                  <Text style={styles.cardValue}>
                    {insertCommas(item.Amount)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Item</Text>
                  <Text
                    style={[styles.cardValue]}
                    numberOfLines={4}
                    ellipsizeMode="tail">
                    {item.Item}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{alignSelf: 'flex-end', padding: 10}}
                  onPress={() => onPressItem(index, item)}>
                  <Text style={{color: 'orange'}}>See Details</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text style={{fontSize: 14, color: 'gray'}}>
                  No Results Found
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </BottomSheet>

      </View>
    </SafeAreaView>
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
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  card: {
    backgroundColor: '#FFF',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A508C',
    marginBottom: 6,
  },
  cardInfo: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    marginVertical: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontFamily: 'Inter_28pt-ExtraLight',
    flex: 0.3, // Label takes 30% width,
    textAlign: 'right',
  },
  cardValue: {
    paddingStart: 10,
    fontSize: 14,
    color: '#252525',
    fontFamily: 'Inter_28pt-Regular',
    flex: 0.7,
  },
  gridItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  text: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  showMoreButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'blue',
    alignItems: 'center',
    borderRadius: 5,
  },
  showMoreText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MyAccountabilityScreen;
