import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function ForPickUp({ navigation, route }) {
  // Initial dummy data for items ready for pickup
  const [pickUpItems, setPickUpItems] = useState([
    {
      id: 'pu1',
      itemName: 'Keyboard, Wireless',
      quantity: 1,
      requestor: 'John Doe',
      employee: 'Jane Smith',
      status: 'Ready for Pickup',
    },
  ]);

  // Effect to add newly issued items from Requests screen
  useEffect(() => {
    if (route.params?.issuedItem) {
      const newItem = route.params.issuedItem;
      // Check if item already exists to prevent duplicates on re-render
      if (!pickUpItems.some(item => item.id === newItem.id)) {
        setPickUpItems((prevItems) => [...prevItems, {...newItem, status: 'Ready for Pickup'}]);
      }
      // Clear the parameter after processing
      navigation.setParams({ issuedItem: undefined });
    }
  }, [route.params?.issuedItem]);


  const handleMarkAsPickedUp = (itemToMark) => {
    Alert.alert(
      'Confirm Pickup',
      `Mark "${itemToMark.itemName}" (Qty: ${itemToMark.quantity}) as picked up by ${itemToMark.employee}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // Simulate removing the item after pickup
            // In a real app, you'd update its status in a backend
            setPickUpItems((prevItems) =>
              prevItems.filter((item) => item.id !== itemToMark.id)
            );
            Alert.alert('Picked Up', `"${itemToMark.itemName}" marked as picked up.`);
          },
        },
      ]
    );
  };

  const renderPickUpItem = ({ item }) => (
    <View style={styles.pickUpCard}>
      <View style={styles.pickUpDetails}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.pickUpInfo}>Quantity: {item.quantity}</Text>
        <Text style={styles.pickUpInfo}>Requested by: {item.requestor}</Text>
        <Text style={styles.pickUpInfo}>Issued to: {item.employee}</Text>
      </View>
      <TouchableOpacity
        style={styles.pickedUpButton}
        onPress={() => handleMarkAsPickedUp(item)}
      >
        <MaterialCommunityIcons name="truck-delivery" size={24} color="#fff" />
        <Text style={styles.pickedUpButtonText}>Picked Up</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#004ab1']}
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
        <Text style={styles.headerTitle}>For Pick Up</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {pickUpItems.length > 0 ? (
        <FlatList
          data={pickUpItems}
          renderItem={renderPickUpItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>No items currently for pickup.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  pickUpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pickUpDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A508C',
    marginBottom: 5,
  },
  pickUpInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  pickedUpButton: {
    backgroundColor: '#007bff', // Blue color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickedUpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 18,
    color: '#777',
    fontStyle: 'italic',
  },
});