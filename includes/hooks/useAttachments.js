import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  uploadTNAttach,
  removeTNAttach,
  fetchAttachmentFiles,
} from '../api/uploadApi.js';

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
      console.log('data', data);
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

export const useAttachmentFiles = (year, trackingNumber, form) => {
  return useQuery({
    queryKey: ['attachmentFiles', year, trackingNumber, form],
    queryFn: async () => {
      if (!year || !trackingNumber || !form) {
        throw new Error('Year, Tracking Number, and Form are required');
      }
      return await fetchAttachmentFiles(year, trackingNumber, form);
    },
    enabled: !!year && !!trackingNumber && !!form,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: error => {
      console.error('Query failed', error.message || error);
    },
  });
};
