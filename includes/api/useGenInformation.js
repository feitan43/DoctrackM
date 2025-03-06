import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserInfo from './useUserInfo';
import BASE_URL from '../../config';

const useGenInformation = (selectedItemIndex, regOfficeDelaysData) => {
  const [genInformationData, setGenInformationData] = useState(null);
  const [genInfoLoading, setGenInfoLoading] = useState(true);
  const {accountType, officeCode} = useUserInfo();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [OBRInformation, setOBRInformation] = useState(null);
  const [OBRInfoLoading, setOBRInfoLoading] = useState(true);
  const [salaryList, setSalaryList] = useState(null);
  const [salaryListLoading, setSalaryListLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState(null);
  const [transactionHistoryLoading, setTransactionHistoryLoading] = useState(true);
  const [prpopxDetails, setPRPOPXDetails] = useState(null);
  const [prpopxLoading, setPRPOPXLoading] = useState(true);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [paymentBreakdownLoading, setPaymentBreakdownLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);
  const [computationBreakdown, setComputationBreakdown] = useState(null);
  const [computationBreakdownLoading, setComputationBreakdownLoading] = useState(true);

  useEffect(() => {
    //const timer = setTimeout(() => {
      fetchGenInformation();
      fetchOBRInformation();
      fetchSalaryList();
      fetchTransactionHistory();
      fetchPRPOPXDetails();
      fetchPaymentBreakdown();
      fetchPaymentHistory();
      fetchComputationBreakdown();
   // }, 500); 

   // return () => clearTimeout(timer);
  }, [selectedItemIndex, regOfficeDelaysData]);

  const fetchGenInformation = async () => {
    try {
      setGenInfoLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year
      ) {
        const {TrackingNumber, Year} = regOfficeDelaysData;
        

        const apiUrl = `${BASE_URL}/genInformation?Year=${Year}&TrackingNumber=${TrackingNumber}&accountType=${accountType}&office=${officeCode}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGenInformationData(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in fetchGenInformation:', error);
      setError(error.message);
    } finally {
      setGenInfoLoading(false);
    }
  };

  const fetchOBRInformation = async () => {
    try {
      setOBRInfoLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);


      if(regOfficeDelaysData === null){
        return;
      }

      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year
      ) {
        const {TrackingNumber, Year} = regOfficeDelaysData;



        const apiUrl = `${BASE_URL}/obrInformation?Year=${Year}&TrackingNumber=${TrackingNumber}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOBRInformation(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in fetchOBRInformation:', error);
      setError(error.message);
    } finally {
      setOBRInfoLoading(false);
    }
  };

  const fetchSalaryList = async () => {
    try {
      setSalaryListLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year
      ) {
        const {TrackingNumber, Year} = regOfficeDelaysData;

        const apiUrl = `${BASE_URL}/salaryList?Year=${Year}&TrackingNumber=${TrackingNumber}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSalaryList(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      //console.error('Error in fetch Salary List:', error);
      setError(error.message);
    } finally {
      setSalaryListLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      setTransactionHistoryLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year
      ) {
        const {TrackingNumber, Year} = regOfficeDelaysData;

        const apiUrl = `${BASE_URL}/transactionHistory?TrackingNumber=${TrackingNumber}&Year=${Year}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactionHistory(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in TransactionHistory:', error);
      setError(error.message);
    } finally {
      setTransactionHistoryLoading(false);
    }
  };

  const fetchPRPOPXDetails = async () => {
    try {
      setPRPOPXLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year &&
        (regOfficeDelaysData.DocumentType || regOfficeDelaysData.TrackingType) // Ensure at least one exists
      ) {
        const {TrackingNumber, Year, DocumentType, TrackingType} = regOfficeDelaysData;
  
        let newTracking = '';
        if (TrackingType === 'PR' || TrackingType === 'PO' || TrackingType === 'PX') {
          newTracking = TrackingType;
        } else {
         return;
        }
  
        // Use DocumentType first, fall back to TrackingType if DocumentType doesn't match
     /*    switch (DocumentType) {
          case 'Purchase Request':
            newTracking = 'PR';
            break;
          case 'Purchase Order':
            newTracking = 'PO';
            break;
          case 'Payment':
            newTracking = 'PX';
            break;
          default:
            // Fallback to using TrackingType if DocumentType doesn't match
         
        } */
  
        const apiUrl = `${BASE_URL}/prpopxDetails?Year=${Year}&TrackingNumber=${TrackingNumber}&TrackingType=${newTracking}`;
  
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setPRPOPXDetails(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in fetchPRPOPXDetails:', error);
      setError(error.message);
    } finally {
      setPRPOPXLoading(false);
    }
  };

  const fetchPaymentBreakdown = async () => {
    try {
      setPaymentBreakdownLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year &&
        (regOfficeDelaysData.DocumentType || regOfficeDelaysData.TrackingType)
      ) {
       /*  if (regOfficeDelaysData.DocumentType !== 'Payment') {
          return;
        } */
  
        const {TrackingNumber, Year, TrackingType} = regOfficeDelaysData;

        const apiUrl = `${BASE_URL}/paymentBreakdown?Year=${Year}&TrackingType=${TrackingType}&TrackingNumber=${TrackingNumber}`;
  
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setPaymentBreakdown(data);
        } else {
          throw new Error(`Failed to fetchPaymentBreakdown. Status: ${response.status}`);
        }
      }
    } catch (error) {
      setPaymentBreakdown(null);
      //console.error('Error in fetchPaymentBreakdown:', error);
      setError(error.message);
    } finally {
      setPaymentBreakdownLoading(false);
    }
  };
  
  const fetchPaymentHistory = async () => {
    try {
      setPaymentHistoryLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if(regOfficeDelaysData === null){
        return;
      }
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year
      ) {
        const {TrackingNumber, Year} = regOfficeDelaysData;
  
        const apiUrl = `${BASE_URL}/paymentHistory?Year=${Year}&TrackingNumber=${TrackingNumber}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setPaymentHistory(data);
        } else {
          //throw new Error(`Failed to paymenthistory. Status: ${response.status}`);
          setPaymentHistory(null);

        }
      }
    } catch (error) {
      setPaymentHistoryLoading(false);
      setPaymentHistory(null);
      //console.error('Error in paymenthistory:', error);
      setError(error.message);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  const fetchComputationBreakdown = async () => {
    try {
      setComputationBreakdownLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year &&
        (regOfficeDelaysData.DocumentType || regOfficeDelaysData.TrackingType)
      ) {
        /* if (regOfficeDelaysData.DocumentType !== 'Payment') {
          return;
        } */
  
        const { TrackingNumber, Year } = regOfficeDelaysData;
  
        const apiUrl = `${BASE_URL}/computationBreakdown?Year=${Year}&TrackingNumber=${TrackingNumber}`;
  
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setComputationBreakdown(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in fetchComputationBreakdown:', error);
      setError(error.message);
    } finally {
      setComputationBreakdownLoading(false);
    }
  };


  useEffect(() => {
    if (genInformationData && genInformationData.TrackingType) {
      fetchPaymentBreakdown(genInformationData.TrackingType);
    }
  }, [genInformationData]);

  return {
    genInformationData,
    genInfoLoading,
    OBRInformation,
    OBRInfoLoading,
    transactionHistory,
    transactionHistoryLoading,
    prpopxDetails,
    prpopxLoading,
    paymentBreakdown,
    paymentBreakdownLoading,
    paymentHistory,
    paymentHistoryLoading,
    computationBreakdown,
    computationBreakdownLoading,
    salaryList,
    salaryListLoading,
    fetchTransactionHistory,
    token,
    error,
  };
};

export default useGenInformation;
