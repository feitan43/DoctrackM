import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';

import BASE_URL from '../../config';

const useTransactionHistory = (selectedItem) => {
  const [transactionsHistory, setTransactionsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        const storedToken = await AsyncStorage.getItem('token');

        const apiUrl = `${BASE_URL}/transactionHistory?TrackingNumber=${selectedItem.TrackingNumber}&Year=${selectedItem.Year}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactionsHistory(data);
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error in TransactionHistory:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedItem) fetchTransactionHistory();
  }, [selectedItem]);

  return { transactionsHistory, loading, error };
};

export default useTransactionHistory;
