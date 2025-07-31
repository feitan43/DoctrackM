import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, {Path, G, Text as SvgText} from 'react-native-svg';
import useUserInfo from '../../api/useUserInfo'; // Make sure this path is correct

const screenWidth = Dimensions.get('window').width;

const AppropriationScreen = ({navigation}) => {
  const {officeName} = useUserInfo(); // <-- This line is now uncommented and used

  // Data based on the provided image
  const appropriation = 373402674.8;
  const transaction = 28479496.17;
  const balance = appropriation - transaction;

  const pieChartData = [
    {
      name: 'Appropriation',
      population: balance, // Representing the remaining appropriation
      color: '#43a3e8', // Blue color from the image
    },
    {
      name: 'Transaction',
      population: transaction, // Representing the transactions
      color: '#fa6185', // Pink color from the image
    },
  ];

  const totalAmount = pieChartData.reduce(
    (sum, entry) => sum + entry.population,
    0,
  );

  const budgetBreakdownData = [
    {
      id: '1032-5',
      projectName:
        'Human Resource Management Information System-Administration and Maintenance Program',
      mode: 'MOOE',
      otherGeneralServices: {
        prCount: 1.0,
        vouchersCount: 12,
        balance: -588283.47,
        q1: 267343.47,
        q2: 273826.69,
        q3: 47314.31,
        q4: 0.0,
        statusPercentage: 588284.47,
        progressBarFill: 92,
        statusText: '588284.47%',
      },
    },
    {
      id: '1061-1',
      projectName: 'General Maintenance Management',
      mode: 'MOOE',
      otherGeneralServices: {
        prCount: 1.0,
        vouchersCount: 13,
        balance: -97196.5,
        q1: 45075.03,
        q2: 44682.84,
        q3: 7439.63,
        q4: 0.0,
        statusPercentage: 97196.5,
        progressBarFill: 97,
        statusText: '97196.50%',
      },
    },
  ];

  const radius = 100;
  const centerX = 120;
  const centerY = 120;
  const viewBoxSize = 240;

  const toRadians = angle => angle * (Math.PI / 180);

  const getCoordinatesForPercent = percent => {
    const x = centerX + radius * Math.cos(toRadians(percent));
    const y = centerY + radius * Math.sin(toRadians(percent));
    return {x, y};
  };

  const getCoordinatesForText = (angle, offsetRadius) => {
    const x = centerX + offsetRadius * Math.cos(toRadians(angle));
    const y = centerY + offsetRadius * Math.sin(toRadians(angle));
    return {x, y};
  };

  let currentAngle = 0;

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

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.backButtonRow}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'< Back'}</Text>
          </TouchableOpacity>
        </View>

        {/* This section remains for officeName and general header styling */}
        <View style={styles.headerSection}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{officeName}</Text>
            <Text style={styles.headerSubtitle}>DOCTRACK TRANSACTIONS</Text>
          </View>
        </View>

        {/* The Card containing the pie chart and budget summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Status</Text>
          <Text style={styles.cardSubtitle}>( PR - FY Charged )</Text>
          <View style={styles.chartContainer}>
            <Svg
              width={screenWidth * 0.8}
              height={viewBoxSize}
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              accessibilityLabel="Budget Allocation Pie Chart"
              role="img">
              <G originX={centerX} originY={centerY}>
                {pieChartData.map((entry, index) => {
                  const sliceAngle = (entry.population / totalAmount) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + sliceAngle;

                  const startCoords = getCoordinatesForPercent(startAngle);
                  const endCoords = getCoordinatesForPercent(endAngle);

                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                  const pathData = [
                    `M ${centerX},${centerY}`,
                    `L ${startCoords.x},${startCoords.y}`,
                    `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endCoords.x},${endCoords.y}`,
                    `L ${centerX},${centerY}`,
                    `Z`,
                  ].join(' ');

                  const percentage = (
                    (entry.population / totalAmount) *
                    100
                  ).toFixed(0);

                  const midAngle = startAngle + sliceAngle / 2;
                  const textOffsetRadius = radius * 0.65;
                  const {x: textX, y: textY} = getCoordinatesForText(
                    midAngle,
                    textOffsetRadius,
                  );

                  currentAngle = endAngle;

                  return (
                    <React.Fragment key={`slice-${index}`}>
                      <Path
                        d={pathData}
                        fill={entry.color}
                        stroke="#FFFFFF"
                        strokeWidth="4"
                      />
                      {percentage > 0 && (
                        <>
                          <SvgText
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize="16"
                            fontWeight="bold"
                            textAnchor="middle">
                            {percentage}%
                          </SvgText>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </G>
            </Svg>
          </View>

          <View style={styles.budgetSummaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Appropriation</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(appropriation)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Transaction</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(transaction)}
              </Text>
            </View>
            <View
              style={[
                styles.summaryItem,
                {borderTopWidth: 1, borderTopColor: '#EBF1F7'},
              ]}>
              <Text style={styles.summaryLabel}>{''}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(balance)}</Text>
            </View>
          </View>
        </View>

        {/* Budget Breakdown Section */}
        <View style={styles.breakdownSection}>
          {budgetBreakdownData.map((project, projectIndex) => (
            <View
              key={`project-${projectIndex}`}
              style={styles.projectContainer}>
              <View style={styles.projectHeader}>
                <View style={styles.projectNumberBox}>
                  <Text style={styles.projectNumber}>{projectIndex + 1}</Text>
                </View>
                <Text style={styles.projectName}>
                  {project.id} {project.projectName}
                </Text>
              </View>

              <View style={styles.breakdownContent}>
                <View style={styles.detailTypeContainer}>
                  <Text style={styles.detailType}>{project.mode}</Text>
                  <View style={styles.itemCard}>
                    <Text style={styles.itemDescription}>
                      Other General Services
                    </Text>
                    <View style={styles.appropriationItemRow}>
                      <Text style={styles.appropriationLabel}>PR Count</Text>
                      <Text style={styles.appropriationValue}>
                        {project.otherGeneralServices.prCount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.appropriationItemRow}>
                      <Text style={styles.appropriationLabel}>
                        Vouchers Count
                      </Text>
                      <Text style={styles.appropriationValue}>
                        {project.otherGeneralServices.vouchersCount}
                      </Text>
                    </View>
                    <View style={styles.appropriationItemRow}>
                      <Text style={styles.appropriationLabel}>Balance</Text>
                      <Text
                        style={[
                          styles.appropriationValue,
                          project.otherGeneralServices.balance < 0 &&
                            styles.negativeBalance,
                        ]}>
                        {formatCurrency(project.otherGeneralServices.balance)}
                      </Text>
                    </View>

                    <View style={styles.quartersRow}>
                      <View style={styles.quarterColumn}>
                        <Text style={styles.quarterLabel}>1st Qtr</Text>
                        <Text style={styles.quarterValue}>
                          {formatCurrency(project.otherGeneralServices.q1)}
                        </Text>
                      </View>
                      <View style={styles.quarterColumn}>
                        <Text style={styles.quarterLabel}>2nd Qtr</Text>
                        <Text style={styles.quarterValue}>
                          {formatCurrency(project.otherGeneralServices.q2)}
                        </Text>
                      </View>
                      <View style={styles.quarterColumn}>
                        <Text style={styles.quarterLabel}>3rd Qtr</Text>
                        <Text style={styles.quarterValue}>
                          {formatCurrency(project.otherGeneralServices.q3)}
                        </Text>
                      </View>
                      <View style={styles.quarterColumn}>
                        <Text style={styles.quarterLabel}>4th Qtr</Text>
                        <Text style={styles.quarterValue}>
                          {formatCurrency(project.otherGeneralServices.q4)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.prChargedRow}>
                      <Text style={styles.appropriationLabel}>Status</Text>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${project.otherGeneralServices.progressBarFill}%`,
                              backgroundColor:
                                project.otherGeneralServices.progressBarFill >
                                100
                                  ? '#90b73c'
                                  : '#db8f90',
                            },
                          ]}></View>
                        <Text style={styles.progressBarText}>
                          {project.otherGeneralServices.statusText}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
    //alignItems: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    width: '90%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E8F0',
    paddingBottom: 20,
    paddingTop: 20, // Added padding to the top of the card for the new titles
  },
  cardTitle: {
    // New style for "Budget Status" inside the card
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2C3E50',
  },
  cardSubtitle: {
    // New style for "General Fund" inside the card
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 24, // Space before the chart
    color: '#7F8C8D',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // paddingTop: 20, // This is now handled by card paddingTop
  },
  budgetSummaryContainer: {
    width: '90%',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5C6C',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34495E',
  },

  breakdownSection: {
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 24,
  },
  projectContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3e8da',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D3DCE6',
  },
  projectNumberBox: {
    backgroundColor: '#3d6613',
    borderRadius: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 10,
  },
  projectNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    flex: 1,
  },
  breakdownContent: {
    padding: 15,
  },
  detailTypeContainer: {
    marginBottom: 15,
  },
  detailType: {
    fontWeight: '700',
    fontSize: 13,
    color: '#5C7C9E',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  itemCard: {
    backgroundColor: '#FBFDFF',
    borderRadius: 0,
    padding: 20,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#EBF1F7',
  },
  itemDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
    marginBottom: 12,
  },
  appropriationItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appropriationLabel: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  appropriationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34495E',
    textAlign: 'right',
  },
  negativeBalance: {
    color: '#fa6185',
  },
  quartersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBF1F7',
  },
  quarterColumn: {
    alignItems: 'center',
    flex: 1,
  },
  quarterLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 3,
  },
  quarterValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495E',
  },
  prChargedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBF1F7',
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#E0E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'center',
    marginLeft: 15,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#90b73c',
  },
  progressBarText: {
    position: 'absolute',
    right: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AppropriationScreen;
