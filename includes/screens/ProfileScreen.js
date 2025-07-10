import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserInfo from '../api/useUserInfo';
import { useSafeAreaInsets} from 'react-native-safe-area-context';

const ProfileScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();

  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;

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
    payroll,
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
      roles.push({ name: 'Procurement', icon: 'cart-outline' });
    }
    if (payroll === '1') {
      roles.push({ name: 'Payroll', icon: 'cash-outline' });
    }
    if (officeAdmin === '1') {
      roles.push({ name: 'Office Admin', icon: 'business-outline' });
    }
    if (gsoInspection === '1') {
      roles.push({ name: 'Inspector', icon: 'search-outline' });
    }
    if (caoReceiver === '1' || cboReceiver === '1') {
      roles.push({ name: 'Receiver', icon: 'archive-outline' });
    }
    if (caoEvaluator === '1') {
      roles.push({ name: 'Evaluator', icon: 'clipboard-outline' });
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
      <View style={[styles.header, {paddingTop: statusBarHeight + 12}]}>
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
          <Text style={styles.userAccountType}>
            {getAccountTypeName(accountType)}
          </Text>
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
                <View style={styles.rolesDisplayContainer}>
                  {currentRoles.map((role, index) => (
                    <View key={index} style={styles.stackedRoleItem}>
                      <Icon name={role.icon} size={16} color="#616161" style={styles.stackedRoleIcon} />
                      <Text style={styles.stackedRoleText}>{role.name}</Text>
                    </View>
                  ))}
                </View>
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
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 19,
    color: '#212121',
    marginLeft: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 25,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#42A5F5',
    opacity: 1,
  },
  userName: {
    fontFamily: 'Inter_28pt-Bold',
    fontSize: 24,
    color: '#212121',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  userAccountType: {
    fontFamily: 'Inter_28pt-Medium',
    fontSize: 16,
    color: '#616161',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  detailItem: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  detailLabel: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  detailValue: {
    fontFamily: 'Inter_28pt-Medium',
    fontSize: 16,
    color: '#212121',
    textAlign: 'right',
    maxWidth: '60%',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 0,
  },
  rolesDisplayContainer: {
    flexDirection: 'column', // Stack roles vertically
    alignItems: 'flex-end', // Align roles to the right
    flexShrink: 1, // Allows the container to shrink if content is too wide
  },
  stackedRoleItem: {
    flexDirection: 'row', // Align icon and text horizontally within each role item
    alignItems: 'center',
    justifyContent: 'flex-end', // Align contents of this item to the right
    paddingVertical: 2, // Small vertical padding for separation
  },
  stackedRoleIcon: {
    marginRight: 4,
  },
  stackedRoleText: {
    fontFamily: 'Inter_28pt-Medium', // Match detailValue font
    fontSize: 16, // Match detailValue font size
    color: '#212121', // Match detailValue color
  },
});

export default ProfileScreen;