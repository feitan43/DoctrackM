import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Platform, // Import Platform for OS-specific logic
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Changed to MaterialIcons for consistency
import useUserInfo from '../api/useUserInfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // Get safe area insets

  const {
    employeeNumber,
    fullName,
    officeName,
    officeCode, // Keeping this in case you need it later, but not displayed
    accountType,
    procurement,
    officeAdmin,
    gsoInspection,
    caoReceiver,
    caoEvaluator,
    cboReceiver,
  } = useUserInfo();

  const getAccountTypeName = type => {
    switch (parseInt(type)) {
      case 1:
        return 'Officer';
      case 2:
        return 'DTS Officer';
      case 3:
        return 'DocTrack Administrator';
      case 4:
        return 'Master Receiver';
      case 5:
        return 'Master Releaser';
      case 6:
        return 'Pending Master';
      case 7:
        return 'Programmer';
      case 8:
        return 'SLP Master';
      case 9:
        return 'Master Adviser';
      case 10:
        return 'BAC Officer';
      default:
        return 'Unknown Account Type';
    }
  };

  const getRoleNames = () => {
    const roles = [];
    if (procurement === '1') {
      roles.push('Procurement');
    }
    if (officeAdmin === '1') {
      roles.push('Office Admin');
    }
    if (gsoInspection === '1') {
      roles.push('Inspector');
    }
    if (caoReceiver === '1' || cboReceiver === '1') {
      roles.push('Receiver');
    }
    if (caoEvaluator === '1') {
      roles.push('Evaluator');
    }
    return roles;
  };

  const currentRoles = getRoleNames();
  const statusBarContentStyle = 'dark-content';

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={statusBarContentStyle}
      />
      
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          android_ripple={{ color: '#F0F0F0', borderless: true, radius: 24 }}>
          <Icon name="arrow-back-ios" size={24} color="#555" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/images/davao.png')} // Make sure this path is correct
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userRole}>{getAccountTypeName(accountType)}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Employee Number</Text>
            <Text style={styles.detailValue}>{employeeNumber}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Office</Text>
            <Text style={styles.detailValue}>{officeName}</Text>
          </View>

          {currentRoles.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Roles</Text>
                <Text style={styles.detailValue}>
                  {currentRoles.join(', ')}
                </Text>
              </View>
            </>
          )}
        </View>
        
        {/* Example of a modern button if you want to add one later */}
        {/* <TouchableOpacity style={styles.modernButton} activeOpacity={0.8}>
          <Text style={styles.modernButtonText}>Edit Profile</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Consistent background color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: '#FFFFFF', // White header background
    paddingVertical: 15, // Increased padding
    paddingHorizontal: 20, // Increased padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Subtle shadow
    shadowRadius: 6,
    //elevation: 3,
    borderBottomWidth: 0, // Remove border, rely on shadow
    marginBottom: 20, // Space below header
  },
  backButton: {
    padding: 5,
    marginRight: 10,
    borderRadius: 24, // Keeps it circular
  },
  backButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)', // Lighter press effect
  },
  headerTitle: {
    fontSize: 22, // Larger header title
    fontWeight: '700', // Bolder font
    color: '#2C3E50', // Darker, professional blue-grey
    marginLeft: 0, // Remove previous margin
  },
  container: {
    flex: 1,
    paddingHorizontal: 20, // Increased horizontal padding
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 35, // Increased padding
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // More rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Softer, wider shadow
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25, // More space
    marginTop: 0, // No top margin here, use padding on SafeAreaView
  },
  profileImage: {
    width: 130, // Slightly larger image
    height: 130,
    borderRadius: 65,
    marginBottom: 20, // More space below image
    borderWidth: 4, // Slightly thicker border
    borderColor: '#E0E0E0',
  },
  userName: {
    fontSize: 24, // Larger name
    fontWeight: '700', // Bolder name
    color: '#2C3E50',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#7F8C8D', // Softer grey for role
    fontWeight: '500', // Medium weight
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // More rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 25, // Increased padding
    paddingVertical: 20, // Increased padding
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center', // Center align items for cleaner look
    justifyContent: 'space-between', // Distribute space
    paddingVertical: 15, // Increased padding
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D', // Softer grey
    fontWeight: '500', // Medium weight
    flex: 1, // Allow label to take space
  },
  detailValue: {
    fontSize: 16, // Larger value text
    fontWeight: '600', // Semi-bold for values
    color: '#34495E', // Darker blue-grey
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0', // Lighter divider
    marginVertical: 0, // Removed vertical margin, letting padding handle it
  },
  // Example modern button style (uncomment and use if needed)
  /*
  modernButton: {
    backgroundColor: '#3498DB', // A pleasant blue
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modernButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  */
});

export default ProfileScreen;