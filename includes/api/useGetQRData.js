import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { useState } from 'react';

async function fetchQRDataFn({ year, trackingNumber }) {
  if (!year || !trackingNumber) return null;

  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Authorization token is missing');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = `/getQRData?Year=${year}&TrackingNumber=${trackingNumber}`;
  const response = await apiClient.get(apiUrl, { headers });

  return response.data;
}

export function useGetQRData() {
  const [qrData, setQRData] = useState(null);
  const queryClient = useQueryClient();

  const fetchQRData = async (year, trackingNumber) => {
    return await queryClient.fetchQuery({
      queryKey: ['qrData', year, trackingNumber],
      queryFn: () => fetchQRDataFn({ year, trackingNumber }),
    });
  };

  return { fetchQRData, qrData, setQRData };
}

export default useGetQRData;
