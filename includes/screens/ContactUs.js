import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

const ContactUsScreen = ({navigation}) => {
  // userInfo is not used in the UI, so it's removed for cleaner code
  // const {employeeNumber, fullName, officeName, officeCode, accountType} = useUserInfo();

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
      .catch(err => console.error('An error occurred', err));
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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

      <View style={styles.container}>
        {/* Email Section */}
        <Text style={styles.sectionTitle}>Email Us</Text>
        <ContactItem
          imageSource={require('../../assets/images/gmail.png')}
          label="General Inquiries"
          value="projectdoctrack@gmail.com"
          onPress={handleEmailPress}
        />

        {/* Hotline Section */}
        <View style={styles.sectionDivider} />
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

        {/* Social Media Section */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionTitle}>Find Us on Social Media</Text>
        <ContactItem
          imageSource={require('../../assets/images/fblogo.png')}
          label="Facebook"
          value="Project Doctrack"
          onPress={handleFacebookPress}
        />

        {/* Visit Us Section */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionTitle}>Visit Us</Text>
        <ContactItem
          iconName="location-outline"
          label="Office Location"
          value="G/F Project Doctrack Office (Old CHO Building) Pichon St. Brgy. 1-A Poblacion District, Davao City"
          // onPress could open a map application if desired
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA', // Light grey background for a cleaner look
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4, // Higher elevation for a more pronounced shadow
    marginBottom: 8, // Space below header
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
    fontFamily: 'Inter_28pt-Bold', // Assuming you have this custom font
    fontSize: 18,
    color: '#212121', // Darker text for better contrast
    marginLeft: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 15,
    color: '#424242',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start for multi-line address
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8, // Spacing between contact items
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  contactItemPressed: {
    backgroundColor: '#F0F0F0', // Lighter background on press
  },
  contactItemImage: {
    width: 22,
    height: 22,
    marginRight: 15,
    marginTop: 2, // Adjust for better vertical alignment with text
  },
  contactTextContainer: {
    flex: 1, // Allows text to wrap and push icon/image to the left
    marginLeft: 15, // Space between icon/image and text
  },
  contactLabel: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 13,
    color: '#757575', // Slightly muted label for hierarchy
  },
  contactValue: {
    fontFamily: 'Inter_28pt-Medium', // Slightly bolder for primary info
    fontSize: 15,
    color: '#212121',
    marginTop: 2,
    // Removed textDecorationLine: 'underline' from here to apply only on pressable items
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#E0E0E0', // Distinct separator between sections
    marginVertical: 20,
    borderRadius: 3,
  },
});

export default ContactUsScreen;