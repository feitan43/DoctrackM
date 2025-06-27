import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet'; // Import BottomSheetScrollView
import {officeMap} from '../utils/officeMap';

const groupByInspector = data => {
  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.Inspector]) {
      grouped[item.Inspector] = [];
    }
    grouped[item.Inspector].push(item);
  });
  return Object.entries(grouped).map(([inspector, inspections]) => ({
    inspector,
    inspections,
  }));
};

const fixEncoding = text => {
  return String(text || '').replace(/�/g, 'Ñ');
};

const InspectorsList = ({scheduleData}) => {
  const groupedData = groupByInspector(scheduleData);
  const [expandedInspectors, setExpandedInspectors] = useState({});

  const toggleInspectorDetails = inspectorName => {
    setExpandedInspectors(prev => ({
      ...prev,
      [inspectorName]: !prev[inspectorName],
    }));
  };

  const renderGroup = item => (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        onPress={() => toggleInspectorDetails(item.inspector)}
        style={styles.inspectorHeader}>
        <Text style={styles.inspectorName}>{fixEncoding(item.inspector)}</Text>
        <Text style={styles.toggleIcon}>
          {expandedInspectors[item.inspector] ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      {expandedInspectors[item.inspector] && (
        <View style={styles.inspectionsWrapper}>
          {item.inspections.map((schedule, index) => (
            <View key={index} style={styles.inspectionItem}>
              <View style={{flexDirection: 'row'}}>
                <Text style={[styles.detailBold, {textAlign:'right'}]}>{index + 1} </Text>
              </View>

              <Text style={styles.detailValue}>
                {schedule.Year} -{' '}
                {schedule.TrackingNumber || schedule.RefTrackingNumber || 'N/A'}
                {'\n'}
                {officeMap[schedule.Office]}
                {'\n'}
                {'\n'}
                {schedule.DeliveryDate}
              </Text>

            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <BottomSheetScrollView
      contentContainerStyle={styles.listContentContainer} 
    >
      {groupedData.map((item, index) => (
        <View key={index}>{renderGroup(item)}</View>
      ))}
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    // This style is applied to the content INSIDE the scroll view
    padding: 15,
    backgroundColor: '#F5F7FA', // Apply background to the content area
  },
  groupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#E0E8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#D0D8E0',
  },
  inspectorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  toggleIcon: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  inspectionsWrapper: {
    padding: 20,
    paddingTop: 10,
  },
  inspectionItem: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderRadius: 6,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E7EEF5',
  },
  detailBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#556C80',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
    marginStart: 10,
  },
});

export default InspectorsList;
