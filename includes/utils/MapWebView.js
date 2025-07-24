import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

const MapWebView = () => {
  const sampleLatitude = 7.0700; // Sample latitude (e.g., Davao City)
  const sampleLongitude = 125.6100; // Sample longitude (e.g., Davao City)
  const zoomLevel = 15; // Zoom level for the map

  // HTML content for the WebView
  // This uses the Google Maps Embed API.
  // Replace 'YOUR_API_KEY' with your actual Google Maps API key.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Map</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function initMap() {
          const location = { lat: ${sampleLatitude}, lng: ${sampleLongitude} };
          const map = new google.maps.Map(document.getElementById('map'), {
            zoom: ${zoomLevel},
            center: location,
            disableDefaultUI: true // Optional: disables default map UI controls
          });
          new google.maps.Marker({
            position: location,
            map: map,
            title: 'Sample Location'
          });
        }
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap">
      </script>
    </body>
    </html>
  `;

  // IMPORTANT: Replace 'YOUR_API_KEY' with your actual Google Maps API Key.
  // You need to enable the Maps JavaScript API in your Google Cloud project.

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        // You might want to add error handling for WebView
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent.description);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default MapWebView;