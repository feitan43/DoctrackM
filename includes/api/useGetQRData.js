import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGetQRData = () => {
  const [qrData, setQRData] = useState(null);
  const [qrLoading, setQRLoading] = useState(false);
  const [qrError, setQRError] = useState(null);
  const [controller, setController] = useState(null);

  const fetchQRData = async (year, trackingNumber) => {
    if (!year || !trackingNumber) {
      setQRError('Year and Tracking Number are required');
      return;
    }

    if (controller) {
      controller.abort(); // Cancel any ongoing request
    }

    const newController = new AbortController();
    setController(newController);

    const timeoutId = setTimeout(() => {
      newController.abort(); // Abort the request after timeout
      setQRError('Request timed out'); // Set error message for timeout
      setQRLoading(false); // Ensure loading state is reset
    }, 10000); // Set timeout duration to 10 seconds

    setQRLoading(true);
    setQRError(null);
    setQRData(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setQRError('Authorization token is missing');
        setQRLoading(false);
        clearTimeout(timeoutId); // Clear timeout
        return;
      }

      const apiUrl = `${BASE_URL}/getQRData?Year=${year}&TrackingNumber=${trackingNumber}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        signal: newController.signal,
      });

      clearTimeout(timeoutId); // Clear timeout on successful response
      setQRData(response.data);
      return response.data; // Return the data
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else if (err.response) {
        if (err.response.status === 404) {
          setQRError('QR data not found');
        } else {
          setQRError(err.response?.data?.message || 'Server error');
        }
      } else if (err.request) {
        setQRError('Network error. Please check your connection.');
      } else {
        setQRError('Unexpected error occurred');
      }
    } finally {
      clearTimeout(timeoutId); // Ensure timeout is cleared
      setQRLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  return { qrData, setQRData, qrLoading, qrError, fetchQRData };
};

export default useGetQRData;




/* import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGetQRData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQRData = async (year, trackingNumber) => {
    if (!year || !trackingNumber) {
      setError('Year and Tracking Number are required');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setError('Authorization token is missing');
        setLoading(false);
        return;
      }

      const apiUrl = `${BASE_URL}/getQRData?Year=${year}&TrackingNumber=${trackingNumber}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });
      setData(response.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          setError('QR data not found');
        } else {
          setError(err.response?.data?.message || 'Server error');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, setData, loading, error, fetchQRData };
};

export default useGetQRData;
 */