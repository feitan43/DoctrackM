import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';

const useRequestInspection = (initialYear = 2024) => {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [requests, setRequests] = useState([]);
  const [requestsLength, setRequestsLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null); 

    try {
      const response = await axios.get(`${BASE_URL}/requestForInspection`, {
        params: { Year: selectedYear },
      });
      setRequests(response.data);
      setRequestsLength(response.data.length);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests.');
      setRequests([]);
      setRequestsLength(0);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { selectedYear, setSelectedYear, requests, requestsLength, loading, error, fetchRequests };
};

export default useRequestInspection;


