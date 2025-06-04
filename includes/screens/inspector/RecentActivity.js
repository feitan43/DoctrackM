// RecentActivity.js
import React, {useState, useMemo} from 'react'; // Import useState
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

const RecentActivity = ({
  recentActivityData,
  recentActivityError,
  recentActivityLoading,
  navigation,
}) => {
  const [currentPage, setCurrentPage] = useState(1); // Use useState for currentPage
  const itemsPerPage = 5;

  const filteredData = useMemo(() => {
    if (!Array.isArray(recentActivityData)) return [];

    return recentActivityData.filter(
      item =>
        (item.Status &&
          (item.Status.toLowerCase() === 'inspected' ||
            item.Status.toLowerCase() === 'inspection on hold')) ||
        item.DateInspected !== null,
    );
  }, [recentActivityData]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage; // Use currentPage
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]); // Add currentPage to dependency array

  const nextPage = () => {
    if (currentPage * itemsPerPage < filteredData.length) {
      setCurrentPage(prevPage => prevPage + 1); // Update state with setCurrentPage
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1); // Update state with setCurrentPage
    }
  };

  const onPressItem = item => {
    navigation.navigate('InspectionDetails', {item});
  };

  return (
    <View
      style={{
        padding: 10,
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 1,
      }}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Inter_28pt-Bold',
              color: '#252525',
              fontSize: 15,
            }}>
            Recent Activity
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={prevPage}
              disabled={currentPage === 1}>
              <Icon
                name="chevron-back"
                size={24}
                color={currentPage === 1 ? '#eee' : 'black'}
              />
            </TouchableOpacity>
            <Text
              style={{
                marginHorizontal: 20,
                fontSize: 14,
                color: 'gray',
              }}>{`${currentPage}`}</Text>
            <TouchableOpacity
              onPress={nextPage}
              disabled={currentPage * itemsPerPage >= filteredData.length}>
              <Icon
                name="chevron-forward"
                size={24}
                color={
                  currentPage * itemsPerPage >= filteredData.length
                    ? '#eee'
                    : 'black'
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {recentActivityLoading ? (
        <ActivityIndicator
          size="large"
          color="gray"
          style={{marginVertical: 10}}
        />
      ) : recentActivityError ? (
        <View
          style={{
            marginTop: 10,
            marginHorizontal: 10,
            marginBottom: 5,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'rgba(255, 0, 0, 0.1)', // Red background for error
            padding: 10,
          }}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Inter_18pt-Regular',
              fontSize: 14,
              textAlign: 'center',
            }}>
            Something went wrong. Please try again.
          </Text>
        </View>
      ) : (
        <View
          style={{
            marginBottom: 5,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            marginHorizontal: 5,
          }}>
          {!recentActivityData || recentActivityData.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                padding: 10,
                backgroundColor: 'rgb(243, 243, 243)',
                marginHorizontal: 5,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_18pt-Regular',
                  color: 'silver',
                  fontSize: 12,
                }}>
                No results found
              </Text>
            </View>
          ) : (
            paginatedData.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => onPressItem(item)}
                style={({pressed}) => [
                  {
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    backgroundColor: pressed
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(192, 192, 192, 0.05)',
                  },
                ]}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
                <View
                  style={{flexDirection: 'row', marginVertical: 10, gap: -5}}>
                  <View
                    style={{
                      width: '30%',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 10,
                    }}>
                    <InspectionImage
                      year={item?.Year}
                      trackingNumber={item?.TrackingNumber}
                    />
                  </View>

                  <View style={{gap: 0, width: '70%'}}>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-SemiBold',
                        fontSize: 12,
                        color: '#252525',
                        width: '90%',
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.OfficeName}
                    </Text>

                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-Regular',
                        fontSize: 12,
                        color: '#252525',
                      }}>
                      {item.CategoryCode}
                      {' - '}
                      <Text
                        style={{
                          fontFamily: 'Inter_28pt-Regular',
                          fontSize: 10,
                          color: '#252525',
                        }}>
                        {item.CategoryName}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_28pt-Regular',
                        fontSize: 12,
                        color: 'white',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter_28pt-Regular',
                          fontSize: 12,
                          color: '#252525',
                        }}>
                        {item.TrackingNumber}
                      </Text>
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default RecentActivity;