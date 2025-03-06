import useUserInfo from '../api/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluatorSummary } from '../api/evaluatorSummary';

export const useEvaluatorSummary = (selectedYear) => {
    const { employeeNumber } = useUserInfo();
    
    const shouldFetch = Boolean(selectedYear && employeeNumber);

    return useQuery({
      queryKey: ['evaluatorSummary', selectedYear, employeeNumber], 
      queryFn: () => fetchEvaluatorSummary(selectedYear, employeeNumber),
      enabled: shouldFetch, 
      staleTime: 5 * 60 * 1000,
      retry: 2, 
    });
};
