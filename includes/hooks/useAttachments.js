import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  uploadTNAttach,
  removeTNAttach,
  fetchAttachmentFiles,
} from '../api/uploadApi.js';
import { formTypeMap } from '../utils/formTypeMap.js';
import apiClient from '../api/apiClient.js';
import useUserInfo from '../api/useUserInfo.js';


export const useUploadTNAttach = (onSuccess, onError) => {
  return useMutation({
    mutationKey: ['uploadTNAttach'],
    mutationFn: uploadTNAttach,
    retry: 2,
    onSuccess: data => {
      if (data?.status === 'success') {
        if (onSuccess) onSuccess(data);
      } else {
        const customError = new Error(
          data?.message || 'Upload failed with unknown error.',
        );
        if (onError) onError(customError);
      }
    },
    onError: error => {
      console.error('Upload failed:', error.message);
      if (onError) onError(error);
    },
  });
};

export const useRemoveTNAttach = (onSuccess, onError) => {
  return useMutation({
    mutationKey: ['removeTNAttach'],
    mutationFn: removeTNAttach,
    retry: 2,
    onSuccess: data => {
      if (data?.status === 'success') {
        if (onSuccess) onSuccess(data);
      } else if (data?.status === 'error') {
        if (onError)
          onError({
            message: data.message || 'An error occurred during removal.',
          });
      } else {
        // Handle unexpected statuses
        console.warn('Unexpected status:', data?.status);
        if (onError) onError({message: 'Unexpected response from server.'});
      }
    },
    onError: error => {
      console.error('Remove failed:', error.message);
      if (onError) onError(error);
    },
  });
};

export const useAttachmentFiles = (year, trackingNumber, trackingType) => {
  return useQuery({
    queryKey: ['attachmentFiles', year, trackingNumber, trackingType],
    queryFn: async () => {
      if (!year || !trackingNumber || !trackingType) {
        throw new Error('Year, Tracking Number, and Tracking Type are required');
      }

      const formsToFetch = formTypeMap[trackingType] || [trackingType];

      const results = await Promise.all(
        formsToFetch.map(form =>
          fetchAttachmentFiles(year, trackingNumber, form)
        )
      );

      return results.flat();
    },
    enabled: !!year && !!trackingNumber && !!trackingType,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: error => {
      console.error('Query failed', error.message || error);
    },
  });
};


const fetchTNAttachments = async (year, officeCode) => {
  if (!year || !officeCode) {
    //console.error('Missing params:', { year, officeCode });
    return [];
  }
  const url = `/getTNAttachments?Year=${year}&Office=${officeCode}`;
  try {
    const { data } = await apiClient.get(url);
    return data; 
  } catch (err) {
    return [];
  }
};



export const useTNAttachment = (year) => {
  const { officeCode } = useUserInfo();
    const isReady = !!year && !!officeCode;

  return useQuery({
    queryKey: ['tnAttachments', year, officeCode],
    queryFn: () => fetchTNAttachments(year, officeCode),
    enabled: isReady,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};