import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar, 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient'; 
import {insertCommas} from '../utils/insertComma';
import { SafeAreaView } from 'react-native-safe-area-context';
import { removeHtmlTags } from '../utils';


const MyAccountabilityDetails = ({route, navigation}) => {
  const {selectedItem, selectedIcon, selectedName} = route.params;


  const renderContent = () => {
    return (
      <View style={styles.detailsCard}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumber}>
            {selectedItem.Year} - {selectedItem.TrackingNumber}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Item</Text>
            <Text style={styles.itemValue}>{selectedItem.Item}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Brand</Text>
            <Text style={styles.itemValue}>{selectedItem.Brand || 'N/A'}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Status</Text>
            <Text style={styles.itemValue}>{selectedItem.Status || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Unit Cost</Text>
            <Text style={styles.itemValue}>
              ₱{insertCommas(selectedItem.UnitCost)}
            </Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Amount</Text>
            <Text style={styles.itemValue}>
              ₱{insertCommas(selectedItem.Amount)}
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

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Serial Number</Text>
            <Text style={styles.itemValue}>{selectedItem.SerialNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Model Number</Text>
            <Text style={styles.itemValue}>{selectedItem.ModelNumber || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Property Number</Text>
            <Text style={styles.itemValue}>{selectedItem.PropertyNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.itemLabel}>Sticker Number</Text>
            <Text style={styles.itemValue}>{selectedItem.StickerNumber || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.itemValue}>
            {removeHtmlTags(selectedItem.Description) || 'No description available.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Current User</Text>
          <Text style={styles.itemValue}>
            {selectedItem.CurrentUserNum} - {selectedItem.CurrentUser}
          </Text>
          <Text style={styles.itemValue}>
            {selectedItem.CurrentUserPos}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1}}>
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
              color: '#E0F2F7',
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerContent}>
            <Icons
              name={selectedIcon}
              size={40}
              color="white"
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>
              {selectedName}
            </Text>
          </View>
        </LinearGradient>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', 
  },
  headerBackground: {
    paddingTop: StatusBar.currentHeight + 0,
    paddingBottom: 15, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start', 
    paddingLeft: 10, 
  },
  headerIcon: {
    marginBottom: 5, 
  },
  headerTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: 'white',
  },
  scrollViewContent: {
    padding: 15, 
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 5,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  section: {
    marginBottom: 20, 
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Inter_28pt-SemiBold',
    color: '#4A5568', 
    marginBottom: 5,
  },
  trackingNumber: {
    fontSize: 20, 
    fontFamily: 'Inter_28pt-Bold',
    color: '#2D3748', 
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoColumn: {
    flex: 1, 
    marginRight: 15,
  },
  itemLabel: {
    fontSize: 11, 
    fontFamily: 'Inter_28pt-Light', 
    color: '#718096', 
    marginBottom: 2,
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 15, 
    fontFamily: 'Inter_28pt-Regular', 
    color: '#252525',
    lineHeight: 22,
  },
});

export default MyAccountabilityDetails;