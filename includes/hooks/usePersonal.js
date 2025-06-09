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
      console.error('Error updating useUpdateUserAccess:', error.message);
    },
  });

  return mutation;
};
// ---end

export const fetchInventory = async officeCode => {
  if (!officeCode) throw new Error('Office Code are required');
  const {data} = await apiClient.get(`/getInventory?OfficeCode=${officeCode}`);
  return data;
};

export const useInventory = () => {
  const {officeCode} = useUserInfo();

  return useQuery({
    queryKey: ['getInventory', officeCode],
    queryFn: () => fetchInventory(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};


//SUPERACCESS
export const fetchUsersSuperAccess = async key => {
  if (!key) throw new Error('key are required');
  const {data} = await apiClient.get(`/getUserSuperAccess?Key=${key}`);
  return data;
};

export const useUserSuperAccess = ({onSuccess} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fetchUsersSuperAccess,
    onSuccess: data => {
      if (onSuccess) onSuccess(data);
      queryClient.invalidateQueries(['systemsList']);
    },
  });
};

export const updateUserSuperAccess = async (employeeNumber, system, access) => {
  if (
    employeeNumber === undefined ||
    employeeNumber === null ||
    system === undefined ||
    system === null ||
    access === undefined ||
    access === null
  ) {
    throw new Error('employeeNumber, system, and access are required.');
  }

  try {
    const {data} = await apiClient.get(
      `/updateUserSuperAccess?EmployeeNumber=${encodeURIComponent(
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
      if (
        employeeNumber === undefined ||
        employeeNumber === null ||
        system === undefined ||
        system === null ||
        access === undefined ||
        access === null
      ) {
        throw new Error('employeeNumber, system, and access are required');
      }
      return await updateUserSuperAccess(employeeNumber, system, access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getUserSuperAccess']);
    },
    onError: error => {
      console.error('Error updating useUpdateUserSuperAccess:', error.message);
    },
  });

  return mutation;
};

export const fetchSystemsList = async () => {
  try {
    const response = await apiClient.get(`/getSystemList`);
    return response.data;
  } catch (error) {
    console.error('Error fetching systems list:', error);
    throw new Error('Failed to load systems list.');
  }
};

export const useSystemsList = () => {
  return useQuery({
    queryKey: ['systemsList'], // Unique key for this query
    queryFn: fetchSystemsList, // Function to fetch the data
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
    retry: 2, // Retry failed requests 2 times
    onError: error => {
      console.error('useSystemsList query error:', error.message);
    },
  });
};



// --end
