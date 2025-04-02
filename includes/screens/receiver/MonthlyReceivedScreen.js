import React, { useState, useMemo, useCallback } from 'react';
import { SafeAreaView, View, StyleSheet, ImageBackground, TouchableOpacity, Pressable, FlatList, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { Switch } from 'react-native-paper';
import { insertCommas } from '../../utils/insertComma';

const MonthlyReceivedScreen = ({ navigation, route }) => {
    const { receivedMonthly = [], selectedYear, allMonthsData = {}, allMonthsUniqueData = {} } = route.params || {};
    const [selectDate, setSelectDate] = useState(null);
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    console.log('allMonthsUniqueData', allMonthsUniqueData);
    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    const receivedData = useMemo(() => receivedMonthly.reduce((acc, item) => {
        acc[item.Month] = {
            count: item.Count,
            documentType: item.DocumentType || "N/A",
            fund: item.Fund || "N/A",
            totalAmount: item.TotalAmount || 0
        };
        return acc;
    }, {}), [receivedMonthly]);

    const MONTHS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyData = useMemo(() => MONTHS.map((month) => {
        const count = isSwitchOn ? allMonthsUniqueData[month]?.Count || 0 : receivedData[month]?.count || 0;
        console.log(`Month: ${month}, isSwitchOn: ${isSwitchOn}, Count: ${count}`);
        return {
            month,
            count: count,
            documentType: receivedData[month]?.documentType || "N/A",
            fund: receivedData[month]?.fund || "N/A",
            totalAmount: receivedData[month]?.totalAmount || 0,
        };
    }), [receivedData, isSwitchOn, allMonthsUniqueData]);


    console.log('monthlyData', monthlyData);


    const handleMonthPress = useCallback((month) => {
        setSelectDate(prevDate => prevDate === month ? null : month);
    }, []);

    const renderMonths = () => (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', top: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Accumulated / Unique</Text>
                <Switch
                    value={isSwitchOn}
                    onValueChange={onToggleSwitch}
                    trackColor={{ false: "#767577", true: "#B4B4B4" }}
                    thumbColor={isSwitchOn ? "#007bff" : "#fff"}
                    style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                />
            </View>

            <View style={styles.gridContainer}>
                {monthlyData.map((item, index) => (
                    <Pressable
                        key={index}
                        style={({ pressed }) => [
                            styles.monthButton,
                            selectDate === item.month && styles.selectedMonthButton,
                            pressed && styles.pressedMonthButton
                        ]}
                        onPress={() => handleMonthPress(item.month)}
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
        </View>
    );

    const renderDetails = () => {
        const dataToRender = isSwitchOn
            ? allMonthsUniqueData?.[selectDate]?.Data || []
            : allMonthsData?.[selectDate]?.Data || [];


        return selectDate ? (
            <View style={styles.detailsContainer}>
                <FlatList
                    data={dataToRender}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={<Text style={styles.detailsTitle}>
                        {selectDate} {selectedYear} Details ({isSwitchOn ? "Unique" : "Accumulated"})
                    </Text>}
                    renderItem={({ item, index }) => (
                        <View style={styles.dataRow}>
                            <View style={styles.counterStyle}>
                                <Text style={styles.counterText}>{index + 1}</Text>
                            </View>
                            <View>
                                <View style={styles.textRow}>
                                    <Text style={styles.label}>Tracking Number:</Text>
                                    <Text style={styles.value}>{item.TrackingNumber || 'n/a'}</Text>
                                </View>
                                <View style={styles.textRow}>
                                    <Text style={styles.label}>Document Type:</Text>
                                    <Text style={styles.value}>{item.DocumentType || 'n/a'}</Text>
                                </View>
                                <View style={styles.textRow}>
                                    <Text style={styles.label}>Fund:</Text>
                                    <Text style={styles.value}>{item.Fund || 'n/a'}</Text>
                                </View>
                                <View style={styles.textRow}>
                                    <Text style={styles.label}>Amount:</Text>
                                    <Text style={styles.value}> {insertCommas(item.Amount || '')}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyStateContainer}>
                            <Image
                                source={require('../../../assets/images/noresultsstate.png')}
                                style={styles.emptyStateImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.emptyStateText}>NO DATA AVAILABLE</Text>
                        </View>
                    )}
                />
            </View>
        ) : null;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <ImageBackground
                    source={require('../../../assets/images/CirclesBG.png')}
                    style={styles.bgHeader}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Monthly Received - {selectedYear}</Text>
                    </View>
                </ImageBackground>

                <View style={styles.contentWrapper}>
                    <FlatList
                        ListHeaderComponent={renderMonths()}
                        ListFooterComponent={renderDetails()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
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
        paddingHorizontal: 10,
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 20
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
        // paddingVertical: 5,
        marginBottom: 5,
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
        flex: 1,
        padding: 10,
        // backgroundColor: '#f8f9fa',
        // backgroundColor: '#fff',
        // borderWidth: 1,
        // borderColor: '#ddd',
        // borderRadius: 10,
        elevation: 0
    },
    dataRow: {
        flexDirection: "row",
        // alignItems: 'flex-start',
        backgroundColor: '#fff',
        elevation: 3,
        // backgroundColor: 'yellow',
        borderRadius: 8,
        padding: 8,
        marginTop: 10
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
        // paddingStart: 10,
    },
    detailsTitle: {
        marginVertical: 5,
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
        width: '55%',
        fontSize: 14,
        fontFamily: 'Oswald-Regular',
        marginStart: 10,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    emptyStateImage: {
        width: 150,
        height: 150,
    },
    emptyStateText: {
        fontFamily: 'Roboto-Light',
        color: '#999',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
    counterStyle: {
        marginRight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        backgroundColor: '#007bff',
        borderRadius: 6,
    },
    counterText: {
        color: '#ddd',
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailsText: {
        fontSize: 16,
        // color: '#007bff',
        marginTop: 0,
    },
    toggleButton: {
        top: 10,
        alignItems: 'flex-end'
    }
});

export default MonthlyReceivedScreen;
