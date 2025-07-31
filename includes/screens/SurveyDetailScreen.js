import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView, // Added for scrollable content
  TextInput, // For text input questions
  TouchableOpacity, // For options/buttons
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {FlashList} from '@shopify/flash-list'; // If you have many questions, FlashList could be useful here

// --- MOCK SURVEY DETAILS DATA ---
const MOCK_SURVEY_DETAILS = {
  's001': {
    title: 'Employee Satisfaction Survey Q3 2025',
    description: 'Help us improve your workplace experience by sharing your valuable feedback.',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'How satisfied are you with your current work-life balance?',
        options: [
          {id: 'opt1', text: 'Very Satisfied'},
          {id: 'opt2', text: 'Satisfied'},
          {id: 'opt3', text: 'Neutral'},
          {id: 'opt4', text: 'Dissatisfied'},
          {id: 'opt5', text: 'Very Dissatisfied'},
        ],
        required: true,
      },
      {
        id: 'q2',
        type: 'text-input',
        questionText: 'What is one thing you believe could significantly improve employee morale?',
        placeholder: 'Your suggestion here...',
        required: false,
      },
      {
        id: 'q3',
        type: 'single-select',
        questionText: 'Which benefit is most important to you?',
        options: [
          {id: 'b1', text: 'Health Insurance'},
          {id: 'b2', text: 'Paid Time Off'},
          {id: 'b3', text: 'Professional Development'},
          {id: 'b4', text: 'Retirement Plan'},
        ],
        required: true,
      },
      {
        id: 'q4',
        type: 'rating',
        questionText: 'Rate the effectiveness of internal communication (1-5, 5 being excellent).',
        min: 1,
        max: 5,
        required: true,
      },
    ],
  },
  's002': {
    title: 'Inventory System Usability Feedback',
    description: 'Provide insights on the new inventory management system.',
    questions: [
      {
        id: 'q5',
        type: 'multiple-choice',
        questionText: 'How easy is it to find items using the new system?',
        options: [
          {id: 'optA', text: 'Very Easy'},
          {id: 'optB', text: 'Easy'},
          {id: 'optC', text: 'Moderate'},
          {id: 'optD', text: 'Difficult'},
          {id: 'optE', text: 'Very Difficult'},
        ],
        required: true,
      },
      {
        id: 'q6',
        type: 'text-input',
        questionText: 'What features would you like to see added to the inventory system?',
        placeholder: 'Describe desired features...',
        required: false,
      },
      {
        id: 'q7',
        type: 'single-select',
        questionText: 'How often do you use the new system?',
        options: [
          {id: 'u1', text: 'Daily'},
          {id: 'u2', text: 'Weekly'},
          {id: 'u3', text: 'Monthly'},
          {id: 'u4', text: 'Rarely'},
        ],
        required: true,
      },
    ],
  },
};
// --- END MOCK SURVEY DETAILS DATA ---

export default function SurveyDetailScreen({route, navigation}) {
  const {surveyId} = route.params;
  const [surveyDetails, setSurveyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // State to hold user's answers

  useEffect(() => {
    setLoading(true);
    // Simulate fetching survey details from an API
    setTimeout(() => {
      const details = MOCK_SURVEY_DETAILS[surveyId];
      setSurveyDetails(details);
      setLoading(false);
      // Initialize answers state based on questions
      if (details && details.questions) {
        const initialAnswers = {};
        details.questions.forEach(q => {
          initialAnswers[q.id] = ''; // Or empty array for multi-select
        });
        setAnswers(initialAnswers);
      }
    }, 1000); // Simulate a network delay
  }, [surveyId]);

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  }, []);

  const handleSubmitSurvey = () => {
    console.log('Submitting Survey:', surveyId, 'Answers:', answers);
    // Here you would typically send the answers to your backend
    alert('Survey Submitted! (Mock)');
    navigation.goBack(); // Go back after submission
  };

  const renderQuestion = useCallback((question) => {
    switch (question.type) {
      case 'multiple-choice':
      case 'single-select':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.questionText}
              {question.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
            {question.options.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  answers[question.id] === option.id && styles.selectedOption,
                ]}
                onPress={() => handleAnswerChange(question.id, option.id)}>
                <MaterialCommunityIcons
                  name={answers[question.id] === option.id ? 'radiobox-marked' : 'radiobox-blank'}
                  size={20}
                  color={answers[question.id] === option.id ? '#1A508C' : '#888'}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'text-input':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.questionText}
              {question.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={question.placeholder || 'Type your answer here...'}
              multiline={true}
              numberOfLines={4}
              value={answers[question.id]}
              onChangeText={text => handleAnswerChange(question.id, text)}
            />
          </View>
        );
      case 'rating':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {question.questionText}
              {question.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
            <View style={styles.ratingContainer}>
              {Array.from({length: question.max}, (_, i) => i + 1).map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.ratingStar,
                    answers[question.id] >= num && styles.selectedRating,
                  ]}
                  onPress={() => handleAnswerChange(question.id, num)}>
                  <Text style={[styles.ratingText, answers[question.id] >= num && {color: '#fff'}]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default:
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>Unsupported question type: {question.type}</Text>
          </View>
        );
    }
  }, [answers, handleAnswerChange]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1A508C', '#0D3B66']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Loading Survey...</Text>
          <View style={{width: 40}} />
        </LinearGradient>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Fetching survey details...</Text>
          <MaterialCommunityIcons name="loading" size={40} color="#1A508C" />
        </View>
      </SafeAreaView>
    );
  }

  if (!surveyDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1A508C', '#0D3B66']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Survey Not Found</Text>
          <View style={{width: 40}} />
        </LinearGradient>
        <View style={styles.emptyListContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
          <Text style={styles.emptyListText}>Survey Not Found</Text>
          <Text style={styles.emptyListSubText}>
            The survey with ID "{surveyId}" could not be loaded.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>{surveyDetails.title}</Text>
        <View style={{width: 40}} />
      </LinearGradient>

      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.surveyIntro}>
          <Text style={styles.surveyDetailDescription}>
            {surveyDetails.description}
          </Text>
        </View>

        {surveyDetails.questions.map(renderQuestion)}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitSurvey}>
          <Text style={styles.submitButtonText}>Submit Survey</Text>
          <Ionicons name="send-outline" size={20} color="#fff" style={{marginLeft: 8}} />
        </TouchableOpacity>
        <View style={{height: 30}} /> 
      </ScrollView>
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
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
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
  scrollViewContent: {
    padding: 20,
  },
  surveyIntro: {
    marginBottom: 20,
    backgroundColor: '#E6EEF7',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  surveyDetailDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A508C',
    marginBottom: 10,
  },
  requiredStar: {
    color: 'red',
    fontWeight: 'bold',
  },
  // Options for single/multiple choice
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedOption: {
    backgroundColor: '#EBF3F8', // Lighter blue
    borderColor: '#1A508C',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  // Text Input
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100, // Make it taller for multi-line input
    textAlignVertical: 'top', // Align text to top for multiline
  },
  // Rating
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  ratingStar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B0BEC5',
  },
  selectedRating: {
    backgroundColor: '#1A508C',
    borderColor: '#0D3B66',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#2E7D32', // Green for submit
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2E7D32',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});