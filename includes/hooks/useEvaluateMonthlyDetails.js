import useUserInfo from '../api/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluatorMonthlyDetails } from '../api/evaluatorSummary';

export const useEvaluatorMonthlyDetails = (selectedYear, status, month) => {
    const { employeeNumber } = useUserInfo();
    
    const shouldFetch = Boolean(selectedYear && employeeNumber && status && month);

    return useQuery({
      queryKey: ['evaluatorMonthlyDetails', selectedYear, employeeNumber, status, month], 
      queryFn: () => fetchEvaluatorMonthlyDetails(selectedYear, employeeNumber, status, month),
      enabled: shouldFetch, 
      staleTime: 5 * 60 * 1000,
      retry: 2, 
    });
};
