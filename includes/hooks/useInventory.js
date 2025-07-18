import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchInventory = async (
  officeCode,
  trackingNumber = '',
  year = '',
) => {
  if (!officeCode) throw new Error('Office Code is required');
  const url = `/getInventory?OfficeCode=${officeCode}&TrackingNumber=${
    trackingNumber ?? ''
  }&Year=${year ?? ''}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useInventory = (trackingNumber = '', year) => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getInventory', officeCode, trackingNumber, year],
    queryFn: () => fetchInventory(officeCode, trackingNumber, year),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchInventoryCategories = async officeCode => {
  if (!officeCode) throw new Error('Office Code is required');
  const url = `/getInventoryCategory?OfficeCode=${officeCode}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useInventoryCat = () => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getInventory', officeCode],
    queryFn: () => fetchInventoryCategories(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchInventoryCategoryDetails = async (officeCode, category) => {
  if (!officeCode) throw new Error('Office Code is required');
  const url = `/getInventoryCategoryDetails?OfficeCode=${officeCode}&Category=${category}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useInventoryCatDetails = category => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getInventory', officeCode],
    queryFn: () => fetchInventoryCategoryDetails(officeCode, category),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchInventoryDetails = async (
  id,
  trackingNumber = '',
  year = '',
) => {
  if (!id) throw new Error('id is required');
  const url = `/getInventoryDetails?Id=${id}&TrackingNumber=${
    trackingNumber ?? ''
  }&Year=${year ?? ''}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useInventoryDetails = (id = '', trackingNumber = '', year) => {
  return useQuery({
    queryKey: ['getInventoryDetails', id, trackingNumber, year],
    queryFn: () => fetchInventoryDetails(id, trackingNumber, year),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/* export const fetchInventory = async officeCode => {
  if (!officeCode) throw new Error('Office Code are required');
  const {data} = await apiClient.get(`/getInventory?OfficeCode=${officeCode}`);
  return data;
};

export const useInventory = () => {
  const {officeCode} = useUserInfo();
 return useQuery({
  queryKey: ['getInventory', officeCode],
  queryFn: () => fetchInventory(officeCode),
  enabled: Boolean(officeCode), 
  staleTime: 5 * 60 * 1000,
  retry: 2,
});
}; */

export const uploadInventory = async ({
  imagePath,
  id,
  office,
  tn,
  employeeNumber,
}) => {
  if (!imagePath || !id || !office || !tn) {
    throw new Error('Missing required parameters');
  }
  const formData = new FormData();
  formData.append('uploadInventory', 1);
  formData.append('id', id);
  formData.append('office', office);
  formData.append('tn', tn);
  formData.append('withImgs', imagePath.length);
  formData.append('numOfImages', imagePath.length);

  imagePath.forEach((image, index) => {
    formData.append(`images[${index + 1}]`, {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    });
  });

  //console.log('res', imagePath);

  const upload_URL =
    'https://www.davaocityportal.com/gord/ajax/dataprocessor.php';

  const res = await fetch(upload_URL, {
    method: 'POST',
    body: formData,
  });
  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(responseText);
  }

  return JSON.parse(responseText);
};

export const useUploadInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['uploadInventory'],
    mutationFn: uploadInventory,
    retry: 2,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'inventoryImages',
        variables.id,
        variables.office,
        variables.tn,
      ]);
      /*  console.log('data', data); */
      /*  if (variables.office) {
        queryClient.invalidateQueries([
          'getInventoryDetails',
          variables.id,
          variables.trackingNumber,
          variables.year,
        ]);
      }
 */
      return data;
    },
    onError: error => {
      console.error('Upload failed:', error.message);
      throw error;
    },
  });
};

export const removeImageInv = async imageUri => {
  if (!imageUri) {
    throw new Error('Invalid image URI');
  }
  try {
    const filename = imageUri.split('/').pop();
    const [id, office, tn, fylWithExtension] = filename.split('~');
    const fyl = fylWithExtension.split('.')[0];

    //const storedToken = await AsyncStorage.getItem('token');
    //const upload_URL = `http://192.168.254.134/`;
    const upload_URL = `https://www.davaocityportal.com/`;

    const url = new URL(`${upload_URL}/gord/ajax/dataprocessor.php`);
    url.searchParams.append('removeUploadInv', 1);
    url.searchParams.append('id', id);
    url.searchParams.append('office', office);
    url.searchParams.append('tn', tn);
    url.searchParams.append('fyl', fyl);

    const res = await fetch(url.toString(), {
      method: 'GET',
      /*   headers: {
        Authorization: `Bearer ${storedToken}`,
      }, */
    });

    const responseText = await res.text();
    if (!res.ok) {
      throw new Error(responseText);
    }
    console.log(responseText);

    const data = JSON.parse(responseText);
    return data;
  } catch (err) {
    console.error('Error in removing:', err.message);
    throw err;
  }
};

export const useRemoveImageInv = (onSuccess, onError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['removeImageInv'],
    mutationFn: removeImageInv,
    retry: 2,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['getInventory', variables.office],
      });

      if (onSuccess) onSuccess(data);
    },
    onError: error => {
      console.error('Image removal failed:', error.message);
      if (onError) onError(error);
    },
  });
};

/* export const uploadInventory = async ({
  imagePath,
  id,
  office,
  tn,
  employeeNumber,
}) => {
  if (!imagePath || !id || !office || !tn) {
    throw new Error('Missing required parameters');
  }
  const formData = new FormData();
  formData.append('uploadInventory', '1');
  formData.append('id', id);
  formData.append('office', office);
  formData.append('tn', tn);
  formData.append('withImgs', imagePath.length);
  formData.append('numOfImages', imagePath.length);

  imagePath.forEach((image, index) => {
    formData.append(`images[${index + 1}]`, {
      uri: image.uri,
      name: image.name,
      type: image.type,
    });
  });

    console.log('res', imagePath)

  try {
    const response = await apiClient.post('/uploadInventory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });


    const result = response.data;
    if (result.status !== 'success') {
      throw new Error(result.message || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Client Upload Error:', error.message);
    throw error;
  }
};

export const useUploadInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['uploadInventory'],
    mutationFn: uploadInventory,
    retry: 2,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'inventoryImages',
        variables.id,
        variables.office,
        variables.tn,
      ]);
      return data;
    },
    onError: error => {
      console.error('Upload failed:', error.message);
      throw error;
    },
  });
}; */

export const fetchInventoryImage = async (id, office, tn) => {
  if (!id || !office || !tn) {
    console.error('id, office and Tracking Number are required');
    return [];
  }
  try {
    const {data} = await apiClient.get(
      `/getInventoryImage?id=${id}&office=${office}&tn=${tn}`,
    );

    if (data.success) {
      //const image_URL = `http://192.168.254.134/`;
      const image_URL = `https://www.davaocityportal.com/`;
      return data.images.map(image => `${image_URL}/tempUpload/${image}`);
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const useInventoryImages = (id, office, tn) => {
  return useQuery({
    queryKey: ['inventoryImages', id, office, tn],
    queryFn: async () => {
      if (!id || !office || !tn) {
        throw new Error('ID, Office,');
      }
      return await fetchInventoryImage(id, office, tn);
    },
    enabled: !!id && !!office && !!tn,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const fetchStocks = async (year, officeCode) => {
  if (!officeCode) throw new Error('Office Code is required');
  if (!year) throw new Error('Year is required');

  const url = `/getInvStocks?Year=${year}&Office=${officeCode}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useStocks = year => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getInventoryStocks', year, officeCode],
    queryFn: () => fetchStocks(year, officeCode),
    enabled: Boolean(year && officeCode),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const fetchRequests = async officeCode => {
  if (!officeCode) throw new Error('Office Code is required');

  const url = `/getInvRequests?Office=${officeCode}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useRequests = () => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getInventoryStocks', officeCode],
    queryFn: () => fetchRequests(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const fetchDistribution = async officeCode => {
  if (!officeCode) throw new Error('Office Code is required');

  const url = `/getInvDistribution?Office=${officeCode}`;
  const {data} = await apiClient.get(url);
  return data;
};

export const useDistribution = () => {
  const {officeCode} = useUserInfo();
  return useQuery({
    queryKey: ['getInventoryDistribution', officeCode],
    queryFn: () => fetchDistribution(officeCode),
    enabled: Boolean(officeCode),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const submitInventoryRequest = async ({
  Year,
  TrackingNumber,
  ItemId,
  Item,
  requestedQty,
  units,
  reason,
  officeCode,
  employeeNumber,
  fullName,
  status,
}) => {
  // if (!officeCode) throw new Error('Office Code is required');
  // if (!Year) throw new Error('Year is required');
  // if (!ItemId) throw new Error('Item ID is required');
  // if (!Item) throw new Error('Item name is required');
  // if (requestedQty === undefined || requestedQty <= 0)
  //   throw new Error('Requested quantity must be a positive number');
 /*  console.log(
    'submitInventoryRequest:',
    Year,
    TrackingNumber,
    ItemId,
    Item,
    requestedQty,
    units,
    reason,
    officeCode,
  );
 */
  console.log("reas",units)
  const payload = {
    Year,
    TrackingNumber,
    ItemId,
    Item,
    Qty: requestedQty,
    Units: units,
    Reason: reason,
    Office: officeCode,
    EmployeeNumber: employeeNumber,
    Name: fullName,
    Status: status,
  };

  const url = `/invSubmitRequest`;
  const {data} = await apiClient.post(url, payload);
  return data;
};

export const useSubmitInventoryRequest = () => {
  const queryClient = useQueryClient();
  const {officeCode, employeeNumber, fullName} = useUserInfo();
  return useMutation({
    mutationFn: async requestDetails => {
      return submitInventoryRequest({...requestDetails, officeCode,employeeNumber, fullName});
    },
    onSuccess: (data, variables, context) => {
      console.log('Request submitted successfully:', data);
      queryClient.invalidateQueries(['inventoryRequests', officeCode]);
    },
    onError: (error, variables, context) => {
      console.error('Failed to submit request:', error);
    },
    // Optional: onMutate, onSettled callbacks can also be added here
  });
};
