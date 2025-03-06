import { useQuery } from '@tanstack/react-query';
import { fetchEvaluationByStatus } from '../api/evaluationApi.js';
import useUserInfo from '../api/useUserInfo.js';

export const useEvaluationByStatus = (selectedYear, status) => {
  const { employeeNumber } = useUserInfo();
  
  return useQuery({
    queryKey: ['evaluation', selectedYear, status, employeeNumber], 
    queryFn: () => fetchEvaluationByStatus(selectedYear, status, employeeNumber),
    enabled: Boolean(selectedYear && status && employeeNumber), 
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};
