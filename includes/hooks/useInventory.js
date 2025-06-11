import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const fetchInventory = async officeCode => {
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
};

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
        variables.year,
        variables.pxTN,
      ]);
      return data;
    },
    onError: error => {
      console.error('Upload failed:', error.message);
      throw error;
    },
  });
};

export const fetchInventoryImage = async (id,office, tn) => {
  console.log("fetch",id,office, tn)
  if (!id || !office || !tn) {
    console.error('id, office and Tracking Number are required');
    return [];
  }
  try {
    const { data } = await apiClient.get(
      `/getInventoryImage?id=${id}&office=${office}&tn=${tn}`
    );

    if (data.success) {
      //const image_URL = `http://192.168.254.134/`;
       const image_URL = `https://www.davaocityportal.com/`;
      return data.images.map(image => `${image_URL}/tempUpload/${image}`);
    } else {
      return [];
    }
  } catch (error) {
    //console.error('Error fetching images:', error.message || error);
    return [];
  }
};

export const useInventoryImages = (id,office, tn) => {
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

