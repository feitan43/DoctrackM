import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const screenHeight = Dimensions.get('window').height;

const MapComponent = ({ mapLocation }) => {
  if (!mapLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Location</Text>
        <View style={styles.separator}></View>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            marginHorizontal: 10,
            marginBottom: 10,
          }}>
          <Text
            style={{
              alignSelf: 'center',
              color: 'white',
              fontFamily: 'Oswald-Regular',
              fontSize: 16,
              padding: 10,
            }}>
            NO LOCATION FOUND
          </Text>
        </View>
      </View>
    );
  }

  const isEmbedUrl = mapLocation.includes('google.com/maps/embed');

  if (isEmbedUrl) {
    const iframeHtml = `
      <html>
        <body style="margin: 0; padding: 0;">
          <iframe
            src="${mapLocation}"
            width="100%"
            height="100%"
            frameborder="0"
            style="border:0"
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          ></iframe>
        </body>
      </html>
    `;

    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Location</Text>
        <View style={styles.separator}></View>
        <WebView
          originWhitelist={['*']}
          source={{ html: iframeHtml }}
          style={styles.webView}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Location</Text>
      <View style={styles.separator}></View>
      <WebView
        originWhitelist={['*']}
        source={{ uri: mapLocation }}
        style={styles.webView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  headerText: {
    fontFamily: 'Oswald-Regular',
    fontSize: 16,
  },
  separator: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'silver',
    marginVertical: 5,
    marginBottom: 10
  },
  webView: {
    height: screenHeight * 0.5,
  },
});

export default MapComponent;
