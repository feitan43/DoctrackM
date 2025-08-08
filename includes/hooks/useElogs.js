import {useQuery} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchElogsLetters = async officeCode => {
  console.log("refetch")
  const {data} = await apiClient.get(`/getElogsLetters?Office=${officeCode}`);
  return data;
};

export const useElogsLetters = () => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getElogsLetters', officeCode],
    queryFn: () => fetchElogsLetters(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchElogsLetterTypes = async officeCode => {
  const {data} = await apiClient.get(`/getElogsLetterTypes?Office=${officeCode}`);
  return data;
};

export const useElogsLetterTypes = () => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getElogsLetterTypes', officeCode],
    queryFn: () => fetchElogsLetterTypes(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchElogsStatuses = async officeCode => {
  const {data} = await apiClient.get(`/getElogsStatuses?Office=${officeCode}`);
  return data;
};

export const useElogsStatuses = () => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getElogsStatuses', officeCode],
    queryFn: () => fetchElogsStatuses(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};