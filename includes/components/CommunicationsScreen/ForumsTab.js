import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const ForumsTab = ({selectedYear, showUnderDevelopment = true}) => {
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
    ],
    2024: [
      {
        id: 3,
        title: 'Feature Requests',
        posts: 56,
        lastPost: 'Community Manager',
        time: 'December 12, 2024',
        newPosts: 0,
      },
      {
        id: 4,
        title: 'Bug Reports',
        posts: 34,
        lastPost: 'Developer',
        time: 'November 5, 2024',
        newPosts: 0,
      },
    ],
    2023: [
      {
        id: 5,
        title: 'Archived Discussions',
        posts: 201,
        lastPost: 'Moderator',
        time: 'June 15, 2023',
        newPosts: 0,
      },
    ],
    2022: [
      {
        id: 6,
        title: 'Old Announcements',
        posts: 78,
        lastPost: 'Admin',
        time: 'March 3, 2022',
        newPosts: 0,
      },
    ],
  };

  const forumTopics = forumsByYear[selectedYear] || [];

  return (
    <View style={styles.forumContainer}>
      {showUnderDevelopment ? (
        <View style={styles.underDevelopmentContainer}>
          <MaterialCommunityIcons name="tools" size={60} color="#cbd5e1" />
          <Text style={styles.underDevelopmentText}>
            This feature is currently **under development** and will be
            available soon. Please check back later for updates!
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionHeader}>
            Forum Activity for {selectedYear}
          </Text>

          {forumTopics.length > 0 ? (
            forumTopics.map(topic => (
              <View key={topic.id} style={styles.forumCard}>
                <View style={styles.forumInfo}>
                  <Text style={styles.forumTitle}>{topic.title}</Text>
                  <View style={styles.forumStatsContainer}>
                    <MaterialCommunityIcons
                      name="comment-text-multiple"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.forumStats}>{topic.posts} posts</Text>
                  </View>
                </View>
                <View style={styles.forumActivity}>
                  <View style={styles.lastPostContainer}>
                    <Text style={styles.lastPostLabel}>Last post:</Text>
                    <Text style={styles.lastPostUser}>{topic.lastPost}</Text>
                    <Text style={styles.lastPostTime}>{topic.time}</Text>
                  </View>
                  {topic.newPosts > 0 && (
                    <View style={styles.newPostsBadge}>
                      <MaterialCommunityIcons
                        name="message-badge"
                        size={14}
                        color="#4a6da7"
                      />
                      <Text style={styles.newPostsText}>
                        {topic.newPosts} new
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
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
        </>
      )}
    </View>
  );
};

export default ForumsTab;
