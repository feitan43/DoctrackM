/* import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import axios from 'axios';

import BASE_URL from '../../config';

const useInspection = () => {
  const [data, setData] = useState(null);
  const [dataItems, setDataItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accountType, employeeNumber, officeCode } = useUserInfo();
  const [inspectLoading, setInspectionLoading] = useState(true);
  const [inspectError, setInspectError] = useState(null);
  const [inspectionListData, setInspectionListData] = useState(null);
  const [forInspection, setForInspection] = useState(null);
  const [inspected, setInspected] = useState(null);
  const [inspectionOnHold, setInspectionOnHold] = useState(null);

  const [inspectionListLoading, setInspectionListLoading] = useState(true);

  const [recentActivityData, setRecentActivityData] = useState(null);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);
  const [recentActivityError, setRecentActivityError] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    inspectionList(signal);
    recentActivity(signal);

    return () => {
      controller.abort(); 
    };
  }, [employeeNumber]);


  const fetchInspectionDetails = async (year, trackingNumber) => {
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/genInformation?Year=${year}&TrackingNumber=${trackingNumber}&accountType=${accountType}&officeCode=${officeCode}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000, 
      });
      setData(response.data);
    } catch (err) {
      setError('Error fetching inspection details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionItems = async (year, trackingNumber) => {
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/getInspectionItems?year=${year}&trackingNumber=${trackingNumber}&accountType=${accountType}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000, 
      });
      setDataItems(response.data);
    } catch (err) {
      setError('Error fetching inspection items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inspectItems = async (year, trackingNumber, inspectionStatus, remarks) => {
    
    if (!trackingNumber || !inspectionStatus)
      return { success: false, message: 'Tracking number and status are required.' };

    setInspectionLoading(true);
    setInspectError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/inspectItems`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000, 
        params: {
          year,
          trackingNumber,
          employeeNumber,
          accountType,
          status: inspectionStatus,
          remarks,
        },
      });

      const data = response.data;

      if (response.status === 200 && data.status === 'success') {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || `Failed with status ${response.status}` };
      }
    } catch (err) {
      console.error('Fetch error:', err);
      return { success: false, message: 'Error fetching inspection details: ' + err.message };
    } finally {
      setInspectionLoading(false);
    }
  };

  const recentActivity = async (signal) => {
    if (!employeeNumber) return;

    setRecentActivityLoading(true);
    setRecentActivityError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/getRecentActivity`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        params: { employeeNumber },
        signal, // Pass signal to allow cancellation
      });

      setRecentActivityData(response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else {
        setRecentActivityError('Error fetching recent activity: ' + err.message);
        setRecentActivityData(null);
      }
    } finally {
      setRecentActivityLoading(false);
    }
  };

  const inspectionList = async (signal) => {
    if (!employeeNumber) {
      return;
    }

    // Abort any ongoing request before making a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signalObj = abortControllerRef.current.signal;

    setInspectionListLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      abortControllerRef.current.abort(); // Cancel the request if it takes too long
    }, 5000);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/getInspectionList`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        params: { employeeNumber },
        signal: signalObj, // Pass signal to allow request cancellation
        responseType: 'json',
      });

      const data = response.data;

      if (data.message === 'No records found') {
        setInspectionListData(null);
      } else {
        setInspectionListData(data);

        setForInspection(
          data.filter((item) => item.Status === 'For Inspection' && item.TrackingPartner).length || 0
        );

        setInspectionOnHold(
          data.filter(
            (item) =>
              ['Inspection on hold', 'Inspection On Hold'].includes(item.Status) &&
              item.TrackingPartner
          ).length || 0
        );

        setInspected(
          data.filter(
            (item) =>
              item.DateInspected?.trim() &&
              !['for inspection', 'inspection on hold'].includes(item.Status?.trim().toLowerCase())
          ).length || 0
        );
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request aborted:', err.message);
        setError('Request was canceled.');
      } else {
        console.error('API Error:', err);
        setError(err.response?.data?.message || 'Error fetching inspection list: ' + err.message);
      }
      setInspectionListData(null);
    } finally {
      clearTimeout(timeout);
      setInspectionListLoading(false);
    }
  };

  return {
    data,
    setData,
    dataItems,
    setDataItems,
    loading,
    setLoading,
    inspectLoading,
    inspectionListLoading,
    inspectionListData,
    forInspection,
    inspected,
    inspectionOnHold,
    error,
    inspectError,
    recentActivity,
    recentActivityLoading,
    recentActivityData,
    recentActivityError,
    fetchInspectionDetails,
    fetchInspectionItems,
    inspectItems,
    inspectionList,
  };
};

export default useInspection; */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import axios from 'axios';

import BASE_URL from '../../config';

const useInspection = () => {
  const [data, setData] = useState(null);
  const [dataItems, setDataItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accountType, employeeNumber, officeCode } = useUserInfo();
  const [inspectLoading, setInspectionLoading] = useState(true);
  const [inspectError, setInspectError] = useState(null);
  const [inspectionListData, setInspectionListData] = useState(null);
  const [forInspection, setForInspection] = useState(null);
  const [inspected, setInspected] = useState(null);
  const [inspectionOnHold, setInspectionOnHold] = useState(null);

  const [inspectionListLoading, setInspectionListLoading] = useState(true);

  useEffect(() => {
    inspectionList();
  }, [employeeNumber]);

  const fetchInspectionDetails = async (year, trackingNumber) => {
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/genInformation?Year=${year}&TrackingNumber=${trackingNumber}&accountType=${accountType}&officeCode=${officeCode}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      setData(response.data);
    } catch (err) {
      setError('Error fetching inspection details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionItems = async (year, trackingNumber) => {
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/getInspectionItems?year=${year}&trackingNumber=${trackingNumber}&accountType=${accountType}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      setDataItems(response.data);
    } catch (err) {
      setError('Error fetching inspection items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inspectItems = async (year, trackingNumber, inspectionStatus, remarks) => {
    if (!trackingNumber || !inspectionStatus)
      return { success: false, message: 'Tracking number and status are required.' };

    setInspectionLoading(true);
    setInspectError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/inspectItems`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
        params: {
          year,
          trackingNumber,
          employeeNumber,
          accountType,
          status: inspectionStatus,
          remarks,
        },
      });

      const data = response.data;

      if (response.status === 200 && data.status === 'success') {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || `Failed with status ${response.status}` };
      }
    } catch (err) {
      console.error('Fetch error:', err);
      return { success: false, message: 'Error fetching inspection details: ' + err.message };
    } finally {
      setInspectionLoading(false);
    }
  };

  const inspectionList = async () => {
    if (!employeeNumber) {
      return;
    }

    setInspectionListLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      const apiUrl = `${BASE_URL}/getInspectionList`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        params: { employeeNumber },
        responseType: 'json',
      });

      const data = response.data;

      if (data.message === 'No records found') {
        setInspectionListData(null);
      } else {
        setInspectionListData(data);

        setForInspection(
          data.filter((item) => item.Status === 'For Inspection' && item.TrackingPartner).length || 0
        );

        setInspectionOnHold(
          data.filter(
            (item) =>
              ['Inspection on hold', 'Inspection On Hold'].includes(item.Status) &&
              item.TrackingPartner
          ).length || 0
        );

        setInspected(
          data.filter(
            (item) =>
              item.DateInspected?.trim() &&
              !['for inspection', 'inspection on hold'].includes(item.Status?.trim().toLowerCase())
          ).length || 0
        );
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Error fetching inspection list: ' + err.message);
      setInspectionListData(null);
    } finally {
      setInspectionListLoading(false);
    }
  };

  return {
    data,
    setData,
    dataItems,
    setDataItems,
    loading,
    setLoading,
    inspectLoading,
    inspectionListLoading,
    inspectionListData,
    forInspection,
    inspected,
    inspectionOnHold,
    error,
    inspectError,
    fetchInspectionDetails,
    fetchInspectionItems,
    inspectItems,
    inspectionList,
  };
};

export default useInspection;
