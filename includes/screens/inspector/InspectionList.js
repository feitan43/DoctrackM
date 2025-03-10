import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export const InspectionList = ({ item, index, onPressItem }) => {
  return (
    <View style={styles.pressable} accessibilityLabel={`Inspection item ${index + 1}`}>
      <View style={styles.container}>
        <View style={styles.indexContainer}>
          <Text style={styles.index}>{index + 1}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.officeContainer}>
            <Text style={styles.officeName}>{item.OfficeName}</Text>
          </View>

          <View style={{ marginTop: verticalScale(10) }}>
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

            <View style={styles.textRow}>
              <Text style={styles.label}>Delivery Date</Text>
              <Text style={styles.value}>{item.DeliveryDate}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{item.Address || ''}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{item.ContactPerson || ''}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}> </Text>
              <Text style={styles.value}>{item.ContactNumber || ''}</Text>
            </View>

            <Pressable
              style={styles.pressableButton}
              onPress={() => onPressItem(item)}
              android_ripple={{ color: '#ccc', borderless: false }}>
              <Text style={styles.buttonText}>See Inspection</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    backgroundColor: '#fff',
    borderRadius: scale(8),
    padding: scale(10),
    marginVertical: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    elevation: scale(5),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    flexDirection: 'row',
    borderBottomColor: '#ccc',
  },
  indexContainer: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    alignItems: 'center',
  },
  index: {
    fontSize: moderateScale(16),
    textAlign: 'right',
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#007bff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: scale(2),
  },
  officeContainer: {
    borderBottomWidth: 1,
    paddingVertical: verticalScale(5),
  },
  officeName: {
    fontSize: moderateScale(15),
    fontFamily: 'Inter_28pt-Medium',
    color: '#252525',
  },
  infoContainer: {
    flex: 1,
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
    color: 'gray',
  },
  value: {
    width: '65%',
    fontSize: moderateScale(14),
    fontFamily: 'Inter_28pt-SemiBold',
    color: 'black',
    marginStart: scale(10),
  },
  pressableButton: {
    alignSelf: 'flex-end',
    padding: scale(10),
    borderRadius: scale(6),
  },
  buttonText: {
    color: 'orange',
    fontSize: moderateScale(14),
  },
});

export default InspectionList;
