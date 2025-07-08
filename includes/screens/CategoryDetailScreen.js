// CategoryDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useInventoryCatDetails } from '../hooks/useInventory';

const CategoryDetailScreen = ({route, navigation}) => {
  const {category, categoryName, items} = route.params;

  const {data} = useInventoryCatDetails(category);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.header}>
          {categoryName || category} Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.detailItem}>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Tracking #:</Text> {item.trackingNumber}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Item ID:</Text> {item.itemId}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>UploadFiles:</Text> {item.UploadFiles}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="information-circle-outline" size={50} color="#ccc" />
            <Text style={styles.noDetailsText}>
              No detailed items available for this category.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1, // Allows the title to take up remaining space
  },
  scrollViewContent: {
    padding: 16,
  },
  detailItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  noDetailsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CategoryDetailScreen;