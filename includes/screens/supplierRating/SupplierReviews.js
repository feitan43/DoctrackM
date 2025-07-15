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
  ActivityIndicator,
  Alert,
  Image, // Import Image for displaying photos
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  useSuppliers,
  useSupplierItems,
  useSuppliersInfo,
} from '../../hooks/useSupplierRating';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker'; // Import image picker

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

// SuccessModal Component
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
  const [submittedSupplierName, setSubmittedSupplierName] = useState('');

  const currentYear = new Date().getFullYear();
  const [selectedReviewYear, setSelectedReviewYear] = useState(currentYear);
  const {data: suppliers, loading, error} = useSuppliers(selectedReviewYear);
  const {
    data: suppliersInfo,
    loading: loadingInfo,
    error: errorInfo,
  } = useSuppliersInfo(selectedSupplier?.Claimant);
  const {
    data: supplierItems,
    loading: loadingItems,
    error: errorItems,
  } = useSupplierItems(selectedReviewYear, selectedSupplier?.TrackingNumber);

  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2023; year <= currentYear; year++) {
      years.push({id: String(year), name: String(year)});
    }
    return years;
  }, [currentYear]);

  const itemsForSelectedSupplier = useMemo(() => {
    return supplierItems || [];
  }, [supplierItems]);

  const displaySuppliers = suppliers;

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
      const itemId = item.Item || item.id;
      if (
        prevSelected.some(selected => (selected.Item || selected.id) === itemId)
      ) {
        return prevSelected.filter(
          selected => (selected.Item || selected.id) !== itemId,
        );
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

  // Calculate overall rating based on the average of timeliness, productQuality, and service
  const overallRating = useMemo(() => {
    const ratingsArray = Object.values(reviewRatings).filter(rating => rating > 0);
    if (ratingsArray.length === 0) {
      return 0;
    }
    const sum = ratingsArray.reduce((acc, current) => acc + current, 0);
    return Math.round(sum / ratingsArray.length); // Round to nearest whole star
  }, [reviewRatings]);

  const isSubmitDisabled = useMemo(() => {
    if (!selectedSupplier) {
      return true;
    }
    const allRated = Object.values(reviewRatings).every(rating => rating > 0);
    return !allRated;
  }, [selectedSupplier, reviewRatings]);

  const handleSubmitReview = useCallback(() => {
    if (isSubmitDisabled) {
      Alert.alert(
        'Missing Information',
        'Please select a supplier and rate all required categories (Timeliness, Product Quality, Service).',
      );
      return;
    }

    console.log('Submitting Review:', {
      reviewYear: selectedReviewYear,
      supplier: selectedSupplier,
      highlightedItems: selectedItemsToHighlight,
      ratings: reviewRatings,
      overallRating: overallRating, // Include overall rating
      feedback: feedbackText,
      photos: photos,
    });

    setSubmittedSupplierName(selectedSupplier?.Claimant || ''); // Use Claimant for display
    setSuccessModalVisible(true);
  }, [
    isSubmitDisabled,
    selectedReviewYear,
    selectedSupplier,
    selectedItemsToHighlight,
    reviewRatings,
    overallRating,
    feedbackText,
    photos,
  ]);

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessModalVisible(false);
    setSelectedSupplier(null);
    setSelectedItemsToHighlight([]);
    setReviewRatings({timeliness: 0, productQuality: 0, service: 0});
    setFeedbackText('');
    setPhotos([]);
    setSelectedReviewYear(currentYear);
    setSubmittedSupplierName('');
  }, [currentYear]);

  const renderSupplierItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectSupplier(item)}>
      <Text style={styles.modalItemText}>
        <Text style={{fontWeight: 'bold'}}>{item.TrackingNumber}</Text> -{' '}
        {item.Claimant}
      </Text>
    </TouchableOpacity>
  );

  const renderYearItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectYear(item)}>
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderItemToHighlight = ({item, index}) => {
    const isSelected = selectedItemsToHighlight.some(
      selected => (selected.Item || selected.id) === (item.Item || item.id),
    );

    // Split the description by newline characters
    const descriptionLines = (item.Description || item.description || '').split(
      '\n',
    );

    return (
      <TouchableOpacity
        style={[
          styles.itemHighlightCard,
          isSelected && styles.itemHighlightCardSelected,
        ]}
        onPress={() => handleToggleItemHighlight(item)}>
        <View style={styles.itemHighlightContent}>
          {/* Checkbox */}
          <Icons
            name={
              isSelected
                ? 'checkbox-marked-circle'
                : 'checkbox-blank-circle-outline'
            }
            size={24}
            color={isSelected ? '#1A508C' : '#999'}
            style={styles.itemCheckbox}
          />
          {/* Item Details */}
          <View style={styles.itemTextDetails}>
            <Text style={styles.itemHighlightName}>
              {item.Item || item.name}
            </Text>
            {/* Render each line of the description */}
            {descriptionLines.map((line, lineIndex) => (
              <Text key={lineIndex} style={styles.itemHighlightDescription}>
                {line}
              </Text>
            ))}
          </View>
          {/* Qty and Amount */}
          <View style={styles.itemNumericDetails}>
            <Text style={styles.itemQty}>{item.Qty}</Text>
            <Text style={styles.itemAmount}>{item.Amount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
              {/* Supplier Info (Displayed only if a supplier is selected) */}
             

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
                        Supplier Description
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
    //marginBottom: 20,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSupplierClaimant: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
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
  itemsSelectionSection: {
    marginBottom: 25,
  },
  itemHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#E6F0FF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#B3D4FF',
  },
  itemHeaderItem: {
    flex: 2.5,
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
  },
  itemHeaderDescription: {
    flex: 3,
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'left',
  },
  itemHeaderQty: {
    flex: 1,
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'center',
  },
  itemHeaderAmount: {
    flex: 1.5,
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'right',
  },
  itemHighlightCard: {
    flexDirection: 'row',
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
  itemHighlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemCheckbox: {
    marginRight: 10,
  },
  itemTextDetails: {
    flex: 5.5,
  },
  itemHighlightName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  itemHighlightDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemNumericDetails: {
    flex: 2.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  itemQty: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  itemAmount: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
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
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  modalItemClaimant: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
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