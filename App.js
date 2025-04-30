import 'react-native-gesture-handler';
import React, {useEffect, useState, memo} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Linking,
  Button,
  Modal
} from 'react-native';
import {Route} from './includes/navigation/Route';
import NetInfo from '@react-native-community/netinfo';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import FlashMessage from 'react-native-flash-message';
import {HotUpdater, useHotUpdaterStore} from '@hot-updater/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';

const queryClient = new QueryClient();

const App = () => {
  const [isConnected, setIsConnected] = useState(true);

  const { progress, isBundleUpdated } = useHotUpdaterStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const openWifiSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=WIFI').catch(() => {
        Alert.alert('Unable to open Wi-Fi settings. Please open it manually.');
      });
    } else {
      Linking.sendIntent('android.settings.WIFI_SETTINGS').catch(() => {
        Alert.alert('Unable to open Wi-Fi settings. Please open it manually.');
      });
    }
  };

  const checkConnection = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        Alert.alert('Connection', 'You are back online!');
      } else {
        openWifiSettings();
      }
    });
  };

  function extractFormatDateFromUUIDv7(uuid) {
    const timestampHex = uuid.split("-").join("").slice(0, 12);
    const timestamp = parseInt(timestampHex, 16);
  
    const date = new Date(timestamp);
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
  
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <FlashMessage position="bottom" />

        <View style={styles.container}>
          {isConnected ? (
            <>
            <Route />      
          </>
          ) : (
            <View style={styles.noInternetContainer}>
              <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
              />
              <Image
                source={require('./assets/images/connectionLost.png')}
                style={styles.noInternetImage}
              />
              <Text style={styles.title}>Ooops!</Text>
              <Text style={styles.subtitle}>No Internet Connection.</Text>
              <Text style={styles.noInternetText}>Check your connection.</Text>
              <TouchableOpacity
                onPress={checkConnection}
                style={styles.retryButton}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noInternetContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetImage: {
    height: 250,
    width: 230,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252525',
    fontFamily: 'Prompt-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
    opacity: 0.8,
  },
  noInternetText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9E9E9E',
    paddingHorizontal: 60,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    width: 250,
    backgroundColor: 'rgba(2, 65, 163, 0.8)',
    alignItems: 'center',
    borderRadius: 18,
  },
  retryText: {
    fontSize: 14,
    color: 'white',
  },
});

export default HotUpdater.wrap({
  source: 'https://zyuesdlbgbzhlstywrfi.supabase.co/functions/v1/update-server',
  reloadOnForceUpdate: true, 
})(App); 