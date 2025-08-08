import React, { useState, useCallback } from 'react'; // Import useState and useCallback
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  FlatList,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSupplierRanking } from '../../hooks/useSuppliers';

// --- StarRating Component ---
const StarRating = ({ rating }) => {
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

// Main SupplierRanking component
const SupplierRanking = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false); // State for RefreshControl

  // Use the useSupplierRanking hook to fetch actual data, and get the refetch function
  const { data: suppliers, isLoading, isError, refetch } = useSupplierRanking(new Date().getFullYear());

  // Function to get distinct styles for top ranks
  const getRankStyle = (rank) => {
    if (rank === 1) {
      return {
        cardHeaderBorder: styles.rank1CardHeaderBorder,
      };
    } else if (rank === 2) {
      return {
        cardHeaderBorder: styles.rank2CardHeaderBorder,
      };
    } else if (rank === 3) {
      return {
        cardHeaderBorder: styles.rank3CardHeaderBorder,
      };
    }
    return {};
  };

  // useCallback to memoize the onRefresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Call the refetch function from the hook
    setRefreshing(false);
  }, [refetch]);

  const renderSupplierItem = ({ item, index }) => {
    const rank = index + 1;
    const { cardHeaderBorder } = getRankStyle(rank);

    const handlePress = () => {
      navigation.navigate('SupplierDetails', { supplierId: item.SupplierId });
    };

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.supplierCard,
          pressed && styles.supplierCardPressed,
        ]}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.08)', borderless: false }}
      >
        <View style={styles.indexColumn}>
          <Text style={styles.indexText}>{rank}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={[styles.cardHeader, cardHeaderBorder]}>
            <Text style={styles.supplierName}>{item.SupplierName}</Text>
            <View style={styles.overallRatingContainer}>
              <Text style={styles.overallAverageText}>
                {parseFloat(item.OverallRating).toFixed(1)}
              </Text>
              <StarRating rating={parseFloat(item.OverallRating)} />
            </View>
          </View>

          <View style={styles.supplierDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timeliness</Text>
              <Text style={styles.infoValue}>{parseFloat(item.AvgTimeliness).toFixed(1)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quality</Text>
              <Text style={styles.infoValue}>{parseFloat(item.AvgQuality).toFixed(1)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{parseFloat(item.AvgService).toFixed(1)}</Text>
            </View>
            <View style={styles.totalReviewsContainer}>
              <Text style={styles.totalReviews}>{item.TotalReviews} Reviews</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
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
        <Text style={styles.headerTitle}>Supplier Rankings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {isLoading && !refreshing ? (
        <View style={styles.contentPlaceholder}>
          <Text style={styles.placeholderText}>Loading supplier data...</Text>
        </View>
      ) : isError ? (
        <View style={styles.contentPlaceholder}>
          <Text style={styles.placeholderText}>Failed to load supplier data. Please try again.</Text>
        </View>
      ) : suppliers && suppliers.length > 0 ? (
        <FlatList
          data={suppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.SupplierId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1A508C"
              colors={['#1A508C']}
            />
          }
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <MaterialCommunityIcons
            name="podium-gold"
            size={80}
            color="#bbb"
          />
          <Text style={styles.emptyListText}>No rankings available</Text>
          <Text style={styles.emptyListSubText}>
            It looks like there are no supplier rankings yet for this year.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// StyleSheet for the component
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
    shadowOffset: { width: 0, height: 4 },
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
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  supplierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#1A508C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  supplierCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A508C',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    // Remove alignItems: 'center' from here
    //backgroundColor: '#F8FAFC',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    letterSpacing: 0.2,
    flex: 1, // Keep flex: 1 here to allow the name to take available space
    marginRight: 10,
  },
  overallRatingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
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
  supplierDetails: {},
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
  totalReviewsContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalReviews: {
    fontSize: 12,
    color: '#718096',
  },
  // New styles for the cardHeader border
  rank1CardHeaderBorder: {
    borderBottomColor: '#FFD700',
    borderBottomWidth: 2,
  },
  rank2CardHeaderBorder: {
    borderBottomColor: '#C0C0C0',
    borderBottomWidth: 2,
  },
  rank3CardHeaderBorder: {
    borderBottomColor: '#CD7F32',
    borderBottomWidth: 2,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginTop: 15,
  },
  emptyListSubText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});

export default SupplierRanking;