import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';

const useReceiving = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receivingData, setReceivingData] = useState(null);
  const [revertedData, setRevertedData] = useState(null);
  const [receivingCountData, setReceivingCountData] = useState(null);
  const [controller, setController] = useState(null);
  const {employeeNumber} = useUserInfo();


  const autoReceive = useCallback(async (year, trackingNumber, trackingType, documentType, status, accountType, privilege, officeCode, employeeNumber,inputParams) => {
    if (!year || !trackingNumber) {
      setError('Year and TrackingNumber are required');
      return;
    }
    
    if (controller) {
      controller.abort();
    }

    const newController = new AbortController();
    setController(newController);

    setIsLoading(true);
    setError(null);
    setReceivingData(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setError('Authorization token is missing');
        setIsLoading(false);
        return null; // Return null if token is missing
      }

      const apiUrl = `${BASE_URL}/receiverReceived?Year=${year}&TrackingNumber=${trackingNumber}&TrackingType=${trackingType}&DocumentType=${documentType}&Status=${status}&AccountType=${accountType}&Privilege=${privilege}&OfficeCode=${officeCode}&EmployeeNumber=${employeeNumber}&inputParams=${inputParams}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        signal: newController.signal, 
      });
      setReceivingData(response.data);
      return response.data;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else if (err.response) {
        if (err.response.status === 404) {
          setError('QR data not found');
        } else {
          setError(err.response?.data?.message || 'Server error');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  });

  const revertReceived = useCallback(async (year, trackingNumber, trackingType, documentType, status, accountType, privilege, officeCode, employeeNumber) => {

    console.log(year, trackingNumber, trackingType, documentType, status, accountType, privilege, officeCode, employeeNumber);
    if (!year || !trackingNumber) {
      setError('Year and TrackingNumber are required');
      return;
    }
    
    if (controller) {
      controller.abort();
    }

    const newController = new AbortController();
    setController(newController);

    setIsLoading(true);
    setError(null);
    setRevertedData(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setError('Authorization token is missing');
        setIsLoading(false);
        return;
      }

      const apiUrl = `${BASE_URL}/receiverReverted?Year=${year}&TrackingNumber=${trackingNumber}&TrackingType=${trackingType}&DocumentType=${documentType}&Status=${status}&AccountType=${accountType}&Privilege=${privilege}&OfficeCode=${officeCode}&EmployeeNumber=${employeeNumber}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        signal: newController.signal, 
      });
      setRevertedData(response.data);
      return response.data;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else if (err.response) {
        if (err.response.status === 404) {
          setError('QR data not found');
        } else {
          setError(err.response?.data?.message || 'Server error');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  });

  const receivingCount = async () => {
    if (!employeeNumber) {
      setError('Employee Number is required');
      return;
    }

    if (controller) {
      controller.abort();
    }

    const newController = new AbortController();
    setController(newController);

    setIsLoading(true);
    setError(null);
    setReceivingCountData(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setError('Authorization token is missing');
        setIsLoading(false);
        return;
      }

      const apiUrl = `${BASE_URL}/receivingCount?EmployeeNumber=${employeeNumber}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        signal: newController.signal,
      });

      setReceivingCountData(response.data);
      return response.data;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else if (err.response) {
        if (err.response.status === 404) {
          setError('QR data not found');
        } else {
          setError(err.response?.data?.message || 'Server error');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    receivingCount();
  }, [employeeNumber]);

  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);


  return {
    isLoading,
    error,
    receivingData,
    autoReceive,
    revertedData,
    revertReceived,
    receivingCount,
    receivingCountData,
  };
};

export default useReceiving;
