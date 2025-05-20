import React, {useState, useEffect, useRef, useMemo} from 'react';
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
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {pick} from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TextInput, Button} from 'react-native-paper';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {formTypeMap} from '../utils/formTypeMap';
import {useAttachmentFiles, useTNAttachment} from '../hooks/useAttachments';
import {FlashList} from '@shopify/flash-list';
import {Camera, useCameraDevice, useCodeScanner} from 'react-native-vision-camera';
import { requestCameraPermission, validateQRData } from '../utils/qrScanner';

 


const AttachmentsScreen = ({navigation}) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingType, setTrackingType] = useState('');
  const [formOptions, setFormOptions] = useState([]);
  const bottomSheetRef = useRef(null);
  const bottomSheetTTRef = useRef(null);
  const bottomSheetAttachmentRef = useRef(null);

  const [selectedYear, setSelectedYear] = useState('2025');
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('PO');
  const [refreshing, setRefreshing] = useState(false);
  const [sheetIndex, setSheetIndex] = useState(-1);

   const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);

  const currentYear = new Date().getFullYear();
  const startYear = 2025;

  const yearOptions = [];
  for (let year = startYear; year <= currentYear; year++) {
    yearOptions.push(year.toString());
  }

  const trackingTypeLabels = {
    All: 'All',
    PR: 'Purchase Request',
    PO: 'Purchase Order',
    //PY: 'Voucher',
    PX: 'Payment',
  };

  const trackingTypes = Object.keys(trackingTypeLabels);

  const {data: attachments} = useAttachmentFiles(
    selectedYear,
    trackingNumber,
    trackingType,
  );
  const hasFormAttachments = (trackingType, attachments) => {
    if (!trackingType || !attachments) return false;
    const expectedForms = formTypeMap[trackingType] || [];
    return attachments.some(att => expectedForms.includes(att.formName));
  };

  const {data: tnAttachments, refetch} = useTNAttachment(
    selectedYear,
    trackingType,
  );

  const filteredData = useMemo(() => {
    let data = tnAttachments || [];

    if (selectedType !== 'All') {
      data = data.filter(item => item.TrackingType === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        item =>
          item.TrackingNumber?.toLowerCase().includes(query) ||
          item.Claimant?.toLowerCase().includes(query),
      );
    }

    return data;
  }, [tnAttachments, searchQuery, selectedType]);

  useEffect(() => {
    const options = formTypeMap[trackingType] || [];
    setFormOptions(options);
  }, [trackingType]);

  /*   const handleSearchTrackingNumber = async () => {
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
      console.log('Error fetching tracking data:', error);
    }
  }; */

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

  const handleSelectTT = tt => {
    setTrackingType(tt);
    bottomSheetTTRef.current?.close();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

   const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const raw = codes[0].value;
        const {valid, data} = validateQRData(raw);
        if (valid) {
          Alert.alert('QR Scanned', JSON.stringify(data));
        }
      }
    },
  });

   useEffect(() => {
    requestCameraPermission().then(setHasPermission);
  }, []);

  return (
    <BottomSheetModalProvider>
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
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                //label="Tracking Number"
                placeholder="Tracking Number"
                value={searchQuery}
                keyboardType="default"
                autoCapitalize="characters"
                onChangeText={setSearchQuery}
                theme={{
                  fonts: {
                    labelLarge: {
                      fontSize: 4, // adjust to your preference
                    },
                  },
                }}
              />

              <Icon
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
            </View>
            <Button
              mode="contained"
              //onPress={handleSearchTrackingNumber}
              style={{backgroundColor: '#fff', borderRadius: 5}}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={20}
                color="#007AFF"
              />
            </Button>

            {/* <Button
              mode="elevated"
              onPress={() => bottomSheetRef.current?.expand()}
              style={{
                alignSelf: 'center',
                height: 40,
                width: 40,
                alignItems: 'center',
              }}
              icon={({size, color}) => (
                <MaterialCommunityIcons name="tune" size={22} color={color} />
              )}>
            </Button>
             */}
          </View>
        </ImageBackground>

        <View style={{marginBottom: 20}}>
          <View
            style={{
              flexDirection: 'row',
              //justifyContent: 'space-evenly',
              //alignItems: 'center',
            }}></View>

          {/* Year Picker (Optional) */}
          {/* <View
      style={{
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      }}>
      <Text style={{marginStart: 10}}>Year: </Text>
      <TouchableOpacity
        onPress={() => bottomSheetRef.current?.expand()}
        style={styles.yearSelection}>
        <Text style={{color: '#333'}}>{selectedYear}</Text>
      </TouchableOpacity>
    </View> */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}>
            {trackingTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  selectedType === type && styles.selectedChip,
                ]}
                onPress={() => setSelectedType(type)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedType === type && styles.selectedChipText,
                  ]}>
                  {trackingTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{paddingHorizontal: 20}}>
            <Text>{filteredData.length} results</Text>
          </View>

          <View style={{height: 600}}>
            {!tnAttachments ? (
              <ActivityIndicator
                size="large"
                color="#555"
                style={{marginTop: 20}}
              />
            ) : (
              <FlashList
                data={filteredData}
                keyExtractor={(item, index) => item.TrackingNumber + index}
                estimatedItemSize={77}
                refreshing={refreshing} // <-- make sure this is boolean
                onRefresh={handleRefresh}
                renderItem={({item, index}) => {
                  // split attachments into array, trim spaces
                  const attachmentsArray = item.Attachments
                    ? item.Attachments.split(',').map(str => str.trim())
                    : [];

                  // get relevant forms for the item's tracking type
                  const forms = formTypeMap[item.TrackingType] || [];

                  return (
                    <View style={styles.itemContainer}>
                      <Text style={styles.index}>{index + 1}</Text>
                      <View style={styles.infoContainer}>
                        <Text style={styles.label}>{item.TrackingNumber}</Text>
                        <Text style={styles.value}>{item.Claimant}</Text>
                        <View style={styles.attachmentsContainer}>
                          {forms.map((form, i) => {
                            const hasForm = attachmentsArray.includes(form);
                            return (
                              <View
                                key={i}
                                style={[
                                  styles.formTag,
                                  hasForm
                                    ? styles.formTagChecked
                                    : styles.formTagUnchecked,
                                ]}>
                                <MaterialCommunityIcons
                                  name={
                                    hasForm ? 'check-circle' : 'circle-outline'
                                  }
                                  size={14}
                                  color={hasForm ? 'green' : '#ccc'}
                                  style={{marginRight: 4}}
                                />
                                <Text
                                  style={[
                                    styles.formTagText,
                                    hasForm && styles.formTagTextChecked,
                                  ]}>
                                  {form}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          bottomSheetAttachmentRef.current?.expand();
                          setTrackingNumber(item.TrackingNumber);
                          setTrackingType(item.TrackingType);
                        }}
                        disabled={
                          !['PR', 'PO', 'PX'].includes(item.TrackingType)
                        }
                        style={[
                          styles.attachmentButton,
                          !['PR', 'PO', 'PX'].includes(item.TrackingType) && {
                            opacity: 0.5,
                          },
                        ]}>
                        <MaterialCommunityIcons
                          name="paperclip"
                          size={30}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }}
                ListEmptyComponent={() => (
                  <View style={styles.noTrackingDataContainer}>
                    <MaterialCommunityIcons
                      name="file-search-outline"
                      size={48}
                      color="#aaa"
                    />
                    <Text style={styles.noTrackingDataText}>
                      No tracking data found.
                    </Text>
                  </View>
                )}
                ListHeaderComponentStyle={{paddingBottom: 20}}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 20}}
              />
            )}
          </View>

          {/*   <TextInput
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
        </Button> */}
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['25%', '50%']}
          enablePanDownToClose={true}
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
          }}>
          <View
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#ddd',
            }}>
            <Text style={{fontSize: 18, fontWeight: '600', color: '#333'}}>
              Select Year
            </Text>
          </View>

          {yearOptions.map(year => (
            <TouchableOpacity
              key={year}
              onPress={() => handleSelectYear(year)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                backgroundColor: '#fafafa',
              }}
              activeOpacity={0.7}>
              <MaterialCommunityIcons
                name={
                  selectedYear === year ? 'radiobox-marked' : 'radiobox-blank'
                }
                size={20}
                color={selectedYear === year ? '#007AFF' : '#999'}
              />
              <Text style={{fontSize: 16, color: '#555', marginLeft: 12}}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </BottomSheet>

        <BottomSheet
          ref={bottomSheetTTRef}
          index={-1}
          snapPoints={['25%', '50%']}
          enablePanDownToClose={true}
          style={{backgroundColor: '#fff'}}>
          {trackingTypes.map(tt => (
            <TouchableOpacity
              key={tt}
              onPress={() => handleSelectTT(tt)}
              style={{padding: 16}}>
              <Text>{tt}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheet>

        <BottomSheet
          ref={bottomSheetAttachmentRef}
          index={-1}
          snapPoints={['50%', '90%']}
          enablePanDownToClose={true}
          onChange={index => setSheetIndex(index)} // track index
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          backdropComponent={({style}) =>
            sheetIndex !== -1 ? ( // show only if expanded
              <TouchableWithoutFeedback
                onPress={() => bottomSheetAttachmentRef.current?.close()}>
                <View style={[style, {backgroundColor: 'rgba(0,0,0,0.5)'}]} />
              </TouchableWithoutFeedback>
            ) : null
          }>
          <BottomSheetScrollView
            contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}
            showsVerticalScrollIndicator={false}>
            {!tnAttachments ? (
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
                  Enter the tracking number above to check for available
                  documents.
                </Text>
              </View>
            ) : (
              formOptions.map((form, index) => {
                const filteredAttachments = (attachments || []).filter(
                  attachment => {
                    const fileName = attachment.split('~')[2];
                    return fileName === form;
                  },
                );

                return (
                  <View key={form} style={styles.cardContainer}>
                    <View style={styles.labelUploadRow}>
                      <View style={styles.indexColumn}>
                        <Text style={styles.indexText}>{index + 1}</Text>
                      </View>

                      <View style={styles.formLabelColumn}>
                        <Text style={styles.formLabel}>{form}</Text>
                      </View>

                      {/*  <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => pickFile(form)}
                        activeOpacity={0.7}>
                        <MaterialCommunityIcons
                          name="cloud-upload-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={{color: 'white', marginLeft: 6}}>
                          Upload
                        </Text>
                      </TouchableOpacity> */}
                    </View>

                    {filteredAttachments.length > 0 ? (
                      filteredAttachments.map((attachment, idx) => {
                        const filename = attachment.split('/').pop();
                        const [, , formSeries, seriesExt] = filename.split('~');

                        return (
                          <View key={idx} style={styles.attachmentItem}>
                            <TouchableOpacity
                              onPress={() => openDocument(attachment)}>
                              <Text style={styles.attachmentText}>
                                {`${formSeries}~${seriesExt}`}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => removeAttachment(attachment)}
                              style={styles.trashIconContainer}>
                              <Icon
                                name="trash-outline"
                                size={20}
                                color="#D9534F"
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.noAttachmentContainer}>
                        <Text style={styles.noAttachmentText}>
                          No Attachments
                        </Text>
                        <TouchableOpacity style={{flexDirection:'row'}} onPress={() => pickFile(form)}>
                          <MaterialCommunityIcons
                            name="upload"
                            size={18}
                            color="#007AFF"
                          />

                          <Text style={{color: '#007AFF'}}>Upload</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  bgHeader: {
    paddingTop: 35,
    height: 100,
    backgroundColor: '#1a508c',
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
  backButton: {padding: 5, borderRadius: 20},

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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 2},
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
  searchContainer: {
    width: '65%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: '#000',
    backgroundColor: 'white',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#fff',
  },
  selectedChip: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  chipText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  index: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 30,
    textAlign: 'center',
    color: '#444',
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    marginBottom: 6,
    color: '#000',
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: '#aaa',
  },
  attachmentButton: {
    alignSelf: 'center',
    //backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  formTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  formTagChecked: {
    backgroundColor: '#e0f8e9',
    borderColor: 'green',
  },
  formTagUnchecked: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  formTagText: {
    fontSize: 12,
    color: '#555',
  },
  formTagTextChecked: {
    color: 'green',
    fontWeight: '600',
  },
});

export default AttachmentsScreen;
