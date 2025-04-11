import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useWindowDimensions, SafeAreaView, View, StyleSheet, ImageBackground, TouchableOpacity, Pressable, FlatList, Image, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { TabView, TabBar } from 'react-native-tab-view';

import Icon from 'react-native-vector-icons/Ionicons';
import { Switch } from 'react-native-paper';
import { insertCommas } from '../../utils/insertComma';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';


const MonthlyReceivedScreen = ({ navigation, route }) => {
    const { receivedMonthly = [], selectedYear, allMonthsData = {}, allMonthsUniqueData = {}, accumulatedFundsData = {}, uniqueFundsData = {} } = route.params || {};


    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const { width } = useWindowDimensions();
    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
    const [tabIndex, setTabIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('gen');

    const bottomSheetRef = useRef(null);
    const snapPoints = ['75%'];
    const [bottomSheetData, setBottomSheetData] = useState([]);

    const handleShowBottomSheet = () => {
        bottomSheetRef.current?.snapToIndex(0);
    };

    const receivedData = useMemo(() => receivedMonthly.reduce((acc, item) => {
        acc[item.Month] = {
            count: item.Count,
            documentType: item.DocumentType || "N/A",
            fund: item.Fund || "N/A",
        };
        return acc;
    }, {}), [receivedMonthly]);

    const MONTHS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const [selectDate, setSelectDate] = useState(() => {
        const currentMonthIndex = new Date().getMonth();
        return MONTHS[currentMonthIndex];
    });



    const monthlyData = useMemo(() => MONTHS.map((month) => {
        let count;
        if (isSwitchOn) {
            count = allMonthsUniqueData[month]?.Count || 0;
        } else if (receivedData[month]) {
            count = receivedData[month]?.count || 0;
        } else if (accumulatedFundsData[month]) {
            count = accumulatedFundsData[month]?.count || 0;
        } else {
            count = uniqueFundsData[month]?.count || 0;
        }


        return {
            month,
            count: count,
            documentType: receivedData[month]?.documentType || "N/A",
            fund: receivedData[month]?.fund || "N/A",
        };
    }), [receivedData, isSwitchOn, allMonthsUniqueData, accumulatedFundsData, uniqueFundsData]);


    const handleMonthPress = useCallback((month) => {
        setSelectDate(prevDate => prevDate === month ? null : month);
    }, []);

    const getFundCounts = () => {
        const dataToRender = isSwitchOn
            ? uniqueFundsData?.[selectDate]?.Data || []
            : accumulatedFundsData?.[selectDate]?.Data || [];

        const genCount = dataToRender.filter(item => item.Fund?.toLowerCase() === 'general fund').length;
        const trustCount = dataToRender.filter(item => item.Fund?.toLowerCase() === 'trust fund').length;
        const sefCount = dataToRender.filter(item => item.Fund?.toLowerCase() === 'sef').length;

        return { genCount, trustCount, sefCount };
    };




    const renderTabs = () => {
        const { genCount, trustCount, sefCount } = getFundCounts();

        return (
            <View>
                <Text style={[styles.detailsTitle, { marginVertical: 25, }]}> Fund Breakdown - {isSwitchOn ? "Unique" : "Accumulated"}</Text>
                <View style={styles.fundGridContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'gen' && styles.activeTab]}
                        onPress={() => setActiveTab('gen')}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: activeTab === 'gen' ? 'white' : 'black'
                        }}>
                            GF
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            // color: '#007bff'
                            color: activeTab === 'gen' ? 'white' : '#007bff'
                        }}>
                            {genCount}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'trust' && styles.activeTab]}
                        onPress={() => setActiveTab('trust')}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: activeTab === 'trust' ? 'white' : 'black'
                        }}>
                            TF
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: activeTab === 'trust' ? 'white' : '#007bff'
                        }}>
                            {trustCount}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'sef' && styles.activeTab]}
                        onPress={() => setActiveTab('sef')}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: activeTab === 'sef' ? 'white' : 'black'
                        }}>
                            SEF
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: activeTab === 'sef' ? 'white' : '#007bff'
                        }}>
                            {sefCount}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderFunds = (fundType) => {
        const dataToRender = isSwitchOn
            ? uniqueFundsData?.[selectDate]?.Data || []
            : accumulatedFundsData?.[selectDate]?.Data || [];

        const filteredData = dataToRender.filter(
            (item) => item.Fund && fundType && item.Fund.toLowerCase() === fundType.toLowerCase()
        );


        const handleShowMore = () => {
            setBottomSheetData(filteredData);
            handleShowBottomSheet();
        };

        // const fundsData = filteredData.slice(0, 3);
        // if (fundsData.length === 0) {
        //     return (
        //         <View
        //             style={{
        //                 // backgroundColor: 'white',
        //                 // elevation: 3,
        //                 marginLeft: 5,
        //                 // marginBottom: 10,
        //                 marginRight: 15,
        //                 // marginTop: 10,
        //                 alignItems: 'center',
        //                 justifyContent: 'center',
        //                 // height: 100,
        //                 padding: 20,
        //                 borderRadius: 10,
        //                 // shadowColor: '#000',
        //                 // shadowOffset: { width: 0, height: 2 },
        //                 // shadowOpacity: 0.8,
        //                 // shadowRadius: 3,
        //             }}
        //         >
        //             <Image
        //                 source={require('../../../assets/images/noresultsstate.png')}
        //                 style={{ height: 70 }}
        //                 resizeMode="center"
        //             />
        //             <Text style={styles.emptyStateText}>NO DATA AVAILABLE</Text>
        //         </View>
        //     );
        // }


        return (
            <View style={{ paddingHorizontal: 5 }}>
                {filteredData.length > 0 && (
                    <View>
                        <View style={{ marginVertical: 0 }}>
                            <Text style={[styles.subTitle, { marginTop: 25 }]}>List of Transactions</Text>
                        </View>

                        <View style={{ marginTop: 10 }}>
                            <FlatList
                                data={filteredData}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <View
                                        style={{
                                            flex: 1,
                                            padding: 10,
                                            marginVertical: 0,
                                        }}
                                    >
                                        <View style={[styles.dataRowFunds]}>
                                            <View
                                                style={{
                                                    marginRight: 10,
                                                    alignItems: 'baseline',
                                                    justifyContent: 'center',
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                                    {index + 1}
                                                </Text>
                                            </View>

                                            <View
                                                style={{
                                                    borderBottomWidth: 1.5,
                                                    borderBottomColor: 'gray',
                                                }}>
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
                                                {/* <View style={styles.textRow}>
                                                <Text style={styles.label}>Amount: </Text>
                                                <Text style={styles.value}>{insertCommas(item.Amount)}</Text>
                                            </View> */}
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
                    </View>
                )}
            </View>
        );
    };


    const TabContent = ({ fundType }) => {
        return (
            <View>
                {renderFunds(fundType)}
            </View>
        );
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

            {/* {selectDate && (
                <View style={{ marginVertical: 0 }}>
                    {renderTabs()}
                    {activeTab === 'gen' && <TabContent fundType="GENERAL FUND" />}
                    {activeTab === 'trust' && <TabContent fundType="TRUST FUND" />}
                    {activeTab === 'sef' && <TabContent fundType="SEF" />}
                </View>

            )} */}

            <View style={{ marginVertical: 0 }}>
                {renderTabs()}
                {activeTab === 'gen' && <TabContent fundType="GENERAL FUND" />}
                {activeTab === 'trust' && <TabContent fundType="TRUST FUND" />}
                {activeTab === 'sef' && <TabContent fundType="SEF" />}
            </View>




        </View>
    );

    // const renderDetails = () => {
    //     const dataToRender = isSwitchOn
    //         ? allMonthsUniqueData?.[selectDate]?.Data || []
    //         : allMonthsData?.[selectDate]?.Data || [];


    //     return selectDate ? (
    //         <View style={styles.detailsContainer}>
    //             <FlatList
    //                 data={dataToRender}
    //                 keyExtractor={(item, index) => index.toString()}
    //                 ListHeaderComponent={<Text style={[styles.detailsTitle, { marginTop: 25 }]}>
    //                     {selectDate} {selectedYear} Details ({isSwitchOn ? "Unique" : "Accumulated"})
    //                 </Text>}
    //                 renderItem={({ item, index }) => (
    //                     <View style={styles.dataRow}>
    //                         <View style={styles.counterStyle}>
    //                             <Text style={styles.counterText}>{index + 1}</Text>
    //                         </View>
    //                         <View>
    //                             <View style={styles.textRow}>
    //                                 <Text style={styles.label}>Tracking Number:</Text>
    //                                 <Text style={styles.value}>{item.TrackingNumber || 'n/a'}</Text>
    //                             </View>
    //                             <View style={styles.textRow}>
    //                                 <Text style={styles.label}>Document Type:</Text>
    //                                 <Text style={styles.value}>{item.DocumentType || 'n/a'}</Text>
    //                             </View>
    //                             <View style={styles.textRow}>
    //                                 <Text style={styles.label}>Fund:</Text>
    //                                 <Text style={styles.value}>{item.Fund || 'n/a'}</Text>
    //                             </View>
    //                             <View style={styles.textRow}>
    //                                 <Text style={styles.label}>Amount:</Text>
    //                                 <Text style={styles.value}> {insertCommas(item.Amount || '')}</Text>
    //                             </View>
    //                         </View>
    //                     </View>
    //                 )}
    //                 ListEmptyComponent={() => (
    //                     <View style={styles.emptyStateContainer}>
    //                         <Image
    //                             source={require('../../../assets/images/noresultsstate.png')}
    //                             style={styles.emptyStateImage}
    //                             resizeMode="contain"
    //                         />
    //                         <Text style={styles.emptyStateText}>NO DATA AVAILABLE</Text>
    //                     </View>
    //                 )}
    //             />
    //         </View>
    //     ) : null;
    // };

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
                        // ListFooterComponent={renderDetails()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>


                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    // enablePanDownToClose={true}
                    // enableOverDrag={true}
                    backgroundStyle={{ flex: 1 }}
                    backdropComponent={(props) => (
                        <BottomSheetBackdrop
                            {...props}
                            disappearsOnIndex={-1}
                            appearsOnIndex={0}
                            opacity={0.5} // Adjust the dim level
                        />
                    )}
                >
                    <ImageBackground style={{ flex: 1 }} source={require('../../../assets/images/docmobileBG.png')}>
                        <View style={{ alignItems: 'flex-end', marginRight: 15, paddingVertical: 5 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    bottomSheetRef.current?.close();
                                }}
                                style={{
                                    padding: 5,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Icon
                                    name="backspace-outline"
                                    size={22}
                                    color={'#fff'}
                                    style={{ marginRight: 2 }}
                                />
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontFamily: 'Inter_28pt-Bold',
                                        color: '#fff',
                                    }}
                                >
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <BottomSheetFlatList
                            data={bottomSheetData}
                            contentContainerStyle={styles.bottomSheetList}
                            renderItem={({ item, index }) => (
                                <View style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                    // elevation: 3,
                                    borderRadius: 8,
                                    padding: 8,
                                    marginBottom: 10,


                                }}>
                                    <View>
                                        <View style={styles.dataRowFunds}>
                                            <View style={styles.counterStyle}>
                                                <Text style={styles.counterText}>{index + 1}</Text>
                                            </View>
                                            <View>
                                                <View style={styles.textRow}>
                                                    <Text style={styles.itemLabel}>
                                                        TrackingNumber:
                                                    </Text>
                                                    <Text style={styles.itemValue}>
                                                        {item.TrackingNumber}
                                                    </Text>
                                                </View>


                                                <View style={styles.textRow}>
                                                    <Text style={styles.itemLabel}>
                                                        Fund:
                                                    </Text>
                                                    <Text style={styles.itemValue}>
                                                        {item.Fund}
                                                    </Text>
                                                </View>

                                                <View style={styles.textRow}>
                                                    <Text style={styles.itemLabel}>
                                                        Amount:
                                                    </Text>
                                                    <Text style={styles.itemValue}>
                                                        {insertCommas(item.Amount)}
                                                    </Text>
                                                </View>
                                            </View>

                                        </View>

                                    </View>
                                </View>
                            )}
                        /></ImageBackground>
                </BottomSheet>
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
});


export default MonthlyReceivedScreen;
