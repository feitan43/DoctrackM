import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const TIMEOUT_DURATION = 10000; 

const useMyTransactions = (selectedYear) => {
  const [myTransactionsData, setMyTransactionsData] = useState(null);
  const [myTransactionsLength, setMyTransactionsLength] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { employeeNumber, token} = useUserInfo();

  const fetchMyPersonal = useCallback(async () => {
    if (!employeeNumber || !token) return;

    try {
      setLoading(true);
      setError(null);

      const currentYear = selectedYear || new Date().getFullYear();

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
      );

      const response = await Promise.race([
        fetch(`${BASE_URL}/myTransactions?Year=${currentYear}&EmployeeNumber=${employeeNumber}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        timeout,
      ]);

      if (!response.ok) throw new Error('Something went wrong');

      const data = await response.json();
      setMyTransactionsData(data);
      setMyTransactionsLength(data.length || 0);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
      setMyTransactionsData(null);
      setMyTransactionsLength(0);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, employeeNumber, token]);

  // Trigger fetch when token & employeeNumber are available
  useEffect(() => {
    if (token && employeeNumber) {
      fetchMyPersonal();
    }
  }, [token, employeeNumber, selectedYear, fetchMyPersonal]);

  return { myTransactionsData, myTransactionsLength, loading, error, fetchMyPersonal };
};

export default useMyTransactions;
