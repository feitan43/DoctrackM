// src/screens/SupplierDetails.js
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Platform,
  UIManager, // Import UIManager
  LayoutAnimation, // Import LayoutAnimation for smooth transitions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSupplierDetails} from '../../hooks/useSuppliers';
import { officeMap } from '../../utils/officeMap';

// Enable LayoutAnimation for Android if supported
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SupplierDetails = ({route, navigation}) => {
  const {supplierId} = route.params;

  const {
    data: fetchedData,
    isLoading,
    isError,
    error,
  } = useSupplierDetails(supplierId);

  const supplier =
    Array.isArray(fetchedData) && fetchedData.length > 0
      ? fetchedData[0]
      : fetchedData;

  // State to manage the expanded/collapsed status of each feedback item's 'item' field
  const [expandedItems, setExpandedItems] = useState({});

  // Function to toggle the expanded state for a specific feedback item with animation
  const toggleExpand = useCallback(id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Add animation
    setExpandedItems(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  if (isLoading) {
    return (
      <View style={detailsStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A508C" />
        <Text style={detailsStyles.loadingText}>
          Loading supplier details...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={detailsStyles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color="#EF4444"
        />
        <Text style={detailsStyles.errorText}>
          Failed to load supplier details.
        </Text>
        <Text style={detailsStyles.errorSubText}>
          {error?.message || 'Please try again later.'}
        </Text>
        <Pressable
          style={detailsStyles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={detailsStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={detailsStyles.noDataContainer}>
        <MaterialCommunityIcons
          name="cloud-off-outline"
          size={60}
          color="#ccc"
        />
        <Text style={detailsStyles.noDataText}>Supplier not found.</Text>
      </View>
    );
  }

  const details = [
    {
      label: 'Supplier Name',
      value: supplier.Name,
      icon: 'storefront-outline',
      type: 'material',
    },
    {
      label: 'Alias',
      value: supplier.Alias,
      icon: 'tag-outline',
      type: 'material',
    },
    {
      label: 'Address',
      value: supplier.Address,
      icon: 'location-outline',
      type: 'ionic',
    },
    {
      label: 'Contact No.',
      value: supplier.Contact,
      icon: 'call-outline',
      type: 'ionic',
    },
    {
      label: 'Email',
      value: supplier.Email,
      icon: 'email-outline',
      type: 'material',
    },
    {
      label: 'TIN',
      value: supplier.TIN,
      icon: 'card-account-details-outline',
      type: 'material',
    },
    {
      label: 'Classification',
      value: supplier.Classification,
      icon: 'shape-outline',
      type: 'material',
    },
    {
      label: 'Type',
      value: supplier.Type,
      icon: 'format-list-bulleted-type',
      type: 'material',
    },
    {
      label: 'Code',
      value: supplier.Code,
      icon: 'barcode-scan',
      type: 'material',
    },
    {
      label: 'Disqualified',
      value:
        supplier.Disqualified !== undefined && supplier.Disqualified !== null
          ? supplier.Disqualified === '0'
            ? 'No'
            : 'Yes'
          : null,
      icon: supplier.Disqualified === '0' ? 'check-circle' : 'close-circle',
      type: 'material',
      color: supplier.Disqualified === '0' ? 'green' : 'red',
    },
    {
      label: 'Eligible',
      value:
        supplier.Eligible !== undefined && supplier.Eligible !== null
          ? supplier.Eligible === '1'
            ? 'Yes'
            : 'No'
          : null,
      icon: supplier.Eligible === '1' ? 'check-circle' : 'close-circle',
      type: 'material',
      color: supplier.Eligible === '1' ? 'green' : 'red',
    },
    {
      label: 'Proprietor',
      value: supplier.Proprietor,
      icon: 'person-outline',
      type: 'ionic',
    },
    {
      label: 'Business Contact',
      value: supplier.BusinessContact,
      icon: 'phone-outline',
      type: 'material',
    },
    {
      label: 'Business ID',
      value: supplier.BusinessId,
      icon: 'card-bulleted-outline',
      type: 'material',
    },
    {
      label: 'Contact Person',
      value: supplier.ContactPerson,
      icon: 'account-supervisor-outline',
      type: 'material',
    },
    {
      label: 'Date Encoded',
      value: supplier.DateEncoded,
      icon: 'calendar-edit',
      type: 'material',
    },
    {
      label: 'Zip Code',
      value: supplier.ZipCode,
      icon: 'post-outline',
      type: 'material',
    },
    // {
    //   label: 'Supplier Image Count',
    //   value: supplier.SupplierImageCount,
    //   icon: 'image-multiple-outline',
    //   type: 'material',
    // },
  ].filter(
    detail =>
      detail.value !== null &&
      detail.value !== undefined &&
      detail.value !== '',
  );

  return (
    <SafeAreaView style={detailsStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={detailsStyles.header}>
        <Pressable
          style={detailsStyles.backButton}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: true,
            radius: 20,
          }}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text
          style={detailsStyles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {supplier.Name || 'Supplier Details'}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={detailsStyles.content}>
        <View style={detailsStyles.detailSection}>
          {/* <Text style={detailsStyles.sectionTitle}>General Information</Text> */}
          {details.map((detail, index) => {
            const isLast = index === details.length - 1;
            const IconComponent =
              detail.type === 'ionic' ? Ionicons : MaterialCommunityIcons;

            return (
              <View
                key={index}
                style={[
                  detailsStyles.detailRow,
                  isLast && detailsStyles.detailRowLast,
                ]}>
                {/* <IconComponent
                  name={detail.icon}
                  size={20}
                  color={detail.color || '#666'}
                  style={detailsStyles.icon}
                /> */}
                <Text style={detailsStyles.detailLabel}>{detail.label} </Text>
                <Text style={detailsStyles.detailValue}>{detail.value}</Text>
              </View>
            );
          })}
        </View>

        {supplier.SupplierFeedback && supplier.SupplierFeedback.length > 0 && (
          <View
            style={[
              detailsStyles.detailSection,
              detailsStyles.feedbackSection,
            ]}>
            <Text style={detailsStyles.sectionTitle}>Supplier Feedback</Text>
            {supplier.SupplierFeedback.map((feedback, index) => {
              const feedbackId = feedback.ID || `feedback-${index}`;
              const isExpanded = expandedItems[feedbackId];
              const linesToShow = isExpanded ? undefined : 3;
              const shouldShowToggle =
                feedback.item &&
                (feedback.item.length > 150 || feedback.item.includes('\n')); // Adjust threshold as needed

              return (
                <View
                  key={feedbackId}
                  style={[
                    detailsStyles.feedbackItem,
                    index === supplier.SupplierFeedback.length - 1 &&
                      detailsStyles.feedbackItemLast,
                  ]}>
                  {feedback.dateReviewed && (
                    <View style={detailsStyles.feedbackRow}>
                      <MaterialCommunityIcons
                        name="calendar-check-outline"
                        size={18}
                        color="#555"
                        style={detailsStyles.feedbackIcon}
                      />
                      <Text style={detailsStyles.feedbackLabel}>Date</Text>
                      <Text style={detailsStyles.feedbackValue}>
                        {new Date(feedback.dateReviewed).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {feedback.reviewerOffice && (
                    <View style={detailsStyles.feedbackRow}>
                      <MaterialCommunityIcons
                        name="office-building-outline"
                        size={18}
                        color="#555"
                        style={detailsStyles.feedbackIcon}
                      />
                      <Text style={detailsStyles.feedbackLabel}>Office</Text>
                      <Text style={detailsStyles.feedbackValue}>
                        {officeMap[feedback.reviewerOffice]}
                      </Text>
                    </View>
                  )}
                  {feedback.trackingnumber && (
                    <View style={detailsStyles.feedbackRow}>
                      <MaterialCommunityIcons
                        name="barcode-scan"
                        size={18}
                        color="#555"
                        style={detailsStyles.feedbackIcon}
                      />
                      <Text style={detailsStyles.feedbackLabel}>TN</Text>
                      <Text style={detailsStyles.feedbackValue}>
                        {feedback.trackingnumber}
                      </Text>
                    </View>
                  )}
                  {feedback.item && (
                    <View>
                      <View style={detailsStyles.feedbackRow}>
                        <MaterialCommunityIcons
                          name="package-variant-closed"
                          size={18}
                          color="#555"
                          style={detailsStyles.feedbackIcon}
                        />
                        <Text style={detailsStyles.feedbackLabel}>Item</Text>
                        <Text
                          style={detailsStyles.feedbackValue}
                          numberOfLines={linesToShow}
                          ellipsizeMode="tail">
                          {feedback.item}
                        </Text>
                      </View>
                      {shouldShowToggle && (
                        <Pressable
                          onPress={() => toggleExpand(feedbackId)}
                          style={detailsStyles.readMoreButton}>
                          <Text style={detailsStyles.readMoreButtonText}>
                            {isExpanded ? 'Show Less' : 'Read More'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                  {feedback.feedback && (
                    <View style={detailsStyles.feedbackRow}>
                      <MaterialCommunityIcons
                        name="comment-text-multiple-outline"
                        size={18}
                        color="#555"
                        style={detailsStyles.feedbackIcon}
                      />
                      <Text style={detailsStyles.feedbackLabel}>Feedback </Text>
                      <Text style={detailsStyles.feedbackValue}>
                        {feedback.feedback}
                      </Text>
                    </View>
                  )}
                  <View style={detailsStyles.ratingsContainer}>
                    {feedback.quality && (
                      <View style={detailsStyles.rating}>
                        <MaterialCommunityIcons
                          name="star-outline"
                          size={18}
                          color="#FFD700"
                        />
                        <Text style={detailsStyles.ratingText}>
                          Quality: {feedback.quality}
                        </Text>
                      </View>
                    )}
                    {feedback.service && (
                      <View style={detailsStyles.rating}>
                        <MaterialCommunityIcons
                          name="tools"
                          size={18}
                          color="#3CB371"
                        />
                        <Text style={detailsStyles.ratingText}>
                          Service: {feedback.service}
                        </Text>
                      </View>
                    )}
                    {feedback.timeliness && (
                      <View style={detailsStyles.rating}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={18}
                          color="#4682B4"
                        />
                        <Text style={detailsStyles.ratingText}>
                          Timeliness: {feedback.timeliness}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {!supplier.SupplierFeedback ||
          (supplier.SupplierFeedback.length === 0 && (
            <View
              style={[
                detailsStyles.detailSection,
                detailsStyles.noFeedbackContainer,
              ]}>
              <MaterialCommunityIcons
                name="comment-off-outline"
                size={40}
                color="#ccc"
              />
              <Text style={detailsStyles.noFeedbackText}>
                No feedback available for this supplier.
              </Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const detailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1A508C',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1A508C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 20,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginTop: 10,
  },
  content: {
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    //alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  icon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  feedbackSection: {
    marginTop: 0,
  },
  feedbackItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feedbackItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedbackIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
    width: 90,
  },
  feedbackValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    //lineHeight: 20,
    fontWeight: '400',
  },
  readMoreButton: {
    alignSelf: 'flex-end', // Align to the right
    marginTop: -5, // Adjust vertical position to be closer to the text
    marginRight: 0, // No right margin
    paddingHorizontal: 0, // No horizontal padding
    paddingVertical: 0, // No vertical padding
  },
  readMoreButtonText: {
    color: '#1A508C',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  ratingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginLeft: 5,
  },
  noFeedbackContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 0,
  },
  noFeedbackText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SupplierDetails;
