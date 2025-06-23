// Conceptual structure of ../components/ImagePreviewModal.js
import React, {useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImmersiveMode from 'react-native-immersive-mode';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window'); // Get both width and height

const ImagePreviewModal = ({
  isVisible,
  images,
  onClose,
  onUpload,
  onRemoveImage,
  onPickMoreImages,
  currentImageCount,
  isUploading,
}) => {
  useEffect(() => {
    ImmersiveMode.fullLayout(true);
    ImmersiveMode.setBarMode('BottomSticky');
  }, []);

  const renderImageItem = ({item, index}) => (
    <View style={styles.previewImageContainer}>
      <Image source={{uri: item.uri}} style={styles.previewImage} />
      <Pressable
        style={styles.removeImageButton}
        onPress={() => onRemoveImage(index)}
        accessibilityLabel={`Remove image ${index + 1}`}>
        <Icon name="close-circle" size={24} color="red" />
      </Pressable>
    </View>
  );

  const handleTookPhoto = () => {
    if (currentImageCount >= 5) {
      Alert.alert(
        'Maximum Images Reached',
        'You can only select up to 5 images.',
      );
      return;
    }
    onPickMoreImages('camera');
  };

  const handleBrowseAgain = () => {
    if (currentImageCount >= 5) {
      Alert.alert(
        'Maximum Images Reached',
        'You can only select up to 5 images.',
      );
      return;
    }
    onPickMoreImages('gallery');
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true} // Keep as true for overlay background
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Preview Images ({images.length}/5)
          </Text>

          {images.length > 0 ? (
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => item.uri + index}
              numColumns={2} // Or any number of columns you prefer for a grid layout
              showsVerticalScrollIndicator={true} // Allow vertical scrolling if many images
              contentContainerStyle={styles.flatListContent}
            />
          ) : (
            <Text style={styles.noImagesText}>No images selected yet.</Text>
          )}

          {images.length < 5 && (
            <View style={styles.addMoreButtonsContainer}>
              <Pressable style={styles.addMoreButton} onPress={handleTookPhoto}>
                <Icon name="camera" size={20} color="#fff" />
                <Text style={styles.addMoreButtonText}>Took Photo</Text>
              </Pressable>
              <Pressable
                style={styles.addMoreButton}
                onPress={handleBrowseAgain}>
                <Icon name="image" size={20} color="#fff" />
                <Text style={styles.addMoreButtonText}>Browse Again</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityLabel="Cancel image upload">
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>

            <Pressable
              style={[
                styles.uploadButton,
                isUploading && styles.uploadButtonDisabled,
              ]}
              onPress={onUpload}
              disabled={isUploading || images.length === 0}
              accessibilityLabel="Upload selected images">
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Upload ({images.length})</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, // Takes up entire screen
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Still a dark overlay
    justifyContent: 'center', // Keep content centered if modalContent is smaller
    alignItems: 'center', // Keep content centered
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 0, // Remove border radius for true fullscreen feel
    padding: 20,
    width: screenWidth, // Take full width
    height: screenHeight, // Take full height
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    justifyContent: 'space-between', // Distribute content vertically
  },
  modalTitle: {
    fontSize: 22, // Slightly larger title for fullscreen
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a508c',
    textAlign: 'center',
    paddingTop: 40, // Add padding to avoid status bar overlap on iOS
  },
  flatListContent: {
    flexGrow: 1, // Allow FlatList to grow and take available space
    paddingVertical: 10,
    justifyContent: 'center', // Center images if few
    alignItems: 'center',
  },
  previewImageContainer: {
    margin: 5, // Slightly larger margin for better spacing
    position: 'relative',
    width: screenWidth * 0.45, // Adjust size for two columns
    height: screenWidth * 0.45,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#eee',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
    elevation: 3,
    zIndex: 1, // Ensure it's above the image
  },
  noImagesText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 18, // Larger font for fullscreen
    paddingVertical: 50,
    flexGrow: 1, // Push other elements away
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addMoreButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 15,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a508c',
    paddingVertical: 12, // Slightly more padding
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  addMoreButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingBottom: 20, // Add padding at the bottom
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14, // Larger padding
    paddingHorizontal: 30,
    borderRadius: 28, // More rounded
    minWidth: 130,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14, // Larger padding
    paddingHorizontal: 30,
    borderRadius: 28, // More rounded
    minWidth: 130,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#90ee90',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17, // Slightly larger font
    fontWeight: 'bold',
  },
});

export default ImagePreviewModal;
