import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  Pressable,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserInfo from '../api/useUserInfo';
import {SafeAreaView} from 'react-native-safe-area-context';

const ProfileScreen = ({navigation}) => {
  const {employeeNumber, fullName, officeName, officeCode, accountType} =
    useUserInfo();

  // PERMISSIONS:
  // 10 - gso
  // 11 - gso
  // 30 - ling
  // 31 - cbo
  // 32 - PPMP
  // 33 - light/water
  // 34 - ling hr
  // 35 - bac
  // 36 - cancel
  // 37 - cto check management
  // 38 - BAC Secretariat
  // 39 - BAC Chairman
  // 40 - CEO PDD
  // 41 - CEO Construction
  // 42 - CEO Admin
  // 43 - CAO trust fund controller
  // 44 - CBO gen fund fund controller
  // 45 - Inventory Assets Module viewer
  // 46 - REMI Account for all access program and account codes
  // 47 - Disaster Account
  // 48 - Receiver Admin -New-
  // 49 - Receiver GSO -New-
  // 50 - Receiver CTO -New-
  // 51 - Receiver CBO -New-
  // 52 - Receiver CEO -New-
  // 53 - Receiver CAO -New-

  // PRIVILEGES:
  // 1 - CAO Mai2 (For AP Cancellation Button)
  // 2 - CAO Janice (Master Receiver)
  // 3 - CAO Do2 and Kervih (Document Receivers)
  // 4 - For PR - EDIT STATUS function
  // 5 - Admin Operations Receiving

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

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
          Profile
        </Text>
      </View>

      {/* Profile Picture */}
      <Image
        source={require('../../assets/images/davao.png')}
        style={styles.profileImage}
      />
      <View style={{paddingHorizontal: 20, rowGap: 5}}>
        <Text style={styles.label}>Employee Number</Text>
        <Text style={styles.labelValue}>{employeeNumber}</Text>
        <View
          style={{
            height: 1,
            marginTop: 10,
            backgroundColor: 'gray',
          }}
        />

        <Text style={styles.label}>Account Name</Text>
        <Text style={styles.labelValue}>{fullName}</Text>

        <View
          style={{
            height: 1,
            marginTop: 10,
            backgroundColor: 'gray',
          }}
        />

        <Text style={styles.label}>Office</Text>
        <Text style={styles.labelValue}>{officeName}</Text>

        <View
          style={{
            height: 1,
            marginTop: 10,
            backgroundColor: 'gray',
          }}
        />

        <Text style={styles.label}>Account Type </Text>
        <Text style={styles.labelValue}>
          {parseInt(accountType) === 1
            ? 'Officer'
            : parseInt(accountType) === 2
            ? 'DTS Officer'
            : parseInt(accountType) === 3
            ? 'Doctrack Administrator'
            : parseInt(accountType) === 4
            ? 'Master Receiver'
            : parseInt(accountType) === 5
            ? 'Master Releaser'
            : parseInt(accountType) === 6
            ? 'Pending Master'
            : parseInt(accountType) === 7
            ? 'Programmer'
            : parseInt(accountType) === 8
            ? 'SLP Master'
            : parseInt(accountType) === 9
            ? 'Master Adviser'
            : parseInt(accountType) === 10
            ? 'BAC Officer'
            : 'Unknown Account Type'}
        </Text>

        <View
          style={{
            height: 1,
            marginTop: 10,
            backgroundColor: 'gray',
          }}
        />
      </View>

      {/* Name */}
      {/*  <Text>Name</Text>
      <Text style={styles.name}>{fullName}</Text>

      <Text style={styles.name}>{employeeNumber}</Text>

      <Text style={styles.name}>{officeName}</Text>

      <Text style={styles.name}>{officeCode}</Text>
 */}
      {/* Edit Profile Button */}
      {/* <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
    padding: 10,
    paddingStart: 20,
    backgroundColor: '#fff',
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 40,
    opacity: 0.5,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Oswald-Medium',
    color: '#333',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontFamily: 'Inter_28pt-Regular',
    color: 'rgba(107, 107, 107, 0.53)',
    fontSize: 12,
  },
  labelValue: {
    fontFamily: 'Inter_28pt-Regular',
    fontSize: 14,
    color: 'black',
  },
});

export default ProfileScreen;
