import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useUpdateQRData } from '../../api/useUpdateQRData';
import Icon from 'react-native-vector-icons/Ionicons';
import useGetQRData from '../../api/useGetQRData';

const EditAdvScreen = ({ route }) => {
    const navigation = useNavigation();
    const { item } = route.params;

    const { mutateAsync, isPending } = useUpdateQRData();
    const advNumber = item?.ADV1 === '0' ? 'n/a' : item?.ADV1 || '';
    const year = item?.Year;
    const trackingNumber = item?.TrackingNumber;
    const [newAdvNumber, setNewAdvNumber] = useState(advNumber);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        if (newAdvNumber === '' || newAdvNumber === 'n/a' || isNaN(newAdvNumber)) {
            setError('Please enter a valid ADV Number');
            return;
        }

        try {
            const payload = {
                year,
                trackingNumber,
                adv1: newAdvNumber,
            };
            await mutateAsync(payload);
            navigation.goBack();
        } catch (err) {
            console.error('Failed to update ADV1:', err);
            setError('Failed to update. Please try again.');
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [
                        pressed && { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
                        {
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 24,
                        },
                    ]}
                    android_ripple={{
                        color: '#F6F6F6',
                        borderless: true,
                        radius: 24,
                        foreground: true,
                    }}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="gray" />
                </Pressable>
                <Text style={styles.title}>
                    Edit - {newAdvNumber === '0' ? 'n/a' : newAdvNumber}
                </Text>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.label}>ADV Number:</Text>
                <TextInput
                    label="ADV Number"
                    value={newAdvNumber}
                    onChangeText={setNewAdvNumber}
                    style={styles.textInput}
                    keyboardType="numeric"
                    error={error !== ''}
                />
                {error !== '' && (
                    <Text style={{ color: 'red', fontSize: 12 }}>{error}</Text>
                )}

                <Pressable onPress={handleSubmit} disabled={isPending}>
                    <Text style={styles.saveButton}>{isPending ? 'Saving...' : 'Save'}</Text>
                </Pressable>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 30,
        height: 80,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    contentContainer: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textInput: {
        marginVertical: 10,
        backgroundColor: 'transparent',
    },
    saveButton: {
        color: '#0A3480',
        fontWeight: 'bold',
        marginTop: 20,
    },
});

export default EditAdvScreen;
