import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, ImageBackground, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const MonthlyReceivedScreen = ({ navigation, route }) => {
    const { receivedMonthly = [], selectedYear, allMonthsData = {} } = route.params || {};

    const [selectDate, setSelectDate] = useState(null);

    const receivedData = receivedMonthly.reduce((acc, item) => {
        acc[item.Month] = {
            count: item.Count,
            documentType: item.DocumentType || "N/A",
            fund: item.Fund || "N/A",
            totalAmount: item.TotalAmount || 0
        };
        return acc;
    }, {});

    console.log('Received Data: ', receivedData);

    const MONTHS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyData = MONTHS.map((month) => ({
        month,
        count: receivedData[month]?.count || 0,
        documentType: receivedData[month]?.documentType || "N/A",
        fund: receivedData[month]?.fund || "N/A",
        totalAmount: receivedData[month]?.totalAmount || 0,
    }));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <ImageBackground
                    source={require('../../../assets/images/CirclesBG.png')}
                    style={styles.bgHeader}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Monthly Received - {selectedYear}</Text>
                    </View>
                </ImageBackground>

                <ScrollView >
                    <View style={styles.contentWrapper}>
                        <View style={styles.gridContainer}>
                            {monthlyData.map((item, index) => (
                                <Pressable
                                    key={index}
                                    style={({ pressed }) => [
                                        styles.monthButton,
                                        selectDate === item.month && styles.selectedMonthButton,
                                        pressed && styles.pressedMonthButton
                                    ]}
                                    onPress={() => setSelectDate(selectDate === item.month ? null : item.month)}
                                >
                                    <Card.Content style={styles.cardContent}>
                                        <Text style={[styles.monthText, selectDate === item.month && styles.selectedText]}>
                                            {item.month}
                                        </Text>
                                        <Text style={[styles.countText, selectDate === item.month && styles.selectedText]}>
                                            {item.count}
                                        </Text>
                                    </Card.Content>
                                </Pressable>
                            ))}
                        </View>

                        {selectDate && (
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailsTitle}>{selectDate} {selectedYear} Details</Text>
                                <View style={{}}>
                                    {(allMonthsData[selectDate]?.Data || []).map((item, index) => (
                                        <View key={index} style={styles.dataRow}>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>
                                                    TrackingNumber:
                                                </Text>
                                                <Text style={styles.value}>
                                                    {item.TrackingNumber || 'n/a'}
                                                </Text>
                                            </View>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>
                                                    DocumentType:
                                                </Text>
                                                <Text style={styles.value}>
                                                    {item.DocumentType || 'n/a'}
                                                </Text>
                                            </View>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>
                                                    Fund:
                                                </Text>
                                                <Text style={styles.value}>
                                                    {item.Fund || 'n/a'}
                                                </Text>
                                            </View>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>
                                                    Amount:
                                                </Text>
                                                <Text style={styles.value}>
                                                    {item.Amount || 'n/a'}
                                                </Text>
                                            </View>
                                            {/* <Text style={styles.detailsText}>Tracking Number: {item.TrackingNumber || 'n/a'}</Text>
                                            <Text style={styles.detailsText}>Document Type: {item.DocumentType || 'n/a'}</Text>
                                            <Text style={styles.detailsText}>Fund: {item.Fund || 'n/a'}</Text>
                                            <Text style={styles.detailsText}>Amount: {item.Amount || 'n/a'}</Text> */}
                                        </View>
                                    ))}
                                </View>
                            </View>

                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgHeader: {
        paddingTop: 30,
        height: 80,
        backgroundColor: '#1a508c',
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    backButton: {
        position: 'absolute',
        left: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    contentWrapper: {
        flex: 1,
        padding: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '30%',
        marginVertical: 10,
        paddingVertical: 3,
        marginBottom: 10,
        borderRadius: 5,
        elevation: 0,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectedCard: {
        backgroundColor: '#cce5ff',
        borderColor: '#007bff',
    },
    cardContent: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    monthText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    countText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff'
    },
    monthButton: {
        width: '30%',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
        borderRadius: 5,
        elevation: 1,
        backgroundColor: '#ffffff',
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: 'silver',
        borderRightColor: 'silver',
    },
    selectedMonthButton: {
        borderBottomWidth: 2,
        borderRightWidth: 2,
        backgroundColor: '#007bff',
        borderBottomColor: 'silver',
        borderRightColor: 'silver',
    },
    pressedMonthButton: {
        backgroundColor: '#007bff',
    },
    selectedText: {
        color: '#ffffff',
    },
    detailsContainer: {
        marginTop: 20,
        padding: 15,
        // backgroundColor: '#f8f9fa',
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5
    },
    dataRow: {
        backgroundColor: '#F3F3F3',
        borderRadius: 8,
        padding: 10,
        marginTop: 8
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingBottom: 10,
        // paddingStart: 10,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    label: {
        width: '35%',
        paddingStart: 10,
        fontSize: 14,
        fontFamily: 'Oswald-Light',
        opacity: 0.6,
    },
    value: {
        width: '70%',
        fontSize: 14,
        fontFamily: 'Oswald-Regular',
        marginStart: 10,
    },
    detailsText: {
        fontSize: 16,
        // color: '#007bff',
        marginTop: 0,
    },
});

export default MonthlyReceivedScreen;
