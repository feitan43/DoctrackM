import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useMyAccountability = () => {
  const [accountabilityData, setAccountabilityData] = useState(null);
  const { employeeNumber } = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyAccountability = async () => {
    if (!employeeNumber) return;

    setLoading(true);
    setError(null);

    const TIMEOUT_DURATION = 10000; 

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
    );

    try {
      const response = await Promise.race([
        axios.get(`${BASE_URL}/myAccountability?EmployeeNumber=${employeeNumber}`),
        timeout,
      ]);
      setAccountabilityData(response.data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAccountability();
  }, [employeeNumber]);

  return { accountabilityData, loading, error, fetchMyAccountability };
};

export default useMyAccountability;
