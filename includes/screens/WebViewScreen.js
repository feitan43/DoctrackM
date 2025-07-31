// WebViewScreen.js
import React, { useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, Button, Text, ActivityIndicator, TextInput, Keyboard, SafeAreaView, Platform } from 'react-native'; // Added Platform

const WebViewScreen = ({ route }) => {
  // Use a ref for the WebView component
  const webViewRef = useRef(null);

  // State for the currently loaded URL in the WebView
  const [currentWebViewUrl, setCurrentWebViewUrl] = useState('https://www.davaocityportal.com/reg');
  // State for the URL typed into the TextInput
  const [inputUrl, setInputUrl] = useState('https://www.davaocityportal.com/'); // Initialize input with default URL

  const [isLoading, setIsLoading] = useState(true); // State to manage loading indicator

  // Function to handle navigation to a new URL
  const handleGo = () => {
    Keyboard.dismiss(); // Dismiss the keyboard when "Go" is pressed
    if (inputUrl.trim()) {
      // Basic URL formatting: Prepend https:// if no protocol is specified
      const formattedUrl = inputUrl.startsWith('http://') || inputUrl.startsWith('https://')
                             ? inputUrl
                             : `https://${inputUrl}`;
      setIsLoading(true); // Show loading indicator
      setCurrentWebViewUrl(formattedUrl); // Update the WebView's URL
    }
  };

  // Optional: Functions for the fixed buttons (if still desired)
  const goToMainPortal = () => {
    const url = 'https://www.davaocityportal.com/reg';
    setInputUrl(url); // Also update the TextInput
    setIsLoading(true);
    setCurrentWebViewUrl(url);
  };

  const goToChangerPage = () => {
    // Note: Using http:// for local network. Be aware of iOS App Transport Security (ATS)
    // which might block non-HTTPS requests by default in production builds.
    const url = 'http://192.168.254.114/jlcharts/interface/budgetStat.php';
    setInputUrl(url); // Also update the TextInput
    setIsLoading(true);
    setCurrentWebViewUrl(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <View style={styles.container}>
        {/* URL Input Bar */}
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlTextInput}
            placeholder="Enter URL (e.g., example.com)"
            value={inputUrl}
            onChangeText={setInputUrl}
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleGo} // Allows pressing "Go" on keyboard
            clearButtonMode="while-editing" // iOS clear button
          />
          <Button title="Go" onPress={handleGo} />
        </View>

        {/* Button Container for fixed links (Optional - keep if needed, remove if not) */}
        <View style={styles.buttonContainer}>
          <Button
            title="Go to Login (Davao Portal)"
            onPress={goToMainPortal}
            color="#007bff"
          />
          <Button
            title="Go to Changer Page"
            onPress={goToChangerPage}
            color="#28a745"
          />
        </View>

        {/* Displaying the currently loaded URL (for clarity) */}
        <Text style={styles.currentUrlText}>
          Currently loaded in WebView: {currentWebViewUrl}
        </Text>

        {/* The WebView component */}
        <WebView
          ref={webViewRef}
          source={{ uri: currentWebViewUrl }} // WebView uses this state
          style={styles.webview}
          // Update both inputUrl and currentWebViewUrl when WebView navigates internally
          onNavigationStateChange={(navState) => {
            // Only update if the URL actually changed to avoid unnecessary re-renders
            if (navState.url !== currentWebViewUrl) {
              setCurrentWebViewUrl(navState.url);
              setInputUrl(navState.url); // Keep the TextInput in sync with current loaded page
            }
          }}
          // Handle loading state
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          // Optional: Error handling
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent.description, nativeEvent.url);
            setIsLoading(false); // Hide loading on error
            // You could display an error message to the user here
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}

          // --- ZOOMING RELATED PROPS ---
          scalesPageToFit={true} // Enables pinch-to-zoom on iOS and Android
          // Some Android versions might require injecting a viewport meta tag if scalesPageToFit isn't enough
          // However, for most modern web content, setting scalesPageToFit should be sufficient.
          // injectedJavaScript={
          //   Platform.OS === 'android'
          //     ? 'const meta = document.createElement("meta"); meta.setAttribute("name", "viewport"); meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"); document.getElementsByTagName("head")[0].appendChild(meta);'
          //     : ''
          // }
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading webpage...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Match container background
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  urlInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  urlTextInput: {
    flex: 1,
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  currentUrlText: {
    padding: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    backgroundColor: '#e9e9e9',
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});

export default WebViewScreen;