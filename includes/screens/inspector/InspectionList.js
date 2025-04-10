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
      <View
        style={{
          flexDirection: 'row',
          //backgroundColor: 'rgba(230, 234, 245, 1)',
          alignItems: 'center',
          borderRadius: 5,
        }}>
        <View
          style={{
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            backgroundColor: 'rgba(230, 234, 245, 1)',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'rgb(7, 84, 252)',
              textAlign: 'center',
            }}>
            {index + 1}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Text style={{flex: 0.15, fontSize: 14, color: '#555'}}>{''}</Text>
          <Text
            style={{
              flex: 0.7,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {item.Year}{' '}
            <Text
              style={{
                fontSize: 16,
                textAlign: 'center',
                color: 'rgb(80, 161, 247)',
              }}>
              |
            </Text>{' '}
            {item.TrackingNumber}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.textRow}>
          <Text style={styles.label}>Office</Text>
          <Text style={styles.value}>{item.OfficeName}</Text>
        </View>
        {/*  <View style={styles.textRow}>
          <Text style={styles.label}>Year</Text>
          <Text style={styles.value}>{item.Year}</Text>
        </View> */}

        {/*     <View style={styles.textRow}>
          <Text style={styles.label}>
             {item.TrackingNumber?.startsWith('PR-') ? 'TN' : 'Payment TN'}
            TN
          </Text>
          <Text style={styles.value}>{item.TrackingNumber}</Text>
        </View> */}

        <View style={styles.textRow}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>
            {item.CategoryCode} - {item.CategoryName}
          </Text>
        </View>

          <View
                style={{
                  alignSelf: 'center',
                  height: 1,
                  backgroundColor: '#ddd',
                  width: '100%',
                  marginVertical: 5,
                  borderRadius: 10,
                }}
              />

        <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#0754FC',
                marginBottom: 5,
              }}>
              Delivery
            </Text>

        <View style={styles.textRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{item.Address || 'N/A'}</Text>
        </View>

        <View style={styles.textRow}>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{item.ContactPerson || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.textRow}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.deliveryContainer}>
            {deliveryDates.length > 0 ? (
              deliveryDates.map((date, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.deliveryIndexContainer,
                    idx === lastIndex
                      ? styles.latestDelivery
                      : styles.previousDelivery,
                  ]}>
                  <Text
                    style={[
                      styles.deliveryIndex,
                      idx === lastIndex ? styles.latestDeliveryIndex : {},
                    ]}>
                    {idx + 1}
                  </Text>
                  <Text style={styles.deliveryDate}>{date.trim()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.value}>N/A</Text>
            )}
          </View>
        </View>

      <Pressable
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}
        android_ripple={{color: '#B9B9B9', borderless: false}}
        onPress={() => onPressItem(item)}>
        <Text style={styles.buttonText}>See Inspection</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: scale(10),
    padding: scale(12),
    marginVertical: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: verticalScale(3)},
    shadowOpacity: 0.12,
    shadowRadius: scale(5),
    elevation: scale(4),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  index: {
    width: 35,
    height: 35,
    textAlign: 'center',
    fontSize: moderateScale(18),
    fontFamily: 'Inter_28pt-SemiBold',
    color: 'rgb(7, 84, 252)',
    backgroundColor: 'rgba(230, 234, 245, 1)',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
  },
  officeName: {
    fontSize: moderateScale(15),
    fontFamily: 'Inter_28pt-Medium',
    color: '#2C3E50',
    flex: 1, // Take the remaining space
    //marginLeft: scale(8),
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#BDC3C7',
    marginVertical: verticalScale(6),
  },
  detailsContainer: {
    marginTop: verticalScale(8),
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(2),
  },
  label: {
    fontSize: moderateScale(13),
    fontFamily: 'Inter_28pt-Light',
    color: '#1A508C',
    width: '25%',
    marginTop: verticalScale(2),
  },
  value: {
    fontSize: moderateScale(13),
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#2C3E50',
    flex: 1,
  },
  deliveryContainer: {
    flex: 1,
  },
  deliveryIndexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(2),
  },
  deliveryIndex: {
    //backgroundColor: '#D6EAF8',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: scale(4),
    marginRight: scale(6),
    fontSize: moderateScale(14),
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#2C3E50',
  },
  deliveryDate: {
    fontSize: moderateScale(14),
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#2C3E50',
  },
  // Latest Delivery Styles
  latestDelivery: {
    backgroundColor: '#EAF2F8', // Light blueish background for latest delivery container
    borderRadius: scale(4),
    padding: verticalScale(2),
  },
  latestDeliveryIndex: {
    backgroundColor: '#5DADE2', // Blueish background for latest index
    color: '#FFF', // White text for better contrast
  },
  previousDelivery: {
    backgroundColor: '#E5E7EB', // Light gray for previous deliveries
    borderRadius: scale(4),
    padding: verticalScale(2),
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: verticalScale(10),
    borderRadius: scale(4),
    padding: verticalScale(2),
    paddingVertical: verticalScale(6),
    shadowColor: '#000',
  },
  buttonText: {
    color: '#F39C12',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7, // Slight transparency effect for iOS
  },
});

export default InspectionList;
