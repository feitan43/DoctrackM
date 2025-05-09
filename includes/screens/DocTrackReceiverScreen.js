import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';

export default function DocTrackReceiverScreen({
  myTransactionsLength,
  fetchDataRegOfficeDelays,
  refetchDataOthers,
  fetchOfficeDelays,
  fetchMyPersonal,
  fetchTransactionSummary,
  fetchRecentActivity,
  receivingCount,
  receivingCountData,
  refetchTrackSum,
  refetchRegTrackSum,
  accountabilityData,
  fetchMyAccountability,
  fetchRequests,
}) {
  const [refreshing, setRefreshing] = React.useState(false);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const selectedOnRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        fetchOfficeDelays(),
        fetchDataRegOfficeDelays(),
        fetchMyPersonal(),
        fetchTransactionSummary(),
        refetchTrackSum(),
        refetchRegTrackSum(),
        fetchMyAccountability(),
        fetchRequests(),
        fetchRecentActivity(),
        refetchDataOthers(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchOfficeDelays,
    fetchDataRegOfficeDelays,
    fetchMyPersonal,
    fetchTransactionSummary,
    refetchTrackSum,
    refetchRegTrackSum,
    fetchMyAccountability,
    fetchRequests,
    fetchRecentActivity,
    refetchDataOthers,
  ]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={selectedOnRefresh}
            />
          }>
          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 8,
              borderBottomWidth: 1,
              borderBottomColor: 'silver',
              borderRightWidth: 1,
              borderRightColor: 'silver',
            }}>
            {/*TRANSACTION COUNTER*/}

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                paddingBottom: 5,
                marginBottom: 5,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-SemiBold',
                  color: '#252525',
                  fontSize: 16,
                  paddingHorizontal: 10,
                }}>
                Transaction Counter
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-start',
                marginTop: 5,
                paddingHorizontal: 10,
                gap: 15,
              }}>
              {/* TOTAL RECEIVED */}
              <Pressable
                style={({pressed}) => ({
                  width: '32%',
                  alignItems: 'center',
                  paddingVertical: 10,
                  marginBottom: 10,
                  borderRadius: 5,
                  elevation: 1,
                  backgroundColor: pressed ? '#007bff' : '#ffffff',
                  borderBottomWidth: 2,
                  borderBottomColor: 'silver',
                  borderRightWidth: 2,
                  borderRightColor: 'silver',
                })}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
                {({pressed}) => (
                  <>
                    <Text
                      style={{
                        color: pressed ? 'white' : '#007bff',
                        fontFamily: 'Oswald-Regular',
                        fontSize: 30,
                      }}>
                      {receivingCountData?.TotalReceived ?? 0}
                    </Text>
                    <Text
                      style={{
                        color: pressed ? 'white' : '#252525',
                        fontFamily: 'Oswald-Light',
                        fontSize: 10,
                      }}>
                      Total Received
                    </Text>
                  </>
                )}
              </Pressable>

              {/* RECEIVED TODAY */}
              <Pressable
                style={({pressed}) => ({
                  width: '32%',
                  alignItems: 'center',
                  paddingVertical: 10,
                  marginBottom: 10,
                  borderRadius: 5,
                  elevation: 1,
                  backgroundColor: pressed ? '#007bff' : '#ffffff',
                  borderBottomWidth: 2,
                  borderBottomColor: 'silver',
                  borderRightWidth: 2,
                  borderRightColor: 'silver',
                })}
                android_ripple={{color: 'rgba(0, 0, 0, 0.1)'}}>
                {({pressed}) => (
                  <>
                    <Text
                      style={{
                        color: pressed ? 'white' : '#007bff',
                        fontFamily: 'Oswald-Regular',
                        fontSize: 30,
                      }}>
                      {receivingCountData?.ReceivedToday || 0}
                    </Text>
                    <Text
                      style={{
                        color: pressed ? 'white' : '#252525',
                        fontFamily: 'Oswald-Light',
                        fontSize: 10,
                      }}>
                      Received Today
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          <View
            style={{
              padding: 10,
              marginTop: 10,
              marginHorizontal: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 8,
            }}>
                
            {/*PERSONAL*/}

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                paddingBottom: 5,
                marginBottom: 5,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-SemiBold',
                  color: '#252525',
                  fontSize: 16,
                  paddingHorizontal: 10,
                }}>
                Personal
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-start',
                marginTop: 5,
                paddingHorizontal: 10,
                gap: 15,
              }}>
              {[
                {
                  label: 'Salaries',
                  count: `${myTransactionsLength ? myTransactionsLength : 0}`,
                  screen: 'MyTransactions',
                },
                {
                  label: 'ARE',
                  count: `${
                    accountabilityData ? accountabilityData.length : 0
                  }`,
                  screen: 'MyAccountability',
                },
              ].map((item, index) => {
                if (item.condition === false) {
                  return null;
                }

                return (
                  <Pressable
                    key={index}
                    style={({pressed}) => [
                      {
                        width: '32%',
                        alignItems: 'center',
                        paddingVertical: 10,
                        marginBottom: 10,
                        borderRadius: 5,
                        elevation: 1,
                        backgroundColor: pressed ? '#007bff' : '#ffffff',
                        borderBottomWidth: 2,
                        borderBottomColor: 'silver',
                        borderRightWidth: 2,
                        borderRightColor: 'silver',
                      },
                    ]}
                    android_ripple={{color: 'rgba(200, 200, 200, 0.5)'}}
                    onPress={() => {
                      if (item.screen) {
                        navigation.navigate(item.screen);
                      } else {
                        console.log(`${item.label} card pressed`);
                      }
                    }}>
                    {({pressed}) => (
                      <>
                        <Text
                          style={{
                            color: pressed ? 'white' : '#007bff',
                            fontFamily: 'Inter_28pt-Bold',
                            fontSize: 26,
                          }}>
                          {item.count}
                        </Text>

                        <Text
                          style={{
                            color: pressed ? 'white' : '#252525',
                            marginTop: 5,
                            textAlign: 'center',
                            fontSize: 14,
                            fontFamily: 'Inter_28pt-Regular',
                          }}>
                          {item.label}
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollViewContent: {
    flex: 1,
  },
  userInfoText: {
    color: 'yellow',
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tnEntry: {
    marginTop: 10,
    padding: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },
  iconContainer: {
    backgroundColor: 'gray',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  menuIcon: {
    marginRight: 40,
    marginLeft: 20,
  },
  docSearch: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  label: {
    width: '22%',
    marginRight: 10,
    textAlign: 'right',
  },
  value: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '80%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showMore: {
    alignItems: 'flex-end',
  },
  showMoreContainer: {
    flexDirection: 'row',
  },
  showMoreText: {
    color: 'darkblue',
    fontSize: 14,
    marginLeft: 5,
  },
  note: {
    backgroundColor: 'skygray',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
  },
  history: {},
  historyTableHeader: {
    backgroundColor: 'darkgray',
    flexDirection: 'row',
    gap: 100,
  },
  historyData: {
    flexDirection: 'row',
  },
  summary: {
    backgroundColor: 'white',
    borderWidth: 1,
  },
  myTracker: {
    width: '20%',
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5,
  },
  myOfficeTracker: {
    width: '20%',
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 5,
  },
  radialGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:
      Math.round(
        Dimensions.get('window').width + Dimensions.get('window').height,
      ) / 2,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  graphStyle: {
    transform: [{rotate: '90deg'}],
    borderRadius: 20,
  },

  table: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 3,
    margin: 2,
    borderRadius: 5,
  },
  text: {
    width: 55,
    color: 'white',
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 11,
    textAlign: 'left',
    alignItems: 'center',
    alignContent: 'center',
  },
  progressBarContainer: {
    //marginStart: 20,
    alignSelf: 'center',
    width: '90%',
    height: 25,
    borderRadius: 5,
    backgroundColor: 'rgb(223, 222, 222)',
    overflow: 'hidden',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    //elevation: 2, // Shadow for Android
  },
  progressBarContainerOthers: {
    alignSelf: 'center',
    width: '90%',
    height: 25,
    borderRadius: 5,
    backgroundColor: 'rgb(223, 222, 222)',
    overflow: 'hidden',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
  },
  progressBar: {
    height: '100%',
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow radius for iOS
    //elevation: 8, // Shadow for Android
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Oswald-Regular',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  animPR: {
    height: 100,
  },
  dropdown: {
    width: 80,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  activityIndicatorWrapper: {
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmerWrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0, 0.03)',
  },
  gradient: {
    flex: 1,
  },
  calendar: {marginBottom: 10},
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  card: {
    marginVertical: 5,
    padding: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDesc: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
