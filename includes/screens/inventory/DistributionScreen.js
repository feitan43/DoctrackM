import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import {Shimmer} from '../../utils/useShimmer';
import {useDistribution} from '../../hooks/useInventory';

export default function DistributionScreen({navigation}) {
  const [selectedReceiver, setSelectedReceiver] = useState('All Receivers');

  const {
    data: distributionData,
    isLoading: distributionDataLoading,
    isError: distributionDataError,
  } = useDistribution();

  const bottomSheetRefReceiver = useRef(null);
  const snapPointsReceiver = useMemo(() => ['30%', '60%'], []);

  const totalDistributedItems = useMemo(() => {
    if (!distributionData) {
      return 0;
    }
    return distributionData.length;
  }, [distributionData]);

  const uniqueReceivers = useMemo(() => {
    if (!distributionData) {
      return ['All Receivers'];
    }
    const receivers = new Set(distributionData.map(item => item.Name));
    const sortedReceivers = Array.from(receivers).sort();
    return ['All Receivers', ...sortedReceivers];
  }, [distributionData]);

  const filteredDistributedData = useMemo(() => {
    if (!distributionData) {
      return [];
    }
    if (selectedReceiver === 'All Receivers') {
      return distributionData;
    }
    return distributionData.filter(item => item.Name === selectedReceiver);
  }, [distributionData, selectedReceiver]);

  const handlePresentReceiverFilter = useCallback(() => {
    bottomSheetRefReceiver.current?.expand();
  }, []);

  const handleSelectReceiver = useCallback(receiver => {
    setSelectedReceiver(receiver);
    bottomSheetRefReceiver.current?.close();
  }, []);

  const renderDistributedItem = useCallback(({item, index}) => {
    const formattedDate = item.DateEncoded
      ? item.DateEncoded.split(' ')[0]
      : 'N/A';

    return (
      <View style={styles.distributedItemCard}>
        <View style={styles.indexColumn}>
          <Text style={styles.cardIndex}>{index + 1}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.Item}</Text>
            <Text style={styles.cardSubtitle}>ID {item.Id}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity </Text>
              <Text style={styles.detailValue}>
                {item.IssuedQty} {item.Unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receiver </Text>
              <Text style={styles.detailValue}>{item.Name}</Text>
            </View>
            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Office </Text>
              <Text style={styles.detailValue}>{item.Office}</Text>
            </View> */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date </Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, []);

  const renderReceiverFilterItem = useCallback(({item}) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedReceiver === item && styles.filterOptionSelected,
      ]}
      onPress={() => handleSelectReceiver(item)}>
      <Text
        style={[
          styles.filterOptionText,
          selectedReceiver === item && styles.filterOptionTextSelected,
        ]}>
        {item}
      </Text>
      {selectedReceiver === item && (
        <Ionicons name="checkmark-circle" size={20} color="#1A508C" />
      )}
    </TouchableOpacity>
  ));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#004ab1']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.topHeader}>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.topHeaderTitle}>Distributed Items</Text>
          <Text style={styles.totalStocksCount}>
            Total {totalDistributedItems} Items Distributed
          </Text>
        </View>
        <View style={{width: 40}} />
      </LinearGradient>

      <View style={styles.filterContainer}>
        <Pressable
          style={styles.filterButton}
          android_ripple={{
            color: 'rgba(0,0,0,0.1)',
            borderless: false,
          }}
          onPress={handlePresentReceiverFilter}>
          <MaterialCommunityIcons
            name="filter-menu"
            size={20}
            color="#1A508C"
          />
          <Text style={styles.filterButtonText}>
            Filter: {selectedReceiver}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#1A508C"
          />
        </Pressable>
      </View>

      {distributionDataLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading distributed data...</Text>
          <Shimmer width={320} height={120} style={{borderRadius: 10}} />
          <Shimmer
            width={320}
            height={120}
            style={{borderRadius: 10, marginVertical: 8}}
          />
          <Shimmer
            width={320}
            height={120}
            style={{borderRadius: 10, marginVertical: 8}}
          />
          <Shimmer
            width={320}
            height={120}
            style={{borderRadius: 10, marginVertical: 8}}
          />
        </View>
      ) : distributionDataError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading distributed data. Please try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDistributedData}
          renderItem={renderDistributedItem}
          keyExtractor={(item, index) =>
            item.Id + '-' + item.DateEncoded + '-' + index
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <MaterialCommunityIcons
                name="archive-outline"
                size={80}
                color="#B0BEC5"
              />
              <Text style={styles.emptyListText}>
                No distributed items found.
              </Text>
              {selectedReceiver !== 'All Receivers' && (
                <Text style={styles.emptyListSubText}>
                  Try selecting "All Receivers" or a different filter.
                </Text>
              )}
            </View>
          )}
        />
      )}

      <BottomSheet
        ref={bottomSheetRefReceiver}
        index={-1}
        snapPoints={snapPointsReceiver}
        onChange={() => {}}
        backdropComponent={BottomSheetBackdrop}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Select Receiver</Text>
          <BottomSheetFlatList
            data={uniqueReceivers}
            renderItem={renderReceiverFilterItem}
            keyExtractor={item => item}
            contentContainerStyle={styles.filterOptionsList}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  topHeader: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  totalStocksCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F9FC',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E6EE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34495E',
    marginLeft: 8,
    marginRight: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    paddingBottom: 20,
  },
  distributedItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'stretch', // Changed to stretch to make indexColumn fill height
    overflow: 'hidden',
  },
  indexColumn: {
    backgroundColor: '#E6F0FA',
    paddingVertical: 18, // Maintain vertical padding to give space
    paddingHorizontal: 15,
    borderRightWidth: 1,
    borderRightColor: '#D0E0F0',
    alignItems: 'center',
    justifyContent: 'flex-start', // Key change: align index to the top
    paddingTop: 18, // Explicitly set top padding to align with cardContent
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardIndex: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
  },
  cardContent: {
    flex: 1,
    padding: 18,
  },
  cardHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  cardBody: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  loadingContainer: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop: 50,
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#777',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomSheetHandle: {
    backgroundColor: '#E0E0E0',
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  filterOptionsList: {
    paddingVertical: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterOptionSelected: {
    backgroundColor: '#EBF5FF',
    borderColor: '#8BC34A',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#34495E',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    fontWeight: '700',
    color: '#1A508C',
  },
});
