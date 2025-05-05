import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from './apiClient';

async function updateQRData({ year, trackingNumber, adv1 }) {
    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Authorization token is missing');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const headers = await getAuthHeaders();
    const apiUrl = `/updateAdvNumber?year=${year}&tn=${trackingNumber}&adv1=${adv1}`;

    try {
        const response = await apiClient.get(apiUrl, { headers });
        return response.data;
    } catch (error) {
        // ✅ Extract validation message from server response
        const message = error?.response?.data?.message || 'Failed to update ADV number.';
        // Re-throw with proper message to be caught in `onError`
        throw new Error(message);
    }
}

export const useUpdateQRData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateQRData,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['qrData', variables.year, variables.trackingNumber],
            });

            queryClient.refetchQueries(['qrData', variables.year, variables.trackingNumber]);
        }
    });
};
