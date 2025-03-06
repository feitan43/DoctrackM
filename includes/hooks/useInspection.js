import { useQuery } from '@tanstack/react-query';
import { fetchInspection } from '../api/inspectionApi.js';
import useUserInfo from '../api/useUserInfo.js';

export const useInspection = () => {
  const { employeeNumber } = useUserInfo();
  
  return useQuery({
    queryKey: ['inspection', employeeNumber], 
    queryFn: () => fetchInspection(employeeNumber),
    enabled: Boolean(employeeNumber), 
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};
