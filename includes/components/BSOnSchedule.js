import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOfficeMap } from '../hooks/useGeneral';

const BSOnSchedule = ({ item, index, handleAssignInspector }) => {
  const { data: officeMap, isLoading, error } = useOfficeMap();
  const navigation = useNavigation();

  const fixEncoding = (text) => {
    return String(text || '').replace(/�/g, 'Ñ');
  };

  


  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <Text style={styles.trackingNumberText}>
          <Text style={styles.trackingNumberYear}>{item.Year} </Text>
          <Text style={styles.separator}>| </Text>
          {item.TrackingNumber || item.RefTrackingNumber}
          {'\n'}
          <Text style={{ fontSize: 12, color: 'gray', fontWeight: '400' }}>
            {officeMap?.[item.Office] ?? 'Unknown Office'}
          </Text>
        </Text>
      </View>

      {/* Inspection Details Section */}
      <View style={styles.detailsSection}>
        <DetailRow label="Delivery Date" value={item.DeliveryDate} />
        <DetailRow label="Inspector" value={fixEncoding(item.Inspector)} />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.changeInspectorButton}
          onPress={() => handleAssignInspector(item.Id, item.TrackingNumber)}
        >
          <Icon
            name="person-add-outline"
            size={18}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Reassign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('InspectionDetails', { item })}
        >
          <Icon
            name="information-circle-outline"
            size={18}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper component for consistent detail rows
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  indexCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  indexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0754FC',
  },
  trackingNumberText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  trackingNumberYear: {
    color: '#555',
    fontWeight: '500',
  },
  separator: {
    fontSize: 20,
    color: '#007bff',
    marginHorizontal: 5,
  },
  detailsSection: {},
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 0.35,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 0.65,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 10,
  },
  changeInspectorButton: {
    flex: 1,
    backgroundColor: '#ff8400',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  buttonIcon: {
    marginRight: 5,
  },
});

export default BSOnSchedule;
