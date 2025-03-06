import useUserInfo from '../api/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluatorAnnualSummary } from '../api/evaluatorSummary';

export const useEvaluatorAnnualSummary = (selectedYear) => {
    const { employeeNumber } = useUserInfo();
    
    const shouldFetch = Boolean(selectedYear && employeeNumber);

    return useQuery({
      queryKey: ['evaluatorAnnualSummary', selectedYear, employeeNumber], 
      queryFn: () => fetchEvaluatorAnnualSummary(selectedYear, employeeNumber),
      enabled: shouldFetch, 
      staleTime: 5 * 60 * 1000,
      retry: 2, 
    });
};
