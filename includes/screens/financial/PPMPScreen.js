import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const PPMPScreen = () => {
  // Data for the pie chart, formatted for react-native-chart-kit
  const data = [
    {
      name: 'Purchase Request',
      population: 2197514, // Using 'population' as the value key for chart-kit
      color: '#FF69B4', // Pink for PR
      legendFontColor: '#7F7F7F', // Color for legend text
      legendFontSize: 15,
    },
    {
      name: 'PPMP',
      population: 515131, // Using 'population' as the value key for chart-kit
      color: '#4169E1', // Royal Blue for PPMP
      legendFontColor: '#7F7F7F', // Color for legend text
      legendFontSize: 15,
    },
  ];

  // Chart configuration for react-native-chart-kit
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Default color for labels/lines
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  // Calculate total for display
  const totalAmount = data.reduce((sum, entry) => sum + entry.population, 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Budget Summary</Text>
        <Text style={styles.subtitle}>General Fund</Text>

        <View style={styles.chartContainer}>
          <PieChart
            data={data}
            width={screenWidth * 0.8} // Adjust width based on screen size
            height={220}
            chartConfig={chartConfig}
            accessor="population" // Key to access value from data
            backgroundColor="transparent"
            paddingLeft="15" // Adjust padding as needed
            center={[10, 0]} // Center the chart
            absolute // Show absolute values in tooltip if needed
          />
        </View>

        {/* Custom Legend */}
        <View style={styles.legendContainer}>
          {data.map((entry, index) => (
            <View key={`legend-item-${index}`} style={styles.legendItem}>
              <View style={[styles.legendColorBox, { backgroundColor: entry.color }]}></View>
              <Text style={styles.legendText}>
                {entry.name}: {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(entry.population)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountText}>
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6', // bg-gray-100
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 12, // rounded-xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // shadow-lg
    padding: 24, // p-6
    width: '100%',
    maxWidth: 400, // max-w-md
    alignItems: 'center',
  },
  title: {
    fontSize: 24, // text-3xl (adjusted for better fit in RN)
    fontWeight: 'bold',
    marginBottom: 8, // mb-2
    color: '#1F2937', // text-gray-800
  },
  subtitle: {
    fontSize: 18, // text-xl (adjusted for better fit in RN)
    fontWeight: '500', // font-medium
    marginBottom: 24, // mb-6
    color: '#4B5563', // text-gray-600
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32, // mt-8 (adjusted to separate from legend)
  },
  legendContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 16, // mt-4
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // mb-2
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 8, // rounded-full
    marginRight: 8, // mr-2
  },
  legendText: {
    fontSize: 16, // text-lg
    fontWeight: '600', // font-semibold
    color: '#374151', // text-gray-700
  },
  totalAmountContainer: {
    marginTop: 32, // mt-8
    paddingTop: 16, // pt-4
    borderTopWidth: 2,
    borderColor: '#D1D5DB', // border-gray-300
    width: '100%',
    alignItems: 'center',
  },
  totalAmountText: {
    fontSize: 32, // text-4xl (adjusted for better fit in RN)
    fontWeight: '800', // font-extrabold
    color: '#111827', // text-gray-900
  },
});

export default PPMPScreen;
