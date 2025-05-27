import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserInfo from '../api/useUserInfo';
import {SafeAreaView} from 'react-native-safe-area-context';

const ProfileScreen = ({navigation}) => {
  const {
    employeeNumber,
    fullName,
    officeName,
    officeCode,
    accountType,
    gsoInspection,
    caoReceiver,
    caoEvaluator,
    cboReceiver,
  } = useUserInfo();

  // Helper function to map accountType to readable string
  const getAccountTypeName = type => {
    switch (parseInt(type)) {
      case 1:
        return 'Officer';
      case 2:
        return 'DTS Officer';
      case 3:
        return 'Doctrack Administrator';
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

  // Helper function to get additional privilege names based on flags
  const getPrivilegeNames = () => {
    const privileges = [];
    if (gsoInspection === 1) {
      privileges.push('Inspector');
    }
    // Combine caoReceiver and cboReceiver into a single 'Receiver' privilege
    if (caoReceiver === 1 || cboReceiver === 1) {
      privileges.push('Receiver');
    }
    if (caoEvaluator === 1) {
      privileges.push('Evaluator');
    }
    return privileges;
  };

  const currentPrivileges = getPrivilegeNames();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header with Back Button and Title */}
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.container}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/images/davao.png')} // Consider a more generic placeholder or user-specific avatar
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userRole}>{getAccountTypeName(accountType)}</Text>
        </View>

        {/* Profile Details Section */}
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

          {/* Display Privileges if any exist */}
          {currentPrivileges.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Privileges</Text>
                <Text style={styles.detailValue}>
                  {currentPrivileges.join(', ')}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Button Section (e.g., Edit Profile, Logout) */}
        {/* If you want to add an "Edit Profile" or "Logout" button later, this is a good place */}
        {/*
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA', // Light background for the whole screen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12, // Adjusted padding for better header height
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 3,
    elevation: 4,
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
    fontFamily: 'Inter_28pt-Bold', // Assuming this custom font is available
    fontSize: 18,
    color: '#212121', // Darker text for better contrast
    marginLeft: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15, // Consistent horizontal padding
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 30, // More vertical padding around image and name
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // Slightly rounded corners
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20, // Space below the profile card
    marginTop: 10, // Space above the profile card
  },
  profileImage: {
    width: 120, // Slightly larger image
    height: 120, // Slightly larger image
    borderRadius: 60, // Perfect circle
    marginBottom: 15,
    borderWidth: 3, // Add a subtle border
    borderColor: '#E0E0E0', // Light border color
  },
  userName: {
    fontFamily: 'Inter_28pt-Bold', // Stronger font for name
    fontSize: 22,
    color: '#212121',
    textTransform: 'capitalize', // Ensure consistent capitalization
    marginBottom: 5,
  },
  userRole: {
    fontFamily: 'Inter_28pt-Regular', // Use regular for the role
    fontSize: 15,
    color: '#616161', // Muted color for role
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    paddingHorizontal: 20, // Padding inside the details card
    paddingVertical: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes label and value to opposite ends
    alignItems: 'center',
    paddingVertical: 12, // Vertical padding for each detail row
  },
  detailLabel: {
    fontFamily: 'Inter_28pt-Regular', // Consistent font for labels
    fontSize: 13,
    color: '#757575', // Muted gray for labels
  },
  detailValue: {
    fontFamily: 'Inter_28pt-Medium', // Slightly bolder for values
    fontSize: 15,
    color: '#212121', // Darker color for values
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE', // Lighter, more subtle divider
    marginVertical: 0, // No extra margin if handled by paddingVertical in detailItem
  },
  editButton: {
    backgroundColor: '#007BFF', // Primary blue button
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'center',
    width: '90%', // Almost full width
    marginTop: 30, // Space above the button
    shadowColor: '#007BFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_28pt-Bold',
    textAlign: 'center',
  },
});

export default ProfileScreen;