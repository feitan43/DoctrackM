import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';

const useInspectors = () => {
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInspectors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/inspectionInspectors`);
      setInspectors(response.data);
    } catch (err) {
      setError('Failed to load inspectors');
    } finally {
      setLoading(false);
    }
  };

  const [assignedInspector, setAssignedInspector] = useState(null); 

  const assignInspector = async (id, inspectorEmp, inspectorName) => {
    setLoading(true);
    try {
      const apiUrl = `${BASE_URL}/assignInspector`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
        params: {
          id,
          inspectorEmp,
          inspectorName,
        },
      });
  
      setAssignedInspector(response.data); 
      return response.data; 
    } catch (err) {
      setError('Failed to assign inspector');
      return { success: false, message: 'Failed to assign inspector' };
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchInspectors();
  }, []);

  return { inspectors, loading, error, assignInspector, assignedInspector };
};

export default useInspectors;
