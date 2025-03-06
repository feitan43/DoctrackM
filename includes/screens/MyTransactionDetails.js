import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Modal,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import {DataTable} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
//import {SafeAreaView} from 'react-native-safe-area-context';
import {insertCommas} from '../utils/insertComma';
import useTransactionHistory from '../api/useTransactionHistory';
import Timeline from 'react-native-timeline-flatlist';

const MyTransactionDetails = ({route, navigation}) => {
  const {selectedItem} = route.params;
  const [showMore, setShowMore] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const {transactionsHistory} = useTransactionHistory(selectedItem);
  const timelineData = transactionsHistory.map(item => ({
    time: item.DateModified,
    title: item.Status,
    description: `Completion: ${item.Completion}`,
  }));

  function removeHtmlTags(text) {
    if (text === null || text === undefined) {
      return '';
    }

    const boldEndRegex = /<\/b>/g;
    const newText = text.replace(boldEndRegex, '</b>\n');
    const htmlRegex = /<[^>]*>/g;
    return newText.replace(htmlRegex, ' ');
  }
  const renderContent = () => {
    return (
      <ScrollView contentContainerStyle={{}}>
        {/*         <Text style={styles.claimantText}>{selectedItem.Claimant}</Text>
         */}
        <View style={styles.detailRow}>
          {/* <Text style={[styles.labelText, {color: 'white'}]}>Status</Text> */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              selectedItem.Status === 'Pending' && styles.pendingStatus,
            ]}
            //onPress={() => setModalVisible(true)
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: 'white',
                  fontSize: 18,
                  textShadowColor: 'rgba(90, 89, 89, 0.84)',
                  textShadowOffset: {width: 1, height: 1},
                  textShadowRadius: 2,
                },
              ]}>
              {selectedItem.TrackingType} - {selectedItem.Status}
            </Text>
            <Text style={[styles.dateText, {color: 'white'}]}>
              {selectedItem.DateModified}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{marginHorizontal: 10}}>
          <View style={styles.textRow}>
            <Text style={styles.label}>TN</Text>
            <Text style={styles.value}>{selectedItem.TrackingNumber}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Claimant</Text>
            <Text style={styles.value}>{selectedItem.Claimant}</Text>
          </View>
          {/*  <View style={styles.textRow}>
            <Text style={styles.label}>Office</Text>
            <Text style={styles.value}>{selectedItem.OfficeName}</Text>
          </View> */}
          <View style={styles.textRow}>
            <Text style={styles.label}>Document</Text>
            <Text style={styles.value}>{selectedItem.DocumentType}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Period</Text>
            <Text style={styles.value}>{selectedItem.PeriodMonth}</Text>
          </View>
          {/* <View style={styles.textRow}>
            <Text style={styles.label}>ClaimType </Text>
            <Text style={styles.value}>{selectedItem.ClaimType}</Text>
          </View> */}
          <View style={styles.textRow}>
            <Text style={styles.label}>Fund</Text>
            <Text style={styles.value}>{selectedItem.Fund}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              ₱{insertCommas(selectedItem.Amount)}
            </Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Net Amount</Text>
            <Text style={styles.value}>
              ₱{insertCommas(selectedItem.NetAmount)}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: 'silver',
              marginVertical: 10,
              marginHorizontal: 20,
            }}></View>

          <View style={styles.textRow}>
            <Text style={styles.label}>Encoded By</Text>
            <Text style={styles.value}>{selectedItem.Encoder}</Text>
          </View>

          <View style={styles.textRow}>
            <Text style={styles.label}>Date Encoded</Text>
            <Text style={styles.value}>{selectedItem.DateEncoded}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Date Updated</Text>
            <Text style={styles.value}>{selectedItem.DateModified}</Text>
          </View>
        </View>
        {/* <View style={styles.amountRow}>
          <View>
            <Text style={styles.labelText}>Document</Text>
            <Text style={styles.valueText}>{selectedItem.DocumentType}</Text>
          </View>

          <View>
            <Text style={styles.labelText}>Month</Text>
            <Text style={styles.valueText}>{selectedItem.PeriodMonth}</Text>
          </View>
        </View> */}

        {/*   <View style={styles.amountRow}>
          <View>
            <Text style={styles.labelText}>Amount</Text>
            <Text style={styles.valueText}>
              ₱ {insertCommas(selectedItem.Amount)}
            </Text>
          </View>

          <View>
            <Text style={styles.labelText}>Net Amount</Text>
            <Text style={styles.valueText}>
              ₱ {insertCommas(selectedItem.NetAmount)}
            </Text>
          </View>
        </View> */}

        {selectedItem.Remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksTitle}>Pending Notes</Text>
            <View style={styles.remarksBox}>
              <Text style={styles.remarksText}>
                {removeHtmlTags(selectedItem.Remarks)}
              </Text>
            </View>
          </View>
        )}
        <View>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setShowHistory(!showHistory)}>
            <Text style={styles.historyButtonText}>
              {showHistory ? 'Hide History' : 'Show History'}
            </Text>
          </TouchableOpacity>

          {showHistory && (
            <DataTable style={styles.transactionTable}>
              <DataTable.Header>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title numeric>Completion</DataTable.Title>
              </DataTable.Header>

              {transactionsHistory.length > 0 ? (
                transactionsHistory.map((item, index) => {
                  const isLastItem = index === transactionsHistory.length - 1;
                  return (
                    <DataTable.Row
                      key={index}
                      style={isLastItem ? styles.highlightedRow : null}>
                      <DataTable.Cell style={styles.dataCell}>
                        <Text style={[styles.dataText, {fontSize: 10}]}>
                          {item.DateModified}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.dataCell}>
                        <Text style={styles.dataText}>{item.Status}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.dataCell} numeric>
                        <Text style={styles.dataText}>{item.Completion}</Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })
              ) : (
                <DataTable.Row>
                  <DataTable.Cell
                    style={{justifyContent: 'center'}}
                    colspan={3}>
                    <Text style={styles.noTransactionsText}>
                      No Transaction History available
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </DataTable>
          )}
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}>
              <Icon name="close-outline" size={24} color="black" />
            </TouchableOpacity>
            <Timeline data={timelineData} />
          </View>
        </Modal>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')} // Change this to your background image
        style={styles.bgHeader}>
        <View style={styles.header}>
          <Pressable
            style={({pressed}) => [
              pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
              styles.backButton,
            ]}
            android_ripple={{
              color: '#F6F6F6',
              borderless: true,
              radius: 24,
            }}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.title}></Text>
        </View>
      </ImageBackground>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    },
  claimantText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    flex: 1,
    textAlign: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusButton: {
    backgroundColor: '#3DD1FC',
    paddingVertical: 10,
    //borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  pendingStatus: {
    backgroundColor: '#FFEB3B',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B3B3B',
  },
  dateText: {
    fontSize: 12,
    color: '#777',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  remarksContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F9FA', // Light gray background
    borderRadius: 8,
    //borderWidth: 1,
    borderColor: '#D1D5DB', // Light border color
  },
  remarksTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151', // Dark gray text
    marginBottom: 5,
  },
  remarksBox: {
    backgroundColor: '#FFFFFF', // White box for remarks
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'orange',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    //elevation: 1,
  },
  remarksText: {
    fontSize: 14,
    color: '#4B5563', // Gray text
    lineHeight: 20,
  },
  transactionTable: {
    backgroundColor: '#fff',
    // marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 20,
  },
  noTransactionsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    paddingVertical: 10,
  },
  detailRow: {
    marginVertical: 0,
  },
  bgHeader: {
    paddingTop:30,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 4, // Shadow effect
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    //elevation: 2,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    //padding: 10,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  label: {
    //backgroundColor:'red',
    width: '25%',
    fontSize: 15,
    fontFamily: 'Inter_28pt-Light',
    color: 'gray',
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  value: {
    //backgroundColor:'blue',
    width: '70%',
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginStart: 15,
    //letterSpacing: -1,
  },
  dataCell: {
    fontSize: 12,
    fontWeight: '500', // Change this value to your desired font size
    color: '#333', // You can also change the color if needed
    alignContent: 'flex-start',
  },
  dataText: {
    fontSize: 12,
    fontWeight: '500', // Adjust font size as needed
    color: '#333', // Dark gray for readability
    textAlign: 'justify',
  },
  highlightedRow: {
    backgroundColor: 'orange', // Light gray background for highlight
    borderRadius: 5, // Optional rounded corners
  },
  historyButton: {
    //backgroundColor: '#007bff',
    padding: 10,
    paddingEnd: 20,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end',
    //marginBottom: 10,
  },
  historyButtonText: {
    color: 'orange',
  },
  highlightedRow: {
    backgroundColor: 'orange',
    borderRadius: 5,
  },
});
export default MyTransactionDetails;
