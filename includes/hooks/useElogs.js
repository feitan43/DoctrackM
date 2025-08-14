import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchElogsLetters = async officeCode => {
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
  const {data} = await apiClient.get(
    `/getElogsLetterTypes?Office=${officeCode}`,
  );
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

export const fetchElogsOffices = async () => {
  const {data} = await apiClient.get(`/getOffices`);
  return data;
};

export const useElogsOffices = () => {
  return useQuery({
    queryKey: ['getElogsOffices'],
    queryFn: fetchElogsOffices,
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchElogsAttachments = async trackingNumber => {
  const {data} = await apiClient.get(
    `/getElogsAttachments?TrackingNumber=${trackingNumber}`,
  );
  return data;
};

export const useElogsAttachments = trackingNumber => {
  return useQuery({
    queryKey: ['getElogsAttachments', trackingNumber],
    queryFn: () => fetchElogsAttachments(trackingNumber),
    enabled: Boolean(trackingNumber),
    staleTime: 0, // This ensures data is refetched on every call
    retry: 2,
  });
};

//mutation

export const updateLetterStatus = async ({tn, status}) => {
  const payload = {
    tn: tn,
    status: status,
  };

  const url = `/updateLetterStatus`;
  console.log('url', url);
  const {data} = await apiClient.post(url, payload);
  console.log('data', apiClient);
  return data;
};

export const useUpdateLetterStatus = () => {
  const queryClient = useQueryClient();
  const {officeCode} = useUserInfo();

  return useMutation({
    mutationFn: async ({tn, status}) => {
      return updateLetterStatus({tn, status});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getElogsLetters', officeCode]);
    },
    onError: error => {
      console.error('Failed to update letter status:', error);
    },
    // The `variables` argument is passed from the `mutate` call.
    // The `context` is for more advanced use cases.
  });
};

//LETTER TYPES
export const addLetterTypes = async ({letterType, office, emp}) => {
  console.log(letterType, office, emp);
  const payload = {
    letterType,
    office,
    emp,
  };

  const url = `/addLetterType`;
  const {data} = await apiClient.post(url, payload);
  return data;
};

export const useAddLetterTypes = () => {
  const queryClient = useQueryClient();
  const {employeeNumber, officeCode} = useUserInfo();

  return useMutation({
    mutationFn: async variables => {
      return addLetterTypes({
        letterType: variables.letterType,
        office: officeCode, // Assuming officeCode comes from useUserInfo()
        emp: employeeNumber, // Assuming employeeNumber comes from useUserInfo()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['getElogsLetterTypes', officeCode]);
    },
    onError: error => {
      console.error('Failed to add letter type:', error);
    },
  });
};

export const updateLetterType = async ({ code, oldtype, newtype }) => {
  const payload = {
    code,
    oldtype,
    newtype,
  };

  // The URL must match the endpoint defined on your Node.js server.
  const url = `/updateLetterType`;
  const { data } = await apiClient.patch(url, payload);
  return data;
};

export const useUpdateLetterTypes = () => {
  const queryClient = useQueryClient();
  const { officeCode } = useUserInfo();

  return useMutation({
    // The mutationFn correctly accepts 'variables' which will be an object
    // containing 'code', 'oldtype', and 'newtype' from the component.
    mutationFn: async (variables) => {
      // The updateLetterType API function is called with all the required variables.
      return updateLetterType(variables);
    },
    onSuccess: (data, variables, context) => {
      // On a successful mutation, we invalidate the query that fetches the
      // list of letter types. This will cause the UI to automatically refetch
      // the latest list and update itself. The invalidation key includes
      // the officeCode to ensure it's specific to the current user's data.
      queryClient.invalidateQueries(['getElogsLetterTypes', officeCode]);
    },
    onError: (error) => {
      console.error('Failed to update letter type:', error);
      // You can add more user-friendly error handling here, like a toast message.
    },
  });
};

export const deleteLetterType = async ({letterTypeId}) => {
  const payload = {
    id: letterTypeId,
  };

  const url = `/deleteLetterType`;
  const {data} = await apiClient.post(url, payload);
  return data;
};

export const useDeleteLetterType = () => {
  const queryClient = useQueryClient();
  const {officeCode} = useUserInfo();

  return useMutation({
    // The mutationFn now correctly destructures the letterTypeId directly from the variables object.
    mutationFn: async ({letterTypeId}) => {
      // The deleteLetterType function only needs the letterTypeId.
      // Other userInfo is not required for this specific API call,
      // so we don't pass them to the API function itself.
      return deleteLetterType({letterTypeId});
    },
    onSuccess: (data, variables, context) => {
      // This invalidates the query that fetches the list of letter types,
      // causing the UI to refetch and display the updated list.
      queryClient.invalidateQueries(['getElogsLetterTypes', officeCode]);
    },
    onError: error => {
      console.error('Failed to delete letter type:', error);
      // Optional: Add user-facing error handling like a toast notification here.
    },
  });
};

//STATUSES
export const addLetterStatus = async ({
  status,
  color,
  officeCode,
  employeeNumber,
}) => {
  const payload = {
    status,
    color,
    officeCode,
    employeeNumber,
  };

  const url = `/addLetterStatus`;
  const {data} = await apiClient.post(url, payload);
  return data;
};

export const useAddLetterStatus = () => {
  const queryClient = useQueryClient();
  const {employeeNumber, officeCode} = useUserInfo();

  return useMutation({
    mutationFn: async variables => {
      return addLetterStatus({
        ...variables,
        employeeNumber,
        officeCode,
      });
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['getElogsStatuses', officeCode]);
    },
    onError: (error, variables, context) => {
      console.error('Failed to add status:', error);
    },
  });
};

export const editStatuses = async ({officeCode}) => {
  const payload = {
    OfficeCode: officeCode,
  };

  const url = `/editLetterTypes`;
  const {data} = await apiClient.post(url, payload);
  return data;
};

export const useEditStatuses = () => {
  const queryClient = useQueryClient();
  const {employeeNumber, officeCode} = useUserInfo();
  return useMutation({
    mutationFn: async requestDetails => {
      return editLetterTypes({
        ...requestDetails,
        employeeNumber,
        officeCode,
      });
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['updateLetterStatus', officeCode]);
    },
    onError: (error, variables, context) => {
      console.error('Failed to submit request:', error);
    },
    // Optional: onMutate, onSettled callbacks can also be added here
  });
};

export const deleteLetterStatus = async ({letterTypeId}) => {
  const payload = {
    id: letterTypeId,
  };

  const url = `/deleteLetterStatus`;
  const {data} = await apiClient.post(url, payload);
  return data;
};

export const useDeleteLetterStatus = () => {
  const queryClient = useQueryClient();
  const {officeCode} = useUserInfo();

  return useMutation({
    mutationFn: async ({letterTypeId}) => {
      return deleteLetterStatus({letterTypeId});
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['getElogsStatuses', officeCode]);
    },
    onError: error => {
      console.error('Failed to delete letter type:', error);
    },
  });
};
