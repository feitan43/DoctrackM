import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const SupplierRanking = ({navigation}) => {
  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        const response = await fetch(
          'https://davaocityportal.com/gord/ajax/dataprocessor.php?supplierRanking=1&year=2025',
          {
            // Add headers here if needed
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, response: ${errorText}`,
          );
        }

        const rawData = await response.json();

        if (!Array.isArray(rawData) || rawData.length === 0) {
          setSupplierData([]);
          setLoading(false);
          return;
        }

        const sortedData = [...rawData].sort((a, b) => {
          // Parse values, defaulting to 0 for safety
          const reviewsA = parseInt(a.TotalReviews || '0', 10);
          const reviewsB = parseInt(b.TotalReviews || '0', 10);

          const timelinessA = parseFloat(a.AvgTimeliness || '0.0');
          const timelinessB = parseFloat(b.AvgTimeliness || '0.0');
          const qualityA = parseFloat(a.AvgQuality || '0.0');
          const qualityB = parseFloat(b.AvgQuality || '0.0');
          const serviceA = parseFloat(a.AvgService || '0.0');
          const serviceB = parseFloat(b.AvgService || '0.0');

          const overallRatingA = parseFloat(a.OverallRating || '0.0');
          const overallRatingB = parseFloat(b.OverallRating || '0.0');

          // Calculate the combined average for timeliness, product quality, and service
          // Ensure to handle cases where some values might be 0, to avoid division by zero if counting non-zero values.
          const countA = (timelinessA > 0 ? 1 : 0) + (qualityA > 0 ? 1 : 0) + (serviceA > 0 ? 1 : 0);
          const combinedAvgA = countA > 0 ? (timelinessA + qualityA + serviceA) / countA : 0;

          const countB = (timelinessB > 0 ? 1 : 0) + (qualityB > 0 ? 1 : 0) + (serviceB > 0 ? 1 : 0);
          const combinedAvgB = countB > 0 ? (timelinessB + qualityB + serviceB) / countB : 0;


          // 1. Primary sort: by number of reviews (descending)
          if (reviewsB !== reviewsA) {
            return reviewsB - reviewsA;
          }

          // 2. Secondary sort: by combined average of Timeliness, Product Quality, and Service (descending)
          if (combinedAvgB !== combinedAvgA) {
            return combinedAvgB - combinedAvgA;
          }

          // 3. Tertiary sort: by Overall Average (descending)
          if (overallRatingB !== overallRatingA) {
            return overallRatingB - overallRatingA;
          }

          // 4. Fallback sort: by supplier name (ascending)
          return (a.SupplierName || '').localeCompare(b.SupplierName || '');
        });

        const formattedData = sortedData.map((item, index) => ({
          name: item.SupplierName || 'Unknown Supplier',
          reviews: parseInt(item.TotalReviews || '0', 10),
          timeliness: parseFloat(item.AvgTimeliness || '0.0'),
          productQuality: parseFloat(item.AvgQuality || '0.0'),
          service: parseFloat(item.AvgService || '0.0'),
          overallAverage: parseFloat(item.OverallRating || '0.0'),
          rank: index + 1,
        }));

        setSupplierData(formattedData);
      } catch (e) {
        console.error('Failed to fetch supplier data:', e);
        setError(e.message || 'An unexpected error occurred.');
        Alert.alert('Error', 'Failed to load supplier data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

  // ... (rest of your component code remains the same)
  const getPlatformShadow = () => {
    return Platform.select({
      ios: styles.iosShadow,
      android: styles.androidElevation,
    });
  };

  const getRankColor = rank => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#6B7280'; // Gray for others
    }
  };

  const getRankIcon = rank => {
    switch (rank) {
      case 1:
      case 2:
      case 3:
        return 'trophy'; // Trophy for top 3
      default:
        return ''; // No icon for ranks 4+
    }
  };

  const renderStarRating = (rating) => {
    const totalStars = 5;
    const stars = [];
    const numericRating = typeof rating === 'number' ? rating : 0;
    const fullStars = Math.round(numericRating); // Round to nearest whole star

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MaterialCommunityIcons key={`star-full-${i}`} name="star" size={18} color="#FFD700" />);
    }
    for (let i = fullStars; i < totalStars; i++) {
      stars.push(<MaterialCommunityIcons key={`star-empty-${i}`} name="star-outline" size={18} color="#FFD700" />);
    }
    return <View style={styles.starRatingRow}>{stars}</View>;
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4299E1" />
        <Text style={styles.loadingText}>Loading supplier rankings...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchSupplierData();
          }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (supplierData.length === 0) {
    return (
      <SafeAreaView style={styles.noDataContainer}>
        <MaterialCommunityIcons name="information-outline" size={50} color="#718096" />
        <Text style={styles.noDataText}>No supplier data available for 2025 yet.</Text>
        <TouchableOpacity
          style={styles.backButtonBottom}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonTextBottom}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerContainer, getPlatformShadow()]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplier Rankings</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}>
        {supplierData.map(supplier => (
          <TouchableOpacity
            key={supplier.rank}
            style={[
              styles.cardItem,
              getPlatformShadow(),
              supplier.rank <= 3 && {borderLeftColor: getRankColor(supplier.rank)},
            ]}
            onPress={() => {}}
            activeOpacity={0.7}>
            {/* Left Column: Rank Display Area */}
            <View style={styles.rankBadgeContainer}>
              {supplier.rank <= 3 ? (
                <MaterialCommunityIcons
                  name={getRankIcon(supplier.rank)}
                  size={28}
                  color={getRankColor(supplier.rank)}
                />
              ) : (
                <Text
                  style={[
                    styles.rankNumberOnly,
                    {color: getRankColor(supplier.rank)},
                  ]}>
                  {supplier.rank}
                </Text>
              )}
            </View>

            {/* Middle Column: Name and Details */}
            <View style={styles.nameAndDetailsColumn}>
              <Text style={styles.supplierName}>{supplier.name}</Text>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>
                  No. Reviews: <Text style={styles.boldValue}>{supplier.reviews}</Text>
                </Text>
                <Text style={styles.detailText}>
                  Timeliness: <Text style={styles.boldValue}>{isNaN(supplier.timeliness) ? 'N/A' : supplier.timeliness.toFixed(1)}</Text>
                </Text>
                <Text style={styles.detailText}>
                  Prod. Quality: <Text style={styles.boldValue}>{isNaN(supplier.productQuality) ? 'N/A' : supplier.productQuality.toFixed(1)}</Text>
                </Text>
                <Text style={styles.detailText}>
                  Service: <Text style={styles.boldValue}>{isNaN(supplier.service) ? 'N/A' : supplier.service.toFixed(1)}</Text>
                </Text>
              </View>
            </View>

            {/* Right Column: Overall Average and Stars */}
            <View style={styles.overallRatingColumn}>
              <Text style={styles.overallLabel}>Overall ({supplier.reviews}) Reviews</Text>
              <Text style={styles.averageValue}>{isNaN(supplier.overallAverage) ? 'N/A' : supplier.overallAverage.toFixed(1)}</Text>
              <Text style={styles.outOfFive}>out of 5</Text>
              {renderStarRating(supplier.overallAverage)}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4299E1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    padding: 20,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  backButtonBottom: {
    marginTop: 20,
    backgroundColor: '#6B7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonTextBottom: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  androidElevation: {
    elevation: 1,
  },
  headerContainer: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  cardItem: {
    flexDirection: 'row',
    //alignItems: 'center', // Align items center vertically for the main row
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#E2E8F0',
    overflow: 'hidden',
  },
  rankBadgeContainer: {
    width: 40,
    alignItems: 'center',
    //justifyContent: 'center',
    marginRight: 10,
  },
  rankNumberOnly: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameAndDetailsColumn: { // New style for the middle column
    flex: 1, // Takes up available space
    flexDirection: 'column',
    justifyContent: 'center', // Center content vertically within this column
    marginRight: 10, // Space from the overall rating column
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8, // Space between name and details
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 12,
    color: '#4A5568',
    marginRight: 12,
    marginBottom: 4,
  },
  boldValue: {
    fontWeight: 'bold',
    color: '#2D3748',
  },
  overallRatingColumn: { // New style for the right column
    width: 100, // Fixed width for the overall rating section
    alignItems: 'center', // Center content horizontally within this column
    justifyContent: 'center', // Center content vertically within this column
    paddingLeft: 5, // Small padding on left
    borderLeftWidth: 1, // A subtle separator line
    borderLeftColor: '#E2E8F0',
  },
  overallLabel: {
    fontSize: 10, // Smaller font for label
    color: '#4299E1',
    textAlign: 'center', // Center text within its container
  },
  averageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 2, // Space from label
  },
  outOfFive: {
    fontSize: 10, // Smaller font
    color: '#718096',
    marginBottom: 4, // Space from stars
    textAlign: 'center',
  },
  starRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center stars within their row
  },
});

export default SupplierRanking;