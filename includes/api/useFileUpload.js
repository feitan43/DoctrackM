import { useState } from 'react';
import useUserInfo from './useUserInfo';

const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const { fullName } = useUserInfo();

  const uploadFile = async (id, date, remarks, selectedImages = []) => {
    setUploading(true);
    setError(null);
  
    if (!Array.isArray(selectedImages)) {
      console.error('selectedImages should be an array');
      setError('Invalid image data');
      setUploading(false);
      return null;
    }
  
    try {
      const formData = new FormData();
      formData.append('uploadPPEInspectionGSO', 1);
      formData.append('account', id);
      formData.append('date', date);
      formData.append('inspector', fullName);
      formData.append('withImgs', selectedImages.length);
      formData.append('numOfFiles', selectedImages.length);
      formData.append('remarks', remarks);
  
      selectedImages.forEach((image, index) => {
        if (image && image.uri) {
          const type = image.type || 'image/jpeg';
          formData.append(`images[${index}]`, {
            uri: image.uri,
            type,
            name: image.fileName || `image${index}.${type.split('/')[1]}`,
          });
        } else {
          console.warn(`Invalid image at index ${index}`, image);
        }
      });
  
      const response = await fetch('http://192.168.1.194/gord/ajax/dataprocessor.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
  
      //console.log

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data2 = await response.text();
      console.log(data2);

      const text = await response.text();
      const data = JSON.parse(text);
  
      if (data.status === 'success') {
        setUploadResult(data);
        return data;  // Return the result
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error during file upload:', err);
      setError(err.message || 'Upload failed');
      return { status: 'error', message: err.message };
    } finally {
      setUploading(false);
    }
  };
  
  return { uploading, uploadResult, error, uploadFile };
};

export default useFileUpload;
