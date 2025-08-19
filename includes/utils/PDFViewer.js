import React, { useState, useEffect, useRef, memo } from 'react';
import { StyleSheet, Dimensions, View, ActivityIndicator, Text, TouchableOpacity, Linking } from 'react-native';
import Pdf from 'react-native-pdf';
import NetInfo from '@react-native-community/netinfo'; // Using the community NetInfo

const PdfViewer = ({ pdfUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleConnectivityChange = (state) => {
      const connected = state.isConnected;
      setIsConnected(connected);
      if (!connected && !error) {
        setError('No internet connection. Please check your network settings.');
        setLoading(false);
      } else if (connected && error && error.includes('network connection')) {
        setError(null);
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    NetInfo.fetch().then(handleConnectivityChange);

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeoutRef.current);
    };
  }, [error]);

  useEffect(() => {
    if (pdfUrl) {
      setLoading(true);
      setError(null);
      loadingTimeoutRef.current = setTimeout(() => {
        setError('PDF loading took too long. Please try again.');
        setLoading(false);
      }, 30000);
    } else {
      setError('Error: PDF URL is missing.');
      setLoading(false);
    }

    return () => {
      clearTimeout(loadingTimeoutRef.current);
    };
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: PDF URL is missing.</Text>
      </View>
    );
  }

  const source = { uri: pdfUrl, cache: true };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    {/*   {loading && (
        <View style={styles.loadingOverlay} accessibilityLabel="Loading PDF">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )} */}
      <Pdf
        source={source}
        trustAllCerts={false}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
          setLoading(false);
          clearTimeout(loadingTimeoutRef.current);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page} / ${numberOfPages}`);
        }}
        onError={(pdfError) => {
          console.error('PDF rendering error:', pdfError);
          let errorMessage = 'Failed to load PDF. Please check the URL or your network connection.';
          if (pdfError && pdfError.message) {
            errorMessage = `PDF Error: ${pdfError.message}`;
          }
          setError(errorMessage);
          setLoading(false);
          clearTimeout(loadingTimeoutRef.current);
        }}
        onPressLink={(uri) => {
          console.log(`Link pressed: ${uri}`);
          Linking.openURL(uri).catch(err => console.error('Failed to open link:', err));
        }}
        style={styles.pdf}
        testID="pdf-viewer"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#556C80',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#eee',
  },
});
export default memo(PdfViewer);