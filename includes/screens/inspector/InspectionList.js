import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

export const InspectionList = ({item, index, onPressItem}) => {
  return (
    <View
      style={styles.card}
      accessibilityLabel={`Inspection item ${index + 1}`}>
      <View style={styles.container}>
        <View style={styles.indexContainer}>
          <Text style={styles.index}>{index + 1}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.officeContainer}>
            <Text style={styles.officeName}>{item.OfficeName}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>
                {item.CategoryCode}
                {'\n'}
                {item.CategoryName}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Year</Text>
              <Text style={styles.value}>{item.Year}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Payment TN</Text>
              <Text style={styles.value}>{item.TrackingNumber}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>PO TN</Text>
              <Text style={styles.value}>{item.TrackingPartner}</Text>
            </View>

            
            {/* <View style={styles.textRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{item.DeliveryDate}</Text>
            </View> */}

            <View style={styles.textRow}>
              <Text style={styles.label}>Delivery</Text>
              <View>
                {item.DeliveryDatesHistory ? (
                  item.DeliveryDatesHistory.split(', ').map(
                    (date, idx, arr) => (
                      <View key={idx} style={styles.deliveryDateRow}>
                        <Text
                          style={[
                            styles.deliveryIndex,
                            {
                              backgroundColor:
                                idx === arr.length - 1 ? '#5FA8D3' : '#BDC3C7',
                            },
                          ]}>
                          {idx + 1}
                        </Text>
                        <Text style={styles.value}>{date}</Text>
                      </View>
                    ),
                  )
                ) : (
                  <Text style={styles.value}>N/A</Text>
                )}
              </View>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{item.Address || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{item.ContactPerson || 'N/A'}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}> </Text>
              <Text style={styles.value}>{item.ContactNumber || 'N/A'}</Text>
            </View>

            <Pressable
              style={styles.button}
              onPress={() => onPressItem(item)}
              android_ripple={{color: '#ddd', borderless: false}}>
              <Text style={styles.buttonText}>See Inspection</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FA',
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
  },
  container: {
    flexDirection: 'row',
  },
  indexContainer: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    alignItems: 'center',
  },
  index: {
    fontSize: moderateScale(18),
    textAlign: 'right',
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#3498DB',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: verticalScale(1)},
    textShadowRadius: scale(3),
  },
  officeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2E5',
    paddingVertical: verticalScale(6),
  },
  officeName: {
    fontSize: moderateScale(16),
    fontFamily: 'Inter_28pt-Medium',
    color: '#333',
  },
  infoContainer: {
    flex: 1,
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
    width: '30%',
    fontSize: moderateScale(14),
    fontFamily: 'Inter_28pt-Light',
    textAlign: 'right',
    color: '#6C757D',
  },
  value: {
    width: '65%',
    fontSize: moderateScale(14),
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#2C3E50',
    marginStart: scale(10),
  },
  deliveryDateRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  deliveryIndex: {
    marginStart: 10,
    paddingHorizontal: 10,
    color: 'white',
    borderRadius: scale(4),
    //marginRight: scale(8),
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    alignSelf: 'flex-end',
    padding: scale(10),
    borderRadius: scale(6),
    //backgroundColor: '#F39C12',
    marginTop: verticalScale(10),
  },
  buttonText: {
    color: '#F39C12',
    fontSize: moderateScale(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InspectionList;
