import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { useWindowDimensions, SafeAreaView, View, StyleSheet, ImageBackground, ActivityIndicator, TouchableOpacity, Pressable, FlatList, Image, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/Ionicons';
import { Switch } from 'react-native-paper';
import { insertCommas } from '../../utils/insertComma';
import useReceiving from '../../api/useReceiving';
import { useIsFetching } from '@tanstack/react-query'

const MonthlyReceivedScreen = ({ navigation, route }) => {
    const { selectedYear } = route.params || {};
    const { receivedMonthlyData } = useReceiving(selectedYear);
    const isFetching = useIsFetching()

    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
    const [activeTab, setActiveTab] = useState('gen');

    const currentFundSource = useMemo(() => {
        return isSwitchOn
            ? receivedMonthlyData?.uniqueFundsData
            : receivedMonthlyData?.accumulatedFundsData;
    }, [isSwitchOn, receivedMonthlyData]);



    const receivedData = useMemo(() => {
        const dataSource = receivedMonthlyData?.ReceivedPerMonth || [];
        return dataSource.reduce((acc, item) => {
            acc[item.Month] = {
                count: item.Count,
                fund: item.Fund || "N/A",
            };
            return acc;
        }, {});
    }, [receivedMonthlyData]);


    const MONTHS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const [selectDate, setSelectDate] = useState(() => {
        const currentMonthIndex = new Date().getMonth();
        return MONTHS[currentMonthIndex];
    });


    const monthlyData = useMemo(() => {
        return MONTHS.map((month) => {
            const fundData = currentFundSource?.[month];
            const count = fundData?.count || fundData?.Count || receivedData?.[month]?.count || 0;
            return { month, count };
        });
    }, [currentFundSource, receivedData]);


    const handleMonthPress = useCallback((month) => {
        setSelectDate(prevDate => prevDate === month ? null : month);
    }, []);


    const getFundCounts = () => {
        const dataToRender = currentFundSource?.[selectDate]?.Data || [];
        const genCount = dataToRender.filter(item => item.Fund?.toLowerCase() === 'general fund').length;
        const trustCount = dataToRender.filter(item => item.Fund?.toLowerCase() === 'trust fund').length;
        const sefCount = dataToRender.filter(item => item.Fund?.toLowerCase() === 'sef').length;

        return { genCount, trustCount, sefCount };
    };




    const renderTabs = () => {
        const { genCount, trustCount, sefCount } = getFundCounts();
        const fundTypes = [
            { id: 'gen', label: 'GF', count: genCount },
            { id: 'trust', label: 'TF', count: trustCount },
            { id: 'sef', label: 'SEF', count: sefCount }
        ];

        return (
            <View>
                <Text style={[styles.detailsTitle, { marginVertical: 25 }]}>
                    Fund Breakdown - {isSwitchOn ? "Unique" : "Accumulated"}
                </Text>
                <View style={styles.fundGridContainer}>
                    {fundTypes.map(({ id, label, count }) => (
                        <Pressable
                            key={id}
                            style={[styles.tabButton, activeTab === id && styles.activeTab]}
                            onPress={() => setActiveTab(id)}
                        >
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '800',
                                color: activeTab === id ? 'white' : 'black'
                            }}>
                                {label}
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: activeTab === id ? 'white' : '#007bff'
                            }}>
                                {count}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    };

    const renderFunds = (fundType) => {
        const data = useMemo(() => {
            const sourceData = currentFundSource?.[selectDate]?.Data || [];
            return sourceData.filter(
                (item) =>
                    item.Fund &&
                    fundType &&
                    item.Fund.toLowerCase() === fundType.toLowerCase()
            );
        }, [currentFundSource, selectDate, fundType]);

        const fallback = (
            <Text style={{ textAlign: 'center', marginVertical: 20, fontStyle: 'italic', color: 'gray' }}>
                No transactions found for this fund type.
            </Text>
        );

        return (
            <View style={{ paddingHorizontal: 5 }}>
                {data.length > 0 ? (
                    <View>
                        <Text style={[styles.subTitle, { marginTop: 25 }]}>List of Transactions</Text>
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            // estimatedItemSize={200}
                            initialNumToRender={10}
                            windowSize={5}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <View style={{ flex: 1, padding: 10, marginVertical: 0 }}>
                                    <View style={[styles.dataRowFunds]}>
                                        <View style={{
                                            marginRight: 10,
                                            alignItems: 'baseline',
                                            justifyContent: 'center',
                                            flexDirection: 'row',
                                        }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                                {index + 1}
                                            </Text>
                                        </View>

                                        <View style={{ borderBottomWidth: 1.5, borderBottomColor: 'gray' }}>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>Fund: </Text>
                                                <Text style={styles.value}>{item.Fund}</Text>
                                            </View>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>Tracking Number: </Text>
                                                <Text style={styles.value}>{item.TrackingNumber}</Text>
                                            </View>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>Document Type: </Text>
                                                <Text style={styles.value}>{item.DocumentType}</Text>
                                            </View>
                                            <View style={styles.textRow}>
                                                <Text style={styles.label}>Net Amount: </Text>
                                                <Text style={styles.value}>{insertCommas(item.NetAmount)}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{
                                        alignItems: 'flex-end',
                                        marginBottom: 5,
                                    }}>
                                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                            <Text style={{
                                                fontSize: 14,
                                                fontFamily: 'Oswald-Light',
                                                opacity: 0.6,
                                            }}>Amount: </Text>
                                            <Text style={{
                                                width: '25%',
                                                fontSize: 14,
                                                fontFamily: 'Oswald-Regular',
                                                marginStart: 10,
                                            }}>{insertCommas(item.Amount)}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                ) : fallback}
            </View>
        );
    };

    const TabContent = ({ fundType }) => {
        return <View>{renderFunds(fundType)}</View>;
    };



    const renderMonths = () => (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', marginVertical: 15 }}>
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
                            pressed && styles.pressedMonthButton,
                        ]}
                        onPress={() => handleMonthPress(item.month)}
                    >
                        {({ pressed }) => (
                            <Card.Content style={styles.cardContent}>
                                <Text
                                    style={[
                                        styles.monthText,
                                        selectDate === item.month && styles.selectedText,
                                        pressed && styles.whiteText,
                                    ]}
                                >
                                    {item.month}
                                </Text>
                                <Text
                                    style={[
                                        styles.countText,
                                        selectDate === item.month && styles.selectedText,
                                        pressed && styles.whiteText,
                                    ]}
                                >
                                    {item.count}
                                </Text>

                            </Card.Content>

                        )}
                    </Pressable>

                ))}

            </View>



            <View style={{ marginVertical: 0 }}>
                {renderTabs()}
                {activeTab === 'gen' && <TabContent fundType="GENERAL FUND" />}
                {activeTab === 'trust' && <TabContent fundType="TRUST FUND" />}
                {activeTab === 'sef' && <TabContent fundType="SEF" />}
            </View>



        </View>
    );


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
                    {isFetching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007bff" />
                        </View>
                    ) : (
                        <FlatList
                            ListHeaderComponent={renderMonths()}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );

};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

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
        paddingHorizontal: 8,
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },

    fundGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },

    card: {
        width: '30%',
        marginVertical: 10,
        paddingVertical: 3,
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
        color: '#007bff',
    },
    whiteText: {
        color: '#fff',
    },

    monthButton: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 5,
        borderRadius: 5,
        backgroundColor: '#ffffff',
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: 'silver',
        borderRightColor: 'silver',
    },

    selectedMonthButton: {
        backgroundColor: '#007bff',
        borderBottomWidth: 2,
        borderRightWidth: 2,
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
        paddingHorizontal: 5,
    },

    dataRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        elevation: 3,
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
    },

    dataRowFunds: {
        flexDirection: 'row',
        padding: 0,
    },

    textRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
    },

    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15
    },

    subTitle: {
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
        height: 70,
    },

    emptyStateText: {
        fontFamily: 'Roboto-Light',
        color: '#999',
        fontSize: 15,
        marginTop: 10,
        textAlign: 'center',
    },

    counterStyle: {
        marginRight: 10,
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
        marginTop: 0,
    },

    toggleButton: {
        top: 10,
        alignItems: 'flex-end',
    },

    bottomSheetList: {
        flexGrow: 1,
        paddingHorizontal: 15,
    },

    itemLabel: {
        width: '30%',
        color: 'white',
        paddingStart: 10,
        fontSize: 12,
        fontFamily: 'Oswald-Light',
        opacity: 0.6,
    },

    itemValue: {
        width: '70%',
        color: 'white',
        fontSize: 14,
        fontFamily: 'Oswald-Regular',
        marginStart: 10,
    },

    tabButton: {
        padding: 15,
        width: '30%',
        alignItems: 'center',
        marginBottom: 5,
        borderRadius: 5,
        elevation: 1,
        backgroundColor: '#ffffff',
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: 'silver',
        borderRightColor: 'silver',
    },

    activeTab: {
        backgroundColor: '#1a8cff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default MonthlyReceivedScreen;
