import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config';

const useProjectCleansing = () => {
  const [projectCleansingData, setprojectCleansingData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [cleansingLoading, setCleansingLoading] = useState(true);

  const fetchProjectCleansing = async () => {
    try {
      setCleansingLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      const response = await fetch(
        `${BASE_URL}/projectCleansing`,
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
        setprojectCleansingData(data);
      } else {
        throw new Error('Network request failed');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error during data fetching projectCleansing:', error.message);
    } finally {
      setCleansingLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectCleansing();
  }, []);

  return { projectCleansingData, cleansingLoading, fetchProjectCleansing };
};

export default useProjectCleansing;
