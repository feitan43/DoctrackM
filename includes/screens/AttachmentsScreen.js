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
  ToastAndroid,
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
import {
  useUploadTNAttach,
  useAttachmentFiles,
  useTNAttachment,
} from '../hooks/useAttachments';
import {FlashList} from '@shopify/flash-list';
import QRScanner from '../utils/qrScanner';
import {formatFileSize, getQuarter} from '../utils/index';
import { showMessage } from 'react-native-flash-message';
import {useQueryClient } from '@tanstack/react-query';

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
  const [showScanner, setShowScanner] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchQuery) {
      bottomSheetAttachmentRef.current?.expand();
    }
  }, [searchQuery]);

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

  const {data: tnAttachments, refetch} = useTNAttachment(
    selectedYear,
    trackingType,
  );

  const {mutate: uploadMutation, isPending: uploadAttachLoading} =
    useUploadTNAttach();

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

  const pickFile = async formType => {
    try {
      const res = await pick({type: ['image/*', 'application/pdf']});

      if (!res?.length) return;

      const file = res[0];

      setAttachmentFile(prev => {
        const existingFiles = prev?.[formType] || [];

        const isDuplicate = existingFiles.some(f => f.name === file.name);

        if (isDuplicate) {
          ToastAndroid.show('File already picked.', ToastAndroid.SHORT);
          return prev;
        }

        return {
          ...prev,
          [formType]: [...existingFiles, file],
        };

        
      });
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };
  
 const handleUpload = async ( attachmentFile, form, tn, year ) => {

  if (!attachmentFile || attachmentFile.length === 0) {
    showMessage({
      message: 'No items selected for upload.',
      type: 'warning',
      icon: 'warning',
      duration: 3000,
      floating: true,
    });
    return;
  }

  if (!year || !tn || !form) {
    showMessage({
      message: 'Missing required parameters.',
      type: 'danger',
      icon: 'danger',
      floating: true,
      duration: 3000,
    });
    return;
  }
  console.log("tn", attachmentFile, form, tn, year );



 /*  uploadMutation(
    { imagePath: attachmentFile[form], year, tn, form },
    {
      onSuccess: data => {
        showMessage({
          message: `${form} ${data?.message || 'Upload successful!'}`,
          type: 'success',
          icon: 'success',
          floating: true,
          duration: 3000,
        });

        queryClient.invalidateQueries(['attachmentFiles', year, tn, form]);
        queryClient.refetchQueries(['attachmentFiles', year, tn, form]);

        setSelectedFiles([]);

        if (onSuccessCallback) {
          onSuccessCallback();
        }
      },
      onError: error => {
        showMessage({
          message: `${form} Upload failed!`,
          description: error?.message || 'Something went wrong',
          type: 'danger',
          icon: 'danger',
          floating: true,
          duration: 3000,
        });
      },
    }
  ); */
};




  // const handleUpload = async (
  //   items,
  //   year,
  //   tn,
  //   form,
  //   employeeNumber,
  //   onSuccessCallback,
  // ) => {
  //   console.log()

  //   /* if (!items || items.length === 0) {
  //     showMessage({
  //       message: 'No items selected for upload.',
  //       type: 'warning',
  //       icon: 'warning',
  //       duration: 3000,
  //     });
  //     return;
  //   }

  //   if (!year || !tn || !employeeNumber) {
  //     showMessage({
  //       message: 'Missing required parameters.',
  //       type: 'danger',
  //       icon: 'danger',
  //       floating: true,
  //       duration: 3000,
  //     });
  //     return;
  //   }

  //   const imagePath = items.map(item => ({
  //     uri: item?.uri,
  //     name: item?.name,
  //     type: item?.type,
  //   }));

  //   uploadMutation.mutate(
  //     {imagePath, year, tn, form, employeeNumber},
  //     {
  //       onSuccess: data => {
  //         showMessage({
  //           message: `${form} ${data?.message || 'Upload successful!'}`,
  //           type: 'success',
  //           icon: 'success',
  //           floating: true,
  //           duration: 3000,
  //         });

  //         // Invalidate and refetch queries to refresh data
  //         queryClient.invalidateQueries(['attachmentFiles', year, tn, form]);
  //         queryClient.refetchQueries(['attachmentFiles', year, tn, form]);

  //         setSelectedFiles([]);
  //         bottomSheetRef.current?.close();

  //         if (onSuccessCallback) {
  //           onSuccessCallback();
  //         }
  //       },
  //       onError: error => {
  //         showMessage({
  //           message: `${form} Upload failed!`,
  //           description: error?.message || 'Something went wrong',
  //           type: 'danger',
  //           icon: 'danger',
  //           floating: true,
  //           duration: 3000,
  //         });
  //       },
  //     },
  //   ); */
  // };

  const openDocument = uri => {
    Linking.openURL(uri).catch(err =>
      console.error('Error opening file:', err),
    );
  };

  const handleRemoveFile = (formType, indexToRemove) => {
    setAttachmentFile(prev => ({
      ...prev,
      [formType]: prev[formType].filter((_, i) => i !== indexToRemove),
    }));
  };

  const removeAttachment = (formType, index) => {
    setAttachmentFile(prev => ({
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

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        {showScanner ? (
          <QRScanner
            onClose={() => setShowScanner(false)}
            onScan={({year, trackingNumber}) => {
              setSelectedType('All');
              setSearchQuery(trackingNumber);
              setShowScanner(false);
              bottomSheetAttachmentRef.current?.expand();
            }}
          />
        ) : (
          <>
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
                  onPress={() => setShowScanner(true)}
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
                }}></View>

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
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    renderItem={({item, index}) => {
                      const attachmentsArray = item.Attachments
                        ? item.Attachments.split(',').map(str => str.trim())
                        : [];

                      const forms = formTypeMap[item.TrackingType] || [];

                      return (
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
                            //styles.attachmentButton,
                            !['PR', 'PO', 'PX'].includes(item.TrackingType) && {
                              opacity: 0.5,
                            },
                          ]}>
                          <View style={styles.itemContainer}>
                            <Text style={styles.index}>{index + 1}</Text>
                            <View style={styles.infoContainer}>
                              <Text style={styles.label}>
                                {item.TrackingNumber}
                              </Text>
                              {item.TrackingType === 'PR' && (
                                <Text style={styles.value}>
                                  {getQuarter(item.PR_Month)}
                                </Text>
                              )}

                              {item.TrackingType !== 'PR' && (
                                <Text style={styles.value}>
                                  {item.Claimant}
                                </Text>
                              )}

                              <View style={styles.attachmentsContainer}>
                                {forms.map((form, i) => {
                                  const hasForm =
                                    attachmentsArray.includes(form);
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
                                          hasForm
                                            ? 'check-circle'
                                            : 'circle-outline'
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
                                        <Text style={{fontWeight: 600}}>
                                          {i + 1}.{' '}
                                        </Text>
                                        {form}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
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
                      selectedYear === year
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
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
              onChange={index => setSheetIndex(index)}
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              backdropComponent={({style}) =>
                sheetIndex !== -1 ? (
                  <TouchableWithoutFeedback
                    onPress={() => bottomSheetAttachmentRef.current?.close()}>
                    <View
                      style={[style, {backgroundColor: 'rgba(0,0,0,0.5)'}]}
                    />
                  </TouchableWithoutFeedback>
                ) : null
              }>
              <View
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderBottomWidth: 1,
                  borderColor: '#e0e0e0',
                }}>
                <Text
                  style={{fontSize: 16, fontWeight: '600', color: '#007AFF'}}>
                  <Text style={{color: '#333'}}>TN ~ </Text>{' '}
                  {trackingNumber || 'N/A'}
                </Text>

                <Text>
                  <Text style={{fontWeight: '800'}}>
                    {(attachments || [])?.length}
                  </Text>{' '}
                  out of {formOptions.length}
                </Text>
              </View>

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
                            <Text style={styles.indexText}>{index + 1}.</Text>
                          </View>

                          <View style={styles.formLabelColumn}>
                            <Text style={styles.formLabel}>{form}</Text>
                          </View>
                        </View>

                        {filteredAttachments.length > 0 ? (
                          filteredAttachments.map((attachment, idx) => {
                            const filename = attachment.split('/').pop();
                            const [, , formSeries, seriesExt] =
                              filename.split('~');

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
                            {/*   <Text style={styles.noAttachmentText}>
                              Attachments for {form}
                            </Text> */}
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 8,
                              }}
                              onPress={() => pickFile(form)}>
                              <MaterialCommunityIcons
                                name="upload"
                                size={18}
                                color="#007AFF"
                              />
                              <Text style={{color: '#007AFF', marginLeft: 4}}>
                                Browse
                              </Text>
                            </TouchableOpacity>

                            <View style={styles.attachmentList}>
                              {attachmentFile?.[form]?.length > 0 ? (
                                <>
                                  {attachmentFile[form].map((file, index) => {
                                    // Get file extension (lowercase)
                                    const ext = (
                                      file.name ||
                                      file.uri?.split('/').pop() ||
                                      ''
                                    )
                                      .split('.')
                                      .pop()
                                      .toLowerCase();

                                    const iconName = [
                                      'jpg',
                                      'jpeg',
                                      'png',
                                      'gif',
                                      'bmp',
                                      'webp',
                                    ].includes(ext)
                                      ? 'file-image'
                                      : ext === 'pdf'
                                      ? 'file-document'
                                      : 'file-document';

                                    return (
                                      <View
                                        key={index}
                                        style={styles.attachmentCard}>
                                        <View style={styles.fileInfo}>
                                          <MaterialCommunityIcons
                                            name={iconName}
                                            size={20}
                                            color="#007AFF"
                                            style={{marginRight: 6}}
                                          />
                                          <View style={{flexShrink: 1}}>
                                            <Text
                                              style={styles.fileNameText}
                                              numberOfLines={1}
                                              ellipsizeMode="tail">
                                              {file.name ||
                                                file.uri?.split('/').pop() ||
                                                'Unnamed file'}
                                            </Text>
                                            <Text
                                              style={{
                                                color: '#888',
                                                fontSize: 12,
                                                marginTop: 2,
                                              }}>
                                              {formatFileSize(file.size)}
                                            </Text>
                                          </View>
                                        </View>

                                        <TouchableOpacity
                                          onPress={() =>
                                            handleRemoveFile(form, index)
                                          }>
                                          <MaterialCommunityIcons
                                            name="close-circle"
                                            size={22}
                                            color="#FF3B30"
                                          />
                                        </TouchableOpacity>
                                      </View>
                                    );
                                  })}

                                  <TouchableOpacity
                                    style={styles.uploadButton}
                                    onPress={() =>
                                      handleUpload(
                                        attachmentFile,
                                        selectedYear,
                                        trackingNumber,
                                        form,
                                    )
                                    }>
                                    <MaterialCommunityIcons
                                      name="upload"
                                      size={18}
                                      color="#fff"
                                    />
                                    <Text style={styles.uploadButtonText}>
                                      Upload
                                    </Text>
                                  </TouchableOpacity>
                                </>
                              ) : (
                                <Text style={styles.noFilesText}>
                                  No files attached yet
                                </Text>
                              )}
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </BottomSheetScrollView>
            </BottomSheet>
          </>
        )}
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
    color: '#252525',
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
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
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
    //paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    //paddingBottom: 20,
  },
  index: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 40,
    textAlign: 'right',
    color: '#444',
  },
  infoContainer: {
    flex: 1,
    marginStart: 10,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    color: '#007AFF',
    elevation: 1,
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 2, // Added shadowRadius for better shadow rendering on iOS
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
    //backgroundColor: '',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'baseline',
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
  attachmentList: {
    marginTop: 10,
  },
  attachmentList: {
    marginTop: 10,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  fileNameText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  noFilesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AttachmentsScreen;
