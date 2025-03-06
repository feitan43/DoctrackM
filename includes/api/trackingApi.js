import apiClient from './apiClient';

export const fetchEvaluateTracking = async (selectedYear, officeCode, accountType, searchText) => {
    if (!selectedYear || !officeCode || !accountType || !searchText)
      throw new Error('Year, officeCode,accountType and searchText are required');
    const {data} = await apiClient.get(
      `/searchTrackingNumber?year=${selectedYear}&office=${officeCode}&accountType=${accountType}&key=${searchText}`,
    );
    return data;
  };