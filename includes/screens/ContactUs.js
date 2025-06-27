import React, {useState} from 'react'; // Import useState
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  StatusBar,
  ScrollView,
  //SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
const statusBarContentStyle = 'dark-content';
const statusBarHeight =
  Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;

const ContactUsScreen = ({navigation}) => {
  const [showMapWebView, setShowMapWebView] = useState(false);
  const [currentMapUrl, setCurrentMapUrl] = useState('');

  const handleEmailPress = () => {
    Linking.openURL('mailto:projectdoctrack@gmail.com');
  };

  const handlePhonePress = number => {
    Linking.openURL(`tel:${number}`);
  };

  const handleFacebookPress = () => {
    const facebookURL =
      'fb://facewebmodal/f?href=https://www.facebook.com/projectdoctrack';
    const fallbackURL = 'https://www.facebook.com/projectdoctrack';

    Linking.canOpenURL(facebookURL)
      .then(supported => {
        if (supported) {
          return Linking.openURL(facebookURL);
        } else {
          return Linking.openURL(fallbackURL);
        }
      })
      .catch(err =>
        console.error('An error occurred trying to open Facebook link:', err),
      );
  };

  const handleMapPress = () => {
    const mapURL = `https://maps.app.goo.gl/DeFtpdf1rEZXSMU68`;
    setCurrentMapUrl(mapURL);
    setShowMapWebView(true);
  };

  const ContactItem = ({iconName, imageSource, label, value, onPress}) => (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.contactItem,
        pressed && styles.contactItemPressed,
      ]}
      android_ripple={{color: '#E0E0E0', borderless: false}}>
      {iconName && <Icon name={iconName} size={22} color="#607D8B" />}
      {imageSource && (
        <Image source={imageSource} style={styles.contactItemImage} />
      )}
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
    </Pressable>
  );

  if (showMapWebView) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Pressable
            onPress={() => setShowMapWebView(false)}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            android_ripple={{color: '#F0F0F0', borderless: true, radius: 24}}>
            <Icon name="arrow-back" size={24} color="#424242" />
          </Pressable>
          <Text style={styles.headerTitle}>Office Location</Text>
        </View>
        <WebView
          source={{uri: currentMapUrl}}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={statusBarContentStyle}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({pressed}) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          android_ripple={{color: '#F0F0F0', borderless: true, radius: 24}}>
          <Icon name="arrow-back" size={24} color="#424242" />
        </Pressable>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContentContainer}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/images/trackyhelp.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
          <View style={styles.bannerTextWrapper}>
            <Text style={styles.bannerTitle}>Want quick answers?</Text>
            <Text style={styles.bannerSubtitle}>Try our Help Center!</Text>

            {/* Contact Us Button */}
            <TouchableOpacity
              style={styles.helpcenterButton}
              onPress={() => navigation.navigate('HelpCenter')}>
              <Text style={styles.helpcenterButtonText}>Help Center</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Email Us</Text>
        <ContactItem
          imageSource={require('../../assets/images/gmail.png')}
          label="General Inquiries"
          value="projectdoctrack@gmail.com"
          onPress={handleEmailPress}
        />
        <Text style={styles.sectionTitle}>Project Doctrack Hotline</Text>
        <ContactItem
          iconName="call-sharp"
          label="Landline"
          value="(082) 308 3246"
          onPress={() => handlePhonePress('0823083246')}
        />
        <ContactItem
          iconName="phone-portrait-sharp"
          label="Mobile (GLOBE)"
          value="0954 167 3749"
          onPress={() => handlePhonePress('09541673749')}
        />
        <ContactItem
          iconName="phone-portrait-sharp"
          label="Mobile (SMART)"
          value="0962 682 7702"
          onPress={() => handlePhonePress('09626827702')}
        />

        <Text style={styles.sectionTitle}>Find Us on Social Media</Text>
        <ContactItem
          imageSource={require('../../assets/images/fblogo.png')}
          label="Facebook"
          value="Project Doctrack"
          onPress={handleFacebookPress}
        />

        <Text style={styles.sectionTitle}>Visit Us</Text>
        <ContactItem
          iconName="location-outline"
          label="Office Location"
          value="G/F Project Doctrack Office (Old CHO Building) Pichon St. Brgy. 1-A Poblacion District, Davao City"
          onPress={handleMapPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    //borderBottomWidth:1,
    //borderColor:'#ccc',
    height: 30 + statusBarHeight,
  },
  backButton: {
    padding: 10,
    borderRadius: 24,
    marginRight: 5,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    color: '#212121',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollViewContentContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#424242',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 5,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  contactItemPressed: {
    backgroundColor: '#F0F0F0',
  },
  contactItemImage: {
    width: 22,
    height: 22,
    marginRight: 15,
    marginTop: 2,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  contactLabel: {
    fontSize: 13,
    color: '#757575',
  },
  contactValue: {
    fontSize: 15,
    color: '#212121',
    marginTop: 2,
  },
  webView: {
    flex: 1,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  bannerImage: {
    width: 100,
    height: 100,
    marginRight: 15,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F4B99',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#3D3D3D',
  },
  helpcenterButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  helpcenterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default ContactUsScreen;
