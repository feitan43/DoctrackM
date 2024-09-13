import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseUrl from "../config";

const useUserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {

        const storedToken = await AsyncStorage.getItem("token");

        if (!storedToken) {
          return; // Exit early
        }

        setToken(storedToken);

        const response = await fetch(`${baseUrl}/userinfo`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserData(userData); 
        } else {
          console.error(
            "Failed to fetch user information: ",
            response.statusText
          );
          const responseBody = await response.json();
          setError(responseBody); 
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return { userData, token, error };
};

export default useUserInfo;
