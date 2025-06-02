import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Platform } from 'react-native';
import ExpandableListItem from '../components/ExpandableListItem';
import { faqCategories } from '../utils/faqData';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Icon name="arrow-back-ios" size={22} color="#666" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>Find answers to common questions about DocMobile.</Text>
          </View>
        </View>

        {!Array.isArray(faqCategories) || faqCategories.length === 0 ? (
          <Text style={styles.errorText}>No FAQ data available. Please check your data source.</Text>
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
                    <ExpandableListItem key={trackingType.id} title={trackingType.title}>
                      {Array.isArray(trackingType.statuses) && trackingType.statuses.length > 0 ? (
                        trackingType.statuses.map((status, index) => (
                          <Text key={index} style={styles.statusText}>
                            {index + 1} - {status}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.emptyStatusText}>No status updates available for this type.</Text>
                      )}
                    </ExpandableListItem>
                  ))
                )
              ) : (
                <Text style={styles.emptyCategoryText}>No items available in this category.</Text>
              )}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
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
    marginBottom: 25,
    paddingHorizontal: 0,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#777',
    textAlign: 'left',
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
});

export default FAQScreen;