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
      console.log('Fetching:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${storedToken}` },
      });
  
      const data = await response.json();
      console.log('API Response:', data);
  
      if (response.ok) {
        setSearchTNData(data);
        return data; 
      } else {
        setSearchTNData(null);
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
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
