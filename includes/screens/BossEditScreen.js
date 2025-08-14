import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  ImageBackground,
  Platform,
  Animated,
  PanResponder,
  LayoutAnimation,
  NativeModules,
  Keyboard,
  RefreshControl,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import {officeMap} from '../utils/officeMap';

if (Platform.OS === 'android') {
  if (
    NativeModules.UIManager &&
    NativeModules.UIManager.setLayoutAnimationEnabledExperimental
  ) {
    NativeModules.UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

function parseCustomDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;
  const [datePart, timePart, meridian] = dateTimeStr.split(/[\s]+/);
  const [year, month, day] = datePart.split('-').map(Number);
  let [hour, minute] = timePart.split(':').map(Number);
  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  return new Date(year, month - 1, day, hour, minute);
}

const DeliveryRecordItem = ({
  item,
  openEditor,
  handleDelete,
  swipedItemId,
  setSwipedItemId,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const SWIPE_THRESHOLD = -90;

  useEffect(() => {
    if (swipedItemId !== item.Id && isSwipedOpen) {
      closeRow();
    }
  }, [swipedItemId]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2 &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        if (swipedItemId && swipedItemId !== item.Id) {
          return;
        }

        if (gestureState.dx < 0) {
          pan.setValue({x: gestureState.dx, y: 0});
        } else if (isSwipedOpen) {
          pan.setValue({x: SWIPE_THRESHOLD + gestureState.dx, y: 0});
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD / 2) {
          Animated.spring(pan, {
            toValue: {x: SWIPE_THRESHOLD, y: 0},
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start(() => {
            setIsSwipedOpen(true);
            setSwipedItemId(item.Id);
          });
        } else {
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start(() => {
            setIsSwipedOpen(false);
            if (swipedItemId === item.Id) {
              setSwipedItemId(null);
            }
          });
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
          bounciness: 0,
          speed: 20,
        }).start(() => {
          setIsSwipedOpen(false);
          if (swipedItemId === item.Id) {
            setSwipedItemId(null);
          }
        });
      },
    }),
  ).current;

  const closeRow = () => {
    Animated.spring(pan, {
      toValue: {x: 0, y: 0},
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start(() => {
      setIsSwipedOpen(false);
      if (swipedItemId === item.Id) {
        setSwipedItemId(null);
      }
    });
  };

  const onDeletePress = () => {
    handleDelete(item, closeRow);
  };

  const handleCardPress = () => {
    if (isSwipedOpen) {
      closeRow();
    } else {
      openEditor(item);
    }
  };

  return (
    <View style={itemStyles.swipeContainer}>
      <View style={itemStyles.hiddenDeleteButtonContainer}>
        <TouchableOpacity
          style={itemStyles.hiddenDeleteButton}
          onPress={onDeletePress}>
          <Icon name="trash-outline" size={28} color="#FFF" />
          <Text style={itemStyles.hiddenDeleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[itemStyles.animatedCard, {transform: [{translateX: pan.x}]}]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          style={itemStyles.itemBox}
          onPress={handleCardPress}
          activeOpacity={0.9}>
          <View style={itemStyles.itemHeader}>
            <Text style={itemStyles.itemTrackingNumber}>
              {item.TrackingNumber}
            </Text>
            <Text style={itemStyles.itemId}>ID: {item.Id}</Text>
          </View>
          <View style={itemStyles.detailRow}>
            <Text style={itemStyles.detailLabel}>Year:</Text>
            <Text style={itemStyles.detailValue}>{item.Year}</Text>
          </View>
          <View style={itemStyles.detailRow}>
            <Text style={itemStyles.detailLabel}>Inspector:</Text>
            <Text style={itemStyles.detailValue}>
              {item.InspectedBy} - {item.Inspector}
            </Text>
          </View>
          <View style={itemStyles.detailRow}>
            <Text style={itemStyles.detailLabel}>Office:</Text>
            <Text style={itemStyles.detailValue}>
              {officeMap[item.Office] || 'N/A'}
            </Text>
          </View>
          <View style={itemStyles.dateSection}>
            <Icon name="calendar-outline" size={16} color="#007bff" />
            <Text style={itemStyles.itemDeliveryDate}>
              {item.DeliveryDate || 'N/A'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const itemStyles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    width: '100%',
    height: undefined,
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 12,
    elevation:1,
  },
  animatedCard: {
    flex: 1,
  },
  itemBox: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#005f9c',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  itemTrackingNumber: {
    fontWeight: '700',
    fontSize: 18,
    color: '#005f9c',
  },
  itemId: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
    width: 80, // Fixed width for alignment
  },
  detailValue: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemDeliveryDate: {
    marginLeft: 8,
    fontSize: 13,
    color: '#007bff',
    fontWeight: '600',
  },
  hiddenDeleteButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 90,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
  },
  hiddenDeleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  hiddenDeleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 5,
  },
});

const BossEditScreen = ({navigation}) => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedYear, setSelectedYear] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);

  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingNumberFilter, setTrackingNumberFilter] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [swipedItemId, setSwipedItemId] = useState(null);

  useEffect(() => {
    // Generate year options dynamically from 2024 up to the current year
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = 2024; y <= currentYear; y++) {
      years.push({label: String(y), value: y});
    }
    setYearOptions(years);
  }, []);

  const loadData = async (tn = '', year = null) => {
    setLoading(true);
    setRefreshing(true);
    try {
      let url = `https://davaocityportal.com/gord/ajax/dataprocessor.php?shalltear=1`;
      if (tn) {
        url += `&tn=${tn}`;
      }
      if (year) {
        url += `&year=${year}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      const data = Array.isArray(json) ? json : [];

      setAllData(data);
    } catch (err) {
      console.error('Failed to load inspection data:', err);
      Alert.alert(
        'Error',
        'Failed to load inspection data. Please try again later.',
      );
      setAllData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(trackingNumberFilter, selectedYear);
  }, [selectedYear, trackingNumberFilter]);

  const handleSearch = () => {
    if (trackingNumberInput !== trackingNumberFilter) {
      setTrackingNumberFilter(trackingNumberInput);
    }
    Keyboard.dismiss();
  };

  const openEditor = item => {
    setSelectedItem(item);
    const parsed = parseCustomDateTime(item.DeliveryDate);
    setDeliveryDate(parsed || new Date());
    setShowPicker(true);
  };

  const handleUpdate = () => {
    Alert.alert(
      'Simulated Save',
      `New delivery date for ${
        selectedItem?.TrackingNumber
      }:\n${deliveryDate.toLocaleString()}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowPicker(false);
          },
        },
      ],
    );
  };

  const handleDelete = (itemToDelete, closeRowCallback) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the record for Tracking Number: ${itemToDelete.TrackingNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (closeRowCallback) {
              closeRowCallback();
            }
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://davaocityportal.com/gord/ajax/dataprocessor.php?deleteId=${itemToDelete.Id}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              const result = await response.json();

              if (response.ok && result.success) {
                Alert.alert('Success', 'Record deleted successfully!');
                loadData(trackingNumberFilter, selectedYear);
              } else {
                Alert.alert(
                  'Error',
                  result.message ||
                    'Failed to delete record. Please try again.',
                );
              }
            } catch (error) {
              console.error('Failed to delete record:', error);
              Alert.alert(
                'Error',
                'An error occurred while deleting the record.',
              );
            } finally {
              if (closeRowCallback) {
                closeRowCallback();
              }
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}) => (
    <DeliveryRecordItem
      item={item}
      openEditor={openEditor}
      handleDelete={handleDelete}
      swipedItemId={swipedItemId}
      setSwipedItemId={setSwipedItemId}
    />
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}
        imageStyle={styles.bgHeaderImageStyle}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back-outline" size={28} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery</Text>
          <View style={{width: 60}} />
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by Year</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            data={yearOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Year"
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            value={selectedYear}
            onChange={item => setSelectedYear(item.value)}
            search
            searchPlaceholder="Search year..."
            renderRightIcon={() => (
              <Icon
                style={styles.dropdownIcon}
                name="chevron-down-outline"
                size={20}
                color="#666"
              />
            )}
          />

          <View style={styles.searchContainer}>
            <Text style={styles.filterLabel}>Search by Tracking Number</Text>
            <View style={styles.trackingNumberInputContainer}>
              <TextInput
                placeholder="Enter Tracking Number..."
                placeholderTextColor="#888"
                style={styles.trackingNumberInput}
                value={trackingNumberInput}
                onChangeText={setTrackingNumberInput}
                clearButtonMode={
                  Platform.OS === 'ios' ? 'while-editing' : 'never'
                }
                autoCapitalize="characters"
                onSubmitEditing={handleSearch}
              />
              {Platform.OS === 'android' && trackingNumberInput.length > 0 && (
                <TouchableOpacity
                  onPress={() => setTrackingNumberInput('')}
                  style={styles.clearButton}>
                  <Icon name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.searchButton}>
              <Icon name="search-outline" size={24} color="#FFF" />
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A508C" />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <FlashList
            data={allData}
            renderItem={renderItem}
            keyExtractor={item => String(item.Id)}
            estimatedItemSize={120}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(trackingNumberFilter, selectedYear)}
                tintColor="#1A508C"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Icon
                  name="information-circle-outline"
                  size={50}
                  color="#999"
                />
                <Text style={styles.emptyListText}>
                  No matching records found. Try adjusting your filters or
                  search.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <DatePicker
        modal
        open={showPicker}
        date={deliveryDate}
        mode="datetime"
        onConfirm={date => {
          setDeliveryDate(date);
          handleUpdate();
        }}
        onCancel={() => setShowPicker(false)}
        theme="light"
        confirmText="Confirm"
        cancelText="Cancel"
        title={
          selectedItem
            ? `Set Date for TN: ${selectedItem.TrackingNumber}`
            : 'Select Delivery Date'
        }
      />
    </View>
  );
};

export default BossEditScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  bgHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: Platform.OS === 'android' ? 90 : 110,
    backgroundColor: '#1A508C',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bgHeaderImageStyle: {
    opacity: 0.2,
    resizeMode: 'cover',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#a9b7c8',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 10,
    //marginHorizontal: 10,
  },
  filterSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    marginBottom: 20,
  },
  dropdownContainer: {
    borderRadius: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: '#333',
    fontSize: 16,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  searchContainer: {
    marginBottom: 10,
  },
  trackingNumberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    paddingRight: 5,
  },
  trackingNumberInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
    marginRight: 5,
  },
  searchButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 5,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyListText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
