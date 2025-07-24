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

        // Directly set the rawData without any sorting
        setSupplierData(rawData);
      } catch (e) {
        console.error('Failed to fetch supplier data:', e);
        setError(e.message || 'An unexpected error occurred.');
        Alert.alert(
          'Error',
          'Failed to load supplier data. Please try again later.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

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
        return '#d1cece'; // Gray for others
    }
  };

  // Removed getRankIcon function as it's no longer needed

  const renderStarRating = rating => {
    const totalStars = 5;
    const stars = [];
    const numericRating = typeof rating === 'number' ? rating : 0;
    const fullStars = Math.round(numericRating); // Round to nearest whole star

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`star-full-${i}`}
          name="star"
          size={18}
          color="#FFD700"
        />,
      );
    }
    for (let i = fullStars; i < totalStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`star-empty-${i}`}
          name="star-outline"
          size={18}
          color="#FFD700"
        />,
      );
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
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={50}
          color="#EF4444"
        />
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
        <MaterialCommunityIcons
          name="information-outline"
          size={50}
          color="#718096"
        />
        <Text style={styles.noDataText}>
          No supplier data available for 2025 yet.
        </Text>
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
        {supplierData.map((item, index) => {
          const rank = index + 1; // Calculate rank for display purposes
          return (
            <TouchableOpacity
              key={item.SupplierName || index}
              style={[
                styles.cardItem,
                getPlatformShadow(),
                {borderLeftColor: getRankColor(rank)}, // Apply rank-based border color
              ]}
              onPress={() => {}}
              activeOpacity={0.7}>
              {/* Left Column: Rank Display Area - Always show rank number */}
              <View style={styles.rankBadgeContainer}>
                <Text
                  style={[
                    styles.rankNumberOnly,
                    /* {color: getRankColor(rank)}, */ // Color the rank number
                  ]}>
                  {rank}
                </Text>
              </View>

              {/* Middle Column: Name and Details */}
              <View style={styles.nameAndDetailsColumn}>
                <Text style={styles.supplierName}>
                  {item.SupplierName || 'Unknown Supplier'}
                </Text>
                <View style={styles.detailsRow}>
                  <View style={{marginRight: 10}}>
                    <Text style={styles.boldValue}>
                      {parseFloat(item.AvgTimeliness || '0.0').toFixed(1)}
                      <Text style={styles.boldLabel}>  Timeliness</Text>
                    </Text>
                  </View>

                  <View style={{marginRight: 10}}>
                    <Text style={styles.boldLabel}>
                      <Text style={styles.boldValue}>
                        {parseFloat(item.AvgQuality || '0.0').toFixed(1)}
                      </Text>{' '}  Quality
                    </Text>
                  </View>

                  <View style={{marginRight: 10}}>
                    <Text style={styles.boldLabel}>
                      <Text style={styles.boldValue}>
                        {parseFloat(item.AvgService || '0.0').toFixed(1)}
                      </Text>  Service
                    </Text>
                  </View>
                  {/* <Text style={styles.detailText}>
                    <Text style={styles.boldLabel}>Reviews:</Text>{' '}
                    <Text style={styles.boldValue}>
                      {parseInt(item.TotalReviews || '0', 10)}
                    </Text>
                  </Text> */}
                </View>
              </View>

              {/* Right Column: Overall Average and Stars */}
              <View style={styles.overallRatingColumn}>
                <Text style={styles.overallLabel}>
                  Overall ({parseInt(item.TotalReviews || '0', 10)}) Reviews
                </Text>
                <Text style={styles.averageValue}>
                  {parseFloat(item.OverallRating || '0.0').toFixed(1)}
                </Text>
                {/* <Text style={styles.outOfFive}>out of 5</Text> */}
                {renderStarRating(parseFloat(item.OverallRating || '0.0'))}
              </View>
            </TouchableOpacity>
          );
        })}
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
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
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
    //justifyContent: 'space-between',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#E2E8F0', // Default border color, overridden by getRankColor
    overflow: 'hidden',
  },
  rankBadgeContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
    //justifyContent: 'center', // Center rank number vertically
  },
  rankNumberOnly: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameAndDetailsColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: 10,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'column', // Changed to column for stacking
    alignItems: 'flex-start', // Align items to the start of the column
  },
  detailText: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 4, // Space between detail lines
  },
  boldLabel: {
    fontWeight: '300',
    color: '#2D3748',
  },
  boldValue: {
    fontWeight: '400',
    color: '#2D3748',
  },
  overallRatingColumn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  overallLabel: {
    fontSize: 10,
    color: '#4299E1',
    textAlign: 'center',
  },
  averageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 2,
  },
  outOfFive: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 4,
    textAlign: 'center',
  },
  starRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default SupplierRanking;
