import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInspection,fetchInspectionDetails, fetchInspectionItems, inspectItems, addSchedule, fetchInspectorImage, uploadInspector, removeInspectorImage, fetchInspectionPRDetails, fetchInspectionRecentActivity, fetchEditDeliveryDate  } from '../api/inspectionApi.js';
import useUserInfo from '../api/useUserInfo.js';
import { showMessage } from 'react-native-flash-message';

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

export const useInspectionDetails = (year, trackingNumber) => {
  const { employeeNumber } = useUserInfo();
  return useQuery({
    queryKey: ['inspectionDetails', employeeNumber, year, trackingNumber], 
    queryFn: async () => {
      if (!employeeNumber) throw new Error('Employee Number is required');
      if (!trackingNumber) throw new Error('Tracking Number is required');
      
      return await fetchInspectionDetails(year, trackingNumber);
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
      console.log("onhold",year, deliveryId, trackingNumber, inspectionStatus,invNumber, invDate, remarks )
      if (!trackingNumber || !inspectionStatus || !deliveryId) {
        throw new Error('Tracking number and status are required');
      }
      return await inspectItems(year, employeeNumber,deliveryId, trackingNumber, inspectionStatus, invNumber, invDate, remarks);
    },
    onSuccess: () => {
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
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      console.error('Image removal failed:', error.message);
      if (onError) onError(error);
    },
  });
};

export const useInspectionPRDetails = (year, trackingNumber) => {
  return useQuery({
    queryKey: ["inspectionPRDetails", year, trackingNumber],
    queryFn: async () => {
      if (!trackingNumber || !trackingNumber.startsWith("PR-")) {
        return null; 
      }

      return await fetchInspectionPRDetails(year, trackingNumber);
    },
    enabled: !!trackingNumber && trackingNumber.startsWith("PR-"), // Only enable query if trackingNumber starts with "PR-"
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};

export const useInspectionRecentActivity = () => {
  const { employeeNumber } = useUserInfo();
  console.log("recent", employeeNumber)
  
  return useQuery({
    queryKey: employeeNumber ? ['inspectionRecentActivity', employeeNumber] : ['inspectionRecentActivity'],
    queryFn: () => (employeeNumber ? fetchInspectionRecentActivity(employeeNumber) : Promise.resolve([])),
    enabled: Boolean(employeeNumber),
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};

export const useEditDeliveryDate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ deliveryId, deliveryDate }) => {
      if (!deliveryId || !deliveryDate) {
        return Promise.reject(new Error('Delivery ID and Delivery Date are required'));
      }
       return await fetchEditDeliveryDate(deliveryId, deliveryDate);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["inspectionItems", variables.year, variables.trackingNumber]);

      showMessage({
        message: "Delivery date updated successfully!",
        type: "success",
        icon: 'success',
        duration: 3000,
        floating: true,
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error.message);
      showMessage({
        message: "Failed to update delivery date.",
        description: error.message,
        type: "danger",
        icon: 'danger',
        duration: 3000,
        floating: true,
      });
    },
    retry: 2,
  });

  return mutation;
};

