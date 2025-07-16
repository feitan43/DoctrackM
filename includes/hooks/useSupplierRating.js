import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchSuppliers = async (year, officeCode) => {
  if (!officeCode || !year) throw new Error('Office Code are required');
  const {data} = await apiClient.get(`/getsrSuppliers?Year=${year}&OfficeCode=${officeCode}`);
  return data;
};

export const useSuppliers = (year) => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getsrSuppliers', year, officeCode],
    queryFn: () => fetchSuppliers(year, officeCode),
    enabled: Boolean(officeCode || year),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchSuppliersInfo = async (name) => {
  if (!name) throw new Error('Name are required');
  const {data} = await apiClient.get(`/ ?Name=${name}`);
  return data;
};

export const useSuppliersInfo = (name) => {
  return useQuery({
    queryKey: ['getsrSuppliersInfo', name],
    queryFn: () => fetchSuppliersInfo(name),
    enabled: Boolean(name),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchSupplierItems = async (year, tn) => {
  if (!year || !tn) throw new Error('Year and Tracking Number are required');
  const {data} = await apiClient.get(`/getsrSupplierItems?Year=${year}&TrackingNumber=${tn}`);
  return data;
};

export const useSupplierItems = (year, tn) => {
  return useQuery({
    queryKey: ['getsrSupplierItems', year, tn],
    queryFn: () => fetchSupplierItems(year, tn),
    enabled: Boolean(year || tn),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useSubmitReviews = () => {
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

