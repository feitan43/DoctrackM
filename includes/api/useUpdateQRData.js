import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useGetQRData } from './useGetQRData';
import apiClient from './apiClient';
import { useState } from 'react';

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
    const response = await apiClient.get(apiUrl, { headers });
    return response.data;
}

export const useUpdateQRData = () => {
    const queryClient = useQueryClient();

    return {
        mutateAsync: useMutation({
            mutationFn: updateQRData,
            onSuccess: async (data, variables) => {
                const { year, trackingNumber } = variables;
                queryClient.invalidateQueries(['qrData', year, trackingNumber]);
            },
            onError: (error) => {
                console.error('Error updating ADV number:', error);
            },
        }).mutateAsync,
    };
};
