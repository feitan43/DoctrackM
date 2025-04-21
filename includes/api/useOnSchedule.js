import {useState, useEffect} from 'react';
import axios from 'axios';
import BASE_URL from '../../config';

const useOnSchedule = () => {
  const [data, setData] = useState([]);
  const [dataLength, setDataLength] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOnSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/onSchedule`);
      //const response = await axios.get(`https://davaocityportal.com/gord/ajax/dataprocessor.php?onSchedule`);
      setData(response.data);
      setDataLength(response.data.length); 
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOnSchedule();
  }, []);

  return {data, dataLength, loading, error, fetchOnSchedule}; 
};

export default useOnSchedule;
