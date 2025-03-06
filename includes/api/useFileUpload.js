import {useState} from 'react';
import {Alert} from 'react-native';
import useUserInfo from './useUserInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BASE_URL from '../../config';

const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const {fullName, employeeNumber} = useUserInfo();

  const [removing, setRemoving] = useState(false);
  const [removingResult, setRemovingResult] = useState(null);

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

      const response = await fetch(
        //'http://192.168.1.194/gord/ajax/dataprocessor.php',
        `${BASE_URL}/gord/ajax/dataprocessor.php`,

        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        },
      );

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
        return data; // Return the result
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error during file upload:', err);
      setError(err.message || 'Upload failed');
      return {status: 'error', message: err.message};
    } finally {
      setUploading(false);
    }
  };

  const uploadInspector = async (imagePath, year, pxTN) => {
    if (!imagePath || !year || !pxTN) {
      return null;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('uploadInspector', 1);
    formData.append('year', year);
    formData.append('inspectedBy', employeeNumber);
    formData.append('pxTN', pxTN);
    formData.append('withImgs', imagePath.length);
    formData.append('numOfImages', imagePath.length);
    //formData.append('images', imagePath);
    //console.log(imagePath)

    if (imagePath.length > 0) {
      // imagePath.forEach(image => {
      imagePath.forEach((image, index) => {
        const file = {
          uri: image.uri,
          name: image.name,
          type: image.type,
        };
        //console.log(file)

        //formData.append(`images[]`, file);
        //formData.append('images[]', file);
        formData.append(`images[${index + 1}]`, file);
      });
    }

    try {
      console.log('uploading....');
      const storedToken = await AsyncStorage.getItem('token');
      const upload_URL = `https://www.davaocityportal.com/`;

      const res = await fetch(

        //'http://192.168.254.134/gord/ajax/dataprocessor.php',
        
        `${upload_URL}/gord/ajax/dataprocessor.php`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: 'application/json',
          },
        },
      );

      console.log(res);

      //console.log(formData)

      console.log('Response Status:', res.status);
      const responseText = await res.text();
      console.log('Response Body:', responseText);
      console.log('Raw Response Body:', responseText);

      if (!res.ok) {
        throw new Error(responseText);
      }

      const data = JSON.parse(responseText);
      console.log('Response Data:', data);
      return data;
    } catch (err) {
      console.error('Error in uploadInspector:', err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // const uploadInspector = async (imagePath, year, pxTN) => {
  //   if (!imagePath || !year || !pxTN) {
  //     console.warn("Missing required parameters");
  //     return null;
  //   }

  //   setUploading(true);

  //   const formData = new FormData();
  //   formData.append('year', year);
  //   formData.append('inspectedBy', employeeNumber);
  //   formData.append('pxTN', pxTN);
  //   formData.append('withImgs', imagePath.length.toString());
  //   formData.append('numOfFiles', imagePath.length.toString());

  //   imagePath.forEach((image) => {
  //     formData.append('images[]', {
  //       uri: image.uri,
  //       name: image.name,
  //       type: image.type,
  //     });
  //   });

  //   try {
  //     console.log('Uploading to Node server...');

  //     const storedToken = await AsyncStorage.getItem('token');
  //     if (!storedToken) {
  //       throw new Error("Token not found");
  //     }

  //     const res = await fetch(`${BASE_URL}/uploadInspector`, {
  //       method: 'POST',
  //       body: formData,
  //       headers: {
  //         Authorization: `Bearer ${storedToken}`,
  //       },
  //     });

  //     const responseText = await res.text();
  //     if (!res.ok) {
  //       throw new Error(`Upload failed: ${responseText}`);
  //     }

  //     const data = JSON.parse(responseText);
  //     console.log('Response Data:', data);
  //     return data;
  //   } catch (err) {
  //     console.error('Error in uploadInspector:', err.message);
  //     throw err;
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const removeThisUpload = async imageUri => {
    if (!imageUri) {
      return null;
    }
    setRemoving(true);

    try {
      console.log('removing....');

      const filename = imageUri.split('/').pop();
      const [year, pxTN, fylWithExtension] = filename.split('~');
      const fyl = fylWithExtension.split('.')[0];

      const storedToken = await AsyncStorage.getItem('token');
      const upload_URL = `https://www.davaocityportal.com/`;

      const url = new URL(`${upload_URL}/gord/ajax/dataprocessor.php`);
      url.searchParams.append('removeThisUpload', 1);
      url.searchParams.append('year', year);
      url.searchParams.append('pxTN', pxTN);
      url.searchParams.append('fyl', fyl);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      console.log('Response Status:', res.status);
      const responseText = await res.text();
      console.log('Response Body:', responseText);

      if (!res.ok) {
        throw new Error(responseText);
      }

      const data = JSON.parse(responseText);
      console.log('Response Data:', data);

      // Check success or failure based on the data
      if (data.success) {
        console.log('File removal successful');
      } else {
        console.log('File removal failed');
      }

      return data;
    } catch (err) {
      console.error('Error in removing:', err.message);
      throw err;
    } finally {
      setRemoving(false);
    }
  };

  return {
    uploading,
    uploadResult,
    removing,
    setRemoving,
    error,
    uploadFile,
    uploadInspector,
    removeThisUpload,
  };
};

export default useFileUpload;
