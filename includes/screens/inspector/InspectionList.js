import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

export const InspectionList = ({item, index, onPressItem}) => {
  const deliveryDates = item.DeliveryDatesHistory
    ? item.DeliveryDatesHistory.split(',')
    : [];
  const lastIndex = deliveryDates.length - 1;

  return (
    <View style={styles.card}>
      {/* Header Section: Index, Year, and Tracking Number */}
      <View style={styles.headerContainer}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        <View style={styles.trackingInfo}>
          <Text style={styles.trackingText}>
            <Text style={styles.yearText}>{item.Year}</Text>
            {'  '}
            <Text style={styles.separator}>|</Text>
            {'  '}
            {item.TrackingNumber || item.RefTrackingNumber}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Office</Text>
          <Text style={styles.detailValue}>{item.OfficeName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>
            {item.CategoryCode} - {item.CategoryName}
          </Text>
        </View>

        {/* Delivery Section */}
        <Text style={styles.deliveryHeader}>Delivery</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue}>{item.Address || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact</Text>
          <Text style={styles.detailValue}>{item.ContactPerson || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{item.DeliveryDate || 'N/A'}</Text>
        </View>
      </View>

      {/* See Inspection Button - Enhanced but not overwhelming */}
      <Pressable
        style={({pressed}) => [styles.enhancedButton, pressed && styles.enhancedButtonPressed]}
        android_ripple={{color: 'rgba(243, 156, 18, 0.1)', borderless: false}}
        onPress={() => onPressItem(item)}>
        <Text style={styles.enhancedButtonText}>See Inspection</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(6),
    elevation: 6,
    borderWidth: 0,
    marginHorizontal: moderateScale(10),
  },

  // --- Header Styles ---
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  indexCircle: {
    width: moderateScale(32), // Smaller circle
    height: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(16), // Perfect circle for new size
    backgroundColor: '#E6EEF9',
    marginRight: moderateScale(15),
  },
  indexText: {
    fontSize: moderateScale(16), // Smaller font size for the index
    fontWeight: '700',
    color: '#2980B9',
  },
  trackingInfo: {
    flex: 1,
  },
  trackingText: {
    fontSize: moderateScale(17),
    fontWeight: 'bold',
    color: '#34495E',
  },
  yearText: {
    fontWeight: 'normal',
    color: '#7F8C8D',
  },
  separator: {
    color: '#BDC3C7',
    fontSize: moderateScale(16),
  },

  // --- Divider ---
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#EAECEE',
    marginVertical: verticalScale(10),
  },

  // --- Details Section ---
  detailsContainer: {
    paddingVertical: verticalScale(5),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
   // alignItems: 'center',
  },
  detailLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#607D8B',
    width: '30%',
  },
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'right',
  },

  // --- Delivery Header ---
  deliveryHeader: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#1A508C',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(8),
  },

  // --- Enhanced Button Styles ---
  enhancedButton: {
    alignSelf: 'flex-end',
    marginTop: verticalScale(15),
    paddingHorizontal: moderateScale(12), // Added back some padding
    paddingVertical: verticalScale(6),   // Added back some padding
    backgroundColor: 'rgba(243, 156, 18, 0.1)', // Very light orange background
    borderRadius: moderateScale(8),     // Slightly rounded corners
    borderWidth: 1,                     // Subtle border
    borderColor: 'rgba(243, 156, 18, 0.3)', // Lighter orange border
    shadowColor: 'transparent',
    elevation: 0,
  },
  enhancedButtonText: {
    color: '#F39C12', // Keep the accent orange color
    fontSize: moderateScale(14),
    fontWeight: '700', // Bolder to stand out more than just a link
    textDecorationLine: 'none', // Remove underline
  },
  enhancedButtonPressed: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)', // Slightly darker orange on press
    opacity: 0.9,
  },
});

export default InspectionList;