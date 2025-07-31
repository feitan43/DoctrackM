import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {FlashList} from '@shopify/flash-list';
import {useRequests} from '../../hooks/useInventory';
import {Shimmer} from '../../utils/useShimmer';

export default function Disapproved({navigation}) {
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useRequests();

  const [disapprovedItems, setDisapprovedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  // New state to track if an item's name is truncated
  const [isItemNameTruncated, setIsItemNameTruncated] = useState({});

  useEffect(() => {
    if (requestsData) {
      const filteredItems = requestsData.filter(
        request => request.Status.toLowerCase() === 'disapproved',
      );
      setDisapprovedItems(filteredItems);
    }
  }, [requestsData]);

  const toggleItemExpansion = useCallback(itemId => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  // Callback to detect if text is truncated
  const handleTextLayout = useCallback((itemId, event) => {
    // If the text component has more lines than its target (1 line when collapsed), it's truncated
    const didTruncate = event.nativeEvent.lines.length > 1;
    setIsItemNameTruncated(prev => ({
      ...prev,
      [itemId]: didTruncate,
    }));
  }, []);

  const renderDisapprovedItem = useCallback(
    ({item, index}) => {
      const isExpanded = expandedItems[item.Id];
      const isTruncated = isItemNameTruncated[item.Id];
      const shouldShowExpandButton = !isExpanded && isTruncated;

      return (
        <View style={styles.requestCard}>
          <View style={styles.indexColumn}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.itemNameContainer}>
                <Text
                  style={styles.itemName}
                  numberOfLines={isExpanded ? undefined : 3}
                  ellipsizeMode="tail"
                  onTextLayout={event => handleTextLayout(item.Id, event)}>
                  {item.Item}
                </Text>

                {shouldShowExpandButton && (
                  <TouchableOpacity
                    onPress={() => toggleItemExpansion(item.Id)}
                    style={styles.expandButton}>
                    <Text style={styles.expandButtonText}>Show More</Text>
                  </TouchableOpacity>
                )}

                {isExpanded && isTruncated && (
                  <TouchableOpacity
                    onPress={() => toggleItemExpansion(item.Id)}
                    style={styles.expandButton}>
                    <Text style={styles.expandButtonText}>Show Less</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.statusBadge, styles.statusDisapproved]}>
                {item.Status}
              </Text>
            </View>

            <View style={styles.requestDetails}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Requestor </Text>
                <Text style={styles.infoValue}>{item.Name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="finger-print-outline"
                  size={18}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Employee No </Text>
                <Text style={styles.infoValue}>{item.EmployeeNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="barcode-outline"
                  size={18}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Tracking No </Text>
                <Text style={styles.infoValue}>{item.TrackingNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="counter"
                  size={18}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Quantity </Text>
                <Text style={styles.infoValue}>
                  {item.Qty} {item.Units}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Date Requested </Text>
                <Text style={styles.infoValue}>
                  {item.DateRequested || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={18}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoLabel}>Reason </Text>
                <Text style={styles.infoValue}>{item.Reason}</Text>
              </View>
              {item.Remarks && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabel}>Remarks </Text>
                  <Text style={styles.infoValue}>{item.Remarks}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    },
    [expandedItems, isItemNameTruncated, toggleItemExpansion, handleTextLayout],
  );

  const ShimmerRequestCardPlaceholder = () => (
    <View style={[styles.requestCard, styles.shimmerCard]}>
      <Shimmer style={styles.shimmerIndex} />
      <View style={styles.shimmerContent}>
        <Shimmer style={styles.shimmerTitle} />
        <Shimmer style={styles.shimmerStatus} />
        {[...Array(5)].map((_, i) => (
          <View key={i} style={styles.shimmerInfoRow}>
            <Shimmer style={styles.shimmerIcon} />
            <Shimmer style={styles.shimmerText} />
          </View>
        ))}
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
        <Text style={styles.headerTitle}>Disapproved</Text>
        <View style={{width: 40}} />
      </LinearGradient>

      {requestsLoading ? (
        <FlashList
          data={[1, 2, 3]}
          renderItem={ShimmerRequestCardPlaceholder}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={260}
        />
      ) : requestsError ? (
        <View style={styles.emptyListContainer}>
          <Ionicons name="warning-outline" size={80} color="#ff6b6b" />
          <Text style={styles.emptyListText}>Failed to load items</Text>
          <Text style={styles.emptyListSubText}>
            Please check your connection and try again
          </Text>
        </View>
      ) : disapprovedItems.length > 0 ? (
        <FlashList
          data={disapprovedItems}
          renderItem={renderDisapprovedItem}
          keyExtractor={item => item.Id.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={260}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <Ionicons name="sad-outline" size={80} color="#bbb" />
          <Text style={styles.emptyListText}>No disapproved items</Text>
          <Text style={styles.emptyListSubText}>All good!</Text>
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
  listContent: {
    padding: 16,
  },
  requestCard: {
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
    flexDirection: 'row',
    overflow: 'hidden',
  },
  indexColumn: {
    width: 30,
    backgroundColor: '#E6EEF7',
    //justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 20,
  },
  indexText: {
    fontSize: 20,
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
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemNameContainer: {
    flex: 1,
    marginRight: 10,
    width: '70%', // or another appropriate value
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    letterSpacing: 0.2,
    minHeight: 24, // approximate height of one line
  },
  expandButton: {
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(26, 80, 140, 0.1)',
  },
  expandButtonText: {
    fontSize: 12,
    color: '#1A508C',
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDisapproved: {
    backgroundColor: '#FFEBEE',
    color: '#E53935',
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  requestDetails: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  infoIcon: {
    marginRight: 12,
    color: '#1A508C',
  },
  infoLabel: {
    fontSize: 12,
    color: '#555',
    lineHeight: 22,
  },
  infoValue: {
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'right',
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
    height: 260,
    justifyContent: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  shimmerIndex: {
    height: '100%',
    width: 50,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  shimmerContent: {
    flex: 1,
    padding: 20,
  },
  shimmerTitle: {
    height: 20,
    width: '70%',
    borderRadius: 4,
    marginBottom: 16,
  },
  shimmerStatus: {
    height: 16,
    width: 80,
    borderRadius: 8,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  shimmerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shimmerIcon: {
    height: 16,
    width: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  shimmerText: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
});
