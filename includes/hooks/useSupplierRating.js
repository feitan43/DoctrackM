import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';


export const fetchSuppliers = async officeCode => {
  if (!officeCode) throw new Error('Office Code are required');
  const {data} = await apiClient.get(`/getUserAccess?OfficeCode=${officeCode}`);
  return data;
};