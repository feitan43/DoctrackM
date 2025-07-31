import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle, G, Path, Text as SvgText, Defs, RadialGradient, Stop, Filter, FeGaussianBlur, FeOffset, FeColorMatrix, FeMerge, FeMergeNode} from 'react-native-svg';

const {width} = Dimensions.get('window');
const CHART_SIZE = width * 0.6; 
const RADIUS = CHART_SIZE / 2;
const CENTER_X = CHART_SIZE / 2;
const CENTER_Y = CHART_SIZE / 2;


const budgetData = [
  {name: 'PR', value: 81, color: '#FF6384', amount: 2197514.00}, // Pink
  {name: 'PPMP', value: 19, color: '#36A2EB', amount: 2712645.00}, // Blue
];

const totalNumericalAmount = budgetData.reduce((sum, item) => sum + item.amount, 0);
const differenceAmount = budgetData[1].amount - budgetData[0].amount; // PPMP - Purchase Request

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z',
  ].join(' ');
  return d;
};

export default function PPMPScreen({navigation}) {
  let currentAngle = 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A508C', '#0D3B66']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Pressable
          style={styles.backButton}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: true,
            radius: 20,
          }}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>PPMP</Text>
        <View style={{width: 40}} /> 
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.summaryTitle}>Budget Summary</Text>
        <Text style={styles.subTitle}>General Fund</Text>

        <View style={styles.chartContainer}>
          <Svg height={CHART_SIZE} width={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
            <Defs>
              <RadialGradient id="gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.2)" stopOpacity="1" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity="0" />
              </RadialGradient>

              <Filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <FeGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
                <FeOffset in="blur" dx="0" dy="5" result="offsetBlur" />
                <FeColorMatrix in="offsetBlur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.2 0" result="offsetBlurAlpha" />
                <FeMerge>
                  <FeMergeNode in="offsetBlurAlpha" />
                  <FeMergeNode in="SourceGraphic" />
                </FeMerge>
              </Filter>
            </Defs>

            <G filter="url(#drop-shadow)">
              {budgetData.map((slice, index) => {
                const startAngle = currentAngle;
                const endAngle = currentAngle + (slice.value / 100) * 360;
                const pathData = describeArc(CENTER_X, CENTER_Y, RADIUS, startAngle, endAngle);

                const midAngle = startAngle + (endAngle - startAngle) / 2;
                const textRadius = RADIUS * 0.7; 
                const textX = CENTER_X + textRadius * Math.cos((midAngle - 90) * Math.PI / 180);
                const textY = CENTER_Y + textRadius * Math.sin((midAngle - 90) * Math.PI / 180);

                currentAngle = endAngle;

                return (
                  <G key={slice.name}>
                    <Path d={pathData} fill={slice.color} />
                    <SvgText
                      x={textX}
                      y={textY}
                      fill="#fff" // White text for contrast
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {`${slice.name} ${slice.value}%`}
                    </SvgText>
                  </G>
                );
              })}
              <Circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={RADIUS * 0.8} // Slightly smaller inner circle
                fill="url(#gradient)" // Use radial gradient for subtle shadow
              />
            </G>
          </Svg>
        </View>

        {/* Legend and Summary */}
        <View style={styles.legendContainer}>
          {budgetData.map(item => (
            <View key={item.name} style={styles.legendItem}>
              <Text style={styles.legendLabel}>{item.name}</Text>
              <View style={[styles.legendColorBox, {backgroundColor: item.color}]} />
              <Text style={styles.legendAmount}>
                {item.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
          <View style={styles.legendItem}>
            <Text style={styles.legendLabel}>Purchase Request</Text>
            <View style={[styles.legendColorBox, {backgroundColor: budgetData[0].color}]} />
            <Text style={styles.legendAmount}>
                {budgetData[0].amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </Text>
          </View>
          <View style={styles.differenceRow}>
            <Text style={styles.differenceText}>
              {differenceAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  legendContainer: {
    width: '80%',
    marginTop: 20,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  legendLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    minWidth: 150, // Ensure label takes enough space
  },
  legendColorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1, // Take remaining space
    textAlign: 'right',
  },
  differenceRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    width: '100%',
    alignItems: 'flex-end',
  },
  differenceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A508C',
  },
});