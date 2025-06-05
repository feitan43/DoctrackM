import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from 'react-native';

import PdfViewer from '../utils/PDFViewer';
import {useBACAttachments} from '../hooks/useAttachments';
import Icon from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const BACAttachmentsScreen = ({navigation}) => {
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const {
    data: fetchedCertificates,
    isLoading,
    isError,
    refetch,
  } = useBACAttachments();

  const groupedCertificates = useMemo(() => {
    if (!fetchedCertificates) return {};
    return fetchedCertificates.reduce((acc, cert) => {
      if (!acc[cert.SupplierId]) {
        acc[cert.SupplierId] = {
          SupplierId: cert.SupplierId,
          SupplierName: cert.SupplierName,
          certificates: [],
        };
      }
      acc[cert.SupplierId].certificates.push(cert);
      return acc;
    }, {});
  }, [fetchedCertificates]);

  const displayedSuppliers = useMemo(() => {
    if (isLoading) return [];
    if (isError) return [];

    const allSuppliers = Object.values(groupedCertificates);

    if (selectedSupplierId) {
      return allSuppliers.filter(
        supplier => supplier.SupplierId === selectedSupplierId,
      );
    } else if (searchText === '') {
      return allSuppliers;
    } else {
      const lowerCaseSearchText = searchText.toLowerCase();
      return allSuppliers.filter(
        supplier =>
          supplier.SupplierName.toLowerCase().includes(lowerCaseSearchText) ||
          supplier.SupplierId.toLowerCase().includes(lowerCaseSearchText) ||
          supplier.certificates.some(cert =>
            cert.CertificateNumber.toLowerCase().includes(lowerCaseSearchText),
          ),
      );
    }
  }, [searchText, groupedCertificates, selectedSupplierId, isLoading, isError]);

  const handleViewCertificate = certificate => {
    const baseUrl = 'https://your-api.com/certificates/';
    if (certificate.FileName) {
      const pdfUrl = `${baseUrl}${certificate.FileName}`;
      setSelectedPdfUrl(pdfUrl);
      setSelectedPdfTitle(`Certificate: ${certificate.CertificateNumber}`);
    } else {
      Alert.alert(
        'No File',
        'No PDF file has been uploaded for this certificate.',
      );
    }
  };

  const handleUploadCertificate = async certificateId => {
    Alert.alert(
      'Upload Feature',
      'This feature would open a file picker to upload a PDF. (Implementation requires react-native-document-picker or similar library).',
      [
        {
          text: 'OK',
          onPress: () => {
            Alert.alert(
              'Simulated Upload',
              'PDF file has been simulated as uploaded. In a real app, data would now refresh.',
              [{text: 'OK', onPress: () => refetch && refetch()}],
            );
          },
        },
      ],
    );
  };

  const handleBackToList = () => {
    setSelectedPdfUrl(null);
    setSelectedPdfTitle(null);
    setSelectedSupplierId(null);
  };

  const toggleSupplierExpansion = supplierId => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedSupplierId(prevId =>
      prevId === supplierId ? null : supplierId,
    );
  };

  const renderCertificateItem = ({item: certificate}) => (
    <View style={styles.certificateItem}>
      <Text style={styles.certificateTitle}>
        <Text style={{fontWeight: 'bold'}}>Certificate No.:</Text>{' '}
        {certificate.CertificateNumber}
      </Text>
      <Text style={styles.certificateDetail}>
        <Text style={{fontWeight: 'bold'}}>Issued:</Text>{' '}
        {certificate.IssueDate}
      </Text>
      <Text style={styles.certificateDetail}>
        <Text style={{fontWeight: 'bold'}}>Valid Until:</Text>{' '}
        {certificate.ValidUpTo}
      </Text>
      {certificate.FileName ? (
        <Text style={styles.certificateDetail}>
          <Text style={{fontWeight: 'bold'}}>Uploaded File:</Text>{' '}
          {certificate.FileName} (on {certificate.FileDateUploaded})
        </Text>
      ) : (
        <Text style={styles.certificateDetail}>
          <Text style={{fontWeight: 'bold', color: styles.noFileText.color}}>
            No file uploaded.
          </Text>
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.viewButton,
            !certificate.FileName && styles.disabledButton,
          ]}
          onPress={() => handleViewCertificate(certificate)}
          disabled={!certificate.FileName}
          accessibilityLabel={`View ${certificate.CertificateNumber}`}>
          <Icon name="eye-outline" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={() => handleUploadCertificate(certificate.Id)}
          accessibilityLabel={`Upload certificate for ${certificate.CertificateNumber}`}>
          <Icon name="cloud-upload-outline" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSupplierItem = ({item: supplierGroup}) => {
    const isExpanded = selectedSupplierId === supplierGroup.SupplierId;
    return (
      <View style={styles.supplierGroupContainer}>
        <TouchableOpacity
          style={styles.supplierHeader}
          onPress={() => toggleSupplierExpansion(supplierGroup.SupplierId)}
          accessibilityLabel={`Toggle certificates for ${supplierGroup.SupplierName}`}>
          <Text style={styles.supplierName}>{supplierGroup.SupplierName}</Text>
          <View style={styles.supplierHeaderRight}>
            <Text style={styles.supplierCount}>
              {supplierGroup.certificates.length} certificates
            </Text>
            <Icon
              name={
                isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'
              }
              size={20}
              color="#FFFFFF"
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <FlatList
            data={supplierGroup.certificates}
            renderItem={renderCertificateItem}
            keyExtractor={cert => cert.Id}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                No certificates for this supplier.
              </Text>
            }
          />
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Issued Certificates</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={styles.header.backgroundColor}
          />
          <Text style={styles.loadingText}>Loading certificates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Issued Certificates</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon
            name="alert-circle-outline"
            size={40}
            color={styles.errorText.color}
          />
          <Text style={styles.errorText}>Failed to load certificates.</Text>
          <Text style={styles.errorDetail}>
            Please check your internet connection or try again later.
          </Text>
          <TouchableOpacity
            onPress={() => refetch && refetch()}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />
      <View style={styles.header}>
        {selectedPdfUrl || selectedSupplierId ? (
          <TouchableOpacity
            onPress={handleBackToList}
            style={styles.backButton}>
            <Icon name="chevron-back-outline" size={24} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : null}
        {selectedPdfUrl || selectedSupplierId ? null : (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back-outline" size={24} color="#FFFFFF" />
            <Text style={styles.backButtonText}></Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          BAC Attachments
        </Text>
      </View>

      {selectedPdfUrl ? (
        <PdfViewer pdfUrl={selectedPdfUrl} />
      ) : (
        <>
          {!selectedSupplierId && (
            <View style={styles.searchContainer}>
              <Icon
                name="search-outline"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Supplier, ID, or Cert. No."
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearSearchButton}>
                  <Icon name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={displayedSuppliers}
            renderItem={renderSupplierItem}
            keyExtractor={item => item.SupplierId}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                {searchText || selectedSupplierId
                  ? 'No matching suppliers or certificates found.'
                  : 'No certificates available.'}
              </Text>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2980B9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearSearchButton: {
    marginLeft: 10,
    padding: 5,
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  supplierGroupContainer: {
    backgroundColor: '#E6F7FF',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  supplierHeader: {
    backgroundColor: '#3498DB',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supplierName: {
    fontSize: 19,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  supplierHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierCount: {
    fontSize: 14,
    color: '#E0E0E0',
    marginRight: 10,
  },
  expandIcon: {},
  certificateItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 10,
    /*  shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1, */
  },
  certificateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  certificateDetail: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  noFileText: {
    color: '#E74C3C',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  viewButton: {
    backgroundColor: '#2ECC71',
  },
  uploadButton: {
    backgroundColor: '#3498DB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 17,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 10,
    marginTop: 10,
  },
  errorDetail: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BACAttachmentsScreen;
