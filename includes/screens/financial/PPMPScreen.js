import React, {useState, useEffect, useMemo} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Svg, {Path, G, Text as SvgText} from 'react-native-svg';
import useUserInfo from '../../api/useUserInfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {usePPMP} from '../../hooks/useFinancial';
import {insertCommas} from '../../utils/insertComma';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get('window').width;

const PPMPScreen = ({navigation}) => {
  const {officeName, officeCode} = useUserInfo();
  const {data, isLoading, error} = usePPMP(officeCode);

  const pieChartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let totalPPMP = 0;
    let totalPR = 0;

    data.forEach(item => {
      totalPPMP += parseFloat(item.PPMP || 0);
      totalPR += parseFloat(item.PR || 0);
    });

    return [
      {
        name: 'PPMP',
        population: totalPPMP,
        color: '#43a3e8',
      },
      {
        name: 'PR',
        population: totalPR,
        color: '#fa6185',
      },
    ];
  }, [data]);

  const budgetBreakdownData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const mergedFundsMap = {};

    data.forEach(programItem => {
      const fundName = programItem.Fund || 'Unspecified Fund';
      const programCode = programItem.Program;
      const programName = programItem.ProgramName;
      const projectKey = `${programCode}-${programName}`;

      if (!mergedFundsMap[fundName]) {
        mergedFundsMap[fundName] = {
          fundName: fundName,
          projects: {},
        };
      }

      if (!mergedFundsMap[fundName].projects[projectKey]) {
        mergedFundsMap[fundName].projects[projectKey] = {
          id: programCode,
          projectName: programName,
          details: {},
        };
      }

      const fundType = programItem.AccountFundType || 'Unspecified Fund Type';
      if (!mergedFundsMap[fundName].projects[projectKey].details[fundType]) {
        mergedFundsMap[fundName].projects[projectKey].details[fundType] = {
          type: fundType,
          items: [],
        };
      }

      const exists = mergedFundsMap[fundName].projects[projectKey].details[
        fundType
      ].items.find(
        existing =>
          existing.description === programItem.AccountTitle &&
          existing.ppmp === parseFloat(programItem.PPMP || 0) &&
          existing.pr === parseFloat(programItem.PR || 0),
      );

      if (!exists) {
        const ppmpVal = parseFloat(programItem.PPMP || 0);
        const prVal = parseFloat(programItem.PR || 0);
        const prChargedVal = ppmpVal > 0 ? (prVal / ppmpVal) * 100 : 0;

        mergedFundsMap[fundName].projects[projectKey].details[
          fundType
        ].items.push({
          description: programItem.AccountTitle,
          ppmp: ppmpVal,
          pr: prVal,
          balance: parseFloat(programItem.Balance || 0),
          prCharged: prChargedVal,
          program: programItem.Program,
          fund: programItem.Fund,
          account: programItem.Account,
        });
      }
    });

    const result = Object.values(mergedFundsMap).map(fund => ({
      ...fund,
      projects: Object.values(fund.projects).map(project => ({
        ...project,
        details: Object.values(project.details).sort((a, b) => {
          const fundOrder = ['CO', 'MOOE'];

          const indexA = fundOrder.indexOf(a.type);
          const indexB = fundOrder.indexOf(b.type);

          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          } else if (indexA !== -1) {
            return -1;
          } else if (indexB !== -1) {
            return 1;
          } else {
            return a.type.localeCompare(b.type);
          }
        }),
      })),
    }));

    result.forEach(fund => {
      fund.projects.forEach(project => {
        project.details.forEach(detail => {
          detail.items.sort((a, b) =>
            a.description.localeCompare(b.description),
          );
        });
      });
    });

    return result;
  }, [data]);

  const totalPieChartAmount = pieChartData.reduce(
    (sum, entry) => sum + entry.population,
    0,
  );

  const ppmpAmount =
    pieChartData.find(entry => entry.name === 'PPMP')?.population || 0;
  const prAmount =
    pieChartData.find(entry => entry.name === 'PR')?.population || 0;
  const differenceAmount = ppmpAmount - prAmount;

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#43a3e8" />
        <Text style={styles.loadingText}>Loading PPMP Data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={30} color="#dc3545" />
        <Text style={styles.errorText}>Failed to load PPMP data.</Text>
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

  return (
    <View style={styles.outerContainer}>
      <View style={styles.backButtonRow}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
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
              {totalPieChartAmount > 0 ? (
                <Svg
                  width={screenWidth * 0.8}
                  height={viewBoxSize}
                  viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                  accessibilityLabel="Budget Allocation Pie Chart"
                  role="img">
                  <G originX={centerX} originY={centerY}>
                    {pieChartData.map((entry, index) => {
                      const sliceAngle =
                        (entry.population / totalPieChartAmount) * 360;
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

                      const percentage = Math.round(
                        (entry.population / totalPieChartAmount) * 100,
                      );

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
              ) : (
                <Text style={styles.noDataText}>
                  No budget data available for chart.
                </Text>
              )}
            </View>

            <View style={styles.legendContainer}>
              {pieChartData.map((entry, index) => (
                <View key={`legend-item-${index}`} style={styles.legendItem}>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      marginRight: 10,
                      fontSize: 14,
                      fontWeight: '400',
                      color: '#4A5C6C',
                    }}>
                    {entry.name === 'PR' ? 'Purchase Request' : entry.name}
                  </Text>
                  <View
                    style={[
                      styles.legendColorBox,
                      {backgroundColor: entry.color, marginRight: 10},
                    ]}
                  />
                  <Text style={[styles.legendText, {textAlign: 'left'}]}>
                    {insertCommas(entry.population.toFixed(2))}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}>
                {insertCommas(differenceAmount.toFixed(2))}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Budget Breakdown</Text>
            <Text style={styles.breakdownSubtitle}>( PPMP • PR Charged )</Text>

            {budgetBreakdownData.length > 0 ? (
              budgetBreakdownData.map((fund, fundIndex) => (
                <View key={`fund-${fundIndex}`} style={styles.fundContainer}>
                  <Text style={styles.fundTitle}>{fund.fundName}</Text>
                  {fund.projects.map((project, projectIndex) => {
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
                            <Text style={{color: '#b88128'}}>{project.id}</Text>{' '}
                            {project.projectName}
                          </Text>
                          <Text style={styles.expandCollapseIcon}>
                            {isExpanded ? '▲' : '▼'}
                          </Text>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.breakdownContent}>
                            {project.details.map((detail, detailIndex) => {
                              const totalPPMPForType = detail.items.reduce(
                                (sum, i) => sum + i.ppmp,
                                0,
                              );
                              const totalPRForType = detail.items.reduce(
                                (sum, i) => sum + i.pr,
                                0,
                              );
                              const totalBalanceForType = detail.items.reduce(
                                (sum, i) => sum + i.balance,
                                0,
                              );

                              const totalPRChargedForType =
                                totalPPMPForType > 0
                                  ? (totalPRForType / totalPPMPForType) * 100
                                  : 0;

                              return (
                                <View
                                  key={`detail-${detailIndex}`}
                                  style={styles.detailTypeContainer}>
                                  <Text style={styles.detailType}>
                                    {detail.type}
                                  </Text>
                                  {detail.items.map((item, itemIndex) => (
                                    <View
                                      key={`item-${itemIndex}`}
                                      style={styles.itemCard}>
                                      <TouchableOpacity
                                        onPress={() =>
                                          navigation.navigate('PPMPDetails', {
                                            fund: fund.fundName,
                                            program: project.id,
                                            account: item.account, // Pass the Account number here
                                          })
                                        }>
                                        <Text style={styles.itemDescription}>
                                          {item.description}
                                        </Text>
                                      </TouchableOpacity>
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
                                          <Text style={styles.financialLabel}>
                                            PR
                                          </Text>
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
                                        <View
                                          style={styles.progressBarContainer}>
                                          <View
                                            style={[
                                              styles.progressBar,
                                              {
                                                width: `${Math.min(
                                                  100,
                                                  item.prCharged,
                                                )}%`,
                                              },
                                              item.prCharged > 100 &&
                                                styles.progressBarOvercharged,
                                            ]}></View>
                                          <Text
                                            style={[
                                              styles.progressBarText,
                                              item.prCharged > 100 &&
                                                styles.progressBarTextOvercharged,
                                            ]}>
                                            {Math.round(
                                              item.prCharged.toFixed(2),
                                            )}
                                            %
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                  <View style={styles.typeTotalRow}>
                                    <Text style={styles.typeTotalLabel}>
                                      Total {detail.type}:
                                    </Text>
                                    <View style={styles.totalFinancialColumn}>
                                      <Text style={styles.financialLabel}>
                                        PPMP
                                      </Text>
                                      <Text style={styles.typeTotalValue}>
                                        {new Intl.NumberFormat('en-PH', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(totalPPMPForType)}
                                      </Text>
                                    </View>
                                    <View style={styles.totalFinancialColumn}>
                                      <Text style={styles.financialLabel}>
                                        PR
                                      </Text>
                                      <Text style={styles.typeTotalValue}>
                                        {new Intl.NumberFormat('en-PH', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(totalPRForType)}
                                      </Text>
                                    </View>
                                    <View style={styles.totalFinancialColumn}>
                                      <Text style={styles.financialLabel}>
                                        Balance
                                      </Text>
                                      <Text style={styles.typeTotalValue}>
                                        {new Intl.NumberFormat('en-PH', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(totalBalanceForType)}
                                      </Text>
                                    </View>
                                    <View style={styles.prChargedTotalRow}>
                                      <Text style={styles.financialLabel}>
                                        PR Charged (Total)
                                      </Text>
                                      <View style={styles.progressBarContainer}>
                                        <View
                                          style={[
                                            styles.progressBar,
                                            {
                                              width: `${Math.min(
                                                100,
                                                totalPRChargedForType,
                                              )}%`,
                                            },
                                            totalPRChargedForType > 100 &&
                                              styles.progressBarOvercharged,
                                          ]}></View>
                                        <Text
                                          style={[
                                            styles.progressBarText,
                                            totalPRChargedForType > 100 &&
                                              styles.progressBarTextOvercharged,
                                          ]}>
                                          {Math.round(
                                            totalPRChargedForType.toFixed(2),
                                          )}
                                          %
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>
                No project breakdown data available.
              </Text>
            )}
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
  headerSection: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2C3E50',
    paddingTop: 20,
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
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  legendText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5C6C',
    textAlign: 'left',
  },
  totalAmountContainer: {
    marginTop: 20,
    paddingTop: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#E0E8F0',
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C7C9E',
    marginBottom: 5,
  },
  totalAmountText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#34495E',
  },
  breakdownSection: {
    width: '90%',
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 20,
  },
  breakdownSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  fundContainer: {
    width: '100%',
  },
  fundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    paddingHorizontal: 15,
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
    //alignItems: 'center',
    backgroundColor: '#e3e8da',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D3DCE6',
  },
  projectNumberBox: {
    borderRadius: 4,
    //paddingHorizontal: 9,
    //paddingVertical: 4,
    marginRight: 10,
  },
  projectNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    backgroundColor: '#3d6613',
    paddingHorizontal: 10,
    borderRadius:4
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
    borderRadius: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#90b73c',
    borderRadius: 5,
  },
  progressBarOvercharged: {
    backgroundColor: '#dc3545',
  },
  progressBarText: {
    position: 'absolute',
    right: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarTextOvercharged: {
    color: '#FFFFFF',
  },
  typeTotalRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E8F0',
    backgroundColor: '#dbe0cc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  typeTotalLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  totalFinancialColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  typeTotalValue: {
    fontSize: 15,
    color: '#34495E',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  prChargedTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D3DCE6',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
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
    backgroundColor: '#F7F9FC',
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
  noDataText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    padding: 20,
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
});

export default PPMPScreen;
