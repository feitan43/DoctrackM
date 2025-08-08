import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const forumsByYear = {
  2025: [
    {
      id: 1,
      title: 'General Discussion',
      posts: 124,
      lastPost: 'John Doe',
      time: '1 hour ago',
      newPosts: 3,
    },
    {
      id: 2,
      title: 'Technical Support',
      posts: 89,
      lastPost: 'Jane Smith',
      time: '3 hours ago',
      newPosts: 0,
    },
    {
      id: 3,
      title: 'Announcements',
      posts: 15,
      lastPost: 'Admin',
      time: '1 day ago',
      newPosts: 1,
    },
  ],
  2024: [
    {
      id: 4,
      title: 'Feature Requests',
      posts: 56,
      lastPost: 'Community Manager',
      time: 'December 12, 2024',
      newPosts: 0,
    },
    {
      id: 5,
      title: 'Bug Reports',
      posts: 34,
      lastPost: 'Developer',
      time: 'November 5, 2024',
      newPosts: 0,
    },
  ],
  2023: [
    {
      id: 6,
      title: 'Archived Discussions',
      posts: 201,
      lastPost: 'Moderator',
      time: 'June 15, 2023',
      newPosts: 0,
    },
  ],
  2022: [
    {
      id: 7,
      title: 'Old Announcements',
      posts: 78,
      lastPost: 'Admin',
      time: 'March 3, 2022',
      newPosts: 0,
    },
  ],
};

const ForumsTab = ({ navigation, selectedYear, showUnderDevelopment = true }) => {
  const forumTopics = forumsByYear[selectedYear] || [];

  const handleForumPress = (topic) => {
    navigation.navigate('ForumsConvo', { forum: topic });
  };

  const renderForumItem = ({ item: topic }) => (
    <TouchableOpacity
      style={styles.forumCard}
      onPress={() => handleForumPress(topic)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <Text style={styles.forumTitle}>{topic.title}</Text>
          <View style={styles.postDetailsContainer}>
            <Text style={styles.postDetailsText}>{topic.posts} posts</Text>
            {topic.newPosts > 0 && (
              <View style={styles.newPostsBadge}>
                <Text style={styles.newPostsText}>{topic.newPosts} new</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightContent}>
          <Text style={styles.lastPostUser}>{topic.lastPost}</Text>
          <Text style={styles.lastPostTime}>{topic.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (showUnderDevelopment) {
    return (
      <View style={styles.underDevelopmentContainer}>
        <MaterialCommunityIcons name="tools" size={60} color="#cbd5e1" />
        <Text style={styles.underDevelopmentText}>
          This feature is currently **under development** and will be
          available soon. Please check back later for updates!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>
        Forum Activity for {selectedYear}
      </Text>

      {forumTopics.length > 0 ? (
        <FlatList
          data={forumTopics}
          renderItem={renderForumItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="forum-outline"
            size={48}
            color="#cbd5e1"
          />
          <Text style={styles.emptyStateText}>
            No forum activity for {selectedYear}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Browse All Forums</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  forumCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: 10,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  forumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  postDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDetailsText: {
    fontSize: 13,
    color: '#64748B',
  },
  newPostsBadge: {
    marginLeft: 8,
    backgroundColor: '#E5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
  },
  newPostsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  lastPostUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  lastPostTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ForumsTab;
