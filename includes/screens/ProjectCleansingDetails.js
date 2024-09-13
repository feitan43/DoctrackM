import React, {useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Pressable,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import useProjectCleansingDetails from '../api/ProjectCleansing/useProjectCleansingDetails';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const insertCommas = value => {
  if (value === null) {
    return '';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const RenderProjectCleansing = memo(({item, index, onPressItem, onInspect}) => {
  /*   const modifiedDate = item.DateModified.split(' ')[0];
  const isDateMatched = modifiedDate === formattedDate;
  const dateTextColor = isDateMatched ? 'rgba(6, 70, 175, 1)' : 'gray'; */

  return (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginHorizontal: 10,
        marginTop: 10,
      }}>
      <View style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', paddingBottom: 10}}>
        <View style={{flexDirection: 'row'}}>
          <View>
            <Text
              style={{
                //backgroundColor: dateTextColor,
                backgroundColor: 'rgba(6, 70, 175, 1)',
                paddingHorizontal: 15,
                fontFamily: 'Oswald-SemiBold',
                fontSize: 15,
                color: 'white',
                textAlign: 'center',
              }}>
              {index + 1}
            </Text>
          </View>
          <View style={{flex: 1, paddingStart: 10}}>
            <LinearGradient
              colors={['transparent', '#252525']}
              start={{x: 0, y: 0}}
              end={{x: 3, y: 0}}
              style={{elevation: 1}}>
              <TouchableOpacity onPress={() => onPressItem(index, item)}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                  }}>
                  {item.Id}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
            <View style={{marginVertical: 5}}>
              <View style={{rowGap: -5}}>
                <Text
                  style={{
                    /* color: item.Status.includes('Pending')
                      ? 'rgba(250, 135, 0, 1)'
                      : 'rgba(252, 191, 27, 1)', */
                    color: 'rgba(252, 191, 27, 1)',
                    fontFamily: 'Oswald-Regular',
                    fontSize: 18,
                    textShadowRadius: 1,
                    elevation: 1,
                    textShadowOffset: {width: 1, height: 2},
                  }}>
                  {item.BarangayName}
                </Text>
                {/* <Text
                  style={{
                    color: 'silver',
                    fontFamily: 'Oswald-Light',
                    fontSize: 12,
                  }}>
                  {item.Fund}
                </Text> */}
              </View>
              {/*   <Text
                style={{
                  color: 'white',
                  fontFamily: 'Oswald-Light',
                  fontSize: 12,
                  marginTop: 5,
                }}>
                {item.BarangayName}
              </Text> */}
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Oswald-Light',
                  fontSize: 12,
                }}>
                {item.AccountTitle}
              </Text>
              {/*  <Text
                style={{
                  color: 'white',
                  fontFamily: 'Oswald-Light',
                  fontSize: 12,
                }}>
                {(item.Description)}
              </Text> */}
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Oswald-Light',
                  fontSize: 12,
                }}>
                {insertCommas(item.AcquisitionCost)}
              </Text>

              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                {/*               <Button
                  title="Close"
                  onPress={() => setIsModalVisible(false)}
                /> */}


                <Button title="Inspect" onPress={() => onInspect(item)} />

                {/*   <View style={{}}>
                <Text style={{backgroundColor:'white',textAlign:'center', alignItems:'center'}}>
                  GSO Inspected
                </Text>

                </View> */}
              </View>
            </View>
          </View>
          <View>
            <Text
              style={{
                backgroundColor: 'rgba(37, 37, 37, 0.4)',
                paddingHorizontal: 10,
                fontFamily: 'Oswald-Regular',
                color: 'white',
                fontSize: 16,
                textAlign: 'center',
              }}>
              {item.Fund}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const ProjectCleansingDetails = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Use useNavigation to get the navigation object
  const {barangay, title, office, status, inspected, fund} = route.params || {};
  const {projectCleansingDetails, loading, error} = useProjectCleansingDetails({
    barangay,
    title,
    office,
    status,
    inspected,
    fund,
  });
  const [visibleItems, setVisibleItems] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const onPressItem = useCallback(
    (index, item) => {
      navigation.navigate('ProjectCleansingFullDetails', {item}); // Navigate and pass item details
    },
    [navigation],
  );

  const onInspect = item => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const loadMore = () => {
    if (!isLoadingMore && projectCleansingDetails.length > visibleItems) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
        setIsLoadingMore(false);
      }, 2000);
    }
  };

  /*   const calculateTotalAcquisitionCost = () => {
    return projectCleansingDetails.reduce((sum, item) => sum + (parseFloat(item.AcquisitionCost) || 0), 0);
  };
 */

  const handleScroll = ({nativeEvent}) => {
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMore();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color="white"
          style={{justifyContent: 'center', alignContent: 'center'}}
        />
      );
    } else if (projectCleansingDetails.length === 0) {
      return (
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            marginHorizontal: 10,
          }}>
          <Text
            style={{
              alignSelf: 'center',
              color: 'white',
              fontFamily: 'Oswald-Regular',
              fontSize: 16,
              padding: 10,
            }}>
            NO RESULTS FOUND
          </Text>
          {/*  <Text style={{ alignSelf: 'center', letterSpacing: 1 }}>
            There's no data at this moment!
          </Text> */}
        </View>
      );
    } else {
      return (
        <>
          <FlatList
            data={projectCleansingDetails.slice(0, visibleItems)}
            renderItem={({item, index}) => (
              <RenderProjectCleansing
                item={item}
                index={index}
                onPressItem={onPressItem}
                onInspect={onInspect} // Pass the onInspect function as a prop
              />
            )}
            /*   refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          } */
            keyExtractor={(item, index) =>
              item && item.Id ? item.Id.toString() : index.toString()
            }
            style={styles.transactionList}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            onScroll={handleScroll}
            ListEmptyComponent={() => <Text>No results found</Text>}
            ListFooterComponent={() =>
              loading ? <ActivityIndicator color="white" /> : null
            }
          />

          {loading && (
            <ActivityIndicator
              size="large"
              color="white"
              style={{justifyContent: 'center', alignContent: 'center'}}
            />
          )}
        </>
        /*  <ScrollView
          contentContainerStyle={styles.scrollViewContentContainer}
          style={styles.scrollView}
        >
          {projectCleansingDetails.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <Text style={styles.detailText}>
                <Text style={styles.bold}>{detail.Id}</Text> -
                <Text style={styles.bold}> {detail.TrackingNumber}</Text> -
                <Text style={styles.italic}> {detail.Fund}</Text> -
                <Text> {detail.BarangayName}</Text> -
                <Text style={styles.italic}> {detail.AccountTitle}</Text> -
                <Text> {detail.Description}</Text> -
                <Text> {detail.AcquisitionCost}</Text>
              </Text>
            </View>
          ))}
        </ScrollView> */
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/docmobileBG.png')}
      style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              position: 'relative',
              paddingTop: 20,
            }}>
            <View
              style={{
                position: 'absolute',
                left: 10,
                borderRadius: 999,
                overflow: 'hidden',
              }}>
              <Pressable
                style={({pressed}) => [
                  pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                  {
                    backgroundColor: 'transparent',
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
                android_ripple={{color: 'gray'}}
                onPress={() => {
                  navigation.goBack(); // Use navigation from useNavigation
                }}>
                <Icon name="chevron-back-outline" size={26} color="white" />
              </Pressable>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontFamily: 'Oswald-Medium',
                  lineHeight: 22,
                }}>
                Inventory Lists
              </Text>
            </View>
          </View>
          <View style={{height: '100%', paddingBottom: 55}}>
            {renderContent()}
          </View>
        </View>
        {/*  <View style={{ height: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontFamily: 'Oswald-Light' }}>
            Total Acquisition Cost: <Text style={{fontSize: 16, fontFamily: 'Oswald-Regular'}}>{insertCommas(calculateTotalAcquisitionCost())}</Text>
          </Text>
        </View> */}

        {/* Modal for Inspect */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Upload Inspection Files for {selectedItem?.Id}
              </Text>
              {/* Add your file upload component or logic here */}
              <Button title="Close" onPress={() => setIsModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});

export default ProjectCleansingDetails;
