import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';

// These would need to be installed:
// For vector icons, you'll need to install react-native-vector-icons
// Example: yarn add react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons';

// Refined color palette for a professional look
const colors = {
  primary: '#0057FF',
  background: '#F0F2F5',
  card: 'white',
  text: '#212529',
  subtleText: '#6C757D',
  border: '#DEE2E6',
  accent: '#FFC300',
  success: '#3CB371', // A color for the progress bar
};

// Mock data to simulate fetching a full survey from an API
const mockSurveyData = {
  id: '1',
  title: 'Customer Satisfaction Survey',
  description: 'Thank you for your business! Please take a few moments to provide feedback on your recent experience with us.',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      questionText: 'How would you rate your overall satisfaction with our service?',
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    },
    {
      id: 'q2',
      type: 'open-ended',
      questionText: 'What did you like most about your experience?',
      placeholder: 'Enter your comments here...',
    },
    {
      id: 'q3',
      type: 'rating',
      questionText: 'How likely are you to recommend us to a friend or colleague?',
      rating: 5,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      questionText: 'Which of the following products did you purchase?',
      options: ['Product A', 'Product B', 'Product C', 'None of the above'],
    },
    {
      id: 'q5',
      type: 'open-ended',
      questionText: 'Do you have any other suggestions for us?',
      placeholder: 'Suggestions...',
    },
  ],
};

const TakeSurvey = ({ route, navigation }) => {
  // Extract the surveyId passed from the previous screen via navigation parameters.
  const { surveyId } = route.params;

  // State to hold the survey data (fetched from API in a real app)
  const [survey, setSurvey] = useState(null);
  // State to hold the user's responses
  const [responses, setResponses] = useState({});

  useEffect(() => {
    // In a real-world scenario, you would use the surveyId to fetch a full survey object.
    // We'll simulate this with our mock data.
    console.log(`TakeSurvey component mounted for survey ID: ${surveyId}`);
    setSurvey(mockSurveyData);
  }, [surveyId]);

  // Update a specific response in the state.
  // This function is also smarter about clearing responses for multiple-choice questions.
  const handleResponseChange = (questionId, value) => {
    setResponses(prevResponses => {
      // For multiple-choice, if the same option is tapped, toggle it off.
      if (prevResponses[questionId] === value) {
        const newResponses = { ...prevResponses };
        delete newResponses[questionId];
        return newResponses;
      }
      // For all other types, or if a new multiple-choice option is selected, set the response.
      return {
        ...prevResponses,
        [questionId]: value,
      };
    });
  };

  const handleSubmit = () => {
    console.log(`Submitting responses for survey ID: ${surveyId}`);
    console.log('User Responses:', responses);
    // In a real application, this would trigger an API call to save responses.
    // After a successful submission, you would navigate back or to a confirmation screen.
    navigation.goBack();
  };

  // Render a multiple-choice question
  const renderMultipleChoice = (question) => {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.questionText}</Text>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionContainer}
            onPress={() => handleResponseChange(question.id, option)}
          >
            <Icon
              name={responses[question.id] === option ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color={responses[question.id] === option ? colors.primary : colors.subtleText}
            />
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render an open-ended question with a text input
  const renderOpenEnded = (question) => {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.questionText}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={question.placeholder}
          placeholderTextColor={colors.subtleText}
          multiline
          value={responses[question.id] || ''}
          onChangeText={(text) => handleResponseChange(question.id, text)}
        />
      </View>
    );
  };

  // Render a star rating question
  const renderRating = (question) => {
    const ratingValue = responses[question.id] || 0;
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.questionText}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleResponseChange(question.id, star)}
              style={styles.starButton}
            >
              <Icon
                name={star <= ratingValue ? 'star' : 'star-border'}
                size={30}
                color={star <= ratingValue ? colors.accent : colors.subtleText}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // The main function to render each question based on its type
  const renderSurveyItem = ({ item }) => {
    switch (item.type) {
      case 'multiple-choice':
        return renderMultipleChoice(item);
      case 'open-ended':
        return renderOpenEnded(item);
      case 'rating':
        return renderRating(item);
      default:
        return null;
    }
  };

  // Render the header component for the FlatList, including the survey description
  const renderHeader = () => (
    <View>
      <Text style={styles.surveyTitle}>{survey.title}</Text>
      <Text style={styles.surveyDescription}>{survey.description}</Text>
    </View>
  );

  // Render the footer component for the FlatList, containing the submit button
  const renderFooter = () => (
    <TouchableOpacity
      style={styles.submitButton}
      onPress={handleSubmit}
    >
      <Text style={styles.submitButtonText}>Submit Survey</Text>
    </TouchableOpacity>
  );

  if (!survey) {
    // Show a loading indicator while the survey is being fetched
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading survey...</Text>
      </SafeAreaView>
    );
  }

  // Calculate survey progress
  const totalQuestions = survey.questions.length;
  const answeredQuestions = Object.keys(responses).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Survey</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>{`${answeredQuestions}/${totalQuestions} Answered`}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <FlatList
        data={survey.questions}
        keyExtractor={(item) => item.id}
        renderItem={renderSurveyItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 50,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: colors.subtleText,
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subtleText,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  listContentContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding to the bottom to make space for the submit button
  },
  surveyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  surveyDescription: {
    fontSize: 16,
    color: colors.subtleText,
    marginBottom: 20,
  },
  questionContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  // Styles for multiple-choice questions
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  // Styles for open-ended questions
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top', // For Android
  },
  // Styles for rating questions
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    margin: 16,
    borderRadius: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default TakeSurvey;
