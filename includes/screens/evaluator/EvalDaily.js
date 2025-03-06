import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  useWindowDimensions,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Animated,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useEvaluatorSummary} from '../../hooks/useEvaluatorSummary';
import {insertCommas} from '../../utils/insertComma';
import {BlurView} from '@react-native-community/blur';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

const EvalDaily = () => {
  const {width, height} = useWindowDimensions();
  const bottomSheetRef = useRef(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const openSheet = () => bottomSheetRef.current?.present();
  const closeSheet = () => bottomSheetRef.current?.dismiss();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [status, setStatus] = useState('On Evaluation - Accounting');
  //const currentYear = new Date().getFullYear();
  const currentYear = 2024;
  const {data} = useEvaluatorSummary(currentYear);

  const statusAbbreviations = {
    'On Evaluation - Accounting': 'On Eval',
    'Evaluated - Accounting': 'Evaluated',
    'Pending at CAO': 'Pending',
  };

  const getDateIcon = (date) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const selected = new Date(date);
    const current = new Date(today);
  
    if (date === today) {
      return 'calendar-check-o'; // Icon for today
    }
    if (selected < current) {
      return 'calendar-times-o'; // Icon for past dates
    }
    return 'calendar-plus-o'; // Icon for future dates
  };
  
  const onPressItem = useCallback(
    item => {
      navigation.navigate('Detail', {selectedItem: item});
    },
    [navigation],
  );

  /*   const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Initial scale: 0.8

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1, // Fully visible
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5, // Fade out slightly
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1, // Scale up slightly
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8, // Scale down slightly
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []); */

  const calendarTheme = {
    backgroundColor: '#F4F6F9',
    calendarBackground: '#FFFFFF',
    textSectionTitleColor: '#1a508c',
    textSectionTitleDisabledColor: '#D3D3D3',
    selectedDayBackgroundColor: '#007BFF',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#D9534F',
    dayTextColor: '#333',
    textDisabledColor: '#A9A9A9',
    dotColor: '#1a508c',
    selectedDotColor: '#FFFFFF',
    arrowColor: '#007BFF',
    disabledArrowColor: '#D3D3D3',
    monthTextColor: '#1a508c',
    indicatorColor: '#007BFF',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    textDayFontWeight: '600',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: 'bold',
    textDayStyle: {
      marginVertical: 5,
      fontWeight: '600',
    },
    selectedDayStyle: {
      backgroundColor: '#007BFF',
      borderRadius: 8,
    },
    dayContainerStyle: {
      borderRadius: 8,
      paddingVertical: 6,
    },
    weekVerticalMargin: 2,
    arrowStyle: {
      padding: 8,
    },
  };
  if (!data) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <BlurView
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          blurType="light" // Options: "light", "dark", "extraLight"
          blurAmount={5} // Adjust the intensity of the blur
        />

        {/* Loading Indicator */}

        {/*   <Animated.Image
          source={require('../../../assets/images/doctracklogo.png')}
          style={{
            width: 80,
            height: 100,
            opacity: fadeAnim, // Apply fade animation
            transform: [{ scale: scaleAnim }], // Apply scale animation
            marginRight: 10,
          }}
        /> */}
        <ActivityIndicator size="large" color="#0000ff" />

        {/* <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
        Loading...
      </Text> */}
      </View>
    );
  }
  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.title}>Daily</Text>
            <View
              style={{width: 40, alignItems: 'flex-end', marginEnd: 10}}></View>
          </View>
        </ImageBackground>
        <View style={styles.container}>
          <Calendar
            theme={calendarTheme}
            dayComponent={({date, state}) => {
              const evaluations = data[date.dateString] || [];
              const isEvaluated = evaluations.length > 0;
              const currentDate = new Date(date.dateString);
              const isSunday = currentDate.getDay() === 0;

              return (
                <TouchableOpacity
                  disabled={!isEvaluated}
                  style={[
                    styles.dayContainer,
                    selectedDate === date.dateString && styles.selectedDay,
                    state === 'disabled' && {opacity: 0.3}, // Apply opacity instead of hiding
                  ]}
                  onPress={() => {
                    if (isEvaluated) {
                      setSelectedDate(date.dateString);
                      bottomSheetRef.current?.present(); // Open BottomSheetModal
                    }
                  }}>
                  <View style={styles.contentContainer}>
                    <View style={styles.badge}>
                      <Text
                        style={[
                          styles.badgeText,
                          selectedDate === date.dateString && {color: 'white'},
                        ]}>
                        {isEvaluated ? evaluations.length : ''}
                      </Text>
                    </View>

                    <View
                      style={{
                        //backgroundColor: 'rgb(86, 89, 97)',
                        backgroundColor: 'rgb(117, 117, 117)',
                        width: 47,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={[
                          styles.dayText,
                          selectedDate === date.dateString &&
                            styles.selectedDayText,
                          isSunday && styles.sundayText,
                        ]}>
                        {date.day}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={['50%', '90%']}
            enablePanDownToClose={true}
            onDismiss={closeSheet}
            backdropComponent={({style}) => (
              <TouchableWithoutFeedback onPress={closeSheet}>
                <View style={[style, {backgroundColor: 'rgba(0,0,0,0.5)'}]} />
              </TouchableWithoutFeedback>
            )}>
            {selectedDate && data[selectedDate] && (
              <View style={[styles.detailsContainer, {width: width * 1}]}>
                <Text style={styles.detailsText}>
                  📅 Selected Date:{' '}
                  <Text style={styles.highlight}>{selectedDate}</Text>
                </Text>

                <View style={styles.statusContainer}>
                  {[
                    'On Evaluation - Accounting',
                    'Evaluated - Accounting',
                    'Pending at CAO',
                  ].map((item, index) => {
                    const count =
                      data[selectedDate]?.filter(
                        evItem => evItem.Status === item,
                      ).length || 0;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.statusButton,
                          status === item && styles.activeStatus,
                        ]}
                        onPress={() => setStatus(item)}>
                        <Text
                          style={[
                            styles.statusText,
                            status === item && styles.activeText,
                          ]}>
                          {statusAbbreviations[item] || item}{' '}
                          {count > 0 && (
                            <Text style={{fontWeight: 'bold'}}>({count})</Text>
                          )}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <BottomSheetFlatList
                  data={data[selectedDate].filter(
                    item => item.Status === status,
                  )}
                  keyExtractor={item =>
                    item.Id ? item.Id.toString() : Math.random().toString()
                  }
                  renderItem={({item, index}) => (
                    <View style={styles.evaluationCard}>
                      <Text style={styles.nameText}>
                        {index + 1} - {item.TrackingNumber}
                      </Text>
                      <Text style={styles.descriptionText}>
                        {item.Claimant}
                      </Text>
                      <Text style={styles.descriptionText}>
                        {item.DocumentType}
                      </Text>
                      {/*  <Text style={styles.descriptionText}>
                        {item.TrackingType}
                      </Text> */}
                      <View style={styles.amountContainer}>
                        <Text style={styles.amountText}>
                          Gross:{' '}
                          <Text style={styles.boldText}>
                            {insertCommas(item.Amount)}
                          </Text>
                        </Text>
                        <Text style={styles.amountText}>
                          Net:{' '}
                          <Text style={styles.boldText}>
                            {insertCommas(item.NetAmount)}
                          </Text>
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => onPressItem(item)}
                        style={{alignSelf: 'flex-end'}}>
                        <Text style={{color: 'orange'}}>See Details</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  contentContainerStyle={{paddingBottom: 20}}
                />
              </View>
            )}
          </BottomSheetModal>
        </View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    paddingBottom: 10,
  },
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    //shadowColor: '#000',
    //shadowOffset: {width: 0, height: 3},
    //shadowOpacity: 0.15,
    //shadowRadius: 6,
    //elevation: 5,
    //marginVertical: 10,
    alignSelf: 'center',
    width: '95%',
  },
  detailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  evaluationCard: {
    backgroundColor: '#F2F4F8',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#aaa',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    //borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: 'silver',
  },
  referenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a508c',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    //fontStyle: 'italic',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  amountText: {
    fontSize: 14,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  /*  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF',
    position: 'relative',
    marginBottom:10
  }, */
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 47,
    height: 50,
    //borderWidth: 1,
    borderColor: 'silver',
    margin: 5,
    elevation: 0.5,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: '#007BFF',
  },
  selectedDayText: {
    color: '#007BFF',
  },
  dayText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    
  },
  disabledText: {
    color: 'gray',
  },
  badge: {
    flex: 1,
    //backgroundColor: 'red',
    //borderRadius: 10,
    //paddingHorizontal: 6,
    //paddingVertical: 2,
    minWidth: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3, // Space between badge and date
  },
  badgeText: {
    //color: 'white',
    color: '#007BFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.50)', // Shadow color (black with opacity)
    textShadowOffset: { width: 0.5, height: 1 }, // Offset of the shadow
    textShadowRadius: 1, // Blur radius
  },
  sundayText: {
    color: 'red',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
  },
  activeStatus: {
    backgroundColor: '#007BFF',
  },
  statusText: {
    color: '#252525',
    //fontWeight: 'bold',
  },
  activeText: {
    color: '#FFF',
  },
});

export default EvalDaily;
