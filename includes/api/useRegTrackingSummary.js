import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useRegTrackingSummary = (selectedYear) => {
  const [regTrackSumData, setRegTrackSumData] = useState([]);
  const [regTrackSumLoading, setRegTrackSumLoading] = useState(false);
  const [regTrackSumError, setRegTrackSumError] = useState(null);

  const { officeCode, token } = useUserInfo();

  const fetchRegTrackingSummary = useCallback(async () => {
    if (!selectedYear || !officeCode || !token) {
      return;
    }

    try {
      setRegTrackSumLoading(true);
      setRegTrackSumError(null);

      const response = await axios.get(`${BASE_URL}/regTrackingSummary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          OfficeCode: officeCode,
          Year: selectedYear,
        },
      });

      setRegTrackSumData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      setRegTrackSumError(errorMessage);
      setRegTrackSumData(null);
    } finally {
        setRegTrackSumLoading(false);
    }
  }, [selectedYear, officeCode, token]);

  useEffect(() => {
    if (officeCode && selectedYear && token) {
        fetchRegTrackingSummary();
    }
  }, [officeCode, selectedYear, token, fetchRegTrackingSummary]);

  return {
    regTrackSumData,
    regTrackSumLoading,
    regTrackSumError,
    refetchRegTrackSum: fetchRegTrackingSummary,
  };
};

export default useRegTrackingSummary;