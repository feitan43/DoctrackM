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
  Image, // Import Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {insertCommas} from '../utils/insertComma';
import {removeHtmlTags} from '../utils';
import { useInventoryImages } from '../hooks/useInventory';

const MyAccountabilityDetails = ({route, navigation}) => {
  const {selectedItem, selectedIcon, selectedName} = route.params;
  const {data} = useInventoryImages();

  const renderContent = () => {
    return (
      <View style={styles.detailsCard}>
        {/* Tracking Number Section - Enhanced prominence */}
        <View style={styles.trackingNumberSection}>
          <Text style={styles.trackingNumberLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumberValue}>
            {selectedItem.Year} - {selectedItem.TrackingNumber}
          </Text>
        </View>

        {/* General Item Information */}
        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Item Details</Text>
         {/*  <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.itemLabel}>Item</Text>
              <Text style={styles.itemValue}>{selectedItem.Item}</Text>
            </View>
          </View> */}

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

        {/* Identification Numbers Group */}
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

        {/* Description Section */}
        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Description</Text>
          <Text style={styles.descriptionValue}>
            {removeHtmlTags(selectedItem.Description) ||
              'No description available.'}
          </Text>
        </View>

        {/* Current User Section */}
        <View style={styles.infoGroup}>
          <Text style={styles.groupTitle}>Current User</Text>
          <Text style={styles.currentUserValue}>
            {selectedItem.CurrentUserNum} - {selectedItem.CurrentUser}
          </Text>
          <Text style={styles.currentUserPosition}>
            {selectedItem.CurrentUserPos}
          </Text>
        </View>

        {/* Image Section - Moved to the bottom */}
        {selectedItem.ImageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{uri: selectedItem.ImageUrl}}
              style={styles.itemImage}
              resizeMode="contain" // Ensures the entire image is visible
            />
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Icons name="image-off-outline" size={60} color="#b0b0b0" />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}
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
              color: 'rgba(255, 255, 255, 0.3)', // Slightly more visible ripple
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerContent}>
            <Icons
              name={selectedIcon || 'information'} // Fallback icon
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
    backgroundColor: '#F8F9FB', // Consistent background
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0, // Adjusted for Android
    paddingBottom: 20, // Increased padding
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 8, // More prominent shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  backButton: {
    width: 44, // Slightly smaller
    height: 44, // Slightly smaller
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Increased margin
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 0, // Removed paddingLeft
  },
  headerIcon: {
    marginBottom: 8, // Increased margin
  },
  headerTitle: {
    fontSize: 22, // Larger font
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', // Subtle text shadow
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  scrollViewContent: {
    padding: 20, // Increased padding
    paddingBottom: 40, // More bottom padding
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16, // More rounded corners
    padding: 25, // Increased padding
    elevation: 6, // More subtle shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 0, // Removed border
  },
  // Image container styles
  imageContainer: {
    width: '100%',
    height: 200, // Fixed height for the image area
    borderRadius: 12,
    backgroundColor: '#E0E0E0', // Light grey background for empty/loading state
    marginTop: 25, // Changed to marginTop to push it down
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Clip image if it overflows
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Slightly darker grey for no image
    borderRadius: 12,
    marginTop: 25, // Changed to marginTop to push it down
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noImageText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  // Tracking Number section styles (from previous iteration)
  trackingNumberSection: {
    backgroundColor: '#E6F0FF', // Light blue background
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 25, // More space
    //alignItems: 'center', // Center align content
  },
  trackingNumberLabel: {
    fontSize: 14,
    fontWeight: '600',
    //color: '#004AB1', // Blue text
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trackingNumberValue: {
    fontSize: 24, // Larger font for emphasis
    fontWeight: 'bold',
    color: '#1A508C', // Darker blue
  },
  // New styles for grouping sections (from previous iteration)
  infoGroup: {
    marginBottom: 25, // More space between groups
    paddingTop: 15, // Padding within group
    borderTopWidth: StyleSheet.hairlineWidth, // Thin separator
    borderTopColor: '#E0E0E0',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700', // Bolder title
    color: '#333',
    marginBottom: 15, // Space below title
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'left', // Center align group titles
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18, // Increased spacing between rows
  },
  infoColumn: {
    flex: 1,
    marginRight: 15,
    paddingHorizontal: 5, // Small horizontal padding
  },
  itemLabel: {
    fontSize: 12, // Slightly larger
    fontWeight: '500', // Medium weight
    color: '#666', // Darker grey
    marginBottom: 4, // More space below label
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemValue: {
    fontSize: 16, // Larger value font
    fontWeight: '600', // Bolder value
    color: '#222', // Almost black
    lineHeight: 24, // Improved line height
  },
  descriptionValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify', // Justify text for descriptions
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