import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, {Path, G, Circle} from 'react-native-svg'; // Import Circle for the smaller progress circles
import useUserInfo from '../../api/useUserInfo'; // Make sure this path is correct

const screenWidth = Dimensions.get('window').width;

const TransactionsScreen = ({navigation}) => {
  const {officeName} = useUserInfo(); // Fetch office name

  // Data based on the provided image for Transaction Summary
  const transactionSummaryData = {
    purchasedRequest: {
      percentage: 68,
      consolidated: 6,
      forPO: 13,
      total: 19,
      color: '#92cc46', // Green from the image
    },
    purchasedOrder: {
      percentage: 46,
      waitingForDelivery: 7,
      delivered: 6,
      total: 13,
      color: '#43a3e8', // Blue from the image
    },
    purchasedPayment: {
      percentage: 100,
      checkReleased: 12,
      total: 12,
      color: '#fbbc48', // Orange/Yellow from the image
    },
  };

  // Data based on the provided image for Purchase Request Categories
  const purchaseRequestCategories = [
    {
      category: 'Computer Equipment and Accessories',
      totalAmount: 751200.00,
      pr: 1,
      awarded: 1,
      status: 100,
    },
    {
      category: 'Computer Peripherals and Accessories',
      totalAmount: 140200.00,
      pr: 3,
      awarded: 3,
      status: 100,
    },
    {
      category: 'Computer Supplies and Materials',
      totalAmount: 506605.00,
      pr: 3,
      awarded: 3,
      status: 100,
    },
    {
      category: 'Electrical Equipment and Appliances - A',
      totalAmount: 5300.00,
      pr: 1,
      awarded: 1,
      status: 100,
    },
    {
      category: 'Furniture and Fixtures (Ergonomic and Eurotech Type)',
      totalAmount: 119000.00,
      pr: 1,
      awarded: 1,
      status: 100,
    },
    {
      category: 'Janitorial Supplies and Materials',
      totalAmount: 72910.00,
      pr: 2,
      awarded: 2,
      status: 100,
    },
    {
      category: 'Medical Supplies and Materials',
      totalAmount: 52800.00,
      pr: 2,
      awarded: 2,
      status: 100,
    },
    {
      category: 'Electronic Consumables',
      totalAmount: 17574.00,
      pr: 2,
      awarded: 2,
      status: 100,
    },
    {
      category: 'Office Supplies and Materials',
      totalAmount: 304470.00,
      pr: 2,
      awarded: 2,
      status: 100,
    },
    {
      category: 'Audio-Video Supplies and Materials',
      totalAmount: 10000.00,
      pr: 1,
      awarded: 1,
      status: 100,
    },
    {
      category: 'FUEL OIL, LUBRICANTS AND SERVICING',
      totalAmount: 217455.00,
      pr: 1,
      awarded: 1,
      status: 100,
    },
  ];

  const totalAmountSum = purchaseRequestCategories.reduce(
    (sum, item) => sum + item.totalAmount,
    0,
  );
  const totalPR = purchaseRequestCategories.reduce(
    (sum, item) => sum + item.pr,
    0,
  );
  const totalAwarded = purchaseRequestCategories.reduce(
    (sum, item) => sum + item.awarded,
    0,
  );
  const overallStatus = 68; // As per the image

  const handleBackPress = () => {
    navigation.goBack();
    console.log('Back button pressed!');
  };

  // Helper function to format currency
  const formatCurrency = value => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Function to render progress circle for Transaction Summary
  const renderProgressCircle = (percentage, color, size = 60, strokeWidth = 8) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            stroke="#e0e0e0"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>
    );
  };


  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.backButtonRow}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'< Back'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerSection}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{officeName}</Text>
            <Text style={styles.headerSubtitle}>DOCTRACK TRANSACTIONS</Text>
          </View>
        </View>

        {/* Transaction Summary Card */}
        <View style={styles.transactionSummaryCard}>
          <Text style={styles.transactionSummaryTitle}>Transaction Summary</Text>
          <View style={styles.summaryGrid}>
            {/* Purchased Request */}
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryPercentage}>
                {transactionSummaryData.purchasedRequest.percentage}% completed
              </Text>
              <View style={styles.summaryCircleContainer}>
                {renderProgressCircle(transactionSummaryData.purchasedRequest.percentage, transactionSummaryData.purchasedRequest.color, 90, 10)}
                <Text style={styles.circleLabel}>For PO</Text>
              </View>
              <View style={styles.summaryCounts}>
                <Text style={styles.countText}>Consolidated <Text style={styles.countValue}>{transactionSummaryData.purchasedRequest.consolidated}</Text></Text>
                <Text style={styles.countText}>For PO <Text style={styles.countValue}>{transactionSummaryData.purchasedRequest.forPO}</Text></Text>
                <Text style={styles.totalCount}>{transactionSummaryData.purchasedRequest.total}</Text>
              </View>
            </View>

            {/* Purchased Order */}
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryPercentage}>
                {transactionSummaryData.purchasedOrder.percentage}% completed
              </Text>
              <View style={styles.summaryCircleContainer}>
                {renderProgressCircle(transactionSummaryData.purchasedOrder.percentage, transactionSummaryData.purchasedOrder.color, 90, 10)}
                <Text style={styles.circleLabel}>Delivered</Text>
              </View>
              <View style={styles.summaryCounts}>
                <Text style={styles.countText}>Waiting for Delivery <Text style={styles.countValue}>{transactionSummaryData.purchasedOrder.waitingForDelivery}</Text></Text>
                <Text style={styles.countText}>Delivered <Text style={styles.countValue}>{transactionSummaryData.purchasedOrder.delivered}</Text></Text>
                <Text style={styles.totalCount}>{transactionSummaryData.purchasedOrder.total}</Text>
              </View>
            </View>

            {/* Purchased Payment */}
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryPercentage}>
                {transactionSummaryData.purchasedPayment.percentage}% completed
              </Text>
              <View style={styles.summaryCircleContainer}>
                {renderProgressCircle(transactionSummaryData.purchasedPayment.percentage, transactionSummaryData.purchasedPayment.color, 90, 10)}
                <Text style={styles.circleLabel}>Check Released</Text>
              </View>
              <View style={styles.summaryCounts}>
                <Text style={styles.countText}>Check Released <Text style={styles.countValue}>{transactionSummaryData.purchasedPayment.checkReleased}</Text></Text>
                <Text style={styles.totalCount}>{transactionSummaryData.purchasedPayment.total}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Purchase Request Categories Section */}
        <View style={styles.categoriesCard}>
          <Text style={styles.categoriesTitle}>Purchase Request Categories</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.categoryHeader]}>Category</Text>
            <Text style={[styles.tableHeaderText, styles.amountHeader]}>Total Amount</Text>
            <Text style={[styles.tableHeaderText, styles.prHeader]}>PR</Text>
            <Text style={[styles.tableHeaderText, styles.awardedHeader]}>Awarded</Text>
            <Text style={[styles.tableHeaderText, styles.statusHeader]}>Status</Text>
          </View>
          {purchaseRequestCategories.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.categoryCell]}>{index + 1} {item.category}</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>{formatCurrency(item.totalAmount)}</Text>
              <Text style={[styles.tableCell, styles.prCell]}>{item.pr}</Text>
              <Text style={[styles.tableCell, styles.awardedCell]}>{item.awarded}</Text>
              <View style={[styles.tableCell, styles.statusCell]}>
                <View style={styles.progressBarContainerSmall}>
                  <View
                    style={[
                      styles.progressBarSmall,
                      { width: `${item.status}%`, backgroundColor: '#3d6613' }, // Dark green for status bar
                    ]}
                  />
                  <Text style={styles.progressBarSmallText}>{item.status}%</Text>
                </View>
              </View>
            </View>
          ))}
          {/* Totals Row */}
          <View style={styles.tableFooter}>
            <Text style={[styles.tableFooterText, styles.categoryCell]}>TOTAL</Text>
            <Text style={[styles.tableFooterText, styles.amountCell]}>{formatCurrency(totalAmountSum)}</Text>
            <Text style={[styles.tableFooterText, styles.prCell]}>{totalPR}</Text>
            <Text style={[styles.tableFooterText, styles.awardedCell]}>{totalAwarded}</Text>
            <Text style={[styles.tableFooterText, styles.statusCell]}>{overallStatus}%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  backButtonRow: {
    width: '100%',
    paddingTop: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E8F0',
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5C7C9E',
    fontWeight: '600',
  },
  headerSection: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E8F0',
  },
  headerTextContainer: {
    alignItems: 'center', // Keep this centered for the office name and subtitle
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Transaction Summary Card Styles
  transactionSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    width: '90%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E8F0',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  transactionSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap', // Allow wrapping for smaller screens if needed
  },
  summaryBlock: {
    alignItems: 'center',
    width: '30%', // Adjust as needed for spacing
    marginBottom: 20,
    paddingHorizontal: 5, // Add horizontal padding for spacing between blocks
  },
  summaryPercentage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  summaryCircleContainer: {
    position: 'relative',
    width: 90, // Match renderProgressCircle size
    height: 90, // Match renderProgressCircle size
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
  },
  circleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 5,
    textAlign: 'center',
  },
  summaryCounts: {
    alignItems: 'center',
    marginTop: 5,
  },
  countText: {
    fontSize: 13,
    color: '#5C7C9E',
  },
  countValue: {
    fontWeight: 'bold',
    color: '#34495E',
  },
  totalCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 5,
  },

  // Purchase Request Categories Styles
  categoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    width: '90%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E8F0',
    paddingTop: 20,
    paddingHorizontal: 0, // No horizontal padding for card itself, handled by inner elements
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 15, // Padding for the title
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E3E8DA', // Light green from the image
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D3DCE6',
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#34495E',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF1F7',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: '#4A5C6C',
    paddingVertical: 2,
    textAlign: 'center',
  },
  categoryHeader: {
    flex: 3,
    textAlign: 'left',
  },
  amountHeader: {
    flex: 1.5,
  },
  prHeader: {
    flex: 0.7,
  },
  awardedHeader: {
    flex: 1,
  },
  statusHeader: {
    flex: 1.5,
    textAlign: 'right',
  },
  categoryCell: {
    flex: 3,
    textAlign: 'left',
    fontSize: 11, // Slightly smaller font for long category names
  },
  amountCell: {
    flex: 1.5,
  },
  prCell: {
    flex: 0.7,
  },
  awardedCell: {
    flex: 1,
  },
  statusCell: {
    flex: 1.5,
    alignItems: 'flex-end', // Align status bar to the right
  },
  progressBarContainerSmall: {
    height: 15,
    backgroundColor: '#E0E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    width: '90%', // Adjust width as needed
    position: 'relative',
  },
  progressBarSmall: {
    height: '100%',
  },
  progressBarSmallText: {
    position: 'absolute',
    right: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#E3E8DA', // Light green background for totals row
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#D3DCE6',
    paddingHorizontal: 10,
    marginTop: -1, // Overlap border slightly
  },
  tableFooterText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#34495E',
    textAlign: 'center',
  },
});

export default TransactionsScreen;