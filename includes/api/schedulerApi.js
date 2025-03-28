import apiClient from './apiClient';

export const fetchRequestInspection = async () => {
  const { data } = await apiClient.get('/requestForInspection');
  return data;
};

export const fetchInspectionInspectors = async () => {
  const { data } = await apiClient.get('/inspectionInspectors');
  return data;
};

export const assignInspector = async ({ id, inspectorEmp, inspectorName }) => {

  if (!id || !inspectorEmp || !inspectorName) {
    throw new Error('All fields are required');
  }

  try {
    const { data } = await apiClient.get('/assignInspector', {
      params: { id, inspectorEmp, inspectorName }, // ✅ Corrected
    });

    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign inspector');
  }
};

export const fetchOnSchedule = async () => {
  const { data } = await apiClient.get('/onSchedule');
  return data;
};

