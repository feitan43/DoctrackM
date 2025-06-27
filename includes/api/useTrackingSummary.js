import axios from 'axios';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useTrackingSummary = (selectedYear) => {
  const { officeCode, token } = useUserInfo();

  const queryKey = ['trackingSummary', selectedYear, officeCode]; 

  const fetchTrackingSummary = async () => {
    if (!selectedYear || !officeCode || !token) {
      return null; 
    }

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
    return response.data;
  };

  const {
    data: trackSumData,
    isLoading: trackSumLoading,
    isError: trackSumIsError,
    error: trackSumError,
    refetch: refetchTrackSum,
  } = useQuery({
    queryKey: queryKey,
    queryFn: fetchTrackingSummary,
    enabled: !!(selectedYear && officeCode && token), 
    staleTime: 1000 * 60 * 5, 
    cacheTime: 1000 * 60 * 10, 
    retry: 1, 
    onError: (err) => {
      console.error("Error fetching tracking summary:", err);
    },
    select: (data) => data.map(item => ({ ...item, someTransformedField: item.originalField + ' transformed' }))
  });

  return {
    trackSumData,
    trackSumLoading,
    trackSumError: trackSumIsError ? (trackSumError?.response?.data?.message || trackSumError?.message || 'An unknown error occurred.') : null,
    refetchTrackSum,
  };
};

export default useTrackingSummary;