import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const useSearchTrack = (initialSearchText, selectedYear, search, searchQuery) => {
  const [searchTrackData, setSearchTrackData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const {officeCode, accountType} = useUserInfo();
  const [searchTrackLoading, setSearchTrackLoading] = useState(false);

  const [searchPayrollData, setSearchPayrollData] = useState(null);
  const [searchPayrollLoading, setSearchPayrollLoading] = useState(false);

  const fetchDataSearchTrack = async (textToSearch) => {
    setSearchTrackLoading(true);
    setError(null);
    let data;
    console.log("text",textToSearch)
    try {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (!officeCode || !accountType || !textToSearch) { // Use textToSearch here
        setSearchTrackLoading(false);
        return null;
      }

      const response = await fetch(
        `${BASE_URL}/searchTrackingNumber?year=${selectedYear}&office=${officeCode}&accountType=${accountType}&key=${textToSearch}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        data = await response.json();
        setSearchTrackData(data);
      } else {
        setSearchTrackData(null);
        throw new Error('Network request failed');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error during data fetching:', error.message);
    } finally {
      setSearchTrackLoading(false);
    }

    return data;
  };

  const fetchDataSearchPayroll = async searchQuery => {
    setSearchPayrollLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        throw new Error('No token found');
      }

      if (!officeCode || !accountType || !searchQuery || !selectedYear) {
        setSearchPayrollLoading(false);
        return null;
      }

      const response = await fetch(
        `${BASE_URL}/searchPayroll?year=${selectedYear}&office=${officeCode}&accountType=${accountType}&key=${searchQuery}`,
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
        setSearchPayrollData(data); 
        return data;
      } else {
        throw new Error('Network request failed');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error during data fetching:', error.message);
      return null; 
    } finally {
      setSearchPayrollLoading(false);
    }
  };

  return {
    searchTrackData,
    setSearchTrackData,
    searchTrackLoading,
    searchPayrollData,
    setSearchPayrollData,
    searchPayrollLoading,
    fetchDataSearchTrack,
    fetchDataSearchPayroll,
    error,
  };
};

export default useSearchTrack;