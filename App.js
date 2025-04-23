import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
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
  NativeEventEmitter,
  NativeModules,
  LogBox,
} from 'react-native';
import {Route} from './includes/navigation/Route';
import NetInfo from '@react-native-community/netinfo';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import FlashMessage from 'react-native-flash-message';
import { HotUpdater, useHotUpdaterStore, addListener   } from "@hot-updater/react-native";


const queryClient = new QueryClient();


const App = () => {
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    LogBox.ignoreLogs(['new NativeEventEmitter() was called']);
  }, []);
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
  reloadButton: {
    padding: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  reloadText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

//export default App;
//source: 'https://zyuesdlbgbzhlstywrfi.supabase.co/functions/v1/update-server',

export default HotUpdater.wrap({
  source: 'https://zyuesdlbgbzhlstywrfi.supabase.co/functions/v1/update-server',
  //source: '',  
  requestHeaders: {
    "Authorization": "Bearer <your-access-token>",
  },
})(App);