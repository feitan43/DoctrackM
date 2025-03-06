import { useState, useEffect } from 'react';
//import baseUrl from '../../config';
import BASE_URL from '../../config';


const useGetImage = (year, trackingNumber) => {
  
  const [inspectorImages, setInspectorImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const fetchInspectorImage = async () => {
      if (!year || !trackingNumber) {
        return;
      }

      setInspectorImages([]); 
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_URL}/getInspectorImage?year=${year}&trackingNumber=${trackingNumber}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success) {
          //const fullImageUrls = data.images.map(image => `https://www.davaocityportal.com/tempUpload/${image}`);
          //const image_URL = `https://192.168.254.134/`;
          const image_URL = `https://www.davaocityportal.com/`;
          const fullImageUrls = data.images.map(image => `${image_URL}/tempUpload/${image}`);
          //const fullImageUrls = data.images.map(image => `http://192.168.254.134/tempUpload/${image}`);
          //console.log(fullImageUrls);
         // const fullImageUrls = data.images.map(image => `${IMAGE_URL}${image}`);
          //console.log("Full Image Data:", fullImageUrls); // Log the image data here
          setInspectorImages(fullImageUrls);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch images');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {

    fetchInspectorImage(); 

    return () => {
      setInspectorImages([]); 
    };

  }, [year, trackingNumber]); 

  return { inspectorImages, loading, error, fetchInspectorImage };
};

export default useGetImage;
