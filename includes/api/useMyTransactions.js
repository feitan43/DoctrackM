import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const TIMEOUT_DURATION = 10000;

const useMyTransactions = (selectedYear) => {
  const { employeeNumber, token } = useUserInfo();
  const currentYear = selectedYear || new Date().getFullYear();

  const fetchMyTransactions = async () => {
    if (!employeeNumber || !token) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      const response = await fetch(
        `${BASE_URL}/myTransactions?Year=${currentYear}&EmployeeNumber=${employeeNumber}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) throw new Error('Something went wrong');
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  const {
    data: myTransactionsData,
    isLoading: loading,
    error,
    refetch: fetchMyPersonal, // This is the renamed refetch function
  } = useQuery({
    queryKey: ['myTransactions', employeeNumber, currentYear],
    queryFn: fetchMyTransactions, // Using the standalone function here
    enabled: !!employeeNumber && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      if (data) {
        // You might want to store data in AsyncStorage here if needed
      }
    },
    onError: (err) => {
      console.error('Error fetching transactions:', err);
    },
  });

  const myTransactionsLength = myTransactionsData?.length || 0;

  return { myTransactionsData, myTransactionsLength, loading, error, fetchMyPersonal };
};

export default useMyTransactions;