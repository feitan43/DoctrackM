import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FlashList} from '@shopify/flash-list'; // Import FlashList

// Mock data to simulate an API call
const mockSurveys = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey Q3 2025',
    status: 'Open',
    responses: 125,
    creator: 'Marketing Team',
  },
  {
    id: '2',
    title: 'Employee Engagement Survey 2025',
    status: 'Closed',
    responses: 350,
    creator: 'HR Department',
  },
  {
    id: '3',
    title: 'Website Usability Feedback',
    status: 'Open',
    responses: 78,
    creator: 'Product Team',
  },
  {
    id: '4',
    title: 'New Product Concept Feedback',
    status: 'Draft',
    responses: 0,
    creator: 'R&D',
  },
];

// Refined color palette for a professional look
const colors = {
  primary: '#0057FF',
  background: '#F0F2F5',
  card: 'white',
  text: '#212529',
  subtleText: '#6C757D',
  border: '#DEE2E6',
  open: '#3CB371', // A more vibrant green
  closed: '#ADB5BD', // A lighter, more neutral gray
  draft: '#FFC300', // A professional amber
};

// Helper function for color-coding the status
const getStatusBadge = status => {
  switch (status) {
    case 'Open':
      return {text: 'Open', color: colors.open};
    case 'Closed':
      return {text: 'Closed', color: colors.closed};
    case 'Draft':
      return {text: 'Draft', color: colors.draft};
    default:
      return {text: 'Unknown', color: colors.closed};
  }
};

const SurveyCard = ({survey, onViewResponses, onEdit, onTakeSurvey}) => {
  const statusBadge = getStatusBadge(survey.status);
  const showResponsesButton = survey.status !== 'Draft' && survey.responses > 0;

  return (
    <View style={styles.surveyCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.surveyTitle}>{survey.title}</Text>
        <View
          style={[styles.statusBadge, {backgroundColor: statusBadge.color}]}>
          <Text style={styles.statusBadgeText}>{statusBadge.text}</Text>
        </View>
      </View>
      <Text style={styles.creatorText}>Created by: {survey.creator}</Text>
      <View style={styles.cardContent}>
        <View style={styles.responseInfo}>
          <Icon name="poll" size={20} color={colors.subtleText} />
          <Text style={styles.responsesText}>
            {survey.responses}{' '}
            {survey.responses === 1 ? 'response' : 'responses'}
          </Text>
        </View>
        <View style={styles.cardActions}>
          {survey.status === 'Open' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.takeSurveyButton]}
              onPress={() => onTakeSurvey(survey.id)}>
              <Icon
                name="play-circle-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.actionText, {color: colors.primary}]}>
                Take Survey
              </Text>
            </TouchableOpacity>
          )}
          {/* {showResponsesButton && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onViewResponses(survey.id)}
            >
              <Icon name="visibility" size={18} color={colors.subtleText} />
              <Text style={[styles.actionText, { color: colors.subtleText }]}>
                View Responses
              </Text>
            </TouchableOpacity>
          )} */}
          {/* {survey.status !== 'Closed' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(survey.id)}
            >
              <Icon name="edit" size={20} color={colors.subtleText} />
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    </View>
  );
};

const SurveysTab = ({showUnderDevelopment = true}) => {
  const navigation = useNavigation();
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setSurveys(mockSurveys);
    }, 500);
  }, []);

  const handleViewResponses = id => {
    console.log(`Viewing responses for survey ${id}`);
    navigation.navigate('ResponsesScreen', {surveyId: id});
  };

  const handleEdit = id => {
    console.log(`Editing survey ${id}`);
    navigation.navigate('SurveyEditor', {surveyId: id});
  };

  const handleTakeSurvey = id => {
    console.log(`Navigating to take survey ${id}`);
    navigation.navigate('TakeSurvey', {surveyId: id});
  };

  const handleCreateNew = () => {
    console.log('Navigating to Create New Survey screen');
    navigation.navigate('CreateSurvey');
  };

  const renderItem = ({item}) => (
    <SurveyCard
      survey={item}
      onViewResponses={handleViewResponses}
      onEdit={handleEdit}
      onTakeSurvey={handleTakeSurvey}
    />
  );

  if (showUnderDevelopment) {
    return (
      <View style={styles.underDevelopmentContainer}>
        <MaterialCommunityIcons name="tools" size={60} color="#cbd5e1" />
        <Text style={styles.underDevelopmentText}>
          This feature is currently **under development** and will be available
          soon. Please check back later for updates!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{/* Surveys */}</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
          <Icon name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>New Survey</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={surveys}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        estimatedItemSize={120} // Provide an estimated item size for better performance
        ListEmptyComponent={
          <View style={styles.emptyListTextContainer}>
            <Text style={styles.emptyListText}>
              No surveys found. Start by creating a new one!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  underDevelopmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  underDevelopmentText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6,
  },
  surveyCard: {
    backgroundColor: colors.card,
    marginHorizontal: 5,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  creatorText: {
    fontSize: 13,
    color: colors.subtleText,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responsesText: {
    fontSize: 15,
    color: colors.subtleText,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  takeSurveyButton: {
    backgroundColor: 'rgba(0, 87, 255, 0.1)',
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 8,
  },
  emptyListTextContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: colors.subtleText,
    textAlign: 'center',
  },
});

export default SurveysTab;
