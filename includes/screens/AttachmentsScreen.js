import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Linking,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import {pick} from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TextInput, Button} from 'react-native-paper';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {formTypeMap} from '../utils/formTypeMap';
import useSearchTrack from '../api/useSearchTrack';
import { useAttachmentFiles } from '../hooks/useAttachments';

const sampleAttachments = {
  'OBR Form': [
    {
      name: 'OBR_Document.pdf',
      type: 'application/pdf',
      uri: 'https://www.davaocityportal.com/tempUpload/2025~7611-391~PO%20Form~2.pdf',
    },
  ],
  'PR Form': [
    {
      name: 'PR_Document.pdf',
      type: 'application/pdf',
      uri: 'https://www.example.com/PR_Document.pdf',
    },
  ],
};

const AttachmentsScreen = ({navigation}) => {
  //const [attachments, setAttachments] = useState(sampleAttachments);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingType, setTrackingType] = useState('');
  const [formOptions, setFormOptions] = useState([]);
  const bottomSheetRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const yearOptions = ['2023', '2024', '2025'];
  const [search, setSearch] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  const {data : attachments } = useAttachmentFiles(selectedYear, trackingNumber, trackingType);

  const {fetchDataSearchTrack} = useSearchTrack(trackingNumber, selectedYear,search);

  useEffect(() => {
    const options = formTypeMap[trackingType] || [];
    setFormOptions(options);
  }, [trackingType]);

 /*  const handleSearchTrackingNumber = async () => {
    const data = await fetchDataSearchTrack();
    console.log("data",data)
  if (data.count === 1 && data.results.length > 0) {
          const trackingNumber =
            searchText.substring(4, 5) === '-' ||
            searchText.substring(0, 3) === 'PR-'
              ? searchText
              : data.results[0].TrackingNumber;

              setSearchModalVisible(false);

          navigation.navigate('Detail', {
            index: 0,
            selectedItem: {
              Year: selectedYear,
              TrackingNumber: trackingNumber,
              TrackingType: data.results[0].TrackingType,
              data: data.results[0],
            },
          }
        );
    const type = trackingNumber.slice(0, 2).toUpperCase();
    setTrackingType(type);
    setFormOptions(formTypeMap[type] || []);
  }; */

  const handleSearchTrackingNumber = async () => {
    try {
      const data = await fetchDataSearchTrack();
      if (data.count === 1 && data.results.length > 0) {
        const result = data.results[0];
        const trackingType = result.TrackingType;
        setTrackingType(trackingType);
        setFormOptions(formTypeMap[trackingType] || []);
        setTrackingData(result);
      }
    } catch (error) {
      setTrackingData([]); 
      console.log("Error fetching tracking data:", error);
    }
  };

  const handleTrackingNumberChange = text => {
    setTrackingNumber(text.toUpperCase());
  };

  const pickFile = async formType => {
    try {
      const res = await pick({type: ['image/*', 'application/pdf']});
      if (!res || res.length === 0) return;
      const file = res[0];
      setAttachments(prev => ({
        ...prev,
        [formType]: [...(prev[formType] || []), file],
      }));
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const openDocument = uri => {
    Linking.openURL(uri).catch(err =>
      console.error('Error opening file:', err),
    );
  };

  const removeAttachment = (formType, index) => {
    setAttachments(prev => ({
      ...prev,
      [formType]: prev[formType].filter((_, i) => i !== index),
    }));
  };

  const handleSelectYear = year => {
    setSelectedYear(year);
    bottomSheetRef.current?.close();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          {/*  <Text style={styles.headerTitle}>Attachments</Text> */}
        </View>
      </ImageBackground>
     {/*  {trackingData && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: 'bold' }}>Form Details</Text>
          <Text>Tracking Number: {trackingData.TrackingNumber}</Text>
          <Text>Tracking Type: {trackingData.TrackingType}</Text>
          <Text>Status: {trackingData.Status}</Text>
        </View>
      )}
    */}
      <View style={{marginBottom: 20}}>
        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{marginStart: 20}}>Select Year: </Text>
          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.expand()}
            style={styles.yearSelection}>
            <Text style={{color: '#333'}}>{selectedYear}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          mode="outlined"
          label="Tracking Number"
          value={trackingNumber}
          keyboardType="default"
          autoCapitalize="characters"
          onChangeText={handleTrackingNumberChange}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSearchTrackingNumber}
          style={styles.searchButton}>
          Search
        </Button>
     {/*   <Button
        mode="contained"
        onPress={handleSearchTrackingNumber}
        style={styles.searchButton}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={20} color="#fff" />
        <Text> Scan</Text>
      </Button> */}

      </View>
      <View style={styles.attachmentsHeader}>
        <Text style={styles.attachmentsHeaderText}>Attachments: <Text style={{color: '#252525'}}>{attachments?.length || '0'} <Text style={{color:'gray', fontSize:14}}>/ </Text>{formOptions.length}</Text></Text>
      </View>

   <ScrollView 
  contentContainerStyle={{ paddingBottom: 20 }} 
  showsVerticalScrollIndicator={false}
>
  {!trackingData ? (
    <View style={styles.noTrackingDataContainer}>
      <MaterialCommunityIcons 
        name="file-search-outline" 
        size={80} 
        color="#7A92A5" 
        style={styles.noTrackingIcon}
      />
      <Text style={styles.noTrackingDataText}>
        Search a tracking number to view attachments.
      </Text>
      <Text style={styles.noTrackingDataSubText}>
        Enter the tracking number above to check for available documents.
      </Text>
    </View>
  ) : (
    formOptions.map((form, index) => {
      // Filter attachments by form
     const filteredAttachments = (attachments || []).filter((attachment) => {
        const fileName = attachment.split('~')[2];
        return fileName === form;
      });
      return (
        <View key={form} style={styles.cardContainer}>
          <View style={styles.labelUploadRow}>
            <View style={styles.indexColumn}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={styles.formLabelColumn}>
              <Text style={styles.formLabel}>{form}</Text>
            </View>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickFile(form)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="cloud-upload-outline"
                size={20}
                color="#fff"
              />
              <Text style={{ color: 'white', marginLeft: 6 }}>Upload</Text>
            </TouchableOpacity>
          </View>

       {filteredAttachments?.length > 0 ? (
            filteredAttachments.map((attachment, idx) => {
              const filename = attachment.split('/').pop(); 
              const [, , formSeries, seriesExt] = filename.split('~'); 

              return (
                <View key={idx} style={styles.attachmentItem}>
                  <TouchableOpacity onPress={() => openDocument(attachment)}>
                    <Text style={styles.attachmentText}>
                      {`${formSeries}~${seriesExt}`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => removeAttachment(attachment)} 
                    style={styles.trashIconContainer}
                  >
                    <Icon name="trash-outline" size={20} color="#D9534F" />
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.noAttachmentContainer}>
              <Text style={styles.noAttachmentText}>No Attachments</Text>
            </View>
          )}

        </View>
      );
    })
  )}
</ScrollView>







      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['25%', '50%']}
        enablePanDownToClose={true}
        style={{backgroundColor: '#fff'}}>
        {yearOptions.map(year => (
          <TouchableOpacity
            key={year}
            onPress={() => handleSelectYear(year)}
            style={{padding: 16}}>
            <Text>{year}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  bgHeader: {
    paddingTop: 35,
    height: 80,
    backgroundColor: '#1a508c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
  },
  header: {
  flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
   backButton: {padding: 8, borderRadius: 20},

  input: {marginBottom: 12, marginHorizontal: 16},
  searchButton: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: '#007AFF',
  },

  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 12, // added padding inside card for spacing
    flexDirection: 'column',
  },
  labelUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  indexColumn: {
    width: 24, // fixed width for index column
    alignItems: 'center',
    justifyContent: 'center',
  },

  indexText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
  },

  formLabelColumn: {
    flex: 1, // take remaining space after index column
    paddingLeft: 8,
  },

  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
  },
  attachmentText: {color: '#007AFF', flexShrink: 1},
  attachmentsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    //backgroundColor: '#e6f0ff', // soft light blue background
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF', // blue border line
    marginBottom: 8,
  },
  attachmentsHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004080', // darker blue text
  },
  yearSelection: {
    //marginBottom: 12,
    //marginHorizontal: 16,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    // Optional shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Optional elevation for Android
    elevation: 2,
  },
 noTrackingDataContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 60,
  backgroundColor: '#F0F4FA',
  borderRadius: 12,
  marginHorizontal: 16,
  marginBottom: 16,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

noTrackingIcon: {
  marginBottom: 16,
},

noTrackingDataText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#555',
  textAlign: 'center',
  marginBottom: 8,
},

noTrackingDataSubText: {
  fontSize: 14,
  color: '#888',
  textAlign: 'center',
  paddingHorizontal: 20,
},

cardContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  marginHorizontal: 16,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

labelUploadRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

indexColumn: {
  width: 30,
  alignItems: 'center',
  justifyContent: 'center',
},

indexText: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
},

formLabelColumn: {
  flex: 1,
  paddingLeft: 10,
},

formLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#007AFF',
},

uploadButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#007AFF',
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 8,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
},

noAttachmentContainer: {
  backgroundColor: '#FAFAFA',
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 8,
},

noAttachmentText: {
  fontSize: 14,
  color: '#888',
},

attachmentItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F8FAFF',
  padding: 10,
  borderRadius: 8,
  marginBottom: 8,
},

attachmentText: {
  color: '#007AFF',
  fontWeight: '500',
  flexShrink: 1,
},

trashIconContainer: {
  padding: 4,
},
});

export default AttachmentsScreen;
