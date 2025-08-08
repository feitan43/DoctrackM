import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {FlashList} from '@shopify/flash-list';

// --- Mock Survey Data (Embedded) ---
const MOCK_SURVEYS = [
  {
    id: 's001',
    title: 'Employee Satisfaction Survey Q3 2025',
    description: 'Share your feedback to help us improve your workplace experience.',
    status: 'Active',
    dueDate: '2025-08-15',
    participants: 120,
    questions: 10,
    category: 'Workplace Feedback',
  },
  {
    id: 's002',
    title: 'Inventory System Usability Feedback',
    description: 'Provide insights on the new inventory management system.',
    status: 'Active',
    dueDate: '2025-09-01',
    participants: 85,
    questions: 7,
    category: 'System Improvement',
  },
];
// --- End Mock Survey Data ---

export default function SurveysTab({navigation}) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState({});

  useEffect(() => {
    // Simulate fetching data with a delay
    setTimeout(() => {
      setSurveys(MOCK_SURVEYS);
      setLoading(false);
    }, 1500); // 1.5 second delay
  }, []);

  const toggleDescriptionExpansion = useCallback(surveyId => {
    setExpandedItems(prev => ({
      ...prev,
      [surveyId]: !prev[surveyId],
    }));
  }, []);

  const handleDescriptionLayout = useCallback((surveyId, event) => {
    const didTruncate = event.nativeEvent.lines.length > 2;
    setIsDescriptionTruncated(prev => ({
      ...prev,
      [surveyId]: didTruncate,
    }));
  }, []);

  // Function to handle "Take Survey" button press
  const handleTakeSurvey = useCallback(surveyId => {
    navigation.navigate('TakeSurvey', {surveyId: surveyId});
  }, [navigation]);
  

  // Function to handle "Create Survey" button press
  const handleCreateSurvey = useCallback(() => {
    navigation.navigate('CreateSurvey');
  }, [navigation]);

  const renderSurveyItem = useCallback(
    ({item}) => {
      const isExpanded = expandedItems[item.id];
      const isTruncated = isDescriptionTruncated[item.id];
      const shouldShowExpandButton = !isExpanded && isTruncated;

      const canTakeSurvey = item.status.toLowerCase() === 'active';

      return (
        <View style={styles.surveyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.surveyTitleContainer}>
              <Text style={styles.surveyTitle}>{item.title}</Text>
              <Text
                style={styles.surveyDescription}
                numberOfLines={isExpanded ? undefined : 2}
                ellipsizeMode="tail"
                onTextLayout={event => handleDescriptionLayout(item.id, event)}>
                {item.description}
              </Text>

              {shouldShowExpandButton && (
                <TouchableOpacity
                  onPress={() => toggleDescriptionExpansion(item.id)}
                  style={styles.expandButton}>
                  <Text style={styles.expandButtonText}>Show More</Text>
                </TouchableOpacity>
              )}
              {isExpanded && isTruncated && (
                <TouchableOpacity
                  onPress={() => toggleDescriptionExpansion(item.id)}
                  style={styles.expandButton}>
                  <Text style={styles.expandButtonText}>Show Less</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.statusBadge, styles[`status${item.status}`]]}>
              {item.status}
            </Text>
          </View>

          <View style={styles.surveyDetails}>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>Due Date </Text>
              <Text style={styles.infoValue}>{item.dueDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={18}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>Participants </Text>
              <Text style={styles.infoValue}>{item.participants || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="format-list-numbered"
                size={18}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>Questions </Text>
              <Text style={styles.infoValue}>{item.questions}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={18} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Category </Text>
              <Text style={styles.infoValue}>{item.category}</Text>
            </View>
          </View>

          {canTakeSurvey ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleTakeSurvey(item.id)}>
              <Text style={styles.actionButtonText}>Take Survey</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionButton, styles.disabledActionButton]}>
              <Text style={styles.actionButtonText}>Survey {item.status}</Text>
              {item.status.toLowerCase() === 'completed' && (
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              )}
              {item.status.toLowerCase() === 'upcoming' && (
                <Ionicons name="hourglass-outline" size={16} color="#fff" />
              )}
            </View>
          )}
        </View>
      );
    },
    [expandedItems, isDescriptionTruncated, toggleDescriptionExpansion, handleDescriptionLayout, handleTakeSurvey],
  );

  // Simple Shimmer Placeholder (you can replace with your actual Shimmer component)
  const ShimmerSurveyCardPlaceholder = () => (
    <View style={[styles.surveyCard, styles.shimmerCard]}>
      <View style={styles.shimmerContent}>
        <Shimmer style={styles.shimmerTitle} />
        <Shimmer style={styles.shimmerDescription} />
        <Shimmer style={styles.shimmerStatus} />
        {[...Array(4)].map((_, i) => (
          <View key={i} style={styles.shimmerInfoRow}>
            <Shimmer style={styles.shimmerIcon} />
            <Shimmer style={styles.shimmerText} />
          </View>
        ))}
        <Shimmer style={styles.shimmerActionButton} />
      </View>
    </View>
  );

  // A basic Shimmer component for demonstration (replace with your actual if available)
  const Shimmer = ({style}) => (
    <View style={[{backgroundColor: '#E0E0E0', borderRadius: 4}, style]} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Surveys</Text>
        {/* New: Create Survey Button */}
        <Pressable
          style={styles.createSurveyButton}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: true,
            radius: 20,
          }}
          onPress={handleCreateSurvey}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
        </Pressable>
      </LinearGradient>

      {/* Content Area */}
      {loading ? (
        <FlashList
          data={[1, 2]} // Display 2 shimmer placeholders for 2 sample data items
          renderItem={ShimmerSurveyCardPlaceholder}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={280} // Adjust based on your card height
        />
      ) : surveys.length > 0 ? (
        <FlashList
          data={surveys}
          renderItem={renderSurveyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={280}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <MaterialCommunityIcons
            name="comment-question-outline"
            size={80}
            color="#bbb"
          />
          <Text style={styles.emptyListText}>No active surveys</Text>
          <Text style={styles.emptyListSubText}>
            Check back later for new feedback opportunities!
          </Text>
        </View>
      )}
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
  createSurveyButton: { // New style for the create button in header
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  listContent: {
    padding: 16,
  },
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#1A508C',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  surveyTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  surveyDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  expandButton: {
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(26, 80, 140, 0.1)',
  },
  expandButtonText: {
    fontSize: 12,
    color: '#1A508C',
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  statusUpcoming: {
    backgroundColor: '#FFFDE7',
    color: '#F9A825',
    borderWidth: 1,
    borderColor: '#FFEE58',
  },
  statusCompleted: {
    backgroundColor: '#E0E0E0',
    color: '#616161',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  surveyDetails: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  infoIcon: {
    marginRight: 12,
    color: '#1A508C',
  },
  infoLabel: {
    fontSize: 12,
    color: '#555',
    lineHeight: 22,
  },
  infoValue: {
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#1A508C',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1A508C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  disabledActionButton: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0.1,
    borderColor: '#90A4AE',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  // Shimmer styles
  shimmerCard: {
    height: 280,
    justifyContent: 'flex-start',
  },
  shimmerContent: {
    flex: 1,
    padding: 20,
  },
  shimmerTitle: {
    height: 20,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  shimmerDescription: {
    height: 14,
    width: '95%',
    borderRadius: 4,
    marginBottom: 16,
  },
  shimmerStatus: {
    height: 16,
    width: 70,
    borderRadius: 8,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  shimmerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shimmerIcon: {
    height: 18,
    width: 18,
    borderRadius: 9,
    marginRight: 12,
  },
  shimmerText: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
  shimmerActionButton: {
    height: 45,
    width: '100%',
    borderRadius: 10,
    marginTop: 10,
  },
});