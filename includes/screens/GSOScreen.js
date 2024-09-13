import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  Button,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Pressable,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Gallery from 'react-native-awesome-gallery';

const GSOSCreen = () => {
  const navigation = useNavigation();


  const handleCameraPress = async () => {
    navigation.navigate('Camera')
  };


  return (
    <View style={styles.container}>
      {/* <StatusBar backgroundColor="white" barStyle="dark-content" /> */}
      <View
        style={{
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{borderRadius: 100, overflow: 'hidden', margin: 10}}>
            <Pressable
              style={({pressed}) => [
                pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                {
                  width: 40,
                  backgroundColor: 'silver',
                  padding: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
              android_ripple={{color: 'gray'}}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-back-outline" size={26} color="white" />
            </Pressable>
          </View>
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              fontFamily: 'Oswald-Regular',
              lineHeight: 40,
            }}>
            CITY GENERAL SERVICES OFFICE
          </Text>
         
        </View>
        

        {/* <View style={{justifyContent: 'flex-end'}}>
          <Icon name="funnel-outline" size={20} color="white" />
        </View> */}
        
      </View>
    {/*   <View style={{alignSelf: 'flex-end', paddingEnd: 20}}>
          <Text style={{fontFamily: 'Abel-Regular', fontSize: 12}}>Powered by DocMobile v1</Text>
          </View> */}
      <View style={styles.separator}></View>
      <View style={styles.cameraContainer}>
        <Pressable
          style={({ pressed }) => [
            pressed && { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
            styles.cameraButton,
          ]}
          android_ripple={{ color: 'gray' }}
          onPress={handleCameraPress}>
          <Icon name="camera-outline" size={30} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
      },
      title: {
        color: 'black',
        fontSize: 24,
        fontFamily: 'Oswald-Regular',
        lineHeight: 40,
      },
      separator: {
        width: '100%',
        borderBottomColor: 'silver',
        borderBottomWidth: 1,
      },
      cameraContainer: {
        alignItems: 'center',
        marginTop: 10,
      },
      camera: {
        ...StyleSheet.absoluteFillObject,
      },
      cameraButton: {
        width: 60,
        height: 60,
        backgroundColor: 'silver',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
      },
    });

export default GSOSCreen;
