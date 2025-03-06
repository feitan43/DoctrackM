import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const useOfficeDelays = () => {
  const [officeDelaysData, setOfficeDelaysData] = useState(null);
  const [officeDelaysLength, setOfficeDelaysLength] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const {officeCode} = useUserInfo();

  const [delaysLoading, setDelaysLoading] = useState(false);

  const fetchOfficeDelays = async () => {
    try {
      if (!officeCode) {
        return;
      }
      setDelaysLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      const response = await fetch(
        `${BASE_URL}/officeDelays?OfficeCode=${officeCode}`,
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
        setOfficeDelaysData(data);
        setOfficeDelaysLength(data.length);
      } else {
        throw new Error('Failed to fetch data OfficeDelays');
      }
    } catch (error) {
      setError(error.message);
      console.error(
        'Error during data fetching in Office Delays:',
        error.message,
      );
    } finally {
      setDelaysLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeDelays();
  }, [officeCode]);

  return {
    officeDelaysData,
    officeDelaysLength,
    officeCode,
    delaysLoading,
    token,
    error,
    fetchOfficeDelays
  };
};

export default useOfficeDelays;
