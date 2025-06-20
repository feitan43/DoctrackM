import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useInspectionDetails} from '../hooks/useInspection';
import {removeHtmlTags} from '../utils';

const REMARKS_OPTIONS = [
  'Missing Documentation',
  'Awaiting Confirmation',
  'Parts Unavailable',
  'Customer Request',
  'Schedule Conflict',
  'Others',
];

const InspectionDetails = ({route, navigation}) => {
  const {item} = route.params;
  const {
    data: data,
    isLoading: DetailsLoading,
    error: DetailsError,
    refetch,
  } = useInspectionDetails(item.Id, item.Year, item.TrackingNumber, item.TrackingPartner);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPoItemIndexes, setSelectedPoItemIndexes] = useState(new Set());
  const [showOnHoldRemarksInput, setShowOnHoldRemarksInput] = useState(false);
  const [selectedRemarkOption, setSelectedRemarkOption] = useState('');
  const [customRemark, setCustomRemark] = useState('');
  const [allPoItemsSelected, setAllPoItemsSelected] = useState(false);

  useEffect(() => {
    const poRecords = data?.poRecord;

    if (poRecords && poRecords.length > 0) {
      const areAllCurrentlySelected = Array.from({length: poRecords.length}, (_, i) => i)
                                          .every(index => selectedPoItemIndexes.has(index));
      setAllPoItemsSelected(areAllCurrentlySelected);
    } else {
      setAllPoItemsSelected(false);
    }
  }, [selectedPoItemIndexes, data?.poRecord]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const togglePoItemSelection = useCallback((poItemIndex) => {
    setSelectedPoItemIndexes((prevSelectedIndexes) => {
      const newSet = new Set(prevSelectedIndexes);
      if (newSet.has(poItemIndex)) {
        newSet.delete(poItemIndex);
      } else {
        newSet.add(poItemIndex);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAllPoItems = useCallback(() => {
    const poRecords = data?.poRecord;
    if (!poRecords || poRecords.length === 0) {
      return;
    }

    if (allPoItemsSelected) {
      setSelectedPoItemIndexes(new Set());
    } else {
      const allIndexes = new Set(Array.from({length: poRecords.length}, (_, i) => i));
      setSelectedPoItemIndexes(allIndexes);
    }
  }, [allPoItemsSelected, data?.poRecord]);

  const showFab = useMemo(() => selectedPoItemIndexes.size > 0, [selectedPoItemIndexes]);

  const handleInspected = useCallback(() => {
    const itemsToMarkInspected = Array.from(selectedPoItemIndexes);
    if (itemsToMarkInspected.length === 0) {
      Alert.alert('No Items Selected', 'Please select items to mark as inspected.');
      return;
    }
    Alert.alert(
      'Mark as Inspected',
      `Are you sure you want to mark ${itemsToMarkInspected.length} item(s) as "Inspected"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              Alert.alert('Success', 'Selected items marked as Inspected.');
              setSelectedPoItemIndexes(new Set());
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark items as Inspected.');
              console.error('Error marking as inspected:', error);
            }
          },
        },
      ],
    );
  }, [selectedPoItemIndexes, refetch, data?.poRecord]);

  const handleInspectionOnHoldPress = useCallback(() => {
    const itemsToHold = Array.from(selectedPoItemIndexes);
    if (itemsToHold.length === 0) {
      Alert.alert('No Items Selected', 'Please select items to put on hold.');
      return;
    }
    setSelectedRemarkOption('');
    setCustomRemark('');
    setShowOnHoldRemarksInput(true);
  }, [selectedPoItemIndexes]);

  const submitOnHoldRemarks = useCallback(async () => {
    const itemsToHold = Array.from(selectedPoItemIndexes);
    let finalRemark = selectedRemarkOption;

    if (selectedRemarkOption === 'Others') {
      if (!customRemark.trim()) {
        Alert.alert('Reason Required', 'Please enter a reason for "Others".');
        return;
      }
      finalRemark = customRemark.trim();
    } else if (!selectedRemarkOption) {
      Alert.alert('Select a Reason', 'Please select a reason or choose "Others".');
      return;
    }

    Alert.alert(
      'Confirm On Hold',
      `Are you sure you want to put ${itemsToHold.length} item(s) on "Inspection On Hold" with reason: "${finalRemark}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setShowOnHoldRemarksInput(false);
            setSelectedRemarkOption('');
            setCustomRemark('');
          },
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              Alert.alert('Success', 'Selected items put on Inspection On Hold.');
              setSelectedPoItemIndexes(new Set());
              setSelectedRemarkOption('');
              setCustomRemark('');
              setShowOnHoldRemarksInput(false);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to put items on hold.');
              console.error('Error putting on hold:', error);
            }
          },
        },
      ],
    );
  }, [selectedPoItemIndexes, selectedRemarkOption, customRemark, refetch, data?.poRecord]);

  if (DetailsLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading inspection details...</Text>
      </View>
    );
  }

  if (DetailsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {DetailsError.message}</Text>
      </View>
    );
  }

  const paymentData = data?.payment?.[0];
  const poRecords = data?.poRecord;
  const deliveryData = data?.delivery?.[0];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={{color: '#F6F6F6', borderless: true, radius: 24}}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Inspection Details</Text>
          <View style={{flex: 1, width: 40}} />
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {renderPayment({item, data: paymentData})}
        {renderPO({
          poRecords: poRecords,
          selectedPoItemIndexes: selectedPoItemIndexes,
          togglePoItemSelection: togglePoItemSelection,
          allPoItemsSelected: allPoItemsSelected,
          toggleSelectAllPoItems: toggleSelectAllPoItems,
        })}
        {renderDelivery({data: deliveryData})}
        {renderInspectionActivity({data: deliveryData})}
      </ScrollView>

      {showFab && (
        <View style={styles.fabContainer}>
          <Pressable
            style={[styles.fab, styles.fabInspected]}
            android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
            onPress={handleInspected}>
            <Icon name="checkmark-done-circle-outline" size={28} color="#fff" />
            <Text style={styles.fabText}>Inspected</Text>
          </Pressable>

          <Pressable
            style={[styles.fab, styles.fabOnHold]}
            android_ripple={{color: '#F6F6F6', borderless: false, radius: 28}}
            onPress={handleInspectionOnHoldPress}>
            <Icon name="pause-circle-outline" size={28} color="#fff" />
            <Text style={styles.fabText}>On Hold</Text>
          </Pressable>
        </View>
      )}

      {showOnHoldRemarksInput && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.remarksOverlay}>
          <Pressable style={styles.remarksOverlayBackground} onPress={() => setShowOnHoldRemarksInput(false)} />
          <View style={styles.remarksInputContainer}>
            <Text style={styles.remarksTitle}>Reason for On Hold</Text>

            <FlatList
              data={REMARKS_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({item: option}) => (
                <Pressable
                  style={({pressed}) => [
                    styles.remarkOption,
                    selectedRemarkOption === option && styles.remarkOptionSelected,
                    pressed && {opacity: 0.7},
                  ]}
                  onPress={() => {
                    setSelectedRemarkOption(option);
                    if (option !== 'Others') {
                      setCustomRemark('');
                    }
                  }}>
                  <Text style={[
                    styles.remarkOptionText,
                    selectedRemarkOption === option && styles.remarkOptionTextSelected,
                  ]}>
                    {option}
                  </Text>
                  {selectedRemarkOption === option && (
                    <Icon name="checkmark-circle" size={20} color="#1a508c" style={styles.remarkOptionCheck} />
                  )}
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.remarksOptionsList}
            />

            {selectedRemarkOption === 'Others' && (
              <TextInput
                style={styles.remarksTextInput}
                placeholder="Enter specific reason..."
                placeholderTextColor="#888"
                multiline={true}
                numberOfLines={3}
                value={customRemark}
                onChangeText={setCustomRemark}
              />
            )}

            <View style={styles.remarksButtonsContainer}>
              <Pressable
                style={({pressed}) => [styles.remarksButton, styles.remarksCancelButton, pressed && {opacity: 0.7}]}
                onPress={() => {
                  setShowOnHoldRemarksInput(false);
                  setSelectedRemarkOption('');
                  setCustomRemark('');
                }}>
                <Text style={styles.remarksButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [styles.remarksButton, styles.remarksSubmitButton, pressed && {opacity: 0.7}]}
                onPress={submitOnHoldRemarks}>
                <Text style={styles.remarksButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const renderPayment = ({item, data}) => {
  if (!data) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Payment Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Tracking Number:</Text>
        <Text style={styles.detailValue}>{data.TrackingNumber}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Year:</Text>
        <Text style={styles.detailValue}>{data.Year}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={styles.detailValue}>{data.Status}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Remarks:</Text>
        <Text style={styles.detailValue}>{removeHtmlTags(data.Remarks)}</Text>
      </View>
    </View>
  );
};

const RenderPOItem = ({itemData, index, isSelected, onToggleSelection}) => {
  if (!itemData) return null;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hasMoreLines, setHasMoreLines] = useState(false);

  const handleTextLayout = useCallback((e) => {
    if (e.nativeEvent.lines.length > 2) {
      setHasMoreLines(true);
    }
  }, []);

  return (
    <View
      style={[
        styles.poItemCard,
        {
          borderWidth: 1,
          borderColor: isSelected ? '#1a508c' : '#eee',
        },
      ]}>
      <Pressable
        onPress={() => onToggleSelection(index)}
        style={styles.poItemHeader}>
        <Icon
          name={isSelected ? 'checkbox-outline' : 'square-outline'}
          size={24}
          color={isSelected ? '#1a508c' : '#555'}
        />
        <Text style={styles.poItemTitle}>Item {index + 1}</Text>
      </Pressable>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Qty/Unit:</Text>
        <Text style={styles.detailValue}>
          {itemData.Qty} / {itemData.Unit}
        </Text>
        <View style={styles.amountTotalContainer}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>
            ₱{' '}
            {parseFloat(itemData.Amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Total:</Text>
        <Text style={styles.detailValue}>
          ₱{' '}
          {parseFloat(itemData.Total).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Description:</Text>
        <View style={{flexShrink: 1}}>
          <Text
            style={styles.detailValue}
            numberOfLines={showFullDescription ? undefined : 2}
            onTextLayout={handleTextLayout}>
            {itemData.Description}
          </Text>
          {hasMoreLines && (
            <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.showMoreLessButton}>
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const renderPO = ({
  poRecords,
  selectedPoItemIndexes,
  togglePoItemSelection,
  allPoItemsSelected,
  toggleSelectAllPoItems,
}) => {
  if (!poRecords || poRecords.length === 0) return null;

  const overallTotal = poRecords.reduce(
    (sum, item) => sum + parseFloat(item.Total || 0),
    0,
  );

  const year = poRecords[0].Year;
  const trackingNumber = poRecords[0].TrackingNumber;

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>Purchase Order</Text>
        {poRecords.length > 0 && (
          <Pressable
            style={styles.selectAllButton}
            android_ripple={{color: '#F6F6F6', borderless: true, radius: 20}}
            onPress={toggleSelectAllPoItems}>
            <Icon
              name={allPoItemsSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={allPoItemsSelected ? '#1a508c' : '#555'}
            />
            <Text style={styles.selectAllButtonText}>
              {allPoItemsSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailValue}>
          {year} | {trackingNumber}
        </Text>
      </View>

      {poRecords.map((item, index) => (
        <View key={index} style={styles.poItemSeparator}>
          <RenderPOItem
            itemData={item}
            index={index}
            isSelected={selectedPoItemIndexes.has(index)}
            onToggleSelection={togglePoItemSelection}
          />
        </View>
      ))}

      <View style={[styles.detailRow, styles.overallTotalRow]}>
        <Text style={styles.detailLabel}>Overall PO Total:</Text>
        <Text style={styles.overallTotalValue}>
          ₱{' '}
          {overallTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </View>
  );
};

const renderDelivery = ({data}) => {
  if (!data) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Delivery Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Delivery Date:</Text>
        <Text style={styles.detailValue}>{data.DeliveryDate}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date Inspected:</Text>
        <Text style={styles.detailValue}>{data.DateInspected}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Address:</Text>
        <Text style={styles.detailValue}>{data.Address}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Contact Number:</Text>
        <Text style={styles.detailValue}>{data.ContactNumber}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={styles.detailValue}>{data.Status}</Text>
      </View>
      {data.DeliveryDatesHistory && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery History:</Text>
          <Text style={styles.detailValue}>{data.DeliveryDatesHistory}</Text>
        </View>
      )}
    </View>
  );
};

const renderInspectionActivity = ({data}) => {
  if (!data) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Inspection Activity</Text>
      <Text style={styles.detailText}>
        No specific inspection activity details available in the provided data
        structure.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f2f5',
    flex: 1,
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
  contentContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a508c',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#eaf4ff',
  },
  selectAllButtonText: {
    color: '#1a508c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
    flexShrink: 0,
  },
  detailValue: {
    color: '#333',
    flexShrink: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  poItemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  poItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#333',
    flex: 1,
    marginLeft: 5,
  },
  poItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  poItemSeparator: {
    marginBottom: 10,
  },
  overallTotalRow: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'flex-end',
  },
  overallTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a508c',
  },
  showMoreLessButton: {
    color: '#1a508c',
    marginTop: 5,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: '#eaf4ff',
  },
  amountTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    height: 56,
    paddingHorizontal: 16,
    marginVertical: 5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fabInspected: {
    backgroundColor: '#28a745',
  },
  fabOnHold: {
    backgroundColor: '#ffc107',
  },
  remarksOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  remarksOverlayBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  remarksInputContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: '80%',
  },
  remarksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a508c',
    textAlign: 'center',
  },
  remarksOptionsList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  remarkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  remarkOptionSelected: {
    borderColor: '#1a508c',
    backgroundColor: '#eaf4ff',
  },
  remarkOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  remarkOptionTextSelected: {
    fontWeight: 'bold',
    color: '#1a508c',
  },
  remarkOptionCheck: {
    marginLeft: 10,
  },
  remarksTextInput: {
    minHeight: 80,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
    color: '#333',
  },
  remarksButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  remarksButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  remarksCancelButton: {
    backgroundColor: '#dc3545',
  },
  remarksSubmitButton: {
    backgroundColor: '#1a508c',
  },
  remarksButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InspectionDetails;