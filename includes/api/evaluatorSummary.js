import apiClient from './apiClient';

export const fetchEvaluatorSummary = async (year, employeeNumber) => {

  if (!year || !employeeNumber)
    throw new Error('Year and Employee Number are required');
  const {data} = await apiClient.get(
    `/getEvaluatorSummary?Year=${year}&EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

export const fetchEvaluatorAnnualSummary = async (year, employeeNumber) => {

  if (!year || !employeeNumber)
    throw new Error('Year and Employee Number are required');
  const {data} = await apiClient.get(
    `/getEvaluatorAnnualSummary?Year=${year}&EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

export const fetchEvaluatorMonthlySummary = async (year, employeeNumber) => {

  if (!year || !employeeNumber)
    throw new Error('Year and Employee Number are required');
  const {data} = await apiClient.get(
    `/getEvaluatorMonthlySummary?Year=${year}&EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

export const fetchEvaluatorMonthlyDetails = async (year, employeeNumber, status, month) => {

  if (!year || !employeeNumber || !status || !month)
    throw new Error('Year and Employee Number are required');
  const {data} = await apiClient.get(
    `/getEvaluatorMonthlyDetails?Year=${year}&EmployeeNumber=${employeeNumber}&Status=${status}&Month=${month}`,
  );
  return data;
};


