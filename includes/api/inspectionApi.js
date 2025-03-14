import apiClient from './apiClient';

export const fetchInspection = async (employeeNumber) => {
  if (!employeeNumber)
    throw new Error('Employee Number are required');
  const {data} = await apiClient.get(
    `/getInspection?EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

export const addSchedule = async (date, employeeNumber) => {
  console.log('date',date,'emp', employeeNumber);
  if (!date || !employeeNumber)
    throw new Error('Employee Number are required');
  const {data} = await apiClient.get(
    `/addSchedule?date=${date}&EmployeeNumber=${employeeNumber}`,
  );
  return data;
};





