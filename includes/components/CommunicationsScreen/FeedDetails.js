// FeedDetails.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
  SafeAreaView,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import {useRoute, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// Import GestureHandlerRootView to ensure gestures work on Android
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ZoomImage from '../../utils/ZoomImage';
// Import the new component

const {width, height} = Dimensions.get('window');

const FeedDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {post} = route.params;

  const [singleMediaHeight, setSingleMediaHeight] = useState(350);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

  useEffect(() => {
    if (
      post.attachments?.data?.length === 1 &&
      post.attachments.data[0].media_type !== 'album'
    ) {
      const attachment = post.attachments.data[0];
      if (
        (attachment.type === 'photo' || attachment.media_type === 'photo') &&
        attachment.media.image
      ) {
        Image.getSize(
          attachment.media.image.src,
          (imgWidth, imgHeight) => {
            const newHeight = (imgHeight / imgWidth) * width;
            setSingleMediaHeight(newHeight);
          },
          error => {
            console.error("Couldn't get image size", error);
            setSingleMediaHeight(350);
          },
        );
      } else if (
        (attachment.type === 'video' ||
          attachment.type === 'video_autoplay' ||
          attachment.media_type === 'video') &&
        attachment.media.source
      ) {
        setSingleMediaHeight(width * 0.5625);
      }
    } else {
      setSingleMediaHeight(350);
    }
  }, [post, width]);

  const handleMediaPress = (uri, type) => {
    setFullscreenMedia({uri, type});
  };

  const renderMediaItem = (attachment, index, isAlbum = false) => {
    if (!attachment || !attachment.media) return null;

    const mediaStyle = isAlbum
      ? styles.mediaAlbum
      : {...styles.mediaSingle, height: singleMediaHeight};

    if (
      (attachment.type === 'photo' || attachment.media_type === 'photo') &&
      attachment.media.image
    ) {
      return (
        <Pressable
          key={`photo-${index}`}
          onPress={() => handleMediaPress(attachment.media.image.src, 'photo')}
          style={({pressed}) => [{opacity: pressed ? 0.7 : 1}]}>
          <Image
            source={{uri: attachment.media.image.src}}
            style={mediaStyle}
            resizeMode="contain"
          />
        </Pressable>
      );
    } else if (
      (attachment.type === 'video' ||
        attachment.type === 'video_autoplay' ||
        attachment.media_type === 'video') &&
      attachment.media.source
    ) {
      return (
        <Pressable
          key={`video-${index}`}
          onPress={() => handleMediaPress(attachment.media.source, 'video')}
          style={({pressed}) => [{opacity: pressed ? 0.7 : 1}]}>
          <Video
            source={{uri: attachment.media.source}}
            style={mediaStyle}
            resizeMode="contain"
            controls={true}
            paused={true}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
          />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.postHeader}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({pressed}) => [
              styles.backButton,
              {opacity: pressed ? 0.6 : 1},
            ]}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#385898"
            />
          </Pressable>
          <Text style={styles.authorName}>Feeds</Text>
          <Text style={styles.postTime}>
            {new Date(post.created_time).toLocaleString()}
          </Text>
        </View>
        <ScrollView style={styles.container}>
          {post.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.postMessage}>{post.message}</Text>
            </View>
          )}

          {post.attachments?.data.map((attachment, index) => {
            if (
              attachment.media_type === 'album' &&
              attachment.subattachments?.data
            ) {
              return (
                <View key={`album-${index}`} style={styles.albumContainer}>
                  {attachment.subattachments.data.map(
                    (subAttachment, subIndex) =>
                      renderMediaItem(subAttachment, `sub-${subIndex}`, true),
                  )}
                </View>
              );
            }
            return renderMediaItem(attachment, `main-${index}`);
          })}
        </ScrollView>

        {fullscreenMedia && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={!!fullscreenMedia}
            statusBarTranslucent={true}
            onRequestClose={() => setFullscreenMedia(null)}>
            <View style={styles.fullscreenContainer}>
              {fullscreenMedia.type === 'photo' ? (
                <ZoomImage
                  source={{uri: fullscreenMedia.uri}}
                  //style={styles.fullscreenMedia}
                />
              ) : (
                <Video
                  source={{uri: fullscreenMedia.uri}}
                  style={styles.fullscreenMedia}
                  resizeMode="contain"
                  controls={true}
                  paused={false}
                />
              )}
              <Pressable
                style={({pressed}) => [
                  styles.closeButton,
                  {opacity: pressed ? 0.6 : 1},
                ]}
                onPress={() => setFullscreenMedia(null)}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={30}
                  color="#fff"
                />
              </Pressable>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9ebee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  backButton: {
    paddingRight: 10,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#385898',
    flex: 1,
  },
  postTime: {
    fontSize: 12,
    color: '#616770',
  },
  messageContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1d2129',
  },
  mediaSingle: {
    width: width,
    backgroundColor: '#000',
    marginBottom: 10,
  },
  mediaAlbum: {
    width: width,
    height: 350,
    backgroundColor: '#000',
    marginBottom: 10,
  },
  albumContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenMedia: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
});

export default FeedDetails;