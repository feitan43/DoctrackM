import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';

// Mock data for reviews
const initialMockReviews = [
  {
    id: 'mock1',
    supplierName: 'Global Tech Solutions',
    rating: 5,
    reviewText: 'Excellent service and prompt delivery. Highly recommend!',
    userId: 'user_mock_123',
    timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    id: 'mock2',
    supplierName: 'Office Furniture Co.',
    rating: 4,
    reviewText: 'Good quality furniture, but delivery was a bit slow.',
    userId: 'user_mock_456',
    timestamp: new Date(Date.now() - 86400000 * 5), // 5 days ago
  },
  {
    id: 'mock3',
    supplierName: 'Cleaning Services Ltd.',
    rating: 3,
    reviewText: 'Decent cleaning, but sometimes inconsistent.',
    userId: 'user_mock_789',
    timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
  },
  {
    id: 'mock4',
    supplierName: 'IT Support Pros',
    rating: 5,
    reviewText: 'Always quick to respond and resolve issues. Fantastic!',
    userId: 'user_mock_101',
    timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
  },
];

// Main App component
const SupplierReviews = () => {
  // We no longer need db, auth, initialAuthToken, or firebaseConfig
  const [userId] = useState('mock_user_' + Math.random().toString(36).substring(2, 9)); // Generate a random mock user ID
  const [supplierName, setSupplierName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Still useful for initial load simulation
  const [error, setError] = useState('');

  // Simulate initial data load
  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      // Sort initial mock reviews by timestamp in descending order
      const sortedMockReviews = [...initialMockReviews].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setReviews(sortedMockReviews);
      setLoading(false);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  // Handle form submission for new reviews using mock data
  const handleSubmitReview = () => {
    if (!supplierName || rating === 0 || !reviewText) {
      Alert.alert("Error", "Please fill in all fields (Supplier Name, Rating, and Review).");
      return;
    }

    const newReview = {
      id: 'mock_' + Date.now() + Math.random().toString(36).substring(2, 9), // Unique ID for mock review
      supplierName: supplierName,
      rating: rating,
      reviewText: reviewText,
      userId: userId, // Use the current mock user ID
      timestamp: new Date(), // Current timestamp
    };

    // Add new review to the beginning of the array and update state
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setSupplierName('');
    setRating(0);
    setReviewText('');
    setError(''); // Clear any previous errors
    Alert.alert("Success", "Review submitted successfully (mock data)!");
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading application...</Text>
      </View>
    );
  }

  // Error state for mock data is less critical, but can still be shown if internal logic fails
  if (error) {
    return (
      <View style={[styles.centeredContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.header}>Supplier Reviews</Text>

        {userId && (
          <Text style={styles.userIdText}>
            Your User ID: <Text style={styles.userIdValue}>{userId}</Text>
          </Text>
        )}

        {error && (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>Error! {error}</Text>
          </View>
        )}

        {/* Review Submission Form */}
        <View style={styles.formSection}>
          <Text style={styles.formHeader}>Submit a Review</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Supplier Name:</Text>
            <TextInput
              style={styles.input}
              value={supplierName}
              onChangeText={setSupplierName}
              placeholder="e.g., Office Supplies Inc."
              required
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rating:</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.star, star <= rating ? styles.starFilled : styles.starEmpty]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.ratingText}>{rating} / 5 Stars</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Review:</Text>
            <TextInput
              style={styles.textArea}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Write your review here..."
              multiline
              numberOfLines={4}
              required
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Reviews Display */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsHeader}>All Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to add one!</Text>
          ) : (
            <View>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <Text style={styles.reviewSupplierName}>{review.supplierName}</Text>
                  <View style={styles.reviewStarContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        style={[styles.reviewStar, star <= review.rating ? styles.reviewStarFilled : styles.reviewStarEmpty]}
                      >
                        ★
                      </Text>
                    ))}
                    <Text style={styles.reviewRatingText}>{review.rating} / 5</Text>
                  </View>
                  <Text style={styles.reviewText}>"{review.reviewText}"</Text>
                  <Text style={styles.reviewMeta}>
                    Reviewed by: <Text style={styles.reviewUserId}>{review.userId}</Text> on{' '}
                    {review.timestamp ? new Date(review.timestamp).toLocaleString() : 'N/A'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563', // gray-700
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2', // red-100
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B91C1C', // red-700
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // gray-100
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 600, // Equivalent to max-w-4xl
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // For Android shadow
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937', // gray-800
    marginBottom: 24,
    textAlign: 'center',
  },
  userIdText: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    marginBottom: 16,
    textAlign: 'center',
  },
  userIdValue: {
    fontFamily: 'monospace', // Equivalent to font-mono
    backgroundColor: '#E5E7EB', // gray-200
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertError: {
    backgroundColor: '#FEE2E2', // red-100
    borderColor: '#F87171', // red-400
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  alertErrorText: {
    color: '#B91C1C', // red-700
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#EFF6FF', // blue-50
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF', // blue-800
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#D1D5DB', // gray-300
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    color: '#374151', // gray-700
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    borderColor: '#D1D5DB', // gray-300
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#374151', // gray-700
    textAlignVertical: 'top', // For Android multi-line TextInput
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 32,
    marginRight: 4,
  },
  starFilled: {
    color: '#FBBF24', // yellow-400
  },
  starEmpty: {
    color: '#D1D5DB', // gray-300
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // gray-800
  },
  submitButton: {
    backgroundColor: '#3B82F6', // blue-600
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999, // full rounded
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewsSection: {
    padding: 24,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewsHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 16,
  },
  noReviewsText: {
    color: '#4B5563', // gray-600
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
    borderColor: '#E5E7EB', // gray-200
    borderWidth: 1,
  },
  reviewSupplierName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827', // gray-900
    marginBottom: 8,
  },
  reviewStarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStar: {
    fontSize: 20,
    marginRight: 2,
  },
  reviewStarFilled: {
    color: '#FBBF24', // yellow-400
  },
  reviewStarEmpty: {
    color: '#D1D5DB', // gray-300
  },
  reviewRatingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151', // gray-700
  },
  reviewText: {
    color: '#374151', // gray-700
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reviewMeta: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  reviewUserId: {
    fontFamily: 'monospace', // Equivalent to font-mono
  },
});

export default SupplierReviews;
