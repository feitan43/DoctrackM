import React, { useState } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export const useBackButtonHandler = (navigation) => {
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.isFocused()) {
          if (backPressedOnce) {
            BackHandler.exitApp();
          } else {
            setBackPressedOnce(true);
            ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

            setTimeout(() => setBackPressedOnce(false), 2000);
          }
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [backPressedOnce]),
  );
};
