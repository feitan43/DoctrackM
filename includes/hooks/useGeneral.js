import { useQuery } from '@tanstack/react-query';
import apiClient from "../api/apiClient";


export const fetchOfficeMap = async () => {
  try {
    const response = await apiClient.get('/getOfficeName');
    return response.data;
  } catch (error) {
    console.error('Error fetching office map:', error);
    throw new Error('Failed to load office map.');
  }
};

export const useOfficeMap = () => {
  return useQuery({
    queryKey: ['officeMap'],
    queryFn: fetchOfficeMap,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    onError: error => {
      console.error('useOfficeMap query error:', error.message);
    },
  });
};