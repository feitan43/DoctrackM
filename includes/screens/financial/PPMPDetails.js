import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {insertCommas} from '../../utils/insertComma';
import {usePPMPDetails} from '../../hooks/useFinancial';

// A helper function to format the raw data from the API
const formatPPMPData = rawData => {
  if (!rawData || rawData.length === 0) {
    return null;
  }

  // Use the first item to create the header
  const firstItem = rawData[0];
  const header = {
    office: firstItem.OfficeName,
    budgetYear: firstItem.Year,
    fund: firstItem.Fund,
    responsibilityCenter: firstItem.PR_ProgramCode,
    programName: firstItem.ProgramName,
    expenseCode: firstItem.PR_AccountCode,
    expenseDescription: firstItem.Title,
    count: rawData.length,
  };

  // Map over the raw data to create the transactions array
  const transactions = rawData.map(item => ({
    tn: item.TrackingNumber,
    encoded: item.DateEncoded,
    chargeAmount: parseFloat(item.Amount),
    status: item.Status,
    quarter: `Q${Math.ceil(item.PR_Month / 3)}`,
    category: item.CategoryName,
    statusUpdated: item.DateModified,
  }));

  return {header, transactions};
};

const PPMPDetails = ({navigation, route}) => {
  const {fund, program, account} = route.params || {};
  const {data, isLoading, error} = usePPMPDetails(fund, program, account);

  // Use useMemo to format the data only when the 'data' dependency changes
  const formattedData = useMemo(() => {
    return formatPPMPData(data);
  }, [data]);

  const totalChargeAmount = useMemo(() => {
    if (!formattedData || !formattedData.transactions) {
      return 0;
    }
    return formattedData.transactions.reduce(
      (sum, item) => sum + item.chargeAmount,
      0,
    );
  }, [formattedData]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#43a3e8" />
        <Text style={styles.loadingText}>Loading PPMP Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={30} color="#dc3545" />
        <Text style={styles.errorText}>Failed to load PPMP details.</Text>
        <Text style={styles.errorTextDetail}>
          {error.message || 'Please try again later.'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle case where data is null or empty after formatting
  if (!formattedData || formattedData.transactions.length === 0) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#252525" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>List of Purchase Requests</Text>
          <Text style={styles.headerSubtitle}>(with particular charges below)</Text>
        </View>
        <View style={styles.noDataContainer}>
          <Ionicons name="information-circle-outline" size={30} color="#7F8C8D" />
          <Text style={styles.noDataText}>No data available for this account.</Text>
        </View>
      </View>
    );
  }

  const {header, transactions} = formattedData;

  return (
    <View style={styles.outerContainer}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#252525" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List of Purchase Requests</Text>
        <Text style={styles.headerSubtitle}>(with particular charges below)</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Document Header Section */}
          <View style={styles.docHeader}>
            {[
              {label: 'Office', value: header.office},
              {label: 'Budget Year', value: header.budgetYear},
              {label: 'Fund', value: header.fund},
              {
                label: 'Responsibility Center',
                value: header.responsibilityCenter + ' - ' + header.programName,
              },
              {label: 'Expense Code', value: header.expenseCode},
              {
                label: 'Expense Description',
                value: header.expenseDescription,
              },
              {label: 'Count', value: `${header.count} transactions`},
            ].map((row, index) => (
              <View key={index} style={styles.docHeaderRow}>
                <Text style={styles.docHeaderLabel}>{row.label}</Text>
                <Text style={styles.docHeaderValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Transaction Cards */}
          {transactions.map((item, index) => (
            <View key={index} style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.tn}>{item.tn}</Text>
                  <Text style={styles.encoded}>Encoded: {item.encoded}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.amount}>
                    {insertCommas(item.chargeAmount.toFixed(2))}
                  </Text>
                  <Text style={styles.statusBadge}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.transactionMeta}>
                <Text style={styles.metaText}>
                  {item.quarter} • {item.category}
                </Text>
                <Text style={styles.metaUpdated}>
                  Updated: {item.statusUpdated}
                </Text>
              </View>
            </View>
          ))}

          {/* Total Footer */}
          <View style={styles.totalFooter}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>
              {insertCommas(totalChargeAmount.toFixed(2))}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ... (your styles remain the same)
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F8FB',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerBar: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E8F0',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 4,
  },
  docHeader: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBF1F7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  docHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  docHeaderLabel: {
    flex: 0.5,
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  docHeaderValue: {
    flex: 1,
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  encoded: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d6613',
  },
  statusBadge: {
    fontSize: 12,
    backgroundColor: '#dbe0cc',
    color: '#3d6613',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    textAlign: 'center',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  metaUpdated: {
    fontSize: 12,
    color: '#95A5A6',
  },
  totalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#dbe0cc',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d6613',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d6613',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5C7C9E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FB',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  errorTextDetail: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#43a3e8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default PPMPDetails;