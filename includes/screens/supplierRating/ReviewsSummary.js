import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {FlashList} from '@shopify/flash-list';
import {useSupplierReviewSummary} from '../../hooks/useSupplierRating';

const StarRating = ({rating}) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    let iconName = 'star-outline';
    if (i <= roundedRating) {
      iconName = 'star';
    } else if (i - 0.5 === roundedRating) {
      iconName = 'star-half';
    }

    stars.push(
      <MaterialCommunityIcons
        key={i}
        name={iconName}
        size={18}
        color="#FFD700"
        style={styles.star}
      />,
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

const Shimmer = ({style}) => (
  <View style={[{backgroundColor: '#E0E0E0', borderRadius: 4}, style]} />
);

export default function ReviewsSummary({navigation}) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 2024; i <= currentYear; i++) {
    years.push(i);
  }

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [reviews, setReviews] = useState([]);

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useSupplierReviewSummary(selectedYear);


  useEffect(() => {
    if (!isLoading && rawData && Array.isArray(rawData)) {
      const formattedReviews = rawData
        .map(item => ({
          id: item.Id,
          name: item.name,
          numReviews: parseInt(item.total_reviews, 10),
          timeliness: parseFloat(item.avg_timeliness),
          productQuality: parseFloat(item.avg_quality),
          service: parseFloat(item.avg_service),
          overallAverage: parseFloat(item.overall_avg),
          reviewYear: 2025,
        }))
        .filter(item => item.reviewYear === selectedYear);

      setReviews(formattedReviews);
    } else if (!isLoading && (!rawData || !Array.isArray(rawData))) {
      setReviews([]);
    }

    if (isError) {
      console.error('Error fetching supplier review summary:', error);
      setReviews([]);
    }
  }, [rawData, isLoading, isError, error, selectedYear]);

  const renderReviewItem = ({item, index}) => {
    const supplierId = item.id;

    return (
      <Pressable
        onPress={() => {
          if (supplierId) {
            navigation.navigate('SupplierDetails', {supplierId: supplierId});
          } else {
            console.warn(
              'Supplier ID is undefined, cannot navigate to SupplierDetails.',
            );
          }
        }}
        android_ripple={{color: 'rgba(0,0,0,0.1)'}}
        style={({pressed}) => [
          styles.reviewCard,
          pressed ? styles.reviewCardPressed : {},
        ]}>
        <View style={styles.indexColumn}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.reviewerName}>{item.name}</Text>
            <View style={styles.overallRatingContainer}>
              <Text style={styles.overallAverageText}>
                {item.overallAverage.toFixed(1)}
              </Text>
              <StarRating rating={item.overallAverage} />
            </View>
          </View>

          <View style={styles.reviewDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>No. of Reviews</Text>
              <Text style={styles.infoValue}>{item.numReviews}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timeliness</Text>
              <Text style={styles.infoValue}>{item.timeliness.toFixed(1)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Product Quality</Text>
              <Text style={styles.infoValue}>
                {item.productQuality.toFixed(1)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{item.service.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const ShimmerReviewCardPlaceholder = () => (
    <View style={[styles.reviewCard, styles.shimmerCard]}>
      <View style={styles.indexColumn}>
        <Shimmer style={styles.shimmerIndexText} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.shimmerContent}>
          <Shimmer style={styles.shimmerReviewerName} />
          <View style={styles.shimmerOverallRating}>
            <Shimmer style={styles.shimmerOverallAverageText} />
            <View style={styles.shimmerStarContainer}>
              {[...Array(5)].map((_, i) => (
                <Shimmer key={i} style={styles.shimmerStar} />
              ))}
            </View>
          </View>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.shimmerInfoRow}>
              <Shimmer style={styles.shimmerInfoLabel} />
              <Shimmer style={styles.shimmerInfoValue} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        {navigation && navigation.goBack && (
          <Pressable
            style={styles.backButton}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: true,
              radius: 20,
            }}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        )}
        <Text style={styles.headerTitle}>Reviews Summary</Text>
        <TouchableOpacity
          style={styles.yearDropdownTrigger}
          onPress={() => setShowYearPicker(!showYearPicker)}>
          <Text style={styles.yearDropdownText}>{selectedYear}</Text>
          <MaterialCommunityIcons
            name={showYearPicker ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}>
          <View style={styles.yearPickerContainer}>
            <FlatList
              data={years.sort((a, b) => b - a)}
              keyExtractor={item => item.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.yearOption,
                    selectedYear === item && styles.selectedYearOption,
                  ]}
                  onPress={() => {
                    setSelectedYear(item);
                    setShowYearPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.yearOptionText,
                      selectedYear === item && styles.selectedYearOptionText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {isLoading ? (
        <FlashList
          data={[1, 2, 3]}
          renderItem={ShimmerReviewCardPlaceholder}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={200}
        />
      ) : reviews.length > 0 ? (
        <FlashList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          contentContainerStyle={styles.listContent}
          estimatedItemSize={200}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <MaterialCommunityIcons
            name="star-box-outline"
            size={80}
            color="#bbb"
          />
          <Text style={styles.emptyListText}>No reviews available</Text>
          <Text style={styles.emptyListSubText}>
            It looks like there are no reviews yet for {selectedYear}.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    letterSpacing: 0.5,
  },
  yearDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  yearDropdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 10,
  },
  yearPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    width: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedYearOption: {
    backgroundColor: '#E6EEF7',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedYearOptionText: {
    fontWeight: 'bold',
    color: '#1A508C',
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#1A508C',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  reviewCardPressed: {
    opacity: 0.9,
    transform: [{scale: 0.99}],
  },
  indexColumn: {
    width: 38,
    backgroundColor: '#E6EEF7',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indexText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A508C',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    letterSpacing: 0.2,
    flex: 1,
  },
  overallRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  overallAverageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 5,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 0.5,
  },
  reviewDetails: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    flex: 1,
  },
  infoValue: {
    fontWeight: '600',
    color: '#222',
    textAlign: 'right',
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  shimmerCard: {
    height: 180,
    flexDirection: 'row',
  },
  shimmerIndexText: {
    height: 20,
    width: 20,
    borderRadius: 4,
  },
  shimmerContent: {
    flex: 1,
    padding: 20,
  },
  shimmerReviewerName: {
    height: 20,
    width: '70%',
    borderRadius: 4,
    marginBottom: 10,
  },
  shimmerOverallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  shimmerOverallAverageText: {
    height: 16,
    width: 30,
    borderRadius: 4,
    marginRight: 5,
  },
  shimmerStarContainer: {
    flexDirection: 'row',
  },
  shimmerStar: {
    height: 18,
    width: 18,
    borderRadius: 9,
    marginHorizontal: 1,
  },
  shimmerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shimmerInfoLabel: {
    height: 14,
    width: '40%',
    borderRadius: 4,
  },
  shimmerInfoValue: {
    height: 14,
    width: '25%',
    borderRadius: 4,
  },
});
