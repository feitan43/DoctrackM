import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

export const InspectionList = ({item, index, onPressItem}) => {
  return (
    <View
      style={styles.pressable}
      android_ripple={{color: '#F0F4F7', borderless: false}}
      accessibilityLabel={`Inspection item ${index + 1}`}>
      <View style={styles.container}>
        <View style={styles.indexContainer}>
          <Text style={styles.index}>{index + 1}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View
            style={{
              borderBottomWidth: 1 /* borderBottomColor:'silver' */,
              paddingVertical: 5,
            }}>
            <Text style={styles.officeName}>{item.OfficeName}</Text>
          </View>

          <View style={{marginTop: 10}}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Category </Text>

              <Text style={styles.value}>
                {item.CategoryCode}
                {'\n'}
                {item.CategoryName}
              </Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Year </Text>
              <Text style={styles.value}>{item.Year}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Payment TN </Text>
              <Text style={styles.value}>{item.TrackingNumber}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>PO TN </Text>
              <Text style={styles.value}>{item.TrackingPartner}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Delivery Date </Text>
              <Text style={styles.value}>{item.DeliveryDate}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Address </Text>
              <Text style={styles.value}>{item.Address || ''}</Text>
            </View>

            <View style={styles.textRow}>
              <Text style={styles.label}>Contact </Text>
              <Text style={styles.value}>{item.ContactPerson || ''}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>{/* Contact */} </Text>
              <Text style={styles.value}>{item.ContactNumber || ''}</Text>
            </View>
            <Pressable
              style={{
                alignSelf: 'flex-end',
                padding: 10,
                borderRadius: 6, // Ensures ripple stays within bounds
              }}
              onPress={() => onPressItem(item)}
              android_ripple={{color: '#ccc', borderless: false}} // Ripple effect for Android
            >
              <Text style={{color: 'orange', }}>
                See Inspection
              </Text>
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
    borderRadius: 8, // Increased for smoother edges
    padding: 10, // More padding for better spacing
    marginVertical: 10, // Replaces marginTop & marginBottom
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15, // Slightly stronger for better visibility
    shadowRadius: 4,
    elevation: 5, // Lower elevation to match shadow
    borderWidth: 1, // Optional: Thin border for refinement
    borderColor: 'rgba(0, 0, 0, 0.1)', // Light border for subtle separation
  },

  container: {
    flexDirection: 'row',
    borderBottomColor: '#ccc',
  },
  indexContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  index: {
    fontSize: 16,
    textAlign: 'right',
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#007bff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Shadow color with opacity
    textShadowOffset: {width: 0, height: 1}, // Shadow position
    textShadowRadius: 2, // Blur effect
  },

  officeName: {
    fontSize: 15,
    fontFamily: 'Inter_28pt-Medium',
    color: '#252525',
    //backgroundColor:'rgba(194, 215, 247, 0.29)'
  },
  infoContainer: {
    flex: 1,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  label: {
    //backgroundColor:'red',
    width: '30%',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Light',
    textAlign: 'right',
    color: 'gray',
  },
  value: {
    //backgroundColor:'blue',
    width: '65%',
    fontSize: 14,
    fontFamily: 'Inter_28pt-SemiBold',
    color: 'black',
    marginStart: 10,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
});
