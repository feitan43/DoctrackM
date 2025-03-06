import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const useSearchReceiver = () => {
  const [searchTNData, setSearchTNData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { officeCode, accountType } = useUserInfo();

  const fetchDataSearchReceiver = async (searchQuery, selectedYear) => {
    if (!searchQuery || !selectedYear || !officeCode || !accountType) return;


    setLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');

      const url = `${BASE_URL}/searchTrackingNumber?year=${selectedYear}&office=${officeCode}&accountType=${accountType}&key=${searchQuery}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchTNData(data);
        return data;  // Return data when successful
      } else {
        setSearchTNData(null);
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

/*   useEffect(() => {
    if (searchTNData) {
      //console.log("Fetched data:", searchTNData);
    }
  }, [searchTNData]); // Dependency array: when searchTNData changes, log the data */

  return { searchTNData, setSearchTNData, fetchDataSearchReceiver, loading, error };
};

export default useSearchReceiver;
