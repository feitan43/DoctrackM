import React, {useState, useCallback, useEffect, useMemo} from 'react';
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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// --- Import the actual useRatedSuppliers hook ---
// Adjust the path according to your project structure
// Assuming it returns { data, isLoading, isError, error }
import {useRatedSuppliers, useSupplierReviews, useSuppliersInfo} from '../../hooks/useSupplierRating'; // Make sure this path is correct

// --- StarRatingDisplay Component ---
// Displays a horizontal progress bar representation of a rating
const StarRatingDisplay = ({label, rating, totalStars = 5}) => {
  const percentage = (rating / totalStars) * 100;

  return (
    <View style={styles.horizontalStarRatingContainer}>
      <Text style={styles.horizontalStarRatingLabel}>{label}</Text>
      <View style={styles.horizontalProgressBarContainer}>
        <View style={[styles.horizontalProgressBar, {width: `${percentage}%`}]} />
      </View>
      <Text style={styles.horizontalStarRatingValue}>({rating.toFixed(1)})</Text>
    </View>
  );
};

// --- OverallStarRatingDisplay Component ---
// Displays the prominent overall average rating with stars
const OverallStarRatingDisplay = ({overallAverage, numReviews}) => {
  const roundedRating = Math.round(overallAverage * 2) / 2;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    let iconName = 'star-outline';
    if (i <= roundedRating) {
      iconName = 'star';
    } else if (i - 0.5 === roundedRating) {
      iconName = 'star-half';
    }

    stars.push(
      <Icons
        key={i}
        name={iconName}
        size={25}
        color="#FFD700"
        style={styles.overallStarIcon}
      />,
    );
  }

  return (
    <View style={styles.overallRatingBox}>
      <Text style={styles.overallRatingTitle}>Overall ({numReviews} Reviews)</Text>
      <Text style={styles.overallRatingValue}>{overallAverage.toFixed(1)}</Text>
      <Text style={styles.overallRatingOutOf}>out of 5</Text>
      <View style={styles.overallStarsContainer}>{stars}</View>
    </View>
  );
};

// --- SupplierReviews Main Component ---
export default function SupplierReviews({navigation}) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSupplierModalVisible, setSupplierModalVisible] = useState(false);

  // --- Year Selection States ---
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = 2024; i <= currentYear; i++) {
      yearsArray.push(i);
    }
    return yearsArray.sort((a, b) => b - a); // Sort descending (current year first)
  }, [currentYear]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // **** NEW useEffect to reset supplier on year change ****
  useEffect(() => {
    // This effect runs whenever selectedYear changes
    // It resets selectedSupplier to null, forcing re-selection for the new year
    setSelectedSupplier(null);
  }, [selectedYear]); // Dependency array: run when selectedYear changes


  // Use the actual useRatedSuppliers hook to fetch data
  const {
    data: suppliersData,
    isLoading: loadingSuppliers,
    isError: suppliersError,
  } = useRatedSuppliers(selectedYear); 

  const { data: suppliersInfo } = useSuppliersInfo(selectedSupplier?.supplier_name); 

  const {
    data: supplierReviewData, // Renamed to avoid conflict with `useSupplierReviews` in the initial code
    isLoading: loadingReviews,
    isError: reviewsError,
  } = useSupplierReviews(selectedYear, selectedSupplier?.SuppIdentifier);

  const suppliers = useMemo(() => {
    return Array.isArray(suppliersData) ? suppliersData : [];
  }, [suppliersData]);

  // Effect to set the first supplier as selected by default once data loads
  // REMOVED THE AUTOMATIC SELECTION:
  // useEffect(() => {
  //   if (!loadingSuppliers && suppliers.length > 0 && !selectedSupplier) {
  //     setSelectedSupplier(suppliers[0]);
  //   }
  // }, [loadingSuppliers, suppliers, selectedSupplier]);

  // Transform the selectedSupplier data to match the UI's expected 'supplierInfo' structure
  const supplierInfo = useMemo(() => {
    if (!selectedSupplier) return null;

    // Find the relevant rating and feedback for the selected supplier and year
    const currentRating = Array.isArray(supplierReviewData?.ratings)
      ? supplierReviewData.ratings.find(
            rating =>
              rating.supplier_id === selectedSupplier.SuppIdentifier 
          )
        : null;

    const currentFeedback = Array.isArray(supplierReviewData?.feedback)
      ? supplierReviewData.feedback.find(
            feedback =>
              feedback.trackingnumber === selectedSupplier.trackingnumber &&
              feedback.Year === String(selectedYear), // Ensure year comparison is correct
          )
        : null;

    return {
      Address: suppliersInfo?.[0]?.Address || 'N/A', 
      Classification: suppliersInfo?.[0]?.Name || 'N/A', // Assuming 'Name' maps to 'Classification'
      Contact: suppliersInfo?.[0]?.Contact || 'N/A', 
      Proprietor: suppliersInfo?.[0]?.Proprietor || 'N/A', 
      ratings: {
        timeliness: parseFloat(currentRating?.avg_timeliness || 0),
        productQuality: parseFloat(currentRating?.avg_quality || 0),
        service: parseFloat(currentRating?.avg_service || 0),
      },
      overallAverage: parseFloat(currentRating?.overall_avg_rating || 0),
      numReviews: parseInt(currentRating?.total_reviews || 0, 10),
      feedback: {
        text: currentFeedback?.feedback || 'No detailed feedback available for this supplier for the selected year.',
        date: currentFeedback?.dateReviewed ? new Date(currentFeedback.dateReviewed).toLocaleDateString() : '',
        timeliness: parseInt(currentFeedback?.timeliness || 0, 10),
        productQuality: parseInt(currentFeedback?.quality || 0, 10),
        service: parseInt(currentFeedback?.service || 0, 10),
        by: currentFeedback?.FullName || 'N/A',
        for: currentFeedback?.Office || 'N/A',
        category: currentFeedback?.CategoryDescription || 'N/A',
        tn: currentFeedback?.trackingnumber || 'N/A',
      },
      // Include the available fields from selectedSupplier directly
      reviewerOffice: selectedSupplier.reviewerOffice,
      trackingnumber: selectedSupplier.trackingnumber,
      supplier_name: selectedSupplier.supplier_name,
      SuppIdentifier: selectedSupplier.SuppIdentifier,
    };
  }, [selectedSupplier, supplierReviewData, selectedYear, suppliersInfo]); 

  const handleSelectSupplier = useCallback(supplier => {
    setSelectedSupplier(supplier);
    setSupplierModalVisible(false);
  }, []);

  const renderSupplierItem = useCallback(({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectSupplier(item)}>
      <Text style={styles.modalItemText}>
        <Text style={{fontWeight: 'bold'}}>{item.trackingnumber || item.SuppIdentifier}</Text> -{' '}
        {item.supplier_name}
      </Text>
    </TouchableOpacity>
  ), [handleSelectSupplier]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A508C', '#0D3B66']}
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
            <Text style={styles.headerTitle}>Supplier Reviews</Text>
          </View>
          {/* Year Dropdown Trigger */}
          <TouchableOpacity
            style={styles.yearDropdownTrigger}
            onPress={() => setShowYearPicker(!showYearPicker)}>
            <Text style={styles.yearDropdownText}>{selectedYear}</Text>
            <Icons
              name={showYearPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
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
                    ? selectedSupplier.supplier_name
                    : 'Choose a Supplier'}
                </Text>
                <Icon name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>

              {/* Conditionally render supplier info and feedback if a supplier is selected */}
              {selectedSupplier ? (
                loadingReviews ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1A508C" />
                    <Text style={styles.loadingText}>Loading supplier reviews for {selectedYear}...</Text>
                  </View>
                ) : reviewsError ? (
                  <View style={styles.emptyState}>
                    <Icons name="alert-circle-outline" size={50} color="#ff6347" />
                    <Text style={styles.emptyStateText}>
                      Error loading reviews: {reviewsError.message || 'Unknown error'}.
                    </Text>
                    <Text style={styles.emptyStateText}>
                      Please try selecting another year or supplier.
                    </Text>
                  </View>
                ) : (
                  supplierInfo && (
                    <>
                      {/* About Section */}
                      <View style={styles.aboutSection}>
                        <Text style={styles.aboutTitle}>About</Text>
                       {/* <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Supplier Name:</Text>
                          <Text style={styles.aboutValue}>{supplierInfo.supplier_name}</Text>
                        </View>
                        <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Tracking No.:</Text>
                          <Text style={styles.aboutValue}>{supplierInfo.trackingnumber}</Text>
                        </View>
                          <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Reviewer Office:</Text>
                          <Text style={styles.aboutValue}>{supplierInfo.reviewerOffice}</Text>
                        </View>
                          <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Supplier ID:</Text>
                          <Text style={styles.aboutValue}>{supplierInfo.SuppIdentifier}</Text>
                        </View> */}
                        <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Address:</Text>
                          <Text style={styles.aboutValue}>{supplierInfo.Address}</Text>
                        </View>
                        <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Classification:</Text>
                          <Text style={styles.aboutValue}>
                            {supplierInfo.Classification}
                          </Text>
                        </View>
                        <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Contact Number:</Text>
                          <Text style={styles.aboutValue}>
                            {supplierInfo.Contact}
                          </Text>
                        </View>
                        <View style={styles.aboutRow}>
                          <Text style={styles.aboutLabel}>Proprietor:</Text>
                          <Text style={styles.aboutValue}>
                            {supplierInfo.Proprietor}
                          </Text>
                        </View>
                      </View>

                      {/* Rating and Overall Summary Section */}
                      <View style={styles.ratingSummarySection}>
                        <View style={styles.ratingDetailsColumn}>
                          <StarRatingDisplay
                            label="Timeliness"
                            rating={supplierInfo.ratings.timeliness}
                          />
                          <StarRatingDisplay
                            label="Product Quality"
                            rating={supplierInfo.ratings.productQuality}
                          />
                          <StarRatingDisplay
                            label="Service"
                            rating={supplierInfo.ratings.service}
                          />
                        </View>
                        <OverallStarRatingDisplay
                          overallAverage={supplierInfo.overallAverage}
                          numReviews={supplierInfo.numReviews}
                        />
                      </View>

                      {/* User Feedback Section */}
                      <View style={styles.userFeedbackSection}>
                        <Text style={styles.userFeedbackTitle}>USER FEEDBACK</Text>
                        <View style={styles.feedbackContentBox}>
                          <Text style={styles.feedbackTextMain}>
                            {supplierInfo.feedback.text}{' '}
                            <Text style={styles.feedbackDate}>
                              {supplierInfo.feedback.date}
                            </Text>
                          </Text>
                          <View style={styles.feedbackCriterionRating}>
                            <Text style={styles.feedbackCriterionLabel}>Timeliness</Text>
                            <View style={styles.feedbackStarsContainer}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Icons
                                  key={`timeliness-${star}`}
                                  name={
                                    star <= supplierInfo.feedback.timeliness
                                      ? 'star'
                                      : 'star-outline'
                                  }
                                  size={16}
                                  color="#FFD700"
                                />
                              ))}
                            </View>
                          </View>
                          <View style={styles.feedbackCriterionRating}>
                            <Text style={styles.feedbackCriterionLabel}>Product Quality</Text>
                            <View style={styles.feedbackStarsContainer}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Icons
                                  key={`product-quality-${star}`}
                                  name={
                                    star <= supplierInfo.feedback.productQuality
                                      ? 'star'
                                      : 'star-outline'
                                  }
                                  size={16}
                                  color="#FFD700"
                                />
                              ))}
                            </View>
                          </View>
                          <View style={styles.feedbackCriterionRating}>
                            <Text style={styles.feedbackCriterionLabel}>Service</Text>
                            <View style={styles.feedbackStarsContainer}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Icons
                                  key={`service-${star}`}
                                  name={
                                    star <= supplierInfo.feedback.service
                                      ? 'star'
                                      : 'star-outline'
                                  }
                                  size={16}
                                  color="#FFD700"
                                />
                              ))}
                            </View>
                          </View>
                          <View style={styles.feedbackDetails}>
                            <Text style={styles.feedbackDetailRow}>
                              <Text style={styles.feedbackDetailLabel}>Rating by:</Text>{' '}
                              {supplierInfo.feedback.by}
                            </Text>
                            <Text style={styles.feedbackDetailRow}>
                              <Text style={styles.feedbackDetailLabel}>For:</Text>{' '}
                              {supplierInfo.feedback.for}
                            </Text>
                            <Text style={styles.feedbackDetailRow}>
                              <Text style={styles.feedbackDetailLabel}>Category:</Text>{' '}
                              {supplierInfo.feedback.category}
                            </Text>
                            <Text style={styles.feedbackDetailRow}>
                              <Text style={styles.feedbackDetailLabel}>TN:</Text>{' '}
                              {supplierInfo.feedback.tn}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </>
                  )
                )
              ) : (
                <View style={styles.emptyState}>
                  <Icons name="information-outline" size={50} color="#b0b0b0" />
                  <Text style={styles.emptyStateText}>
                    Please select a supplier to view their reviews and ratings.
                  </Text>
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
              {loadingSuppliers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1A508C" />
                  <Text style={styles.loadingText}>Loading suppliers...</Text>
                </View>
              ) : suppliersError ? (
                <View style={styles.emptyState}>
                  <Icons name="alert-circle-outline" size={50} color="#ff6347" />
                  <Text style={styles.emptyStateText}>
                    Error loading suppliers: {suppliersError.message || 'Unknown error'}.
                  </Text>
                  <Text style={styles.emptyStateText}>
                    Please try again later.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={suppliers}
                  keyExtractor={item => item.SuppIdentifier || item.trackingnumber || item.supplier_name}
                  renderItem={renderSupplierItem}
                  contentContainerStyle={styles.modalListContent}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                      <Icons name="account-off" size={50} color="#b0b0b0" />
                      <Text style={styles.emptyStateText}>
                        No suppliers found.
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </Pressable>
        </Modal>

        {/* Year Dropdown Options (as a Modal for better overlay) */}
        <Modal
          visible={showYearPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowYearPicker(false)}>
            <View style={styles.yearPickerContainer}>
              <FlatList
                data={years}
                keyExtractor={item => item.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.yearOption,
                      selectedYear === item && styles.selectedYearOption,
                    ]}
                    onPress={() => {
                      setSelectedYear(item);
                      setShowYearPicker(false);
                    }}>
                    <Text
                      style={[
                        styles.yearOptionText,
                        selectedYear === item && styles.selectedYearOptionText,
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  yearDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 10,
  },
  yearDropdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 60 : 60,
    paddingRight: 10,
  },
  yearPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    width: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedYearOption: {
    backgroundColor: '#E6EEF7',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedYearOptionText: {
    fontWeight: 'bold',
    color: '#1A508C',
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  aboutSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    flex: 1,
  },
  aboutValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  ratingSummarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  ratingDetailsColumn: {
    flex: 1,
    marginRight: 15,
  },
  horizontalStarRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  horizontalStarRatingLabel: {
    fontSize: 14,
    color: '#555',
    width: 90,
    marginRight: 10,
  },
  horizontalProgressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  horizontalProgressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  horizontalStarRatingValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    fontWeight: '600',
  },
  overallRatingBox: {
    width: 130,
    height: 130,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0.5},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  overallRatingTitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  overallRatingValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  overallRatingOutOf: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  overallStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  overallStarIcon: {
    marginHorizontal: 0,
  },
  userFeedbackSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  userFeedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  feedbackContentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0.5},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  feedbackTextMain: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  feedbackCriterionRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackCriterionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    width: 90,
  },
  feedbackStarsContainer: {
    flexDirection: 'row',
  },
  feedbackDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  feedbackDetailRow: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  feedbackDetailLabel: {
    fontWeight: '600',
    color: '#555',
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
    justifyContent: 'center',
    alignSelf: 'center',
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
});