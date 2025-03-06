import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
//import {ScrollView} from 'react-native-gesture-handler';
import {DataTable} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {SafeAreaView} from 'react-native-safe-area-context';
import {Divider} from '@rneui/themed';
import {BASE_URL} from '@env';
import {insertCommas} from '../utils/insertComma';
import useTransactionHistory from '../api/useTransactionHistory';
import Timeline from 'react-native-timeline-flatlist';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const MyAccountabilityDetails = ({route, navigation}) => {
  const {selectedItem, selectedIcon, selectedName} = route.params;
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = event => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    setIsScrolling(contentOffsetY > 0);
  };

  function removeHtmlTags(text) {
    if (text === null || text === undefined) {
      return '';
    }

    const boldEndRegex = /<\/b>/g;
    const newText = text.replace(boldEndRegex, '</b>\n');
    const htmlRegex = /<[^>]*>/g;
    return newText.replace(htmlRegex, ' ');
  }
  const [modalVisible, setModalVisible] = useState(false);

  const renderContent = () => {
    return (
      <ScrollView
        contentContainerStyle={{
          marginTop: 10,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <View style={{marginHorizontal: 20, marginVertical: 10}}>
          <Text style={styles.itemLabel}>TN</Text>
          <View style={{flexDirection: 'row', paddingBottom: 10}}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_28pt-Bold',
                color: 'rgb(70, 72, 75)',
              }}>
              {selectedItem.Year} - {selectedItem.TrackingNumber}
            </Text>
          </View>

          <View style={{marginBottom: 10}}>
            <Text style={styles.itemLabel}>Item</Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_28pt-Regular',
                color: '#252525',
              }}>
              {selectedItem.Item}
            </Text>
          </View>

          <View style={{marginBottom: 10}}>
            <Text style={styles.itemLabel}>Brand</Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_28pt-Regular',
                color: '#252525',
              }}>
              {selectedItem.Brand}
            </Text>
          </View>

          <Text style={styles.itemLabel}>Status</Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_28pt-Regular',
              color: '#252525',
            }}>
            {selectedItem.Status}
          </Text>
          {/* <Text style={{ fontSize: 12 }}>{selectedItem.DateModified}</Text> */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 10,
            }}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.itemLabel}>Unit Cost</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {insertCommas(selectedItem.UnitCost)}
              </Text>
            </View>

            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={styles.itemLabel}>Amount</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {insertCommas(selectedItem.Amount)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 10,
            }}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.itemLabel}>Qty</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.Qty}
              </Text>
            </View>

            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={styles.itemLabel}>Unit</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.Unit}
              </Text>
            </View>
          </View>

          {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 10,
          }}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={{fontSize: 12, fontWeight: 'bold', color: '#00a5ff'}}>
              Item Id
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: 'rgb(70, 72, 75)',
              }}>
              {selectedItem.ItemId}
            </Text>
          </View>

          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={{fontSize: 12, fontWeight: 'bold', color: '#00a5ff'}}>
              Item Classification
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: 'rgb(70, 72, 75)',
              }}>
              {selectedItem.ItemClassification}
            </Text>
          </View>
        </View> */}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 10,
            }}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.itemLabel}>Serial Number</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.SerialNumber}
              </Text>
            </View>

            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={styles.itemLabel}>Model Number</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.ModelNumber}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 10,
            }}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.itemLabel}>Property Number</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.PropertyNumber}
              </Text>
            </View>

            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={styles.itemLabel}>Sticker Number</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.StickerNumber}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            height: 0.5,
            borderWidth: 0.5,
            marginVertical: 10,
            borderColor: 'rgb(214, 215, 216)',
          }}
        />

        <View style={{marginVertical: 15, paddingHorizontal: 20}}>
          <Text style={styles.itemLabel}>Description</Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_28pt-Regular',
              color: '#252525',
            }}>
            {selectedItem.Description}
          </Text>
        </View>

        <View
          style={{
            height: 0.5,
            borderWidth: 0.5,
            marginVertical: 10,
            borderColor: 'rgb(214, 215, 216)',
          }}
        />

        <View style={{marginVertical: 10, paddingHorizontal: 20}}>
          <Text style={styles.itemLabel}>Current User</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start', // Align items at the top of the row
              marginVertical: 10,
            }}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.CurrentUserNum} - {selectedItem.CurrentUser}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter_28pt-Regular',
                  color: '#252525',
                }}>
                {selectedItem.CurrentUserPos}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            height: 0.5,
            borderWidth: 0.5,
            marginVertical: 10,
            borderColor: 'rgb(214, 215, 216)',
          }}
        />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <View
          style={{
            //flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#004ab1',
            paddingBottom: 5,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 3,
            //elevation: 3,
            paddingTop:35,
          }}>
          <Pressable
            style={({pressed}) => [
              pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
              {
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                marginStart: 10,
                padding: 10,
                borderRadius: 24,
              },
            ]}
            android_ripple={{
              color: '#F6F6F6',
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </Pressable>

          <View
            style={
              {
                /* marginBottom: 10 */
              }
            }>
            <Icons
              name={selectedIcon}
              size={40}
              color="white"
              style={{alignSelf: 'center'}}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white',
              }}>
              {selectedName}
            </Text>
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          onScroll={handleScroll} // Track scroll position
          scrollEventThrottle={16} // Throttle scroll events for performance
        >
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Abel-Regular',
    lineHeight: 22,
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    margin: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingBottom: 10,
    paddingStart: 20,
  },
  label: {
    width: 70,
    paddingStart: 15,
    color: 'silver',
    fontSize: 11,
    fontFamily: 'Oswald-ExtraLight',
  },
  labelValue: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
    textTransform: 'uppercase',
  },
  showMore: {
    backgroundColor: '#252525',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    paddingVertical: 5,
    margin: 10,
  },
  showMoreText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Abel-Regular',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'black',
    paddingVertical: 5,
  },
  textLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00a5ff',
  },
  cardInfo: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    marginVertical: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_28pt-ExtraLight',
    flex: 0.3, // Label takes 30% width,
    textAlign: 'right',
  },
  cardValue: {
    paddingStart: 10,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_28pt-Regular',
    flex: 0.7,
  },
  itemLabel: {
    fontSize: 12,
    fontFamily: 'Inter_28pt-SemiBold',
    color: 'rgb(79, 151, 252)',
  },
});

export default MyAccountabilityDetails;
