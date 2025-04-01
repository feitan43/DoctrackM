import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BASE_URL from '../../config';
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';


const useReceiving = (selectedYear) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receivingData, setReceivingData] = useState(null);
  const [revertedData, setRevertedData] = useState(null);
  const [receivingCountData, setReceivingCountData] = useState(null);
  const [controller, setController] = useState(null);
  const queryClient = useQueryClient();
  const { employeeNumber } = useUserInfo();


  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Authorization token is missing');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };


  // RECEIVE MUTATION
  const autoReceiveMutation = useMutation({
    mutationFn: async ({ year, trackingNumber, trackingType, documentType, status, accountType, privilege, officeCode, inputParams }) => {
      if (!year || !trackingNumber) throw new Error('Year and TrackingNumber are required');
      const headers = await getAuthHeaders();

      const apiUrl = `/receiverReceived?Year=${year}&TrackingNumber=${trackingNumber}&TrackingType=${trackingType}&DocumentType=${documentType}&Status=${status}&AccountType=${accountType}&Privilege=${privilege}&OfficeCode=${officeCode}&EmployeeNumber=${employeeNumber}&inputParams=${inputParams}`;
      const { data } = await apiClient.get(apiUrl, {}, { headers });
      return data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries(['receivingCount'], employeeNumber);
      queryClient.invalidateQueries(['receivedMonthly'], employeeNumber);
      setReceivingData(data);
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong');
    }
  });


  // REVERT RECEIVED MUTATION
  const revertReceivedMutation = useMutation({
    mutationFn: async ({ year, trackingNumber, trackingType, documentType, status, accountType, officeCode }) => {
      if (!year || !trackingNumber) throw new Error('Year and TrackingNumber are required');
      const headers = await getAuthHeaders();
      const apiUrl = `/receiverReverted?Year=${year}&TrackingNumber=${trackingNumber}&TrackingType=${trackingType}&DocumentType=${documentType}&Status=${status}&AccountType=${accountType}&OfficeCode=${officeCode}&EmployeeNumber=${employeeNumber}`;
      const { data } = await apiClient.get(apiUrl, {}, {
        headers,
      });
      return data;
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
        console.error('Error Headers:', error.response?.headers);
      } else {
        console.error('Unexpected Error:', error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['receivingCount'], employeeNumber);
      setRevertedData(data);
    }
  });


  const receivingCount = useQuery({
    queryKey: ['receivingCount', employeeNumber, selectedYear],
    queryFn: async () => {
      if (!employeeNumber || !selectedYear) return null;

      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) throw new Error('Authorization token is missing');

      const apiUrl = `/receivingCount?EmployeeNumber=${employeeNumber}&Year=${selectedYear}`;
      const response = await apiClient.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    },
    enabled: !!employeeNumber && !!selectedYear,
  });


  const receivedMonthly = useQuery({
    queryKey: ['receivedMonthly', employeeNumber, selectedYear],
    queryFn: async () => {
      if (!employeeNumber || !selectedYear) return null;
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) throw new Error('Authorization token is missing');

      const apiUrl = `/receivedMonthly?EmployeeNumber=${employeeNumber}&Year=${selectedYear}`;
      console.log('API: ', apiUrl); 
      const response = await apiClient.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    },
    enabled: !!employeeNumber && !!selectedYear,
  });





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
    autoReceive: autoReceiveMutation.mutateAsync,
    revertedData,
    revertReceived: revertReceivedMutation.mutateAsync,
    receivingCount: receivingCount.refetch,
    receivingCountData: receivingCount.data,
    receivedMonthly: receivedMonthly.data

  };
};

export default useReceiving;



