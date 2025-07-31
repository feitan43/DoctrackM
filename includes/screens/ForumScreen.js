import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView, // Using ScrollView to wrap categories
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// --- MOCK FORUM DATA (Embedded in this file) ---
const MOCK_FORUMS = [
  {
    id: 'cat1',
    name: 'General Discussion',
    description: 'A place for open conversations about anything and everything.',
    topics: [
      {
        id: 'topic101',
        title: 'Welcome to the Community Forum!',
        author: 'Admin',
        lastPostDate: '2025-07-24T10:30:00Z',
        repliesCount: 15,
        viewsCount: 520,
        status: 'Pinned', // Pinned topics stay at the top
      },
      {
        id: 'topic102',
        title: 'Ideas for Team Building Activities',
        author: 'Jane Doe',
        lastPostDate: '2025-07-23T15:00:00Z',
        repliesCount: 8,
        viewsCount: 180,
        status: 'Open',
      },
      {
        id: 'topic103',
        title: 'Favorite Lunch Spots Near Office',
        author: 'John Smith',
        lastPostDate: '2025-07-22T11:45:00Z',
        repliesCount: 22,
        viewsCount: 310,
        status: 'Open',
      },
      {
        id: 'topic104',
        title: 'Share Your WFH Setup!',
        author: 'Alice Brown',
        lastPostDate: '2025-07-20T09:00:00Z',
        repliesCount: 12,
        viewsCount: 250,
        status: 'Open',
      },
    ],
  },
  {
    id: 'cat2',
    name: 'Technical Support & FAQs',
    description: 'Find answers, ask questions, and get help with technical issues.',
    topics: [
      {
        id: 'topic201',
        title: 'Troubleshooting: Inventory System Login Issues',
        author: 'Support Team',
        lastPostDate: '2025-07-24T09:00:00Z',
        repliesCount: 5,
        viewsCount: 250,
        status: 'Open',
      },
      {
        id: 'topic202',
        title: 'How to Submit a New IT Request',
        author: 'Admin',
        lastPostDate: '2025-07-21T14:20:00Z',
        repliesCount: 2,
        viewsCount: 400,
        status: 'Pinned',
      },
      {
        id: 'topic203',
        title: 'FAQ: Password Reset Procedures',
        author: 'Support Team',
        lastPostDate: '2025-07-20T16:00:00Z',
        repliesCount: 0,
        viewsCount: 150,
        status: 'Closed', // Example of a closed topic
      },
    ],
  },
  {
    id: 'cat3',
    name: 'Announcements',
    description: 'Official company announcements and important updates.',
    topics: [
      {
        id: 'topic301',
        title: 'Company Holiday Schedule 2025',
        author: 'HR Dept.',
        lastPostDate: '2025-07-25T08:00:00Z',
        repliesCount: 3,
        viewsCount: 600,
        status: 'Pinned',
      },
      {
        id: 'topic302',
        title: 'New Policy on Remote Work',
        author: 'Management',
        lastPostDate: '2025-07-18T10:00:00Z',
        repliesCount: 10,
        viewsCount: 750,
        status: 'Open',
      },
    ],
  },
];
// --- END MOCK FORUM DATA ---

export default function ForumsScreen({navigation}) {
  const [forumsData, setForumsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data with a delay
    setTimeout(() => {
      setForumsData(MOCK_FORUMS);
      setLoading(false);
    }, 1500); // 1.5 second delay
  }, []);

  const handleTopicPress = useCallback((topicId, topicTitle) => {
    // In a real app, you would navigate to a detailed topic screen
    // navigation.navigate('ForumTopicDetail', { topicId, topicTitle });
    console.log(`Navigating to topic: ${topicTitle} (ID: ${topicId})`);
    alert(`You clicked on: ${topicTitle}\n(Detail screen not implemented yet)`);
  }, []);

  const formatLastPostDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const ShimmerPlaceholder = ({style}) => (
    <View style={[styles.shimmerStyle, style]} />
  );

  const renderLoadingState = () => (
    <View style={styles.content}>
      {[...Array(2)].map((_, categoryIndex) => (
        <View key={`shimmer-cat-${categoryIndex}`} style={styles.forumCategoryCardShimmer}>
          <ShimmerPlaceholder style={styles.shimmerCategoryTitle} />
          <ShimmerPlaceholder style={styles.shimmerCategoryDescription} />
          {[...Array(3)].map((__, topicIndex) => (
            <View key={`shimmer-topic-${categoryIndex}-${topicIndex}`} style={styles.topicItemShimmer}>
              <ShimmerPlaceholder style={styles.shimmerTopicTitle} />
              <View style={styles.shimmerTopicDetails}>
                <ShimmerPlaceholder style={styles.shimmerTopicDetailText} />
                <ShimmerPlaceholder style={styles.shimmerTopicDetailText} />
                <ShimmerPlaceholder style={styles.shimmerTopicDetailText} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.content}>
      <MaterialCommunityIcons
        name="forum-outline"
        size={80}
        color="#bbb"
      />
      <Text style={styles.emptyListText}>No active forum discussions</Text>
      <Text style={styles.emptyListSubText}>
        Discussions and community posts will appear here.
      </Text>
    </View>
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
        <Text style={styles.headerTitle}>Forums</Text>
        <View style={{width: 40}} /> 
      </LinearGradient>

      {/* Content Area */}
      {loading ? (
        renderLoadingState()
      ) : forumsData.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {forumsData.map(category => (
            <View key={category.id} style={styles.forumCategoryCard}>
              <View style={styles.categoryHeader}>
                <Ionicons name="chatbubbles-outline" size={24} color="#1A508C" style={styles.categoryIcon}/>
                <View style={styles.categoryTitleWrapper}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
              <View style={styles.topicsList}>
                {category.topics.length > 0 ? (
                  category.topics.map(topic => (
                    <TouchableOpacity
                      key={topic.id}
                      style={styles.topicItem}
                      onPress={() => handleTopicPress(topic.id, topic.title)}>
                      <View style={styles.topicLeft}>
                        {topic.status === 'Pinned' && (
                          <MaterialCommunityIcons
                            name="pin"
                            size={18}
                            color="#F44336"
                            style={styles.topicPinIcon}
                          />
                        )}
                        <Text style={styles.topicTitle} numberOfLines={1} ellipsizeMode="tail">
                          {topic.title}
                        </Text>
                      </View>
                      <View style={styles.topicStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="chatbox-outline" size={14} color="#666" />
                          <Text style={styles.statText}>{topic.repliesCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="eye-outline" size={14} color="#666" />
                          <Text style={styles.statText}>{topic.viewsCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="time-outline" size={14} color="#666" />
                          <Text style={styles.statText}>{formatLastPostDate(topic.lastPostDate)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noTopicsText}>No topics in this category yet.</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        renderEmptyState()
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
  scrollViewContent: {
    padding: 16,
    paddingBottom: 30, // Extra space at the bottom
  },
  content: {
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
  // Forum Category Card
  forumCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#1A508C',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    padding: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
    marginBottom: 15,
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryTitleWrapper: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A508C',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
  },
  topicsList: {
    // No specific style, just a container for topic items
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2, // Take more space
    marginRight: 10,
  },
  topicPinIcon: {
    marginRight: 5,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1, // Allow text to shrink
  },
  topicStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Take less space
    justifyContent: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 3,
  },
  noTopicsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 15,
  },
  // Shimmer Styles
  shimmerStyle: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  forumCategoryCardShimmer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  shimmerCategoryTitle: {
    height: 20,
    width: '70%',
    marginBottom: 8,
    marginTop: 5,
  },
  shimmerCategoryDescription: {
    height: 12,
    width: '90%',
    marginBottom: 15,
  },
  topicItemShimmer: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  shimmerTopicTitle: {
    height: 16,
    width: '85%',
    marginBottom: 8,
  },
  shimmerTopicDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shimmerTopicDetailText: {
    height: 12,
    width: '25%',
    marginLeft: 10,
  },
});