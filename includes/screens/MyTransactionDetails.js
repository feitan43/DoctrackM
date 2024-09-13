import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  StatusBar,
} from 'react-native';
//import {ScrollView} from 'react-native-gesture-handler';
import {useTheme, DataTable} from 'react-native-paper';
import RadialGradient from 'react-native-radial-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseUrl from '../../config';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Divider} from '@rneui/themed';

const MyTransactionDetails = ({route, navigation}) => {
  //const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState(route.params.selectedItem);
  const [showMore, setShowMore] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState();
  const [isLoading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  function insertCommas(value) {
    if (value === null) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  //FETCHING TRANSACTION HISTORY
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);

        const apiUrl = `${baseUrl}/transactionHistory?TrackingNumber=${selectedItem.TrackingNumber}&Year=${selectedItem.Year}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactionHistory(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error in TransactionHistory:', error);
        //setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [selectedItem]);

  const data = [
    ['01/04/2024', 'Pending', '80%'],
    ['02/04/2024', 'Completed', '100%'],
    ['03/04/2024', 'In Progress', '60%'],
    ['04/04/2024', 'Pending', '90%'],
  ];

  // Headers for the table
  const headers = ['Date', 'Status', 'Completion'];

  useEffect(() => {
    // Update selected item when route params change
    setSelectedItem(route.params.selectedItem);
  }, [route.params.selectedItem]);

  // Calculate the width of the index column based on the maximum length of the index values
  const getIndexColumnWidth = () => {
    const maxIndexLength = data.length.toString().length;
    // Adjust this multiplier according to your font size and style
    return maxIndexLength * 10; // You may adjust the multiplier based on your requirements
  };

  function removeHtmlTags(text) {
    // Regular expression to match closing </b> tags
    const boldEndRegex = /<\/b>/g;
    // Replace closing </b> tags with a newline character followed by the tag
    const newText = text.replace(boldEndRegex, '\n$&');
    // Regular expression to match all other HTML tags
    const htmlRegex = /<[^>]*>/g;
    // Replace remaining HTML tags with a space
    return newText.replace(htmlRegex, ' ');
  }

  

  const renderContent = () => {};

  return (
    <ImageBackground
      source={require('../../assets/images/docmobileBG.png')}
      style={{flex: 1}}>
      {/* <StatusBar
        backgroundColor={'rgba(20, 16, 25, 0.2)'}
        barStyle={'light-content'}
      /> */}
      <View style={styles.container}>
        <SafeAreaView style={{flex: 1}}>
          <View
            style={{
              //backgroundColor: 'rgba(20, 16, 25, 0.2)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              position: 'relative',
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
                onPress={() => navigation.goBack()}>
                <Icon name="chevron-back-outline" size={26} color="white" />
              </Pressable>
            </View>
            <View style={{alignItems: 'center', rowGap: -5}}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontFamily: 'Oswald-Medium',
                  lineHeight: 22,
                }}>
                {selectedItem.TrackingNumber}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Oswald-Regular',
                  color: '#FFFFFF',
                }}>
                Tracking Number
              </Text>
            </View>
          </View>
          <ScrollView>
            <View style={styles.detailsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {/* <Icon
                  name={'information-circle-outline'}
                  size={28}
                  color={'rgba(132, 218, 92, 1)'}
                /> */}
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                  }}>
                  GENERAL INFORMATION
                </Text>
              </View>
              <View style={{paddingTop: 10}}>
                <View style={styles.detailItem}>
                  <Text style={styles.label}>STATUS</Text>
                  <Text style={styles.labelValue}>{selectedItem.Status}</Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>CLAIMANT</Text>
                  <Text style={styles.labelValue}>{selectedItem.Claimant}</Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>DOCUMENT</Text>
                  <Text style={styles.labelValue}>
                    {selectedItem.DocumentType}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>ADV</Text>
                  <Text style={styles.labelValue}>
                    {selectedItem.ADV1 === '0' ? '' : selectedItem.ADV1}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>FUND</Text>
                  <Text style={styles.labelValue}>{selectedItem.Fund}</Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>AMOUNT</Text>
                  <Text style={styles.labelValue}>
                    {insertCommas(selectedItem.Amount)}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>NET</Text>
                  <Text style={[styles.labelValue, /* {color: '#F93232'} */]}>
                    {insertCommas(selectedItem.NetAmount)}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>EVALUATOR</Text>
                  <Text style={styles.labelValue}>{''}</Text>
                </View>
              </View>
              <Divider
                width={1.9}
                color={'rgba(217, 217, 217, 0.1)'}
                borderStyle={'dashed'}
                marginHorizontal={20}
                marginBottom={5}
              />

              <View style={{width: 100, alignSelf: 'flex-end', opacity: 0.8}}>
                <Pressable
                  style={({pressed}) => [
                    styles.showMore,
                    pressed && {backgroundColor: 'gray'},
                  ]}
                  android_ripple={{color: 'rgba(255, 255, 255, 0.2)'}}
                  onPress={() => setShowMore(!showMore)}>
                  <Text style={styles.showMoreText}>
                    {showMore ? 'Hide' : 'See More'}
                  </Text>
                  <Icon
                    name={showMore ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="white"
                  />
                </Pressable>
              </View>

              {showMore && (
                <View>
                  <View>
                    {selectedItem.Remarks !== null && (
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingStart: 10,
                            paddingBottom: 5,
                          }}>
                          <Icon
                            name={'alert-circle-outline'}
                            size={22}
                            color={'orange'}
                          />
                          <Text
                            style={{
                              fontFamily: 'Oswald-Regular',
                              color: 'white',
                              paddingStart: 5,
                            }}>
                            Note
                          </Text>
                        </View>
                        <View
                          style={{
                            borderWidth: 1,
                            padding: 5,
                            marginBottom: 10,
                            marginHorizontal: 10,
                            borderColor: 'silver',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-Regular',
                              color: 'white',
                            }}>
                            {removeHtmlTags(selectedItem.Remarks)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <View>
                    {transactionHistory && transactionHistory.length > 0 ? (
                      <DataTable
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          alignSelf: 'center',
                        }}>
                        <View
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            flexDirection: 'row',
                            //borderTopWidth: 1,
                            //borderTopColor: '#ccc',
                            paddingVertical: 5,
                          }}>
                          <View style={{flex: 1}}></View>
                          <View style={{flex: 3, marginEnd: 15}}>
                            <Text
                              style={{
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'white',
                                fontSize: 12,
                              }}>
                              DATE
                            </Text>
                          </View>
                          <View style={{flex: 5}}>
                            <Text
                              style={{
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'white',
                                fontSize: 12,
                              }}>
                              STATUS
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 10}}>
                            <Text
                              style={{
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'white',
                                fontSize: 12,
                                textAlign: 'right', // align text to the right for numeric
                              }}>
                              COMPLETION
                            </Text>
                          </View>
                        </View>

                        {transactionHistory.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems:'center',
                            //paddingTop: 10,
                            //paddingBottom: 10,
                            backgroundColor:
                              index % 2 === 0
                                ? 'rgba(0, 0, 0, 0.1)'
                                : 'rgba(0, 0, 0, 0.2)', // Alternating background color
                          }}>
                          <View style={{flex: 1,}}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 15}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'silver',
                              }}>
                              {item.DateModified}
                            </Text>
                          </View>
                          <View style={{flex: 5}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Oswald-Regular',
                                color: 'white',
                              }}>
                              {item.Status}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 10}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                textAlign: 'right',
                                color: 'silver',
                              }}>
                              {(item.Completion)}
                            </Text>
                          </View>
                        </View>
                      ))}
                      </DataTable>
                    ) : (
                      <Text style={{color:' white', fontFamily: 'Oswald-Regular'}}>No Transaction History available</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
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
});

export default MyTransactionDetails;
