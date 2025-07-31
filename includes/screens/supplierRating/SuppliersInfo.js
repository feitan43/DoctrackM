import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput, // Added TextInput for the search bar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

// Main SuppliersInfo Component
const SuppliersInfo = () => {
  const [suppliersData, setSuppliersData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [fullscreenDetailsVisible, setFullscreenDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  // Function to fetch supplier data from the API
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://davaocityportal.com/gord/ajax/dataprocessor.php?getSuppliers=1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedData = data.map(item => ({
        id: item.Id,
        name: item.Name,
        category: item.Classification,
        contactPerson: item.ContactPerson && item.ContactPerson.trim() !== '' ? item.ContactPerson : 'N/A',
        email: item.Email && item.Email.trim() !== '' ? item.Email : 'N/A',
        phone: item.Contact && item.Contact.trim() !== '' ? item.Contact : 'N/A',
        address: item.Address && item.Address.trim() !== '' ? item.Address : 'N/A',
        logo: item.Name ? `https://placehold.co/100x100/4CAF50/ffffff?text=${item.Name.charAt(0).toUpperCase()}` : 'https://placehold.co/100x100/CCCCCC/666666?text=SUP',
        description: `This supplier specializes in ${item.Classification ? item.Classification.toLowerCase() : 'various'} services and products.`,
        website: 'N/A',
        rating: 4.0,
        tin: item.TIN && item.TIN.trim() !== '' ? item.TIN : 'N/A',
        type: item.Type && item.Type.trim() !== '' ? item.Type : 'N/A',
        code: item.Code && item.Code.trim() !== '' ? item.Code : 'N/A',
        alias: item.Alias && item.Alias.trim() !== '' ? item.Alias : 'N/A',
        proprietor: item.Proprietor && item.Proprietor.trim() !== '' ? item.Proprietor.replace(/\n/g, '').trim() : 'N/A',
        zipCode: item.ZipCode && item.ZipCode.trim() !== '' ? item.ZipCode : 'N/A',
        businessId: item.BusinessId && item.BusinessId.trim() !== '' ? item.BusinessId : 'N/A',
        disqualified: item.Disqualified,
        businessContact: item.BusinessContact && item.BusinessContact.trim() !== '' ? item.BusinessContact : 'N/A',
        eligible: item.Eligible,
        supplierImageCount: item.SupplierImageCount,
        dateEncoded: item.DateEncoded && item.DateEncoded.trim() !== '' ? item.DateEncoded : 'N/A',
      }));
      setSuppliersData(transformedData);
    } catch (e) {
      console.error('Failed to fetch suppliers:', e);
      setError('Failed to load suppliers. Please try again later.');
      Alert.alert('Error', 'Failed to load suppliers. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Memoize filtered suppliers to prevent unnecessary re-renders
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) {
      return suppliersData;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return suppliersData.filter(supplier =>
      supplier.name.toLowerCase().includes(lowerCaseQuery) ||
      supplier.category.toLowerCase().includes(lowerCaseQuery) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(lowerCaseQuery))
      // Add more fields to search if necessary
    );
  }, [suppliersData, searchQuery]);


  // Function to open full-screen supplier details
  const openSupplierDetailsFullscreen = (supplier) => {
    setSelectedSupplier(supplier);
    setFullscreenDetailsVisible(true);
  };

  // Function to close full-screen supplier details
  const closeSupplierDetailsFullscreen = () => {
    setFullscreenDetailsVisible(false);
    setSelectedSupplier(null);
  };

  // Function to handle phone call
  const handleCall = (phoneNumber) => {
    if (phoneNumber && phoneNumber !== 'N/A') {
      Linking.openURL(`tel:${phoneNumber}`).catch(err => console.error('Failed to open phone dialer:', err));
    } else {
      Alert.alert('Info', 'Phone number not available for this supplier.');
    }
  };

  // Function to handle email
  const handleEmail = (emailAddress) => {
    if (emailAddress && emailAddress !== 'N/A') {
      Linking.openURL(`mailto:${emailAddress}`).catch(err => console.error('Failed to open email client:', err));
    } else {
      Alert.alert('Info', 'Email address not available for this supplier.');
    }
  };

  // Function to handle website link
  const handleWebsite = (url) => {
    if (url && url !== 'N/A') {
      Linking.openURL(url).catch(err => console.error('Failed to open website:', err));
    } else {
      Alert.alert('Info', 'Website not available for this supplier.');
    }
  };

  // Render item for FlatList (Supplier Card)
  const renderSupplierCard = ({ item }) => (
    <TouchableOpacity
      style={styles.supplierCard}
      onPress={() => openSupplierDetailsFullscreen(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#007bff', '#0056b3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardAccentBar}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.logo }}
            style={styles.supplierLogo}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{item.name}</Text>
            <Text style={styles.supplierCategory}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.contactText}>
            <Text style={styles.label}>Contact Person:</Text> {item.contactPerson}
          </Text>
          <Text style={styles.contactText}>
            <Text style={styles.label}>Phone:</Text> {item.phone}
          </Text>
          <Text style={styles.contactText}>
            <Text style={styles.label}>Address:</Text> {item.address}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.detailsButton} onPress={() => openSupplierDetailsFullscreen(item)}>
            <Text style={styles.detailsButtonText}>See Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Suppliers</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={22} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search suppliers by name or category..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <Icon name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>


        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading suppliers...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSuppliers}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredSuppliers} // Use filtered data here
            renderItem={renderSupplierCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>No suppliers found matching your search.</Text>
                </View>
            )}
          />
        )}

        {/* Fullscreen Supplier Details View (using Modal) */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={fullscreenDetailsVisible}
          statusBarTranslucent={true}
          onRequestClose={closeSupplierDetailsFullscreen}
        >
          <SafeAreaView style={styles.fullScreenModalSafeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#007bff" />
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity onPress={closeSupplierDetailsFullscreen} style={styles.backButton}>
                <Icon name="arrow-back" size={28} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Supplier Details</Text>
              <View style={{ width: 40 }} />
            </View>

            {selectedSupplier && (
              <ScrollView contentContainerStyle={styles.fullScreenModalContent}>
                <Image
                  source={{ uri: selectedSupplier.logo }}
                  style={styles.modalSupplierLogo}
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
                <Text style={styles.modalSupplierName}>{selectedSupplier.name}</Text>
                <Text style={styles.modalSupplierCategory}>{selectedSupplier.category}</Text>
                <Text style={styles.modalDescription}>{selectedSupplier.description}</Text>

                {/* Contact Information Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Contact Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contact Person:</Text>
                    <Text style={styles.detailValue}>{selectedSupplier.contactPerson}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <TouchableOpacity onPress={() => handleEmail(selectedSupplier.email)} disabled={selectedSupplier.email === 'N/A'}>
                      <Text style={[styles.detailValue, selectedSupplier.email !== 'N/A' && styles.linkText]}>{selectedSupplier.email}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <TouchableOpacity onPress={() => handleCall(selectedSupplier.phone)} disabled={selectedSupplier.phone === 'N/A'}>
                      <Text style={[styles.detailValue, selectedSupplier.phone !== 'N/A' && styles.linkText]}>{selectedSupplier.phone}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue}>{selectedSupplier.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Website:</Text>
                    <TouchableOpacity onPress={() => handleWebsite(selectedSupplier.website)} disabled={selectedSupplier.website === 'N/A'}>
                      <Text style={[styles.detailValue, selectedSupplier.website !== 'N/A' && styles.linkText]}>{selectedSupplier.website}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Additional Details Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Additional Details</Text>
              
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Code </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.code}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>TIN </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.tin}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Alias </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.alias}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proprietor </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.proprietor}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Zip Code </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.zipCode}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Business ID </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.businessId}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Disqualified </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.disqualified === "1" ? "Yes" : "No"}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Business Contact </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.businessContact}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Eligible </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.eligible === "1" ? "Yes" : "No"}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Supplier Image Count </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.supplierImageCount || '0'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date Encoded </Text>
                    <Text style={styles.detailValue}>{selectedSupplier.dateEncoded}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Adjust for iOS notch
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    //borderBottomLeftRadius: 20,
    //borderBottomRightRadius: 20,
    marginBottom: 0, // Removed bottom margin here, search bar will add spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    alignItems: 'center',
    //justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 30, // More rounded for modern look
    marginHorizontal: 20,
    marginTop: 20, // Space below header
    marginBottom: 20, // Space above list
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
    height: 50, // Fixed height for consistency
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 10 : 0, // Adjust padding for Android text input height
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  clearSearchButton: {
    marginLeft: 10,
    padding: 5, // Make touchable area larger
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  supplierCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: 8,
    width: '100%',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  supplierLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 18,
    borderWidth: 3,
    borderColor: '#e8f0fe',
    backgroundColor: '#f8f9fa',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34495e',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  supplierCategory: {
    fontSize: 15,
    color: '#7f8c8d',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  cardBody: {
    marginBottom: 15,
  },
  contactText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  ratingContainer: {
    backgroundColor: '#fffbe0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  ratingText: {
    fontSize: 16,
    color: '#f39c12',
    fontWeight: '700',
  },
  detailsButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  detailsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },

  // Fullscreen Modal Styles
  fullScreenModalSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: Platform.OS === 'ios' ? 50 : 60,
    backgroundColor: '#007bff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0056b3',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  fullScreenModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  fullScreenModalContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  modalSupplierLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 5,
    borderColor: '#007bff',
  },
  modalSupplierName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  modalSupplierCategory: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
    paddingHorizontal: 15,
  },
  modalSection: {
    width: '100%',
    marginBottom: 25,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#fefefe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalSectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#34495e',
    marginBottom: 12,
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d0d0d0',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default SuppliersInfo;