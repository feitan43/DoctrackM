import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useTrackingSummary = (selectedYear) => {
  const [trackSumData, setTrackSumData] = useState([]);
  const [trackSumLoading, setTrackSumLoading] = useState(false);
  const [trackSumError, setTrackSumError] = useState(null);

  const { officeCode, token } = useUserInfo();
  const fetchTrackingSummary = useCallback(async () => {
    if (!selectedYear || !officeCode || !token) {
      return;
    }

    try {
      setTrackSumLoading(true);
      setTrackSumError(null);

      const response = await axios.get(`${BASE_URL}/trackingSummary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          OfficeCode: officeCode,
          Year: selectedYear,
        },
      });


      setTrackSumData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      setTrackSumError(errorMessage);
      setTrackSumData(null);
    } finally {
      setTrackSumLoading(false);
    }
  }, [selectedYear, officeCode, token]);

  useEffect(() => {
    if (officeCode && selectedYear && token) {
      fetchTrackingSummary();
    }
  }, [officeCode, selectedYear, token, fetchTrackingSummary]);

  return {
    trackSumData,
    trackSumLoading,
    trackSumError,
    refetchTrackSum: fetchTrackingSummary,
  };
};

export default useTrackingSummary;