import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Modal,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import {DataTable} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import {insertCommas} from '../utils/insertComma';
import useTransactionHistory from '../api/useTransactionHistory';
import Timeline from 'react-native-timeline-flatlist';
import { width, removeHtmlTags} from '../utils';

const MyTransactionDetails = ({route, navigation}) => {
  const {selectedItem} = route.params;
  const [showHistory, setShowHistory] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const {transactionsHistory} = useTransactionHistory(selectedItem);

  const timelineData = transactionsHistory.map(item => ({
    time: item.DateModified,
    title: item.Status,
    description: `Completion: ${item.Completion}`,
  }));
  
  const getStatusColor = status => {
  if (status.includes('Pending')) return '#FFA500';
  if (status.includes('Approved')) return '#4CAF50';
  if (status.includes('Rejected')) return '#F44336';
  return '#2196F3';
};


  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.headerBackground}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            android_ripple={styles.backButtonRipple}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{/* Transaction  */}Details</Text>
          <View style={{width: 40}} />
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.statusCard,
            {backgroundColor: getStatusColor(selectedItem.Status)},
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.trackingType}>
              {selectedItem.TrackingType} -{' '}
            </Text>
            <Text style={styles.statusText}>{selectedItem.Status}</Text>
          </View>

          <Text style={styles.dateText}>{selectedItem.DateModified}</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="TN" value={selectedItem.TrackingNumber} />
          <DetailRow label="Claimant" value={selectedItem.Claimant} />
          <DetailRow label="Document" value={selectedItem.DocumentType} />
          <DetailRow label="Period" value={selectedItem.PeriodMonth} />
          <DetailRow label="Fund" value={selectedItem.Fund} />
          <DetailRow
            label="Amount"
            value={`₱${insertCommas(selectedItem.Amount)}`}
            isAmount
          />
          <DetailRow
            label="Net Amount"
            value={`₱${insertCommas(selectedItem.NetAmount)}`}
            isAmount
          />

          <View style={styles.divider} />

          <DetailRow label="Encoded By" value={selectedItem.Encoder} />
          <DetailRow label="Date Encoded" value={selectedItem.DateEncoded} />
          <DetailRow label="Date Updated" value={selectedItem.DateModified} />
        </View>

        {selectedItem.Remarks && (
          <View style={styles.remarksCard}>
            <Text style={styles.sectionTitle}>Pending Notes</Text>
            <View style={styles.remarksContent}>
              <Text style={styles.remarksText}>
                {removeHtmlTags(selectedItem.Remarks)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setShowHistory(!showHistory)}>
          <Text style={styles.historyToggleText}>
            {showHistory ? 'Hide History' : 'Show History'}
          </Text>
          <Icon
            name={showHistory ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#007AFF"
          />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyCard}>
            {transactionsHistory.length > 0 ? (
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title style={styles.tableHeaderText}>
                    Date
                  </DataTable.Title>
                  <DataTable.Title style={styles.tableHeaderText}>
                    Status
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.tableHeaderText}>
                    Completion
                  </DataTable.Title>
                </DataTable.Header>

                {transactionsHistory.map((item, index) => (
                  <DataTable.Row
                    key={index}
                    style={[
                      styles.tableRow,
                      index === transactionsHistory.length - 1 &&
                        styles.highlightedRow,
                    ]}>
                    <DataTable.Cell>
                      <Text style={styles.tableCellText}>
                        {item.DateModified}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text style={styles.tableCellText}>{item.Status}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.tableCellText}>
                        {item.Completion}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <Text style={styles.noHistoryText}>
                No transaction history available
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Timeline Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Transaction Timeline</Text>
            <Timeline
              data={timelineData}
              circleSize={16}
              circleColor="#007AFF"
              lineColor="#007AFF"
              timeStyle={styles.timelineTime}
              titleStyle={styles.timelineTitle}
              descriptionStyle={styles.timelineDescription}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow = ({label, value, isAmount = false}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, isAmount && styles.amountValue]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backButtonRipple: {
    color: 'rgba(255,255,255,0.2)',
    borderless: true,
    radius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    color: '#007AFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  remarksCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  remarksContent: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  remarksText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
  },
  historyToggleText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tableHeader: {
    backgroundColor: '#F5F7FA',
  },
  tableHeaderText: {
    color: '#666',
    fontWeight: '600',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tableCellText: {
    fontSize: 12,
    color: '#333',
  },
  highlightedRow: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  timelineTime: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  timelineTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineDescription: {
    color: '#666',
    fontSize: 12,
  },
});

export default MyTransactionDetails;
