import React, {useState, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
// Removed: import {Picker} from '@react-native-picker/picker';

// --- NEW DATE PICKER IMPORT (from previous step) ---
import DatePicker from 'react-native-date-picker';
// --- NEW DROPDOWN IMPORT ---
import {Dropdown} from 'react-native-element-dropdown';
// --- END NEW IMPORTS ---

export default function CreateSurveyScreen({navigation}) {
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [nextQuestionId, setNextQuestionId] = useState(1);

  // Data for the question type dropdown
  const questionTypes = [
    {label: 'Text Input', value: 'text-input'},
    {label: 'Multiple Choice', value: 'multiple-choice'},
    {label: 'Single Select', value: 'single-select'},
    {label: 'Rating (1-5)', value: 'rating'},
  ];

  // --- Handlers for Survey Basic Info ---

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onConfirmDate = date => {
    setShowDatePicker(false);
    setDueDate(date);
  };

  const onCancelDate = () => {
    setShowDatePicker(false);
  };

  // --- Handlers for Dynamic Questions ---
  const addQuestion = useCallback(() => {
    setQuestions(prevQuestions => [
      ...prevQuestions,
      {
        id: `q${nextQuestionId}`,
        type: 'text-input', // Default type
        questionText: '',
        options: [], // For multiple-choice/single-select
        required: false,
      },
    ]);
    setNextQuestionId(prevId => prevId + 1);
  }, [nextQuestionId]);

  const removeQuestion = useCallback(questionId => {
    setQuestions(prevQuestions =>
      prevQuestions.filter(q => q.id !== questionId),
    );
  }, []);

  const updateQuestion = useCallback((questionId, field, value) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? {...q, [field]: value} : q,
      ),
    );
  }, []);

  const addOption = useCallback(questionId => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                {id: `opt${Date.now()}`, text: ''}, // Unique ID for option
              ],
            }
          : q,
      ),
    );
  }, []);

  const updateOption = useCallback((questionId, optionId, text) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId ? {...opt, text: text} : opt,
              ),
            }
          : q,
      ),
    );
  }, []);

  const removeOption = useCallback((questionId, optionId) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? {...q, options: q.options.filter(opt => opt.id !== optionId)}
          : q,
      ),
    );
  }, []);

  // --- Submission Handler ---
  const handleSubmitSurvey = () => {
    if (!surveyTitle.trim()) {
      Alert.alert('Validation Error', 'Survey Title is required.');
      return;
    }
    if (questions.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one question.');
      return;
    }
    for (const q of questions) {
      if (!q.questionText.trim()) {
        Alert.alert(
          'Validation Error',
          `Question ${q.id}: Question text cannot be empty.`,
        );
        return;
      }
      if (
        (q.type === 'multiple-choice' || q.type === 'single-select') &&
        q.options.length < 2
      ) {
        Alert.alert(
          'Validation Error',
          `Question ${q.id}: Multiple/Single choice questions need at least two options.`,
        );
        return;
      }
      if (
        (q.type === 'multiple-choice' || q.type === 'single-select') &&
        q.options.some(opt => !opt.text.trim())
      ) {
        Alert.alert(
          'Validation Error',
          `Question ${q.id}: All options must have text.`,
        );
        return;
      }
    }

    const newSurvey = {
      id: `s${Date.now()}`,
      title: surveyTitle.trim(),
      description: surveyDescription.trim(),
      status: 'Upcoming',
      dueDate: dueDate.toISOString().split('T')[0],
      participants: 0,
      questions: questions.map(q => ({
        ...q,
        questionText: q.questionText.trim(),
        options: q.options.map(opt => ({...opt, text: opt.text.trim()})),
      })),
      category: 'User Created',
    };

    console.log('New Survey Data:', newSurvey);
    Alert.alert(
      'Success',
      'Survey created successfully! (Check console for data)',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ],
    );
  };

  // --- Render Functions for Question Types ---
  const renderQuestionOptions = question => {
    if (
      question.type === 'multiple-choice' ||
      question.type === 'single-select'
    ) {
      return (
        <View style={styles.optionsContainer}>
          <Text style={styles.subHeading}>Options:</Text>
          {question.options.map((option, optIndex) => (
            <View key={option.id} style={styles.optionInputRow}>
              <TextInput
                style={styles.optionTextInput}
                placeholder={`Option ${optIndex + 1}`}
                value={option.text}
                onChangeText={text =>
                  updateOption(question.id, option.id, text)
                }
              />
              <TouchableOpacity
                onPress={() => removeOption(question.id, option.id)}
                style={styles.removeOptionButton}>
                <Ionicons name="close-circle-outline" size={24} color="#EF5350" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => addOption(question.id)}
            style={styles.addOptionButton}>
            <Ionicons name="add-circle-outline" size={20} color="#1A508C" />
            <Text style={styles.addOptionButtonText}>Add Option</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

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
        <Text style={styles.headerTitle}>Create New Survey</Text>
        <View style={{width: 40}} />
      </LinearGradient>

      <ScrollView style={styles.scrollViewContent}>
        {/* Survey General Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Survey Details</Text>
          <Text style={styles.label}>
            Survey Title <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Annual Employee Feedback"
            value={surveyTitle}
            onChangeText={setSurveyTitle}
          />

          <Text style={styles.label}>Survey Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Briefly describe the purpose of the survey..."
            multiline
            numberOfLines={4}
            value={surveyDescription}
            onChangeText={setSurveyDescription}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            onPress={showDatepicker}
            style={styles.datePickerButton}>
            <Ionicons name="calendar-outline" size={20} color="#1A508C" />
            <Text style={styles.datePickerText}>
              {dueDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={showDatePicker}
            date={dueDate}
            onConfirm={onConfirmDate}
            onCancel={onCancelDate}
            mode="date"
            minimumDate={new Date()}
            title="Select Due Date"
            confirmText="Confirm"
            cancelText="Cancel"
          />
        </View>

        {/* Survey Questions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Survey Questions</Text>

          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionCardHeader}>
                <Text style={styles.questionCardTitle}>
                  Question {index + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => removeQuestion(question.id)}
                  style={styles.removeQuestionButton}>
                  <Ionicons name="trash-outline" size={24} color="#EF5350" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>
                Question Text <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInputSmall]}
                placeholder="Enter your question here..."
                value={question.questionText}
                onChangeText={text =>
                  updateQuestion(question.id, 'questionText', text)
                }
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Question Type</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={questionTypes} // The data for the dropdown
                maxHeight={300}
                labelField="label" // Key for display text
                valueField="value" // Key for value
                placeholder="Select question type"
                value={question.type} // Current selected value
                onChange={item => {
                  updateQuestion(question.id, 'type', item.value);
                }}
                renderLeftIcon={() => (
                  <Ionicons
                    style={styles.icon}
                    color={
                      question.type ? '#1A508C' : '#888'
                    }
                    name="list-outline"
                    size={20}
                  />
                )}
              />

              {renderQuestionOptions(question)}

              <View style={styles.requiredToggleContainer}>
                <MaterialCommunityIcons
                  name={question.required ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={question.required ? '#2E7D32' : '#888'}
                  onPress={() =>
                    updateQuestion(question.id, 'required', !question.required)
                  }
                />
                <Text style={styles.requiredToggleText}>Required Question</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={addQuestion}
            style={styles.addQuestionButton}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addQuestionButtonText}>Add New Question</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitSurvey}>
          <Text style={styles.submitButtonText}>Create Survey</Text>
          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color="#fff"
            style={{marginLeft: 8}}
          />
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
  scrollViewContent: {
    padding: 20,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#1A508C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  requiredStar: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D9E6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 15,
    backgroundColor: '#F7F9FC',
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  multilineInputSmall: {
    minHeight: 70,
    paddingTop: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D9E6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#F7F9FC',
  },
  datePickerText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  // Question Card Specific Styles
  questionCard: {
    backgroundColor: '#FDFDFD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  questionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D3B66',
  },
  removeQuestionButton: {
    padding: 5,
    borderRadius: 20,
  },
  // --- Dropdown specific styles (replacing picker styles) ---
  dropdown: {
    height: 50,
    borderColor: '#D1D9E6',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F7F9FC',
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#333',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 15,
  },
  // --- End Dropdown specific styles ---
  optionsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  removeOptionButton: {
    padding: 5,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 80, 140, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 5,
  },
  addOptionButtonText: {
    color: '#1A508C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  requiredToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  requiredToggleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A508C',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    shadowColor: '#1A508C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  addQuestionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
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