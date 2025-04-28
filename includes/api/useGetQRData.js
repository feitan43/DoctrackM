import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useGetQRData = () => {
  const [qrData, setQRData] = useState(null);
  const [qrLoading, setQRLoading] = useState(false);
  const [qrError, setQRError] = useState(null);
  const queryClient = useQueryClient();

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Authorization token is missing');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchQRData = async (year, trackingNumber) => {
    if (!year || !trackingNumber) return null;

    try {
      setQRLoading(true);
      setQRError(null);
      const headers = await getAuthHeaders();
      const apiUrl = `/getQRData?Year=${year}&TrackingNumber=${trackingNumber}`;
      const response = await apiClient.get(apiUrl, { headers });
      setQRData(response.data);
      queryClient.setQueryData(['qrData', year, trackingNumber], response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching QR data:', error);
      setQRError(error);
      setQRData(null);
    } finally {
      setQRLoading(false);
    }
  };


  return {
    qrData,
    setQRData,
    qrLoading,
    qrError,
    fetchQRData,
  };
};

export default useGetQRData;
