import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';

const useSendNotifInspector = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendNotifInspector = async (TrackingNumber, Inspector) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/sendNotifInspector`, {
        TrackingNumber,
        Inspector,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to send notification');
      }

      const data = response.data;
      return data;

    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, sendNotifInspector };
};

export default useSendNotifInspector;
