import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  StatusBar,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserInfo from '../api/useUserInfo';
//import {SafeAreaView} from 'react-native-safe-area-context';
import {useSafeAreaInsets} from 'react-native-safe-area-context'; // Import this

const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;
const ProfileScreen = ({navigation}) => {
  const {
    employeeNumber,
    fullName,
    officeName,
    officeCode,
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/images/davao.png')}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA',
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
    elevation: 4,
    height: 80 + statusBarHeight,

    
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
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 18,
    color: '#212121',
    marginLeft: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  userName: {
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 22,
    color: '#212121',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  userRole: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 15,
    color: '#616161',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 13,
    color: '#757575',
    width: 120,
    marginRight: 10,
  },
  detailValue: {
    fontFamily: 'Inter_28pt-Medium',
    fontSize: 15,
    color: '#212121',
    flex: 1,
    textAlign:'right'
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 0,
  },
  editButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'center',
    width: '90%',
    marginTop: 30,
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
