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
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ActivityIndicator} from 'react-native-paper';
import useGenInformation from '../api/useGenInformation';
import {DataTable, Divider} from 'react-native-paper';
//import {SafeAreaView} from 'react-native-safe-area-context';
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
import {insertCommas} from '../utils/insertComma';
import {formTypeMap} from '../utils/formTypeMap';
import Loading from '../utils/Loading';
import {
  GeneralInformationCard as PRGeneralInformationCard,
  OBRInformationCard as PROBRInformationCard,
  PRDetailsCard,
  RemarksCard as PRRemarksCard,
  PendingNoteCard as PRPendingNoteCard,
  DigitalCopiesCard as PRDigitalCopiesCard,
  TransactionHistoryCard as PRTransactionHistoryCard,
} from './../components/PRDetails';

import {
  GeneralInformationCard as POGeneralInformationCard,
  PaymentHistoryCard as POPaymentHistoryCard,
  OBRInformationCard as POOBRInformationCard,
  PODetailsCard,
  RemarksCard as PORemarksCard,
  PendingNoteCard as POPendingNoteCard,
  DigitalCopiesCard as PODigitalCopiesCard,
  TransactionHistoryCard as POTransactionHistoryCard,
} from './../components/PODetails';
import {
  GeneralInformationCard as PXGeneralInformationCard,
  ParticularsCard,
  OBRInformationCard as PXOBRInformationCard,
  RemarksCard as PXRemarksCard,
  PendingNoteCard as PXPendingNoteCard,
  DigitalCopiesCard as PXDigitalCopiesCard,
  TransactionHistoryCard as PXTransactionHistoryCard,
} from './../components/PXDetails';
import {
  GeneralInformationCard as PYGeneralInformationCard,
  OBRInformationCard as PYOBRInformationCard,
  RemarksCard as PYRemarksCard,
  PendingNoteCard as PYPendingNoteCard,
  DigitalCopiesCard as PYDigitalCopiesCard,
  TransactionHistoryCard as PYTransactionHistoryCard,
} from './../components/PYDetails';
import {useSafeAreaInsets} from 'react-native-safe-area-context'; // Import this
import {width, height} from '../utils';
import {Shimmer} from '../utils/useShimmer';
const HEADER_HEIGHT = 250;
const PARALLAX_FACTOR = 0.2;

const DetailScreen = ({route, navigation}) => {
  const {selectedItem} = route.params;
  const {
    index: index,
    Year: year,
    TrackingNumber: trackingNumber,
    TrackingType: trackingType,
  } = route.params.selectedItem;

  const {employeeNumber, procurement} = useUserInfo();
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
  } = useGenInformation(index, selectedItem);

  const {mutate: uploadMutation, isPending: uploadAttachLoading} =
    useUploadTNAttach();

  const {mutate: removeAttachment, isPending: removeAttachmentLoading} =
    useRemoveTNAttach();

  const {
    data: attachmentsFiles,
    isLoading: attachmentsFilesLoading,
    isError: attachementsFilesError,
  } = useAttachmentFiles(year, trackingNumber, trackingType);

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
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = event => {
    const y = event.nativeEvent.contentOffset.y;
    setScrolled(y > 0); // true if user has scrolled down
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

  /* useEffect(() => {
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
  }, [genStatusGuide]); */

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
    onSuccessCallback,
  ) => {
    console.log(items, year, tn);
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
      {imagePath, year, tn, form, employeeNumber},
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
          bottomSheetRef.current?.close();

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
      },
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
              {year, tn, form},
              {
                onSuccess: data => {
                  showMessage({
                    message: `${form} ${data?.message || 'Remove successful!'}`,
                    type: 'success',
                    icon: 'success',
                    floating: true,
                    duration: 3000,
                  });

                  queryClient.invalidateQueries([
                    'attachmentFiles',
                    year,
                    tn,
                    form,
                  ]);
                  queryClient.refetchQueries([
                    'attachmentFiles',
                    year,
                    tn,
                    form,
                  ]);

                  if (onSuccessCallback) {
                    onSuccessCallback();
                  }
                },
                onError: error => {
                  showMessage({
                    message: 'Remove failed!',
                    description: error?.message || 'Something went wrong',
                    type: 'danger',
                    icon: 'danger',
                    floating: true,
                    duration: 3000,
                  });
                },
              },
            );
          },
        },
      ],
      {cancelable: false},
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
    } catch (err) {}
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
    setCurrentFormType(formType);
    bottomSheetRef.current?.present();
  };

  const handleImagePress = (uri, formType) => {
    if (uri !== selectedImage) {
      setSelectedImage(uri);
      setCurrentFormType(formType);
    }
  };

  const renderDetailsPRRequest = () => {
    if (selectedItem.TrackingType === 'PR') {
      return (
        <ScrollView ref={scrollViewRef}>
          <View ref={genInfoRef} style={{marginTop: 10}}>
            <PRGeneralInformationCard
              genInformationData={genInformationData}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />
          {/* <View style={{height:10, width:'100%', borderWidth:5}}/> */}
          <View ref={obrInfoRef} style={{marginTop: 20}}>
            <PROBRInformationCard
              OBRInformation={OBRInformation}
              totalAmount={totalAmount}
              insertCommas={insertCommas}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={prDetailsRef} style={{marginTop: 20}}>
            <PRDetailsCard
              prpopxDetails={prpopxDetails}
              prpopxTotalAmount={prpopxTotalAmount}
              insertCommas={insertCommas}
              expandedIndex={expandedIndex}
              toggleDescription={toggleDescription}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={remarksRef} style={{marginTop: 20}}>
            <PRRemarksCard
              genInformationData={genInformationData}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View style={{marginTop: 20}}>
            <PRPendingNoteCard
              genInformationData={genInformationData}
              styles={styles}
            />
          </View>

          {genInformationData.Year == '2025' && procurement === '1' && (
            <>
              <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

              <View style={{marginTop: 20}}>
                <PRDigitalCopiesCard
                  formTypeMap={formTypeMap}
                  attachmentsFiles={attachmentsFiles}
                  handleAttachFiles={handleAttachFiles}
                  handleRemove={handleRemove}
                  year={genInformationData.Year}
                  trackingNumber={trackingNumber} // Ensure trackingNumber is available
                  handleImagePress={handleImagePress}
                  styles={styles}
                />
              </View>
            </>
          )}
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={transactionHistoryRef} style={{marginTop: 20}}>
            <PRTransactionHistoryCard
              transactionHistory={transactionHistory}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
            <POGeneralInformationCard
              genInformationData={genInformationData}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={paymentHistoryRef} style={{marginTop: 20}}>
            <POPaymentHistoryCard
              paymentHistory={paymentHistory}
              removeHtmlTags={removeHtmlTags}
              genInformationData={genInformationData}
              insertCommas={insertCommas}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          {/* <View style={{height:10, width:'100%', borderWidth:5}}/> */}
          <View ref={obrInfoRef} style={{marginTop: 20}}>
            <POOBRInformationCard
              OBRInformation={OBRInformation}
              totalAmount={POTOTAL}
              insertCommas={insertCommas}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={prDetailsRef} style={{marginTop: 20}}>
            <PODetailsCard
              poDetails={prpopxDetails}
              poTotalAmount={POTOTAL}
              insertCommas={insertCommas}
              expandedIndex={expandedIndex}
              toggleDescription={toggleDescription}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={remarksRef} style={{marginTop: 20}}>
            <PORemarksCard
              genInformationData={genInformationData}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View style={{marginTop: 20}}>
            <POPendingNoteCard
              genInformationData={genInformationData}
              styles={styles}
            />
          </View>

          {genInformationData.Year == '2025' && procurement === '1' && (
            <>
              <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

              <View style={{marginTop: 20}}>
                <PODigitalCopiesCard
                  formTypeMap={formTypeMap}
                  attachmentsFiles={attachmentsFiles}
                  handleAttachFiles={handleAttachFiles}
                  handleRemove={handleRemove}
                  year={genInformationData.Year}
                  trackingNumber={trackingNumber} // Ensure trackingNumber is available
                  handleImagePress={handleImagePress}
                  styles={styles}
                />
              </View>
            </>
          )}
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={transactionHistoryRef} style={{marginTop: 20}}>
            <POTransactionHistoryCard
              transactionHistory={transactionHistory}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
            <PXGeneralInformationCard
              genInformationData={genInformationData}
              insertCommas={insertCommas}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={remarksRef} style={{marginTop: 20}}>
            <ParticularsCard genInformationData={genInformationData} />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={remarksRef} style={{marginTop: 20}}>
            <PXRemarksCard
              genInformationData={genInformationData}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View style={{marginTop: 20}}>
            <PXPendingNoteCard
              genInformationData={genInformationData}
              styles={styles}
            />
          </View>

          {genInformationData.Year == '2025' && procurement === '1' && (
            <>
              <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

              <View style={{marginTop: 20}}>
                <PXDigitalCopiesCard
                  formTypeMap={formTypeMap}
                  attachmentsFiles={attachmentsFiles}
                  handleAttachFiles={handleAttachFiles}
                  handleRemove={handleRemove}
                  year={genInformationData.Year}
                  trackingNumber={trackingNumber} // Ensure trackingNumber is available
                  handleImagePress={handleImagePress}
                  styles={styles}
                />
              </View>
            </>
          )}
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={transactionHistoryRef} style={{marginTop: 20}}>
            <PXTransactionHistoryCard
              transactionHistory={transactionHistory}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
            <PYGeneralInformationCard
              genInformationData={genInformationData}
              insertCommas={insertCommas}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={obrInfoRef} style={{marginTop: 20}}>
            <PYOBRInformationCard
              OBRInformation={OBRInformation}
              totalAmount={totalAmount}
              insertCommas={insertCommas}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={remarksRef} style={{marginTop: 20}}>
            <PYRemarksCard
              genInformationData={genInformationData}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View style={{marginTop: 20}}>
            <PYPendingNoteCard
              genInformationData={genInformationData}
              styles={styles}
            />
          </View>

          {genInformationData?.Year === '2025' && procurement === '1' && (
            <>
              <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

              <View style={{marginTop: 20}}>
                <PYDigitalCopiesCard
                  formTypeMap={formTypeMap}
                  attachmentsFiles={attachmentsFiles}
                  handleAttachFiles={handleAttachFiles}
                  handleRemove={handleRemove}
                  year={genInformationData.Year}
                  trackingNumber={trackingNumber} // Ensure trackingNumber is available
                  handleImagePress={handleImagePress}
                  styles={styles}
                />
              </View>
            </>
          )}
          <Divider style={{height: 10, backgroundColor: '#F1F1F1'}} />

          <View ref={transactionHistoryRef} style={{marginTop: 20}}>
            <PYTransactionHistoryCard
              transactionHistory={transactionHistory}
              removeHtmlTags={removeHtmlTags}
              styles={styles}
            />
          </View>

          <View style={{height: 500}} />
        </ScrollView>
      );
    } else {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>No details available for this type.</Text>
        </View>
      );
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

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const parallaxHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT * PARALLAX_FACTOR],
    extrapolate: 'clamp',
  });

  const parallaxHeaderScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [1.2, 1, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [80, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const floatingBackOpacity = scrollY.interpolate({
    inputRange: [80, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2], // Header moves up at half the scroll speed
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2], // Scale only in the first half of scroll
    outputRange: [2, 0.8],
    extrapolate: 'clamp',
  });
  const insets = useSafeAreaInsets();
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;

  const statusBarContentStyle = 'light-content'; // Or 'dark-content'

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle={statusBarContentStyle}
        />
        <View style={{flex: 1}}>
          <Animated.View
            style={{
              position: 'absolute',
              left: 20,
              marginTop: 50,
              borderRadius: 999,
              overflow: 'hidden',
              backgroundColor: 'white',
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'silver',
              zIndex: 999,
              opacity: floatingBackOpacity,
            }}>
            <Pressable
              style={({pressed}) => [
                pressed && {backgroundColor: 'gray'},
                {
                  backgroundColor: 'transparent',
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
              android_ripple={{color: 'gray'}}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back-outline" size={24} color="gray" />
            </Pressable>
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 60 + statusBarHeight,
              backgroundColor: '#007AFF', // This is the background of your header itself
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              borderBottomWidth: 1,
              borderColor: '#ccc',
              opacity: headerOpacity,
              zIndex: 3,
              paddingTop: statusBarHeight,
            }}>
           <Pressable
              style={({pressed}) => [
                pressed && {backgroundColor: '#fff'},
                {
                  backgroundColor: 'transparent',
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
              android_ripple={{color: 'gray'}}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back-outline" size={24} color="#fff" />
            </Pressable>
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontWeight: '800',
                color: '#fff',
              }}>
              {genInformationData?.TrackingNumber || ''}
            </Text>
          </Animated.View>

          <Animated.ScrollView
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              {useNativeDriver: true},
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}>
            <Animated.View
              style={{
                transform: [
                  {translateY: parallaxHeaderTranslateY},
                  {scale: parallaxHeaderScale},
                ],
              }}>
              <ImageBackground
                source={require('../../assets/images/CirclesBG.png')}
                style={{
                  height: 220,
                  justifyContent: 'flex-end',
                }}
                resizeMode="cover">
                <View style={{padding: 20}}>
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    {genInfoLoading ? (
                      <Shimmer width={140} height={20} borderRadius={4} />
                    ) : (
                      <Text style={{color: '#fff', fontSize: 16, fontWeight:'300',textAlign:'center'}}>
                        {genInformationData?.Year}
                        <Text style={{fontSize:20}}>{'  |  '}</Text>
                        <Text style={{fontWeight: '700', fontSize: 20, textAlign:'center'}}>
                          {genInformationData?.TrackingNumber}
                        </Text>
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 5,
                      marginBottom: 5,
                      alignItems: 'baseline',
                    }}>
                    {genInfoLoading ? (
                      <Shimmer width={180} height={25} borderRadius={4} />
                    ) : (
                      <>
                       {/*  <Text style={{color: '#fff', fontWeight: '300'}}>
                          Status{' '}
                        </Text> */}
                        <Text
                          style={{
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: 20,
                          }}>
                          {genInformationData?.TrackingType} -{' '}
                          {genInformationData?.Status}
                        </Text>
                      </>
                    )}
                  </View>

                  {genInfoLoading ? (
                    <Shimmer width={250} height={20} borderRadius={4} />
                  ) : (
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: '300',
                        fontSize: 14,
                      }}>
                      {genInformationData?.OfficeName?.replace(/\\/g, '')}
                    </Text>
                  )}
                </View>
              </ImageBackground>
            </Animated.View>

            {/* Content */}
            <View style={{padding: 10, paddingBottom: 55}}>
              { genInfoLoading ? (
                <>
                  <View
                    style={{
                      rowGap: 10,
                      marginTop: 30,
                      paddingHorizontal: 20,
                      paddingEnd: 20,
                    }}>
                    <Shimmer width={120} height={20} borderRadius={4} />
                    <Shimmer width={300} height={40} borderRadius={4} />
                    <Shimmer width={300} height={40} borderRadius={4} />
                    <Shimmer width={300} height={40} borderRadius={4} />
                    <Shimmer width={300} height={40} borderRadius={4} />
                    <Shimmer width={300} height={40} borderRadius={4} />
                  </View>
                </>
              ) : (
                <>
                  {selectedItem ? (
                    (() => {
                      switch (selectedItem.TrackingType) {
                        case 'PR':
                          return renderDetailsPRRequest();
                        case 'PO':
                          return renderDetailsPOOrder();
                        case 'PX':
                          return renderDetailsPayment();
                        default:
                          return renderOtherDetails();
                      }
                    })()
                  ) : (
                    <Text>No tracking item selected or data loading...</Text>
                  )}
                </>
              )}
            </View>
          </Animated.ScrollView>
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
              <Text style={{color: '#1976D2', fontSize: 16, fontWeight: '500'}}>
                Browse
              </Text>
            </TouchableOpacity>

            <View style={{flex: 1, alignItems: 'center'}}>
              {selectedFiles?.length > 0 ? (
                renderAttachmentPreview(selectedFiles, handleRemove)
              ) : (
                <Text style={{fontSize: 14, color: '#666', marginVertical: 10}}>
                  No files attached
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() =>
                handleUpload(
                  selectedFiles,
                  // Applied optional chaining here as well
                  genInformationData?.Year,
                  genInformationData?.TrackingNumber,
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
              setLoadedUis={setLoadedUris}
            />
          </View>
        )}
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    backgroundColor: 'white',
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
    paddingStart: 10,
  },
  column: {
    //marginHorizontal: 6,
    marginRight: 10,
    //paddingHorizontal:10,
    //borderWidth:1
    //minWidth: 80,
    //borderRightWidth:1,
    borderRightColor: 'silver',
  },
  columnHeader: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  columnValue: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: 'bold',
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
    color: 'rgba(0)',
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
    color: 'white',
  },
  particularsText: {
    fontSize: 14,
    color: 'black',
  },
  zoomableContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    marginHorizontal: 15,
  },
  cardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: 'silver',
  },
  headerText: {
    fontSize: 15,
    //color: '#ffffff',
    fontWeight: '700',
    color: 'rgb(63,129,160)',
    //letterSpacing: 0.5,
  },
  cardDetails: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  labelValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 10,
  },
  cardTable: {
    //marginHorizontal: 10,
    //marginHorizontal:10,
    paddingBottom: 10,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: '#CCCCCC',
  },

  tableHeaderText: {
    flex: 1,
    //fontFamily: 'Inter_28pt-Regular',
    color: '#252525',
    fontSize: 10,
    marginHorizontal: 10,
  },

  tableHeaderTextRight: {
    flex: 1,
    //fontFamily: 'Inter_28pt-Regular',
    color: '#252525',
    fontSize: 12,
    marginHorizontal: 10,
    textAlign: 'right',
  },
  tableRowHeader: {
    flexDirection: 'row',
    //paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginHorizontal: 10,
    //alignItems:'center'
  },

  tableRowMain: {
    //fontFamily: 'Inter_28pt-Regular',
    fontWeight: '500',
    fontSize: 13,
    color: '#252525',
  },

  tableRowSub: {
    //fontFamily: 'Inter_28pt-ExtraLight',
    fontSize: 11,
    color: '#525252',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(217, 217, 217, 0.1)',
    marginVertical: 5,
  },

  noDataText: {
    color: 'silver',
    paddingVertical: 5,
    padding: 10,
    fontWeight: '400',
  },

  totalContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
    paddingRight: 5,
  },

  totalAmount: {
    color: '#EF4444',
    fontSize: 20,
    fontFamily: 'Oswald-Regular',
  },
  parallaxHeaderContainer: {
    height: HEADER_HEIGHT,
    width: width,
    overflow: 'hidden', // Crucial to prevent content from spilling out during transform
  },
  backgroundImage: {
    width: '100%',
    height: 300, // Or whatever height you need
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // This makes the overlay fill the parent
    backgroundColor: 'rgba(0,0,0,0.3)', // The translucent black overlay
    justifyContent: 'center', // Center content vertically within the overlay
    alignItems: 'center', // Center content horizontally within the overlay
  },
  headerContent: {
    // These styles will now apply to the content *inside* the overlay
    paddingHorizontal: 20, // Add some padding
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white', // Ensure text is visible on dark overlay
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)', // Slightly less opaque white for subtitle
  },
  contentContainer: {
    backgroundColor: '#fff',
    // padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -15, // Bring content slightly over the header image
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DetailScreen;
