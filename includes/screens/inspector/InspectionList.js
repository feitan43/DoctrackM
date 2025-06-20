import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import MaterialCommunityIcons

export const InspectionList = ({item, index, onPressItem}) => {
  const deliveryDates = item.DeliveryDatesHistory
    ? item.DeliveryDatesHistory.split(',')
    : [];
  const lastIndex = deliveryDates.length - 1;

  const isForInspection = item.Status === 'For Inspection';
  let inspectionDateInfo = null;
  let formattedDeliveryDate = 'N/A'; // Initialize formattedDeliveryDate

  if (item.DeliveryDate) {
    // Parse the date string 'YYYY-MM-DD HH:MM AM/PM'
    const [datePart, timePart, ampmPart] = item.DeliveryDate.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    let [hours, minutes] = timePart.split(':').map(Number);

    // Adjust hours for PM
    if (ampmPart === 'PM' && hours < 12) {
      hours += 12;
    }
    // Adjust hours for 12 AM (midnight)
    if (ampmPart === 'AM' && hours === 12) {
      hours = 0;
    }

    // Create a Date object with the parsed components. Month is 0-indexed.
    const inspectionDate = new Date(year, month - 1, day, hours, minutes);

    // --- Option 2: Shorter, Human-Readable Date ---
    formattedDeliveryDate = inspectionDate.toLocaleString('en-US', {
      month: 'short', // "Jun"
      day: 'numeric', // "20"
      year: 'numeric', // "2025"
      hour: 'numeric', // "1"
      minute: 'numeric', // "00"
      hour12: true, // "AM/PM"
    });

    const today = new Date();
    // Set hours, minutes, seconds, milliseconds to 0 for today for accurate day comparison
    today.setHours(0, 0, 0, 0);
    // Set hours, minutes, seconds, milliseconds to 0 for inspectionDate for accurate day comparison
    inspectionDate.setHours(0, 0, 0, 0);

    const diffTime = inspectionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Calculate days difference

    if (diffDays < 0) {
      inspectionDateInfo = {
        text: `Overdue by ${Math.abs(diffDays)} day${
          Math.abs(diffDays) === 1 ? '' : 's'
        }`,
        style: styles.overdueText,
      };
    } else if (diffDays === 0) {
      inspectionDateInfo = {
        text: 'Today is the inspection day!',
        style: styles.todayInspectionText,
      };
    } else {
      inspectionDateInfo = {
        text: `${diffDays} day${diffDays === 1 ? '' : 's'} till inspection`,
        style: styles.daysTillInspectionText,
      };
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        {/* Updated: Separate Text components for better control and no overlap */}
        <View style={styles.categoryInfoContainer}>
          <Text style={styles.categoryNameText}>{item.CategoryName}</Text>
          <Text style={styles.trackingNumberText}>
            {item.Year} | {item.TrackingNumber}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.deliveryHeader}>Delivery</Text>

       

        <View style={[styles.deliveryInfoRow, styles.addressRow]}>
          <MaterialCommunityIcon
              name="calendar"
            size={moderateScale(18)}
            color="#607D8B"
            style={styles.iconStyle}
          />
          <Text style={styles.detailLabel}>{/* Address: */}</Text>
            <Text style={styles.detailValue}>{formattedDeliveryDate}</Text>
        </View>

        <View style={[styles.deliveryInfoRow, styles.addressRow]}>
          <MaterialCommunityIcon
            name="account"
            size={moderateScale(18)}
            color="#607D8B"
            style={styles.iconStyle}
          />
          <Text style={styles.detailLabel}>{/* Address: */}</Text>
          <Text style={styles.detailValue}>{item.ContactPerson || 'N/A'}</Text>
        </View>

         <View style={styles.deliveryInfoRow}>
          <MaterialCommunityIcon
            name="phone" // Phone icon for contact number
            size={moderateScale(18)}
            color="#607D8B"
            style={styles.iconStyle}
          />
          <Text style={styles.detailLabel}>{/* Phone: */}</Text>
          <Text style={styles.detailValue}>{item.ContactNumber || 'N/A'}</Text>
        </View>

        <View style={[styles.deliveryInfoRow, styles.addressRow]}>
          <MaterialCommunityIcon
            name="map-marker"
            size={moderateScale(18)}
            color="#607D8B"
            style={styles.iconStyle}
          />
          <Text style={styles.detailLabel}>{/* Address: */}</Text>
          <Text style={styles.detailValue}>{item.Address || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        {isForInspection && inspectionDateInfo && (
          <View style={styles.inspectionInfoRow}>
            <Text style={styles.detailLabel}> </Text>
            <Text style={[styles.detailValue, inspectionDateInfo.style]}>
              {inspectionDateInfo.text}
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={({pressed}) => [
          styles.enhancedButton,
          pressed && styles.enhancedButtonPressed,
        ]}
        android_ripple={{color: 'rgba(243, 156, 18, 0.1)', borderless: false}}
        onPress={() => onPressItem(item)}>
        <Text style={styles.enhancedButtonText}>See Inspection</Text>
        <Icon
          name="chevron-forward-outline"
          size={20}
          color="#007AFF"
          opacity={0.5}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(8),
    marginBottom: 10,
    elevation: 2,
    paddingStart:30
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  indexCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(16),
    backgroundColor: '#E6EEF9',
    marginRight: moderateScale(15),
  },
  indexText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2980B9',
  },
  categoryInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryNameText: {
    fontSize: 16,
    color: '#252525',
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  trackingNumberText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: verticalScale(2),
    flexWrap: 'wrap',
  },

  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#EAECEE',
    marginVertical: verticalScale(3),
  },

  detailsContainer: {
    paddingVertical: verticalScale(5),
    marginHorizontal: moderateScale(10),
  },
  deliveryHeader: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#1A508C',
    marginBottom: verticalScale(8),
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(6),
  },
  addressRow: {
    // Specific styles for the address row if needed
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flexGrow: 1,
    width: '48%',
    justifyContent: 'flex-start',
  },
  iconStyle: {
    marginRight: moderateScale(5),
  },
  detailLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#607D8B',
    marginRight: moderateScale(5),
  },
  detailValue: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#2C3E50',
    flexShrink: 1,
    flexGrow: 1,
  },

  inspectionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
    paddingTop: verticalScale(5),
  },
  overdueText: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },
  todayInspectionText: {
    color: '#27AE60',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },
  daysTillInspectionText: {
    color: '#3498DB',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },

  enhancedButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: verticalScale(15),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    borderColor: 'rgba(243, 156, 18, 0.3)',
    shadowColor: 'transparent',
    elevation: 0,
  },
  enhancedButtonText: {
    color: '#007AFF',
    fontSize: moderateScale(14),
    fontWeight: '700',
    textDecorationLine: 'none',
  },
  enhancedButtonPressed: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    opacity: 0.9,
  },
});

export default InspectionList;
