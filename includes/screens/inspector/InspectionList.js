import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';


export const InspectionList = ({item, index, onPressItem}) => {
  const deliveryDates = item.DeliveryDatesHistory
    ? item.DeliveryDatesHistory.split(',')
    : [];
  const lastIndex = deliveryDates.length - 1;

  const isForInspection = item.Status === 'For Inspection';
  let inspectionDateInfo = null;

  if (isForInspection && item.DeliveryDate) {
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

        <View style={styles.trackingInfo}>
          <Text style={styles.trackingText}>
            <Text style={styles.yearText}>{item.Year}</Text>
            {'   '}
            <Text style={styles.separator}>|</Text>
            {'   '}
            {item.TrackingNumber}
          </Text>
        </View>
      </View>

     {/*  <View style={styles.divider} /> */}

      <View style={styles.detailsContainer}>
       {/*  <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Office</Text>
          <Text style={styles.detailValue}>{item.OfficeName}</Text>
        </View> */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{/* Category */}</Text>
          <LinearGradient
        colors={['#FFD700', '#FFA500','#FFFFFF']} // Your desired gradient colors (e.g., gold to orange)
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        <Text style={styles.detailValueWithBackground}>
          {item.CategoryName}
        </Text>
      </LinearGradient>
        </View>

        <View style={styles.divider} />

        <Text style={styles.deliveryHeader}>Delivery</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{item.DeliveryDate || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue}>{item.Address || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact</Text>
          <Text style={styles.detailValue}>{item.ContactPerson || 'N/A'}</Text>
        </View>

        
        {/*  <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>DateInspected</Text>
          <Text style={styles.detailValue}>{item.DateInspected || 'N/A'}</Text>
        </View> */}

        <View style={styles.divider} />

        {isForInspection && inspectionDateInfo && (
          <View style={styles.inspectionInfoRow}>
            <Text style={styles.detailLabel}>{/* Inspection Status */}</Text>
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
        <Icon name='chevron-forward-outline' size={20} color='#F39C12' opacity={0.5} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    //borderRadius: moderateScale(12),
    padding: moderateScale(8),
    marginBottom:10,
    elevation:2
    //marginVertical: verticalScale(2),
    //shadowColor: '#000',
    //shadowOffset: {width: 0, height: verticalScale(4)},
    //shadowOpacity: 0.1,
    //shadowRadius: moderateScale(6),
    //elevation: 6,
    //borderWidth: 0,
    //marginHorizontal: moderateScale(10),
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

  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#EAECEE',
    marginVertical: verticalScale(3),
  },

  detailsContainer: {
    paddingVertical: verticalScale(5),
    marginHorizontal: moderateScale(10),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(6),
  },
  detailLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#607D8B',
    width: '30%',
  },
  detailValue: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'right',
  },
gradientBackground: {
    borderRadius: 5,
    flexShrink:1,
    // Ensure the gradient container does not take up more space than needed
    // You might add flexShrink: 1 here if you have very long CategoryNames
  },
    detailValueWithBackground: {
    fontSize: 16,
    color: '#252525', // Text color should contrast with the gradient background
    fontWeight: 'bold',
    // Add other styles for detailValueWithBackground as needed
  },
  deliveryHeader: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#1A508C',
    //marginTop: verticalScale(15),
    marginBottom: verticalScale(8),
  },

  inspectionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //marginTop: verticalScale(5),
    marginBottom: verticalScale(6),
    paddingTop: verticalScale(5),
    //borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#EAECEE',
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
    color: '#F39C12',
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
