import useUserInfo from '../api/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluatorMonthlySummary } from '../api/evaluatorSummary';

export const useEvaluatorMonthlySummary = (selectedYear) => {
    const { employeeNumber } = useUserInfo();
    
    const shouldFetch = Boolean(selectedYear && employeeNumber);

    return useQuery({
      queryKey: ['evaluatorMonthlySummary', selectedYear, employeeNumber], 
      queryFn: () => fetchEvaluatorMonthlySummary(selectedYear, employeeNumber),
      enabled: shouldFetch, 
      staleTime: 5 * 60 * 1000,
      retry: 2, 
    });
};
