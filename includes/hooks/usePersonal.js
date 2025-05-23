import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

//ACCESS
export const fetchUsersAccess = async officeCode => {
  if (!officeCode) throw new Error('Office Code are required');
  const {data} = await apiClient.get(`/getUserAccess?OfficeCode=${officeCode}`);
  return data;
};

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

export const updateUserAccess = async (employeeNumber, system, access) => {
  if (!employeeNumber || !system || !access) {
    throw new Error('employeeNumber, system, and access are required.');
  }

  try {
    const {data} = await apiClient.get(
      `/updateUserAccess?EmployeeNumber=${encodeURIComponent(
        employeeNumber,
      )}&System=${encodeURIComponent(system)}&Access=${encodeURIComponent(
        access,
      )}`,
    );

    if (data.success) {
      return data;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.error || 'An unexpected error occurred';
      console.error('Error fetching updateUserAccess:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error fetching updateUserAccess:', error.message);
      throw new Error(error.message || 'Failed to update user access.');
    }
  }
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
// ---end

//SUPERACCESS
export const fetchUsersSuperAccess = async key => {
  if (!key) throw new Error('key are required');
  const {data} = await apiClient.get(
    `/getUserSuperAccess?Key=${key}`,
  );
  return data;
};

export const useUserSuperAccess = ({ onSuccess } = {}) => {
  return useMutation({
    mutationFn: fetchUsersSuperAccess,
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
  });
};

/* export const useUserSuperAccess = (key) => {
  return useQuery({
    queryKey: ['getUserAccess', key],
    queryFn: () => fetchUsersSuperAccess(key),
    enabled: Boolean(key),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}; */

export const updateUserSuperAccess = async (employeeNumber, system, access) => {
  if (!employeeNumber || !system || !access) {
    throw new Error('employeeNumber, system, and access are required.');
  }

  try {
    const {data} = await apiClient.get(
      `/updateUserAccess?EmployeeNumber=${encodeURIComponent(
        employeeNumber,
      )}&System=${encodeURIComponent(system)}&Access=${encodeURIComponent(
        access,
      )}`,
    );

    if (data.success) {
      return data;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.error || 'An unexpected error occurred';
      console.error('Error fetching updateUserAccess:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error fetching updateUserAccess:', error.message);
      throw new Error(error.message || 'Failed to update user access.');
    }
  }
};

export const useUpdateUserSuperAccess = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({employeeNumber, system, access}) => {
      if (!employeeNumber || !system || !access) {
        throw new Error('employeeNumber and system are required');
      }
      return await updateUserSuperAccess(employeeNumber, system, access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getUserSuperAccess']);
    },
    onError: error => {
      console.error('Error updating inspection:', error.message);
    },
  });

  return mutation;
};
// --end
