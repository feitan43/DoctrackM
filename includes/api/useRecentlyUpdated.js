import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import io from 'socket.io-client';
import BASE_URL from '../../config';

const useRecentlyUpdated = () => {
  const [recentlyUpdatedData, setRecentlyUpdatedData] = useState(null);
  const [recentlyUpdatedLength, setRecentlyUpdatedLength] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const { officeCode, permission, privilege } = useUserInfo();
  const [updatedNowData, setUpdatedNowData] = useState(null);
  const [updatedDateTime, setUpdatedDateTime] = useState(null);
  const [recentLoading, setRecentLoading] = useState(false);
  const socketRef = useRef(null);

  const fetchToken = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const fetchRecentlyUpdatedData = useCallback(async () => {
    if (permission === '10' || permission === '11') return;
    try {
      setRecentLoading(true);

      if (!token || !officeCode) return;

      const response = await fetch(
        `${BASE_URL}/recentlyUpdated?OfficeCode=${officeCode}`,
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
  }, [token, officeCode, permission]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    fetchRecentlyUpdatedData();
  }, [token, officeCode, permission, fetchRecentlyUpdatedData]);

  useEffect(() => {
    const fetchUpdatedNow = async () => {
      if (permission === '10' || permission === '11') return; // Skip fetch for permission 10 or 11

      try {
        setRecentLoading(true);

        if (!token || !officeCode) return;

        const response = await fetch(
          `${BASE_URL}/updatedNow?OfficeCode=${officeCode}`,
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
      } finally {
        setRecentLoading(false);
      }
    };

    fetchUpdatedNow();
  }, [token, officeCode, permission]);

  useEffect(() => {
    if (!officeCode || permission === '10' || permission === '11') return; // Skip socket connection for permission 10 or 11

    socketRef.current = io('http://192.168.254.131:3308', {
      query: { officeCode },
    });

    socketRef.current.on('connect', () => { });

    socketRef.current.on('updatedNowData', (data) => {
      if (data.officeCode === officeCode) {
        console.log('OC', data.officeCode);
        console.log('frmUpdate', data.Count);
        console.log(data);

        const countValue = data.Count && data.Count[0] && data.Count[0].Count;
        const dateValue = data.Count && data.Count[0] && data.Count[0].LatestDateModified;
        setUpdatedNowData(countValue);
        setUpdatedDateTime(dateValue);

        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-CA'); // "2024-05-21"
        const formattedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const currentDateTime = `${formattedDate} ${formattedTime}`;
        console.log('Date and Time:', currentDateTime);
      }
    });

    socketRef.current.on('disconnect', () => { });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [officeCode, permission]);

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
