import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
// If you have an icon library like 'react-native-vector-icons', you could import it here:
// import Icon from 'react-native-vector-icons/Ionicons';

// Raw ppmpcategories data extracted from the SQL dump
const ppmpCategoriesRaw = [
  { Code: 'CAT 1', Description: 'Audio-Video Equipment - A' },
  { Code: 'CAT 2', Description: 'Audio-Video Equipment - B' },
  { Code: 'CAT 3', Description: 'Audio-Video Equipment - C' },
  { Code: 'CAT 4', Description: 'Audio-Video Spare Parts and Accessories' },
  { Code: 'CAT 5', Description: 'Audio-Video Supplies and Materials' },
  { Code: 'CAT 6', Description: 'Auto Repair Shop' },
  { Code: 'CAT 7', Description: 'Art and Sign Services' },
  { Code: 'CAT 8', Description: 'Breeding Animals' },
  { Code: 'CAT 9', Description: 'Clothing (for Emergency Situations)' },
  { Code: 'CAT 10', Description: 'Computer Equipment and Accessories' },
  { Code: 'CAT 11', Description: 'Computer Repair Services' },
  { Code: 'CAT 12', Description: 'Computer Software' },
  { Code: 'CAT 13', Description: 'Computer Supplies and Materials' },
  { Code: 'CAT 14', Description: 'Construction Supplies and Materials' },
  { Code: 'CAT 15', Description: 'Construction Tools and Equipment' },
  { Code: 'CAT 16', Description: 'Dental Supplies and Materials' },
  { Code: 'CAT 17', Description: 'Drugs and Medicines' },
  { Code: 'CAT 18', Description: 'Electrical Equipment and Appliances - A' },
  { Code: 'CAT 19', Description: 'Electrical Equipment and Appliances - B' },
  { Code: 'CAT 20', Description: 'Electrical Equipment and Appliances - Repairs' },
  { Code: 'CAT 21', Description: 'Electrical Supplies and Materials' },
  { Code: 'CAT 22', Description: 'Electrical Tools' },
  { Code: 'CAT 23', Description: 'Engineering Supplies, Tools & Equipment' },
  { Code: 'CAT 24', Description: 'Engineering Contractor' },
  { Code: 'CAT 25', Description: 'Food and Catering Services' },
  { Code: 'CAT 26', Description: 'Fertilizers, Fungicide and Insecticide' },
  { Code: 'CAT 27', Description: 'Furniture and Fixtures (Ergonomic and Eurotech Type)' },
  { Code: 'CAT 28', Description: 'Furniture and Fixtures (Non-Ergonomic) ' },
  { Code: 'CAT 29', Description: 'Furniture and Fixtures (Plastic)' },
  { Code: 'CAT 30', Description: 'Heavy Equipment' },
  { Code: 'CAT 31', Description: 'Industrial Chemicals' },
  { Code: 'CAT 32', Description: 'Janitorial Supplies and Materials' },
  { Code: 'CAT 33', Description: 'Gardening Supplies and Materials' },
  { Code: 'CAT 34', Description: 'Gardening Tools and Equipment' },
  { Code: 'CAT 35', Description: 'Groceries' },
  { Code: 'CAT 36', Description: 'IT Provider' },
  { Code: 'CAT 37', Description: 'Lumber and Plywood' },
  { Code: 'CAT 38', Description: 'Medical Equipment' },
  { Code: 'CAT 39', Description: 'Medical Supplies and Materials' },
  { Code: 'CAT 40', Description: 'Musical Instruments' },
  { Code: 'CAT 41', Description: 'Office Equipment - Electronic' },
  { Code: 'CAT 42', Description: 'Office Equipment - Manual - A' },
  { Code: 'CAT 43', Description: 'Office Equipment - Manual - B' },
  { Code: 'CAT 44', Description: 'Office Supplies and Materials' },
  { Code: 'CAT 45', Description: 'Oil and Lubricants' },
  { Code: 'CAT 46', Description: 'Painting Tools and Materials' },
  { Code: 'CAT 47', Description: 'Plumbing Supplies and Materials' },
  { Code: 'CAT 48', Description: 'Plumbing Tools and Equipment' },
  { Code: 'CAT 49', Description: 'Printed Forms and Printing Services' },
  { Code: 'CAT 50', Description: 'Publication' },
  { Code: 'CAT 51', Description: 'Quarry Materials' },
  { Code: 'CAT 52', Description: 'Radio Communications Equipment' },
  { Code: 'CAT 53', Description: 'Road Construction Materials' },
  { Code: 'CAT 54', Description: 'Security Services' },
  { Code: 'CAT 55', Description: 'Seed and Seedlings' },
  { Code: 'CAT 56', Description: 'Spare Parts for Light & Heavy Equipment' },
  { Code: 'CAT 57', Description: 'Sports Attire - A' },
  { Code: 'CAT 58', Description: 'Sports Attire - B' },
  { Code: 'CAT 59', Description: 'Sports Equipment and Supplies' },
  { Code: 'CAT 59.1', Description: 'Sub-Category Medals & Trophies' },
  { Code: 'CAT 60', Description: 'Tire, Batteries, and Accessories - 4 Wheels' },
  { Code: 'CAT 61', Description: 'Tire, Batteries, and Accessories - 2 Wheels' },
  { Code: 'CAT 62', Description: 'Vehicles (2 Wheels) and Accessories' },
  { Code: 'CAT 63', Description: 'Vehicles (4 Wheels) and Accessories' },
  { Code: 'CAT 64', Description: 'Veterinary Drugs and Medicines' },
  { Code: 'CAT 65', Description: 'Veterinary Supplies and Materials' },
  { Code: 'CAT 9.1', Description: 'BEDDING SUPPLIES' },
  { Code: 'CAT 39.1', Description: 'Surgical Supplies' },
  { Code: 'CAT 39.2', Description: 'Laboratory Supplies' },
  { Code: 'CAT 39.3', Description: 'Laboratory Reagents and Chemicals' },
  { Code: 'CAT 10.1', Description: 'Computer Peripherals and Accessories' },
  { Code: 'CAT 14.1', Description: 'Glasswares' },
  { Code: 'CAT 69', Description: 'Subscription' },
  { Code: 'CAT 80', Description: 'FUEL, OIL, LUBRICANTS AND SERVICING' },
  { Code: 'CAT 41.1', Description: 'Electronic Consumables' },
  { Code: 'CAT 90', Description: 'TAILORING' },
  { Code: 'CAT 93', Description: 'Postage and Stamps' },
  { Code: 'CAT 78', Description: 'Fire and Rescue Equipment ' },
  { Code: 'CAT 66', Description: 'Accountable Forms' },
  { Code: 'CAT 77', Description: 'Fabrication' },
  { Code: 'NO CAT', Description: 'No Category' },
  { Code: 'CAT 87', Description: 'OXYGEN AND ACETYLENE' },
  { Code: 'CAT 86', Description: 'OFFICE EQUIPMENT - SPARE PARTS/REPAIR' },
  { Code: 'CAT 89', Description: 'Security and Safety Supplies and materials' },
  { Code: 'CAT 75', Description: 'EQUIPMENT RENTAL ' },
  { Code: 'CAT 82', Description: 'GUNS AND AMMUNITIONS' },
  { Code: 'CAT 88', Description: 'SECURITY & SAFETY DEVICES, TOOLS AND EQUIPMENT' },
  { Code: 'CAT 27.1', Description: 'Cabinet Eurotec Type ' },
  { Code: 'CAT 81', Description: 'GOLDSMITH AND METAL CRAFT SERVICES' },
  { Code: 'CAT 91', Description: 'Textile Supplies and Materials' },
  { Code: 'CAT 67', Description: 'AGRICULTURAL CHEMICAL' },
  { Code: 'CAT 68', Description: 'AGRICULTURAL SUPPPLIES AND EQUIPMENT' },
  { Code: 'CAT 70', Description: 'BUSINESS AND BICYCLE PLATES' },
  { Code: 'CAT 71', Description: 'CAMPING MATERIALS AND EQUIPMENT' },
  { Code: 'CAT 72', Description: 'CELLULAR PHONES AND ACCESSORIES' },
  { Code: 'CAT 73', Description: 'CONSTRUCTION REPAIR' },
  { Code: 'CAT 74', Description: 'Training Supplies and Materials (Cosmetology Equipment)' },
  { Code: 'CAT 76', Description: 'EYE GLASSES' },
  { Code: 'CAT 79', Description: 'FIRE AND RESCUE SUPPLIES AND MATERIALS' },
  { Code: 'CAT 83', Description: 'HAULING SERVICES' },
  { Code: 'CAT 84', Description: 'MECHANICAL EQUIPMENT' },
  { Code: 'CAT 92', Description: 'UMBRELLA' },
  { Code: 'CAT 94', Description: 'SERVICES' },
  { Code: 'CAT 85', Description: 'MECHANICAL TOOLS, INSTRUMENTS, MATERIALS' },
  { Code: 'CAT 95', Description: 'Books and References' },
  { Code: 'CAT 35.1', Description: 'Kitchenwares' },
  { Code: 'CAT 96', Description: 'Diving Equipment and Accessories' },
  { Code: 'CAT 97', Description: 'Measurement & Analysis Instruments' },
  { Code: 'CAT 98', Description: 'Fruits and Vegetables' },
  { Code: 'CAT 99', Description: 'Non-PR Transactions' },
  { Code: 'CAT 100', Description: 'Infrastructures/Civil Works' },
  { Code: 'CAT 101', Description: 'Rescue and Safety Tools/Devices' },
  { Code: 'CAT 102', Description: 'Tokens, Souvenirs, and Kit' }
];

// Create a map for quick lookup of category descriptions
const ppmpCategoriesMap = ppmpCategoriesRaw.reduce((map, category) => {
  map[category.Code] = category.Description;
  return map;
}, {});

const initialInventoryData = [
  { Category: "CAT 10", TotalCount: "194" },
  { Category: "CAT 10.1", TotalCount: "91" },
  { Category: "CAT 13", TotalCount: "2" },
  { Category: "CAT 18", TotalCount: "7" },
  { Category: "CAT 2", TotalCount: "2" },
  { Category: "CAT 27", TotalCount: "9" },
  { Category: "CAT 32", TotalCount: "24" },
  { Category: "CAT 35", TotalCount: "6" },
  { Category: "CAT 44", TotalCount: "32" },
  { Category: "CAT 5", TotalCount: "2" },
  { Category: "CAT 57", TotalCount: "1" },
  { Category: "CAT 58", TotalCount: "1" },
  { Category: "CAT 90", TotalCount: "1" }
];

const inventoryData = initialInventoryData.map(item => ({
  ...item,
  Name: ppmpCategoriesMap[item.Category] || 'Unknown Category' // Use description from map, or 'Unknown Category'
}));

// InventoryScreen functional component
// In a real application, you would typically pass a 'navigation' prop here
// to handle the back action, e.g., 'const InventoryScreen = ({ navigation }) => {'
const InventoryScreen = ({navigation}) => {
  co
  // Function to handle the back button press
  const handleBackPress = () => {
    // In a real React Native app with React Navigation, you would use:
     navigation.goBack();
    console.log('Back button pressed!');
    // For this example, we'll just log to the console.
    // You can add your navigation logic here.
  };

  // Render function for each item in the FlatList
  const renderInventoryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textColumn}>
        <Text style={styles.categoryText}>{item.Category}</Text>
        <Text style={styles.nameText}>{item.Name}</Text>
      </View>
      <Text style={styles.countText}>{item.TotalCount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header section with back button and title */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          {/* You can replace this Text with an Icon component from 'react-native-vector-icons'
              if you have it installed, e.g., <Icon name="arrow-back" size={24} color="#2c3e50" /> */}
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Overview</Text>
        {/* Spacer to balance the title if needed, or another icon on the right */}
        <View style={styles.headerSpacer} />
      </View>

      {/* FlatList to display inventory items */}
      <FlatList
        data={inventoryData}
        renderItem={renderInventoryItem}
        keyExtractor={(item, index) => item.Category + index} // Unique key for each item
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

// Styles for the InventoryScreen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background for the whole screen
    paddingTop: 20, // Add some padding from the top for SafeAreaView
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute items evenly
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backButton: {
    padding: 10, // Add padding to make the touch target larger
  },
  backButtonText: {
    fontSize: 18,
    color: '#2980b9', // Blue color for the back button text
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50', // Darker text for header
    textAlign: 'center',
    flex: 1, // Allows the title to take up remaining space
  },
  headerSpacer: {
    width: 60, // A spacer to visually balance the back button on the left
    // Adjust this width based on the actual width of your back button content
  },
  listContent: {
    paddingHorizontal: 15, // Padding on the sides of the list
    paddingBottom: 20, // Padding at the bottom of the list
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background for each item
    paddingVertical: 18, // Increased vertical padding
    paddingHorizontal: 25, // Increased horizontal padding
    borderRadius: 12, // Slightly more rounded corners
    marginBottom: 12, // Increased space between items
    shadowColor: '#000', // Shadow for a subtle lift effect
    shadowOffset: { width: 0, height: 3 }, // More pronounced shadow
    shadowOpacity: 0.15, // Increased shadow opacity
    shadowRadius: 6, // Increased shadow blur radius
    elevation: 5, // Android shadow
    borderLeftWidth: 5, // Added a colored left border for emphasis
    borderLeftColor: '#3498db', // A distinct blue color for the border
  },
  textColumn: {
    flex: 1, // Allows this column to take up available space
  },
  categoryText: {
    fontSize: 20, // Slightly larger font size
    fontWeight: '700', // Bolder font weight
    color: '#2c3e50', // Darker text for category for prominence
  },
  nameText: {
    fontSize: 15, // Slightly larger font size
    color: '#7f8c8d', // Lighter text for the name/description
    marginTop: 4, // Increased margin above the name
  },
  countText: {
    fontSize: 22, // Larger font size for the count
    fontWeight: 'bold',
    color: '#2980b9', // Blue color for count to make it stand out
    marginLeft: 15, // Increased space between category/name and count
  },
});

export default InventoryScreen;
