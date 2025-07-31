import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchSuppliers = async (year, officeCode) => {
  if (!officeCode || !year) throw new Error('Office Code are required');
  const {data} = await apiClient.get(
    `/getsrSuppliers?Year=${year}&OfficeCode=${officeCode}`,
  );
  return data;
};

export const usesrSuppliers = year => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getsrSuppliers', year, officeCode],
    queryFn: () => fetchSuppliers(year, officeCode),
    enabled: Boolean(officeCode || year),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchSuppliersInfo = async name => {
  if (!name) throw new Error('Name are required');
  const {data} = await apiClient.get(`/getsrSuppliersInfo?Name=${name}`);
  return data;
};

export const useSuppliersInfo = name => {
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
  const {data} = await apiClient.get(
    `/getsrSupplierItems?Year=${year}&TrackingNumber=${tn}`,
  );
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

export const fetchSubmitReviews = async reviewData => {
  const formData = new FormData();

  formData.append('srSubmitReview', 1);
  formData.append('employeeNumber', reviewData.EmployeeNumber);
  formData.append('officeCode', reviewData.officeCode);
  formData.append('year', reviewData.year);
  formData.append('tn', reviewData.tn);
  formData.append('supplier', reviewData.supplier);
  formData.append('feedback', reviewData.feedback);
  formData.append('item', JSON.stringify(reviewData.item));
  formData.append('timeliness', reviewData.ratings.timeliness);
  formData.append('quality', reviewData.ratings.productQuality);
  formData.append('service', reviewData.ratings.service);
  formData.append('attachments', reviewData.attachments[0]); // Assuming attachments is an array and you want to send the first one
  // Append attachments (files)
  //  if (reviewData.attachments && Array.isArray(reviewData.attachments)) {
  //   reviewData.attachments.forEach((file, index) => {
  //     console.log(`Appending file ${index + 1}:`, file);
  //     formData.append('attachments[]', {
  //       uri: file.uri,
  //       type: file.type,
  //       name: file.fileName || file.name, // Some ImagePickers return `fileName`, others `name`
  //     });
  //   });
  // }

  // Log FormData content for debugging (optional, can be very verbose for files)
  // You can iterate formData entries to see what's being sent:
  // for (let pair of formData.entries()) {
  //    console.log(pair[0]+ ': ' + pair[1]);
  // }

  const upload_URL =
    'https://www.davaocityportal.com/gord/ajax/dataprocessor.php'; // Your API endpoint
  /* 
  try { */
  const res = await fetch(upload_URL, {
    method: 'POST',
    body: formData, // Send the FormData object directly
    // IMPORTANT: Do NOT manually set 'Content-Type' header for FormData.
    // The browser/fetch API will automatically set it to 'multipart/form-data'
    // with the correct boundary string.
  });

  const responseText = await res.text();

  if (!res.ok) {
    let errorMessage = responseText;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || responseText;
    } catch (e) {
      console.warn('Failed to parse error response as JSON:', responseText);
    }
    throw new Error(
      `HTTP error! status: ${res.status}, message: ${errorMessage}`,
    );
  }

  const data = JSON.parse(responseText);
  return data;
  /* } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  } */
};

export const useSubmitReviews = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: fetchSubmitReviews,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['supplierReviews']);
      // queryClient.invalidateQueries(['supplierReviews', variables.supplierId]);
    },
    onError: error => {
      console.error('Error submitting supplier review:', error.message);
      alert(
        `Failed to submit review: ${
          error.message || 'An unexpected error occurred.'
        }`,
      );
    },
    // Optional: onMutate can be used for optimistic updates
    // onMutate: async (newReview) => {
    //   // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    //   await queryClient.cancelQueries(['supplierReviews']);

    //   // Snapshot the previous value
    //   const previousReviews = queryClient.getQueryData(['supplierReviews']);

    //   // Optimistically update to the new value
    //   queryClient.setQueryData(['supplierReviews'], (old) => [...(old || []), newReview]);

    //   return { previousReviews };
    // },
    // onError: (err, newReview, context) => {
    //   // Rollback to the previous value on error
    //   queryClient.setQueryData(['supplierReviews'], context.previousReviews);
    // },
    // onSettled: () => {
    //   // Always refetch after error or success:
    //   queryClient.invalidateQueries(['supplierReviews']);
    // },
  });

  return mutation;
};

//new

export const fetchRatedSuppliers = async (year, officeCode) => {
  if (!officeCode) throw new Error('officeCode are required');
  const {data} = await apiClient.get(
    `/getsrRatedSuppliers?Year=${year}&Office=${officeCode}`,
  );
  return data;
};

export const useRatedSuppliers = year => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getsrRatedSuppliers', year, officeCode],
    queryFn: () => fetchRatedSuppliers(year, officeCode),
    enabled: Boolean(officeCode || year),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchSupplierReviews = async (year, suppId, officeCode) => {
  if (!suppId) throw new Error('suppId are required');
  const {data} = await apiClient.get(
    `/getsrSupplierReviews?Year=${year}&SupplierId=${suppId}&Office=${officeCode}`,
  );
  return data;
};

export const useSupplierReviews = (year, suppId) => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getsrSupplierReviews', year, suppId, officeCode],
    queryFn: () => fetchSupplierReviews(year, suppId, officeCode),
    enabled: Boolean(year || suppId || officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchSupplierReviewSummary = async (year, officeCode) => {
  if (!officeCode) throw new Error('officeCode are required');
  const {data} = await apiClient.get(
    `/getsrSupplierReviewSummary?Year=${year}&Office=${officeCode}`,
  );
  return data;
};

export const useSupplierReviewSummary = year => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getsrSupplierReviewsSummary', year, officeCode],
    queryFn: () => fetchSupplierReviewSummary(year, officeCode),
    enabled: Boolean(officeCode || year),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
