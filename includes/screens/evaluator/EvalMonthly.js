import React, {useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useEvaluatorMonthlySummary} from '../../hooks/useEvaluatorMonthlySummary';
import {useEvaluatorMonthlyDetails} from '../../hooks/useEvaluateMonthlyDetails';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {BlurView} from '@react-native-community/blur';
import {insertCommas} from '../../utils/insertComma';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const EvalMonthly = ({navigation}) => {
  const {width, height} = useWindowDimensions();
  const [expanded, setExpanded] = useState({month: null, category: null});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['40%', '70%'], []);

  const currentYear = 2024;
  const {data} = useEvaluatorMonthlySummary(currentYear);
  const {
    data: dataDetails,
    isLoading: isDetailsLoading,
    error: detailsError,
    
  } = useEvaluatorMonthlyDetails(currentYear, selectedStatus, selectedMonth);

  const openSheet = () => bottomSheetRef.current?.present();
  const closeSheet = () => bottomSheetRef.current?.dismiss();

  const totalOnEvaluation = useMemo(
    () =>
      (data ?? []).reduce(
        (sum, item) => sum + parseInt(item.OnEvaluationCount || '0'),
        0,
      ),
    [data],
  );

  const totalEvaluated = useMemo(
    () =>
      (data ?? []).reduce(
        (sum, item) => sum + parseInt(item.EvaluatedCount || '0'),
        0,
      ),
    [data],
  );

  const totalPendingCAO = useMemo(
    () =>
      (data ?? []).reduce(
        (sum, item) => sum + parseInt(item.PendingCAOCount || '0'),
        0,
      ),
    [data],
  );

  const totalOverall = useMemo(
    () =>
      (data ?? []).reduce(
        (sum, item) => sum + parseInt(item.TotalCount || '0'),
        0,
      ),
    [data],
  );

  const handleOnEval = (status, month, count) => {
    if (!status || !month) {
      console.warn('Please select a valid status and month.');
      return;
    }
    setSelectedStatus(status);
    setSelectedMonth(month);
    setSelectedCount(count);
    bottomSheetRef.current?.present();
  };

  const handleEvaluated = (status, month) => {
    if (!status || !month) {
      console.warn('Please select a valid status and month.');
      return;
    }
    setSelectedStatus(status);
    setSelectedMonth(month);
    setSelectedCount(count);
    bottomSheetRef.current?.present();
  };

  const handlePending = (status, month) => {
    if (!status || !month) {
      console.warn('Please select a valid status and month.');
      return;
    }
    setSelectedStatus(status);
    setSelectedMonth(month);
    setSelectedCount(count);
    bottomSheetRef.current?.present();
  };

  const toggleExpand = (month, category) => {
    setExpanded(prev =>
      prev.month === month && prev.category === category
        ? {month: null, category: null}
        : {month, category},
    );
  };

  const onPressItem = useCallback(
    item => {
      navigation.navigate('Detail', {selectedItem: item});
    },
    [navigation],
  );

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

        <ActivityIndicator size="large" color="#0000ff" />
        {/* <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
        Loading...
      </Text> */}
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.title}>Monthly</Text>
            <View
              style={{width: 40, alignItems: 'flex-end', marginEnd: 10}}></View>
          </View>
        </ImageBackground>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerText, {flex: 1.0}]}>
              {''}
            </Text>
            <Text style={[styles.cell, styles.headerText]}>On Eval</Text>
            <Text style={[styles.cell, styles.headerText]}>Evaluated</Text>
            <Text style={[styles.cell, styles.headerText]}>Pending</Text>
            <Text style={[styles.cell, styles.headerText, styles.totalHeader]}>
              Total
            </Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={item => item.Month}
            initialNumToRender={12}
            windowSize={12}
            maxToRenderPerBatch={12}
            removeClippedSubviews={true} // Improve scrolling performance
            renderItem={({item, index}) => (
              <>
                <View
                  style={[
                    styles.row,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}>
                  <Text style={[styles.cell, {flex: 1.0}]}>
                    {monthNames[Number(item.Month) - 1]}
                  </Text>
                  <Pressable
                    style={styles.cell}
                    onPress={() =>
                      handleOnEval(
                        'On Evaluation - Accounting',
                        item.Month,
                        item.OnEvaluationCount,
                      )
                    }>
                    <Text style={styles.pressableText}>
                      {item.OnEvaluationCount}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.cell}
                    onPress={() =>
                      handleOnEval(
                        'Evaluated - Accounting',
                        item.Month,
                        item.EvaluatedCount,
                      )
                    }>
                    <Text style={styles.pressableText}>
                      {item.EvaluatedCount}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.cell}
                    onPress={() =>
                      handleOnEval(
                        'Pending at CAO',
                        item.Month,
                        item.PendingCAOCount,
                      )
                    }>
                    <Text style={styles.pressableText}>
                      {item.PendingCAOCount}
                    </Text>
                  </Pressable>
                  <Text style={[styles.cell, styles.totalCell]}>
                    {item.TotalCount}
                  </Text>
                </View>
                <View></View>
              </>
            )}
            ListFooterComponent={() => (
              <View style={[styles.row, styles.footerRow]}>
                <Text style={[styles.cell, {flex: 1.0, fontWeight: 'bold'}]}>
                </Text>
                <Text style={[styles.cell, styles.totalCell]}>
                  {totalOnEvaluation}
                </Text>
                <Text style={[styles.cell, styles.totalCell]}>
                  {totalEvaluated}
                </Text>
                <Text style={[styles.cell, styles.totalCell]}>
                  {totalPendingCAO}
                </Text>
                <Text style={[styles.cell, styles.totalCell]}>
                  {totalOverall}
                </Text>
              </View>
            )}
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
            <View style={{paddingStart: 10}}>
              <Text style={styles.detailsText}>
                Status {''}
                <Text style={styles.highlight}>
                  {selectedStatus}
                  <Text style={{color: '#252525', fontSize: 14}}>
                    {' '}
                    ({selectedCount})
                  </Text>
                </Text>
              </Text>
            </View>

            <View style={[styles.detailsContainer, {width: width * 1}]}>
              {isDetailsLoading ? (
                <ActivityIndicator size="large" color="#007bff" />
              ) : (
                <BottomSheetFlatList
                  data={dataDetails}
                  initialNumToRender={5}
                  windowSize={5}
                  keyExtractor={(item, index) =>
                    `${item.TrackingNumber}-${index}`
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
                        style={{alignSelf: 'flex-end'}}
                        onPress={() => onPressItem(item)}>
                        <Text style={{color: 'orange'}}>See Details</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
          </BottomSheetModal>
        </View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  table: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
  },
  row: {
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#E3F2FD',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E88E5',
    textAlign: 'center',
  },
  totalHeader: {
    color: '#E64A19',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
  },
  totalCell: {
    color: '#D84315',
    fontWeight: 'bold',
  },
  evenRow: {
    backgroundColor: '#FAFAFA',
  },
  oddRow: {
    backgroundColor: '#FFFFFF',
  },
  pressableText: {
    fontSize: 14,
    color: '#252525',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  highlightText: {
    color: '#007AFF',
  },
  sheetContent: {},
  sheetTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 10},
  detailItem: {padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd'},
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
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: 10,
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
});

export default EvalMonthly;
