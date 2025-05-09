import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base-64';

global.atob = decode;

const useUserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [officeCode, setOfficeCode] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [officeName, setOfficeName] = useState(null);
  const [employeeNumber, setEmployeeNumber] = useState(null);
  const [privilege, setPrivilege] = useState(null)
  const [accountType, setAccountType] = useState(null);
  const [permission, setPermission] = useState(null);
  const [caoReceiver, setCaoReceiver] = useState(null);
  const [caoEvaluator, setcaoEvaluator] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) return;

        setToken(storedToken);
        const decodedResult = decodeToken(storedToken);

        setUserData(decodedResult.data[0]);
        setOfficeCode(decodedResult.data[0].OfficeCode);
        setFullName(decodedResult.data[0].FullName);
        setOfficeName(decodedResult.data[0].OfficeName);
        setEmployeeNumber(decodedResult.data[0].EmployeeNumber);
        setPrivilege(decodedResult.data[0].Privilege);
        setAccountType(decodedResult.data[0].AccountType);
        setPermission(decodedResult.data[0].Permission);
        setCaoReceiver(decodedResult.data[0].CAORECEIVER);
        setcaoEvaluator(decodedResult.data[0].CAOEVALUATOR);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError(error.message);
      }
    };

    fetchUserInfo();
  }, []);

  const decodeToken = token => {
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
    officeCode,
    fullName,
    officeName,
    employeeNumber,
    privilege,
    accountType,
    permission,
    caoReceiver: userData?.CAORECEIVER ?? null,
    caoEvaluator: userData?.CAOEVALUATOR ?? null,
    token,
    error,
    officeCode: userData?.OfficeCode ?? null,
    fullName: userData?.FullName ?? null,
    officeName: userData?.OfficeName ?? null,
    employeeNumber: userData?.EmployeeNumber ?? null,
    privilege: userData?.Privilege ?? null,
    accountType: userData?.AccountType ?? null,
    permission: userData?.Permission ?? null,
    procurement: userData?.PROCUREMENT ?? null,
    gsoInspection: userData?.GSOINSPECTION ?? null,
    officeAdmin: userData?.OFFICEADMIN ?? null,
  };
};

export default useUserInfo;
