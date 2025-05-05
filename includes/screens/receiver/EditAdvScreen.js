import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useUpdateQRData } from '../../api/useUpdateQRData';
import Icon from 'react-native-vector-icons/Ionicons';

const EditAdvScreen = ({ route }) => {
    const navigation = useNavigation();
    const { item } = route.params;

    const { mutateAsync, isPending } = useUpdateQRData();
    const advNumber = item?.ADV1 || '';
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
           
            await mutateAsync({
                year,
                trackingNumber,
                adv1: newAdvNumber,
            });
            navigation.goBack(); 
        } catch (error) {
           
            if (error.message) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
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
                    TrackingNumber - {trackingNumber === '0' ? 'n/a' : trackingNumber}
                </Text>
            </View>

            <View style={styles.contentContainer}>
                <TextInput
                    mode="outlined"
                    label="ADV Number"
                    value={newAdvNumber}
                    onChangeText={setNewAdvNumber}
                    style={styles.textInput}
                    keyboardType="numeric"
                    error={error !== ''}
                />
                {error !== '' && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                <Button
                    mode="contained"
                    loading={isPending}
                    disabled={isPending}
                    onPress={handleSubmit}
                    style={styles.saveButton}
                >
                    Save
                </Button>
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
    textInput: {
        marginVertical: 10,
        backgroundColor: 'transparent',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
    },
    saveButton: {
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: '#007bff',
    },
});

export default EditAdvScreen;
