import apiClient from './apiClient';

export const fetchInspection = async (employeeNumber) => {
  if (!employeeNumber)
    throw new Error('Employee Number are required');
  const {data} = await apiClient.get(
    `/getInspection?EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

