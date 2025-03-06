import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {insertCommas} from '../utils/insertComma';

const {width, height} = Dimensions.get('window');

const EvaluationList = ({
  item,
  index,
  onPressItem,
  handleEvaluated,
  handleRevert,
}) => (
  <View style={styles.card}>
    {item.TrackingType === 'PX' ? (
      <View>
      <View style={{backgroundColor: '#F5F7FA', borderRadius: 5}}>
          <View style={styles.cardInfo}>
            <View
              style={{
                width: 30,
                height: 25,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter_28pt-Bold',
                  color: 'rgb(7, 84, 252)',
                  textAlign: 'center',
                }}>
                {index + 1}
              </Text>
            </View>
            <Text style={[styles.cardLabel, {flex: 0.24, fontSize: 16}]}>
              TN
            </Text>
            <Text style={[styles.cardValue, {flex: 0.8, fontSize: 16}]}>
              {item.Year} - {item.TrackingNumber}
            </Text>
          </View>
          </View>

          <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Office</Text>
          <Text style={styles.cardValue}>{item.OfficeName}</Text>
        </View>
      {/*   <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>TT</Text>
          <Text style={styles.cardValue}>{item.TrackingType}</Text>
        </View> */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Supplier</Text>
          <Text style={styles.cardValue}>{item.Claimant}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>ADV</Text>
          <Text style={styles.cardValue}>{item.ADV1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>OBR Number</Text>
          <Text style={styles.cardValue}>{item.OBR_Number}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>PR Sched</Text>
          <Text style={styles.cardValue}>{item.PeriodMonth}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Fund</Text>
          <Text style={styles.cardValue}>{item.Fund}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Check Number</Text>
          <Text style={styles.cardValue}>{item.checknumber}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Check Date</Text>
          <Text style={styles.cardValue}>{item.checkdate}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>NetAmount</Text>
          <Text style={styles.cardValue}>
            {insertCommas(item.NetAmount || '')}
          </Text>
        </View>
        </View>
    ) : (
      <>
        <View style={{backgroundColor: '#F5F7FA', borderRadius: 5}}>
          <View style={styles.cardInfo}>
            <View
              style={{
                width: 30,
                height: 25,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter_28pt-Bold',
                  color: 'rgb(7, 84, 252)',
                  textAlign: 'center',
                }}>
                {index + 1}
              </Text>
            </View>
            <Text style={[styles.cardLabel, {flex: 0.24, fontSize: 16}]}>
              TN
            </Text>
            <Text style={[styles.cardValue, {flex: 0.8, fontSize: 16}]}>
              {item.Year} - {item.TrackingNumber}
            </Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Office</Text>
          <Text style={styles.cardValue}>{item.OfficeName}</Text>
        </View>
       {/*  <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>TT</Text>
          <Text style={styles.cardValue}>{item.TrackingType}</Text>
        </View> */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Claimant</Text>
          <Text style={styles.cardValue}>{item.Claimant}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Document</Text>
          <Text style={styles.cardValue}>{item.DocumentType}</Text>
        </View>
      {/*   <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Ctrl Number</Text>
          <Text style={styles.cardValue}>{item.ADV1}</Text>
        </View> */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>ADV</Text>
          <Text style={styles.cardValue}>{item.ADV1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>OBR Number</Text>
          <Text style={styles.cardValue}>{item.OBR_Number}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Document</Text>
          <Text style={styles.cardValue}>{item.DocumentType}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Period</Text>
          <Text style={styles.cardValue}>{item.PeriodMonth}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Claim Type</Text>
          <Text style={styles.cardValue}>{item.ClaimType}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Fund</Text>
          <Text style={styles.cardValue}>{item.Fund}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Check Number</Text>
          <Text style={styles.cardValue}>{item.checknumber}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Check Date</Text>
          <Text style={styles.cardValue}>{item.checkdate}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>NetAmount</Text>
          <Text style={styles.cardValue}>
            {insertCommas(item.NetAmount || '')}
          </Text>
        </View>
      </>
    )}

    <TouchableOpacity
      style={{alignSelf: 'flex-end', paddingVertical: 10}}
      onPress={() => onPressItem(index, item)}>
      <Text style={{color: 'orange'}}>See Details</Text>
    </TouchableOpacity>
    {item.Status === 'CAO Received' ||
      (item.Status === 'On Evaluation - Accounting' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={() => handleEvaluated(item)}>
            <Text style={styles.evaluateText}>Evaluated</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pendingButton}
            onPress={() => handleEvaluated(item)}>
            <Text style={styles.buttonText}>Pending</Text>
          </TouchableOpacity>
        </View>
      ))}
    {item.Status === 'Evaluated - Accounting' && (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.revertButton}
          onPress={() => handleRevert(item)}>
          <Text style={styles.revertText}>Revert</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'silver',
    borderRightWidth: 1,
    borderRightColor: 'silver',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A508C',
    marginBottom: 6,
  },
  cardInfo: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    marginVertical: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontFamily: 'Inter_28pt-ExtraLight',
    flex: 0.3, // Label takes 30% width,
    textAlign: 'right',
    //backgroundColor:'red'
  },
  cardValue: {
    paddingStart: 10,
    fontSize: 14,
    color: '#252525',
    fontFamily: 'Inter_28pt-SemiBold',
    flex: 0.7,
    //backgroundColor:'blue'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  evaluateButton: {
    flex: 1,
    backgroundColor: 'rgb(80, 161, 247)',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    borderBottomWidth: 2,
    borderColor: 'silver',
    borderRightWidth: 2,
    borderRightColor: 'silver',
  },
  revertButton: {
    flex: 1,
    backgroundColor: '#E6EDF1',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    borderBottomWidth: 2,
    borderColor: 'silver',
    borderRightWidth: 2,
    borderRightColor: 'silver',
  },

  pendingButton: {
    flex: 1,
    backgroundColor: 'rgb(255, 109, 73)',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
    borderBottomWidth: 2,
    borderColor: 'silver',
    borderRightWidth: 2,
    borderRightColor: 'silver',
  },
  evaluateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  revertText: {
    color: '#252525',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    //color: '#252525',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanButton: {},
  scannerContainer: {flex: 1},
  camera: {flex: 1},
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  closeText: {color: '#fff', fontSize: 16},
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: 'white',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 10,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 10,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  noCameraText: {
    color: 'white',
    fontSize: 18,
  },
  dropdown: {
    width: 80,
    height: 40,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent background to indicate loading
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchButton: {
    backgroundColor: '#2196F3', // Change to your preferred color
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EvaluationList;
