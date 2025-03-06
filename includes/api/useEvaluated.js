import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

const fetchEvaluated = async (selectedYear) => {
  if (!selectedYear) throw new Error('Year is required'); 
  try {
    const { data } = await apiClient.get(`/getEvaluated?Year=${selectedYear}`);
    return data;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch evaluation');
  }
};

export const useEvaluated = (selectedYear) => {
  return useQuery({
    queryKey: ['evaluated', selectedYear],
    queryFn: () => fetchEvaluated(selectedYear),
    enabled: Boolean(selectedYear), 
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 2,
    placeholderData: [],
    onError: (error) => console.error('Query error:', error.message),
  });
};
