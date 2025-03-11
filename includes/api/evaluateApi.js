import apiClient from './apiClient';

export const evaluatorEvaluate = async ({ Year, TrackingNumber, EmployeeNumber, Status }) => {

  const {data} = await apiClient.get(
    `/evaluatorEvaluate?Year=${Year}&TrackingNumber=${TrackingNumber}&EmployeeNumber=${EmployeeNumber}&Status=${Status}`,
  );
  return data;
};

export const evaluatorRevert = async ({ Year, TrackingNumber, EmployeeNumber, Status }) => {

  const {data} = await apiClient.get(
    `/evaluatorRevert?Year=${Year}&TrackingNumber=${TrackingNumber}&EmployeeNumber=${EmployeeNumber}&Status=${Status}`,
  );
  return data;
};
