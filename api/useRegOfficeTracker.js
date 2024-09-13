import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseUrl from "../config";
import useUserInfo from './useUserInfo';

const useRegOfficeTracker = () => {
  const [officeTrackerData, setOfficeTrackerData] = useState(null);
  const [officeCode, setOfficeCode] = useState();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const { userData } = useUserInfo();

  useEffect(() => {
    if (userData) {
      setOfficeCode(userData.OfficeCode);
    }
  }, [userData]);

  useEffect(() => {
    const fetchOfficeTrackerData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token'); 
        setToken(storedToken); 

        if (userData && userData.OfficeCode) {
          const response = await fetch(`${baseUrl}/fetchRegOfficeTracker?OfficeCode=${userData.OfficeCode}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setOfficeTrackerData(data);
          } else {
            throw new Error('Failed to fetch data');
          }
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchOfficeTrackerData();
  }, [userData]);

  return { officeTrackerData, officeCode, token, error };
};

export default useRegOfficeTracker;
