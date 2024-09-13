import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseUrl from '../../config';
import useUserInfo from './useUserInfo';

const useTransactionSummary = (selectedYear) => {
  const [dataPR, setDataPR] = useState(null);
  const [dataPO, setDataPO] = useState(null);
  const [dataPX, setDataPX] = useState(null);
  const [PRPercentage, setPRPercentage] = useState(0);
  const [POPercentage, setPOPercentage] = useState(0);
  const [PXPercentage, setPXPercentage] = useState(0);
  const [loadingTransSum, setLoadingTransSum] = useState(true);
  const [error, setError] = useState(null);
  const { officeCode } = useUserInfo();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  const fetchTransactionSummary = async (
    trackingType,
    setData,
    setPercentage,
    calculatePercentage
  ) => {
    try {
      const currentYear = selectedYear || new Date().getFullYear();
      if (!token || !officeCode) return;

      const response = await fetch(
        `${baseUrl}/transactionSummary?Year=${currentYear}&TrackingType=${trackingType}&OfficeCode=${officeCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

      if (calculatePercentage) {
        const percentage = calculatePercentage(result);
        setPercentage(percentage);
      }
    } catch (err) {
      setError(err);
    }
  };

  const calculatePRPercentage = (result) => {
    const totalCount = parseInt(result.TotalCount, 10);
    const forPOCount = parseInt(result.ForPOCount, 10);
    if (!isNaN(totalCount) && !isNaN(forPOCount) && totalCount > 0) {
      return (forPOCount / totalCount) * 100;
    }
    return 0;
  };

  const calculatePOPercentage = (result) => {
    const totalCount = parseInt(result.TotalCount, 10);
    const waitingForDeliveryCount = parseInt(result.WaitingForDeliveryCount, 10);
    if (!isNaN(totalCount) && !isNaN(waitingForDeliveryCount) && totalCount > 0) {
      return (waitingForDeliveryCount / totalCount) * 100;
    }
    return 0;
  };

  const calculatePXPercentage = (result) => {
    const totalCount = parseInt(result.TotalCount, 10);
    const checkReleasedCount = parseInt(result.CheckReleasedCount, 10);
    if (!isNaN(totalCount) && !isNaN(checkReleasedCount) && totalCount > 0) {
      return (checkReleasedCount / totalCount) * 100;
    }
    return 0;
  };

  useEffect(() => {
    const fetchAllTransactionSummaries = async () => {
      if (token && officeCode) {
        setLoadingTransSum(true); // Set loading to true before starting fetch

        try {
          await Promise.all([
            fetchTransactionSummary('PR', setDataPR, setPRPercentage, calculatePRPercentage),
            fetchTransactionSummary('PO', setDataPO, setPOPercentage, calculatePOPercentage),
            fetchTransactionSummary('PX', setDataPX, setPXPercentage, calculatePXPercentage),
          ]);
        } catch (err) {
          setError(err);
        } finally {
          setLoadingTransSum(false); // Set loading to false after all fetches are done
        }
      }
    };

    fetchAllTransactionSummaries();
  }, [token, officeCode, selectedYear]);

  return {
    dataPR,
    dataPO,
    dataPX,
    PRPercentage,
    POPercentage,
    PXPercentage,
    loadingTransSum,
    error,
    setDataPR,
    setPRPercentage,
    calculatePRPercentage,
    setDataPO,
    setPOPercentage,
    calculatePOPercentage,
    setDataPX,
    setPXPercentage,
    calculatePXPercentage,
    fetchTransactionSummary,
  };
};

export default useTransactionSummary;
