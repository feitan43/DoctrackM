import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Vibration,
  Alert,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import BASE_URL from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {CommonActions} from '@react-navigation/native';

const {encrypt} = require('../security/encryption');

import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

const LoginScreen = ({navigation}) => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [pushToken, setPushToken] = useState(null);

  const [isChecked, setChecked] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [errorApi, setErrorApi] = useState('');

  const [loginError, setLoginError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isApiAccessible, setIsApiAccessible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isInputFocused, setInputFocused] = useState(null);

  const passwordInputRef = useRef(null); // Reference for password input
  const isButtonDisabled = !employeeNumber || !password;

  const handleFocus = field => {
    setInputFocused(field);
  };

  const handleBlur = () => {
    setInputFocused(null);
  };

  const handleSplash = () => {
    navigation.navigate('Splash');
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setLoading(false);

        if (storedToken) {
          navigation.navigate('Home');
        }
      } catch (error) {
        setLoading(false);
        console.error('Error checking token:', error);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    const checkApiAccessibility = async () => {
      try {
        const response = await fetch(`${BASE_URL}/`, {
          method: 'HEAD',
        });

        if (response.ok) {
          setIsApiAccessible(true);
        }
      } catch (error) {
        console.error();
        console.error('API is not accessible:', error);
        setIsApiAccessible(false);
      }
    };
    checkApiAccessibility();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const retrieveStoredCredentials = async () => {
      try {
        const storedEmployeeNumber = await AsyncStorage.getItem(
          'employeeNumber',
        );
        const storedPassword = await AsyncStorage.getItem('password');
        if (storedEmployeeNumber && storedPassword) {
          setEmployeeNumber(storedEmployeeNumber);
          setPassword(storedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error retrieving stored credentials:', error);
      }
    };
    retrieveStoredCredentials();
  }, []);

  // const handleLogin = async () => {
  //   setLoading(true);

  //   if (rememberMe) {
  //     try {
  //       await AsyncStorage.setItem('employeeNumber', employeeNumber);
  //       await AsyncStorage.setItem('password', password);
  //     } catch (error) {
  //       console.error('Error storing credentials:', error);
  //     }
  //   } else {
  //     // If "Remember Me" is unchecked, clear the stored credentials
  //     try {
  //       await AsyncStorage.removeItem('employeeNumber');
  //       await AsyncStorage.removeItem('password');
  //     } catch (error) {
  //       console.error('Error clearing stored credentials:', error);
  //     }
  //   }

  //   if (!isConnected) {
  //     Alert.alert('Network Error', 'Please check your network connection.');
  //     setLoading(false);
  //     return;
  //   }

  //   if (!employeeNumber || !password) {
  //     setError(true);
  //     setLoading(false);
  //     return;
  //   } else {
  //     setError(false);
  //   }

  //   try {
  //     const pushToken = await messaging().getToken();
  //     const userDevice = DeviceInfo.getDeviceId();
  //     const response = await fetch(`${BASE_URL}/loginApi`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         EmployeeNumber: employeeNumber,
  //         Password: password,
  //         PushToken: pushToken,
  //         UserDevice: userDevice,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       await AsyncStorage.setItem('token', data.token);

  //       navigation.dispatch(
  //         CommonActions.reset({
  //           index: 0,
  //           routes: [
  //             {
  //               name: 'Home',
  //               params: {
  //                 employeeNumber: employeeNumber,
  //                 password: password,
  //                 pushToken: pushToken,
  //                 token: data.token,
  //                 userDevice: userDevice,
  //               },
  //             },
  //           ],
  //         }),
  //       );
  //     } else {
  //       if (data.error) {
  //         setLoginError(true);
  //         setErrorApi(data.error);
  //         setModalVisible(true);
  //         /*  Alert.alert('Authentication Error', data.error); */
  //       } else {
  //         setModalVisible(true);
  //         setErrorApi(data.message);
  //         //Alert.alert('Network Error', 'Failed to connect to the server.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert('Error', 'An error occurred while processing your request.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    setLoading(true);
  
    if (rememberMe) {
      try {
        await AsyncStorage.setItem('employeeNumber', employeeNumber);
        await AsyncStorage.setItem('password', password);
      } catch (error) {
        console.error('Error storing credentials:', error);
      }
    } else {
      // If "Remember Me" is unchecked, clear the stored credentials
      try {
        await AsyncStorage.removeItem('employeeNumber');
        await AsyncStorage.removeItem('password');
      } catch (error) {
        console.error('Error clearing stored credentials:', error);
      }
    }
  
    if (!isConnected) {
      Alert.alert('Network Error', 'Please check your network connection.');
      setLoading(false);
      return;
    }
  
    if (!employeeNumber || !password) {
      setError(true);
      setLoading(false);
      return;
    } else {
      setError(false);
    }
  
    const controller = new AbortController();  // Create an AbortController
    const signal = controller.signal;  // Extract the signal to be passed into fetch
  
    const timeout = setTimeout(() => {
      controller.abort();  // Abort the fetch request if it takes too long
    }, 10000); // 10 seconds timeout
  
    try {
      const pushToken = await messaging().getToken();
      const userDevice = DeviceInfo.getDeviceId();
      
      const response = await fetch(`${BASE_URL}/loginApi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeNumber: employeeNumber,
          Password: password,
          PushToken: pushToken,
          UserDevice: userDevice,
        }),
        signal,  // Attach the abort signal to the fetch request
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
  
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Home',
                params: {
                  employeeNumber: employeeNumber,
                  password: password,
                  pushToken: pushToken,
                  token: data.token,
                  userDevice: userDevice,
                },
              },
            ],
          }),
        );
      } else {
        if (data.error) {
          setLoginError(true);
          setErrorApi(data.error);
          setModalVisible(true);
        } else {
          setModalVisible(true);
          setErrorApi(data.message);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert('Error', 'The request timed out. Please try again.');
      } else {
        console.error(error);
        Alert.alert('Error', 'An error occurred while processing your request.');
      }
    } finally {
      clearTimeout(timeout);  
      setLoading(false);
    }
  };

  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Image
        source={require('../../assets/images/eagle.png')}
        style={[styles.topImage, {height: isInputFocused ? '38%' : '42%'}]}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('../../assets/images/loginBGBottom.png')}
          style={styles.backgroundImage}>
          <View style={styles.textContainer}>
            <Text style={styles.centeredText}>
              DocMobile<Text style={{color: '#ECAD0D', fontSize: 15}}>v2.6</Text>
            </Text>

            <View
              style={[
                styles.inputContainer,
                isInputFocused === 'employeeNumber' &&
                  styles.inputContainerFocused,
              ]}>
              <TextInput
                label="Outlined input"
                style={styles.input}
                placeholder="Employee Number"
                value={employeeNumber}
                onChangeText={input => {
                  const numericInput = input.replace(/[^0-9]/g, '');
                  setEmployeeNumber(numericInput);
                }}
                autoCapitalize="none"
                keyboardType="numeric"
                fontSize={18}
                maxLength={6}
                onFocus={() => handleFocus('employeeNumber')}
                onBlur={handleBlur}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                isInputFocused === 'password' && styles.inputContainerFocused,
              ]}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!isPasswordVisible}
                value={password}
                fontSize={18}
                maxLength={16}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                onChangeText={text => setPassword(text)}
                ref={passwordInputRef}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.visibilityIcon}>
                <Icon
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                paddingStart: '10%',
                alignSelf: 'flex-start',
              }}>
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon
                  name={rememberMe ? 'checkbox-outline' : 'square-outline'}
                  size={24}
                  color="white"
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    fontSize: 13,
                    //fontFamily: 'Oswald-Regular',
                  }}>
                  Remember Me
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={{width: '80%'}}>
              <TouchableOpacity
                style={[
                  {
                    backgroundColor: '#012968',
                    //backgroundColor: 'rgba(28, 115, 232, 1)',
                    padding: 15,
                    height: 'auto',
                    alignItems: 'center',
                    borderRadius: 5,
                    marginBottom: 10,
                    marginTop: 10,
                    elevation: 5,
                  },
                  isButtonDisabled && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isButtonDisabled}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <View style={{alignItems: 'center'}}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        //letterSpacing: 2,
                        //fontFamily: 'Oswald-Regular',
                      }}>
                      SIGN IN
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={{marginTop: -10}}>
              {error && (
                <View style={styles.errorMessage}>
                  <Text style={{color: 'white'}}>Fill in all fields.</Text>
                </View>
              )}

              {!isConnected && (
                <View style={styles.errorMessage}>
                  <Text style={{color: 'red'}}>
                    No internet connection. Please check your network settings.
                  </Text>
                </View>
              )}
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {/* <Icon name="close-circle" size={100} color="#E53935" /> */}
                  <Image
                    style={{width: 185, height: 150}}
                    source={require('../../assets/images/errorState.png')}
                  />
                  <Text style={styles.modalText}>{errorApi}</Text>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topImage: {
    width: '100%',
    height: '39%',
    position: 'absolute',
    top: 0,
    zIndex: 1, // Ensure it appears on top
    opacity: 0.1,
    //backgroundColor:'yellow'
  },
  backgroundImage: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 180,
  },
  centeredText: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'Prompt-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    marginTop: 110,
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Roboto-Regular',
    color: 'gray',
    fontSize: 18,
    marginBottom: 16,
  },
  overlayText: {
    fontSize: 40,
    color: 'white',
    fontFamily: 'Oswald-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  versionText: {
    color: '#ECAD0D',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
  },
  logo: {
    height: 190,
    width: 150,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 170,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'silver',
    marginBottom: 10,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: '#143d6b',
    borderWidth: 3,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  visibilityIcon: {
    position: 'absolute',
    right: 10,
  },
  loginButton: {
    backgroundColor: '#143d6b',
    paddingVertical: 12,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginVertical: 20,
    fontFamily: 'Oswald-Regular',
  },
  closeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 106, 235, 1)',
    paddingVertical: 10,
    paddingHorizontal: 90,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#888', // Change to a disabled color
    elevation: 0, // Remove elevation for disabled button
  },
});

export default LoginScreen;
