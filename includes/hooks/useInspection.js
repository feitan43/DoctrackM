import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInspection,addSchedule } from '../api/inspectionApi.js';
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

export const useAddSchedule = () => {
  const queryClient = useQueryClient();
  const { employeeNumber } = useUserInfo(); 

  const mutation = useMutation({
    mutationFn: (date) => {
      if (!employeeNumber) throw new Error('Employee Number is required');
      return addSchedule(date, employeeNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection']);
    },
  });

  return mutation; // This includes isLoading, isError, isSuccess
};
