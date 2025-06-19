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
  LogBox,
  Modal, // Keep Modal if you use it elsewhere, otherwise it can be removed from here
} from 'react-native';
import {Route} from './includes/navigation/Route';
import NetInfo from '@react-native-community/netinfo';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import FlashMessage from 'react-native-flash-message';
import {HotUpdater, useHotUpdaterStore} from '@hot-updater/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';
import ImmersiveMode from 'react-native-immersive-mode';
import {
  withStallion,
  useStallionUpdate,
  restart,
  useStallionModal,
} from 'react-native-stallion'; // Import useStallionUpdate and restart

// Import sp-react-native-in-app-updates
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
// You might also need react-native-device-info if you're not explicitly passing curVersion
// import DeviceInfo from 'react-native-device-info';

const queryClient = new QueryClient();

LogBox.ignoreLogs([
  'new NativeEventEmitter() was called with a non-null argument without the required `addListener` method.',
]);


// Initialize in-app updates (false for debug mode off in production)
const inAppUpdates = new SpInAppUpdates(true);

// Define the UpdatePrompt component
const UpdatePrompt = () => {
  const {isRestartRequired, newReleaseBundle} = useStallionUpdate();

  console.log('isRestartRequired:', isRestartRequired);
  console.log('newReleaseBundle:', newReleaseBundle);


  if (!isRestartRequired) return null;

  return (
    <Modal transparent animationType="fade" visible={isRestartRequired}>
      <View style={updatePromptStyles.centeredView}>
        <View style={updatePromptStyles.modalView}>
          <Text style={updatePromptStyles.modalText}>
            {newReleaseBundle?.releaseNote ?? 'A new update is ready!'}
          </Text>
          <TouchableOpacity style={updatePromptStyles.button} onPress={restart}>
            <Text style={updatePromptStyles.buttonText}>Restart now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const updatePromptStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: 'rgba(2, 65, 163, 0.8)',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const App = () => {
  const [isConnected, setIsConnected] = useState(true);

  const {progress, isBundleUpdated} = useHotUpdaterStore();
  const {showModal} = useStallionModal();

 
  useEffect(() => {
    ImmersiveMode.fullLayout(true);
    ImmersiveMode.setBarMode('Full');
    ImmersiveMode.setBarStyle('Light');
    ImmersiveMode.setBarTranslucent(true);
    ImmersiveMode.fullLayout(true);
    //ImmersiveMode.setBarColor('#003166');
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkAppStoreUpdates = async () => {
      try {
        // const currentVersion = DeviceInfo.getVersion();
        const result = await inAppUpdates.checkNeedsUpdate();
        if (result.shouldUpdate) {
          let updateOptions = {};
          if (Platform.OS === 'android') {
            updateOptions = {
              updateType: IAUUpdateKind.IMMEDIATE, // Or IAUUpdateKind.IMMEDIATE
            };
          } else if (Platform.OS === 'ios') {
            updateOptions = {
              forceUpgrade: true,
              title: 'New Version Available!',
              message:
                'A new version of the app is available. Please update for the best experience.',
              buttonUpgradeText: 'Update Now',
              buttonCancelText: 'Later',
            };
          }

          inAppUpdates.startUpdate(updateOptions);
        }
      } catch (error) {
        //console.error('Error checking for in-app updates:', error);
      }
    };

    const updateCheckTimeout = setTimeout(() => {
      checkAppStoreUpdates();
    }, 3000);

    return () => clearTimeout(updateCheckTimeout);
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
    const timestampHex = uuid.split('-').join('').slice(0, 12);
    const timestamp = parseInt(timestampHex, 16);

    const date = new Date(timestamp);
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

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

        <FlashMessage position="bottom" zIndex={9999} />

        {/* Integrate the UpdatePrompt component here */}
        {/* <UpdatePrompt /> */}
        <View style={styles.container}>
          {isConnected ? (
            <>
              {/* HotUpdater's progress can be displayed if you want to */}
              {/* {progress > 0 && progress < 100 && (
                <View style={styles.updateProgressContainer}>
                  <Text style={styles.updateProgressText}>Downloading update: {progress.toFixed(0)}%</Text>
                </View>
              )} */}
              <Route />
             {/*   <Button title="Open Stallion" onPress={showModal} /> */}
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
  // If you decide to show HotUpdater progress
  // updateProgressContainer: {
  //   position: 'absolute',
  //   top: StatusBar.currentHeight || 0,
  //   left: 0,
  //   right: 0,
  //   backgroundColor: 'rgba(0, 0, 0, 0.7)',
  //   padding: 5,
  //   alignItems: 'center',
  //   zIndex: 1000,
  // },
  // updateProgressText: {
  //   color: 'white',
  //   fontSize: 12,
  // },
});

export default withStallion(App);
