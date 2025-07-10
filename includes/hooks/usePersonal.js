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

export const updateUserInfo = async payload => {
  if (payload.employeeNumber === undefined || payload.employeeNumber === '') {
    throw new Error('All fields in the payload are required for update.');
  }

  try {
    const {data} = await apiClient.patch(`/updateUserInfo`, payload);

    if (data.success) {
      return data;
    } else {
      throw new Error(
        data.message || 'Unexpected response format or API error',
      );
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.error || 'An unexpected error occurred';
      console.error('Error updating user info:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error updating user info:', error.message);
      throw new Error(error.message || 'Failed to update user information.');
    }
  }
};

export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async payload => {
      if (
        payload.employeeNumber === undefined ||
        payload.employeeNumber === null
      ) {
        throw new Error('Employee number is required to update user info.');
      }
      return await updateUserInfo(payload);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'employeeDetails',
        variables.employeeNumber,
      ]);
      queryClient.invalidateQueries(['employeeList']);
    },
    onError: error => {
      console.error(
        'Error updating user info via useUpdateUserInfo hook:',
        error.message,
      );
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

export const fetchSystemsListAO = async () => {
  try {
    const response = await apiClient.get(`/getSystemListAO`);
    return response.data;
  } catch (error) {
    console.error('Error fetching systems list AO:', error);
    throw new Error('Failed to load systems list AO.');
  }
};

export const useSystemsListAO = () => {
  return useQuery({
    queryKey: ['systemsListAO'],
    queryFn: fetchSystemsListAO,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    onError: error => {
      console.error('useSystemsListAO query error:', error.message);
    },
  });
};

//
export const fetchAccountabilityData = async employeeNumber => {
  if (!employeeNumber) {
    throw new Error('Employee number is not available.');
  }
  try {
    const {data} = await apiClient.get(
      `/myAccountability?EmployeeNumber=${employeeNumber}`,
    );
    return data;
  } catch (error) {
    console.error('Error in fetchAccountabilityData:', error); 
    throw error; 
  }
};

export const useMyAccountability = () => {
  const {employeeNumber} = useUserInfo();

  return useQuery({
    queryKey: ['myAccountability', employeeNumber],
    queryFn: () => fetchAccountabilityData(employeeNumber),
    enabled: Boolean(employeeNumber), 
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: error => {
      console.error('useMyAccountability query error:', error.message);
    },
  });
};

// --end
