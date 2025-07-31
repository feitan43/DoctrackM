import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Line, Circle, G, Text as SvgText, Rect, Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

// Dummy Data for demonstration
const waterBillData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [2000, 4500, 2800, 8000, 9900, 4300],
      color: 'rgba(30, 144, 255, 1)', // DodgerBlue - Keeping this blue
    },
  ],
};

const electricBillData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [2500, 3000, 4000, 3500, 5000, 4800],
      color: '#4682B4', // SteelBlue - Changed from Orange to a blue shade
    },
  ],
};

const wageData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      data: [120000, 150000, 130000, 160000],
      colors: ['#6495ED', '#87CEEB', '#ADD8E6', '#B0E0E6'], // Shades of blue for bars
    },
  ],
};

const transactionCategoryData = [
  {
    name: 'Water Bills',
    population: 30,
    color: '#1E90FF', // DodgerBlue - Keeping this
  },
  {
    name: 'Electric Bills',
    population: 25,
    color: '#4682B4', // SteelBlue - Changed from Orange
  },
  {
    name: 'Wages',
    population: 35,
    color: '#7B68EE', // MediumSlateBlue - Changed from MediumSeaGreen
  },
  {
    name: 'Others',
    population: 10,
    color: '#87CEFA', // LightSkyBlue - Changed from SlateBlue
  },
];

// Custom SVG Line Chart Component
const CustomLineChart = ({ data, width, height, chartTitle, lineColor }) => {
  const padding = 30; // Padding inside the SVG viewbox
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxDataValue = Math.max(...data.datasets[0].data);
  const minDataValue = Math.min(...data.datasets[0].data);

  // Function to scale Y-axis values
  const scaleY = (value) => {
    if (maxDataValue === minDataValue) {
      return chartHeight / 2;
    }
    return chartHeight - ((value - minDataValue) / (maxDataValue - minDataValue)) * chartHeight;
  };

  // Function to scale X-axis values
  const scaleX = (index) => {
    return (index / (data.labels.length - 1)) * chartWidth;
  };

  // Generate points for the line
  const points = data.datasets[0].data.map((value, index) => {
    const x = scaleX(index) + padding;
    const y = scaleY(value) + padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ width, height }}>
      <Svg height={height} width={width}>
        <G x={padding} y={padding}>
          {/* Y-axis labels and grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yPos = chartHeight * (1 - ratio);
            const value = minDataValue + ratio * (maxDataValue - minDataValue);
            return (
              <G key={`y-axis-${i}`}>
                <Line
                  x1="0"
                  y1={yPos}
                  x2={chartWidth}
                  y2={yPos}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <SvgText
                  x="-10"
                  y={yPos + 5}
                  fontSize="9" // Slightly smaller for less emphasis
                  fill="#777"
                  textAnchor="end"
                >
                  {Math.round(value)}
                </SvgText>
              </G>
            );
          })}

          {/* X-axis labels */}
          {data.labels.map((label, index) => (
            <SvgText
              key={`x-axis-${index}`}
              x={scaleX(index)}
              y={chartHeight + 20}
              fontSize="9" // Slightly smaller for less emphasis
              fill="#777"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}
        </G>

        {/* Line */}
        <Line
          x1={scaleX(0) + padding}
          y1={scaleY(data.datasets[0].data[0]) + padding}
          x2={scaleX(data.labels.length - 1) + padding}
          y2={scaleY(data.datasets[0].data[data.labels.length - 1]) + padding}
          stroke={lineColor}
          strokeWidth="3"
          points={points}
          fill="none"
        />

        {/* Data points */}
        {data.datasets[0].data.map((value, index) => (
          <Circle
            key={`point-${index}`}
            cx={scaleX(index) + padding}
            cy={scaleY(value) + padding}
            r="4"
            fill={lineColor}
            stroke="#FFF"
            strokeWidth="2"
          />
        ))}

        {/* Chart Title */}
        <SvgText
          x={width / 2}
          y={padding / 2 + 5}
          fontSize="16"
          fontWeight="bold"
          fill="#333"
          textAnchor="middle"
        >
          {chartTitle}
        </SvgText>
      </Svg>
    </View>
  );
};

// Custom SVG Bar Chart Component
const CustomBarChart = ({ data, width, height, chartTitle }) => {
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxDataValue = Math.max(...data.datasets[0].data);
  const barWidth = chartWidth / (data.labels.length * 1.5); // Adjust for spacing
  const barSpacing = barWidth / 2;

  // Function to scale Y-axis values
  const scaleY = (value) => {
    return chartHeight - (value / maxDataValue) * chartHeight;
  };

  return (
    <View style={{ width, height }}>
      <Svg height={height} width={width}>
        <G x={padding} y={padding}>
          {/* Y-axis labels and grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yPos = chartHeight * (1 - ratio);
            const value = ratio * maxDataValue;
            return (
              <G key={`y-axis-${i}`}>
                <Line
                  x1="0"
                  y1={yPos}
                  x2={chartWidth}
                  y2={yPos}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <SvgText
                  x="-10"
                  y={yPos + 5}
                  fontSize="9" // Slightly smaller for less emphasis
                  fill="#777"
                  textAnchor="end"
                >
                  {Math.round(value)}
                </SvgText>
              </G>
            );
          })}

          {/* Bars and X-axis labels */}
          {data.datasets[0].data.map((value, index) => {
            const x = index * (barWidth + barSpacing);
            const barHeight = (value / maxDataValue) * chartHeight;
            const y = chartHeight - barHeight;
            const barColor = data.datasets[0].colors[index];

            return (
              <G key={`bar-${index}`}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  rx="5" // Rounded corners
                  ry="5"
                />
                <SvgText // Value on top of bar
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                >
                  {Math.round(value / 1000) + 'K'}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fontSize="9" // Slightly smaller for less emphasis
                  fill="#777"
                  textAnchor="middle"
                >
                  {data.labels[index]}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* Chart Title */}
        <SvgText
          x={width / 2}
          y={padding / 2 + 5}
          fontSize="16"
          fontWeight="bold"
          fill="#333"
          textAnchor="middle"
        >
          {chartTitle}
        </SvgText>
      </Svg>
    </View>
  );
};

// Custom SVG Pie Chart Component
const CustomPieChart = ({ data, width, height, chartTitle }) => {
  const radius = Math.min(width, height) / 2 - 20; // Adjusted radius
  const centerX = width / 2;
  const centerY = height / 2;
  const total = data.reduce((sum, item) => sum + item.population, 0);

  let currentAngleForSlices = 0; // Tracks the cumulative angle for drawing slices

  return (
    <View style={{ width, height }}>
      <Svg height={height} width={width}>
        <G>
          {data.map((item, index) => {
            const sliceAngle = (item.population / total) * 2 * Math.PI;
            const endAngle = currentAngleForSlices + sliceAngle;
            const midAngle = currentAngleForSlices + sliceAngle / 2; // Midpoint for the current slice's label

            const x1 = centerX + radius * Math.cos(currentAngleForSlices);
            const y1 = centerY + radius * Math.sin(currentAngleForSlices);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
            const path = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

            // Update currentAngleForSlices for the next iteration
            currentAngleForSlices = endAngle;

            const labelX = centerX + (radius / 1.5) * Math.cos(midAngle);
            const labelY = centerY + (radius / 1.5) * Math.sin(midAngle);

            const percentage = ((item.population / total) * 100).toFixed(1);

            return (
              <G key={`pie-slice-${index}`}>
                <Path
                  d={path}
                  fill={item.color}
                  stroke="#FFF"
                  strokeWidth="2"
                />
                {/* Percentage Label */}
                <SvgText
                  x={labelX}
                  y={labelY}
                  fontSize="12"
                  fill="#FFF" // White text for contrast on colored slices
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {percentage}%
                </SvgText>
              </G>
            );
          })}

          {/* Legend items (rendered separately to avoid angle confusion) */}
          {data.map((item, index) => (
            <G key={`pie-legend-${index}`}>
              <Rect
                x={centerX + radius + 10} // Position legend to the right
                y={centerY - radius + index * 20}
                width="10"
                height="10"
                fill={item.color}
              />
              <SvgText
                x={centerX + radius + 25}
                y={centerY - radius + index * 20 + 9}
                fontSize="12"
                fill="#777"
              >
                {item.name}
              </SvgText>
            </G>
          ))}
        </G>

        {/* Chart Title */}
        <SvgText
          x={width / 2}
          y={20} // Position title at the top
          fontSize="16"
          fontWeight="bold"
          fill="#333"
          textAnchor="middle"
        >
          {chartTitle}
        </SvgText>
      </Svg>
    </View>
  );
};


const MayorScreen = () => {
  // Factual data derived from dummy data
  const latestWaterBill = waterBillData.datasets[0].data[waterBillData.datasets[0].data.length - 1];
  const latestElectricBill = electricBillData.datasets[0].data[electricBillData.datasets[0].data.length - 1];
  const totalWages = wageData.datasets[0].data.reduce((sum, val) => sum + val, 0);
  const topTransactionCategory = transactionCategoryData.reduce((prev, current) => (prev.population > current.population) ? prev : current);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="view-dashboard" size={30} color="#333" />
          <Text style={styles.headerTitle}>Davao City Dashboard</Text>
        </View>

        {/* Water Bills Card (Custom SVG) */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="water" size={20} color="#1E90FF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Water Bills (Monthly)</Text>
          </View>
          <Text style={styles.factualText}>Latest Bill (Jun): <Text style={styles.moneyValueText}>₱{latestWaterBill.toLocaleString()}</Text></Text>
          <Text style={styles.factualText}>Average Monthly: <Text style={styles.moneyValueText}>₱{(waterBillData.datasets[0].data.reduce((a, b) => a + b) / waterBillData.datasets[0].data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text></Text>
          <CustomLineChart
            data={waterBillData}
            width={screenWidth - 40} // Subtract padding
            height={220}
            chartTitle="Water Bills Trend"
            lineColor={waterBillData.datasets[0].color}
          />
        </View>

        {/* Electric Bills Card (Custom SVG Line Chart) */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="flash" size={20} color="#4682B4" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Electric Bills (Monthly)</Text>
          </View>
          <Text style={styles.factualText}>Latest Bill (Jun): <Text style={styles.moneyValueText}>₱{latestElectricBill.toLocaleString()}</Text></Text>
          <Text style={styles.factualText}>Average Monthly: <Text style={styles.moneyValueText}>₱{(electricBillData.datasets[0].data.reduce((a, b) => a + b) / electricBillData.datasets[0].data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text></Text>
          <CustomLineChart
            data={electricBillData}
            width={screenWidth - 40}
            height={220}
            chartTitle="Electric Bills Trend"
            lineColor={electricBillData.datasets[0].color}
          />
        </View>

        {/* Wages Chart (Custom SVG Bar Chart) */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="cash-multiple" size={20} color="#7B68EE" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Wages (Quarterly)</Text>
          </View>
          <Text style={styles.factualText}>Total Wages (YTD): <Text style={styles.moneyValueText}>₱{totalWages.toLocaleString()}</Text></Text>
          <Text style={styles.factualText}>Highest Quarter: <Text style={styles.moneyValueText}>₱{Math.max(...wageData.datasets[0].data).toLocaleString()}</Text></Text>
          <CustomBarChart
            data={wageData}
            width={screenWidth - 40}
            height={220}
            chartTitle="Wages Distribution"
          />
        </View>

        {/* Transaction Category Distribution (Custom SVG Pie Chart) */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="chart-pie" size={20} color="#1E90FF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Transaction Category Distribution</Text>
          </View>
          <Text style={styles.factualText}>Most Common Category: <Text style={styles.moneyValueText}>{topTransactionCategory.name} ({topTransactionCategory.population}%)</Text></Text>
          <CustomPieChart
            data={transactionCategoryData}
            width={screenWidth - 40}
            height={220}
            chartTitle="Transaction Categories"
          />
        </View>

        {/* Additional Info or Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.cardTitleContainer}>
            <Icon name="currency-usd" size={20} color="#1E90FF" style={styles.cardIcon} />
            <Text style={styles.summaryTitle}>Overall Financial Summary</Text>
          </View>
          <Text style={styles.summaryText}>
            Total Revenue: <Text style={styles.moneyValueText}>₱15,000,000 (YTD)</Text>
          </Text>
          <Text style={styles.summaryText}>
            Total Expenses: <Text style={styles.moneyValueText}>₱10,500,000 (YTD)</Text>
          </Text>
          <Text style={styles.summaryText}>
            Net Balance: <Text style={styles.moneyValueText}>₱4,500,000 (YTD)</Text>
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F7', // Very light blue background
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#A7D9EB', // A slightly deeper light blue for border
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333', // Keeping dark for contrast
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#F0F8FF', // AliceBlue - Changed from white to a very light blue tint
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    marginBottom: 15,
  },
  cardIcon: {
    marginRight: 8, // Space between icon and text
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333', // Keeping dark for contrast
  },
  factualText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  moneyValueText: {
    fontSize: 16, // Slightly larger for emphasis
    fontWeight: 'bold', // Bolder for emphasis
    color: '#1E90FF', // DodgerBlue for money values
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  summaryCard: {
    backgroundColor: '#E6F7FF', // Already a light blue, keeping it
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#1E90FF', // DodgerBlue - Keeping this strong blue accent
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E90FF', // Keeping this strong blue
  },
  summaryText: {
    fontSize: 16,
    color: '#555', // Keeping dark for readability
    marginBottom: 5,
  },
});

export default MayorScreen;
