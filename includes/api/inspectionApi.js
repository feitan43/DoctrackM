import apiClient from './apiClient';

export const fetchInspection = async (employeeNumber) => {
  if (!employeeNumber)
    throw new Error('Employee Number are required');
  const {data} = await apiClient.get(
    `/getInspection?EmployeeNumber=${employeeNumber}`,
  );
  return data;
};

export const fetchInspectionDetails = async (year, trackingNumber) => {
  if (!trackingNumber) throw new Error('Tracking number is required');

  const { data } = await apiClient.get(
    `/genInformation?Year=${year}&TrackingNumber=${trackingNumber}`,
  );
  return data;
};

export const fetchInspectionItems = async (year, trackingNumber) => {
  try {
    if (!trackingNumber) throw new Error("Tracking number is required");

    const { data } = await apiClient.get(
      `/getInspectionItems?year=${year}&trackingNumber=${trackingNumber}`
    );

    return data;
  } catch (error) {
    console.error("Error fetching inspection items:", error.message);
    throw error;
  }
};

export const inspectItems = async (year, employeeNumber,deliveryId, trackingNumber, inspectionStatus, invNumber, invDate, remarks, ) => {
  
  if (!trackingNumber || !inspectionStatus) {
    throw new Error('Tracking number and status are required.');
  }

  try {
    const { data } = await apiClient.get(
      `/inspectItems?year=${encodeURIComponent(year)}&employeeNumber=${encodeURIComponent(employeeNumber)}&deliveryId=${encodeURIComponent(deliveryId)}&trackingNumber=${encodeURIComponent(trackingNumber)}&status=${encodeURIComponent(inspectionStatus)}&invNumber=${encodeURIComponent(invNumber)}&invDate=${encodeURIComponent(invDate)}&remarks=${encodeURIComponent(remarks || "")}`,
    );
    return data;
  } catch (error) {
    console.error('Error fetching inspection details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch inspection details.');
  }
};

export const addSchedule = async (date, deliveryId) => {

  if (!date || !deliveryId) {
    throw new Error('Date and Delivery ID are required');
  }

  try {
    const { data } = await apiClient.get(
      `/addSchedule?date=${encodeURIComponent(date)}&deliveryId=${deliveryId}`
    );
    return data;
  } catch (error) {
    console.error('Error adding schedule:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to add schedule');
  }
};

export const fetchInspectorImage = async (year, trackingNumber) => {
  if (!year || !trackingNumber) {
    console.error('Year and Tracking Number are required');
    return [];
  }

  try {
    const { data } = await apiClient.get(
      `/getInspectorImage?year=${year}&trackingNumber=${trackingNumber}`
    );

    if (data.success) {
      //const image_URL = `http://192.168.254.134/`;
       const image_URL = `https://www.davaocityportal.com/`;
      return data.images.map(image => `${image_URL}/tempUpload/${image}`);
    } else {
      //console.error('Failed to fetch images:', data.error || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching images:', error.message || error);
    return [];
  }
};

export const uploadInspector = async ({ imagePath, year, pxTN, employeeNumber }) => {
  if (!imagePath || !year || !pxTN) {
    throw new Error('Missing required parameters');
  }

  const formData = new FormData();
  formData.append('uploadInspector', 1);
  formData.append('year', year);
  formData.append('inspectedBy', employeeNumber);
  formData.append('pxTN', pxTN);
  formData.append('withImgs', imagePath.length);
  formData.append('numOfImages', imagePath.length);

  imagePath.forEach((image, index) => {
    formData.append(`images[${index + 1}]`, {
      uri: image.uri,
      name: image.name,
      type: image.type,
    });
  });

  console.log("f",formData);

  //const upload_URL = 'http://192.168.254.134/gord/ajax/dataprocessor.php';
  const upload_URL = 'https://www.davaocityportal.com/gord/ajax/dataprocessor.php';

  const res = await fetch(upload_URL, {
    method: 'POST',
    body: formData,
   /*  headers: {
      Authorization: `Bearer ${storedToken}`,
      Accept: 'application/json',
    }, */
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(responseText);
  }

  return JSON.parse(responseText);
};

export const removeInspectorImage = async (imageUri) => {
  if (!imageUri) {
    throw new Error('Invalid image URI');
  }

  try {
    const filename = imageUri.split('/').pop();
    const [year, pxTN, fylWithExtension] = filename.split('~');
    const fyl = fylWithExtension.split('.')[0];

    //const storedToken = await AsyncStorage.getItem('token');
    //const upload_URL = `http://192.168.254.134/`;
    const upload_URL = `https://www.davaocityportal.com/`;

    const url = new URL(`${upload_URL}/gord/ajax/dataprocessor.php`);
    url.searchParams.append('removeThisUpload', 1);
    url.searchParams.append('year', year);
    url.searchParams.append('pxTN', pxTN);
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

    const data = JSON.parse(responseText);
    return data;
  } catch (err) {
    console.error('Error in removing:', err.message);
    throw err;
  }
};

export const fetchInspectionPRDetails= async (year, trackingNumber) => {
  try {
    if (!trackingNumber) throw new Error("Tracking number is required");

    const { data } = await apiClient.get(
      `/getInspectionPRDetails?year=${year}&trackingNumber=${trackingNumber}`
    );

    return data;
  } catch (error) {
    console.error("Error fetching fetchInspectionPRDetails:", error.message);
    throw error;
  }
};

export const fetchInspectionRecentActivity = async (employeeNumber) => {
  if (!employeeNumber) {
    throw new Error('Employee Number is required');
  }
  try {
    const { data } = await apiClient.get(`/getRecentActivity?employeeNumber=${employeeNumber}`);
    return data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

export const fetchEditDeliveryDate = async (deliveryId, deliveryDate) => {
  try {
    if (!deliveryId) throw new Error("deliveryId is required");

    const { data } = await apiClient.get(
      `/editDeliveryDate?deliveryId=${deliveryId}&deliveryDate=${deliveryDate}`
    );

    return data;
  } catch (error) {
    console.error("Error fetching editDeliveryDate:", error.message);
    throw error;
  }
};














