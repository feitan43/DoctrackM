import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Mock Data - Replace with your actual data fetching
const mockSuppliers = [
  {id: 's1', name: 'Tech Solutions Inc.'},
  {id: 's2', name: 'Office Supplies Co.'},
  {id: 's3', name: 'Furniture World'},
  {id: 's4', name: 'Software Innovations'},
];

const mockItemsBySupplier = {
  s1: [
    {id: 'i101', name: 'Laptop Pro X', description: 'High-performance laptop'},
    {
      id: 'i102',
      name: 'Wireless Mouse Z',
      description: 'Ergonomic wireless mouse',
    },
    {
      id: 'i103',
      name: 'Monitor UltraWide',
      description: 'Curved ultrawide monitor',
    },
  ],
  s2: [
    {
      id: 'i201',
      name: 'A4 Printer Paper (Box)',
      description: 'Standard A4 paper, 5 reams',
    },
    {
      id: 'i202',
      name: 'Gel Pen Set (12 colors)',
      description: 'Smooth writing gel pens',
    },
    {
      id: 'i203',
      name: 'Stapler Heavy Duty',
      description: 'Durable stapler for large documents',
    },
  ],
  s3: [
    {
      id: 'i301',
      name: 'Ergonomic Office Chair',
      description: 'Adjustable chair with lumbar support',
    },
    {
      id: 'i302',
      name: 'Standing Desk Converter',
      description: 'Adjustable height desk attachment',
    },
  ],
  s4: [
    {
      id: 'i401',
      name: 'Project Management Software License',
      description: 'Annual license for PM tool',
    },
    {
      id: 'i402',
      name: 'Antivirus Suite (5-user)',
      description: 'Comprehensive security solution',
    },
  ],
};

// StarRating component for individual criterion ratings
const StarRating = ({label, rating, onRate}) => {
  return (
    <View style={styles.starRatingContainer}>
      <Text style={styles.starRatingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onRate(star)}>
            <Icons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// New SuccessModal Component - Beautified
const SuccessModal = ({isVisible, onClose, supplierName}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <LinearGradient
          colors={['#ffffff', '#f0f8ff']} // Light gradient from white to very light blue
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.successModalContainer}>
          <Icons name="star-check-outline" size={100} color="#4CAF50" />
          <Text style={styles.successModalTitle}>Review Submitted!</Text>
          <Text style={styles.successModalMessage}>
            Thank you for your valuable feedback on{'\n'}
            <Text style={{fontWeight: 'bold', color: '#333'}}>
              {supplierName}!{/* {' \n'}  */}
            </Text>
          </Text>
          <TouchableOpacity style={styles.successModalButton} onPress={onClose}>
            <Text style={styles.successModalButtonText}>Done</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Pressable>
    </Modal>
  );
};

const WriteAReviewScreen = ({navigation}) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedItemsToHighlight, setSelectedItemsToHighlight] = useState([]);
  const [reviewRatings, setReviewRatings] = useState({
    timeliness: 0,
    productQuality: 0,
    service: 0,
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSupplierModalVisible, setSupplierModalVisible] = useState(false);
  const [isYearModalVisible, setYearModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedSupplierName, setSubmittedSupplierName] = useState(''); // New state to hold supplier name for modal

  const currentYear = new Date().getFullYear();
  const [selectedReviewYear, setSelectedReviewYear] = useState(currentYear);

  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2023; year <= currentYear; year++) {
      years.push({id: String(year), name: String(year)});
    }
    return years;
  }, [currentYear]);

  const itemsForSelectedSupplier = useMemo(() => {
    return selectedSupplier
      ? mockItemsBySupplier[selectedSupplier.id] || []
      : [];
  }, [selectedSupplier]);

  const handleSelectSupplier = useCallback(supplier => {
    setSelectedSupplier(supplier);
    setSelectedItemsToHighlight([]);
    setReviewRatings({timeliness: 0, productQuality: 0, service: 0});
    setFeedbackText('');
    setPhotos([]);
    setSupplierModalVisible(false);
  }, []);

  const handleSelectYear = useCallback(year => {
    setSelectedReviewYear(year.name);
    setYearModalVisible(false);
  }, []);

  const handleToggleItemHighlight = useCallback(item => {
    setSelectedItemsToHighlight(prevSelected => {
      if (prevSelected.some(selected => selected.id === item.id)) {
        return prevSelected.filter(selected => selected.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  }, []);

  const handleSelectAllItems = useCallback(() => {
    if (selectedItemsToHighlight.length === itemsForSelectedSupplier.length) {
      setSelectedItemsToHighlight([]);
    } else {
      setSelectedItemsToHighlight([...itemsForSelectedSupplier]);
    }
  }, [selectedItemsToHighlight, itemsForSelectedSupplier]);

  const handleRateCriterion = useCallback((criterion, newRating) => {
    setReviewRatings(prevRatings => ({
      ...prevRatings,
      [criterion]: newRating,
    }));
  }, []);

  const handleAddPhoto = useCallback(() => {
    alert(
      'Photo upload functionality is not implemented in this mock. Imagine a photo picker here!',
    );
    setPhotos(prevPhotos => [
      ...prevPhotos,
      `photo_${prevPhotos.length + 1}.jpg`,
    ]);
  }, []);

  const isSubmitDisabled = useMemo(() => {
    if (!selectedSupplier) {
      return true;
    }
    const allRated = Object.values(reviewRatings).every(rating => rating > 0);
    return !allRated;
  }, [selectedSupplier, reviewRatings]);

  const handleSubmitReview = useCallback(() => {
    if (isSubmitDisabled) {
      alert('Please select a supplier and rate all categories.');
      return;
    }

    console.log('Submitting Review:', {
      reviewYear: selectedReviewYear,
      supplier: selectedSupplier,
      highlightedItems: selectedItemsToHighlight,
      ratings: reviewRatings,
      feedback: feedbackText,
      photos: photos,
    });

    // Store the supplier name before clearing selectedSupplier
    setSubmittedSupplierName(selectedSupplier?.name || '');
    setSuccessModalVisible(true);

    // Form reset logic is moved to handleCloseSuccessModal
  }, [
    isSubmitDisabled,
    selectedReviewYear,
    selectedSupplier,
    selectedItemsToHighlight,
    reviewRatings,
    feedbackText,
    photos,
  ]);

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessModalVisible(false);
    // Reset form after the modal is closed
    setSelectedSupplier(null);
    setSelectedItemsToHighlight([]);
    setReviewRatings({timeliness: 0, productQuality: 0, service: 0});
    setFeedbackText('');
    setPhotos([]);
    setSelectedReviewYear(currentYear);
    setSubmittedSupplierName(''); // Clear the submitted supplier name
  }, [currentYear]);

  const renderSupplierItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectSupplier(item)}>
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderYearItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectYear(item)}>
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderItemToHighlight = ({item}) => {
    const isSelected = selectedItemsToHighlight.some(
      selected => selected.id === item.id,
    );
    return (
      <TouchableOpacity
        style={[
          styles.itemHighlightCard,
          isSelected && styles.itemHighlightCardSelected,
        ]}
        onPress={() => handleToggleItemHighlight(item)}>
        <View>
          <Text style={styles.itemHighlightName}>{item.name}</Text>
          <Text style={styles.itemHighlightDescription}>
            {item.description}
          </Text>
        </View>
        {isSelected && <Icons name="check-circle" size={24} color="#1A508C" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A508C', '#004AB1']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerBackground}>
          <Pressable
            style={({pressed}) => [
              styles.backButton,
              pressed && {backgroundColor: 'rgba(255, 255, 255, 0.2)'},
            ]}
            android_ripple={{
              color: 'rgba(255, 255, 255, 0.3)',
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => setYearModalVisible(true)}
              style={styles.headerTitleContainer}
              activeOpacity={0.8}>
              <Icons
                name="pencil-outline"
                size={40}
                color="white"
                style={styles.headerIcon}
              />

              <Text style={styles.headerTitle}>Write a Review</Text>
              <View style={styles.selectedYearBadge}>
                <Text style={styles.selectedYearText}>
                  {selectedReviewYear}
                </Text>
                <Icon name="chevron-down" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.card}>
              {/* Step 1: Supplier Selection */}
              <Text style={styles.sectionLabel}>1. Select Supplier</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setSupplierModalVisible(true)}>
                <Text style={styles.dropdownButtonText}>
                  {selectedSupplier
                    ? selectedSupplier.name
                    : 'Choose a Supplier'}
                </Text>
                <Icon name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>

              {selectedSupplier && (
                <View style={styles.reviewSection}>
                  {/* Step 2: Rate Your Experience */}
                  <Text style={styles.sectionLabel}>
                    2. Rate Your Experience with {selectedSupplier.name}
                  </Text>

                  {/* Rating Section */}
                  <View style={styles.ratingGroup}>
                    <StarRating
                      label="Timeliness"
                      rating={reviewRatings.timeliness}
                      onRate={newRating =>
                        handleRateCriterion('timeliness', newRating)
                      }
                    />
                    <StarRating
                      label="Product Quality"
                      rating={reviewRatings.productQuality}
                      onRate={newRating =>
                        handleRateCriterion('productQuality', newRating)
                      }
                    />
                    <StarRating
                      label="Service"
                      rating={reviewRatings.service}
                      onRate={newRating =>
                        handleRateCriterion('service', newRating)
                      }
                    />
                  </View>

                  {/* Step 3: Optional Item Selection for Highlighting */}
                  <View style={styles.itemsSelectionSection}>
                    <Text style={styles.sectionLabel}>
                      3. Highlight Specific Items (Optional)
                    </Text>
                    {itemsForSelectedSupplier.length > 0 ? (
                      <>
                        <TouchableOpacity
                          style={styles.selectAllButton}
                          onPress={handleSelectAllItems}>
                          <Icons
                            name={
                              selectedItemsToHighlight.length ===
                                itemsForSelectedSupplier.length &&
                              itemsForSelectedSupplier.length > 0
                                ? 'checkbox-marked'
                                : 'checkbox-blank-outline'
                            }
                            size={20}
                            color="#1A508C"
                            style={{marginRight: 8}}
                          />
                          <Text style={styles.selectAllButtonText}>
                            {selectedItemsToHighlight.length ===
                              itemsForSelectedSupplier.length &&
                            itemsForSelectedSupplier.length > 0
                              ? 'Deselect All'
                              : 'Select All'}
                          </Text>
                        </TouchableOpacity>
                        <FlatList
                          data={itemsForSelectedSupplier}
                          keyExtractor={item => item.id}
                          renderItem={renderItemToHighlight}
                          scrollEnabled={false}
                        />
                      </>
                    ) : (
                      <View style={styles.emptyState}>
                        <Icons
                          name="package-variant-closed"
                          size={50}
                          color="#b0b0b0"
                        />
                        <Text style={styles.emptyStateText}>
                          No items found for this supplier.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Step 4: Add Photos (Optional) */}
                  <View style={styles.photoSection}>
                    <Text style={styles.sectionLabel}>
                      4. Add Photos (Optional)
                    </Text>
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={handleAddPhoto}>
                      <Icons
                        name="camera-plus-outline"
                        size={24}
                        color="#1A508C"
                      />
                      <Text style={styles.addPhotoButtonText}>Add Photo</Text>
                    </TouchableOpacity>
                    {photos.length > 0 && (
                      <View style={styles.photoPreviewContainer}>
                        {photos.map((photo, index) => (
                          <View key={index} style={styles.photoPreview}>
                            <Icons name="image" size={40} color="#666" />
                            <Text style={styles.photoPreviewText}>{photo}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Step 5: Write Feedback (Optional) */}
                  <View style={styles.feedbackSection}>
                    <Text style={styles.sectionLabel}>
                      5. Write Feedback (Optional)
                    </Text>
                    <TextInput
                      style={styles.feedbackTextInput}
                      placeholder="Share your thoughts about the supplier, items, and service..."
                      multiline
                      numberOfLines={4}
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={isSubmitDisabled}>
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Supplier Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSupplierModalVisible}
          onRequestClose={() => setSupplierModalVisible(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSupplierModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select a Supplier</Text>
                <TouchableOpacity
                  onPress={() => setSupplierModalVisible(false)}>
                  <Icon name="close-circle-outline" size={28} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={mockSuppliers}
                keyExtractor={item => item.id}
                renderItem={renderSupplierItem}
                contentContainerStyle={styles.modalListContent}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Review Year Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isYearModalVisible}
          onRequestClose={() => setYearModalVisible(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setYearModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Review Year</Text>
                <TouchableOpacity onPress={() => setYearModalVisible(false)}>
                  <Icon name="close-circle-outline" size={28} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableYears}
                keyExtractor={item => item.id}
                renderItem={renderYearItem}
                contentContainerStyle={styles.modalListContent}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Success Modal */}
        <SuccessModal
          isVisible={isSuccessModalVisible}
          onClose={handleCloseSuccessModal}
          supplierName={submittedSupplierName} // Pass the new state variable
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
    marginRight: 8,
  },
  selectedYearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 4,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 0,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    marginBottom: 20,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  reviewSection: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  ratingGroup: {
    marginBottom: 25,
  },
  starRatingContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  starRatingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: 5,
  },
  itemsSelectionSection: {
    marginBottom: 25,
  },
  itemHighlightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHighlightCardSelected: {
    borderColor: '#1A508C',
    backgroundColor: '#E6F0FF',
    borderWidth: 2,
  },
  itemHighlightName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  itemHighlightDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    marginBottom: 15,
  },
  selectAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A508C',
  },
  photoSection: {
    marginBottom: 25,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F0FF',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B3D4FF',
  },
  addPhotoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A508C',
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    justifyContent: 'center',
  },
  photoPreview: {
    alignItems: 'center',
    margin: 8,
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  photoPreviewText: {
    fontSize: 10,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },
  feedbackSection: {
    marginBottom: 25,
  },
  feedbackTextInput: {
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  submitButton: {
    backgroundColor: '#1A508C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '85%',
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#444',
  },
  modalListContent: {
    paddingBottom: 10,
  },
  // Updated styles for SuccessModal
  successModalContainer: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    overflow: 'hidden', // Ensures gradient respects borderRadius
    borderWidth: 1, // Subtle border
    borderColor: 'rgba(0,0,0,0.05)',
  },
  successModalTitle: {
    fontSize: 26, // Slightly larger
    fontWeight: 'bold',
    color: '#28A745', // Green color for success
    marginTop: 25, // More space
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.1)', // Subtle text shadow
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  successModalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 35, // More space
    lineHeight: 24,
    paddingHorizontal: 10, // Add some horizontal padding
  },
  successModalButton: {
    backgroundColor: '#1A508C', // Primary blue
    paddingVertical: 14,
    paddingHorizontal: 50, // Wider button
    borderRadius: 10, // Consistent rounding
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  successModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase', // Make button text uppercase
    letterSpacing: 0.5,
  },
});

export default WriteAReviewScreen;