import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  Linking,
  Pressable,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserInfo from '../api/useUserInfo';
import {SafeAreaView} from 'react-native-safe-area-context';

const ContactUsScreen = ({navigation}) => {
  const {employeeNumber, fullName, officeName, officeCode, accountType} =
    useUserInfo();

  const handleEmailPress = () => {
    Linking.openURL('mailto:projectdoctrack@gmail.com');
  };

  const handlePhonePress = number => {
    Linking.openURL(`tel:${number}`);
  };

  const handleFacebookPress = () => {
    const facebookURL =
      'fb://facewebmodal/f?href=https://www.facebook.com/projectdoctrack'; // Opens in the Facebook app if installed
    const fallbackURL = 'https://www.facebook.com/projectdoctrack'; // Opens in browser if app is not installed

    Linking.canOpenURL(facebookURL)
      .then(supported => {
        if (supported) {
          return Linking.openURL(facebookURL);
        } else {
          return Linking.openURL(fallbackURL);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            paddingBottom: 5,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}>
          <Pressable
            style={({pressed}) => [
              pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginStart: 10,
                padding: 10,
                borderRadius: 24,
              },
            ]}
            android_ripple={{
              color: '#F6F6F6',
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="gray" />
          </Pressable>

          <Text
            style={{
              padding: 10,
              color: '#252525',
              fontFamily: 'Inter_28pt-Bold',
              fontSize: 16,
            }}>
            Contact Us
          </Text>
        </View>
        <View style={{paddingHorizontal: 20, paddingTop: 20}}>
          <Text style={styles.label}>E-mail us</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-start',
              alignContent: 'center',
              padding: 10,
            }}>
            <Image
              source={require('../../assets/images/gmail.png')}
              style={styles.profileImage}
            />
            <TouchableOpacity onPress={handleEmailPress}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: '#333333',
                  textDecorationLine: 'underline',
                  paddingStart: 10,
                }}>
                {'projectdoctrack@gmail.com'}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 1,
              marginTop: 5,
              marginBottom: 10,
              backgroundColor: 'rgba(174, 171, 171, 0.2)',
            }}
          />
          <View style={{paddingTop: 10}}>
            <Text style={styles.label}>Project Doctrack Hotline</Text>
          </View>

          <View style={{flexDirection: 'row', padding: 10}}>
            <Icon name="call-sharp" size={24} color="gray" />
            <TouchableOpacity onPress={() => handlePhonePress('0823083246')}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: '#252525',
                  paddingStart: 10,
                  textDecorationLine: 'underline',
                }}>
                {'(082) 308 3246'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', padding: 10}}>
            <Icon name="phone-portrait-sharp" size={24} color="gray" />
            <TouchableOpacity onPress={() => handlePhonePress('09541673749')}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: '#252525',
                  paddingStart: 10,
                  textDecorationLine: 'underline',
                }}>
                {'0954 167 3749 - (GLOBE)'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', padding: 10, paddingBottom: 20}}>
            <Icon name="phone-portrait-sharp" size={24} color="gray" />
            <TouchableOpacity onPress={() => handlePhonePress('09626827702')}>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: '#252525',
                  paddingStart: 10,
                  textDecorationLine: 'underline',
                }}>
                {'0962 682 7702 - (SMART)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            height: 5,
            marginTop: 5,
            backgroundColor: 'rgba(174, 171, 171, 0.2)',
          }}
        />

        <View style={{padding: 20}}>
          <Text style={styles.label}>Find us on social media</Text>

          <Pressable
            onPress={handleFacebookPress}
            android_ripple={{
              color: 'rgba(42, 125, 216, 0.2)', // Ripple color
              //radius: 30, // Optional: adjust the radius of the ripple
            }}>
            <View style={{flexDirection: 'row', paddingStart: 10}}>
              <Image
                source={require('../../assets/images/fblogo.png')}
                style={styles.profileImage}
              />
              <Text
                style={{
                  paddingStart: 10,
                  paddingVertical: 20,
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 16,
                  color: '#252525',
                }}>
                Project Doctrack
              </Text>
            </View>
          </Pressable>
        </View>

        <View
          style={{
            height: 5,
            marginTop: 5,
            backgroundColor: 'rgba(174, 171, 171, 0.2)',
          }}
        />
        <View style={{padding: 20}}>
          <Text style={styles.label}>Visit Us</Text>

          <View style={{flexDirection: 'row', padding: 10}}>
            <Icon name="location-outline" size={24} color="gray" />
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_28pt-Regular',
                  fontSize: 14,
                  color: '#252525',
                  paddingStart: 10,
                  //textDecorationLine: 'underline',
                }}>
                {`G/F Project Doctrack Office (Old CHO Building) Pichon St. Brgy. 1-A Poblacion District, Davao City`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#f5f5f5',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
    padding: 10,
    paddingStart: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#252525',
    fontFamily: 'Inter_28pt-Bold',
  },
  profileImage: {
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Oswald-Medium',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 14,
  },
  labelValue: {
    fontFamily: 'Oswald-Light',
    fontSize: 12,
  },
});

export default ContactUsScreen;
