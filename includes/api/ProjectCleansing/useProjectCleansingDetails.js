import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config';

const useProjectCleansingDetails = ({ barangay, title, office, status, inspected, fund }) => {
    const [projectCleansingDetails, setProjectCleansingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjectCleansingDetails = useCallback(async () => {
        try {
            setLoading(true);
            const storedToken = await AsyncStorage.getItem('token');

            // Handle undefined or empty parameters
            const formattedBarangay = barangay ? encodeURIComponent(barangay) : '';
            const formattedTitle = title ? encodeURIComponent(title) : '';
            const formattedOffice = office ? encodeURIComponent(office) : '';
            const formattedStatus = status ? encodeURIComponent(status) : '';
            const formattedInspected = inspected ? encodeURIComponent(inspected) : '';
            const formattedFund = fund ? encodeURIComponent(fund) : '';

            const response = await fetch(
                `${BASE_URL}/projectCleansingDetails?Barangay=${formattedBarangay}&Title=${formattedTitle}&Office=${formattedOffice}&Status=${formattedStatus}&Inspected=${formattedInspected}&Fund=${formattedFund}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            //console.log('Response:', response);

            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }

            const data = await response.json();
            setProjectCleansingDetails(data);
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [barangay, title, office, status, inspected, fund]);

    useEffect(() => {
        fetchProjectCleansingDetails();
    }, [fetchProjectCleansingDetails]);

    return { projectCleansingDetails, loading, error };
};

export default useProjectCleansingDetails;
