import apiClient from './apiClient';

export const fetchUsersAccess = async (officeCode) => {
  if (!officeCode)
    throw new Error('Office Code are required');
  const {data} = await apiClient.get(
    `/getUserAccess?OfficeCode=${officeCode}`,
  );
  return data;
};

export const updateUserAccess = async (employeeNumber, system, access) => {

    console.log("api",employeeNumber, system, access)
    if (!employeeNumber || !system || !access) {
      throw new Error('employeeNumber, system, and access are required.');
    }
  
    try {
      const { data } = await apiClient.get(
        `/updateUserAccess?EmployeeNumber=${encodeURIComponent(employeeNumber)}&System=${encodeURIComponent(system)}&Access=${encodeURIComponent(access)}`
      );
  
        console.log("da",data)
      if (data.success) {
        return data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error || 'An unexpected error occurred';
        console.error('Error fetching updateUserAccess:', errorMessage);
        throw new Error(errorMessage);
      } else {
        console.error('Error fetching updateUserAccess:', error.message);
        throw new Error(error.message || 'Failed to update user access.');
      }
    }
  };
  