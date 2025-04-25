import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchUsersAccess, updateUserAccess} from '../api/personalApi.js';
import useUserInfo from '../api/useUserInfo.js';

export const useUserAccess = () => {
  const {officeCode} = useUserInfo();

  return useQuery({
    queryKey: ['getUserAccess', officeCode],
    queryFn: () => fetchUsersAccess(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useUpdateUserAccess = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({employeeNumber, system, access}) => {
      if (!employeeNumber || !system || !access) {
        throw new Error('employeeNumber and system are required');
      }
      return await updateUserAccess(employeeNumber, system, access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getUserAccess']);
    },
    onError: error => {
      console.error('Error updating inspection:', error.message);
    },
  });

  return mutation;
};
