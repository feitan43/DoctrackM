// InspectionImage.js
import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Image} from 'react-native-ui-lib';
import FastImage from 'react-native-fast-image';
import {useInspectorImages} from '../../hooks/useInspection'; // Adjust path if needed

const InspectionImage = React.memo(({year, trackingNumber}) => {
  const {
    data: inspectorImages,
    loading: isLoading,
    error,
  } = useInspectorImages(year, trackingNumber);

  if (isLoading) {
    return (
      <View style={{backgroundColor: 'transparent'}}>
        <ActivityIndicator
          size="small"
          color="white"
          style={{width: 60, height: 60}}
        />
      </View>
    );
  }

  if (error || !inspectorImages?.length) {
    return (
      <Image
        source={require('../../../assets/images/noImage.jpg')} // Adjust path if needed
        style={{width: 60, height: 60, borderWidth: 1, borderColor: 'silver'}}
      />
    );
  }

  return (
    <FastImage
      source={{
        uri: inspectorImages[0],
        priority: FastImage.priority.high,
        cache: 'web',
      }}
      style={{width: 60, height: 60, borderWidth: 1, borderColor: 'silver'}}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
});

export default InspectionImage;