import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const FeedbackScreen = () => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Submission Error', 'Please enter your feedback or suggestion before sending.', [
        {text: 'OK'},
      ]);
      return;
    }

    // In a real application, you would send this data to your backend
    console.log('Feedback submitted:');
    console.log('Email:', email);
    console.log('Feedback:', feedback);

    Alert.alert(
      'Thank You!',
      'Your feedback has been successfully submitted. We appreciate your input.',
      [
        {
          text: 'Close',
          onPress: () => {
            setEmail('');
            setFeedback('');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Provide Your Feedback</Text>
          <Text style={styles.subtitle}>
            We value your insights. Please share your suggestions or report any issues.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your feedback or suggestion here..."
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={8}
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSubmit}
            activeOpacity={0.8}>
            <Text style={styles.sendButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Very light grey background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 35,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700', // Bold
    color: '#212529', // Dark grey for strong contrast
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6C757D', // Muted grey for supporting text
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%', // Constrain width for readability
    alignSelf: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08, // Very subtle shadow
    shadowRadius: 10,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#343A40', // Slightly darker grey for labels
    marginBottom: 8,
    fontWeight: '600', // Medium bold
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CED4DA', // Light grey border
    color: '#343A40',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CED4DA',
    color: '#343A40',
    minHeight: 140, // Sufficient height for message
  },
  sendButton: {
    backgroundColor: '#007BFF', // Professional blue
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#007BFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default FeedbackScreen;