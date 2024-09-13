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
} from 'react-native';
import {Route} from './includes/navigation/Route';
import NetInfo from '@react-native-community/netinfo';
import {
  checkBatteryOptimization,
} from './includes/notification/notificationServices';
import {GestureHandlerRootView} from 'react-native-gesture-handler';


const App = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    checkBatteryOptimization();
  }, []);

  const openWifiSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=WIFI').catch(() => {
        alert('Unable to open Wi-Fi settings. Please open it manually.');
      });
    } else {
      Linking.sendIntent('android.settings.WIFI_SETTINGS').catch(() => {
        alert('Unable to open Wi-Fi settings. Please open it manually.');
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
        //Alert.alert('Connection', 'No internet connection. Please try again.');
      }
    });
  };


  return (
    <GestureHandlerRootView
      style={{flex: 1}}>
        <StatusBar
              barStyle="light-content"
              backgroundColor={'transparent'}
              translucent
            />
      <View style={styles.container}>
        {isConnected ? (
          <Route />
        ) : (
          <View style={styles.noInternetContainer}>
              <StatusBar
              barStyle="dark-content"
              backgroundColor={'transparent'}
              translucent
            />
            <Image
              source={require('./assets/images/no-wifi.png')}
              style={{
                tintColor: 'rgba(2, 65, 163, .9)',
                height: 250,
                width: 250,
                margin: 30,
              }}
            />

            <Text style={{fontSize: 40, color: '#252525', fontFamily: 'Prompt-Bold'}}>
              Ooops!
            </Text>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: '#252525', opacity:0.8}}>
              No Internet Connection.
            </Text>
            <Text style={styles.noInternetText}>
              Check your connection.
            </Text>
            <TouchableOpacity
              onPress={checkConnection}
              style={{
                marginTop: 20,
                padding: 10,
                width: 250,
                backgroundColor: 'rgba(2, 65, 163, 0.8)',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 18, color: 'white'}}>Try Again</Text>
            </TouchableOpacity>
            
          </View>
        )}
      </View>
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
  animation: {
    width: 200,
    height: 300,
  },
  noInternetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9E9E9E',
    paddingHorizontal: 60,
  },
});

export default App;
