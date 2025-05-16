import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from './apiClient';

async function updateQRDataADV({ year, trackingNumber, adv1 }) {
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
        const message = error?.response?.data?.message || 'Failed to update ADV number.';
        throw new Error(message);
    }
}

export const useUpdateQRDataADV = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateQRDataADV,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['qrData', variables.year, variables.trackingNumber],
            });

            queryClient.refetchQueries(['qrData', variables.year, variables.trackingNumber]);
        }
    });
};


async function updateQRDataOBR({ year, trackingNumber, obrNumber }) {
    console.log(year, trackingNumber, obrNumber)
    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Authorization token is missing');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const headers = await getAuthHeaders();
    const apiUrl = `/updateOBRNumber?year=${year}&tn=${trackingNumber}&obr=${obrNumber}`;

    try {
        const response = await apiClient.get(apiUrl, { headers });
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.message || 'Failed to update OBR number.';
        throw new Error(message);
    }
}

export const useUpdateQRDataOBR = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateQRDataOBR,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['qrData', variables.year, variables.trackingNumber],
            });

            queryClient.refetchQueries(['qrData', variables.year, variables.trackingNumber]);
        }
    });
};







