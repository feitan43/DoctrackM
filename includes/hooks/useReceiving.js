import { useQuery } from '@tanstack/react-query';
import useUserInfo from '../api/useUserInfo.js';
import apiClient from '../api/apiClient.js';

export const useReceiving = () => {
    const { employeeNumber } = useUserInfo();

    const receivedMonthly = useQuery({
        queryKey: ['receivedMonthly', employeeNumber, selectedYear],
        queryFn: async () => {
            if (!employeeNumber || !selectedYear) return null;

            const storedToken = await AsyncStorage.getItem('token');
            if (!storedToken) throw new Error('Authorization token is missing');
            const apiUrl = `/receivedMonthly?EmployeeNumber=${employeeNumber}&Year=${selectedYear}`;
            const response = await apiClient.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data;
        },
        enabled: !!employeeNumber && !!selectedYear,
    });

    return {
        receivedMonthly
    }

};
