import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const inventoryData = [
  {
    id: '1',
    itemNo: '17559',
    description: 'Hard Disk Drive, 4 TB 5400RPM, 3.5"',
    qty: '4',
    unit: 'Unit/s',
    updated: '2025-05-21 02:20 PM',
    category: 'CAT 10.1 COMPUTER PERIPHERALS AND ACCESSORIES',
  },
  {
    id: '2',
    itemNo: '17595',
    description: 'HUB SWITCH 8 ports',
    qty: '6',
    unit: 'Unit/s',
    updated: '2025-05-15 10:00 AM',
    category: 'CAT 10.1 COMPUTER PERIPHERALS AND ACCESSORIES',
  },
  {
    id: '3',
    itemNo: '7596',
    description: 'KEYBOARD USB TYPE WITH MOUSE PAD',
    qty: '10',
    unit: 'Unit/s',
    updated: '2025-05-15 10:09 AM',
    category: 'CAT 10.1 COMPUTER PERIPHERALS AND ACCESSORIES',
  },
  {
    id: '4',
    itemNo: '16723',
    description:
      'Uninterruptible Power Supply (UPS) 650 Amperes 650 Watts. 360W/min main input/output voltage: 230V universal outlets: 2x or more',
    qty: '5',
    unit: 'Unit/s',
    updated: '2025-05-21 02:51 PM',
    category: 'CAT 13 COMPUTER SUPPLIES AND MATERIALS',
  },
  {
    id: '5',
    itemNo: '2265',
    description: 'Continuous Form 11 x 14 7lb 1ply',
    qty: '6',
    unit: 'Box/es',
    updated: '2025-02-14 08:07 AM',
    category: 'CAT 13 COMPUTER SUPPLIES AND MATERIALS',
  },
  {
    id: '6',
    itemNo: '18000',
    description: 'Monitor LCD 24-inch',
    qty: '3',
    unit: 'Unit/s',
    updated: '2025-06-01 09:00 AM',
    category: 'CAT 13 COMPUTER SUPPLIES AND MATERIALS',
  },
  {
    id: '7',
    itemNo: '19000',
    description: 'Ethernet Cable Cat6 100ft',
    qty: '15',
    unit: 'Roll/s',
    updated: '2025-06-05 11:30 AM',
    category: 'CAT 41.1 ELECTRONIC CONSUMABLES',
  },
  {
    id: '8',
    itemNo: '18001',
    description: 'Monitor LCD 24-inch',
    qty: '3',
    unit: 'Unit/s',
    updated: '2025-06-01 09:00 AM',
    category: 'CAT 41.1 ELECTRONIC CONSUMABLES',
  },
  {
    id: '9',
    itemNo: '19001',
    description: 'Ethernet Cable Cat6 100ft',
    qty: '15',
    unit: 'Roll/s',
    updated: '2025-06-05 11:30 AM',
    category: 'CAT 41.1 ELECTRONIC CONSUMABLES',
  },
  {
    id: '10',
    itemNo: '30001',
    description: 'Printer Ink Cartridge Black',
    qty: '8',
    unit: 'Pcs',
    updated: '2025-07-01 09:00 AM',
    category: 'CAT 13 COMPUTER SUPPLIES AND MATERIALS',
  },
  {
    id: '11',
    itemNo: '30002',
    description: 'USB Flash Drive 64GB',
    qty: '20',
    unit: 'Pcs',
    updated: '2025-07-10 02:00 PM',
    category: 'CAT 10.1 COMPUTER PERIPHERALS AND ACCESSORIES',
  },
  {
    id: '12',
    itemNo: '30003',
    description: 'Wireless Mouse',
    qty: '12',
    unit: 'Unit/s',
    updated: '2025-07-12 11:00 AM',
    category: 'CAT 10.1 COMPUTER PERIPHERALS AND ACCESSORIES',
  },
  {
    id: '13',
    itemNo: '40001',
    description: 'HDMI Cable 10ft',
    qty: '25',
    unit: 'Pcs',
    updated: '2025-07-14 03:00 PM',
    category: 'CAT 41.1 ELECTRONIC CONSUMABLES',
  },
  {
    id: '14',
    itemNo: '50001',
    description: 'Office Chair Ergonomic',
    qty: '7',
    unit: 'Unit/s',
    updated: '2025-06-20 09:30 AM',
    category: 'CAT 11 OFFICE FURNITURE AND FIXTURES',
  },
  {
    id: '15',
    itemNo: '50002',
    description: 'Filing Cabinet 4-Drawer',
    qty: '2',
    unit: 'Unit/s',
    updated: '2025-06-25 01:00 PM',
    category: 'CAT 11 OFFICE FURNITURE AND FIXTURES',
  },
  {
    id: '16',
    itemNo: '60001',
    description: 'LED Light Bulb 9W',
    qty: '50',
    unit: 'Pcs',
    updated: '2025-07-01 10:00 AM',
    category: 'CAT 39.1 LIGHTING AND ELECTRICAL SUPPLIES',
  },
  {
    id: '17',
    itemNo: '60002',
    description: 'Extension Cord 5-Outlet',
    qty: '10',
    unit: 'Pcs',
    updated: '2025-07-05 04:00 PM',
    category: 'CAT 39.1 LIGHTING AND ELECTRICAL SUPPLIES',
  },
  {
    id: '18',
    itemNo: '70001',
    description: 'First Aid Kit Small',
    qty: '5',
    unit: 'Set/s',
    updated: '2025-07-15 08:00 AM',
    category: 'CAT 42 HEALTH AND SAFETY SUPPLIES',
  },
];

const consistentCardColors = ['#D1F2EB', '#A2D9CE']; // Light green/teal gradient

export default function StocksScreen({navigation}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index, "from Davao City");
  }, []);

  const handlePresentModalPress = useCallback(item => {
    setSelectedItem(item);
    bottomSheetRef.current?.expand();
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedItem(null);
  }, []);

  const groupedCategoryData = useMemo(() => {
    const grouped = {};
    inventoryData.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = {
          totalQty: 0,
          items: [],
        };
      }
      grouped[item.category].totalQty += parseInt(item.qty, 10);
      grouped[item.category].items.push(item);
    });

    return Object.keys(grouped).map(category => ({
      id: category,
      title: category,
      totalQty: grouped[category].totalQty,
      items: grouped[category].items,
      colors: consistentCardColors,
    }));
  }, [inventoryData]);

  const renderFlatListItem = ({item}) => {
    return (
      <TouchableOpacity style={styles.categoryCard}>
        <LinearGradient
          colors={item.colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientBackground}>
          <View style={styles.categoryCardHeader}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={28}
              color="#2F4F4F"
              style={styles.cardIcon}
            />
            <Text style={styles.categoryCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.categoryCardQuantityLabel}> {/* New style for "Total Quantity:" */}
            Total Quantity:{' '}
            <Text style={styles.categoryCardQuantityValue}> {/* New style for the value */}
              {item.totalQty}
            </Text>
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#fff"
            style={styles.backButton}
          />
        </TouchableOpacity>
        <MaterialCommunityIcons
          style={styles.icon}
          color="black"
          name="package-variant"
          size={28}
        />
        <Text style={styles.topHeaderTitle}>Stocks</Text>
        <View style={{flex: 1}} />
      </View>

      <FlatList
        data={groupedCategoryData}
        renderItem={renderFlatListItem}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        key="categoryGrid" 
      />

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
                  alert(`Edit ${selectedItem.description}`);
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
                  alert(`Request ${selectedItem.description}`);
                  handleClosePress();
                }}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={24}
                  color="#ffc107"
                />
                <Text style={styles.bottomSheetActionText}>Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomSheetAction}
                onPress={() => {
                  alert(`Delete ${selectedItem.description}`);
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
  icon: {
    marginRight: 5,
  },
  listContent: {
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
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
  categoryCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    width: (width - 40) / 3,
    marginHorizontal: 5,
    height: 130,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 5,
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2F4F4F',
    textAlign: 'center',
    flexShrink: 1,
  },
  categoryCardQuantityLabel: { // Style for "Total Quantity:" part
    fontSize: 14, // Slightly smaller than the value
    fontWeight: 'normal', // Ensure it's not bold
    color: '#2F4F4F',
    marginTop: 5,
  },
  categoryCardQuantityValue: { // Style for the actual quantity number
    fontSize: 16, // Emphasized font size
    fontWeight: '900', // Emphasized boldness
    color: '#2F4F4F',
  },
});