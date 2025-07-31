import React, {useState, useCallback, useMemo, useEffect} from 'react';
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
  Image,
  LayoutAnimation, // For subtle layout changes
  UIManager, // For LayoutAnimation on Android
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  usesrSuppliers,
  useSupplierItems,
  useSuppliersInfo,
  useSubmitReviews,
} from '../../hooks/useSupplierRating'; // Assuming these hooks exist
import {launchImageLibrary, launchCamera} from 'react-native-image-picker'; // Assuming these are installed
import useUserInfo from '../../api/useUserInfo';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// StarRating component for individual criterion ratings
const StarRating = ({label, description, rating, onRate}) => {
  const animatedScale = useSharedValue(1);

  const starAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: animatedScale.value}],
    };
  });

  const handlePressStar = useCallback(
    newRating => {
      animatedScale.value = withSpring(1.2, {}, () => {
        animatedScale.value = withSpring(1);
        runOnJS(onRate)(newRating);
      });
    },
    [onRate, animatedScale],
  );

  return (
    <View style={styles.starRatingContainer}>
      <Text style={styles.starRatingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Pressable
            key={star}
            onPress={() => handlePressStar(star)}
            style={({pressed}) => [
              {opacity: pressed ? 0.6 : 1},
              styles.starPressable,
            ]}>
            <Animated.View style={star <= rating ? starAnimatedStyle : null}>
              <Icons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? '#FFD700' : '#E0E0E0'}
                style={styles.starIcon}
              />
            </Animated.View>
          </Pressable>
        ))}
      </View>
      {description && (
        <Text style={styles.starRatingDescription}>{description}</Text>
      )}
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

// Animated Item Highlight Card
const AnimatedItemHighlightCard = React.memo(({item, isSelected, onToggle}) => {
  const animatedScale = useSharedValue(1);
  const animatedBorderColor = useSharedValue(
    isSelected ? '#1A508C' : '#EFEFEF',
  );
  const animatedBackgroundColor = useSharedValue(
    isSelected ? '#E6F0FF' : '#F8F9FB',
  );

  useEffect(() => {
    animatedBorderColor.value = withSpring(isSelected ? '#1A508C' : '#EFEFEF');
    animatedBackgroundColor.value = withSpring(
      isSelected ? '#E6F0FF' : '#F8F9FB',
    );
  }, [isSelected, animatedBorderColor, animatedBackgroundColor]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: animatedScale.value}],
      borderColor: animatedBorderColor.value,
      backgroundColor: animatedBackgroundColor.value,
    };
  });

  const handlePress = useCallback(() => {
    animatedScale.value = withSpring(0.98, {}, () => {
      animatedScale.value = withSpring(1);
      runOnJS(onToggle)(item);
    });
  }, [animatedScale, onToggle, item]);

  const descriptionLines = (item.Description || item.description || '').split(
    '\n',
  );

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.itemHighlightCard, cardAnimatedStyle]}>
        <View style={styles.itemContentWrapper}>
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
          <View style={styles.itemTextDetails}>
            <Text style={styles.itemHighlightName}>
              {item.Item || item.name}
            </Text>
            {descriptionLines.map((line, lineIndex) => (
              <Text key={lineIndex} style={styles.itemHighlightDescription}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.itemNumericDetails}>
            <Text style={styles.itemQty}>{item.Qty}</Text>
            <Text style={styles.itemAmount}>{item.Amount}</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

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
  const [submittedSupplierName, setSubmittedSupplierName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  const currentYear = new Date().getFullYear();
  const [selectedReviewYear, setSelectedReviewYear] = useState(currentYear);
  const {employeeNumber, officeCode} = useUserInfo();
  const {data: suppliers, loading, error} = usesrSuppliers(selectedReviewYear);
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

  const {data: submitReview, mutate: submitReviewMutation} = useSubmitReviews();

  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2024; year <= currentYear; year++) {
      years.push({id: String(year), name: String(year)});
    }
    return years.reverse(); // Show most recent year first
  }, [currentYear]);

  const itemsForSelectedSupplier = useMemo(() => {
    return supplierItems || [];
  }, [supplierItems]);

  const displaySuppliers = useMemo(() => {
    if (!suppliers) return [];
    return suppliers.filter(
      supplier =>
        supplier.Claimant &&
        supplier.Claimant.toLowerCase().includes(
          supplierSearchQuery.toLowerCase(),
        ),
    );
  }, [suppliers, supplierSearchQuery]);

  useEffect(() => {
    if (isSupplierModalVisible) {
      // console.log('Supplier Modal is now visible. Current loading state:', loading);
      // console.log('Current suppliers data:', suppliers);
    }
  }, [isSupplierModalVisible, loading, suppliers]);

  const handleSelectSupplier = useCallback(supplier => {
    LayoutAnimation.easeInEaseOut(); // Animate layout changes
    setSelectedSupplier(supplier);
    setSelectedItemsToHighlight([]);
    setReviewRatings({timeliness: 0, productQuality: 0, service: 0});
    setFeedbackText('');
    setPhotos([]);
    setSupplierModalVisible(false);
    setSupplierSearchQuery(''); // Reset search query on selection
  }, []);

  const handleSelectYear = useCallback(year => {
    LayoutAnimation.easeInEaseOut(); // Animate layout changes
    setSelectedReviewYear(year.name);
    setYearModalVisible(false);
    setSelectedSupplier(null); // Reset supplier when year changes
    setSelectedItemsToHighlight([]);
    setReviewRatings({timeliness: 0, productQuality: 0, service: 0});
    setFeedbackText('');
    setPhotos([]);
  }, []);

  const handleToggleItemHighlight = useCallback(item => {
    LayoutAnimation.easeInEaseOut(); // Animate layout changes
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
    LayoutAnimation.easeInEaseOut(); // Animate layout changes
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

  const handleRemovePhoto = useCallback(uriToRemove => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            LayoutAnimation.easeInEaseOut(); // Animate layout changes
            setPhotos(prevPhotos =>
              prevPhotos.filter(photo => photo.uri !== uriToRemove),
            ); // Changed to filter by photo.uri
          },
        },
      ],
      {cancelable: true},
    );
  }, []);

  const handleAddPhoto = useCallback(() => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Take Photo',
        onPress: () =>
          launchCamera({mediaType: 'photo', quality: 0.7}, response => {
            if (response.didCancel) {
              console.log('User cancelled camera picker');
            } else if (response.errorCode) {
              console.log('Camera Error: ', response.errorCode);
              Alert.alert('Error', 'Failed to open camera.');
            } else if (response.assets && response.assets.length > 0) {
              const {uri, type, fileName} = response.assets[0];
              // --- ADD THIS LOG ---
              console.log(
                'Camera Photo URI:',
                uri,
                'Type:',
                type,
                'FileName:',
                fileName,
              );
              // --- END LOG ---
              if (uri) {
                // Add a check for URI before adding
                LayoutAnimation.easeInEaseOut();
                setPhotos(prevPhotos => [...prevPhotos, {uri, type, fileName}]);
              } else {
                console.warn('Camera returned an asset without a URI.');
                Alert.alert('Error', 'Failed to capture photo. Invalid URI.');
              }
            }
          }),
      },
      {
        text: 'Choose from Library',
        onPress: () =>
          launchImageLibrary({mediaType: 'photo', quality: 0.7}, response => {
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.errorCode) {
              console.log('ImagePicker Error: ', response.errorCode);
              Alert.alert('Error', 'Failed to open image library.');
            } else if (response.assets && response.assets.length > 0) {
              const {uri, type, fileName} = response.assets[0];
              // --- ADD THIS LOG ---
              console.log(
                'Library Photo URI:',
                uri,
                'Type:',
                type,
                'FileName:',
                fileName,
              );
              // --- END LOG ---
              if (uri) {
                // Add a check for URI before adding
                LayoutAnimation.easeInEaseOut();
                setPhotos(prevPhotos => [...prevPhotos, {uri, type, fileName}]);
              } else {
                console.warn('Image library returned an asset without a URI.');
                Alert.alert('Error', 'Failed to select photo. Invalid URI.');
              }
            }
          }),
      },
    ]);
  }, []);

  const isSubmitDisabled = useMemo(() => {
    if (!selectedSupplier) {
      return true;
    }
    const allRated = Object.values(reviewRatings).every(rating => rating > 0);
    // Feedback is mandatory if items are highlighted OR if no items are highlighted but supplier is selected
    const feedbackRequired =
      selectedItemsToHighlight.length > 0 ||
      (selectedSupplier && itemsForSelectedSupplier.length === 0);
    const feedbackProvided = feedbackText.trim().length > 0;

    if (feedbackRequired && !feedbackProvided) {
      return true;
    }

    return !allRated;
  }, [
    selectedSupplier,
    reviewRatings,
    selectedItemsToHighlight,
    feedbackText,
    itemsForSelectedSupplier,
  ]);

  const handleSubmitReview = useCallback(async () => {
    if (isSubmitting) return;

    if (isSubmitDisabled) {
      // Improved alert message based on the new logic
      let alertMessage =
        'Please select a supplier and rate all categories (Timeliness, Product Quality, Service) to submit your review.';

      const feedbackRequired =
        selectedItemsToHighlight.length > 0 ||
        (selectedSupplier && itemsForSelectedSupplier.length === 0);
      const feedbackProvided = feedbackText.trim().length > 0;

      if (feedbackRequired && !feedbackProvided) {
        alertMessage =
          'Feedback is required as you have highlighted items or there are no items to highlight for this supplier.';
      }

      Alert.alert('Missing Information', alertMessage);
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Determine highlighted items to send
    let highlightedItemsToSend;
    if (
      selectedItemsToHighlight.length > 2 &&
      selectedItemsToHighlight.length === itemsForSelectedSupplier.length
    ) {
      highlightedItemsToSend = ['All Items'];
    } else {
      highlightedItemsToSend = selectedItemsToHighlight.map(
        item => item.Description || item.description || item.Item || item.name, // Prefer description, then fallback to Item/name
      );
    }

    // Prepare photos for upload
    const filesArray = photos.map(photo => {
      // Ensure file:/// is removed for Android compatibility with FormData
      const uri =
        Platform.OS === 'android'
          ? photo.uri.replace('file://', '')
          : photo.uri;
      return {
        uri: uri,
        type: photo.type || 'image/jpeg', // Default to image/jpeg if type is missing
        name: photo.fileName || `photo_${Date.now()}.jpg`, // Default filename
      };
    });

    // console.log('Submitting Review:', {
    //   reviewYear: selectedReviewYear,
    //   tn: selectedSupplier?.TrackingNumber,
    //   supplier: selectedSupplier?.Name,
    //   item: highlightedItemsToSend,
    //   ratings: reviewRatings,
    //   feedback: feedbackText,
    //   photos: filesArray, // Now passing file objects
    // });

    // Assuming submitReviewMutation can take FormData directly or handle an array of file objects
    // If your useSubmitReviews hook expects FormData, you'd construct it here:
    // const formData = new FormData();
    // formData.append('EmployeeNumber', employeeNumber);
    // formData.append('officeCode', officeCode);
    // formData.append('year', selectedReviewYear);
    // formData.append('tn', selectedSupplier?.TrackingNumber);
    // formData.append('supplier', selectedSupplier?.Claimant);
    // formData.append('item', JSON.stringify(highlightedItemsToSend)); // Stringify arrays/objects
    // formData.append('ratings', JSON.stringify(reviewRatings));
    // formData.append('feedback', feedbackText);
    // filesArray.forEach((file, index) => {
    //   formData.append(`photos[${index}]`, file); // Append each file
    // });
    // And then call: submitReviewMutation(formData);

    // For now, assuming your hook is updated to accept an array of file objects
    submitReviewMutation({
      EmployeeNumber: employeeNumber,
      officeCode: officeCode,
      year: selectedReviewYear,
      tn: selectedSupplier?.TrackingNumber,
      supplier: selectedSupplier?.Claimant,
      item: highlightedItemsToSend,
      ratings: reviewRatings,
      feedback: feedbackText,
      attachments: filesArray, // Changed from 'photos' to 'attachments' to imply file handling
    });

    setSubmittedSupplierName(selectedSupplier?.Claimant || '');
    setIsSubmitting(false);
    setSuccessModalVisible(true);
  }, [
    isSubmitting,
    isSubmitDisabled,
    selectedReviewYear,
    selectedSupplier,
    selectedItemsToHighlight,
    itemsForSelectedSupplier, // Added to dependency array
    reviewRatings,
    feedbackText,
    photos, // photos state is now an array of objects
    employeeNumber, // Added to dependency array
    officeCode, // Added to dependency array
    submitReviewMutation, // Added to dependency array
  ]);

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessModalVisible(false);
    // Reset all states
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
      <Text
        style={[
          styles.modalItemText,
          selectedReviewYear === item.name && styles.selectedModalItemText,
        ]}>
        {item.name}
      </Text>
      {selectedReviewYear === item.name && (
        <Icons name="check-circle" size={20} color="#1A508C" />
      )}
    </TouchableOpacity>
  );
  // const totalSteps = selectedSupplier ? 5 : 1;  //originally 5, but now we have 4 steps
  const totalSteps = selectedSupplier ? 4 : 1;
  const currentStep = useMemo(() => {
    if (!selectedSupplier) return 1;
    if (feedbackText.length > 0 || photos.length > 0) return 5;
    if (Object.values(reviewRatings).every(rating => rating > 0)) return 4;
    if (selectedItemsToHighlight.length > 0) return 3;
    return 2;
  }, [
    selectedSupplier,
    selectedItemsToHighlight,
    reviewRatings,
    feedbackText,
    photos,
  ]);

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
            <Icons
              name="pencil-outline"
              size={30}
              color="white"
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Write a Review</Text>
          </View>
          <TouchableOpacity
            onPress={() => setYearModalVisible(true)}
            style={styles.selectedYearBadge}
            activeOpacity={0.8}>
            <Text style={styles.selectedYearText}>{selectedReviewYear}</Text>
            <Icon name="chevron-down" size={16} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        <View style={styles.infoBanner}>
          <Icon
            name="information-circle-outline"
            size={18}
            color="#444"
            style={{marginRight: 6}}
          />
          <Text style={styles.infoBannerText}>
            Rate and provide feedback to your paid suppliers and their products.
          </Text>
        </View>

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
                    ? selectedSupplier.Claimant
                    : 'Tap to select a supplier for your review'}
                </Text>
                <Icon name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>

              {selectedSupplier && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewingSupplierText}>
                    Reviewing:{' '}
                    <Text style={{fontWeight: 'bold'}}>
                      {selectedSupplier.Claimant}
                    </Text>
                  </Text>
                  {loadingInfo ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#1A508C" />
                      <Text style={styles.loadingText}>
                        Loading supplier info...
                      </Text>
                    </View>
                  ) : errorInfo ? (
                    <View style={styles.errorContainerSmall}>
                      <Icons name="alert-circle" size={20} color="#D32F2F" />
                      <Text style={styles.errorTextSmall}>
                        Error loading supplier info.
                      </Text>
                    </View>
                  ) : suppliersInfo && suppliersInfo.length > 0 ? (
                    <View style={styles.supplierInfoCard}>
                      <Text style={styles.supplierInfoTitle}>
                        Supplier Description
                      </Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>
                          {suppliersInfo[0].Name}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>
                          {suppliersInfo[0].Address}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Contact</Text>
                        <Text style={styles.infoValue}>
                          {suppliersInfo[0].Contact}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Proprietor</Text>
                        <Text style={styles.infoValue}>
                          {suppliersInfo[0].Proprietor}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyStateSmall}>
                      <Icons
                        name="information-outline"
                        size={30}
                        color="#b0b0b0"
                      />
                      <Text style={styles.emptyStateTextSmall}>
                        No detailed info available.
                      </Text>
                    </View>
                  )}

                  {/* Step 2: Highlight Specific Items */}
                  <View style={styles.itemsSelectionSection}>
                    <Text style={styles.sectionLabel}>
                      2. Highlight Specific Items (Optional)
                    </Text>
                    {loadingItems ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#1A508C" />
                        <Text style={styles.loadingText}>Loading items...</Text>
                      </View>
                    ) : errorItems ? (
                      <View style={styles.errorContainerSmall}>
                        <Icons name="alert-circle" size={20} color="#D32F2F" />
                        <Text style={styles.errorTextSmall}>
                          Error loading items.
                        </Text>
                      </View>
                    ) : itemsForSelectedSupplier.length > 0 ? (
                      <>
                        <View style={styles.itemHeaderContainer}>
                          <TouchableOpacity
                            style={styles.selectAllHeaderButton}
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
                            />
                          </TouchableOpacity>
                          <Text style={styles.itemHeaderItem}>Item</Text>
                          <Text style={styles.itemHeaderDescription}>
                            Description
                          </Text>
                          <Text style={styles.itemHeaderQty}>Qty</Text>
                          <Text style={styles.itemHeaderAmount}>Amount</Text>
                        </View>
                        <FlatList
                          data={itemsForSelectedSupplier}
                          keyExtractor={(item, index) =>
                            item.Item || item.id || index.toString()
                          }
                          renderItem={({item}) => (
                            <AnimatedItemHighlightCard
                              item={item}
                              isSelected={selectedItemsToHighlight.some(
                                selected =>
                                  (selected.Item || selected.id) ===
                                  (item.Item || item.id),
                              )}
                              onToggle={handleToggleItemHighlight}
                            />
                          )}
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

                  {/* Step 3: Rate Your Experience */}
                  <Text style={styles.sectionLabel}>
                    3. Rate Your Experience with {selectedSupplier.Claimant}
                  </Text>
                  <View style={styles.ratingGroup}>
                    <StarRating
                      label="Timeliness"
                      description="How quickly and efficiently was the service/delivery?"
                      rating={reviewRatings.timeliness}
                      onRate={newRating =>
                        handleRateCriterion('timeliness', newRating)
                      }
                    />
                    <StarRating
                      label="Product Quality"
                      description="How satisfied are you with the quality of the items received?"
                      rating={reviewRatings.productQuality}
                      onRate={newRating =>
                        handleRateCriterion('productQuality', newRating)
                      }
                    />
                    <StarRating
                      label="Service"
                      description="How helpful, professional, and responsive was the supplier's service?"
                      rating={reviewRatings.service}
                      onRate={newRating =>
                        handleRateCriterion('service', newRating)
                      }
                    />
                  </View>

                  {/* Step 4: Add Photos */}
                  {/* <View style={styles.photoSection}>
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
                      <Text style={styles.addPhotoButtonText}>
                        Add Photo ({photos.length})
                      </Text>
                    </TouchableOpacity>
                    {photos.length > 0 && (
                      <View style={styles.photoPreviewContainer}>
                        {photos.map((photo, index) => (
                          <View key={index} style={styles.photoPreview}>
                            <Image
                              source={{uri: photo.uri}}
                              style={styles.photoPreviewImage}
                            />
                            <TouchableOpacity
                              style={styles.removePhotoButton}
                              onPress={() => handleRemovePhoto(photo.uri)}>
                              <Icon name="close-circle" size={20} color="red" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View> */}

                  {/* Step 5: Write Feedback */}
                  <View style={styles.feedbackSection}>
                    <Text style={styles.sectionLabel}>
                      4. Write Feedback
                      {/* {(selectedItemsToHighlight.length > 0 ||
                        itemsForSelectedSupplier.length === 0) && (
                        <Text style={{color: 'red'}}> *Required</Text>
                      )} */}
                      {!(
                        selectedItemsToHighlight.length > 0 ||
                        itemsForSelectedSupplier.length === 0
                      ) && ' (Optional)'}
                    </Text>
                    <TextInput
                      style={styles.feedbackTextInput}
                      placeholder="Share your thoughts about the supplier, items, and service..."
                      multiline
                      numberOfLines={4}
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                      placeholderTextColor="#999"
                      maxLength={500} // Example max length
                    />
                    <Text style={styles.charCountText}>
                      {feedbackText.length}/500 characters
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitDisabled && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={isSubmitDisabled || isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
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
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search by supplier name or tracking number..."
                placeholderTextColor="#999"
                value={supplierSearchQuery}
                onChangeText={setSupplierSearchQuery}
              />
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
                      {supplierSearchQuery.length > 0 && (
                        <Text style={styles.emptyStateText}>
                          Try a different search term.
                        </Text>
                      )}
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
    paddingBottom: 15,
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
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 5,
  },
  headerTitle: {
    fontSize: 24,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  selectedYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 4,
  },
  progressContainer: {
    backgroundColor: '#E6F0FF',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#B3D4FF',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A508C',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd', // Light blue background
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderColor: '#90caf9', // Slightly darker blue border
    borderWidth: 1,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#424242',
    flexShrink: 1,
  },
  scrollViewContent: {
    padding: 15,
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
    fontSize: 17,
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
    flexShrink: 1,
  },
  reviewSection: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  reviewingSupplierText: {
    fontSize: 16,
    color: '#1A508C',
    marginBottom: 15,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  supplierInfoCard: {
    padding: 15,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  supplierInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A508C',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECEFF1',
    paddingBottom: 5,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#000',
    flex: 2,
    textAlign: 'right',
    flexShrink: 1,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  starPressable: {
    padding: 5, // Make touch target larger
  },
  starIcon: {
    marginHorizontal: 3, // Reduce margin to make stars closer
  },
  starRatingDescription: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 15,
    marginTop: 5,
  },
  itemsSelectionSection: {
    marginBottom: 25,
  },
  itemHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#E6F0FF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#B3D4FF',
  },
  selectAllHeaderButton: {
    width: 30, // Fixed width for the checkbox column
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  itemHeaderItem: {
    flex: 2, // Adjusted flex for item name
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
  },
  itemHeaderDescription: {
    flex: 3, // Adjusted flex for description
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'left',
    paddingLeft: 5, // Small padding to separate from item name
  },
  itemHeaderQty: {
    width: 40, // Fixed width for Qty
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'center',
  },
  itemHeaderAmount: {
    width: 60, // Fixed width for Amount
    fontWeight: 'bold',
    color: '#1A508C',
    fontSize: 13,
    textAlign: 'right',
  },
  itemHighlightCard: {
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
  itemContentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align content to the top
  },
  itemCheckbox: {
    marginRight: 10,
    // No alignSelf here, handled by wrapper
  },
  itemTextDetails: {
    flex: 5, // Adjusted flex
    marginRight: 10, // Space before numeric details
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
    flexDirection: 'row', // Align Qty and Amount horizontally
    justifyContent: 'space-between', // Distribute space
    flexShrink: 0, // Prevent shrinking
    width: 100, // Total width for Qty and Amount columns
  },
  itemQty: {
    width: 40, // Fixed width for Qty to align with header
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    textAlign: 'center', // Align text to center for Qty
  },
  itemAmount: {
    width: 60, // Fixed width for Amount to align with header
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    textAlign: 'right', // Align text to right for Amount
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
    justifyContent: 'flex-start', // Align left for photos
  },
  photoPreview: {
    position: 'relative',
    margin: 8,
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
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
  charCountText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 5,
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
    marginHorizontal: 10, // Added for better spacing
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  emptyStateSmall: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  emptyStateTextSmall: {
    marginTop: 5,
    fontSize: 13,
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
    maxHeight: '75%', // Increased max height
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
  modalSearchInput: {
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F8F8',
  },
  modalItem: {
    flexDirection: 'row', // For checkmark in year modal
    justifyContent: 'space-between', // For checkmark in year modal
    alignItems: 'center', // For checkmark in year modal
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#444',
  },
  selectedModalItemText: {
    fontWeight: 'bold',
    color: '#1A508C',
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
  errorContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF9A9A',
    marginBottom: 15,
    justifyContent: 'center',
  },
  errorTextSmall: {
    marginLeft: 8,
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '500',
  },
});

export default WriteAReviewScreen;
