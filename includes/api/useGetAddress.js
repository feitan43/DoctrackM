import {useEffect, useState} from 'react';

const useGetAddress = () => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchAddress();
  },[])

  const fetchAddress = async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      setAddress(data.display_name);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {fetchAddress, address, loading, error};
};

export default useGetAddress;
