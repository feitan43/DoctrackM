import { useState, useEffect } from 'react';
import axios from 'axios';

const useAssignInspector = (id, inspectorEmp, inspectorName) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !inspectorEmp || !inspectorName) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = `${BASE_URL}/assignInspector?id=${id}&inspectorEmp=${inspectorEmp}&inspectorName=${inspectorName}`;
        const response = await axios.get(apiUrl);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, inspectorEmp, inspectorName]);

  return { data, loading, error };
};

export default useAssignInspector;
