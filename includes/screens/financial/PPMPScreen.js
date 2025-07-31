import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Svg, {Path, G, Text as SvgText} from 'react-native-svg';
import useUserInfo from '../../api/useUserInfo';
import Ionicons from 'react-native-vector-icons/Ionicons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get('window').width;

const PPMPScreen = ({navigation}) => {
  const {officeName} = useUserInfo();
  const pieChartData = [
    {
      name: 'PPMP',
      population: 2712645,
      color: '#43a3e8',
    },
    {
      name: 'PR',
      population: 2197514,
      color: '#fa6185',
    },
    
  ];

  const budgetBreakdownData = [
    {
      id: '1081-2',
      projectName: 'Accounting Records Management Project',
      details: [
        {
          type: 'CO',
          items: [
            {
              description: 'Information and Communication Technology Equipment',
              ppmp: 637200.0,
              pr: 637200.0,
              balance: 0.0,
              prCharged: 100,
            },
          ],
        },
        {
          type: 'MOOE',
          items: [
            {
              description: 'Other Supplies and Materials Expenses',
              ppmp: 16067.0,
              pr: 16000.0,
              balance: 67.0,
              prCharged: 100,
            },
          ],
        },
      ],
    },
    {
      id: '1081-1',
      projectName: 'Barangay Financial Management Project',
      details: [
        {
          type: 'CO',
          items: [
            {
              description: 'Information and Communication Technology Equipment',
              ppmp: 114000.0,
              pr: 114000.0,
              balance: 0.0,
              prCharged: 100,
            },
          ],
        },
      ],
    },
  ];

  const totalAmount = pieChartData.reduce(
    (sum, entry) => sum + entry.population,
    0,
  );

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

  const [expandedProjects, setExpandedProjects] = useState([]);

  const toggleExpand = projectId => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId],
    );
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.backButtonRow}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          {/* <Text style={styles.backButtonText}>{'< Back'}</Text> */}
          <Ionicons name="arrow-back" size={24} color="#252525" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{officeName}</Text>
              <Text style={styles.headerSubtitle}>DOCTRACK TRANSACTIONS</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Budget Summary</Text>
            <Text style={styles.subtitle}>General Fund</Text>

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

                    const nameYOffset = -8;
                    const percentageYOffset = 8;

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
                              y={textY + nameYOffset}
                              fill="white"
                              fontSize="14"
                              fontWeight="bold"
                              textAnchor="middle"
                              alignmentBaseline="baseline">
                              {entry.name}
                            </SvgText>
                            <SvgText
                              x={textX}
                              y={textY + percentageYOffset}
                              fill="white"
                              fontSize="14"
                              fontWeight="bold"
                              textAnchor="middle"
                              alignmentBaseline="hanging">
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

            <View style={styles.legendContainer}>
              {pieChartData.map((entry, index) => (
                <View key={`legend-item-${index}`} style={styles.legendItem}>
                  <Text style={styles.legendText}>
                    {entry.name}:{' '}
                    <View
                      style={[
                        styles.legendColorBox,
                        {backgroundColor: entry.color},
                      ]}></View>
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(entry.population)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}>
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(totalAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Budget Breakdown</Text>
            <Text style={styles.breakdownSubtitle}>( PPMP • PR Charged )</Text>

            {budgetBreakdownData.map((project, projectIndex) => {
              const isExpanded = expandedProjects.includes(project.id);
              return (
                <View
                  key={`project-${projectIndex}`}
                  style={styles.projectContainer}>
                  <TouchableOpacity
                    onPress={() => toggleExpand(project.id)}
                    style={styles.projectHeader}>
                    <View style={styles.projectNumberBox}>
                      <Text style={styles.projectNumber}>
                        {projectIndex + 1}
                      </Text>
                    </View>
                    <Text style={styles.projectName}>
                      {project.id} {project.projectName}
                    </Text>
                    <Text style={styles.expandCollapseIcon}>
                      {isExpanded ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.breakdownContent}>
                      {project.details.map((detail, detailIndex) => (
                        <View
                          key={`detail-${detailIndex}`}
                          style={styles.detailTypeContainer}>
                          <Text style={styles.detailType}>{detail.type}</Text>
                          {detail.items.map((item, itemIndex) => (
                            <View
                              key={`item-${itemIndex}`}
                              style={styles.itemCard}>
                              <Text style={styles.itemDescription}>
                                {item.description}
                              </Text>
                              <View style={styles.itemFinancialsRow}>
                                <View style={styles.financialColumn}>
                                  <Text style={styles.financialLabel}>
                                    PPMP
                                  </Text>
                                  <Text style={styles.financialValue}>
                                    {new Intl.NumberFormat('en-PH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(item.ppmp)}
                                  </Text>
                                </View>
                                <View style={styles.financialColumn}>
                                  <Text style={styles.financialLabel}>PR</Text>
                                  <Text style={styles.financialValue}>
                                    {new Intl.NumberFormat('en-PH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(item.pr)}
                                  </Text>
                                </View>
                                <View style={styles.financialColumn}>
                                  <Text style={styles.financialLabel}>
                                    Balance
                                  </Text>
                                  <Text style={styles.financialValue}>
                                    {new Intl.NumberFormat('en-PH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(item.balance)}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.prChargedRow}>
                                <Text style={styles.financialLabel}>
                                  PR Charged
                                </Text>
                                <View style={styles.progressBarContainer}>
                                  <View
                                    style={[
                                      styles.progressBar,
                                      {width: `${item.prCharged}%`},
                                    ]}></View>
                                  <Text style={styles.progressBarText}>
                                    {item.prCharged}%
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                          <View style={styles.typeTotalRow}>
                            <Text style={styles.typeTotalLabel}>
                              Total {detail.type}:
                            </Text>
                            <Text style={styles.typeTotalValueCompact}>
                              PPMP:{' '}
                              {new Intl.NumberFormat('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                detail.items.reduce(
                                  (sum, i) => sum + i.ppmp,
                                  0,
                                ),
                              )}
                            </Text>
                            <Text style={styles.typeTotalValueCompact}>
                              PR:{' '}
                              {new Intl.NumberFormat('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                detail.items.reduce((sum, i) => sum + i.pr, 0),
                              )}
                            </Text>
                            <Text style={styles.typeTotalValueCompact}>
                              Bal:{' '}
                              {new Intl.NumberFormat('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(
                                detail.items.reduce(
                                  (sum, i) => sum + i.balance,
                                  0,
                                ),
                              )}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
    marginTop: 80,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
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
    position: 'absolute',
    top: 0,
    zIndex: 100,
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
    //alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E8F0',
  },
  headerTextContainer: {rowGap: -10},
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    paddingVertical: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: '90%',
    alignItems: 'center',
    marginBottom: 24,
    borderColor: '#E0E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    color: '#7F8C8D',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  legendText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5C6C',
    textAlign: 'right',
  },
  totalAmountContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#E0E8F0',
    width: '100%',
    alignItems: 'center',
  },
  totalAmountText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#34495E',
  },
  breakdownSection: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 40,
  },
  breakdownSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
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
  expandCollapseIcon: {
    fontSize: 18,
    color: '#34495E',
    marginLeft: 10,
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
    padding: 15,
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
  itemFinancialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  financialColumn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  financialLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 3,
    textAlign: 'left',
  },
  financialValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34495E',
    textAlign: 'left',
  },
  prChargedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 15,
    backgroundColor: '#97bf8f',
    overflow: 'hidden',
    justifyContent: 'center',
    marginLeft: 15,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#90b73c',
    borderRadius: 5,
  },
  progressBarText: {
    position: 'absolute',
    right: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeTotalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E8F0',
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  typeTotalLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    width: '100%',
  },
  typeTotalValueCompact: {
    fontSize: 12,
    color: '#5C7C9E',
    fontWeight: '600',
    width: 'auto',
    textAlign: 'left',
    marginBottom: 5,
    marginRight: 15,
  },
});

export default PPMPScreen;
