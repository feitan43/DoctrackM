import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ImageBackground,
  Linking,
  Alert,
  Modal,
  FlatList,
  RefreshControl, // ✅ Add this here

} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ActivityIndicator} from 'react-native-paper';
import useGenInformation from '../api/useGenInformation';
import {DataTable} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Divider} from '@rneui/themed';
import {pick} from '@react-native-documents/picker';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {
  useUploadTNAttach,
  useRemoveTNAttach,
  useAttachmentFiles,
} from '../hooks/useAttachments';
import {showMessage} from 'react-native-flash-message'; 
import useUserInfo from '../api/useUserInfo';
import {useQueryClient} from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import ZoomableImage from '../utils/ZoomableImage';
import { insertCommas } from '../utils/insertComma';
import { formTypeMap } from '../utils/formTypeMap';

const DetailScreen = ({ route }) => {
  const { selectedItem } = route.params;
  const year = selectedItem.Year;
  const trackingNumber = selectedItem.TrackingNumber;
  const trackingType = selectedItem.TrackingType;
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: attachments,
    isLoading,
    isError,
    error,
  } = useAttachmentFiles(year, trackingNumber, trackingType);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ['attachmentFiles', year, trackingNumber, trackingType],
      });
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details & Attachments</Text>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading attachment files...</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Error: {error.message || 'Failed to load attachments.'}
          </Text>
        </View>
      )}

      {!isLoading && !isError && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {attachments?.map((file, index) => {
            const fileUrl = file.url; // Assuming `file.url` contains the attachment URL (image or PDF)

            // Check if the URL is an image
            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);

            return (
              <View key={`${file.fileName}-${index}`} style={styles.item}>
                {isImage ? (
                  <FastImage
                    style={styles.image}
                    source={{ uri: attachments, priority: FastImage.priority.normal }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <Pressable
                    style={styles.fileContainer}
                    onPress={() => {
                      if (fileUrl) {
                        Linking.openURL(fileUrl).catch((err) =>
                          console.error('Failed to open URL:', err)
                        );
                      } else {
                        console.warn('File URL is undefined');
                      }
                    }}
                  >
                    <Text
                      style={[styles.fileText, { color: '#007AFF', textDecorationLine: 'underline' }]}
                    >
                      {fileUrl ? decodeURIComponent(fileUrl.split('/').pop()) : 'No file name available'}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
          {attachments.length === 0 && (
            <Text style={styles.emptyText}>No attachment files found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  item: {
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  fileContainer: {
    paddingVertical: 6,
    paddingLeft: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  fileText: {
    fontSize: 16,
    color: '#333',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default DetailScreen;