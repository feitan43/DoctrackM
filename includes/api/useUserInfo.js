import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base-64';

global.atob = decode;

const useUserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) return;

        setToken(storedToken);
        const decodedResult = decodeToken(storedToken);
        setUserData(decodedResult?.data[0] ?? null);
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(err.message);
      }
    };

    fetchUserInfo();
  }, []);

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (err) {
      console.log('Error decoding token:', err);
      return null;
    }
  };

  return {
    userData,
    token,
    error,
    officeCode: userData?.OfficeCode ?? null,
    fullName: userData?.FullName ?? null,
    officeName: userData?.OfficeName ?? null,
    employeeNumber: userData?.EmployeeNumber ?? null,
    privilege: userData?.Privilege ?? null,
    accountType: userData?.AccountType ?? null,
    permission: userData?.Permission ?? null,
    caoReceiver: userData?.CAORECEIVER ?? null,
    caoEvaluator: userData?.CAOEVALUATOR ?? null,
    procurement: userData?.PROCUREMENT ?? null,
    gsoInspection: userData?.GSOINSPECTION ?? null,
    officeAdmin: userData?.OFFICEADMIN ?? null,
    cboReceiver: userData?.CBORECEIVER ?? null,
    boss: userData?.BOSS ?? null,
  };
};

export default useUserInfo;
