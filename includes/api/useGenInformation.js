import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseUrl from '../../config';

const useGenInformation = (selectedItemIndex, regOfficeDelaysData) => {
  const [genInformationData, setGenInformationData] = useState(null);
  const [genInfoLoading, setGenInfoLoading] = useState(true);
  
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const [OBRInformation, setOBRInformation] = useState(null);
  const [OBRInfoLoading, setOBRInfoLoading] = useState(true);

  const [salaryList, setSalaryList] = useState(null);
  const [salaryListLoading, setSalaryListLoading] = useState(true);

  const [transactionHistory, setTransactionHistory] = useState(null);
  const [transactionHistoryLoading, setTransactionHistoryLoading] =
    useState(true);

  const [prpopxDetails, setPRPOPXDetails] = useState(null);
  const [prpopxLoading, setPRPOPXLoading] = useState(true);

  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [paymentBreakdownLoading, setPaymentBreakdownLoading] = useState(true);

  const [paymentHistory, setPaymentHistory] = useState(null);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);

  const [computationBreakdown, setComputationBreakdown] = useState(null);
  const [computationBreakdownLoading, setComputationBreakdownLoading] = useState(true);


/*   useEffect(() => {
    console.log(regOfficeDelaysData)
  }, [selectedItemIndex, regOfficeDelaysData]);
 */
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
        

        const apiUrl = `${baseUrl}/genInformation?Year=${Year}&TrackingNumber=${TrackingNumber}`;

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



        const apiUrl = `${baseUrl}/obrInformation?Year=${Year}&TrackingNumber=${TrackingNumber}`;

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

        const apiUrl = `${baseUrl}/salaryList?Year=${Year}&TrackingNumber=${TrackingNumber}`;

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
      console.error('Error in fetch Salary List:', error);
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

        const apiUrl = `${baseUrl}/transactionHistory?TrackingNumber=${TrackingNumber}&Year=${Year}`;

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
        regOfficeDelaysData.DocumentType 

      ) {
        const {TrackingNumber, Year, DocumentType} = regOfficeDelaysData;

        let newTracking = '';
        switch (DocumentType) {
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
            // console.log('Unknown DocumentType:', DocumentType);
            return;
        }

        const apiUrl = `${baseUrl}/prpopxDetails?Year=${Year}&TrackingNumber=${TrackingNumber}&TrackingType=${newTracking}`;

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

  const fetchPaymentBreakdown = async (trackingType) => {
    try {
      setPaymentBreakdownLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year &&
        regOfficeDelaysData.DocumentType &&
        trackingType
      ) {
        if (regOfficeDelaysData.DocumentType !== 'Payment') {
          return;
        }
  
        const {TrackingNumber, Year} = regOfficeDelaysData;
  
        const apiUrl = `${baseUrl}/paymentBreakdown?Year=${Year}&TrackingType=${trackingType}&TrackingNumber=${TrackingNumber}`;
  
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
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in fetchPaymentBreakdown:', error);
      setError(error.message);
    } finally {
      setPaymentBreakdownLoading(false);
    }
  };
  
/*   useEffect(() => {
    if (genInformationData && genInformationData.TrackingType) {
      fetchPaymentBreakdown(genInformationData.TrackingType);
    }
  }, [genInformationData]); */

 /*  const fetchPaymentHistory = async (trackingType) => {
    try {
      setPaymentHistoryLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year &&
        regOfficeDelaysData.DocumentType
      ) {
        if (regOfficeDelaysData.DocumentType !== 'Purchase Order') {
          return;
        }
  
        const { TrackingNumber, Year } = regOfficeDelaysData;
  
        const apiUrl = `${baseUrl}/paymentHistory?Year=${Year}&TrackingType=${trackingType}&TrackingNumber=${TrackingNumber}`;
  
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
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in paymenthistory:', error);
      setError(error.message);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (genInformationData && genInformationData.TrackingType) {
      fetchPaymentBreakdown(genInformationData.TrackingType);
    }
  }, [genInformationData]); */
  
  useEffect(() => {
    if (genInformationData && genInformationData.TrackingType) {
      fetchPaymentBreakdown(genInformationData.TrackingType);
    }
  }, [genInformationData]);
  
  const fetchPaymentHistory = async (trackingType) => {
    try {
      setPaymentHistoryLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
  
      if (
        selectedItemIndex !== null &&
        regOfficeDelaysData &&
        regOfficeDelaysData.TrackingNumber &&
        regOfficeDelaysData.Year &&
        regOfficeDelaysData.DocumentType &&
        trackingType
      ) {
        if (regOfficeDelaysData.DocumentType !== 'Purchase Order') {
          return;
        }
  
        const { TrackingNumber, Year } = regOfficeDelaysData;
  
        const apiUrl = `${baseUrl}/paymentHistory?Year=${Year}&TrackingType=${trackingType}&TrackingNumber=${TrackingNumber}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          

          // Skip if data is null or 0
          if (!data || data.length === 0) {
            return;
          }
  
          setPaymentHistory(data);
        } else {
          const errorText = await response.text();
          console.error(`Failed to fetch data. Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error in paymenthistory:', error);
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
        regOfficeDelaysData.DocumentType
      ) {
        if (regOfficeDelaysData.DocumentType !== 'Payment') {
          return;
        }
  
        const { TrackingNumber, Year } = regOfficeDelaysData;
  
        const apiUrl = `${baseUrl}/computationBreakdown?Year=${Year}&TrackingNumber=${TrackingNumber}`;
  
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
    token,
    error,
  };
};

export default useGenInformation;
