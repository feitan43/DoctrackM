import apiClient from './apiClient';

export const fetchEvaluationByStatus = async (year, status, employeeNumber) => {
  if (!year || !status || !employeeNumber)
    throw new Error('Year, Status, and Employee Number are required');
  const {data} = await apiClient.get(
    `/getEvaluation?Year=${year}&Status=${status}&EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

