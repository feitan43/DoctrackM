import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Pressable,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useEvaluatorAnnualSummary} from '../../hooks/useEvaluatorAnnualSummary';
import Svg, {Circle, Text as SvgText, G, Rect} from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const chartSize = 200;
const radius = chartSize / 2.5;
const strokeWidth = 30;

const EvalAnnual = () => {
  const navigation = useNavigation();
  const startYear = 2023;
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from(
    {length: currentYear - startYear + 1},
    (_, index) => startYear + index,
  );

  const [selectedYear, setSelectedYear] = useState(null);
  const {data} = useEvaluatorAnnualSummary(selectedYear);
  const colors = ['#1a508c', '#00aaff', '#FF3E3E'];

  const categories = ['On Eval', 'Evaluated', 'Pending at CAO'];
  const values =
    data?.length > 0
      ? [
          parseInt(data[0].TotalOnEvaluation) || 0,
          parseInt(data[0].TotalEvaluated) || 0,
          parseInt(data[0].TotalPendingCAO) || 0,
        ]
      : [0, 0, 0];

  const totalValue = parseInt(data?.[0]?.GrandTotal) || 1; // Avoid division by zero

  const percentages = values.map(value => (value / totalValue) * 100);

  const calculateOffset = index => {
    const circumference = 2 * Math.PI * radius;
    const previousPercentage = percentages
      .slice(0, index)
      .reduce((sum, percent) => sum + percent, 0);
    return (previousPercentage / 100) * circumference;
  };

  return (
    <View style={styles.safeContainer}>
      <ImageBackground
        source={require('../../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>{/* Annual Reports */}</Text>
        </View>
      </ImageBackground>

      <ScrollView style={styles.listContainer}>
        <Text style={styles.listTitle}>Annual Reports</Text>
        {yearsList.map((year, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.listItem,
              selectedYear === year && styles.expandedReport,
            ]}
            onPress={() => setSelectedYear(year)}>
            <Text style={styles.listItemText}>{year} Report</Text>
          </TouchableOpacity>
        ))}

        {selectedYear && data?.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Evaluation Metrics</Text>
            <Svg width={chartSize} height={chartSize}>
              <G transform={`translate(${chartSize / 2}, ${chartSize / 2})`}>
                {values.map((value, index) => {
                  if (value === 0) return null;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDasharray =
                    (percentages[index] / 100) * circumference;
                  const strokeDashoffset = -calculateOffset(index);

                  const angle =
                    ((calculateOffset(index) + strokeDasharray / 2) /
                      circumference) *
                    360;
                  const angleRad = (angle * Math.PI) / 180;
                  const textX = (radius - strokeWidth / 2) * Math.cos(angleRad);
                  const textY = (radius - strokeWidth / 2) * Math.sin(angleRad);

                  return (
                    <G key={index}>
                    <Circle
                      r={radius}
                      cx={0}
                      cy={0}
                      fill="transparent"
                      stroke={colors[index]}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${strokeDasharray} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                    
                    {/* Background for percentage text */}
                   {/*  <Rect
                      x={textX - 15} // Adjust the background size
                      y={textY - 8} // Adjust the background size
                      width={30} // Width of background
                      height={15} // Height of background
                      rx={2} // Rounded corners
                      fill="rgba(255, 251, 22, 0.5)"
                    /> */}
                    
                    {/* Percentage Text */}
                    <SvgText
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#252525">
                      {percentages[index].toFixed(1)}%
                    </SvgText>
                  </G>
                  
                  );
                })}

                {/* Center Total Value */}
                <SvgText
                  x={0}
                  y={-10} // Adjusted position for total value
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="bold"
                  fill="#333">
                  {totalValue}
                </SvgText>
                <SvgText
                  x={0}
                  y={15} // Positioned below the total value
                  textAnchor="middle"
                  fontSize="14"
                  //fontWeight="bold"
                  fill="#666">
                  Total
                </SvgText>
              </G>
            </Svg>

            <View style={styles.legendContainer}>
              {categories.map((category, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      {backgroundColor: colors[index]},
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {category}: <Text style={{fontWeight: 'bold'}}>{values[index]}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 4,
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
  listContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  expandedReport: {
    backgroundColor: '#E5E7EB',
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  chartContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 10,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
});

export default EvalAnnual;
