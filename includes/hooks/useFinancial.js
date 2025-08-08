import {useQuery} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchPPMP = async (officeCode) => {
  const {data} = await apiClient.get(`/getfmsPPMP?Office=${officeCode}`);
  return data;
};

export const usePPMP = (officeCode) => {
  return useQuery({
    queryKey: ['fmsPPMP', officeCode],
    queryFn: () => fetchPPMP(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchPPMPDetails = async (officeCode, fund, programCode, accountCode) => {
  const {data} = await apiClient.get(`/getfmsPPMPDetails?Office=${officeCode}&Fund=${fund}&ProgramCode=${programCode}&AccountCode=${accountCode}`);
  return data;
};

export const usePPMPDetails = (fund, programCode, accountCode) => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['fmsPPMP', officeCode,fund, programCode, accountCode],
    queryFn: () => fetchPPMPDetails(officeCode,fund, programCode, accountCode),
    enabled: Boolean(officeCode,fund, programCode, accountCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

