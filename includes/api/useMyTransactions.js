import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseUrl from '../../config';
import useUserInfo from './useUserInfo';

const useMyTransactions = (selectedYear) => {
  const [myTransactionsData, setMyTransactionsData] = useState(null);
  const [myTransactionsLength, setMyTransactionsLength] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const { employeeNumber } = useUserInfo();
  const [loading, setLoading] = useState(false);

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    } catch (err) {
      console.error('Error fetching token:', err.message);
    }
  };

  const fetchMyPersonal = async () => {
    try {
      setLoading(true);

      if (!employeeNumber || !token) return;

      const currentYear = selectedYear || new Date().getFullYear();
      const response = await fetch(
        `${baseUrl}/myTransactions?Year=${currentYear}&EmployeeNumber=${employeeNumber}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyTransactionsData(data);
        setMyTransactionsLength(data.length);
      } else {
        throw new Error('Failed to fetch My Transactions data');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error during data fetching My Transactions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (token && employeeNumber) {
      fetchMyPersonal();
    }
  }, [token, employeeNumber, selectedYear]);

  return { myTransactionsData, myTransactionsLength, loading, token, error, fetchMyPersonal };
};

export default useMyTransactions;
