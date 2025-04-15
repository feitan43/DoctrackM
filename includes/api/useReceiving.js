import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BASE_URL from '../../config';
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';


const useReceiving = (selectedYear) => {
  const [error, setError] = useState(null);
  const [receivingData, setReceivingData] = useState(null);
  const [revertedData, setRevertedData] = useState(null);
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

  // === MUTATION: AUTO RECEIVE 
  const autoReceiveMutation = useMutation({
    mutationFn: async ({
      year,
      trackingNumber,
      trackingType,
      documentType,
      status,
      accountType,
      privilege,
      officeCode,
      inputParams
    }) => {
      if (!year || !trackingNumber) throw new Error('Year and TrackingNumber are required');
      const headers = await getAuthHeaders();

      const apiUrl = `/receiverReceived?Year=${year}&TrackingNumber=${trackingNumber}&TrackingType=${trackingType}&DocumentType=${documentType}&Status=${status}&AccountType=${accountType}&Privilege=${privilege}&OfficeCode=${officeCode}&EmployeeNumber=${employeeNumber}&inputParams=${inputParams}`;
      const { data } = await apiClient.get(apiUrl, {}, { headers });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['receivingCount', employeeNumber]);
      setReceivingData(data);
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong');
    }
  });

  // === MUTATION: REVERT RECEIVED
  const revertReceivedMutation = useMutation({
    mutationFn: async ({
      year,
      trackingNumber,
      trackingType,
      documentType,
      status,
      accountType,
      officeCode
    }) => {
      if (!year || !trackingNumber) throw new Error('Year and TrackingNumber are required');
      const headers = await getAuthHeaders();

      const apiUrl = `/receiverReverted?Year=${year}&TrackingNumber=${trackingNumber}&TrackingType=${trackingType}&DocumentType=${documentType}&Status=${status}&AccountType=${accountType}&OfficeCode=${officeCode}&EmployeeNumber=${employeeNumber}`;
      const { data } = await apiClient.get(apiUrl, {}, { headers });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['receivingCount', employeeNumber]);
      setRevertedData(data);
    },
    onError: (error) => {
      console.error('Revert Error:', axios.isAxiosError(error) ? error.response?.status : error);
    }
  });

  // RECEIVING COUNT 
  const receivingCount = useQuery({
    queryKey: ['receivingCount', employeeNumber, selectedYear],
    queryFn: async () => {
      if (!employeeNumber || !selectedYear) return null;
      const headers = await getAuthHeaders();
      const apiUrl = `/receivingCount?EmployeeNumber=${employeeNumber}&Year=${selectedYear}`;
      const response = await apiClient.get(apiUrl, { headers });
      return response.data;
    },
    enabled: !!employeeNumber && !!selectedYear,
  });

  //RECEIVED MONTHLY 
  const receivedMonthly = useQuery({
    queryKey: ['receivedMonthly', employeeNumber, selectedYear],
    queryFn: async () => {
      if (!employeeNumber || !selectedYear) return null;
      const headers = await getAuthHeaders();
      const apiUrl = `/receivedMonthly?EmployeeNumber=${employeeNumber}&Year=${selectedYear}`;
      const response = await apiClient.get(apiUrl, { headers });
      return response.data;
    },
    enabled: !!employeeNumber && !!selectedYear,
  });


  return {
    isLoading: receivingCount.isLoading,
    isFetching: receivingCount.isFetching,
    error,
    receivingData,
    autoReceive: autoReceiveMutation.mutateAsync,
    revertedData,
    revertReceived: revertReceivedMutation.mutateAsync,
    refetchReceivingCount: receivingCount.refetch,
    receivingCountData: receivingCount.data,
    receivedMonthlyData: receivedMonthly.data,
  };
};

export default useReceiving;



