import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ForumsConvo = ({ navigation, route }) => {
  const { forum } = route.params;

  // Placeholder data for posts within a forum
  const posts = [
    {
      id: 1,
      sender: forum.lastPost,
      time: '1 hour ago',
      text: 'Hi everyone, thanks for the lively discussion! Let\'s keep it going.',
      isMine: false,
    },
    {
      id: 2,
      sender: 'You',
      time: '45 mins ago',
      text: 'I have a question about the latest feature. Where can I find the documentation?',
      isMine: true,
    },
    {
      id: 3,
      sender: forum.lastPost,
      time: '30 mins ago',
      text: 'Good question! You can find it in the "Resources" section of our website.',
      isMine: false,
    },
    {
      id: 4,
      sender: 'Another User',
      time: '10 mins ago',
      text: 'Thanks for the quick response! I was looking for that too.',
      isMine: false,
    },
  ];

  useEffect(() => {
    // Set the header title dynamically to the forum's title
    navigation.setOptions({
      headerTitle: forum.title,
      headerRight: () => (
        <TouchableOpacity style={convoStyles.headerButton}>
          <MaterialCommunityIcons name="pencil" size={24} color="#3B82F6" />
        </TouchableOpacity>
      ),
    });
  }, [forum, navigation]);

  const renderPost = (post) => (
    <View
      key={post.id}
      style={[
        convoStyles.postBubble,
        post.isMine ? convoStyles.myPostBubble : convoStyles.otherPostBubble,
      ]}
    >
      <Text style={convoStyles.postSender}>{post.sender}</Text>
      <Text style={convoStyles.postText}>{post.text}</Text>
      <Text style={convoStyles.postTime}>{post.time}</Text>
    </View>
  );

  return (
    <View style={convoStyles.container}>
      <ScrollView contentContainerStyle={convoStyles.postContainer}>
        {posts.map(renderPost)}
      </ScrollView>

      {/* Add a reply input section here if needed */}
    </View>
  );
};

const convoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  postContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  postBubble: {
    maxWidth: width * 0.8,
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myPostBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  otherPostBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  postSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  postText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  postTime: {
    fontSize: 10,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
});

export default ForumsConvo;
