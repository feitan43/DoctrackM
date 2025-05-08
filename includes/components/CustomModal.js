import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

export default function CustomModal({ visible, onRequestClose, children }) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onRequestClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Image
                        style={{ width: 185, height: 150 }}
                        // source={require('../../assets/images/errorState.png')}
                        source={require('../../assets/images/errorState.png')}
                    />
                    <Text style={styles.modalText}>
                        {children}
                    </Text>
                    <TouchableOpacity onPress={onRequestClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        marginVertical: 20,
        fontFamily: 'Oswald-Regular',
    },
    closeButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(8, 106, 235, 1)',
        paddingVertical: 10,
        paddingHorizontal: 90,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 14,
    },
});
