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
  // Removed TextInput as it's not used for displaying feedback
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  // Removed Image as it's not used for displaying photos
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  useSuppliers,
  useSupplierItems,
  useSuppliersInfo,
} from '../../hooks/useSupplierRating';
// Removed launchImageLibrary, launchCamera as photo selection is not used

// StarRating component for displaying individual criterion ratings
const StarRating = ({label, rating}) => {
  return (
    <View style={styles.starRatingContainer}>
      <Text style={styles.starRatingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Icons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={32}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
            style={styles.starIcon}
          />
        ))}
      </View>
    </View>
  );
};

// SuccessModal Component (kept as it's a general confirmation modal, though submission is disabled)
const SuccessModal = ({isVisible, onClose, supplierName}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <LinearGradient
          colors={['#ffffff', '#f0f8ff']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.successModalContainer}>
          <Icons name="star-check-outline" size={100} color="#4CAF50" />
          <Text style={styles.successModalTitle}>Review Submitted!</Text>
          <Text style={styles.successModalMessage}>
            Thank you for your valuable feedback on{'\n'}
            <Text style={{fontWeight: 'bold', color: '#333'}}>
              {supplierName}
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

const SupplierReviews = ({navigation}) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  // Removed selectedItemsToHighlight state as item selection is not used for feedback display
  // Removed reviewRatings state as it's replaced by mockRatings for display
  // Removed feedbackText state as it's replaced by mockFeedback for display
  // Removed photos state as photo selection is not used
  const [isSupplierModalVisible, setSupplierModalVisible] = useState(false);
  const [isYearModalVisible, setYearModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedSupplierName, setSubmittedSupplierName] = useState('');

  // Mocked state for displaying existing ratings and feedback
  const [mockRatings, setMockRatings] = useState({
    timeliness: 5,
    productQuality: 4,
    service: 5,
  });
  const [mockFeedback, setMockFeedback] = useState(
    'Excellent service and high-quality products. Timely delivery every time!',
  );
  const [mockUserName, setMockUserName] = useState('John Doe');

  const currentYear = new Date().getFullYear();
  const [selectedReviewYear, setSelectedReviewYear] = useState(currentYear);
  const {data: suppliers, loading, error} = useSuppliers(selectedReviewYear);
  const {
    data: suppliersInfo,
    loading: loadingInfo,
    error: errorInfo,
  } = useSuppliersInfo(selectedSupplier?.Claimant);
  // Removed useSupplierItems as supplier items selection is not used for feedback display

  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2023; year <= currentYear; year++) {
      years.push({id: String(year), name: String(year)});
    }
    return years;
  }, [currentYear]);

  // Removed itemsForSelectedSupplier memo as it's not used

  const displaySuppliers = suppliers;

  const handleSelectSupplier = useCallback(supplier => {
    setSelectedSupplier(supplier);
    // Removed setSelectedItemsToHighlight([]) as item selection is not used
    // No need to reset mockRatings/mockFeedback here as they are static for display
    setSupplierModalVisible(false);
  }, []);

  const handleSelectYear = useCallback(year => {
    setSelectedReviewYear(year.name);
    setYearModalVisible(false);
  }, []);

  // Removed handleToggleItemHighlight and handleSelectAllItems as item selection is not used

  // Removed handleRateCriterion as interactive rating is not used

  // Calculate overall rating based on the average of timeliness, productQuality, and service
  const overallRating = useMemo(() => {
    const ratingsArray = Object.values(mockRatings).filter(rating => rating > 0);
    if (ratingsArray.length === 0) {
      return 0;
    }
    const sum = ratingsArray.reduce((acc, current) => acc + current, 0);
    // Ensure the average is correctly calculated and potentially rounded for display
    return Math.round(sum / ratingsArray.length);
  }, [mockRatings]);

  // Submit button is now disabled as we are displaying results, not submitting
  const isSubmitDisabled = true;

  // Removed handleSubmitReview logic as submission is not intended in this display-only view
  const handleSubmitReview = useCallback(() => {
    // This function will not be called in this version as submit is disabled
    console.log('Submit button pressed - no action in display mode.');
  }, []);


  const handleCloseSuccessModal = useCallback(() => {
    setSuccessModalVisible(false);
    // Reset only supplier selection, as other states are not relevant for a display-only view
    setSelectedSupplier(null);
    setSelectedReviewYear(currentYear);
    setSubmittedSupplierName('');
  }, [currentYear]);

  const renderSupplierItem = useCallback(({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectSupplier(item)}>
      <Text style={styles.modalItemText}>
        <Text style={{fontWeight: 'bold'}}>{item.TrackingNumber}</Text> -{' '}
        {item.Claimant}
      </Text>
    </TouchableOpacity>
  ), [handleSelectSupplier]);

  const renderYearItem = useCallback(({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectYear(item)}>
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSelectYear]);

  // Removed renderItemToHighlight as item selection is not used

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['rgb(243, 195, 3)', 'rgb(243, 195, 3)']}
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
                name="comment-text"
                size={40}
                color="white"
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>Supplier Reviews</Text>
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
              {/* Step 1: Select Supplier */}
              <Text style={styles.sectionLabel}>1. Select Supplier</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setSupplierModalVisible(true)}>
                <Text style={styles.dropdownButtonText}>
                  {selectedSupplier
                    ? selectedSupplier.Claimant
                    : 'Choose a Supplier'}
                </Text>
                <Icon name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
               {selectedSupplier && (
                <View style={styles.reviewSection}>
                  {suppliersInfo && suppliersInfo.length > 0 && (
                    <View
                      style={{
                        padding: 15,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        marginBottom: 10,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          marginBottom: 10,
                          color: '#1A508C',
                        }}>
                        About
                      </Text>
                      <View
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                          marginBottom: 10,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={{fontWeight: '600'}}>Supplier </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#000',
                            flexShrink: 1,
                            textAlign: 'right',
                          }}>
                          {suppliersInfo[0].Name}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={{fontWeight: '600'}}>Address </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#000',
                            flexShrink: 1,
                            textAlign: 'right',
                          }}>
                          {suppliersInfo[0].Address}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={{fontWeight: '600'}}>Contact </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#000',
                            flexShrink: 1,
                            textAlign: 'right',
                          }}>
                          {suppliersInfo[0].Contact}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={{fontWeight: '600'}}>Proprietor </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: '#000',
                            flexShrink: 1,
                            textAlign: 'right',
                          }}>
                          {suppliersInfo[0].Proprietor}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
              {/* Step 2: Display Rating Results */}
              {selectedSupplier && (
                <View style={styles.reviewSection}>
                  <Text style={styles.sectionLabel}>2. Supplier Rating Feedback</Text>
                  <View style={styles.ratingGroup}>
                    <StarRating
                      label="Timeliness"
                      rating={mockRatings.timeliness}
                    />
                    <StarRating
                      label="Product Quality"
                      rating={mockRatings.productQuality}
                    />
                    <StarRating
                      label="Service"
                      rating={mockRatings.service}
                    />
                  </View>
                  <View style={styles.overallRatingContainer}>
                    <Text style={styles.overallRatingLabel}>Overall Rating</Text>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Icons
                          key={star}
                          name={star <= overallRating ? 'star' : 'star-outline'}
                          size={36}
                          color={star <= overallRating ? '#FFD700' : '#E0E0E0'}
                          style={styles.starIcon}
                        />
                      ))}
                    </View>
                  </View>

                  {/* User Feedback */}
                  <View style={styles.feedbackSection}>
                    <Text style={styles.sectionLabel}>3. User Feedback</Text>
                    <View style={styles.feedbackDisplayBox}>
                        <View style={styles.feedbackHeader}>
                            <Icons name="account-circle" size={30} color="#1A508C" />
                            <Text style={styles.feedbackUser}>{mockUserName}</Text>
                        </View>
                        <Text style={styles.feedbackDisplayText}>{mockFeedback}</Text>
                    </View>
                  </View>

                  {/* Submit Button (disabled as we are displaying results) */}
                  <TouchableOpacity
                    style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                    onPress={handleSubmitReview}
                    disabled={isSubmitDisabled}>
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Supplier Selection Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
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
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1A508C" />
                  <Text style={styles.loadingText}>Loading suppliers...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Icons name="alert-circle" size={40} color="#D32F2F" />
                  <Text style={styles.errorText}>Error loading suppliers</Text>
                  <Text style={styles.errorDetail}>
                    {error.message || 'Unknown error'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={displaySuppliers}
                  keyExtractor={item => item.TrackingNumber}
                  renderItem={renderSupplierItem}
                  contentContainerStyle={styles.modalListContent}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                      <Icons name="account-off" size={50} color="#b0b0b0" />
                      <Text style={styles.emptyStateText}>
                        No suppliers found for the selected criteria.
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </Pressable>
        </Modal>

        {/* Review Year Selection Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isYearModalVisible}
          statusBarTranslucent={true}
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
          supplierName={submittedSupplierName}
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
    paddingBottom: 10,
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
    backgroundColor: 'rgb(224, 181, 8)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
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
    padding: 10,
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
  overallRatingContainer: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#E6F0FF',
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#B3D4FF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overallRatingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackSection: {
    marginBottom: 25,
  },
  feedbackDisplayBox: {
    backgroundColor: '#FFFFFF', // White background for the feedback box
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  feedbackUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A508C',
    marginLeft: 8,
  },
  feedbackDisplayText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  successModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#28A745',
    marginTop: 25,
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  successModalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  successModalButton: {
    backgroundColor: '#1A508C',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default SupplierReviews;