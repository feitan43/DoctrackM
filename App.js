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
  Button,
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

const AppContent = () => {
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
           {/*  <Button
            title="Reload"
            onPress={() => HotUpdater.reload()}
            //disabled={!isBundleUpdated}
          /> */}
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

const FallbackComponent = ({progress, status, message}) => (
  <View
    style={{
      flex: 1,
      padding: 24,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    }}>
    <View
      style={{
        backgroundColor: '#FFFFFF',
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderRadius: 20,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}>
      <Text
        style={{
          color: '#1E1E1E',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 12,
        }}>
        {status === 'UPDATING' ? 'Updating...' : 'Checking for Update...'}
      </Text>

      {message && (
        <Text
          style={{
            color: '#444',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
          }}>
          {message}
        </Text>
      )}

      {progress > 0 && (
        <Text style={{color: '#1D4ED8', fontSize: 20, fontWeight: 'bold'}}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  </View>
);

const App = HotUpdater.wrap({
  source: 'https://zyuesdlbgbzhlstywrfi.supabase.co/functions/v1/update-server',
  reloadOnForceUpdate: false,
  onUpdateProcessCompleted: async ({status, shouldForceUpdate, id, message}) => {
    setTimeout(() => {
      showMessage({
        message: `Update Check: ${status}`,
        description: `Force: ${shouldForceUpdate}\nID: ${id}\n${message ?? ''}`,
        type: shouldForceUpdate ? 'warning' : 'info',
        duration: 4000,
      });
    }, 100); // Delay a bit to ensure FlashMessage is ready
  
    if (shouldForceUpdate && status === 'NEEDS_UPDATE') {
      await AsyncStorage.setItem('lastUpdatedId', id);
      HotUpdater.reload();
    }
    
  },
  fallbackComponent: FallbackComponent,
})(AppContent);

export default App;
