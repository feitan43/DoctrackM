import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ImageBackground,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ActivityIndicator} from 'react-native-paper';
import useGenInformation from '../api/useGenInformation';
import {DataTable} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Divider} from '@rneui/themed';
import {pick} from '@react-native-documents/picker';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {
  useUploadTNAttach,
  useRemoveTNAttach,
  useAttachmentFiles,
} from '../hooks/useAttachments';
import {showMessage} from 'react-native-flash-message'; 
import useUserInfo from '../api/useUserInfo';
import {useQueryClient} from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import ZoomableImage from '../utils/ZoomableImage';
import { insertCommas } from '../utils/insertComma';

const DetailScreen = ({route, navigation}) => {
  const {selectedItem} = route.params;
  const {employeeNumber} = useUserInfo();
  const queryClient = useQueryClient();
  const {
    genInformationData,
    genInfoLoading,
    OBRInformation,
    OBRInfoLoading,
    transactionHistory,
    transactionHistoryLoading,
    prpopxDetails,
    prpopxLoading,
    computationBreakdown,
    computationBreakdownLoading,
    paymentBreakdown,
    paymentBreakdownLoading,
    paymentHistory,
    paymentHistoryLoading,
    salaryList,
    salaryListLoading,
  } = useGenInformation(selectedItem.index, selectedItem);

  const {mutate: uploadMutation, isPending: uploadAttachLoading} = useUploadTNAttach();
  const {mutate: removeAttachment, isPending: removeAttachmentLoading} = useRemoveTNAttach();

  const {data: obrFiles, isLoading: obrLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'OBR Form',
  );

  const {data: prFiles, isLoading: prLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'PR Form',
  );

  const {data: rfqFiles, isLoading: rfqLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'RFQ Form',
  );

  const {data: dvFiles, isLoading: dvFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'DV Form',
  );
  const {data: abstractOfBidsFiles, isLoading: abstractOfBidsLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Abstract of Bids',
  );
  const {data: financialProposalFiles, isLoading: financialProposalFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Financial Proposal',
  );
  const {data: invitationToObserverFiles, isLoading: invitationToObserverFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Invitation to Observer',
  );
  const {data: bidEvaluationFiles, isLoading: bidEvaluationFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Bid Evaluation',
  );
  const {data: postQualificationFiles, isLoading: postQualificationFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Post Qualification',
  );
  const {data: certificateOfEligibilityFiles, isLoading: certificateOfEligibilityFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Certificate of Eligibility',
  );
  const {data: philgepsPostingFiles, isLoading: philgepsPostingFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Philgeps Posting',
  );
  const {data: philgepsAwardFiles, isLoading: philgepsAwardFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Philgeps Award',
  );
  const {data: certificationFiles, isLoading: certificationFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Certification (Mode, Award, Minutes)',
  );
  const {data: bacCertFiles, isLoading: bacCertFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Bac Cert (Conspicuous Place)',
  );
  const {data: poFiles, isLoading: poFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'PO Form',
  );
  const {data: acceptanceFiles, isLoading: acceptanceFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Acceptance Form',
  );
  const {data: rfiFiles, isLoading: rfiFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'RFI Form',
  );
  const {data: requestForDeliveryExtensionFiles, isLoading: requestForDeliveryExtensionFilesLoading} = useAttachmentFiles(
    genInformationData?.Year,
    genInformationData?.TrackingNumber,
    'Request for Delivery Extension',
  );


  const [genStatusGuide, setGenStatusGuide] = useState([]);
  const [genStatusOffice, setGenStatusOffice] = useState([]);
  const [genOrderStat, setGenOrderStat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const obrInfoRef = useRef(null);
  const prDetailsRef = useRef(null);
  const remarksRef = useRef(null);
  const transactionHistoryRef = useRef(null);
  const genInfoRef = useRef(null);
  const paymentHistoryRef = useRef(null);

  const [expandedIndex, setExpandedIndex] = useState(null);

  const bottomSheetRef = useRef(null);

  const width = genInformationData
    ? `${(genInformationData.OrderStat / 19) * 100}%`
    : '0%';

  const OBRInfoArray = OBRInformation || [];

  const totalAmount = OBRInfoArray.reduce((total, item) => {
    const amount = item.Amount !== null ? parseFloat(item.Amount) : 0;
    return total + amount;
  }, 0);

  const OBRInfoArray2 = OBRInformation || [];
  const POTOTAL = OBRInfoArray2.reduce(
    (total, item) => total + parseFloat(item.PO_Amount),
    0,
  );

  const SalaryListArray = salaryList || [];
  const salaryListtotalAmount = SalaryListArray.reduce(
    (total, item) => total + parseFloat(item.NetAmount),
    0,
  );

  const prpopxDetailsArray = prpopxDetails || [];
  const prpopxTotalAmount = prpopxDetailsArray.reduce(
    (total, item) => total + parseFloat(item.Total),
    0,
  );

  const paymentBreakdownArray = paymentBreakdown || [];

  const gross = paymentBreakdownArray.reduce(
    (total, item) => total + parseFloat(item.Total),
    0,
  );

  const toggleDescription = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  function removeHtmlTags(text) {
    if (text === null || text === undefined) {
      return '';
    }

    const boldEndRegex = /<\/b>/g;
    const newText = text.replace(boldEndRegex, '</b>\n');
    const htmlRegex = /<[^>]*>/g;
    return newText.replace(htmlRegex, ' ');
  }

  useEffect(() => {
    try {
      setLoading(genInfoLoading);

      if (genStatusGuide && genStatusGuide.length > 0) {
        const StatusOffice = genStatusGuide.map(item => item.Office);
        const OrderStat = genStatusGuide.map(item => item.OrderStat);
        setGenStatusOffice(StatusOffice);
        setGenOrderStat(OrderStat);
      }
    } catch (error) {
      console.error('Error in GenStatusGuide:', error);
      setError(error.message);
    } finally {
      setLoading(genInfoLoading);
    }
  }, [genStatusGuide]);

  useEffect(() => {
    try {
      handlePendingNoteTransformation();
    } catch (error) {
      console.error('Error in renderingPOPRPX:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (transactionHistory && transactionHistory.length > 0) {
      setLoading(transactionHistoryLoading);
    }
  }, [transactionHistory]);

  useEffect(() => {
    if (OBRInformation && OBRInformation.length > 0) {
      setLoading(OBRInfoLoading);
    }
  }, [OBRInformation]);

  useEffect(() => {
    if (prpopxDetails && prpopxDetails.length > 0) {
      setLoading(prpopxLoading);
    }
  }, [prpopxDetails]);

  useEffect(() => {
    if (salaryList && salaryList.length > 0) {
      setLoading(salaryListLoading);
    }
  }, [salaryList]);

  useEffect(() => {
    if (paymentBreakdown && paymentBreakdown.length > 0) {
      setLoading(paymentBreakdownLoading);
    }
  }, [paymentBreakdown]);

  useEffect(() => {
    if (paymentHistory && paymentHistory.length > 0) {
      setLoading(paymentHistoryLoading);
    }
  }, [paymentHistory]);

  const genPendingNote = genInformationData?.Remarks1;

  const modifiedPendingNote = handlePendingNoteTransformation(genPendingNote);

  function handlePendingNoteTransformation(genPendingNote) {
    if (genPendingNote && typeof genPendingNote === 'string') {
      // Add space before each '<span' except for the first one
      const separatedPendingNote = genPendingNote.replace(
        /<span/g,
        (match, offset) => {
          if (offset > 0) {
            return '\n\n<span';
          } else {
            return match;
          }
        },
      );
      const regex = /<[^>]*>/g;
      return separatedPendingNote.replace(regex, '');
    } else {
      return null;
    }
  }

  const handleUpload = async (
    items,
    year,
    tn,
    form,
    employeeNumber,
    onSuccessCallback
  ) => {
    console.log("form", form);
  
    if (!items || items.length === 0) {
      showMessage({
        message: 'No items selected for upload.',
        type: 'warning',
        icon: 'warning',
        duration: 3000,
      });
      return;
    }
  
    if (!year || !tn || !employeeNumber) {
      showMessage({
        message: 'Missing required parameters.',
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 3000,
      });
      return;
    }
  
    const imagePath = items.map(item => ({
      uri: item?.uri,
      name: item?.name,
      type: item?.type,
    }));
  
    uploadMutation(
      { imagePath, year, tn, form, employeeNumber },
      {
        onSuccess: (data) => {
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
          bottomSheetRef.current?.close();
  
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        },
        onError: (error) => {
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
    );
  };
  
  const removeSelectedFile = (attachment, index) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };

  const handleRemove = async (year, tn, form, onSuccessCallback) => {
  
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
  
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete the files for this form?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            removeAttachment(
              { year, tn, form },
              {
                onSuccess: (data) => {
                  showMessage({
                    message: `${form} ${data?.message || 'Remove successful!'}`,
                    type: 'success',
                    icon: 'success',
                    floating: true,
                    duration: 3000,
                  });
  
                  queryClient.invalidateQueries(['attachmentFiles', year, tn, form]);
                  queryClient.refetchQueries(['attachmentFiles', year, tn, form]);
  
                  if (onSuccessCallback) {
                    onSuccessCallback();
                  }
                },
                onError: (error) => {
                  showMessage({
                    message: 'Remove failed!',
                    description: error?.message || 'Something went wrong',
                    type: 'danger',
                    icon: 'danger',
                    floating: true,
                    duration: 3000,
                  });
                },
              }
            );
          },
        },
      ],
      { cancelable: false }
    );
  };
  
  const [selectedFiles, setSelectedFiles] = useState([]);

  const pickFile = async () => {
    try {
      const res = await pick({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        multiple: true,
      });

      if (!res || res.length === 0) {
        return;
      }

      const newFiles = res.filter(
        file =>
          !selectedFiles.some(existingFile => existingFile.uri === file.uri),
      );

      if (newFiles.length === 0) {
        return;
      }
      setSelectedFiles(prevState => [...prevState, ...newFiles]);
    } catch (err) {
    }
  };

  const renderAttachmentPreview = (attachments = [], onRemove) => {
    if (!attachments.length) return null;
    return (
      <BottomSheetFlatList
        data={attachments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
              padding: 10,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              backgroundColor: '#F5F5F5',
              justifyContent: 'space-between', 
            }}>
            {item.uri && (
              <FastImage
                source={{uri: item.uri}}
                style={{width: 60, height: 60, borderRadius: 4}}
              />
            )}
            <View
              style={{
                marginLeft: item.uri ? 8 : 0,
                flexShrink: 1,
                flexGrow: 1,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: 'black',
                  textAlignVertical: 'center',
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeSelectedFile(item, index)}
              style={{
                padding: 16,
                borderRadius: 4,
                backgroundColor: '#D32F2F',
              }}>
              <Icon name={'trash-outline'} size={20} color={'white'} />
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  const [currentFormType, setCurrentFormType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadedUris, setLoadedUris] = useState(new Set());

  const handleAttachFiles = formType => {
    console.log('formType', formType);
    setCurrentFormType(formType);
    bottomSheetRef.current?.present();
  };

  const handleImagePress = (uri, formType) => {
    if (uri !== selectedImage) {
      setSelectedImage(uri);
      setCurrentFormType(formType);
    }
  };

  const renderDetailsPRRequest = (obrFiles, prFiles, rfqFiles) => {
    if (selectedItem.TrackingType === 'PR') {
      return (
        <ScrollView ref={scrollViewRef}>
          <View ref={genInfoRef} style={{marginTop: 10}}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    GENERAL INFORMATION
                  </Text>
                </View>
                <View style={{paddingTop: 10}}>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Office</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.OfficeName.replace(/\\/g, '')}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.TrackingType} {'-'}{' '}
                      {genInformationData.Status}
                    </Text>
                  </View>

                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />

                  <View style={styles.detailItem}>
                    <Text style={styles.label}>OBR Number</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.OBR_Number}
                    </Text>
                  </View>

                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>PR Number</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.PR_Number}
                    </Text>
                  </View>

                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>PR Sched</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.PR_Sched}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Fund</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.Fund}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>EncodedBy</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.EncodedBy}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>DateEncoded</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.DateEncoded}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>DateUpdated</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.DateModified}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                </View>
              </View>
            </View>
          </View>

          <View ref={obrInfoRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    OBR INFORMATION
                  </Text>
                </View>
                <View>
                  <View
                    style={{
                      backgroundColor: 'rgba(0,0,0, 0.5)',
                      padding: 5,
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                        marginEnd: 20,
                        marginStart: 5,
                        flex: 1,
                        fontSize: 12,
                      }}>
                      PROGRAM
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                        marginEnd: 40,
                        flex: 1,
                        fontSize: 12,
                      }}>
                      CODE
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                        marginEnd: 5,
                        flex: 1,
                        textAlign: 'right',
                        fontSize: 12,
                      }}>
                      AMOUNT
                    </Text>
                  </View>

                  {OBRInformation && OBRInformation.length > 0 ? (
                    OBRInformation.map((item, index) => (
                      <View key={index}>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 5,
                            paddingBottom: 15,
                            //borderBottomWidth: 1,
                            paddingStart: 10,
                            //borderBottomColor: 'silver',
                          }}>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'white',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              {item.PR_ProgramCode}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {item.ProgramName}
                            </Text>
                          </View>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'white',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              {item.PR_AccountCode}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {item.AccountTitle}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'flex-end',
                              marginEnd: 10,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'white',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              {insertCommas(item.Amount)}
                            </Text>
                          </View>
                        </View>
                        <Divider
                          width={1.9}
                          color={'rgba(217, 217, 217, 0.1)'}
                          borderStyle={'solid'}
                          marginHorizontal={10}
                          marginBottom={5}
                          style={{bottom: 5}}
                        />
                      </View>
                    ))
                  ) : (
                    <Text
                      style={{color: 'silver', fontFamily: 'Oswald-Regular'}}>
                      No data available
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    alignItems: 'flex-end',
                    paddingRight: 5,
                    paddingBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontFamily: 'Oswald-Regular',
                      paddingEnd: 5,
                      textAlign: 'right',
                    }}>
                    {insertCommas(totalAmount.toFixed(2))}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View ref={prDetailsRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PR DETAILS
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 5,
                  }}>
                  <View style={{width: 180}}>
                    <Text
                      style={{
                        flex: 1,
                        color: 'white',
                        fontFamily: 'Oswald-ExtraLight',
                        marginStart: 5,
                        fontSize: 12,
                      }}>
                      DESCRIPTION
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 2,
                      fontFamily: 'Oswald-ExtraLight',
                      textAlign: 'center',
                      color: 'white',
                      fontSize: 12,
                    }}>
                    QTY | COST
                  </Text>
                  <Text
                    style={{
                      flex: 3,
                      fontFamily: 'Oswald-ExtraLight',
                      textAlign: 'right',
                      color: 'white',
                      marginEnd: 5,
                      fontSize: 12,
                    }}>
                    TOTAL
                  </Text>
                </View>

                <View>
                  {prpopxDetails &&
                    prpopxDetails.map((detail, index) => (
                      <View key={index}>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 5,
                            paddingBottom: 20,
                          }}>
                          <View style={{width: 180}}>
                            <TouchableOpacity
                              onPress={() => toggleDescription(index)}>
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: 12,
                                  fontFamily: 'Oswald-ExtraLight',
                                  paddingRight: 10,
                                  marginStart: 10,
                                  color: 'silver',
                                }}
                                numberOfLines={
                                  expandedIndex === index ? undefined : 3
                                }
                                ellipsizeMode={
                                  expandedIndex === index ? 'clip' : 'tail'
                                }>
                                {detail.Description}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <View style={{flex: 2, alignItems: 'center'}}>
                            <View style={{flexDirection: 'row'}}>
                              <Text
                                style={{
                                  fontFamily: 'Oswald-Medium',
                                  color: 'rgb(27, 35, 39)',
                                  fontSize: 12,
                                  color: 'white',
                                  textAlign: 'center',
                                }}>
                                {Math.floor(detail.Qty)}{' '}
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Oswald-Medium',
                                    color: 'white',
                                  }}>
                                  {detail.Unit}
                                </Text>
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <View
                                style={{
                                  borderBottomWidth: 0.8,
                                  borderColor: 'silver',
                                  width: 70,
                                }}
                              />
                            </View>
                            <View style={{flexDirection: 'row'}}>
                              <Text
                                style={{
                                  fontFamily: 'Oswald-Medium',
                                  textShadowRadius: 1,
                                  color: 'white',
                                  fontSize: 12,
                                  textAlign: 'center',
                                }}>
                                {insertCommas(detail.Amount)}
                              </Text>
                            </View>
                          </View>
                          <View style={{flex: 3}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Oswald-Medium',
                                color: 'white',
                                textShadowRadius: 1,
                                textAlign: 'right',
                                marginEnd: 10,
                              }}>
                              {insertCommas(detail.Total)}
                            </Text>
                          </View>
                        </View>

                        <Divider
                          width={1.9}
                          color={'rgba(217, 217, 217, 0.1)'}
                          borderStyle={'solid'}
                          marginHorizontal={10}
                          marginBottom={5}
                          style={{bottom: 5}}
                        />
                      </View>
                    ))}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingEnd: 10,
                    paddingBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontFamily: 'Oswald-Regular',
                      textAlign: 'right',
                    }}>
                    {insertCommas(prpopxTotalAmount.toFixed(2))}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.obrContainer}>
            <View style={styles.detailsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  alignItems: 'center',
                }}>
                {/* <Icon
                  name={'information-circle-outline'}
                  size={28}
                  color={'rgba(132, 218, 92, 1)'}
                /> */}
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                    marginStart: 10,
                  }}>
                  REMARKS
                </Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  paddingBottom: 15,
                }}>
                <View style={styles.obrRow}>
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'left',
                      width: 'auto',
                    }}>
                    {genInformationData.Remarks1 ? (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Oswald-Regular',
                          color: 'white',
                        }}>
                        {removeHtmlTags(genInformationData.Remarks1)}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Oswald-Regular',
                          color: 'white',
                        }}></Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.obrContainer}>
            <View style={styles.detailsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  alignItems: 'center',
                }}>
                {/* <Icon
                  name={'information-circle-outline'}
                  size={28}
                  color={'rgba(132, 218, 92, 1)'}
                /> */}
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                    marginStart: 10,
                  }}>
                  PENDING NOTE
                </Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  paddingBottom: 15,
                }}>
                <View style={styles.obrRow}>
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'left',
                      width: 'auto',
                    }}>
                    {genInformationData.Remarks ? (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Oswald-Regular',
                          color: 'white',
                        }}>
                        {genInformationData.Remarks}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Oswald-Regular',
                          color: 'white',
                        }}></Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View ref={transactionHistoryRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    TRANSACTION HISTORY
                  </Text>
                </View>

                <View style={{flex: 1}}>
                  {transactionHistory && transactionHistory.length > 0 ? (
                    <DataTable
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        alignSelf: 'center',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        }}>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 3, marginEnd: 15}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            DATE
                          </Text>
                        </View>
                        <View style={{flex: 5}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            STATUS
                          </Text>
                        </View>
                        <View style={{flex: 3, marginEnd: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              textAlign: 'right', // align text to the right for numeric
                              fontSize: 12,
                            }}>
                            COMPLETION
                          </Text>
                        </View>
                      </View>

                      {transactionHistory.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems: 'center',
                            //paddingTop: 10,
                            //paddingBottom: 10,
                            backgroundColor:
                              index % 2 === 0
                                ? 'rgba(0, 0, 0, 0.1)'
                                : 'rgba(0, 0, 0, 0.2)', // Alternating background color
                          }}>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 15}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'silver',
                              }}>
                              {item.DateModified}
                            </Text>
                          </View>
                          <View style={{flex: 5}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Oswald-Regular',
                                color: 'white',
                              }}>
                              {item.Status}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 10}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                textAlign: 'right',
                                color: 'silver',
                              }}>
                              {removeHtmlTags(item.Completion)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </DataTable>
                  ) : (
                    <View style={{backgroundColor: 'white'}}>
                      <Text>No Transaction History available</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {genInformationData.Year === '2025' && (
          <View style={styles.obrContainer}>
            <View style={styles.detailsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'left',
                    marginStart: 10,
                    flex: 1,
                  }}>
                  DIGITAL COPIES
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 15,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                {['OBR Form', 'PR Form', 'RFQ Form'].map((formType, index) => {
                  const files =
                    formType === 'OBR Form'
                      ? obrFiles
                      : formType === 'PR Form'
                      ? prFiles
                      : formType === 'RFQ Form'
                      ? rfqFiles
                      : [];

                  const hasFiles = files && files.length > 0;

                  return (
                    <View
                      key={formType}
                      style={{
                        marginVertical: 10,
                        paddingBottom: 10,
                        borderBottomWidth: 1,
                        borderColor: 'silver',
                      }}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 14, flex: 1, color: '#fff'}}>
                          {`${index + 1}. ${formType}`}
                        </Text>

                        <TouchableOpacity
                          disabled={hasFiles}
                          onPress={() => handleAttachFiles(formType)}
                          style={{
                            backgroundColor: hasFiles ? '#ccc' : '#1976D2',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                            opacity: hasFiles ? 0.5 : 1,
                          }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}>
                            Attach Files
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={!hasFiles}
                          onPress={() =>
                            handleRemove(
                              genInformationData.Year,
                              genInformationData.TrackingNumber,
                              formType,
                            )
                          }
                          style={{
                            backgroundColor: !hasFiles ? '#ccc' : '#ebf8ff',
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            opacity: !hasFiles ? 0.5 : 1,
                          }}>
                          <Icon
                            name={'trash-outline'}
                            size={20}
                            color={'#FF6347'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{marginTop: 5}}>
                        {hasFiles ? (
                          files.map((file, fileIndex) => {
                            const uniqueUri = `${file}?timestamp=${new Date().getTime()}`;
                            const uniqueKey = `${formType}-${file}-${fileIndex}`;

                            return (
                              <View
                                key={uniqueKey}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: 5,
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  padding: 10,
                                }}>
                                <TouchableOpacity
  onPress={() => {
    const fileExtension = file.split('.').pop(); // Get the file extension

    if (fileExtension === 'pdf') {
      // If it's a PDF, initiate the download or open it in a browser
      Linking.openURL(uniqueUri);  // This will open the PDF in the default browser or PDF viewer
    } else {
      // Handle the image or other file types
      handleImagePress(uniqueUri, formType);
    }
  }}
>
  <Text
    style={{
      color: '#fff',
      fontSize: 12,
      flex: 1,
    }}
  >
    {file.split('~').slice(-2).join('~')}
  </Text>
</TouchableOpacity>
                              </View>
                            );
                          })
                        ) : (
                          <Text
                            style={{color: '#ccc', fontSize: 12, marginTop: 5}}>
                            No attached files
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          )}
          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View>
          <Text>No details available for this type.</Text>
        </View>
      );
    }
  };

  const renderDetailsPOOrder = () => {

    
    if (selectedItem.TrackingType === 'PO') {
      return (
        <ScrollView ref={scrollViewRef}>
          <View ref={genInfoRef} style={{marginTop: 10}}>
            <View style={styles.obrContainer}>
              <View
                style={{
                  borderColor: 'gray',
                }}>
                <View style={styles.detailsContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      padding: 10,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    {/* <Icon
                      name={'information-circle-outline'}
                      size={28}
                      color={'rgba(132, 218, 92, 1)'}
                    /> */}
                    <Text
                      style={{
                        fontFamily: 'Oswald-Regular',
                        color: 'white',
                        fontSize: 16,
                        marginStart: 10,
                      }}>
                      GENERAL INFORMATION
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Office</Text>
                    <Text style={styles.labelValue}>
                      {/* {genInformationData.OfficeName} */}
                      {genInformationData.OfficeName.replace(/\\/g, '')}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.TrackingType} {'-'}{' '}
                      {genInformationData.Status}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>TN</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.TrackingNumber}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Supplier</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.Claimant}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Transact Class</Text>
                    <Text
                      style={{
                        width: 230,
                        fontFamily: 'Oswald-Regular',
                        fontSize: 15,
                        //color: 'rgb(22, 178, 217)',
                        color: 'white',
                        marginStart: 10,
                      }}>
                      {genInformationData.ComplexLabel}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>PO Number</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.PO_Number}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>PO Date</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.PoDate}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>OBR Number</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.OBR_Number}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>PR Sched</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.PR_Sched}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>PR TN</Text>
                    <Text
                      style={{
                        width: 230,
                        fontFamily: 'Oswald-Regular',
                        fontSize: 15,
                        //color: '#F93232',
                        color: 'white',
                        marginStart: 10,
                      }}>
                      {genInformationData.PR_TrackingNumber}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Fund</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.Fund}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Nature</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.NatureOfPayment}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Specifics</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.Specifics}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Mode</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.ModeOfProcTitle}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Payment Term</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.PaymentTermLabel}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Invoice Number</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.InvoiceNumber}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Invoice Date</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.InvoiceDate}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>Retention TN</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.RetentionTN}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>EncodedBy</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.EncodedBy}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>DateEncoded</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.DateEncoded}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>DateUpdated</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.DateModified}
                    </Text>
                  </View>
                  <Divider
                    width={1.9}
                    color={'rgba(217, 217, 217, 0.1)'}
                    borderStyle={'dashed'}
                    marginHorizontal={20}
                    marginBottom={5}
                    style={{bottom: 5}}
                  />
                </View>
              </View>
            </View>
          </View>

          <View ref={paymentHistoryRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PAYMENT HISTORY
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 11,
                      fontFamily: 'Oswald-ExtraLight',
                      textAlign: 'left',
                      color: 'white',
                    }}>
                    TN
                  </Text>
                  <View
                    style={{
                      flex: 2,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        //textAlign: 'center',
                        color: 'white',
                      }}>
                      STATUS
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                      }}>
                      GROSS
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                      }}>
                      LD
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                      }}>
                      TOTAL TAX
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                      }}>
                      RETENTION
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                      }}>
                      ADJUSTMENT
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: 'Oswald-ExtraLight',
                        color: 'white',
                      }}>
                      NET
                    </Text>
                  </View>
                </View>

                {paymentHistory && paymentHistory.length > 0 ? (
                  paymentHistory.map(payment => (
                    <View
                      key={payment.TrackingNumber}
                      style={{marginBottom: 5}}>
                      <View style={{flexDirection: 'row'}}>
                        <View style={{width: 90}}>
                          <Text
                            style={{
                              color: 'white',
                              fontFamily: 'Oswald-Regular',
                              paddingRight: 30,
                              paddingStart: 5,
                              fontSize: 12,
                            }}>
                            {payment.TrackingNumber}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'space-around',
                            flexDirection: 'row',
                          }}>
                          <View style={{}}>
                            <Text style={[styles.paymentText]}>
                              {payment.Status}
                            </Text>
                          </View>
                          <Text style={styles.paymentText}>
                            {payment.Gross}
                          </Text>
                          <Text style={styles.paymentText}>
                            {payment.LiquidatedDamages}
                          </Text>
                          <Text style={styles.paymentText}>
                            {payment.TotalTax}
                          </Text>
                          <Text style={styles.paymentText}>
                            {payment.Retention}
                          </Text>
                          <Text style={styles.paymentText}>
                            {payment.AdjustmentAmount}
                          </Text>
                          <Text style={styles.paymentText}>
                            {payment.NetAmount}
                          </Text>
                        </View>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'solid'}
                        marginBottom={5}
                        paddingTop={10}
                        style={{bottom: 5}}
                      />
                    </View>
                  ))
                ) : (
                  <View style={{alignSelf: 'center', padding: 10}}>
                    <Text
                      style={{
                        fontFamily: 'Oswald-Medium',
                        fontSize: 12,
                        color: 'silver',
                      }}>
                      NO RECORD FOUND
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View ref={obrInfoRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    OBR INFORMATION
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 5,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-ExtraLight',
                      color: 'white',
                      marginEnd: 20,
                      marginStart: 5,
                      flex: 1,
                      fontSize: 12,
                    }}>
                    PROGRAM
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Oswald-ExtraLight',
                      color: 'white',
                      marginEnd: 40,
                      flex: 1,
                      fontSize: 12,
                    }}>
                    CODE
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Oswald-ExtraLight',
                      color: 'white',
                      marginEnd: 5,
                      flex: 1,
                      textAlign: 'right',
                      fontSize: 12,
                    }}>
                    AMOUNT
                  </Text>
                </View>

                {OBRInformation && OBRInformation.length > 0 ? (
                  OBRInformation.map((item, index) => (
                    <View key={index}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 5,
                          paddingBottom: 15,
                          //borderBottomWidth: 1,
                          paddingStart: 10,
                          //borderBottomColor: 'silver',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'white',
                              fontFamily: 'Oswald-Regular',
                            }}>
                            {item.PR_ProgramCode}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'silver',
                              fontFamily: 'Oswald-ExtraLight',
                            }}>
                            {item.ProgramName}
                          </Text>
                        </View>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'white',
                              fontFamily: 'Oswald-Regular',
                            }}>
                            {item.PR_AccountCode}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'silver',
                              fontFamily: 'Oswald-ExtraLight',
                            }}>
                            {item.AccountTitle}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            marginEnd: 10,
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'white',
                              fontFamily: 'Oswald-Regular',
                            }}>
                            {insertCommas(item.PO_Amount)}
                          </Text>
                        </View>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'solid'}
                        marginHorizontal={10}
                        marginBottom={5}
                        style={{bottom: 5}}
                      />
                    </View>
                  ))
                ) : (
                  <Text style={{color: 'silver', fontFamily: 'Oswald-Regular'}}>
                    No data available
                  </Text>
                )}

                <View
                  style={{
                    alignItems: 'flex-end',
                    paddingRight: 5,
                    paddingBottom: 10,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontFamily: 'Oswald-Regular',
                      paddingEnd: 5,
                      textAlign: 'right',
                    }}>
                    {insertCommas(POTOTAL.toFixed(2))}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View ref={prDetailsRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PO DETAILS
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 5,
                  }}>
                  <View style={{width: 180}}>
                    <Text
                      style={{
                        flex: 1,
                        color: 'white',
                        fontFamily: 'Oswald-ExtraLight',
                        marginStart: 5,
                        fontSize: 12,
                      }}>
                      DESCRIPTION
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 2,
                      fontFamily: 'Oswald-ExtraLight',
                      textAlign: 'center',
                      color: 'white',
                      fontSize: 12,
                    }}>
                    QTY | COST
                  </Text>
                  <Text
                    style={{
                      flex: 3,
                      fontFamily: 'Oswald-ExtraLight',
                      textAlign: 'right',
                      color: 'white',
                      marginEnd: 5,
                      fontSize: 12,
                    }}>
                    TOTAL
                  </Text>
                </View>

                {prpopxDetails &&
                  prpopxDetails.map((detail, index) => (
                    <View key={index}>
                      <View
                        style={{
                          flexDirection: 'row',
                          //borderBottomWidth: 1,
                          //borderBottomColor: 'silver',
                          paddingVertical: 5,
                          paddingBottom: 20,
                        }}>
                        <View style={{width: 180}}>
                          <TouchableOpacity
                            onPress={() => toggleDescription(index)}>
                            <Text
                              style={{
                                flex: 1,
                                fontSize: 12,
                                fontFamily: 'Oswald-ExtraLight',
                                paddingRight: 10,
                                marginStart: 10,
                                color: 'silver',
                              }}
                              numberOfLines={
                                expandedIndex === index ? undefined : 3
                              }
                              ellipsizeMode={
                                expandedIndex === index ? 'clip' : 'tail'
                              }>
                              {detail.Description}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={{flex: 2, alignItems: 'center'}}>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                fontFamily: 'Oswald-Medium',
                                color: 'rgb(27, 35, 39)',
                                fontSize: 12,
                                color: 'white',
                                textAlign: 'center',
                              }}>
                              {Math.floor(detail.Qty)}{' '}
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'Oswald-Medium',
                                  color: 'white',
                                }}>
                                {detail.Unit}
                              </Text>
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <View
                              style={{
                                borderBottomWidth: 0.8,
                                borderColor: 'silver',
                                width: 70,
                              }}
                            />
                          </View>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                fontFamily: 'Oswald-Medium',
                                textShadowRadius: 1,
                                color: 'white',
                                fontSize: 12,
                                textAlign: 'center',
                              }}>
                              {insertCommas(detail.Amount)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            flex: 3,
                            fontSize: 12,
                            fontFamily: 'Oswald-Medium',
                            color: 'white',
                            textShadowRadius: 1,
                            textAlign: 'right',
                            marginEnd: 10,
                          }}>
                          {insertCommas(detail.Total)}
                        </Text>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'solid'}
                        marginHorizontal={10}
                        marginBottom={5}
                        style={{bottom: 5}}
                      />
                    </View>
                  ))}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingEnd: 10,
                    paddingBottom: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontFamily: 'Oswald-Regular',
                      textAlign: 'right',
                    }}>
                    {insertCommas(prpopxTotalAmount.toFixed(2))}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View ref={remarksRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    REMARKS
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}>
                  <View style={styles.obrRow}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'left',
                        width: 'auto',
                      }}>
                      {genInformationData.Remarks1 ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}>
                          {removeHtmlTags(genInformationData.Remarks1)}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}></Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/*  <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PENDING NOTE
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}>
                  <View style={styles.obrRow}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'left',
                        width: 'auto',
                      }}>
                      {genInformationData.Remarks ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}>
                          {genInformationData.Remarks}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}></Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View ref={transactionHistoryRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    TRANSACTION HISTORY
                  </Text>
                </View>

                <View style={{flex: 1}}>
                  {transactionHistory && transactionHistory.length > 0 ? (
                    <DataTable
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        alignSelf: 'center',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 3, marginEnd: 15}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            DATE
                          </Text>
                        </View>
                        <View style={{flex: 5}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            STATUS
                          </Text>
                        </View>
                        <View style={{flex: 3, marginEnd: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              textAlign: 'right', // align text to the right for numeric
                              fontSize: 12,
                            }}>
                            COMPLETION
                          </Text>
                        </View>
                      </View>

                      {transactionHistory.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems: 'center',
                            //paddingTop: 10,
                            //paddingBottom: 10,
                            backgroundColor:
                              index % 2 === 0
                                ? 'rgba(0, 0, 0, 0.1)'
                                : 'rgba(0, 0, 0, 0.2)', // Alternating background color
                          }}>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 15}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'silver',
                              }}>
                              {item.DateModified}
                            </Text>
                          </View>
                          <View style={{flex: 5}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Oswald-Regular',
                                color: 'white',
                              }}>
                              {item.Status}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 10}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                textAlign: 'right',
                                color: 'silver',
                              }}>
                              {removeHtmlTags(item.Completion)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </DataTable>
                  ) : (
                    <View style={{}}>
                      <Text>No Transaction History available</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        
          {genInformationData.Year === '2025' && (
          <View style={styles.obrContainer}>
            <View style={styles.detailsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'left',
                    marginStart: 10,
                    flex: 1,
                  }}>
                  DIGITAL COPIES
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 15,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                }}>
              {[
                  'OBR Form',
                  'PR Form',
                  'PO Form',
                  'Acceptance Form',
                  'RFI Form',
                  'Request for Delivery Extension'
                ].map((formType, index) => {
                  const files =
                    formType === 'OBR Form'
                      ? obrFiles
                      : formType === 'PR Form'
                      ? prFiles
                      : formType === 'PO Form'
                      ? poFiles
                      : formType === 'Acceptance Form'
                      ? acceptanceFiles
                      : formType === 'RFI Form'
                      ? rfiFiles
                      : formType === 'Request for Delivery Extension'
                      ? requestForDeliveryExtensionFiles
                      : [];

                  const hasFiles = files && files.length > 0;

                  return (
                    <View
                      key={formType}
                      style={{
                        marginVertical: 10,
                        paddingBottom: 10,
                        borderBottomWidth: 1,
                        borderColor: 'silver',
                      }}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 14, flex: 1, color: '#fff'}}>
                        {`${index + 1}. ${formType}`}
                        </Text>

                        <TouchableOpacity
                          disabled={hasFiles || formType === 'PR Form'}
                          onPress={() => handleAttachFiles(formType)}
                          style={{
                            backgroundColor: hasFiles || formType === 'PR Form' ? '#ccc' : '#1976D2',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                            opacity: hasFiles || formType === 'PR Form' ? 0.5 : 1,
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}
                          >
                            Attach Files
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={!hasFiles}
                          onPress={() =>
                            handleRemove(
                              genInformationData.Year,
                              genInformationData.TrackingNumber,
                              formType,
                            )
                          }
                          style={{
                            backgroundColor: !hasFiles ? '#ccc' : '#FF6347',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            opacity: !hasFiles ? 0.5 : 1,
                          }}>
                          <Icon
                            name={'trash-outline'}
                            size={16}
                            color={'#FFFFFF'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{marginTop: 5}}>
                        {hasFiles ? (
                          files.map((file, fileIndex) => {
                            const uniqueUri = `${file}?timestamp=${new Date().getTime()}`;
                            const uniqueKey = `${formType}-${file}-${fileIndex}`;

                            return (
                              <View
                                key={uniqueKey}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: 5,
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  padding: 10,
                                }}>
                                <TouchableOpacity
                                  onPress={() =>
                                    handleImagePress(uniqueUri, formType)
                                  }>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      flex: 1,
                                    }}>
                                    {file.split('~').slice(-2).join('~')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })
                        ) : (
                          <Text
                            style={{color: '#ccc', fontSize: 12, marginTop: 5}}>
                            No attached files
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>       
          )}

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View>
          <Text>No details available for this type.</Text>
        </View>
      );
    }
  };

  const renderDetailsPayment = () => {

 

    if (selectedItem.TrackingType === 'PX') {
      return (
        <ScrollView ref={scrollViewRef}>
          <View ref={genInfoRef} style={{marginTop: 10}}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  {/*  <Icon
                      name={'information-circle-outline'}
                      size={28}
                      color={'rgba(132, 218, 92, 1)'}
                    /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    GENERAL INFORMATION
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Office</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.OfficeName.replace(/\\/g, '')}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.TrackingType} {'-'}{' '}
                    {genInformationData.Status}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                {/*     <View style={styles.detailItem}>
                    <Text style={styles.label}></Text>

                    <Text style={styles.labelValue}>({genStatusOffice})</Text>
                  </View> */}
                {/*    <View style={styles.detailItem}>
                    <Text style={styles.label}></Text>
                    <Text style={styles.labelValue}>
                      <Text style={styles.progressText}>
                        {`${genOrderStat}/19`}{' '}
                      </Text>
                      <Text style={styles.progressText}>
                        {Math.floor(parseFloat(width))}%
                      </Text>
                    </Text>
                  </View> */}

                {/*   <View style={styles.detailItem}>
                  <Text style={styles.label}>TN</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.TrackingNumber}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                /> */}
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Supplier</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.Claimant}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Classification</Text>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      flex: 1,
                      fontSize: 14,
                      //color: 'rgb(22, 178, 217)',
                      color: 'white',
                      marginStart: 10,
                    }}>
                    {genInformationData.ComplexLabel}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>ADV Number</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.ADV === '0'
                      ? ''
                      : genInformationData.ADV}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>OBR Number</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.OBR_Number}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>PR Sched</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.PR_Sched}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Fund</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.Fund}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Check Number.</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.CheckNumber}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Check Dt.</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.CheckDate}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Net Amount</Text>
                  <Text
                    style={[
                      styles.labelValue,
                      {
                        fontFamily: 'Oswald-Regular',
                        flex: 1,
                        fontSize: 14,
                        //color: '#F93232',
                        color: 'white',
                      },
                    ]}>
                    {insertCommas(genInformationData.NetAmount)}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>PR TN</Text>
                  <Text
                    style={[
                      styles.labelValue,
                      {
                        //color: '#F93232',
                        color: 'white',
                      },
                    ]}>
                    {genInformationData.PO_PRTN}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>PO TN</Text>
                  <Text
                    style={[
                      styles.labelValue,
                      {
                        fontFamily: 'Oswald-Regular',
                        flex: 1,
                        fontSize: 14,
                        //color: '#F93232',
                        color: 'white',
                      },
                    ]}>
                    {genInformationData.TrackingPartner}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>PO Number</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.PO_Number}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Retention TN</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.RetentionTN}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Nature</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.PO_Nature}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Specifics</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.PO_Specifics}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Receipt Type</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.SuppType}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Business Type</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.SuppClassification}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Mode of PR</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.ModeOfProcTitle}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Payment Term</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.PaymentTermLabel}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>EncodedBy</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.EncodedBy}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>DateEncoded</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.DateEncoded}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>DateUpdated</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.DateModified}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
              </View>
            </View>
          </View>

          <View ref={obrInfoRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                      name={'information-circle-outline'}
                      size={28}
                      color={'rgba(132, 218, 92, 1)'}
                    /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PARTICULARS
                  </Text>
                </View>
                <View style={styles.obrRow}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: 'Oswald-Light',
                      color: 'silver',
                      padding: 10,
                      paddingHorizontal: 10,
                    }}>
                    {/* {genInformationData.Particulars} */}
                    TO PAYMENT FOR OF THE{' '}
                    <Text style={styles.particularsText}>
                      {genInformationData.OfficeName.replace(/\\/g, '')}
                    </Text>{' '}
                    UNDER P.O#{' '}
                    <Text style={styles.particularsText}>
                      {genInformationData.PO_Number}
                    </Text>{' '}
                    DATED{' '}
                    <Text style={styles.particularsText}>
                      {genInformationData.PoDate}
                    </Text>{' '}
                    WITH INV#{' '}
                    <Text style={styles.particularsText}>
                      {genInformationData.InvoiceNumber}
                    </Text>{' '}
                    DATED:{' '}
                    <Text style={styles.particularsText}>
                      {genInformationData.InvoiceDate}
                    </Text>{' '}
                    AS PER SUPPORTING DOCUMENTS HERETO ATTACHED.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View ref={obrInfoRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/*  <Icon
                      name={'information-circle-outline'}
                      size={28}
                      color={'rgba(132, 218, 92, 1)'}
                    /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    AUDIT AND COMPLIANCE OFFICERS
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Light',
                      fontSize: 14,
                      color: 'silver',
                    }}>
                    Accounting Evaluator{' '}
                  </Text>
                  <Text
                    style={{
                      borderBottomWidth: 0.5,
                      borderBottomColor: 'gray',
                      marginStart: 10,
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      color: 'white',
                    }}>
                    {genInformationData.CAOOfficerName &&
                    genInformationData.CAOOfficerName !== null
                      ? genInformationData.CAOOfficerName
                      : '            '}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View ref={prDetailsRef}>
            <View style={styles.obrContainer}>
              <View>
                {paymentBreakdown &&
                /* paymentBreakdown.length && */
                computationBreakdown /* &&
                computationBreakdown.length > 0 */ ? (
                  <View style={styles.detailsContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        padding: 10,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        alignItems: 'center',
                      }}>
                      {/*  <Icon
                          name={'information-circle-outline'}
                          size={28}
                          color={'rgba(132, 218, 92, 1)'}
                        /> */}
                      <Text
                        style={{
                          fontFamily: 'Oswald-Regular',
                          color: 'white',
                          fontSize: 16,
                          marginStart: 10,
                        }}>
                        PAYMENT BREAKDOWN
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 10,
                        width: '100%',
                      }}>
                      <Text
                        style={{
                          width: '20%',
                          fontSize: 10,
                          fontFamily: 'Oswald-ExtraLight',
                          textAlign: 'center',
                          color: 'white',
                        }}>
                        QTY
                      </Text>
                      <Text
                        style={{
                          width: '20%',
                          fontSize: 10,
                          fontFamily: 'Oswald-ExtraLight',
                          textAlign: 'center',
                          color: 'white',
                        }}>
                        COST
                      </Text>

                      <Text
                        style={{
                          width: '20%',
                          fontSize: 10,
                          fontFamily: 'Oswald-ExtraLight',
                          textAlign: 'left',
                          color: 'white',
                        }}>
                        TOTAL COST
                      </Text>
                      <Text
                        style={{
                          width: '10%',
                          fontSize: 10,
                          fontFamily: 'Oswald-ExtraLight',
                          color: 'white',
                          textAlign: 'center',
                        }}>
                        DAYS DELAYED
                      </Text>
                      <Text
                        style={{
                          width: '15%',

                          fontSize: 10,
                          fontFamily: 'Oswald-ExtraLight',
                          color: 'white',
                          textAlign: 'center',
                        }}>
                        LD
                      </Text>
                      <Text
                        style={{
                          width: '15%',
                          fontSize: 10,
                          fontFamily: 'Oswald-ExtraLight',
                          color: 'white',
                          textAlign: 'center',
                        }}>
                        TOTAL
                      </Text>
                    </View>

                    {paymentBreakdown.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                          borderBottomWidth: 0.2,
                          borderStyle: 'solid',
                          borderBottomColor: '#a0ccff',
                          paddingBottom: 10,
                          padding: 10,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                          }}>
                          <Text
                            style={{
                              marginRight: 5,
                              fontFamily: 'Oswald-ExtraLight',
                              fontSize: 12,
                              color: 'silver',
                            }}>
                            {index + 1}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'column',
                              width: 'auto',
                              width: '18%',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontFamily: 'Oswald-ExtraLight',
                                  textAlign: 'right',
                                  color: 'white',
                                }}>
                                {item.Qty}
                              </Text>
                            </View>
                            <View
                              style={{
                                borderWidth: 0.5,
                                borderColor: 'silver',
                                width: 50,
                                alignSelf: 'center',
                              }}></View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontFamily: 'Oswald-ExtraLight',
                                  textAlign: 'right',
                                  color: 'white',
                                }}>
                                {item.Unit}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: 'column',
                              width: 10,
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              X
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'column',
                              width: '15%',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Oswald-ExtraLight',
                                fontSize: 10,
                                color: 'white',
                              }}>
                              {item.Amount}
                            </Text>
                          </View>

                          <Text
                            style={{
                              width: '20%',
                              fontSize: 10,
                              fontFamily: 'Oswald-ExtraLight',
                              textAlign: 'left',
                              color: 'white',
                              marginStart: 5,
                            }}>
                            {item.Total}
                          </Text>

                          <Text
                            style={{
                              width: '10%',
                              fontSize: 10,
                              fontFamily: 'Oswald-ExtraLight',
                              textAlign: 'center',
                              color: 'white',
                            }}>
                            {Math.floor(item.Days)}
                          </Text>

                          <Text
                            style={{
                              width: '15%',
                              fontSize: 10,
                              fontFamily: 'Oswald-ExtraLight',
                              textAlign: 'left',
                              color: 'white',
                            }}>
                            {item.LiquidatedDamages}
                          </Text>

                          <Text
                            style={{
                              width: '15%',
                              fontSize: 10,
                              fontFamily: 'Oswald-ExtraLight',
                              textAlign: 'left',
                              color: 'white',
                            }}>
                            {item.TotalLD}
                          </Text>
                        </View>

                        <View style={{paddingTop: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-Regular',
                              paddingStart: 10,
                              color: 'orange',
                              fontSize: 11,
                            }}>
                            Description
                          </Text>
                          <TouchableOpacity
                            onPress={() => toggleDescription(index)}>
                            <Text
                              style={{
                                flex: 1,
                                fontSize: 12,
                                fontFamily: 'Oswald-ExtraLight',
                                paddingRight: 10,
                                marginStart: 10,
                                color: 'silver',
                              }}
                              numberOfLines={
                                expandedIndex === index ? undefined : 3
                              }
                              ellipsizeMode={
                                expandedIndex === index ? 'clip' : 'tail'
                              }>
                              {removeHtmlTags(item.Description)}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* </ScrollView> */}
                      </View>
                    ))}
                    <View>
                      <View
                        style={{
                          alignItems: 'flex-end',
                          marginRight: 5,
                          marginTop: 10,
                          paddingBottom: 10,
                        }}>
                        <Text
                          style={{
                            textAlign: 'right',
                            fontFamily: 'Oswald-Regular',
                            fontSize: 20,
                            paddingEnd: 10,
                            color: 'white',
                          }}>
                          {insertCommas(gross.toFixed(2))}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          padding: 10,
                        }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: 'Oswald-Medium',
                            color: 'white',
                          }}>
                          Computation Breakdown
                        </Text>
                      </View>

                      <View
                        style={{
                          padding: 20,
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderColor: 'rgba(255,255,255, 0.5)',
                          margin: 10,
                        }}>
                        <View style={{alignItems: 'flex-end'}}>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                color: 'silver',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              Gross
                            </Text>
                            <Text
                              style={{
                                width: 100,
                                textAlign: 'right',
                                fontFamily: 'Oswald-Regular',
                                fontSize: 16,
                                color: 'white',
                              }}>
                              {insertCommas(gross.toFixed(2))
                                ? insertCommas(gross.toFixed(2))
                                : ''}
                            </Text>
                          </View>

                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                color: 'orange',
                                textShadowRadius: 1,
                                textShadowColor: 'gold',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              LESS
                            </Text>
                            <Text
                              style={{
                                color: 'silver',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              : LiquidatedDamage
                            </Text>
                            <Text
                              style={{
                                width: 100,
                                textAlign: 'right',
                                //color: '#F93232',
                                color: 'white',
                                fontFamily: 'Oswald-Regular',
                                fontSize: 16,
                              }}>
                              {computationBreakdown[0].LiquidatedDamages}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 100,
                              borderWidth: 0.8,
                              borderColor: 'gray',
                              borderStyle: 'dashed',
                            }}></View>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                color: 'silver',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              Total
                            </Text>
                            <Text
                              style={{
                                width: 100,
                                textAlign: 'right',
                                fontFamily: 'Oswald-Regular',
                                fontSize: 16,
                                color: 'white',
                              }}>
                              {insertCommas(computationBreakdown[0].Amount)}
                            </Text>
                          </View>

                          <View style={{flexDirection: 'row', marginTop: 10}}>
                            <Text
                              style={{
                                color: 'silver',
                                fontFamily: 'Oswald-Regular',
                              }}>
                              Non Taxable (5%)
                            </Text>
                            <Text
                              style={{
                                width: 100,
                                textAlign: 'right',
                                fontFamily: 'Oswald-Regular',
                                fontSize: 16,
                                color: 'white',
                                opacity: 0.8,
                              }}>
                              {paymentBreakdown[0].Taxable === '1'
                                ? '0.00'
                                : paymentBreakdown[0].Taxable}
                            </Text>
                          </View>
                        </View>

                        <View style={{paddingTop: 20}}>
                          {computationBreakdown &&
                          computationBreakdown[0].Percentage !== 0 ? (
                            <View>
                              <Text
                                style={{
                                  color: 'skyblue',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                Tax Breakdown
                              </Text>

                              <Text
                                style={{
                                  color: 'white',
                                  fontFamily: 'Oswald-Light',
                                }}>
                                {computationBreakdown.length > 0 &&
                                computationBreakdown[0]
                                  ? computationBreakdown[0].CodeType
                                  : ''}{' '}
                                {computationBreakdown.length > 0 &&
                                computationBreakdown[0]
                                  ? computationBreakdown[0].Amount
                                  : ''}{' '}
                                {computationBreakdown[0]?.Retention !== 0 &&
                                  computationBreakdown[0]?.Retention !==
                                    '0.00' && (
                                    // Display this part only if Retention is not 0 or '0.00'
                                    // Display this part only if Retention is not 0 or '0.00'
                                    // Display this part only if Retention is available
                                    <>
                                      / 1.12 (
                                      <Text
                                        style={{fontFamily: 'Oswald-Regular'}}>
                                        {computationBreakdown.length > 0 &&
                                        computationBreakdown[0]
                                          ? computationBreakdown[0].BaseAmount
                                          : ''}{' '}
                                      </Text>
                                      ){' '}
                                    </>
                                  )}
                                X {computationBreakdown[0].Percentage}%{' '}
                                <Text style={{fontFamily: 'Oswald-Regular'}}>
                                  {computationBreakdown.length > 0 &&
                                  computationBreakdown[0]
                                    ? computationBreakdown[0].PercentageAmount
                                    : ''}
                                </Text>
                              </Text>

                              <Text
                                style={{
                                  color: 'white',
                                  fontFamily: 'Oswald-Light',
                                }}>
                                {computationBreakdown.length > 1 &&
                                computationBreakdown[1]
                                  ? computationBreakdown[1].CodeType
                                  : ''}{' '}
                                {computationBreakdown.length > 1 &&
                                computationBreakdown[1]
                                  ? computationBreakdown[1].Amount
                                  : ''}{' '}
                                {computationBreakdown[1]?.Retention !== 0 &&
                                  computationBreakdown[1]?.Retention !==
                                    '0.00' && (
                                    // Display this part only if Retention is not 0 or '0.00'
                                    // Display this part only if Retention is available
                                    <>
                                      / 1.12 (
                                      <Text
                                        style={{fontFamily: 'Oswald-Regular'}}>
                                        {computationBreakdown.length > 1 &&
                                        computationBreakdown[1]
                                          ? computationBreakdown[1].BaseAmount
                                          : ''}{' '}
                                      </Text>
                                      ){' '}
                                    </>
                                  )}
                                X {computationBreakdown[1].Percentage}%{' '}
                                <Text style={{fontFamily: 'Oswald-Regular'}}>
                                  {computationBreakdown.length > 1 &&
                                  computationBreakdown[1]
                                    ? computationBreakdown[1].PercentageAmount
                                    : ''}
                                </Text>
                              </Text>
                            </View>
                          ) : (
                            <></>
                          )}
                          {computationBreakdown &&
                            computationBreakdown[0].Percentage === 0 && (
                              <Text style={{color: 'skyblue'}}>
                                Tax Breakdown{' '}
                                <Text style={{color: 'gray'}}>
                                  (Tax Exempt)
                                </Text>
                              </Text>
                            )}

                          <View style={{alignItems: 'flex-end', paddingTop: 5}}>
                            <View
                              style={{
                                width: 100,
                                borderWidth: 0.8,
                                borderColor: 'gray',
                                borderStyle: 'dashed',
                              }}></View>
                            <View style={{flexDirection: 'row'}}>
                              <Text
                                style={{
                                  color: 'orange',
                                  textShadowRadius: 1,
                                  textShadowColor: 'gold',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                LESS
                              </Text>
                              <Text
                                style={{
                                  color: 'silver',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                : Total Tax{' '}
                              </Text>
                              {computationBreakdown &&
                              computationBreakdown.Percentage !== 0 ? (
                                <Text
                                  style={{
                                    width: 100,
                                    textAlign: 'right',
                                    //color: '#F93232',
                                    color: 'white',
                                    fontFamily: 'Oswald-Regular',
                                    fontSize: 16,
                                  }}>
                                  {insertCommas(
                                    (
                                      parseFloat(
                                        computationBreakdown[0]
                                          ?.PercentageAmount || 0,
                                      ) +
                                      parseFloat(
                                        computationBreakdown[1]
                                          ?.PercentageAmount || 0,
                                      )
                                    ).toFixed(2),
                                  )}
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    width: 100,
                                    textAlign: 'right',
                                    color: 'red',
                                    textShadowColor: 'red',
                                    textShadowRadius: 1,
                                    fontFamily: 'Oswald-Regular',
                                  }}>
                                  Output
                                </Text>
                              )}
                            </View>
                            {computationBreakdown &&
                              computationBreakdown.Percentage !== 0 && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    paddingTop: 20,
                                  }}>
                                  {computationBreakdown[0].Retention !==
                                    '0.00' && (
                                    <Text
                                      style={{
                                        color: 'silver',
                                        fontFamily: 'Oswald-ExtraLight',
                                      }}>
                                      {computationBreakdown[0].Percentage !==
                                        0 && computationBreakdown[0].Amount
                                        ? `(${computationBreakdown[0].Amount} x 1%)`
                                        : ''}{' '}
                                    </Text>
                                  )}

                                  <Text
                                    style={{
                                      color: 'silver',
                                      fontFamily: 'Oswald-Regular',
                                    }}>
                                    Retention
                                  </Text>
                                  <Text
                                    style={{
                                      width: 100,
                                      textAlign: 'right',
                                      //color: '#F93232',
                                      color: 'white',
                                      fontFamily: 'Oswald-Regular',
                                      fontSize: 16,
                                    }}>
                                    {computationBreakdown[0]?.Retention || 0}
                                  </Text>
                                </View>
                              )}
                          </View>
                        </View>
                      </View>

                      {/*     <View
                          style={{
                            width: 100,
                            borderWidth: 0.8,
                            borderColor: 'gray',
                            borderStyle: 'dashed',
                            width: '100%',
                          }}></View> */}

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          alignSelf: 'flex-end',
                          paddingEnd: 15,
                          paddingBottom: 10,
                        }}>
                        <Text
                          style={{
                            marginRight: 10,
                            color: 'silver',
                            fontFamily: 'Oswald-Regular',
                            fontSize: 16,
                          }}>
                          NetAmount
                        </Text>
                        <Text
                          style={{
                            width: 'auto',
                            textAlign: 'right',
                            fontFamily: 'Oswald-Regular',
                            fontSize: 20,
                            color: 'white',
                          }}>
                          {insertCommas(computationBreakdown[0].NetAmount)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text>No Breakdown available</Text>
                )}
              </View>
            </View>
          </View>

          <View ref={remarksRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/*  <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    REMARKS
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}>
                  <View style={styles.obrRow}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'left',
                        width: 'auto',
                      }}>
                      {genInformationData.Remarks1 ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}>
                          {removeHtmlTags(genInformationData.Remarks1)}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}></Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/*  <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PENDING NOTE
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}>
                  <View style={styles.obrRow}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'left',
                        width: 'auto',
                      }}>
                      {genInformationData.Remarks ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}>
                          {genInformationData.Remarks}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}></Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View ref={transactionHistoryRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    TRANSACTION HISTORY
                  </Text>
                </View>

                <View style={{flex: 1}}>
                  {transactionHistory && transactionHistory.length > 0 ? (
                    <DataTable
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        alignSelf: 'center',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        }}>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 3, marginEnd: 15}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            DATE
                          </Text>
                        </View>
                        <View style={{flex: 5}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            STATUS
                          </Text>
                        </View>
                        <View style={{flex: 3, marginEnd: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              textAlign: 'right', // align text to the right for numeric
                              fontSize: 12,
                            }}>
                            COMPLETION
                          </Text>
                        </View>
                      </View>

                      {transactionHistory.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems: 'center',
                            //paddingTop: 10,
                            //paddingBottom: 10,
                            backgroundColor:
                              index % 2 === 0
                                ? 'rgba(0, 0, 0, 0.1)'
                                : 'rgba(0, 0, 0, 0.2)', // Alternating background color
                          }}>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 15}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'silver',
                              }}>
                              {item.DateModified}
                            </Text>
                          </View>
                          <View style={{flex: 5}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Oswald-Regular',
                                color: 'white',
                              }}>
                              {item.Status}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 10}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                textAlign: 'right',
                                color: 'silver',
                              }}>
                              {removeHtmlTags(item.Completion)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </DataTable>
                  ) : (
                    <View style={{}}>
                      <Text>No Transaction History available</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {genInformationData.Year === '2025' && (
          <View style={styles.obrContainer}>
            <View style={styles.detailsContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'left',
                    marginStart: 10,
                    flex: 1,
                  }}>
                  DIGITAL COPIES
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 15,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                {[
                  'DV Form',
                  'OBR Form',
                  'Abstract of Bids',
                  'Financial Proposal',
                  'Invitation to Observer',
                  'Bid Evaluation',
                  'Post Qualification',
                  'Certificate of Eligibility',
                  'Philgeps Posting',
                  'Philgeps Award',
                  'Certification (Mode, Award, Minutes)',
                  'Bac Cert (Conspicuous Place)',
                ].map((formType, index) => {
                  const files =
                    formType === 'DV Form'
                      ? dvFiles
                      : formType === 'OBR Form'
                      ? obrFiles
                      : formType === 'Abstract of Bids'
                      ? abstractOfBidsFiles
                      : formType === 'Financial Proposal'
                      ? financialProposalFiles
                      : formType === 'Invitation to Observer'
                      ? invitationToObserverFiles
                      : formType === 'Bid Evaluation'
                      ? bidEvaluationFiles
                      : formType === 'Post Qualification'
                      ? postQualificationFiles
                      : formType === 'Certificate of Eligibility'
                      ? certificateOfEligibilityFiles
                      : formType === 'Philgeps Posting'
                      ? philgepsPostingFiles
                      : formType === 'Philgeps Award'
                      ? philgepsAwardFiles
                      : formType === 'Certification (Mode, Award, Minutes)'
                      ? certificationFiles
                      : formType === 'Bac Cert (Conspicuous Place)'
                      ? bacCertFiles
                      : [];

                  const hasFiles = files && files.length > 0;

                  return (
                    <View
                      key={formType}
                      style={{
                        marginVertical: 10,
                        paddingBottom: 10,
                        borderBottomWidth: 1,
                        borderColor: 'silver',
                      }}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 14, flex: 1, color: '#fff'}}>
                          {`${index + 1}. ${formType}`}
                        </Text>

                        <TouchableOpacity
                          disabled={hasFiles}
                          onPress={() => handleAttachFiles(formType)}
                          style={{
                            backgroundColor: hasFiles ? '#ccc' : '#1976D2',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            marginRight: 10,
                            opacity: hasFiles ? 0.5 : 1,
                          }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}>
                            Attach Files
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={!hasFiles}
                          onPress={() =>
                            handleRemove(
                              genInformationData.Year,
                              genInformationData.TrackingNumber,
                              formType,
                            )
                          }
                          style={{
                            backgroundColor: !hasFiles ? '#ccc' : '#FF6347',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 5,
                            opacity: !hasFiles ? 0.5 : 1,
                          }}>
                          <Icon
                            name={'trash-outline'}
                            size={16}
                            color={'#FFFFFF'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{marginTop: 5}}>
                        {hasFiles ? (
                          files.map((file, fileIndex) => {
                            const uniqueUri = `${file}?timestamp=${new Date().getTime()}`;
                            const uniqueKey = `${formType}-${file}-${fileIndex}`;

                            return (
                              <View
                                key={uniqueKey}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: 5,
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  padding: 10,
                                }}>
                                <TouchableOpacity
                                  onPress={() =>
                                    handleImagePress(uniqueUri, formType)
                                  }>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      flex: 1,
                                    }}>
                                    {file.split('~').slice(-2).join('~')}
                                    </Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })
                        ) : (
                          <Text
                            style={{color: '#ccc', fontSize: 12, marginTop: 5}}>
                            No attached files
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          )}

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View>
          <Text>No details available for this type.</Text>
        </View>
      );
    }
  };

  const renderOtherDetails = () => {
    if (
      selectedItem.TrackingType !== 'PR' &&
      selectedItem.TrackingType !== 'PO' &&
      selectedItem.TrackingType !== 'PX'
    ) {
      return (
        <ScrollView ref={scrollViewRef}>
          <View ref={genInfoRef} style={{marginTop: 10}}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  {/* <Icon
                        name={'information-circle-outline'}
                        size={28}
                        color={'rgba(132, 218, 92, 1)'}
                      /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    GENERAL INFORMATION
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Office</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.OfficeName.replace(/\\/g, '')}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.TrackingType} {'-'}{' '}
                    {genInformationData.Status}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                {/*     <View style={styles.detailItem}>
                  <Text style={styles.label}>TN</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.TrackingNumber}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                /> */}
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Classification</Text>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      flex: 1,
                      fontSize: 14,
                      //color: 'rgb(22, 178, 217)',
                      color: 'white',
                      marginStart: 10,
                    }}>
                    {genInformationData.ComplexLabel}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Claimant</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.Claimant}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />

                {genInformationData.TrackingPartner && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>TN Partner</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.TrackingPartner}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                {genInformationData.BatchTracking ? (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>SLP Tracking</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.BatchTracking}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                ) : null}

                {genInformationData.DocumentType === 'SLP' && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Ctrl Number</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.ControlNo}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                {genInformationData.ControlNo &&
                  genInformationData.ControlNo >= 1 && (
                    <>
                      <View style={styles.detailItem}>
                        <Text style={styles.label}>Ctrl Number </Text>
                        <Text style={styles.labelValue}>
                          {genInformationData.ControlNo}
                        </Text>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'dashed'}
                        marginHorizontal={20}
                        marginBottom={5}
                        style={{bottom: 5}}
                      />
                    </>
                  )}

                {/* {(genInformationData.DocumentType.startsWith('REFUND') ||
                  genInformationData.DocumentType.startsWith('SLP') ||
                    genInformationData.DocumentType ===
                      'WAGES - SALARY DIFFERENTIAL' ||
                    genInformationData.DocumentType === 'BOND - OTHERS' ||
                    genInformationData.DocumentType ===
                      'ALLOWANCE - HEALTH AND EMERGENCY' ||
                    genInformationData.DocumentType ===
                      'ALLOWANCE - TRANSPORTATION' ||
                    genInformationData.DocumentType === 'BENEFITS - ELAP' ||
                    genInformationData.DocumentType === 'SLP' ||
                    genInformationData.DocumentType === 'B16')  && (
                    <>
                      <View style={styles.detailItem}>
                        <Text style={styles.label}>ADV Number</Text>
                        <Text style={styles.labelValue}>
                          {genInformationData.ADV}
                        </Text>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'dashed'}
                        marginHorizontal={20}
                        marginBottom={5}
                        style={{bottom: 5}}
                      />
                    </>
                  )} */}

                <View>
                  {(genInformationData.PR_ProgramCode ||
                    genInformationData.ADV) && (
                    <>
                      <View style={styles.detailItem}>
                        <Text style={styles.label}>ADV Number</Text>
                        <Text style={styles.labelValue}>
                          {genInformationData.ADV === '0'
                            ? ''
                            : genInformationData.ADV}
                        </Text>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'dashed'}
                        marginHorizontal={20}
                        marginBottom={5}
                        style={{bottom: 5}}
                      />
                      {genInformationData.OBR_Number ? (
                        <>
                          <View style={styles.detailItem}>
                            <Text style={styles.label}>OBR Number</Text>
                            <Text style={styles.labelValue}>
                              {genInformationData.OBR_Number}
                            </Text>
                          </View>
                          <Divider
                            width={1.9}
                            color={'rgba(217, 217, 217, 0.1)'}
                            borderStyle={'dashed'}
                            marginHorizontal={20}
                            marginBottom={5}
                            style={{bottom: 5}}
                          />
                        </>
                      ) : null}
                    </>
                  )}
                </View>

                {!genInformationData.ClaimType === 'Window' && (
                  <View style={styles.detailItem}>
                    <Text style={styles.label}>OBR Number</Text>
                    <Text style={styles.labelValue}>
                      {genInformationData.OBR_Number}
                    </Text>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </View>
                )}

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Document</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.DocumentType}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Period</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.PeriodMonth}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Claim Type</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.ClaimType}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                {genInformationData.ClaimType === 'Window' && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>PTRS {/* Value */}</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.PTRSNo}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Office Assigned</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.OfficeAssigned}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Fund</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.Fund}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />

                {genInformationData.PeaceOfficeId != 0 &&
                  genInformationData.SubCodeName &&
                  genInformationData.SubCodeFund && (
                    <View>
                      <View style={styles.detailItem}>
                        <Text style={styles.label}>Sub Program</Text>
                        <Text style={styles.labelValue}>
                          <Text style={{color: 'rgb(22, 178, 217)'}}>
                            {genInformationData.SubCodeName}
                          </Text>{' '}
                          {genInformationData.SubCodeFund}
                        </Text>
                      </View>
                      <Divider
                        width={1.9}
                        color={'rgba(217, 217, 217, 0.1)'}
                        borderStyle={'dashed'}
                        marginHorizontal={20}
                        marginBottom={5}
                        style={{bottom: 5}}
                      />
                    </View>
                  )}

                {genInformationData.CheckNumber && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Check Number</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.CheckNumber}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                {genInformationData.CheckDate && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Check Date</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.CheckDate}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                {genInformationData.Amount && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Gross Amount</Text>
                      <Text style={styles.labelValue}>
                        {insertCommas(genInformationData.Amount)}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                {genInformationData.NetAmount && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Net Amount</Text>
                      <Text style={styles.labelValue}>
                        {insertCommas(genInformationData.NetAmount)}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
                  </>
                )}

                {/* {(genInformationData.DocumentType.startsWith('REFUND') ||
  genInformationData.DocumentType === 'BOND - OTHERS' ||
  genInformationData.DocumentType === 'B16') && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>Gross Amount</Text>
                      <Text style={styles.labelValue}>
                        {genInformationData.Amount}
                      </Text>
                    </View>
                    <Divider
                      width={1.9}
                      color={'rgba(217, 217, 217, 0.1)'}
                      borderStyle={'dashed'}
                      marginHorizontal={20}
                      marginBottom={5}
                      style={{bottom: 5}}
                    />
               
                <View style={styles.detailItem}>
                  <Text style={styles.label}>Net Amount</Text>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      flex: 1,
                      fontSize: 14,
                      //color: '#F93232',
                      color: 'white',
                      marginStart: 10,
                    }}>
                    {insertCommas(genInformationData.NetAmount)}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                   </>
                )} */}

                <View style={styles.detailItem}>
                  <Text style={styles.label}>EncodedBy</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.EncodedBy}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>DateEncoded</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.DateEncoded}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
                <View style={styles.detailItem}>
                  <Text style={styles.label}>DateUpdated</Text>
                  <Text style={styles.labelValue}>
                    {genInformationData.DateModified}
                  </Text>
                </View>
                <Divider
                  width={1.9}
                  color={'rgba(217, 217, 217, 0.1)'}
                  borderStyle={'dashed'}
                  marginHorizontal={20}
                  marginBottom={5}
                  style={{bottom: 5}}
                />
              </View>
            </View>
          </View>

          <View ref={obrInfoRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                        name={'information-circle-outline'}
                        size={28}
                        color={'rgba(132, 218, 92, 1)'}
                      /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    AUDIT AND COMPLIANCE OFFICERS
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Oswald-Light',
                      fontSize: 14,
                      color: 'silver',
                    }}>
                    Accounting Evaluator{' '}
                  </Text>
                  <Text
                    style={{
                      borderBottomWidth: 0.5,
                      borderBottomColor: 'gray',
                      marginStart: 10,
                      fontFamily: 'Oswald-Regular',
                      fontSize: 14,
                      color: 'white',
                    }}>
                    {genInformationData.CAOOfficerName &&
                    genInformationData.CAOOfficerName !== null
                      ? genInformationData.CAOOfficerName
                      : '            '}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {genInformationData.DocumentType.includes('SLP') && (
            <View ref={transactionHistoryRef}>
              <View style={styles.obrContainer}>
                <View style={styles.detailsContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      padding: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      alignItems: 'center',
                    }}>
                    {/*  <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                    <Text
                      style={{
                        fontFamily: 'Oswald-Regular',
                        color: 'white',
                        fontSize: 16,
                        marginStart: 10,
                      }}>
                      SALARY LIST OF PAYROLLS
                    </Text>
                  </View>
                  {salaryList && salaryList.length && salaryList.length > 0 ? (
                    <DataTable
                      style={{
                        alignSelf: 'center',
                      }}>
                      <View
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          flexDirection: 'row',
                          paddingVertical: 5,
                        }}>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 3, marginEnd: 15}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            TN
                          </Text>
                        </View>
                        <View style={{flex: 5}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            CLAIMANT
                          </Text>
                        </View>
                        <View style={{flex: 3, marginEnd: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              textAlign: 'right', // align text to the right for numeric
                              fontSize: 12,
                            }}>
                            NET AMOUNT
                          </Text>
                        </View>
                      </View>

                      {salaryList.map((item, index) => (
                        <View key={index}>
                          <View
                            style={{
                              flexDirection: 'row',
                              paddingVertical: 5,
                              backgroundColor:
                                index % 2 === 0
                                  ? 'rgba(0,0,0,0.1)'
                                  : 'rgba(0,0,0,0.2)', // Alternating background color
                            }}>
                            <View style={{flex: 1}}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  color: 'silver',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                {index + 1}
                              </Text>
                            </View>
                            <View style={{flex: 3, marginEnd: 15}}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontFamily: 'Oswald-Regular',
                                  color: 'silver',
                                }}>
                                {item.TrackingNumber}
                              </Text>
                            </View>
                            <View style={{flex: 5}}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontFamily: 'Oswald-Regular',
                                  color: 'white',
                                  textShadowRadius: 1,
                                }}>
                                {item.Claimant}
                              </Text>
                            </View>
                            <View style={{flex: 3, marginEnd: 10}}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontFamily: 'Oswald-ExtraLight',
                                  textAlign: 'right',
                                  color: 'silver',
                                }}>
                                {item.NetAmount}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </DataTable>
                  ) : (
                    <View style={{backgroundColor: ''}}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: 'silver',
                          fontFamily: 'Oswald-Regular',
                          padding: 10,
                        }}>
                        No Transaction History available
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      alignItems: 'flex-end',
                      paddingRight: 5,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 20,
                        fontFamily: 'Oswald-Regular',
                        textAlign: 'right',
                      }}>
                      {insertCommas(salaryListtotalAmount.toFixed(2))}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/*   !genInformationData.DocumentType.includes('REFUND - ELAP') &&
            !genInformationData.DocumentType.includes('BOND - OTHERS') &&
            !genInformationData.DocumentType.includes('SLP')  */}

          {genInformationData.PR_ProgramCode && (
            <View ref={obrInfoRef}>
              <View style={styles.obrContainer}>
                <View style={styles.detailsContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      padding: 10,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      alignItems: 'center',
                    }}>
                    {/* <Icon
                      name={'information-circle-outline'}
                      size={28}
                      color={'rgba(132, 218, 92, 1)'}
                    /> */}
                    <Text
                      style={{
                        fontFamily: 'Oswald-Regular',
                        color: 'white',
                        fontSize: 16,
                        marginStart: 10,
                      }}>
                      OBR INFORMATION
                    </Text>
                  </View>
                  <View>
                    <View
                      style={{
                        backgroundColor: 'rgba(0,0,0, 0.5)',
                        padding: 5,
                        flexDirection: 'row',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Oswald-ExtraLight',
                          color: 'white',
                          marginEnd: 20,
                          marginStart: 5,
                          flex: 1,
                          fontSize: 12,
                        }}>
                        PROGRAM
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Oswald-ExtraLight',
                          color: 'white',
                          marginEnd: 40,
                          flex: 1,
                          fontSize: 12,
                        }}>
                        CODE
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Oswald-ExtraLight',
                          color: 'white',
                          marginEnd: 5,
                          flex: 1,
                          textAlign: 'right',
                          fontSize: 12,
                        }}>
                        AMOUNT
                      </Text>
                    </View>

                    {OBRInformation && OBRInformation.length > 0 ? (
                      OBRInformation.map((item, index) => (
                        <View key={index}>
                          <View
                            style={{
                              flexDirection: 'row',
                              paddingVertical: 5,
                              paddingBottom: 15,
                              //borderBottomWidth: 1,
                              paddingStart: 10,
                              //borderBottomColor: 'silver',
                            }}>
                            <View style={{flex: 1}}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: 'white',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                {item.PR_ProgramCode}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: 'silver',
                                  fontFamily: 'Oswald-ExtraLight',
                                }}>
                                {item.ProgramName}
                              </Text>
                            </View>
                            <View style={{flex: 1}}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: 'white',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                {item.PR_AccountCode}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: 'silver',
                                  fontFamily: 'Oswald-ExtraLight',
                                }}>
                                {item.AccountTitle}
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                alignItems: 'flex-end',
                                marginEnd: 10,
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: 'white',
                                  fontFamily: 'Oswald-Regular',
                                }}>
                                {insertCommas(item.Amount)}
                              </Text>
                            </View>
                          </View>
                          <Divider
                            width={1.9}
                            color={'rgba(217, 217, 217, 0.1)'}
                            borderStyle={'solid'}
                            marginHorizontal={10}
                            marginBottom={5}
                            style={{bottom: 5}}
                          />
                        </View>
                      ))
                    ) : (
                      <Text
                        style={{
                          color: 'silver',
                          fontFamily: 'Oswald-Regular',
                        }}>
                        No data available
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      alignItems: 'flex-end',
                      paddingRight: 5,
                      paddingBottom: 10,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 20,
                        fontFamily: 'Oswald-Regular',
                        paddingEnd: 5,
                        textAlign: 'right',
                      }}>
                      {insertCommas(totalAmount.toFixed(2))}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View ref={remarksRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    REMARKS
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}>
                  <View style={styles.obrRow}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'left',
                        width: 'auto',
                      }}>
                      {genInformationData.Remarks1 ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}>
                          {genInformationData.Remarks1}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}></Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/*  <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    PENDING NOTE
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}>
                  <View style={styles.obrRow}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'left',
                        width: 'auto',
                      }}>
                      {genInformationData.Remarks ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}>
                          {genInformationData.Remarks}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Oswald-Regular',
                            color: 'white',
                          }}></Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View ref={transactionHistoryRef}>
            <View style={styles.obrContainer}>
              <View style={styles.detailsContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                  }}>
                  {/* <Icon
                    name={'information-circle-outline'}
                    size={28}
                    color={'rgba(132, 218, 92, 1)'}
                  /> */}
                  <Text
                    style={{
                      fontFamily: 'Oswald-Regular',
                      color: 'white',
                      fontSize: 16,
                      marginStart: 10,
                    }}>
                    TRANSACTION HISTORY
                  </Text>
                </View>

                <View style={{flex: 1}}>
                  {transactionHistory && transactionHistory.length > 0 ? (
                    <DataTable
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        alignSelf: 'center',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        }}>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 3, marginEnd: 15}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            DATE
                          </Text>
                        </View>
                        <View style={{flex: 5}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              fontSize: 12,
                            }}>
                            STATUS
                          </Text>
                        </View>
                        <View style={{flex: 3, marginEnd: 10}}>
                          <Text
                            style={{
                              fontFamily: 'Oswald-ExtraLight',
                              color: 'white',
                              textAlign: 'right', // align text to the right for numeric
                              fontSize: 12,
                            }}>
                            COMPLETION
                          </Text>
                        </View>
                      </View>

                      {transactionHistory.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            alignItems: 'center',
                            //paddingTop: 10,
                            //paddingBottom: 10,
                            backgroundColor:
                              index % 2 === 0
                                ? 'rgba(0, 0, 0, 0.1)'
                                : 'rgba(0, 0, 0, 0.2)', // Alternating background color
                          }}>
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 12,
                                color: 'silver',
                                fontFamily: 'Oswald-ExtraLight',
                              }}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 15}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                color: 'silver',
                              }}>
                              {item.DateModified}
                            </Text>
                          </View>
                          <View style={{flex: 5}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Oswald-Regular',
                                color: 'white',
                              }}>
                              {item.Status}
                            </Text>
                          </View>
                          <View style={{flex: 3, marginEnd: 10}}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Oswald-ExtraLight',
                                textAlign: 'right',
                                color: 'silver',
                              }}>
                              {removeHtmlTags(item.Completion)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </DataTable>
                  ) : (
                    <View style={{padding: 10}}>
                      <Text
                        style={{fontFamily: 'Oswald-Regular', color: 'silver'}}>
                        {/* No Transaction History available */}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      <View>
        <Text>No details available for this type.</Text>
      </View>;
    }
  };

  const renderEmptyScreen = () => {
    if (
      selectedItem.DocumentType !== 'Payment' &&
      selectedItem.DocumentType !== 'Purchase Request' &&
      selectedItem.DocumentType !== 'Purchase Order'
    ) {
      return (
        <ScrollView ref={scrollViewRef}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 10,
            }}>
            <Text style={{color: 'white'}}>No record found.</Text>
          </View>
        </ScrollView>
      );
    } else {
      return (
        <View>
          <Text>No details available for this type.</Text>
        </View>
      );
    }
  };

  return (
    <BottomSheetModalProvider>
      <ImageBackground
        source={require('../../assets/images/docmobileBG.png')}
        style={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.container}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                position: 'relative',
                paddingTop: 20,
              }}>
              <View
                style={{
                  position: 'absolute',
                  left: 10,
                  borderRadius: 999,
                  overflow: 'hidden',
                }}>
                <Pressable
                  style={({pressed}) => [
                    pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                    {
                      backgroundColor: 'transparent',
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                    },
                  ]}
                  android_ripple={{color: 'gray'}}
                  onPress={() => navigation.goBack()}>
                  <Icon name="chevron-back-outline" size={26} color="white" />
                </Pressable>
              </View>
              <View style={{alignItems: 'center', rowGap: -5}}>
                {genInformationData ? (
                  <>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 20,
                        fontFamily: 'Oswald-Medium',
                        lineHeight: 22,
                      }}>
                      {genInformationData.TrackingNumber}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Oswald-Regular',
                        color: '#FFFFFF',
                      }}>
                      Tracking Number
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 20,
                        fontFamily: 'Oswald-Medium',
                        lineHeight: 22,
                      }}>
                      {''}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Oswald-Regular',
                        color: '#FFFFFF',
                      }}>
                      {/* Tracking Number */}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {genInfoLoading ? (
              <View
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderRadius: 50,
                  marginTop: 10,
                }}>
                <ActivityIndicator
                  size="small"
                  color="white"
                  justifyContent="center"
                  style={{flex: 1}}
                />
              </View>
            ) : (
              <View style={{height: '100%', paddingBottom: 55}}>
              {(() => {
                switch (selectedItem.TrackingType) {
                  case 'PR':
                    return renderDetailsPRRequest(obrFiles, prFiles, rfqFiles);
                  case 'PO':
                    return renderDetailsPOOrder();
                  case 'PX':
                    return renderDetailsPayment();
                  default:
                    return renderOtherDetails();
                }
              })()}
            </View>
            )}
          </View>

          <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={['80%']}>
            <View
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: '#fff',
                borderRadius: 12,
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#444',
                  marginBottom: 10,
                }}>
                {currentFormType === 'OBR Form'
                  ? 'OBR Form'
                  : currentFormType === 'PR Form'
                  ? 'PR Form'
                  : currentFormType === 'RFQ Form'
                  ? 'RFQ Form'
                  : currentFormType === 'PO Form'
                  ? 'PO Form'
                  : currentFormType === 'Acceptance Form'
                  ? 'Acceptance Form'
                  : currentFormType === 'RFI Form'
                  ? 'RFI Form'
                  : currentFormType === 'Request for Delivery Extension'
                  ? 'Request for Delivery Extension'
                  : currentFormType === 'DV Form'
                  ? 'DV Form'
                  : currentFormType === 'Abstract of Bids'
                  ? 'Abstract of Bids'
                   : currentFormType === 'Financial Proposal'
                  ? 'Financial Proposal'
                  : currentFormType === 'Invitation to Observer'
                  ? 'Invitation to Observer'
                  : currentFormType === 'Bid Evaluation'
                  ? 'Bid Evaluation'
                  : currentFormType === 'Post Qualification'
                  ? 'Post Qualification'
                  : currentFormType === 'Certificate of Eligibility'
                  ? 'Certificate of Eligibility'
                  : currentFormType === 'Philgeps Posting'
                  ? 'Philgeps Posting'
                  : currentFormType === 'Philgeps Award'
                  ? 'Philgeps Award'
                  : currentFormType === 'Certification (Mode, Award, Minutes)'
                  ? 'Certification (Mode, Award, Minutes)'
                  : currentFormType === 'Bac Cert (Conspicuous Place)'
                  ? 'Bac Cert (Conspicuous Place)'
                  : 'No form type selected'}
              </Text>
              <TouchableOpacity
                onPress={pickFile}
                style={{
                  borderWidth: 1,
                  borderColor: '#1976D2',
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 6,
                  alignItems: 'center',
                }}>
                <Text
                  style={{color: '#1976D2', fontSize: 16, fontWeight: '500'}}>
                  Browse
                </Text>
              </TouchableOpacity>

              <View style={{flex: 1, alignItems: 'center'}}>
                {selectedFiles.length > 0 ? (
                  renderAttachmentPreview(selectedFiles, handleRemove)
                ) : (
                  <Text
                    style={{fontSize: 14, color: '#666', marginVertical: 10}}>
                    No files selected
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  handleUpload(
                    selectedFiles,
                    genInformationData.Year,
                    genInformationData.TrackingNumber,
                    currentFormType,
                    employeeNumber,
                  )
                }
                style={{
                  backgroundColor: uploadAttachLoading ? '#ccc' : '#1976D2',
                  paddingVertical: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                }}
                disabled={uploadAttachLoading}>
                <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>
                  {uploadAttachLoading ? 'Uploading...' : 'Upload'}{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetModal>
          {selectedImage && (
            <View style={styles.zoomableContainer}>
              <ZoomableImage
                key={selectedImage}
                uri={selectedImage}
                currentFormType={currentFormType}
                close={() => setSelectedImage(null)}
                loadedUris={loadedUris}
                setLoadedUris={setLoadedUris}
              />
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  header: {
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Oswald-Regular',
    lineHeight: 22,
  },
  headerBack: {
    backgroundColor: 'rgb(3, 155, 229)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 5,
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingBottom: 10,
    paddingStart: 10,
  },
  label: {
    width: 75,
    paddingStart: 15,
    color: 'white',
    fontSize: 12,
    fontFamily: 'Oswald-Light',
    opacity: 0.6,
  },
  labelValue: {
    width: '70%',
    color: 'white',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    marginStart: 10,
  },
  obrContainer: {
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  obrHeader: {
    backgroundColor: '#50b738',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
  },
  obrHeaderText: {
    fontSize: 15,
    fontFamily: 'Oswald-Medium',
    textShadowRadius: 1,
    textShadowColor: 'white',
    color: 'white',
  },
  obrHeaderRow: {
    backgroundColor: '#219605',
    padding: 5,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  obrHeaderItem: {
    flex: 1,
    color: 'white',
    marginStart: 5,
  },
  obrDetails: {
    backgroundColor: 'white',
  },
  obrRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  obrLabel: {
    fontFamily: 'Oswald-Regular',
  },
  progressContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  progressBar: {
    height: 25,
    backgroundColor: 'red',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    marginStart: 10,
    top: '50%',
    left: 0,
    right: 0,
    textAlign: 'left',
    color: 'white',
    transform: [{translateY: -10}],
  },
  poobrHeader: {
    backgroundColor: '#rgb(26, 80, 140)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  poobrHeaderRow: {
    backgroundColor: '#rgb(26, 80, 140)',
    padding: 5,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  paymentText: {
    fontFamily: 'Oswald-Light',
    fontSize: 10,
    paddingRight: 5,
    color: 'white', // Example color, change as needed
  },
  particularsText: {
    fontSize: 14,
    color: 'white',
  },
  zoomableContainer: {
    flex: 1,
    position: 'absolute', // Ensures it overlays on top of other content
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DetailScreen;
