import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseUrl from '../../config';
import useUserInfo from './useUserInfo';
import io from 'socket.io-client';

const useRecentlyUpdated = () => {
  const [recentlyUpdatedData, setRecentlyUpdatedData] = useState(null);
  const [recentlyUpdatedLength, setRecentlyUpdatedLength] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const { officeCode } = useUserInfo();
  const [updatedNowData, setUpdatedNowData] = useState(null);
  const [updatedDateTime, setUpdatedDateTime] = useState(null);
  const [recentLoading, setRecentLoading] = useState(false);
  const socketRef = useRef(null);

  const fetchToken = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const fetchRecentlyUpdatedData = useCallback(async () => {
    try {
      setRecentLoading(true);

      if (!token || !officeCode) return;

      const response = await fetch(
        `${baseUrl}/recentlyUpdated?OfficeCode=${officeCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(item => item.DocumentType && !item.DocumentType.startsWith('SLP'));
        setRecentlyUpdatedData(filteredData);
        setRecentlyUpdatedLength(filteredData.length);
      } else {
        throw new Error('Failed to fetch Recently Updated data');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error during data fetching Recently Updated:', error.message);
    } finally {
      setRecentLoading(false);
    }
  }, [token, officeCode]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    fetchRecentlyUpdatedData();
  }, [token, officeCode, fetchRecentlyUpdatedData]);

  useEffect(() => {
    const fetchUpdatedNow = async () => {
      try {
        setRecentLoading(true);

        if (!token || !officeCode) return;

        const response = await fetch(
          `${baseUrl}/updatedNow?OfficeCode=${officeCode}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setUpdatedNowData(data[0].Count);
          setUpdatedDateTime(data[0].LatestDateModified);
        } else {
          throw new Error('Failed to fetch UpdatedNow data');
        }
      } catch (error) {
        setError(error.message);
        console.error('Error during data fetching UpdatedNow:', error.message);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchUpdatedNow();
  }, [token, officeCode]);

  useEffect(() => {
    if (!officeCode) return;
  
    // Initialize the socket connection
    socketRef.current = io('http://122.2.27.45:3308', {
      query: { officeCode },
    });
  
    // Handle socket connection
    socketRef.current.on('connect', () => {
     /*  console.log('Connected to socket server'); */
    });
  
    // Handle updatedNowData event
 socketRef.current.on('updatedNowData', (data) => {
      // Check if the officeCode in the data matches the client's officeCode
      if (data.officeCode === officeCode) {
        console.log('OC', data.officeCode);
        console.log('frmUpdate', data.Count);
        console.log(data);

        // Extract the Count value correctly
        const countValue = data.Count && data.Count[0] && data.Count[0].Count;
        const dateValue = data.Count && data.Count[0] && data.Count[0].LatestDateModified;
        setUpdatedNowData(countValue);
        setUpdatedDateTime(dateValue)

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-CA'); // "2024-05-21"
        const formattedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }); // "12:38 PM"
  
        const currentDateTime = `${formattedDate} ${formattedTime}`;
  
        console.log('Date and Time:', currentDateTime);

        /* setUpdatedDateTime(updatedDateTime) */
      }
    });


    // Handle socket disconnection
    socketRef.current.on('disconnect', () => {
     /*  console.log('Disconnected from socket server'); */
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [officeCode]);

  return {
    recentlyUpdatedData,
    updatedNowData,
    recentlyUpdatedLength,
    updatedDateTime,
    officeCode,
    recentLoading,
    token,
    error,
    fetchRecentlyUpdatedData,
  };
};

export default useRecentlyUpdated;
