// AdvanceInspectionDetails.js
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAdvanceInspectionDetails} from '../../hooks/useInspection';
import { formatDisplayDateTime } from '../../utils/dateUtils';


const AdvanceInspectionDetails = ({route, navigation}) => {
  const {Id, Year, RefTrackingNumber} = route.params;

  const {data, loading, error} = useAdvanceInspectionDetails(
    Id,
    Year,
    RefTrackingNumber,
  );

  const deliveryData = data?.delivery[0];
  const prRecord = data?.prRecord;
  const prItems = data?.prRecord || []; // Use data?.prRecord as the array of items

  const renderDeliveryDetails = () => {
    if (!deliveryData) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="calendar"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Scheduled Delivery Date"
            />
            <Text style={styles.detailLabel}>Scheduled Delivery:</Text>
            <Text style={styles.detailValue}>
              {formatDisplayDateTime(deliveryData.DeliveryDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="map-marker"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Delivery Address"
            />
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.Address || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="account"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Contact Person"
            />
            <Text style={styles.detailLabel}>Contact Person:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.ContactPerson || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="phone"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Contact Number"
            />
            <Text style={styles.detailLabel}>Contact Number:</Text>
            <Text style={styles.detailValue}>
              {deliveryData.ContactNumber || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPRDetails = () => {
    if (!prRecord) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Purchase Request Details</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit:</Text>
            <Text style={styles.detailValue}>{prRecord.Unit || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Qty:</Text>
            <Text style={styles.detailValue}>{prRecord.Qty || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date Created:</Text>
            <Text style={styles.detailValue}>
              {formatDisplayDateTime(prRecord.DateCreated)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>
              {prRecord.Department || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Division:</Text>
            <Text style={styles.detailValue}>{prRecord.Division || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

 /*  const renderSupplierInformation = () => {
    if (!prRecord) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Supplier Information</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="domain"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Supplier Name"
            />
            <Text style={styles.detailLabel}>Supplier Name:</Text>
            <Text style={styles.detailValue}>
              {prRecord.SupplierName || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="email"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Supplier Email"
            />
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>
              {prRecord.SupplierEmail || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcon
              name="phone"
              size={20}
              color="#607D8B"
              style={styles.iconStyle}
              accessibilityLabel="Supplier Contact"
            />
            <Text style={styles.detailLabel}>Contact No.:</Text>
            <Text style={styles.detailValue}>
              {prRecord.SupplierContactNo || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  }; */

  const renderPRItems = () => {
    if (!prItems || prItems.length === 0) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Items Requested</Text>
        </View>
        <View style={styles.cardBody}>
          {prItems.map((item, index) => {
            const [showFullDescription, setShowFullDescription] = useState(false);
            const [hasMoreLines, setHasMoreLines] = useState(false);

            const handleTextLayout = useCallback(e => {
              // Check if the text exceeds 2 lines
              if (e.nativeEvent.lines.length > 2) {
                setHasMoreLines(true);
              } else {
                setHasMoreLines(false); // Reset if text shrinks
              }
            }, []);

            return (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemIndex}>Item {index + 1}</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Item Code:</Text>
                  <Text style={styles.detailValue}>
                    {item.ItemCode || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.detailValue, styles.multiline]}
                      numberOfLines={showFullDescription ? undefined : 2}
                      onTextLayout={handleTextLayout}>
                      {item.Description || 'N/A'}
                    </Text>
                    {hasMoreLines && (
                      <Pressable
                        onPress={() =>
                          setShowFullDescription(!showFullDescription)
                        }>
                        <Text style={styles.showMoreLessButton}>
                          {showFullDescription ? 'Show Less' : 'Show More'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>
                    {`${item.Qty || 'N/A'} ${item.Unit || ''}`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit Price:</Text>
                  <Text style={styles.detailValue}>
                    {/* Assuming Amount and Total are numbers that need formatting */}
                    {item.Amount ? `$${parseFloat(item.Amount).toFixed(2)}` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.detailValue}>
                    {item.Total ? `$${parseFloat(item.Total).toFixed(2)}` : 'N/A'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a508c" />
        <Text style={styles.loadingText}>Loading inspection details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error fetching details: {error.message || 'Unknown error'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#1a508c"
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advance Inspection Details</Text>
        <View style={{width: 24}} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderDeliveryDetails()}
        {renderPRDetails()}
        {/* {renderSupplierInformation()} */}
        {/* {renderPRItems()} */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a508c',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitleContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a508c',
    textAlign: 'left',
  },
  cardBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#495057',
    marginRight: 10,
    width: 100,
  },
  detailValue: {
    color: '#212529',
    flex: 1,
    textAlign: 'left',
  },
  iconStyle: {
    marginRight: 10,
    marginTop: 2,
  },
  multiline: {
    textAlign: 'left',
  },
  showMoreLessButton: {
    color: '#1a508c',
    fontWeight: '600',
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  bold: {
    fontWeight: '700',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  itemContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  itemIndex: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a508c',
    fontSize: 16,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    marginVertical: 12,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#495057',
    fontSize: 15,
  },
});

export default AdvanceInspectionDetails;
