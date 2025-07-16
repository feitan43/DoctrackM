import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dropdown} from 'react-native-element-dropdown';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

// Sample data extracted from the provided image for Distribution
const distributionData = [
  {
    id: '1',
    qty: '3',
    unit: 'Gallon/s',
    description: 'Alcohol 70% Isopropyl Gallon',
    receiver: 'KATHLYN F MACAPUNDAG',
    districtOffice: 'N/A',
    date: '2025-07-16 02:45 PM',
    category: 'Supplies',
  },
  {
    id: '2',
    qty: '10',
    unit: 'Piece/s',
    description: 'Data Filer Box Type Legal Size Single 4" (specify color)',
    receiver: 'ARTURO C JAMILLA',
    districtOffice: 'N/A',
    date: '2025-07-16 02:44 PM',
    category: 'Office Supplies',
  },
  {
    id: '3',
    qty: '1',
    unit: 'Gallon/s',
    description: 'Alcohol 70% Isopropyl Gallon',
    receiver: 'ARTURO C JAMILLA',
    districtOffice: 'N/A',
    date: '2025-07-16 02:44 PM',
    category: 'Supplies',
  },
  {
    id: '4',
    qty: '12',
    unit: 'Piece/s',
    description: 'Pen Sign 0.7 Non-Refillable (Box of 12s) Black',
    receiver: 'ROBINSON R DAYA',
    districtOffice: 'N/A',
    date: '2025-07-16 02:43 PM',
    category: 'Office Supplies',
  },
  {
    id: '5',
    qty: '3',
    unit: 'Bottle/s',
    description:
      'Ink Bottle 003 Magenta for EPSON Printer Model Nos. L1110/3100/3101/3110/3150/5190/3210',
    receiver: 'ARTURO C JAMILLA',
    districtOffice: 'N/A',
    date: '2025-07-16 02:42 PM',
    category: 'Ink & Toner',
  },
  {
    id: '6',
    qty: '6',
    unit: 'Piece/s',
    description: "Pen Sign 0.5 Non Refillable Black, (Box of 12's)",
    receiver: 'ARTURO C JAMILLA',
    districtOffice: 'N/A',
    date: '2025-07-16 02:42 PM',
    category: 'Office Supplies',
  },
  {
    id: '7',
    qty: '1',
    unit: 'Piece/s',
    description: 'Stapler Heavy Duty #35 with attached Remover',
    receiver: 'ARTURO C JAMILLA',
    districtOffice: 'N/A',
    date: '2025-07-16 02:41 PM',
    category: 'Office Supplies',
  },
];

// Component to render each item in the FlatList for Distribution
const DistributionItem = (
  {item, index, onActionPress}, // Added 'index' prop
) => (
  <TouchableOpacity style={styles.itemRow} onPress={() => onActionPress(item)}>
    <View style={styles.itemIndexContainer}>
      <Text style={styles.itemIndex}>{index + 1}</Text>
    </View>
    <View style={styles.itemDetails}>
      <Text style={styles.itemQtyUnit}>
        {item.qty} {item.unit}
      </Text>
    </View>
    <View style={styles.itemMainInfo}>
      <Text style={styles.itemDescription}>{item.description}</Text>
      {/* Added receiver and date below description for better mobile readability */}
      <Text style={styles.itemSubDetailText}>
        District Office: {item.districtOffice}
      </Text>
      <Text style={styles.itemSubDetailText}>Date: {item.date}</Text>
    </View>
    {/* District Office can be shown on tap or in a detailed view if space is too constrained */}
    {/* For now, keeping it in itemDetails but adjusting flex */}
    <View style={styles.itemDetails}>
      <Text style={styles.itemDetailText}>{item.receiver}</Text>
    </View>
  </TouchableOpacity>
);

// Data for the year dropdown
const yearData = [
  {label: '2023', value: '2023'},
  {label: '2024', value: '2024'},
  {label: '2025', value: '2025'},
];

// Data for the receiver dropdown (updated for distribution context)
// Extract unique receivers from distributionData
const uniqueReceivers = [
  ...new Set(distributionData.map(item => item.receiver)),
];
const receiverData = [
  {label: 'All Receivers', value: 'All'},
  ...uniqueReceivers.map(receiver => ({label: receiver, value: receiver})),
];

// Main DistributionScreen component
export default function DistributionScreen({navigation}) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchText, setSearchText] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState('All'); // State for selected receiver
  const [selectedItem, setSelectedItem] = useState(null); // State to hold the selected item for bottom sheet

  // Bottom Sheet Ref
  const bottomSheetRef = useRef(null);

  // Variables for snap points
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // Callbacks for bottom sheet
  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

  const handlePresentModalPress = useCallback(item => {
    setSelectedItem(item);
    bottomSheetRef.current?.expand(); // Or .snapToIndex(0) for the first snap point
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedItem(null); // Clear selected item when closing
  }, []);

  // Filtered data based on search text and selected receiver
  const filteredDistributionData = distributionData.filter(item => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.receiver.toLowerCase().includes(searchText.toLowerCase()) ||
      item.districtOffice.toLowerCase().includes(searchText.toLowerCase());
    const matchesReceiver =
      selectedReceiver === 'All' || item.receiver === selectedReceiver;
    return matchesSearch && matchesReceiver;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#fff"
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Inventory</Text>
        <View style={styles.yearDropdownContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={yearData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select year"
            value={selectedYear}
            onChange={item => {
              setSelectedYear(item.value);
            }}
            renderRightIcon={() => (
              <MaterialCommunityIcons
                style={styles.icon}
                color="#fff"
                name="chevron-down"
                size={20}
              />
            )}
          />
        </View>
      </View>

      <LinearGradient
        colors={['#d2e564', '#fff']} // Customize the gradient colors
        start={{x: 0, y: 0}}
        end={{x: 1, y: 5}}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
        }}>
        <MaterialCommunityIcons
          style={styles.icon}
          color="black"
          name="truck-delivery-outline" // Changed icon for distribution
          size={28}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            shadowRadius: 0.5,
            shadowColor: 'black',
          }}>
          Distribution
        </Text>
      </LinearGradient>

      {/* Search Bar and Receiver Filter */}
      <View style={styles.searchAndFilterContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search distribution..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <View style={styles.receiverDropdownContainer}>
          <Dropdown
            style={styles.dropdownFilter}
            placeholderStyle={styles.placeholderStyleFilter}
            selectedTextStyle={styles.selectedTextStyleFilter}
            iconStyle={styles.iconStyleFilter}
            data={receiverData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Receiver"
            value={selectedReceiver}
            onChange={item => {
              setSelectedReceiver(item.value);
            }}
            renderRightIcon={() => (
              <MaterialCommunityIcons
                style={styles.iconFilter}
                color="#888"
                name="chevron-down"
                size={20}
              />
            )}
          />
        </View>
      </View>

      {/* Distribution List */}
      <FlatList
        data={filteredDistributionData}
        renderItem={(
          {item, index}, // Pass index to DistributionItem
        ) => (
          <DistributionItem
            item={item}
            index={index} // Pass index
            onActionPress={handlePresentModalPress}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderIndexCell]}>
              #
            </Text>
            <Text
              style={[styles.tableHeaderCell, {flex: 1, textAlign: 'center'}]}>
              Qty/Unit
            </Text>
            <Text style={[styles.tableHeaderCell, {flex: 2}]}>
              Item/Details
            </Text>
            <Text
              style={[styles.tableHeaderCell, {flex: 1, textAlign: 'center'}]}>
              Receiver
            </Text>
          </View>
        )}
        stickyHeaderIndices={[0]}
      />

      {/* Floating Add Item Button */}
      {/* <TouchableOpacity style={styles.addItemFab}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        <Text style={styles.addItemFabText}>Add Distribution</Text>
      </TouchableOpacity> */}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={BottomSheetBackdrop}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}>
        <View style={styles.bottomSheetContent}>
          {selectedItem && (
            <>
              <Text style={styles.bottomSheetTitle}>Actions for:</Text>
              <Text style={styles.bottomSheetItemDescription}>
                {selectedItem.description}
              </Text>

              <TouchableOpacity
                style={styles.bottomSheetAction}
                onPress={() => {
                  alert(`Edit distribution of ${selectedItem.description}`);
                  handleClosePress();
                }}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={24}
                  color="#007bff"
                />
                <Text style={styles.bottomSheetActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomSheetAction}
                onPress={() => {
                  alert(`View details for ${selectedItem.description}`);
                  handleClosePress();
                }}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={24}
                  color="#ffc107"
                />
                <Text style={styles.bottomSheetActionText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomSheetAction}
                onPress={() => {
                  alert(`Delete distribution of ${selectedItem.description}`);
                  handleClosePress();
                }}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="#dc3545"
                />
                <Text style={styles.bottomSheetActionText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

// Styles for the components (reused and slightly modified from StocksScreen)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgb(157, 183, 12)',
  },
  backButton: {
    marginRight: 10,
  },
  topHeaderTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  yearDropdownContainer: {
    width: '30%',
    maxWidth: 120,
    marginRight: -10,
  },
  dropdown: {
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#fff',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#fff',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 5,
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  receiverDropdownContainer: {
    width: '35%',
    maxWidth: 140,
  },
  dropdownFilter: {
    height: 45,
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderStyleFilter: {
    fontSize: 14,
    color: '#888',
  },
  selectedTextStyleFilter: {
    fontSize: 14,
    color: '#333',
  },
  iconStyleFilter: {
    width: 20,
    height: 20,
  },
  iconFilter: {
    marginRight: 5,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#495057',
    fontSize: 13,
    paddingHorizontal: 2,
  },
  tableHeaderIndexCell: {
    width: 30,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    //alignItems: 'center',
  },
  itemIndexContainer: {
    width: 30, // Fixed width for the index column
    alignItems: 'center',
    //justifyContent: 'center',
    marginRight: 5,
  },
  itemIndex: {
    // Style for the new index text
    fontSize: 14,
    color: '#6c757d',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  itemQtyCell: {
    width: 60,
    alignItems: 'center',
    //justifyContent: 'center',
    paddingRight: 5,
  },
  itemQtyUnit: {
    fontSize: 13,
    color: '#343a40',
    marginBottom: 3,
    fontWeight: '500',
  },
  itemMainInfo: {
    flex: 2, // Increased flex to give more space to description and sub-details
    paddingRight: 5,
  },
  itemDescription: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 3,
  },
  itemSubDetailText: {
    // New style for receiver and date
    fontSize: 12,
    color: '#6c757d',
  },
  itemDetailText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  itemDetails: {
    flex: 1.0,
    alignItems: 'center',
  },
  addItemFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addItemFabText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  // Bottom Sheet Styles
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
    elevation: 5,
  },
  bottomSheetHandle: {
    backgroundColor: '#ccc',
    width: 40,
    height: 5,
    borderRadius: 5,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  bottomSheetItemDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  bottomSheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetActionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});
