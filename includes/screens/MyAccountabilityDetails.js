import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {insertCommas} from '../utils/insertComma';
import {removeHtmlTags} from '../utils';
import {useInventoryImages} from '../hooks/useInventory';

const MyAccountabilityDetails = ({route, navigation}) => {
  const {selectedItem, selectedIcon, selectedName} = route.params;

  const {Id, Office, TrackingNumber} = selectedItem;

  const {
    data: imageUris,
    isLoading: imageLoading,
    isError: imageError,
  } = useInventoryImages(Id, Office, TrackingNumber);

  const renderContent = () => {
    return (
      <View style={styles.detailsCard}>
        <View style={styles.trackingNumberSection}>
          <Text style={styles.trackingNumberLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumberValue}>
            {selectedItem.Year} - {selectedItem.TrackingNumber}
          </Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Item Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Brand</Text>
              <Text style={styles.itemValue}>
                {selectedItem.Brand || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Status</Text>
              <Text style={styles.itemValue}>
                {selectedItem.Status || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Unit Cost</Text>
              <Text style={styles.itemValue}>
                ₱{insertCommas(selectedItem.UnitCost) || '0.00'}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Amount</Text>
              <Text style={styles.itemValue}>
                ₱{insertCommas(selectedItem.Amount) || '0.00'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Qty</Text>
              <Text style={styles.itemValue}>{selectedItem.Qty || 'N/A'}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Unit</Text>
              <Text style={styles.itemValue}>{selectedItem.Unit || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Identification Numbers</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Serial Number</Text>
              <Text style={styles.itemValue}>
                {selectedItem.SerialNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Model Number</Text>
              <Text style={styles.itemValue}>
                {selectedItem.ModelNumber || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Property Number</Text>
              <Text style={styles.itemValue}>
                {selectedItem.PropertyNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Sticker Number</Text>
              <Text style={styles.itemValue}>
                {selectedItem.StickerNumber || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Description</Text>
          <Text style={styles.descriptionValue}>
            {removeHtmlTags(selectedItem.Description) ||
              'No description available.'}
          </Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Current User</Text>
          <Text style={styles.currentUserValue}>
            {selectedItem.CurrentUserNum} - {selectedItem.CurrentUser}
          </Text>
          <Text style={styles.currentUserPosition}>
            {selectedItem.CurrentUserPos}
          </Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Images</Text>
          {imageLoading ? (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#1A508C" />
              <Text style={styles.imageLoadingText}>Loading images...</Text>
            </View>
          ) : imageError ? (
            <View style={styles.noImageContainer}>
              <Icons name="alert-circle-outline" size={60} color="#EF4444" />
              <Text style={styles.noImageText}>Error loading images.</Text>
            </View>
          ) : imageUris && imageUris.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalImageScroll}>
              {imageUris.map((uri, index) => (
                <View key={index} style={styles.itemImageWrapper}>
                  <Image
                    source={{uri: uri}}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noImageContainer}>
              <Icons name="image-off-outline" size={60} color="#b0b0b0" />
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A508C', '#004AB1']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerBackground}>
          <Pressable
            style={({pressed}) => [
              styles.backButton,
              pressed && {backgroundColor: 'rgba(255, 255, 255, 0.2)'},
            ]}
            android_ripple={{
              color: 'rgba(255, 255, 255, 0.3)',
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerContent}>
            <Icons
              name={selectedIcon || 'information'}
              size={40}
              color="white"
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>{selectedName || 'Details'}</Text>
          </View>
        </LinearGradient>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 0,
  },
  horizontalImageScroll: {
    paddingVertical: 10,
  },
  itemImageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
  },
  noImageContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noImageText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  trackingNumberSection: {
    backgroundColor: '#E6F0FF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  trackingNumberLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trackingNumberValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A508C',
  },
  infoGroup: {
    marginBottom: 25,
    paddingTop: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'left',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoColumn: {
    flex: 1,
    marginRight: 15,
    paddingHorizontal: 5,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    lineHeight: 24,
  },
  descriptionValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
    paddingHorizontal: 5,
  },
  currentUserValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    paddingHorizontal: 5,
  },
  currentUserPosition: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
    paddingHorizontal: 5,
  },
});

export default MyAccountabilityDetails;
