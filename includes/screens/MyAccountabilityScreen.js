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
import LinearGradient from 'react-native-linear-gradient';
import {Shimmer} from '../utils/useShimmer'; 
import {insertCommas} from '../utils/insertComma';
import useMyAccountability from '../api/useMyAccountabilty';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {BottomSheetFlatList, BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import {InteractionManager} from 'react-native';
import { width, currentYear } from '../utils';

const categoryGradients = [
  ['#4F46E5', '#6366F1'], // Indigo
  ['#1D4ED8', '#2563EB'], // Blue
  ['#059669', '#10B981'], // Emerald
  ['#D97706', '#F59E0B'], // Amber
  ['#DC2626', '#EF4444'], // Red
  ['#7C3AED', '#8B5CF6'], // Violet
  ['#DB2777', '#EC4899'], // Pink
  ['#0D9488', '#14B8A6'], // Teal
  ['#842C0F', '#B45309'], // Orange-Brown
  ['#6D28D9', '#7C3AED'], // Dark Violet
  ['#BE185D', '#DB2777'], // Dark Pink
  ['#0F766E', '#14B8A6'], // Dark Teal
  ['#9A3412', '#D97706'], // Dark Orange-Brown
];
const categories = [
  {
    name: 'Computer Equipment',
    icon: 'laptop',
    cat: ['CAT 10', 'CAT 10.1', 'CAT 11', 'CAT 12', 'CAT 13', 'CAT 36'],
  },
  {
    name: 'Office Equipment',
    icon: 'printer',
    cat: ['CAT 41', 'CAT 41.1', 'CAT 42', 'CAT 43', 'CAT 86'],
  },
  {
    name: 'Audio-Video Equipment',
    icon: 'television',
    cat: ['CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'CAT 5'],
  },
  {
    name: 'Furniture & Fixtures',
    icon: 'sofa',
    cat: ['CAT 27', 'CAT 27.1', 'CAT 28', 'CAT 29'],
  },
  {name: 'IT Services', icon: 'server', cat: ['CAT 36']},
  {name: 'Food & Catering', icon: 'silverware-fork-knife', cat: ['CAT 25']},
  {name: 'Groceries', icon: 'cart', cat: ['CAT 35', 'CAT 35.1', 'CAT 98']},
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
    name: 'Electrical Equipment',
    icon: 'lightbulb-outline',
    cat: ['CAT 18', 'CAT 19', 'CAT 20', 'CAT 21', 'CAT 22'],
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
  {name: 'Tailoring', icon: 'needle', cat: ['CAT 90']},
  {
    name: 'Subscription Services',
    icon: 'credit-card-outline',
    cat: ['CAT 69'],
  },
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

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []); 

  const animatedValues = useRef(
    categories.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!loading && !error && accountabilityData?.length > 0) {
      const relevantCategories = categories.filter(item =>
        accountabilityData.some(dataItem =>
          item?.cat?.includes(dataItem.Category),
        ),
      );

      Animated.stagger(
        50, 
        relevantCategories.map((_, index) =>
          Animated.timing(animatedValues[index], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }, [loading, error, accountabilityData]);

  const handleClose = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      bottomSheetRef.current?.close();
      // Added a slight delay for modal visibility change to allow BottomSheet animation to complete
      setTimeout(() => setModalVisible(false), 100);
      setSelectedCategory(null); // Clear selected category
    });
  }, []);

  const handlePress = useCallback(item => {
    setSelectedCategory(item);
    InteractionManager.runAfterInteractions(() => {
      setModalVisible(true);
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!accountabilityData || !selectedCategory) {
      return [];
    }
    return accountabilityData.filter(item =>
      selectedCategory.cat.includes(item.Category),
    );
  }, [accountabilityData, selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchMyAccountability();
    setRefreshing(false);
  }, [fetchMyAccountability]);

  const onPressItem = useCallback(
    index => {
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('MyAccountabilityDetails', {
          selectedItem: filteredData[index],
          selectedIcon: selectedCategory?.icon,
          selectedName: selectedCategory?.name,
        });
        setModalVisible(false);
      });
    },
    [navigation, filteredData, selectedCategory],
  );

  const renderShimmerCategories = () => (
    <FlatList
      data={Array.from({length: 6})} 
      keyExtractor={(item, index) => `shimmer-${index}`}
      numColumns={3}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingVertical: 10, paddingHorizontal: 12}}
      renderItem={({index}) => (
        <View style={{flex: 1 / 3, margin: 8, alignItems: 'center'}}>
          <Shimmer
            width={width * 0.29} 
            height={width * 0.29} 
            style={{borderRadius: 12}}
            key={`shimmer-${index}`}
          />
        </View>
      )}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View style={{alignSelf: 'center', margin: 10, opacity: 0.7}}>
            <Text>
              You have <Text style={styles.itemCountText}>...</Text> items in
              your name
            </Text>
          </View>
          <Text style={styles.sectionTitle}>Categories</Text>
          {renderShimmerCategories()}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We couldn’t load your accountabilities. Please check your connection
            and try again.
          </Text>
          <TouchableOpacity
            onPress={fetchMyAccountability}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!accountabilityData || accountabilityData.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Icons
              name="clipboard-text-off-outline"
              size={80}
              color="#b0b0b0"
            />
            <Text style={styles.emptyStateTitle}>
              No Accountabilities Found
            </Text>
            <Text style={styles.emptyStateMessage}>
              You currently have no items assigned to you.
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Filter categories to only show those that have items
    const relevantCategories = categories.filter(item =>
      accountabilityData.some(dataItem =>
        item?.cat?.includes(dataItem.Category),
      ),
    );

    return (
      <View style={{flex: 1}}>
        <View style={styles.itemCountWrapper}>
          <Text style={styles.itemCountTextPrefix}>
            You have{' '}
            <Text style={styles.itemCountText}>
              {accountabilityData.length}
            </Text>{' '}
            items in your name
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        <FlatList
          data={relevantCategories}
          keyExtractor={(item, index) =>
            item?.name ? String(item.name) : `fallback-${index}`
          }
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 10, paddingHorizontal: 12}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1A508C']}
              tintColor={'#1A508C'}
            />
          }
          renderItem={({item, index}) => {
            const categoryCount = accountabilityData.filter(dataItem =>
              item.cat.includes(dataItem.Category),
            ).length;

            const gradientColors =
              categoryGradients[index % categoryGradients.length];

            const translateY = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0], 
            });

            const opacity = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1], 
            });

            return (
              <Animated.View
                style={[
                  styles.categoryCardWrapper,
                  {opacity, transform: [{translateY}]},
                ]}>
                <TouchableOpacity
                  style={styles.categoryCardTouchable} // New style for touchable feedback
                  onPress={() => handlePress(item)}
                  activeOpacity={0.8}>
                  <LinearGradient
                    //colors={gradientColors}
                    colors={['#1A508C', '#004ab1']}
                    style={styles.categoryCardGradient}>
                    <Icons
                      name={item.icon}
                      size={38}
                      color="#fff"
                      style={{marginBottom: 4}}
                    />
                    <Text style={styles.categoryCardName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.categoryCardCount}>
                      ({categoryCount})
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <ImageBackground
               source={require('../../assets/images/CirclesBG.png')}
               style={styles.headerBackground}>
               <View style={styles.header}>
                 <Pressable
                   style={styles.backButton}
                   android_ripple={styles.backButtonRipple}
                   onPress={() => navigation.goBack()}>
                   <Icon name="arrow-back" size={24} color="#fff" />
                 </Pressable>
                 <Text style={styles.headerTitle}>Accountabilities</Text>
                 <View style={{width: 40}} />
               </View>
             </ImageBackground>

        <View style={styles.contentArea}>{renderContent()}</View>

        <BottomSheet
          ref={bottomSheetRef}
          index={modalVisible ? 1 : -1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={handleClose}
          backgroundStyle={styles.bottomSheetBackground}
          handleComponent={null} 
          backdropComponent={props => (
                <BottomSheetBackdrop
                  {...props}
                  disappearsOnIndex={-1}
                  appearsOnIndex={0}
                />
              )}
          
        >
          <LinearGradient
            colors={['#1A508C', '#004ab1']} 
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHeaderContent}>
              <Icons
                name={selectedCategory?.icon}
                size={48} 
                color="white"
                style={{marginBottom: 8}}
              />
              <Text style={styles.bottomSheetCategoryName}>
                {selectedCategory?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.bottomSheetCloseButton}>
              <Icons name="close-circle-outline" size={30} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <BottomSheetFlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.Id?.toString() || index.toString()
            }
            contentContainerStyle={styles.bottomSheetListContent}
            renderItem={({item, index}) => (
              <TouchableOpacity // Make the entire card touchable
                style={styles.detailCard}
                onPress={() => onPressItem(index)}
                activeOpacity={0.8}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>TN</Text>
                  <Text style={styles.cardValue}>
                    {item.Year} - {item.TrackingNumber}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Common Name</Text>
                  <Text style={styles.cardValue}>{item.CommonName}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Brand</Text>
                  <Text style={styles.cardValue}>{item.Brand}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Date Acquired</Text>
                  <Text style={styles.cardValue}>{item.DateAcquired}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Amount</Text>
                  <Text style={styles.cardValue}>
                    ₱{insertCommas(item.Amount)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Item Desc.</Text>
                  <Text
                    style={styles.cardValue}
                    numberOfLines={3}
                    ellipsizeMode="tail">
                    {item.Item}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.bottomSheetEmpty}>
                <Icons name="magnify-minus-outline" size={50} color="gray" />
                <Text style={styles.bottomSheetEmptyText}>
                  No items found for this category.
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
    backgroundColor: '#F8F9FB', 
  },
  headerBackground: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonRipple: {
    color: 'rgba(255,255,255,0.2)',
    borderless: true,
    radius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingTop: 10, 
  },
  itemCountWrapper: {
    alignSelf: 'center',
    marginVertical: 15, 
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#EBF4FF', 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C2E0FF', 
  },
  itemCountTextPrefix: {
    fontSize: 16,
    color: '#4A5568', 
  },
  itemCountText: {
    fontSize: 24, 
    fontWeight: '900', 
    color: '#252525',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    fontStyle: 'italic',
    color: '#718096', 
    fontSize: 15,
    marginBottom: 5,
    fontWeight: '600',
  },
  categoryCardWrapper: {
    flex: 1 / 3,
    margin: 6, 
    alignItems: 'center',
  },
  categoryCardTouchable: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardGradient: {
    width: '95%', 
    aspectRatio: 1, 
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 0.5, 
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryCardName: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontWeight: '600',
    lineHeight: 16,
  },
  categoryCardCount: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bottomSheetHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 2, // Slight elevation for the bottom sheet header
  },
  bottomSheetHeaderContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1, // Take available space
  },
  bottomSheetCategoryName: {
    fontSize: 24, // Larger category name
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  bottomSheetCloseButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', // Subtle background on button
  },
  bottomSheetListContent: {
    paddingBottom: 50,
    paddingVertical: 20,
    paddingHorizontal: 15, // Add horizontal padding
  },
  detailCard: {
    backgroundColor: '#FFF',
    padding: 15, // Increased padding
    borderRadius: 12, // More rounded corners
    marginBottom: 15, // More space between cards
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, // Lighter shadow
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#E0E0E0', // Very light border
  },
  cardInfo: {
    flexDirection: 'row',
    marginVertical: 4, // More vertical space between info rows
    alignItems: 'flex-start', // Align labels and values to top
  },
  cardLabel: {
    fontSize: 13,
    color: '#6C757D',
    // fontFamily: 'Inter_28pt-Light', // If custom font is available, use it
    flex: 0.35, // Label takes more width
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: '500', // Medium weight for labels
  },
  cardValue: {
    flex: 0.65,
    fontSize: 14,
    color: '#252525',
    // fontFamily: 'Inter_28pt-Regular', // If custom font is available
    lineHeight: 20, // Improve readability for multi-line text
  },
  // seeDetailsButton removed as the whole card is now tappable
  bottomSheetEmpty: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetEmptyText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  // Loading and Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#DC2626', // Red color
    marginTop: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyStateContainer: {
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fb',
  },
  emptyStateCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyStateMessage: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyAccountabilityScreen;
