import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import useUserInfo from '../../api/useUserInfo';

export default function SuppliesSummary({ navigation }) {
    const {officeCode} = useUserInfo();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const webViewRef = useRef(null);

  // BottomSheet refs and snap points
  const bottomSheetRefYear = useRef(null);
  const snapPointsYear = useMemo(() => ['30%', '60%'], []);

  // Generate years list
  const yearsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years.sort((a, b) => b - a);
  }, []);

  // Dynamic URL
  const summaryUrl = useMemo(() => {
    return `https://www.davaocityportal.com/cit/interface/printSuppliesForOffices.php?office=${officeCode}&year=${selectedYear}`;
  }, [selectedYear, officeCode]);

  // PDF URL (assuming your backend can generate PDFs)
  const pdfUrl = useMemo(() => {
    return `https://www.davaocityportal.com/cit/interface/generatePdf.php?office=TRAC&year=${selectedYear}`;
  }, [selectedYear]);

  // Print handler using react-native-print
  // Updated handlePrint function
const handlePrint = useCallback(async () => {
  try {
    // Show loading indicator
    setIsLoading(true);

    // Check if Print module is available
    if (!Print.print) {
      throw new Error('Print module not available');
    }

    // Option 1: Print as PDF (if your backend supports it)
   /*  await Print.print({
      filePath: pdfUrl,
    }); */

    await Print.print({
      html: `<html><body><h1>Supplies Summary ${selectedYear}</h1><iframe src="${summaryUrl}" style="display:none;"></iframe></body></html>`
    });

  } catch (error) {
    console.error('Failed to print:', error);
    Alert.alert(
      'Printing Error',
      error.message === 'Print module not available' 
        ? 'Printing functionality is not available on this device' 
        : 'Failed to print the document. You can try taking a screenshot instead.',
      [{ text: 'OK' }]
    );
  } finally {
    setIsLoading(false);
  }
}, [pdfUrl, selectedYear]);

  // Handlers for Year filter Bottom Sheet
  const handlePresentYearFilter = useCallback(() => {
    bottomSheetRefYear.current?.expand();
  }, []);

  const handleSelectYear = useCallback((year) => {
    setSelectedYear(year);
    bottomSheetRefYear.current?.close();
  }, []);

  const handleCloseYearSheet = useCallback(() => {
    bottomSheetRefYear.current?.close();
  }, []);

  // Render item for year list
  const renderYearItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedYear === item && styles.filterOptionSelected,
      ]}
      onPress={() => handleSelectYear(item)}>
      <Text
        style={[
          styles.filterOptionText,
          selectedYear === item && styles.filterOptionTextSelected,
        ]}>
        {item}
      </Text>
      {selectedYear === item && (
        <Ionicons name="checkmark-circle" size={20} color="#1A508C" />
      )}
    </TouchableOpacity>
  ), [selectedYear]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1A508C', '#004ab1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topHeader}>
        <Pressable
          style={styles.backButton}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: true,
            radius: 20,
          }}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.topHeaderTitle}>Supplies Summary</Text>
        </View>
       {/*  <Pressable
          style={styles.printButton}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: true,
            radius: 20,
          }}
          onPress={handlePrint}>
          <Ionicons name="print" size={24} color="#fff" />
        </Pressable> */}
      </LinearGradient>

      {/* Year Filter Container */}
      <View style={styles.filterContainer}>
        <Pressable
          style={styles.filterButton}
          android_ripple={{
            color: 'rgba(0,0,0,0.1)',
            borderless: false,
          }}
          onPress={handlePresentYearFilter}>
          <MaterialCommunityIcons name="calendar" size={20} color="#1A508C" />
          <Text style={styles.filterButtonText}>
            Year: {selectedYear}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#1A508C"
          />
        </Pressable>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1A508C" />
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      )}

      {/* WebView to display the form */}
      <WebView
        ref={webViewRef}
        source={{ uri: summaryUrl }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent.description);
          setIsLoading(false);
          Alert.alert(
            'Loading Error',
            'Failed to load the summary. Please check your internet connection and try again.',
            [{ text: 'OK' }]
          );
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1A508C" />
            <Text style={styles.loadingText}>Loading summary...</Text>
          </View>
        )}
      />

      {/* Year Filter Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRefYear}
        index={-1}
        snapPoints={snapPointsYear}
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Select Year</Text>
            <Pressable
              onPress={handleCloseYearSheet}
              style={styles.closeButton}
              android_ripple={{
                color: 'rgba(0,0,0,0.1)',
                borderless: true,
                radius: 18,
              }}>
              <Ionicons name="close-circle" size={24} color="#777" />
            </Pressable>
          </View>
          <BottomSheetFlatList
            data={yearsList}
            renderItem={renderYearItem}
            keyExtractor={item => item.toString()}
            contentContainerStyle={styles.bottomSheetListContent}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  topHeader: {
    height: 100,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    //alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    //textAlign: 'center',
  },
  printButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F9FC',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E6EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexShrink: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginHorizontal: 8,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 20,
  },
  bottomSheetHandle: {
    backgroundColor: '#E0E0E0',
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    paddingLeft: 24,
    paddingRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  bottomSheetListContent: {
    paddingBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 6,
  },
  filterOptionSelected: {
    backgroundColor: '#EBF5FF',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#34495E',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    fontWeight: '700',
    color: '#1A508C',
  },
});