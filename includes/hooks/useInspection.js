import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInspection,fetchInspectionDetails, fetchInspectionItems, inspectItems, addSchedule, fetchInspectorImage, uploadInspector, removeInspectorImage } from '../api/inspectionApi.js';
import useUserInfo from '../api/useUserInfo.js';

export const useInspection = () => {
  const { employeeNumber } = useUserInfo();
  
  return useQuery({
    queryKey: ['inspection', employeeNumber], 
    queryFn: () => fetchInspection(employeeNumber),
    enabled: Boolean(employeeNumber), 
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};

export const useInspectionDetails = (year, trackingNumber, accountType, officeCode) => {
  const { employeeNumber } = useUserInfo();

  return useQuery({
    queryKey: ['inspectionDetails', employeeNumber, year, trackingNumber, accountType, officeCode], 
    queryFn: async () => {
      if (!employeeNumber) throw new Error('Employee Number is required');
      if (!trackingNumber) throw new Error('Tracking Number is required');
      
      return await fetchInspectionDetails(year, trackingNumber, accountType, officeCode);
    },
    enabled: !!employeeNumber && !!trackingNumber, 
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};

export const useInspectionItems = (year, trackingNumber) => {
  return useQuery({
    queryKey: ["inspectionItems", year, trackingNumber],
    queryFn: async () => {
      console.log("Fetching inspection items for:", { year, trackingNumber }); // ✅ Log when refetching
      if (!trackingNumber) throw new Error("Tracking Number is required");

      return await fetchInspectionItems(year, trackingNumber);
    },
    enabled: !!trackingNumber,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useInspectItems = () => {
  const queryClient = useQueryClient();
  const { employeeNumber } = useUserInfo();

  const mutation = useMutation({
    mutationFn: async ({ year, deliveryId, trackingNumber, inspectionStatus,invNumber, invDate, remarks }) => {

      if (!trackingNumber || !inspectionStatus || !deliveryId) {
        throw new Error('Tracking number and status are required');
      }
      return await inspectItems(year, employeeNumber,deliveryId, trackingNumber, inspectionStatus, invNumber, invDate, remarks);
    },
    onSuccess: () => {
      console.log("Inspection updated successfully");
      queryClient.invalidateQueries(['inspection']); // Ensure inspections are refetched
    },
    onError: (error) => {
      console.error("Error updating inspection:", error.message);
    },
  });

  return mutation;
};

export const useAddSchedule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ date, deliveryId }) => {
      if (!date || !deliveryId) {
        return Promise.reject(new Error('Date and Delivery ID are required'));
      }
      return await addSchedule(date, deliveryId);
    },
    onSuccess: () => {
      console.log("Mutation success");
      queryClient.invalidateQueries(['inspection']);
    },
    onError: (error) => {
      console.error("Mutation error:", error.message);
    },
  });
  return mutation;
};

export const useInspectorImages = (year, trackingNumber) => {

  return useQuery({
    queryKey: ['inspectorImages', year, trackingNumber],
    queryFn: async () => {
      if (!year || !trackingNumber) {
        throw new Error('Year and Tracking Number are required');
      }
      return await fetchInspectorImage(year, trackingNumber);
    },
    enabled: !!year && !!trackingNumber, 
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};

export const useUploadInspector = (onSuccess, onError) => {
  return useMutation({
    mutationKey: ['uploadInspector'],
    mutationFn: uploadInspector,
    retry: 2,
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      console.error('Upload failed:', error.message);
      if (onError) onError(error);
    },
  });
};

export const useRemoveInspectorImage = (onSuccess, onError) => {
  return useMutation({
    mutationKey: ['removeInspectorImage'],
    mutationFn: removeInspectorImage,
    retry: 2,
    onSuccess: (data) => {
      console.log('Image removal successful:', data);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      console.error('Image removal failed:', error.message);
      if (onError) onError(error);
    },
  });
};
