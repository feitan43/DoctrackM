import useUserInfo from '../api/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluateTracking } from '../api/trackingApi';

export const useEvaluateData = (selectedYear, searchText, shouldFetch) => {
    const { officeCode, accountType } = useUserInfo();
    return useQuery({
      queryKey: ['evaluateData', selectedYear, officeCode, accountType, searchText], 
      queryFn: () => fetchEvaluateTracking(selectedYear, officeCode, accountType, searchText),
      enabled: shouldFetch, 
      staleTime: 5 * 60 * 1000, 
      retry: 2, 
    });
  };
  