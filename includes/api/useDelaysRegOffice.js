import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const useDelaysRegOffice = () => {
  const [delaysRegOfficeData, setDelaysRegOfficeData] = useState(null);
  const [regOfficeDelaysLength, setRegOfficeDelaysLength] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const { officeCode } = useUserInfo();
  const [delaysLoading, setDelaysLoading] = useState(true);
  const fetchDataRegOfficeDelays = async () => {
    try {
      setDelaysLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (!officeCode) {
        return;
      }

      const response = await fetch(
        `${BASE_URL}/regOfficeDelays?OfficeCode=${officeCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setDelaysRegOfficeData(data);
        setRegOfficeDelaysLength(data.length);
      } else {
        throw new Error('Network request failed');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error during data fetching delaysRegOfficeData:', error.message);
    } finally {
      setDelaysLoading(false);
    }
  };

  useEffect(() => {
    fetchDataRegOfficeDelays();
  }, [officeCode]);

  return { delaysRegOfficeData, regOfficeDelaysLength, delaysLoading, token, error, fetchDataRegOfficeDelays };
};

export default useDelaysRegOffice;
