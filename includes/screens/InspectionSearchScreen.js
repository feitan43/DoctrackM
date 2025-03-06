import React, {useState, memo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Animated,
  Modal,
  Button,
  Image,
  Alert,
  Platform,
  ToastAndroid,
  TouchableWithoutFeedback,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';

import Icon from 'react-native-vector-icons/Ionicons';
import {CheckBox} from '@rneui/themed';
import {TouchableOpacity} from 'react-native-gesture-handler';
import useInspection from '../api/useInspection';
import BottomSheet from '@gorhom/bottom-sheet';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import useFileUpload from '../api/useFileUpload';
import {request, PERMISSIONS} from 'react-native-permissions';
import useGetImage from '../api/useGetImage';
import { insertCommas } from '../utils/insertComma';

import { RenderInspection, Footer } from './InspectionDetails';

// export const RenderInspection = memo(
//   ({
//     item,
//     inspectorImages,
//     selectedYear,
//     dataItems,
//     checkedItems,
//     setCheckedItems,
//     setUploading,
//   }) => {
//     const handleCheck = index => {
//       const updatedCheckedItems = [...checkedItems];
//       updatedCheckedItems[index] = !updatedCheckedItems[index];
//       setCheckedItems(updatedCheckedItems);
//     };

//     const [imagePath, setImagePath] = useState([]);

//     const handleUploadBottomSheet = () => {
//       setUploading(prev => !prev);
//     };

//     const [fetchTimestamp, setFetchTimestamp] = useState(Date.now());

//     useEffect(() => {
//       fetchData();
//     }, []);

//     const fetchData = async () => {
//       setFetchTimestamp(Date.now());
//     };

//     const renderInspectorImage = (uri, index) => (
//       <TouchableOpacity
//         key={`${index}-${fetchTimestamp}`}
//         onPress={() => openImageModal(uri)}>
//         <FastImage
//           source={{uri, priority: FastImage.priority.high, cache: 'web'}}
//           style={{
//             width: 160,
//             height: 150,
//             borderColor: '#ccc',
//             borderWidth: 2,
//             borderRadius: 8,
//             marginBottom: 10,
//           }}
//           resizeMode={FastImage.resizeMode.cover}
//         />
//       </TouchableOpacity>
//     );

//     const openImageModal = uri => {
//       setSelectedImage(uri);
//       setShowImageModal(true);
//     };

//     const closeImageModal = () => {
//       setSelectedImage(null);
//       setShowImageModal(false);
//     };

//     const [selectedImage, setSelectedImage] = useState(null);
//     const [showImageModal, setShowImageModal] = useState(false);

//     return (
//       <View
//         style={{
//           backgroundColor: '#FFFFFF',
//           borderRadius: 5,
//           paddingBottom: 400,
//         }}>
//         <View style={{padding: 5}}>
//           <Text
//             style={{
//               color: '#14385D',
//               backgroundColor: 'rgba(0,0,0,0.02)',
//               fontWeight: '600',
//               padding: 10,
//             }}>
//             PO Details
//           </Text>

//           <View style={{padding: 10}}>
//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 1
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>Office</Text>
//               <Text style={[styles.value, {flex: 3}]}>{item.OfficeName}</Text>
//             </View>

//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 2
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>
//                 Claimant
//               </Text>
//               <Text style={[styles.value, {flex: 3}]}>{item.Claimant}</Text>
//             </View>

//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 3
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>
//                 PO TN #
//               </Text>
//               <Text style={[styles.value, {flex: 3}]}>
//                 {item.TrackingNumber}
//               </Text>
//             </View>

//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 4
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>Status</Text>
//               <Text style={[styles.value, {flex: 3}]}>{item.Status}</Text>
//             </View>

//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 5
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>
//                 PO Number
//               </Text>
//               <Text style={[styles.value, {flex: 3}]}>{item.PO_Number}</Text>
//             </View>

//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 6
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>Amount</Text>
//               <Text style={[styles.value, {flex: 3}]}>{insertCommas(item.Amount)}</Text>
//             </View>

//             <View style={{flexDirection: 'row', paddingVertical: 2}}>
//               <Text
//                 style={{
//                   paddingHorizontal: 10,
//                   fontSize: 12,
//                   fontWeight: 'bold',
//                   color: '#224E83',
//                 }}>
//                 7
//               </Text>
//               <Text style={{flex: 1, fontSize: 12, color: '#555'}}>
//                 Conform Date
//               </Text>
//               <Text style={[styles.value, {flex: 3}]}>{item.ConformDate}</Text>
//             </View>
//           </View>

//           <View style={{paddingTop: 10}}>
//             <Text
//               style={{
//                 color: '#14385D',
//                 backgroundColor: 'rgba(0,0,0,0.02)',
//                 fontWeight: '600',
//                 padding: 10,
//               }}>
//               Payment Details
//             </Text>

//             <View>
//               {dataItems?.vouchers?.length > 0 ? (
//                 dataItems.vouchers.map((voucher, index) => (
//                   <View key={index} style={{paddingTop: 10}}>
//                     <View style={{flexDirection: 'row', paddingVertical: 2}}>
//                       <Text
//                         style={{
//                           paddingHorizontal: 10,
//                           fontSize: 12,
//                           fontWeight: 'bold',
//                           color: '#224E83',
//                         }}>
//                         8
//                       </Text>
//                       <Text style={{flex: 1, fontSize: 12, color: '#555'}}>
//                         Tracking #
//                       </Text>
//                       <Text style={[styles.value, {flex: 3}]}>
//                         {voucher.TrackingNumber}
//                       </Text>
//                     </View>
//                     <View style={{flexDirection: 'row', paddingVertical: 2}}>
//                       <Text
//                         style={{
//                           paddingHorizontal: 10,
//                           fontSize: 12,
//                           fontWeight: 'bold',
//                           color: '#224E83',
//                         }}>
//                         9
//                       </Text>
//                       <Text style={{flex: 1, fontSize: 12, color: '#555'}}>
//                         Status
//                       </Text>
//                       <Text style={[styles.value, {flex: 3}]}>
//                         {voucher.Status}
//                       </Text>
//                     </View>
//                   </View>
//                 ))
//               ) : (
//                 <View
//                   style={{
//                     padding: 10,
//                     marginTop: 10,
//                     alignItems: 'center',
//                     borderWidth: 1,
//                     borderColor: '#ccc',
//                   }}>
//                   <Text style={{fontSize: 12, color: '#555'}}>
//                     No Record Found
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>

//           <View style={{paddingTop: 10}}>
//             <Text
//               style={{
//                 color: '#14385D',
//                 backgroundColor: 'rgba(0,0,0,0.02)',
//                 fontWeight: '600',
//                 padding: 10,
//               }}>
//               Items
//             </Text>

//             {dataItems &&
//             dataItems.poRecord &&
//             dataItems.poRecord.length > 0 ? (
//               dataItems.poRecord.map((dataItem, index) => (
//                 <View key={index} style={styles.itemContainer}>
//                   <View
//                     style={{
//                       flex: 1,
//                       backgroundColor: checkedItems[index]
//                         ? '#C5E6FE'
//                         : '#F4F4F4', // Change color if checked
//                       marginTop: 10,
//                       paddingVertical: 10,
//                     }}>
//                     <View
//                       style={{
//                         flex: 1,
//                         flexDirection: 'row',
//                       }}>
//                       <View style={{width: '10%'}}>
//                         <Text
//                           style={{
//                             fontSize: 14,
//                             fontWeight: 'bold',
//                             color: '#224E83',
//                             textAlign: 'center',
//                           }}>
//                           {index + 1}
//                         </Text>
//                       </View>
//                       <View style={{flexDirection: 'column', width: '35%'}}>
//                         <Text style={{fontSize: 12, color: '#555'}}>
//                           Quantity
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: 12,
//                             fontWeight: 'bold',
//                             color: '#333',
//                           }}>
//                           {insertCommas(Math.floor(dataItem.Qty))}{' '}
//                           <Text style={{fontWeight: 400}}>{dataItem.Unit}</Text>
//                         </Text>
//                       </View>

//                       <View style={{flexDirection: 'column', width: '35%'}}>
//                         <Text style={{fontSize: 12, color: '#555'}}>Total</Text>
//                         <Text
//                           style={{
//                             fontSize: 12,
//                             fontWeight: 'bold',
//                             color: '#333',
//                             textAlign: 'left',
//                           }}>
//                           {insertCommas(dataItem.Total)}
//                         </Text>
//                       </View>

//                       <View style={{flexDirection: 'column', width: '20%'}}>
//                         <CheckBox
//                           checked={checkedItems[index]}
//                           onPress={() => handleCheck(index)}
//                           containerStyle={{
//                             //padding: 2,
//                             padding: 0,
//                             backgroundColor: 'transparent',
//                             alignSelf: 'center',
//                           }}
//                           checkedColor="#ECAD0D"
//                           uncheckedColor="gray"
//                         />
//                       </View>
//                     </View>

//                     <View style={{flexDirection: 'row'}}>
//                       <View
//                         style={{
//                           flex: 1,
//                           flexDirection: 'row',
//                         }}>
//                         <View
//                           style={{
//                             flexDirection: 'column',
//                             marginStart: 10,
//                             marginTop: 15,
//                           }}>
//                           <Text
//                             style={{
//                               fontSize: 12,
//                               color: '#555',
//                               fontWeight: '400',
//                               padding: 5,
//                             }}>
//                             Description
//                           </Text>
//                           <Text
//                             style={{
//                               fontSize: 12,
//                               fontWeight: '400',
//                               color: '#333',
//                               lineHeight: 18,
//                               margin: 5,
//                             }}>
//                             {dataItem.Description}
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <Text style={{textAlign: 'center', color: '#999'}}>
//                 No items available.
//               </Text>
//             )}
//           </View>

//           <View style={{paddingTop: 10}}>
//             <Text
//               style={{
//                 color: '#14385D',
//                 backgroundColor: 'rgba(0,0,0,0.02)',
//                 fontWeight: '600',
//                 padding: 10,
//               }}>
//               Inspection Activity
//             </Text>
//           </View>

//           {imagePath &&
//             imagePath.map((uri, index) => (
//               <Image
//                 key={index}
//                 source={{uri}}
//                 style={styles.image}
//                 resizeMode="cover"
//               />
//             ))}

//           <View
//             style={{
//               flexDirection: 'row',
//               flexWrap: 'wrap',
//               width: '100%',
//               paddingTop: 20,
//               gap: 10,
//             }}>
//             <TouchableOpacity
//               style={{
//                 width: 160,
//                 height: 150,
//                 backgroundColor: '#FFFFFF',
//                 borderColor: '#ccc',
//                 borderWidth: 2,
//                 borderRadius: 8,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 shadowColor: '#000',
//                 shadowOffset: {width: 0, height: 2},
//                 shadowOpacity: 0.25,
//                 shadowRadius: 3.5,
//                 marginBottom: 10,
//               }}
//               onPress={handleUploadBottomSheet}>
//               <Text style={{fontSize: 40, color: '#ccc'}}>+</Text>
//             </TouchableOpacity>

//             {/* <FastImage
//               style={{
//                 width: 160,
//                 height: 150,
//                 backgroundColor: '#FFFFFF',
//                 borderColor: '#ccc',
//                 borderWidth: 2,
//                 borderRadius: 8,
//                 shadowColor: '#000',
//                 shadowOffset: {width: 0, height: 2},
//                 shadowOpacity: 0.25,
//                 shadowRadius: 3.5,
//                 marginBottom: 10,
//               }}
//               source={{
//                 uri: 'http://192.168.254.134/tempUpload/2024~3392-269~1.jpg',
//                 priority: FastImage.priority.high,
//               }}
//               resizeMode={FastImage.resizeMode.cover}
//             />
//             */}

//             {inspectorImages &&
//               inspectorImages.length > 0 &&
//               inspectorImages.map((uri, index) =>
//                 renderInspectorImage(uri, index),
//               )}

//             {selectedImage && showImageModal && (
//               <Modal visible={true} transparent={true}>
//                 <TouchableWithoutFeedback onPress={closeImageModal}>
//                   <View
//                     style={{
//                       flex: 1,
//                       backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                     }}>
//                   {/*   <TouchableOpacity
//                       style={{
//                         position: 'absolute',
//                         top: 50,
//                         right: 20,
//                         padding: 10,
//                         backgroundColor: 'rgba(255, 255, 255, 0.8)',
//                         borderRadius: 5,
//                       }}
//                       onPress={closeImageModal}>
//                       <Text
//                         style={{
//                           color: '#14385D',
//                           fontSize: 16,
//                           fontWeight: 'bold',
//                         }}>
//                         Close
//                       </Text>
//                     </TouchableOpacity>
//  */}
//                     <FastImage
//                       source={{
//                         uri: selectedImage,
//                         priority: FastImage.priority.high,
//                       }}
//                       style={{width: '90%', height: '80%'}}
//                       resizeMode={FastImage.resizeMode.contain}
//                     />
//                   </View>
//                 </TouchableWithoutFeedback>
//               </Modal>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   },
// );

// const Footer = ({
//   inspectItems,
//   data,
//   checkedItems,
//   dataItems,
//   selectedYear,
//   setModalVisible,
//   setMessage,
//   setSuccessModalVisible,
//   setErrorModalVisible,
//   setLoading,
//   fetchInspectionItems,
//   search,
// }) => {
//   const selectedItems = checkedItems.filter(item => item).length; // Count checked items
//   const totalItems = Array.isArray(dataItems.poRecord)
//     ? dataItems.poRecord.length
//     : 0;

//   const handleInspectItems = async () => {
//     const inspectionStatus = 'Inspected';
//     setModalVisible(true);
//     setLoading(true);

//     const result = await inspectItems(
//       selectedYear,
//       data.TrackingNumber,
//       inspectionStatus,
//     );
//     setModalVisible(false);

//     if (result.success) {
//       setMessage('Inspected Successfully!');
//       setSuccessModalVisible(true);
//       fetchInspectionItems(selectedYear, search);
//     } else {
//       setMessage(`Error: ${result.error}`);
//       setErrorModalVisible(true);
//     }
//   };
//   const handleOnHold = async () => {
//     const inspectionStatus = 'OnHold';
//     setModalVisible(true);
//     setLoading(true);

//     const result = await inspectItems(
//       selectedYear,
//       data.TrackingNumber,
//       inspectionStatus,
//     );
//     setModalVisible(false);

//     if (result.success) {
//       setMessage('Inspection on hold Successfully!');
//       setSuccessModalVisible(true);
//       fetchInspectionItems(selectedYear, search);
//     } else {
//       console.error('Error:', result.error);
//     }
//   };

//   const handleRevert = async () => {
//     const inspectionStatus = 'Revert';
//     setModalVisible(true);
//     setLoading(true);

//     const result = await inspectItems(
//       selectedYear,
//       data.TrackingNumber,
//       inspectionStatus,
//     );
//     setModalVisible(false);

//     if (result.success) {
//       setMessage('Reverted Successfully!');
//       setSuccessModalVisible(true);
//       fetchInspectionItems(selectedYear, search);
//     } else {
//       console.error('Error:', result.error);
//     }
//   };

//   // Check if vouchers array is available and get the Status from the first voucher
//   const voucherStatus =
//     dataItems && dataItems.vouchers && dataItems.vouchers.length > 0
//       ? dataItems.vouchers[0].Status
//       : null;

//   return (
//     <View style={styles.footerContainer}>
//       <View style={styles.footerContent}>
//         <Text style={{paddingRight: 5}}>Selected Items:</Text>
//         <Text style={{fontWeight: 'bold', color: '#224E83', paddingRight: 5}}>
//           {selectedItems}
//         </Text>
//         <Text>out of {totalItems}</Text>
//       </View>
//       <View style={styles.footerButtons}>
//         {voucherStatus === 'Inspected' ||
//         voucherStatus === 'Inspection on hold' ? (
//           // Show the Revert button if status is 'Inspected' or 'Inspection on hold'
//           <TouchableOpacity
//             onPress={handleRevert}
//             style={{
//               backgroundColor: '#ECAD0D',
//               padding: 10,
//               borderRadius: 5,
//               marginLeft: 10,
//             }}>
//             <Text
//               style={{
//                 color: '#FFFFFF',
//                 fontWeight: 'bold',
//                 textAlign: 'center',
//               }}>
//               Revert
//             </Text>
//           </TouchableOpacity>
//         ) : voucherStatus === 'For Inspection' ? (
//           // Show On Hold and Inspected buttons if status is 'For Inspection'
//           <>
//             <TouchableOpacity
//               onPress={handleOnHold}
//               style={styles.onHoldButton}>
//               <Text style={styles.onHoldButtonText}>On hold</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={handleInspectItems}
//               style={styles.inspectedButton}>
//               <Text style={styles.inspectedButtonText}>Inspected</Text>
//             </TouchableOpacity>
//           </>
//         ) : null}
//       </View>
//     </View>
//   );
// };

const InspectionSearchScreen = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [checkedItems, setCheckedItems] = useState([]);
  const bottomSheetRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [message, setMessage] = useState('');

  const [uploading, setUploading] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);


  const {inspectorImages, fetchInspectorImage} = useGetImage(
    selectedYear,
    search,
  );

 
  const {
    data,
    dataItems,
    loading,
    setLoading,
    error,
    inspectError,
    fetchInspectionDetails,
    fetchInspectionItems,
    inspectItems,
  } = useInspection();

  useEffect(() => {
    fetchInspectionDetails(selectedYear, search);
    fetchInspectionItems(selectedYear, search);
  }, []);

  const refreshData = () => {
    fetchInspectionItems(selectedYear, search);
  };


  const updateSearch = text => {
    setSearch(text);
  };

  const handleSearch = () => {
    if (search.trim() !== '') {
      fetchInspectionDetails(selectedYear, search);
      fetchInspectionItems(selectedYear, search);
      setCheckedItems([]);
    }
  };

  const closeBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  };

  const requestCameraPermission = async () => {
    const result = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA,
    );
    return result === 'granted';
  };

  const {uploadInspector} = useFileUpload();

  const [imagePath, setImagePath] = useState([]);

  const handleUploadBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleImageUpload = () => {
    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 0},
      async response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          const selectedImages = response.assets.map(asset => ({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `image${asset.fileSize}.jpg`,
          }));

          setImagePath(selectedImages);
          //console.log('Selected images:', selectedImages); // Check here
        }
      },
    );
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      launchCamera({mediaType: 'photo'}, response => {
        if (!response.didCancel && response.assets) {
          const asset = response.assets[0];
          const newImagePath = [
            {
              name: asset.fileName || 'image.jpg',
              type: asset.type || 'image/jpeg',
              uri: asset.uri,
            },
          ];
          setImagePath(newImagePath);
        }
      });
    } else {
      console.warn('Camera permission denied');
    }
  };

  const handleDeleteImage = index => {
    const newImagePath = imagePath.filter((_, i) => i !== index);
    setImagePath(newImagePath);
  };

  const handleUpload = async () => {
    const year = dataItems?.vouchers?.[0]?.Year;
    const pxTN = dataItems?.vouchers?.[0]?.TrackingNumber;

    if (!imagePath || imagePath.length === 0) {
      console.log('No image selected for upload.');
      return;
    }

    if (!year || !pxTN) {
      console.log('Year or Tracking Number is missing.');
      return;
    }

    try {
      const result = await uploadInspector(imagePath, year, pxTN);

      console.log('Upload result:', result);

      if (result && result.status === 'success') {
        console.log('Upload successful!');
        setImagePath([]);
        setSuccessModalVisible(true);
        setMessage('Images uploaded successfully!');
        fetchInspectorImage();
        setUploading(false);
      } else if (result && result.status === 'error') {
        console.error('Upload error:', result.message);
        setErrorModalVisible(true);
        setMessage(
          result.message || 'Failed to upload images. Please try again.',
        );
      } else {
        console.error('Unexpected result status:', result);
        setErrorModalVisible(true);
        setMessage('Failed to upload images. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error.message);
      console.error('Full error details:', error);

      setErrorModalVisible(true);
      setMessage('Failed to upload images. Please try again.');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#F8F8F8',
            marginBottom: 10,
          }}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'row', marginStart: 5}}>
              <Pressable
                style={{
                  padding: 10,
                  backgroundColor: '#F8F8F8',
                  borderRadius: 999,
                }}
                onPress={() => navigation.goBack()}
                /* android_ripple={{color: 'gray',borderRadius:999,borderless: false}} */
              >
                <Icon name="chevron-back" size={20} color={'black'} />
              </Pressable>

              <Text style={{fontSize: 14, fontWeight: 'bold', padding: 10}}>
                Search to Inspect
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center' /* marginEnd: 20 */,
            }}>
            <Image
              source={require('../../assets/images/eagle2.png')}
              style={{width: 128, height: 51}}
            />
          </View>
        </View>
        <View style={{paddingHorizontal: 10}}>
          <View style={[{paddingBottom: 20, paddingHorizontal: 40}]}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'transparent',
                borderBottomColor: 'transparent',
                borderTopColor: 'transparent',
              }}>
              <TextInput
                placeholder="Search PO Tracking #..."
                onChangeText={updateSearch}
                value={search}
                style={{
                  backgroundColor: 'white',
                  borderColor: '#929292',
                  borderTopWidth:1,
                  borderLeftWidth:1,
                  borderColor:'#ccc',
                  borderBottomWidth: 1,
                  borderRightWidth: 1,
                  borderRadius: 5,
                  height: 40,
                  paddingHorizontal: 10,
                  color: '#333',
                  fontSize: 14,
                  flex: 1,
                  textTransform: 'uppercase',
                }}
                autoCapitalize="characters"
                placeholderTextColor="#999"
                autoCorrect={false} // Disable autocorrect
                autoCompleteType="off" // Disable autocomplete (Android)
                textContentType="none" // Disable specific content type suggestions (iOS)
                keyboardType="default" // Use default keyboard type
                spellCheck={false} // Disable spell check
                returnKeyType="done" // Optionally change the return key behavior
                blurOnSubmit // Automatically dismiss the keyboard on submit
              />

              <TouchableOpacity onPress={handleSearch}>
                <Icon
                  name="search-outline"
                  size={20}
                  color={'white'}
                  style={{
                    backgroundColor: '#007BFF',
                    marginLeft: 10,
                    paddingRight: 20,
                    paddingLeft: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 5,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : error ? (
            <Text style={styles.errorText}>
              Error fetching data: {error.message}
            </Text>
          ) : (Array.isArray(data)
              ? data.filter(item => item != null && item.TrackingType === 'PO')
              : [data].filter(
                  item => item != null && item.TrackingType === 'PO',
                )
            ).length > 0 ? (
            <FlatList
              data={
                Array.isArray(data)
                  ? data.filter(
                      item => item != null && item.TrackingType === 'PO',
                    )
                  : [data].filter(
                      item => item != null && item.TrackingType === 'PO',
                    )
              }
              dataItems={dataItems}
              renderItem={({item}) => (
                <RenderInspection
                  item={item}
                  dataItems={dataItems}
                  checkedItems={checkedItems}
                  setCheckedItems={setCheckedItems}
                  handleImageUpload={handleImageUpload}
                  setUploading={setUploading}
                  refreshKey={refreshKey}
                  inspectorImages={inspectorImages}
                  selectedYear={selectedYear}

                />
              )}
              keyExtractor={item => item?.TrackingNumber || item.id.toString()} 
            />
          ) : (
            <Text style={styles.errorText}>{/* {'No data available'} */}</Text>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: 200,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}>
            <Text>Processing Inspection...</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: 250,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}>
            <Image
              source={require('../../assets/images/success.png')}
              style={{width: 120, height: 120, margin: 20, alignSelf: 'center'}}
            />
            <Text style={{textAlign: 'center', padding: 10}}>{message}</Text>

            <Button title="OK" onPress={() => setSuccessModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: 200,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}>
            <Text>{message}</Text>
            <Button title="OK" onPress={() => setErrorModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {checkedItems.some(item => item) && (
        <BottomSheet
          ref={bottomSheetRef}
          index={checkedItems.some(item => item) ? 0 : -1} // Show only when checked items exist
          snapPoints={['15%', '20%']}
          //enablePanDownToClose
          enableOverdrag={false} // Disable overscroll
          animationConfig={{
            duration: 300, // Duration of the animation
            spring: {
              damping: 20, // Damping ratio for spring animation
              stiffness: 10, // Stiffness of the spring
            },
          }}>
          {/*    <View style={styles.closeButtonContainer}>
          <TouchableOpacity onPress={closeBottomSheet}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          </View> */}
          <Footer
            inspectItems={inspectItems}
            data={data}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            dataItems={dataItems}
            selectedYear={selectedYear}
            setModalVisible={setModalVisible}
            setMessage={setMessage}
            setSuccessModalVisible={setSuccessModalVisible}
            setErrorModalVisible={setErrorModalVisible}
            inspectError={inspectError}
            setLoading={setLoading}
            fetchInspectionDetails={fetchInspectionDetails}
            fetchInspectionItems={fetchInspectionItems}
            search={search}
            closeBottomSheet={closeBottomSheet}
            refreshData={refreshData} // Pass refresh function to Footer
          />
        </BottomSheet>
      )}


{uploading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'flex-end',
            zIndex: 1,
          }}>
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={
              /* imagePath.length > 0 ? ['80%', '90%'] : */ ['80%', '90%']
            }>
            <TouchableOpacity
              onPress={() => {
                setUploading(false);
                bottomSheetRef.current?.close();
              }}
              style={{
                alignSelf: 'flex-end',
                padding: 10,
              }}>
              <Icon
                name="close"
                size={25}
                color="#ccc"
                style={{marginEnd: 10}}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 18,
                fontSize: 16,
                marginStart: 20,
                marginBottom: 10,
              }}>
              Inspector Activity
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#007AFF',
                  padding: 10,
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={handleTakePhoto}>
                <Icon
                  name="camera"
                  size={20}
                  color="#FFFFFF"
                  style={{marginRight: 5}}
                />
                <Text style={{color: '#FFFFFF'}}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#007AFF',
                  padding: 10,
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={handleImageUpload}>
                <Icon
                  name="cloud-upload"
                  size={20}
                  color="#FFFFFF"
                  style={{marginRight: 5}}
                />
                <Text style={{color: '#FFFFFF'}}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{padding: 5}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-around',
                }}>
                {Array.isArray(imagePath) &&
                  imagePath.length > 0 &&
                  imagePath.map((image, index) => (
                    <View key={index} style={{width: '50%', marginBottom: 10}}>
                      <TouchableOpacity
                        onPress={() => handleDeleteImage(index)}
                        style={{
                          backgroundColor: 'red',
                          borderRadius: 100,
                          alignSelf: 'flex-end',
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 12,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}>
                          X
                        </Text>
                      </TouchableOpacity>
                      <Image
                        source={{uri: image.uri}} // Make sure to use image.uri
                        style={{
                          width: '100%',
                          height: 200,
                          alignSelf: 'flex-start',
                          backgroundColor: 'white',
                          borderColor: 'white',
                          borderWidth: 10,
                          shadowColor: '#000',
                          shadowOffset: {width: 0, height: 2},
                          shadowOpacity: 0.25,
                          shadowRadius: 3.5,
                          borderRadius: 5,
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
              </View>
            </ScrollView>

            <View
              style={{
                width: '85%',
                alignSelf: 'center',
                paddingBottom: 20,
              }}>
              <Button
                title="Save"
                style={{padding: 20}}
                onPress={handleUpload}
                //disabled={imagePath.length === 0}
                //color={imagePath.length === 0 ? '#A9A9A9' : '#007AFF'}
              />
            </View>
          </BottomSheet>
        </View>
      )}


    </>
  );
};

const styles = StyleSheet.create({
  container: {
    //backgroundColor: '#fff',
    backgroundColor: '#F6F4F4',
    top: 37,
    //paddingHorizontal: 10,
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  textContainer: {
    borderWidth: 1,
    width: '80%',
    borderColor: '#E9E9E9',
  },
  label: {
    fontSize: 10,
    color: '#555',
    marginTop: 10,
    marginStart: 10,
  },
  value: {
    fontSize: 12,
    width: '60%',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginStart: 10,
  },
  selectedItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  footerContainer: {
    backgroundColor: 'white',
    paddingBottom: 10,
  },
  footerContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  onHoldButton: {
    borderWidth: 1,
    borderColor: '#F35454',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  onHoldButtonText: {
    color: '#F35454',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inspectedButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  inspectedButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
  },
});

export default InspectionSearchScreen;
