import {useQuery} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchSuppliers = async (name) => {
  const {data} = await apiClient.get(`/getSuppliers?Name=${name}`);
  return data;
};

export const useSuppliers = (name) => {
  return useQuery({
    queryKey: ['getSuppliers', name],
    queryFn: () => fetchSuppliers(name),
    enabled: Boolean(name),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchSuppliersGroup = async (name) => {
  const {data} = await apiClient.get(`/getSuppliersGroup`);
  return data;
};

export const useSuppliersGroup = () => {
  return useQuery({
    queryKey: ['getSuppliersGroup', ],
    queryFn: () => fetchSuppliersGroup(),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

const fetchSupplierDetails = async (id) => {
  const {data} = await apiClient.get(`/getSupplierDetails?id=${id}`);
  return data;
};

export const useSupplierDetails = (id) => {
  return useQuery({
    queryKey: ['getSupplierDetails', id],
    queryFn: () => fetchSupplierDetails(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
};

export const fetchSupplierRanking = async (year) => {
  const {data} = await apiClient.get(`/getSupplierRanking?Year=${year}`);
  return data;
};

export const useSupplierRanking = (year) => {
  return useQuery({
    queryKey: ['getSupplierRanking', year],
    queryFn: () => fetchSupplierRanking(year),
    enabled: Boolean(year),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

