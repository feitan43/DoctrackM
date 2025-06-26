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
  Animated, // Import Animated
  PanResponder, // Import PanResponder
  LayoutAnimation, // For smooth updates on Android (still good to have)
  NativeModules, // For LayoutAnimation on Android
  Keyboard, // Import Keyboard
} from 'react-native';
import {FlashList} from '@shopify/flash-list'; // Keep FlashList for performance
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import {officeMap} from '../utils/officeMap'; // Assuming this path is correct

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (
    NativeModules.UIManager &&
    NativeModules.UIManager.setLayoutAnimationEnabledExperimental
  ) {
    NativeModules.UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Helper function to parse PHP-style datetime string
function parseCustomDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;
  const [datePart, timePart, meridian] = dateTimeStr.split(/[\s]+/);
  const [year, month, day] = datePart.split('-').map(Number);
  let [hour, minute] = timePart.split(':').map(Number);
  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  return new Date(year, month - 1, day, hour, minute);
}

// --- Nested Component for each List Item (now handles its own swipe) ---
const DeliveryRecordItem = ({
  item,
  openEditor,
  handleDelete,
  swipedItemId, // New prop
  setSwipedItemId, // New prop
}) => {
  // Animated value for horizontal swipe translation
  const pan = useRef(new Animated.ValueXY()).current;
  // State to track if the item is currently swiped open
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  // Define swipe threshold (how much to swipe to reveal the delete button)
  const SWIPE_THRESHOLD = -90; // Negative for leftward swipe

  // Effect to close the row if another item is swiped open
  useEffect(() => {
    if (swipedItemId !== item.Id && isSwipedOpen) {
      closeRow();
    }
  }, [swipedItemId]);

  // Create PanResponder to handle touch gestures
  const panResponder = useRef(
    PanResponder.create({
      // Should we become the responder for this touch sequence?
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond if horizontal movement is significant and more horizontal than vertical
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2 &&
          Math.abs(gestureState.dx) > 10 // Minimum horizontal movement
        );
      },
      // When the responder starts moving
      onPanResponderMove: (evt, gestureState) => {
        // If another item is swiped open, don't allow this one to swipe
        if (swipedItemId && swipedItemId !== item.Id) {
          return;
        }

        if (gestureState.dx < 0) {
          // Allow swiping left (negative dx)
          pan.setValue({x: gestureState.dx, y: 0});
        } else if (isSwipedOpen) {
          // If already open, allow swiping right to close
          // Adjust to start from the open position
          pan.setValue({x: SWIPE_THRESHOLD + gestureState.dx, y: 0});
        }
      },
      // When the responder is released
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD / 2) {
          // If swiped beyond half the threshold, snap to open position
          Animated.spring(pan, {
            toValue: {x: SWIPE_THRESHOLD, y: 0},
            useNativeDriver: true,
            bounciness: 0, // No bounce
            speed: 20, // Faster snap
          }).start(() => {
            setIsSwipedOpen(true);
            setSwipedItemId(item.Id); // Set this item as the swiped one
          });
        } else {
          // Otherwise, snap back to close position
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start(() => {
            setIsSwipedOpen(false);
            if (swipedItemId === item.Id) {
              setSwipedItemId(null); // Clear swiped item if this one is closing
            }
          });
        }
      },
      // When another responder takes over (e.g., list scrolls)
      onPanResponderTerminate: () => {
        // Snap back to close position if gesture is interrupted
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

  // Function to manually close the row (e.g., after delete confirmation)
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

  // Handle press on the hidden delete button
  const onDeletePress = () => {
    handleDelete(item, closeRow); // Pass item and a callback to close the row
  };

  // Handle press on the visible part of the card
  const handleCardPress = () => {
    if (isSwipedOpen) {
      closeRow(); // If swiped open, tapping closes the swipe
    } else {
      openEditor(item); // Otherwise, open the editor
    }
  };

  return (
    <View style={itemStyles.swipeContainer}>
      {/* Hidden Delete Button (Back Layer) */}
      <View style={itemStyles.hiddenDeleteButtonContainer}>
        <TouchableOpacity
          style={itemStyles.hiddenDeleteButton}
          onPress={onDeletePress}>
          <Icon name="trash-outline" size={28} color="#FFF" />
          <Text style={itemStyles.hiddenDeleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card Content (Front Layer) */}
      <Animated.View
        style={[itemStyles.animatedCard, {transform: [{translateX: pan.x}]}]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          style={itemStyles.itemBox}
          onPress={handleCardPress}
          activeOpacity={0.9}>
          <View style={itemStyles.itemHeader}>
            <Text style={itemStyles.itemTrackingNumber}>
              <Text style={itemStyles.label}>TN:</Text> {item.TrackingNumber}
            </Text>
            <Text style={itemStyles.itemId}>ID: {item.Id}</Text>
          </View>
          <Text style={itemStyles.itemDetails}>
            <Text style={itemStyles.label}>Year:</Text> {item.Year}
          </Text>
          <Text style={itemStyles.itemDetails}>
            <Text style={itemStyles.label}>Inspector:</Text> {item.InspectedBy}{' '}
            - {item.Inspector}
          </Text>
          <Text style={itemStyles.itemDetails}>
            <Text style={itemStyles.label}>Office:</Text>{' '}
            {officeMap[item.Office] || 'N/A'}
          </Text>
          <Text style={itemStyles.itemDeliveryDate}>
            <Text style={itemStyles.label}>Delivery Date:</Text>{' '}
            {item.DeliveryDate || 'N/A'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// --- Styles specifically for the DeliveryRecordItem and its swipe parts ---
const itemStyles = StyleSheet.create({
  swipeContainer: {
    // This view holds both the front card and the hidden back button
    position: 'relative', // Necessary for absolute positioning of hidden button
    width: '100%',
    height: undefined, // Let content define height
    marginBottom: 12, // Provides spacing between rows
    overflow: 'hidden', // Ensures hidden button doesn't spill out
    borderRadius: 12, // Matches the border-radius of the card itself
  },
  animatedCard: {
    // This wraps the main card content and will be animated
    flex: 1,
  },
  itemBox: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4A90E2',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTrackingNumber: {
    fontWeight: '800',
    fontSize: 18,
    color: '#1A508C',
  },
  itemId: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  itemDetails: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  itemDeliveryDate: {
    marginTop: 8,
    fontSize: 13,
    color: '#007bff',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  hiddenDeleteButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 90, // Match SWIPE_THRESHOLD
    justifyContent: 'center',
    alignItems: 'flex-end', // Align delete button to the right
    paddingRight: 10,
    backgroundColor: '#FF3B30', // Red background for delete
    borderRadius: 12, // Match parent container and card
  },
  hiddenDeleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Make button fill height
    width: '100%', // Make button fill width
  },
  hiddenDeleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 5,
  },
});

const BossEditScreen = ({navigation}) => {
  const [allData, setAllData] = useState([]); // This will now hold only the *currently fetched* data
  const [filteredData, setFilteredData] = useState([]); // This will be filtered based on year
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);

  // State for the tracking number input field
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  // State for the tracking number used to *trigger API call*
  const [trackingNumberFilter, setTrackingNumberFilter] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // New state to track the ID of the currently swiped open item
  const [swipedItemId, setSwipedItemId] = useState(null);

  // Function to load data from the API
  const loadData = async (tn = '') => {
    setLoading(true);
    try {
      const url = `https://davaocityportal.com/gord/ajax/dataprocessor.php?shalltear=1${
        tn ? `&tn=${tn}` : ''
      }`;
      const res = await fetch(url);
      const json = await res.json();

      // Ensure 'json' is an array before setting state
      const data = Array.isArray(json) ? json : [];

      setAllData(data); // Set the fetched data
      setFilteredData(data); // Initially, filtered data is all fetched data

      // Only update year options on the initial load (when tn is empty)
      // or if the data completely changes and affects years
      if (!tn && data.length > 0) {
        const years = [...new Set(data.map(item => item.Year))].sort(
          (a, b) => b - a,
        );
        setYearOptions(years.map(y => ({label: String(y), value: y})));
      } else if (data.length === 0) {
        // If search returns no results, clear year options if needed or reset
        // For now, keep existing year options
      }
    } catch (err) {
      console.error('Failed to load inspection data:', err);
      Alert.alert(
        'Error',
        'Failed to load inspection data. Please try again later.',
      );
      setAllData([]); // Clear data on error
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on component mount and when trackingNumberFilter changes
  useEffect(() => {
    loadData(trackingNumberFilter);
  }, [trackingNumberFilter]); // This effect now depends on trackingNumberFilter

  // Filter `allData` (which is already filtered by TN from API) by selected year
  useEffect(() => {
    const filtered = allData.filter(item => {
      const matchYear = !selectedYear || item.Year === selectedYear;
      return matchYear;
    });
    setFilteredData(filtered);
  }, [selectedYear, allData]); // This effect now depends on selectedYear and allData

  const handleSearch = () => {
    // Only trigger API call if trackingNumberInput is different from current filter
    if (trackingNumberInput !== trackingNumberFilter) {
      setTrackingNumberFilter(trackingNumberInput); // This will trigger the useEffect to call loadData
    }
    Keyboard.dismiss(); // Dismiss the keyboard after search
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
            // If user cancels, close the swiped row
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
                // Refetch data after deletion to ensure the list is up-to-date
                loadData(trackingNumberFilter);
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
              // Always close row after action, whether success or error
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
      swipedItemId={swipedItemId} // Pass the globally swiped item ID
      setSwipedItemId={setSwipedItemId} // Pass the setter function
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

          {/* Tracking Number Input with Search Button */}
          <View style={styles.trackingNumberInputContainer}>
            <TextInput
              placeholder="Search by Tracking Number..."
              placeholderTextColor="#888"
              style={styles.trackingNumberInput} // Apply specific style for TextInput
              value={trackingNumberInput}
              onChangeText={setTrackingNumberInput} // Update input state directly
              clearButtonMode="while-editing"
              onSubmitEditing={handleSearch} // Trigger search on keyboard submit
            />
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.searchButton}>
              <Icon name="search-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A508C" />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <FlashList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => String(item.Id)}
            estimatedItemSize={120}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Icon
                  name="information-circle-outline"
                  size={50}
                  color="#999"
                />
                <Text style={styles.emptyListText}>
                  No matching records found.
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    marginBottom: 10,
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
  trackingNumberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    paddingRight: 5, // Space for the button
  },
  trackingNumberInput: {
    flex: 1, // Allow text input to take available space
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#4A90E2', // Blue background for the search button
    borderRadius: 8,
    padding: 8,
    marginLeft: 8, // Space between input and button
    justifyContent: 'center',
    alignItems: 'center',
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