import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useRecentActivity = () => {
  const [recentActivityData, setRecentActivityData] = useState(null);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);
  const [recentActivityError, setRecentActivityError] = useState(null);
  const { employeeNumber } = useUserInfo();

  const fetchRecentActivity = async () => {
    if (!employeeNumber) return;

    setRecentActivityLoading(true);
    setRecentActivityError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) throw new Error('No authentication token found');
      
      const apiUrl = `${BASE_URL}/getRecentActivity`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        params: { employeeNumber },
      });
      
      setRecentActivityData(response.data);
    } catch (err) {
      setRecentActivityError(`Error fetching recent activity: ${err.message}`);
      setRecentActivityData(null);
    } finally {
      setRecentActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [employeeNumber]);

  return { recentActivityData, recentActivityLoading, recentActivityError, fetchRecentActivity };
};

export default useRecentActivity;