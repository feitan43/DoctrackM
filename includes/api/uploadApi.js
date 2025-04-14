import apiClient from './apiClient';

export const uploadTNAttach = async ({ imagePath, year, tn, form, employeeNumber }) => {
  if (!imagePath || !year || !tn || !employeeNumber) {
    throw new Error('Missing required parameters');
  }

  const formData = new FormData();
  formData.append('uploadTNAttach', '1');
  formData.append('year', year);
  formData.append('uploadedBy', employeeNumber);
  formData.append('type', form);
  formData.append('tn', tn);
  formData.append('numOfImages', imagePath.length.toString());

  imagePath.forEach((file, index) => {
    formData.append(`file[${index + 1}]`, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });
  });

  const upload_URL = 'http://192.168.254.134/gord/ajax/dataprocessor.php';

  try {
    const res = await fetch(upload_URL, {
      method: 'POST',
      body: formData,
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(responseData?.message || 'Server returned an error');
    }
    return responseData;
  } catch (error) {
    console.error('Upload failed:', error.message);
    throw new Error('Upload failed: ' + error.message);
  }
};

export const removeTNAttach = async ({ year, tn, form }) => {
  if (!year || !tn || !form) {
    throw new Error('Missing required parameters');
  }

  try {
    const remove_URL = `http://192.168.254.134/`;
    //const remove_URL = `https://www.davaocityportal.com/`;

    const url = new URL(`${remove_URL}/gord/ajax/dataprocessor.php`);
    url.searchParams.append('removeTNAttach', 1);
    url.searchParams.append('year', year);
    url.searchParams.append('tn', tn);
    url.searchParams.append('type', form);  

    const res = await fetch(url.toString(), {
      method: 'GET',
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

export const fetchAttachmentFiles = async (year, trackingNumber, form) => {
  if (!year || !trackingNumber) {
    console.error('Year and Tracking Number are required');
    return [];
  }

  try {
    const { data } = await apiClient.get(
      `/getAttachmentFiles?year=${year}&trackingNumber=${trackingNumber}&form=${form}`
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
    console.error('Error fetching attachments:', error.message || error);
    return [];
  }
};

