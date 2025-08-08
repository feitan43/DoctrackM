// FeedsTab.js
import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importing MaterialCommunityIcons
import {useFacebookFeeds} from '../../hooks/useFacebookFeeds';

const {width} = Dimensions.get('window');

const FeedsTab = ({onScroll}) => {
  const navigation = useNavigation();
  // Assume a user context or prop is available to check for admin status
  const isAdmin = true; // This should be dynamic based on your app's auth
  const {profilePicQuery, postsQuery} = useFacebookFeeds(isAdmin);

  const {
    data: profilePic,
    isLoading: isProfilePicLoading,
    error: profilePicError,
  } = profilePicQuery;
  const {
    data: posts,
    isLoading: arePostsLoading,
    error: postsError,
    refetch,
  } = postsQuery;

  // Handler to update post visibility (this should call an API endpoint)
  const handleToggleVisibility = useCallback(postId => {
    console.log(`Toggling visibility for post ${postId}`);
    // Here you would call an API to update the post's visibility
    // For example:
    // updatePostVisibility(postId, !post.isVisible)
    // .then(() => refetch())
    // .catch(error => console.error(error));
  }, []);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePostPress = post => {
    navigation.navigate('FeedDetails', {post});
  };

  const renderMedia = (attachment, isThumbnail = false) => {
    if (!attachment || !attachment.media) return null;

    const source = attachment.media.image?.src || attachment.media.source;

    if (!source) return null;

    if (attachment.media_type === 'photo') {
      return (
        <Image
          key={source}
          source={{uri: source}}
          style={isThumbnail ? styles.thumbnailImage : styles.postImage}
          resizeMode="cover"
        />
      );
    } else if (attachment.media_type === 'video') {
      return (
        <Video
          key={source}
          source={{uri: source}}
          style={styles.postVideo}
          resizeMode="cover"
          paused={true}
          controls={false}
        />
      );
    }
    return null;
  };

  const renderThumbnailGrid = attachments => {
    const allAttachments = attachments.flatMap(att =>
      att.media_type === 'album' && att.subattachments
        ? att.subattachments.data
        : [att],
    );

    return (
      <View style={styles.thumbnailGrid}>
        {allAttachments.map((attachment, index) =>
          renderMedia(attachment, true),
        )}
      </View>
    );
  };

  if (isProfilePicLoading || arePostsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text>Loading page posts...</Text>
      </View>
    );
  }

  if (profilePicError || postsError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Error: {profilePicError?.message || postsError?.message}
        </Text>
      </View>
    );
  }

  const postsToShow = isAdmin
    ? posts
    : posts?.filter(post => post.isVisible);

  return (
    <ScrollView
      style={styles.container}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={arePostsLoading} onRefresh={onRefresh} />
      }>
      {postsToShow?.length > 0 ? (
        postsToShow.map(post => {
          const attachmentsData = post.attachments?.data || [];
          return (
            <Pressable
              key={post.id}
              style={styles.postCard}
              onPress={() => handlePostPress(post)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  fontSize: 16,
                  padding: 5,
                }}>
                <Text style={styles.postTime}>
                  {moment(post.created_time).format('MMMM D, YYYY')}
                </Text>
              </View>
              <View style={styles.postHeader}>
                <View style={styles.authorContainer}>
                  {profilePic && (
                    <Image
                      source={{uri: profilePic}}
                      style={styles.profilePic}
                    />
                  )}
                  <Text style={styles.authorName}>{'Project Doctrack'}</Text>
                </View>
              {/* {isAdmin && (
                <Pressable
                  onPress={() => handleToggleVisibility(post.id)}
                  style={styles.adminControls}>
                  <Icon
                    name={post.isVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={24}
                    color={post.isVisible ? '#4A90E2' : '#d1d1d1'}
                  />
                </Pressable>
              )} */}
              </View>

              {post.message && (
                <View style={styles.messageContainer}>
                  <Text
                    style={styles.postMessage}
                    numberOfLines={5}
                    ellipsizeMode="tail">
                    {post.message}
                  </Text>
                </View>
              )}

              {attachmentsData.length === 1 && renderMedia(attachmentsData[0])}
              {attachmentsData.length > 1 &&
                renderThumbnailGrid(attachmentsData)}
            </Pressable>
          );
        })
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.noPostsText}>No posts found.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 200,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    paddingBottom: 50,
    marginBottom: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333ff',
  },
  postTime: {
    fontSize: 12,
    color: '#616770',
  },
  messageContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#faf9f9ff',
  },
  postMessage: {
    fontSize: 15,
    lineHeight: 20,
    color: '#1d2129',
  },
  postImage: {
    width: width - 4,
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  postVideo: {
    width: width - 4,
    height: 250,
    backgroundColor: '#000',
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 2,
    rowGap: 4,
    columnGap: 4,
  },
  thumbnailImage: {
    width: (width - 16) / 2,
    height: (width - 16) / 2,
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#616770',
  },
  adminControls: {
    padding: 5,
  },
});

export default FeedsTab;