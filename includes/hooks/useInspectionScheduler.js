import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRequestInspection, fetchInspectionInspectors, assignInspector, fetchOnSchedule } from '../api/schedulerApi';

export const useRequestInspection = () => {
  return useQuery({
    queryKey: ['inspectionRequest'],
    queryFn: async () => {
      return await fetchRequestInspection();
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useInspectionInspectors = () => {
  return useQuery({
    queryKey: ['inspectionInspectors'],
    queryFn: fetchInspectionInspectors,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useAssignInspector = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({ id, inspectorEmp, inspectorName }) => {
        if (!id || !inspectorEmp || !inspectorName) {
          return Promise.reject(new Error('All fields are required'));
        }
        return await assignInspector({ id, inspectorEmp, inspectorName });
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['inspectionInspectors']);
      },
      onError: (error) => {
        console.error('Mutation error:', error.message);
      },
    });
  
    return mutation;
};
  
export const useOnSchedule = () => {
    return useQuery({
      queryKey: ['onSchedule'],
      queryFn: fetchOnSchedule, 
      staleTime: 5 * 60 * 1000,
      retry: 2,
    });
};