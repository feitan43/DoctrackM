import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import ExpandableListItem from '../components/ExpandableListItem';
import {faqCategories} from '../utils/faqData';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

const statusBarContentStyle = 'dark-content';
const statusBarHeight =
  Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;

const HelpCenterScreen = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={statusBarContentStyle}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({pressed}) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          android_ripple={{color: '#F0F0F0', borderless: true, radius: 24}}>
          <Icon name="arrow-back" size={24} color="#424242" />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/images/trackyhelp.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
          <View style={styles.bannerTextWrapper}>
            <Text style={styles.bannerTitle}>We’re here to help!</Text>
            <Text style={styles.bannerSubtitle}>
              Browse common questions or get in touch with support if you need
              assistance using DocMobile.
            </Text>

            {/* Contact Us Button */}
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('ContactUs')}>
              <Text style={styles.contactButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* FAQ Content */}
        {!Array.isArray(faqCategories) || faqCategories.length === 0 ? (
          <Text style={styles.errorText}>
            No FAQ data available. Please check your data source.
          </Text>
        ) : (
          faqCategories.map(category => (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>

              {Array.isArray(category.data) && category.data.length > 0 ? (
                category.type === 'faq' ? (
                  category.data.map(item => (
                    <ExpandableListItem key={item.id} title={item.question}>
                      <Text style={styles.answerText}>{item.answer}</Text>
                    </ExpandableListItem>
                  ))
                ) : (
                  category.data.map(trackingType => (
                    <ExpandableListItem
                      key={trackingType.id}
                      title={trackingType.title}>
                      {Array.isArray(trackingType.statuses) &&
                      trackingType.statuses.length > 0 ? (
                        trackingType.statuses.map((status, index) => (
                          <Text key={index} style={styles.statusText}>
                            {index + 1} - {status}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.emptyStatusText}>
                          No status updates available for this type.
                        </Text>
                      )}
                    </ExpandableListItem>
                  ))
                )
              ) : (
                <Text style={styles.emptyCategoryText}>
                  No items available in this category.
                </Text>
              )}
            </View>
          ))
        )}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    //borderBottomWidth:1,
    //borderColor:'#ccc',
    height: 30 + statusBarHeight,
  },
   headerTitle: {
    fontSize: 18,
    color: '#212121',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#777',
    textAlign: 'left',
  },
   backButton: {
    padding: 10,
    borderRadius: 24,
    marginRight: 5,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    color: '#212121',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 0,
    marginStart: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
 

  // Banner styles
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  bannerImage: {
    width: 100,
    height: 100,
    marginRight: 15,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2F4B99',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#3D3D3D',
  },

  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
    paddingHorizontal: 0,
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  emptyStatusText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    paddingTop: 5,
  },
  emptyCategoryText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 15,
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
    fontWeight: '500',
  },
  contactButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default HelpCenterScreen;
