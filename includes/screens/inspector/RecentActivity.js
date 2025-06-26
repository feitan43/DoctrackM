import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import InspectionImage from './InspectionImage';
import { officeMap } from '../../utils/officeMap';

const RecentActivity = ({
  recentActivityData,
  recentActivityError,
  recentActivityLoading,
  navigation,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  function parseCustomDateTime(dateTimeStr) {
    if (!dateTimeStr) return null;

    const [datePart, timePart, meridian] = dateTimeStr.split(/[\s]+/);
    if (!datePart || !timePart || !meridian) return null;

    const [year, month, day] = datePart.split('-').map(Number);
    let [hour, minute] = timePart.split(':').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  }

  const filteredData = useMemo(() => {
  if (!Array.isArray(recentActivityData)) return [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return recentActivityData
    .filter(item => {
      const date = parseCustomDateTime(item.DateInspected);

      const isInspectedOrOnHold =
        item.Status &&
        (item.Status.toLowerCase() === 'inspected' ||
          item.Status.toLowerCase() === 'inspection on hold');

      const isDateInThisMonth =
        date &&
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth;

      return (isInspectedOrOnHold || item.DateInspected !== null) && isDateInThisMonth;
    })
    .sort((a, b) => {
      const dateA = parseCustomDateTime(a.DateInspected);
      const dateB = parseCustomDateTime(b.DateInspected);
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });
}, [recentActivityData]);


  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const nextPage = () => {
    if (currentPage * itemsPerPage < filteredData.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const onPressItem = item => {
    navigation.navigate('InspectionDetails', { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Recent Activity</Text>
        <View style={styles.pagination}>
          <TouchableOpacity onPress={prevPage} disabled={currentPage === 1}>
            <Icon name="chevron-back" size={24} color={currentPage === 1 ? '#eee' : 'black'} />
          </TouchableOpacity>
          <Text style={styles.pageNumber}>{`${currentPage}`}</Text>
          <TouchableOpacity
            onPress={nextPage}
            disabled={currentPage * itemsPerPage >= filteredData.length}>
            <Icon
              name="chevron-forward"
              size={24}
              color={
                currentPage * itemsPerPage >= filteredData.length ? '#eee' : 'black'
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {recentActivityLoading ? (
        <ActivityIndicator size="large" color="gray" style={{ marginVertical: 10 }} />
      ) : recentActivityError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {paginatedData.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => onPressItem(item)}
              style={({ pressed }) => [
                styles.itemBox,
                { backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'white' },
              ]}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}>
              <View style={styles.row}>
                <View style={styles.imageWrapper}>
                  <InspectionImage
                    year={item?.Year}
                    trackingNumber={item?.TrackingNumber}
                  />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.officeText} numberOfLines={1}>
                    {officeMap[item.Office]}
                  </Text>
                  <Text style={styles.categoryText}>
                    {item.CategoryCode} -{' '}
                    <Text style={styles.categoryName}>{item.CategoryName}</Text>
                  </Text>
                  <Text style={styles.trackingText}>
                    {item.Year} | {item.TrackingNumber}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentActivity;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Inter_28pt-Bold',
    color: '#5d5d5d',
    fontSize: 18,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumber: {
    marginHorizontal: 20,
    fontSize: 14,
    color: 'gray',
  },
  errorBox: {
    marginTop: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    color: 'white',
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgb(243, 243, 243)',
    marginHorizontal: 5,
  },
  emptyText: {
    fontFamily: 'Inter_18pt-Regular',
    color: 'silver',
    fontSize: 12,
  },
  listContainer: {
    marginBottom: 5,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  itemBox: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
  },
  imageWrapper: {
    width: '30%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  textWrapper: {
    width: '70%',
    gap: 0,
  },
  officeText: {
    fontFamily: 'Inter_28pt-SemiBold',
    fontSize: 12,
    color: '#252525',
    width: '90%',
  },
  categoryText: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 12,
    color: '#252525',
  },
  categoryName: {
    fontSize: 10,
    color: '#252525',
  },
  trackingText: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 12,
    color: '#252525',
  },
});
