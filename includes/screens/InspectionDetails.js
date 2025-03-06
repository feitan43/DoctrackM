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
  PermissionsAndroid,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {CheckBox} from '@rneui/themed';
import {TouchableOpacity} from 'react-native-gesture-handler';
import useInspection from '../api/useInspection';
import BottomSheet from '@gorhom/bottom-sheet';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import useFileUpload from '../api/useFileUpload';
import {request, PERMISSIONS} from 'react-native-permissions';
import useGetImage from '../api/useGetImage';
import {insertCommas} from '../utils/insertComma';
import {Shimmer} from '../utils/useShimmer';
import {useQueryClient} from '@tanstack/react-query';

export const RenderInspection = memo(
  ({
    item,
    inspectorImages,
    selectedYear,
    dataItems,
    checkedItems,
    setCheckedItems,
    setShowUploading,
    removing,
    setRemoving,
    removeThisUpload,
    fetchInspectorImage,
    setImagePath,
  }) => {
    const handleCheck = index => {
      const updatedCheckedItems = [...checkedItems];
      updatedCheckedItems[index] = !updatedCheckedItems[index];
      setCheckedItems(updatedCheckedItems);
    };

    //const [imagePath, setImagePath] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [images, setImages] = useState(inspectorImages || []);
    const [expanded, setExpanded] = useState(false);

    const toggleEditMode = () => {
      setIsEditMode(!isEditMode);
    };

    const removeImage = async uri => {
      try {
        setRemoving(true);

        const results = await removeThisUpload(uri);

        if (results.success) {
          await FastImage.clearMemoryCache();
          await FastImage.clearDiskCache();

          fetchInspectorImage();
          setImagePath([]);
          fetchData();
        } else {
          console.log(
            'Image removal failed:',
            results.message || 'Unknown error',
          );
        }
      } catch (error) {
        console.error('Error during image removal:', error.message || error);
      } finally {
        setRemoving(false);
      }
    };
    const handleUploadBottomSheet = () => {
      setShowUploading(prev => !prev);
    };

    const [fetchTimestamp, setFetchTimestamp] = useState(Date.now());

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      setFetchTimestamp(Date.now());
    };

    // const renderInspectorImage = (uri, index) => (
    //   <TouchableOpacity
    //     key={`${index}-${fetchTimestamp}`}
    //     onPress={() => openImageModal(uri)}>
    //     <FastImage
    //       source={{uri, priority: FastImage.priority.high, cache: 'web'}}
    //       style={{
    //         width: 160,
    //         height: 150,
    //         borderColor: '#ccc',
    //         borderWidth: 2,
    //         borderRadius: 8,
    //         marginBottom: 10,
    //       }}
    //       resizeMode={FastImage.resizeMode.cover}
    //     />
    //   </TouchableOpacity>
    // );

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [captureDate, setCaptureDate] = useState(null);

    const openImageModal = uri => {
      setSelectedImageUri(uri);
      setModalVisible(true);
    };

    const closeImageModal = () => {
      setModalVisible(false);
      setSelectedImageUri(null);
    };

    const handleSelectAll = () => {
      const totalItems = dataItems?.poRecord?.length || 0;

      if (
        checkedItems.length === totalItems &&
        checkedItems.every(item => item)
      ) {
        // If all items are selected, unselect all
        setCheckedItems(Array(totalItems).fill(false));
      } else {
        // Otherwise, select all
        setCheckedItems(Array(totalItems).fill(true));
      }
    };

    const renderInspectorImage = (uri, index) => (
      <View key={index} style={{position: 'relative', marginBottom: 10}}>
        <TouchableOpacity onPress={() => openImageModal(uri)}>
          <FastImage
            source={{uri, priority: FastImage.priority.high, cache: 'web'}}
            style={{
              width: 160,
              height: 150,
              borderColor: '#ccc',
              borderWidth: 2,
              borderRadius: 8,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          {/* <Text>{uri}</Text> */}
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -140,
              right: 10,
              backgroundColor: 'red',
              borderRadius: 15,
              padding: 5,
              paddingVertical: 5,
              zIndex: 2,
            }}
            onPress={() =>
              Alert.alert(
                'Delete Image',
                'Are you sure you want to delete this image?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Deletion canceled'),
                    style: 'cancel',
                  },
                  {
                    text: 'Delete',
                    onPress: () => removeImage(uri),
                    style: 'destructive',
                  },
                ],
                {cancelable: true},
              )
            }>
            <Icon name="close" size={20} color="white" />
          </TouchableOpacity>
        )}

        {selectedImageUri && (
          <Modal
            visible={isModalVisible}
            transparent={true}
            onRequestClose={closeImageModal}>
            <TouchableWithoutFeedback onPress={closeImageModal}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <FastImage
                  source={{
                    uri: selectedImageUri,
                    priority: FastImage.priority.high,
                  }}
                  style={{width: '90%', height: '70%', borderRadius: 8}}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    );

    return (
      <SafeAreaView
        style={{
          paddingBottom: 400,
        }}>
        <View style={{}}>
          <View
            style={{backgroundColor: '#fff', padding: 10, marginVertical: 10}}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}>
              <Text style={styles.headerLabel}>PO Details</Text>
            </View>
            <View style={{paddingTop: 10}}>
              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>1</Text>
                <Text style={styles.label}>Office</Text>
                <Text style={[styles.value, {flex: 3}]}>
                  {item.OfficeName.replace(/\\/g, '')}
                </Text>
              </View>

              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>2</Text>
                <Text style={styles.label}>Claimant</Text>
                <Text style={[styles.value, {flex: 3}]}>{item.Claimant}</Text>
              </View>

              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>3</Text>
                <Text style={styles.label}>PO TN</Text>
                <Text style={[styles.value, {flex: 3}]}>
                  {item.TrackingNumber}
                </Text>
              </View>

              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>4</Text>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, {flex: 3}]}>{item.Status}</Text>
              </View>

              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>5</Text>
                <Text style={styles.label}>PO Number</Text>
                <Text style={[styles.value, {flex: 3}]}>{item.PO_Number}</Text>
              </View>

              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>6</Text>
                <Text style={styles.label}>Amount</Text>
                <Text style={[styles.value, {flex: 3}]}>
                  {insertCommas(item.Amount)}
                </Text>
              </View>

              <View style={{flexDirection: 'row', paddingVertical: 2}}>
                <Text style={styles.indexLabel}>7</Text>
                <Text style={styles.label}>Conform Date</Text>
                <Text style={[styles.value, {flex: 3}]}>
                  {item.ConformDate}
                </Text>
              </View>
            </View>
          </View>

          <View style={{}}>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 10,
                marginVertical: 10,
              }}>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}>
                <Text style={styles.headerLabel}>Payment</Text>
              </View>

              <View
                style={
                  {
                    /* padding: 10 */
                    /* backgroundColor: 'rgba(0,0,0,0.02)' */
                  }
                }>
                {dataItems?.vouchers?.length > 0 ? (
                  dataItems.vouchers.map((voucher, index) => (
                    <View
                      key={index}
                      style={{
                        paddingTop: 10,
                      }}>
                      <View style={{flexDirection: 'row', paddingVertical: 2}}>
                        <Text style={styles.indexLabel}>8</Text>
                        <Text style={styles.label}>TN</Text>
                        <Text style={[styles.value, {flex: 3}]}>
                          {voucher.TrackingNumber}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', paddingVertical: 2}}>
                        <Text style={styles.indexLabel}>9</Text>
                        <Text style={styles.label}>Status</Text>
                        <Text style={[styles.value, {flex: 3}]}>
                          {voucher.Status}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View
                    style={{
                      padding: 10,
                      marginTop: 10,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#ccc',
                    }}>
                    <Text style={{fontSize: 12, color: '#555'}}>
                      No Record Found
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={{padding: 10, marginVertical: 10}}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}>
              <Text style={styles.headerLabel}>Delivery</Text>
            </View>
            <View
              style={
                {
                  /* backgroundColor: 'rgba(0,0,0,0.02)' */
                }
              }>
              {dataItems &&
              dataItems.delivery &&
              dataItems.delivery.length > 0 ? (
                dataItems.delivery.map((deliveryItem, index) => (
                  <View key={index}>
                    <View style={{flexDirection: 'row', paddingTop: 10}}>
                      <Text style={styles.indexLabel}>10</Text>
                      <Text style={styles.label}>Contact</Text>
                      <Text style={[styles.value, {flex: 3}]}>
                        <Text>
                          {(deliveryItem.ContactNumber || '')
                            .split(',')
                            .join('\n')}
                        </Text>
                      </Text>
                    </View>

                    <View style={{flexDirection: 'row', paddingVertical: 2}}>
                      <Text style={styles.indexLabel}>11</Text>
                      <Text style={styles.label}>Address</Text>
                      <Text style={[styles.value, {flex: 3}]}>
                        {deliveryItem.Address || ''}
                      </Text>
                    </View>

                    <View style={{flexDirection: 'row', paddingVertical: 2}}>
                      <Text style={styles.indexLabel}>12</Text>
                      <Text style={styles.label}>Date</Text>
                      <Text style={[styles.value, {flex: 3}]}>
                        {deliveryItem.DeliveryDate || ''}
                      </Text>
                    </View>

                    {/* <View style={{flexDirection: 'row', paddingVertical: 2}}>
                      <Text style={styles.indexLabel}>13</Text>
                      <Text style={styles.label}>Inspection Date</Text>
                      <Text style={[styles.value, {flex: 3}]}>
                        {item.DateOfInspection || ''}
                      </Text>
                    </View> */}
                  </View>
                ))
              ) : (
                <View>
                  <View style={{flexDirection: 'row', paddingVertical: 2}}>
                    <Text style={styles.indexLabel}>10</Text>
                    <Text style={styles.label}>Contact</Text>
                    <Text style={[styles.value, {flex: 3}]}></Text>
                  </View>

                  <View style={{flexDirection: 'row', paddingVertical: 2}}>
                    <Text style={styles.indexLabel}>11</Text>
                    <Text style={styles.label}>Address</Text>
                    <Text style={[styles.value, {flex: 3}]}></Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={{padding: 10, marginVertical: 10}}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.headerLabel}>Items</Text>

              <TouchableOpacity onPress={handleSelectAll}>
                <Text style={{color: '#007bff', fontWeight: 'bold'}}>
                  {checkedItems.length === dataItems?.poRecord?.length &&
                  checkedItems.every(item => item)
                    ? 'Deselect All'
                    : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            {dataItems &&
            dataItems.poRecord &&
            dataItems.poRecord.length > 0 ? (
              dataItems.poRecord.map((dataItem, index) => (
                <View key={index} style={styles.itemContainer}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: checkedItems[index]
                        ? '#C5E6FE'
                        : 'rgba(0,0,0,0.02)', // Change color if checked
                      //marginTop: 10,
                      paddingVertical: 10,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                      }}>
                      <View style={{width: '10%'}}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Inter_28pt-Regular',
                            color: '#224E83',
                            textAlign: 'center',
                          }}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'column', width: '35%'}}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Inter_28pt-Light',
                            color: 'gray',
                          }}>
                          Quantity
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Inter_28pt-Regular',
                            color: 'black',
                          }}>
                          {Math.floor(dataItem.Qty)}{' '}
                          <Text style={{fontWeight: 400}}>{dataItem.Unit}</Text>
                        </Text>
                      </View>

                      <View style={{flexDirection: 'column', width: '35%'}}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Inter_28pt-Light',
                            color: 'gray',
                          }}>
                          Total
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Inter_28pt-Regular',
                            color: 'black',
                            textAlign: 'left',
                          }}>
                          {insertCommas(dataItem.Total)}
                        </Text>
                      </View>

                      <View style={{flexDirection: 'column', width: '20%'}}>
                        <CheckBox
                          checked={checkedItems[index]}
                          onPress={() => handleCheck(index)}
                          containerStyle={{
                            //padding: 2,
                            padding: 0,
                            backgroundColor: 'transparent',
                            alignSelf: 'center',
                          }}
                          checkedColor="#ECAD0D"
                          uncheckedColor="gray"
                        />
                      </View>
                    </View>

                    <View style={{flexDirection: 'row'}}>
                      <View style={{flex: 1, flexDirection: 'row'}}>
                        <View
                          style={{
                            flexDirection: 'column',
                            marginStart: 10,
                            marginTop: 15,
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: 'Inter_28pt-Light',
                              color: 'gray',
                              padding: 5,
                            }}>
                            Description
                          </Text>

                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Inter_28pt-Light',
                              color: 'black',
                              lineHeight: 18,
                              margin: 5,
                            }}
                            numberOfLines={expanded ? undefined : 3}
                            ellipsizeMode="tail">
                            {dataItem.Description}
                          </Text>

                          {dataItem.Description.length > 100 && (
                            <TouchableOpacity
                              onPress={() => setExpanded(!expanded)}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginLeft: 5,
                              }}>
                              <Text style={{color: 'blue', marginRight: 5}}>
                                {expanded ? 'Show Less' : 'Show More'}
                              </Text>
                              <Icon
                                name={expanded ? 'chevron-up' : 'chevron-down'} // Up/Down Arrow
                                size={18}
                                color="blue"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{textAlign: 'center', color: '#999'}}>
                No items available.
              </Text>
            )}
          </View>

          <View
            style={{
              paddingTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}>
            <Text
              style={{
                flex: 1,
                fontFamily: 'Inter_28pt-Bold',
                color: '#252525',
                fontSize: 15,
                paddingHorizontal: 10,
                padding: 10,
              }}>
              Inspection Activity
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor:
                  inspectorImages && inspectorImages.length > 0
                    ? 'rgba(0, 128, 255, 1)'
                    : 'rgba(143, 143, 143, 0.2)',
                borderRadius: 5,
                padding: 5,
                paddingEnd: 10,
                marginEnd: 10,
              }}
              onPress={toggleEditMode}
              disabled={!inspectorImages || inspectorImages.length === 0}>
              <Icon name="create-outline" size={20} color="white" />
              <Text style={{paddingLeft: 5, color: 'white', fontSize: 12}}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          {/*     {imagePath &&
            imagePath.map((uri, index) => (
              <Image
                key={index}
                source={{uri}}
                style={styles.image}
                resizeMode="cover"
              />
            ))} */}

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: '100%',
              paddingTop: 20,
              gap: 10,
            }}>
            <TouchableOpacity
              style={{
                width: 160,
                height: 150,
                backgroundColor: '#FFFFFF',
                borderColor: '#ccc',
                borderWidth: 2,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.5,
                marginBottom: 10,
              }}
              onPress={handleUploadBottomSheet}>
              <Text style={{fontSize: 40, color: '#ccc'}}>+</Text>
            </TouchableOpacity>
            {inspectorImages &&
              inspectorImages.length > 0 &&
              inspectorImages.map((uri, index) =>
                renderInspectorImage(uri, index + 1, item),
              )}

            {/* {selectedImage && showImageModal && (
              <Modal visible={true} transparent={true}>
                <TouchableWithoutFeedback onPress={closeImageModal}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <FastImage
                      source={{
                        uri: selectedImage,
                        priority: FastImage.priority.high,
                      }}
                      style={{width: '90%', height: '80%'}}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )} */}
          </View>
        </View>
      </SafeAreaView>
    );
  },
);

export const Footer = ({
  inspectItems,
  data,
  checkedItems,
  setCheckedItems,
  dataItems,
  selectedYear,
  setModalVisible,
  setMessage,
  setSuccessModalVisible,
  setErrorModalVisible,
  setLoading,
  refreshData,
  closeBottomSheet,
  queryClient,
}) => {
  const selectedItems = checkedItems.filter(item => item).length;
  const totalItems = Array.isArray(dataItems.poRecord)
    ? dataItems.poRecord.length
    : 0;

  /*  const handleInspectItems = async () => {
    if (!Array.isArray(checkedItems)) {
      setMessage('No items found to inspect.');
      setErrorModalVisible(true);
      return;
    }

    const totalItems = Array.isArray(dataItems.poRecord)
      ? dataItems.poRecord.length
      : 0;

    const selectedItems = checkedItems.filter(item => item).length;

    if (selectedItems !== totalItems) {
      setMessage('Please check all items before tagging Inspected.');
      setErrorModalVisible(true);
      return;
    }

    if(voucherStatus === 'Pending Released - CAO'){
      const inspectionStatus = 'Pending Released - CAO';
    }else{
      const inspectionStatus = 'Inspected';
    }    setLoading(true);

    const result = await inspectItems(
      selectedYear,
      data.TrackingNumber,
      inspectionStatus,
      remarks,
    );

    setLoading(false);

    // Handle the result of the inspection
    if (result.success) {
      setMessage(result.message);
      setSuccessModalVisible(true);
      refreshData();
      closeBottomSheet();

      // Reset checkedItems to an array of false values after success
      setCheckedItems(Array(totalItems).fill(false));
    } else {
      setMessage(`Error: ${result.message}`);
      setErrorModalVisible(true);
    }
  }; */

  /*   const handleInspectItems = async () => {
    if (!Array.isArray(checkedItems)) {
      setMessage('No items found to inspect.');
      setErrorModalVisible(true);
      return;
    }

    const totalItems = Array.isArray(dataItems.poRecord)
      ? dataItems.poRecord.length
      : 0;

    const selectedItems = checkedItems.filter(item => item).length;

    if (selectedItems !== totalItems) {
      setMessage('Please check all items before tagging Inspected.');
      setErrorModalVisible(true);
      return;
    }

    let inspectionStatus = 'Inspected';
    if (voucherStatus === 'Pending Released - CAO') {
      inspectionStatus = 'Pending Released - CAO';
    }

    setLoading(true);

    const result = await inspectItems(
      selectedYear,
      data.TrackingNumber,
      inspectionStatus,
      remarks,
    );

    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setSuccessModalVisible(true);
      refreshData();
      closeBottomSheet();

      setCheckedItems(Array(totalItems).fill(false));
    } else {
      setMessage(`${result.message}`);
      setErrorModalVisible(true);
    }
  };*/

  const handleInspectItems = async () => {
    if (!Array.isArray(checkedItems) || checkedItems.length === 0) {
      setMessage('No items found to inspect.');
      setErrorModalVisible(true);
      return;
    }

    const totalItems = Array.isArray(dataItems?.poRecord)
      ? dataItems.poRecord.length
      : 0;
    const selectedItems = checkedItems.filter(item => item).length;

    if (selectedItems !== totalItems) {
      setMessage('Please check all items before tagging Inspected.');
      setErrorModalVisible(true);
      return;
    }

    let inspectionStatus = 'Inspected';
    if (voucherStatus === 'Pending Released - CAO') {
      inspectionStatus = 'Pending Released - CAO';
    }

    setLoading(true);

    try {
      const result = await inspectItems(
        selectedYear,
        data?.TrackingNumber || '',
        inspectionStatus,
        remarks,
      );

      setLoading(false);

      if (result.success) {
        setMessage(result.message);
        setSuccessModalVisible(true);

        queryClient.invalidateQueries({queryKey: ['inspection']});

        refreshData();
        closeBottomSheet();

        setCheckedItems(Array(totalItems).fill(false));
      } else {
        setMessage(`${result.message}`);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setLoading(false);
      console.error('Inspection Error:', error);
      setMessage('An error occurred while inspecting items.');
      setErrorModalVisible(true);
    }
  };

  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [remarks, setRemarks] = useState('');

  /* const handleOnHold = async () => {
    const inspectionStatus = 'OnHold';
    setModalVisible(true);
    setLoading(true);

    const result = await inspectItems(
      selectedYear,
      data.TrackingNumber,
      inspectionStatus,
    );
    setModalVisible(false);

    if (result.success) {
      setMessage('Inspection on hold Successfully!');
      setSuccessModalVisible(true);
      fetchInspectionItems(selectedYear, search);
    } else {
      console.error('Error:', result.error);
    }
  }; */

  const handleOnHold = () => {
    if (!checkedItems.every(item => item)) {
      setMessage('Please check all items before tagging Inspection on hold.');
      setErrorModalVisible(true);
      return;
    }

    setRemarksModalVisible(true);
  };

  const submitRemarks = async () => {
    if (!remarks) {
      Platform.OS === 'android'
        ? ToastAndroid.show('Please fill in the remarks.', ToastAndroid.SHORT)
        : Alert.alert('Validation', 'Please fill in the remarks.');
      return;
    }

    const inspectionStatus = 'OnHold';
    setLoading(true);

    try {
      const result = await inspectItems(
        selectedYear,
        data?.TrackingNumber || '',
        inspectionStatus,
        remarks,
      );

      if (result.success) {
        setMessage(result.message);
        setSuccessModalVisible(true);

        queryClient.invalidateQueries({queryKey: ['inspection']});

        refreshData();
        closeBottomSheet();
        setRemarksModalVisible(false);
      } else {
        setMessage(`Error: ${result.message}`);
        setErrorModalVisible(true);
        refreshData();
        setRemarksModalVisible(false);
      }
    } catch (error) {
      console.error('Error submitting remarks:', error);
      setMessage('An error occurred while submitting remarks.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    const selectedItems = checkedItems.filter(item => item).length;

    if (selectedItems !== totalItems) {
      setMessage('Please check all items before Reverting.');
      setErrorModalVisible(true);
      return;
    }
    const inspectionStatus = 'Revert';
    setLoading(true);

    const result = await inspectItems(
      selectedYear,
      data.TrackingNumber,
      inspectionStatus,
    );
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setSuccessModalVisible(true);
      queryClient.invalidateQueries({queryKey: ['inspection']});
      refreshData();
      closeBottomSheet();
    } else {
      setMessage(`Error: ${result.message}`);
      setErrorModalVisible(true);
    }
  };

  const voucherStatus =
    dataItems && dataItems.vouchers && dataItems.vouchers.length > 0
      ? dataItems.vouchers[0].Status
      : null;

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <Text style={{paddingRight: 5}}>Selected Items:</Text>
        <Text style={{fontWeight: 'bold', color: '#224E83', paddingRight: 5}}>
          {selectedItems}
        </Text>
        <Text>out of {totalItems}</Text>
      </View>
      <View style={styles.footerButtons}>
        {voucherStatus === 'Inspected' ||
        voucherStatus.toLowerCase() === 'inspection on hold' ? (
          <TouchableOpacity
            onPress={handleRevert}
            style={{
              backgroundColor: '#ECAD0D',
              padding: 10,
              borderRadius: 5,
              marginLeft: 10,
            }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Revert
            </Text>
          </TouchableOpacity>
        ) : voucherStatus === 'For Inspection' ||
          voucherStatus === 'Pending Released - CAO' ? (
          // Show On Hold and Inspected buttons if status is 'For Inspection'
          <>
            <TouchableOpacity
              onPress={handleOnHold}
              style={styles.onHoldButton}>
              <Text style={styles.onHoldButtonText}>On hold</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInspectItems}
              style={styles.inspectedButton}>
              <Text style={styles.inspectedButtonText}>Inspected</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Remarks Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={remarksModalVisible}
        onRequestClose={() => {
          setModalVisible(!remarksModalVisible);
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: '80%',
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 5,
            }}>
            <Text>Please enter remarks:</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: 'gray',
                padding: 10,
                marginBottom: 20,
                borderRadius: 5,
                height: 150,
                width: '100%',
              }}
              placeholder="Enter your remarks"
              value={remarks}
              onChangeText={setRemarks}
            />
            <View
              style={{
                rowGap: 5,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <Button
                title="Submit"
                onPress={submitRemarks}
                style={{flex: 1}}
              />

              <Button
                title="Cancel"
                onPress={() => setRemarksModalVisible(false)}
                color="gray"
                style={{flex: 1}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InspectionDetails = ({route, navigation}) => {
  const {item} = route.params;

  /*   useEffect(() => {
    if (imagePath.length > 0) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [imagePath]); */

  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState(item.Year);
  const [checkedItems, setCheckedItems] = useState([]);
  const bottomSheetRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [message, setMessage] = useState('');

  const [showUploading, setShowUploading] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [imagePath, setImagePath] = useState([]);

  const {inspectorImages, fetchInspectorImage} = useGetImage(
    selectedYear,
    item.TrackingNumber,
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

  const queryClient = useQueryClient();

  const {uploadInspector, uploading, removing, setRemoving, removeThisUpload} =
    useFileUpload();

  useEffect(() => {
    fetchInspectionDetails(selectedYear, item.TrackingPartner);
    fetchInspectionItems(selectedYear, item.TrackingPartner);
  }, []);

  const refreshData = () => {
    fetchInspectionItems(selectedYear, item.TrackingPartner);
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
          // Filter for .jpg and .png images only
          const selectedImages = response.assets
            .filter(
              asset =>
                asset.type === 'image/jpeg' || asset.type === 'image/png',
            )
            .map(asset => ({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || `image${asset.fileSize}.jpg`,
            }));

          if (selectedImages.length > 0) {
            setImagePath(selectedImages);
          } else {
            Alert.alert(
              'Invalid file type',
              'Please select only PNG or JPG images.',
            );
          }
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
          console.log(response.assets);

          const newImagePath = [
            {
              name: asset.fileName || 'image.jpg',
              type: asset.type || 'image/jpeg',
              uri: asset.uri,
            },
          ];
          setImagePath(newImagePath);
          console.log(newImagePath);
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

    // Check if there are more than 2 images
    /*  if (imagePath.length > 2) {
      Alert.alert('Image Upload Limit', 'You can only upload two images.');
      return;
    } */
    // Check if Year or Tracking Number is missing
    if (!year || !pxTN) {
      console.log('Year or Tracking Number is missing.');
      return;
    }

    try {
      const result = await uploadInspector(imagePath, year, pxTN);

      console.log('Upload result:', result);

      if (result && result.status === 'success') {
        console.log('Upload successful!');
        setImagePath([]); // Clear the image path
        setSuccessModalVisible(true);
        setMessage('Images uploaded successfully!');
        fetchInspectorImage(); // Fetch the inspector image
        setShowUploading(false); // Hide the uploading status
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
        <ImageBackground
          source={require('./../../assets/images/CirclesBG.png')}
          style={styles.bgHeader}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              android_ripple={{color: '#F6F6F6', borderless: true, radius: 24}}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </Pressable>

            <Text style={styles.title}>Inspection Details</Text>

            <View style={{flex: 1, width: 40}}></View>
          </View>
        </ImageBackground>

        <View style={{paddingHorizontal: 10}}>
          {loading ? (
            <View
              style={[
                {
                  gap: 10,
                  marginTop: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                {top: 0},
              ]}>
              {[...Array(5)].map((_, index) => (
                <Shimmer key={index} />
              ))}
            </View>
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
              initialNumToRender={10}
              windowSize={5}
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
                  setShowUploading={setShowUploading}
                  refreshKey={refreshKey}
                  inspectorImages={inspectorImages}
                  selectedYear={selectedYear}
                  removeThisUpload={removeThisUpload}
                  removing={removing}
                  setRemoving={setRemoving}
                  fetchInspectorImage={fetchInspectorImage}
                  setImagePath={setImagePath}
                />
              )}
              keyExtractor={item => item?.TrackingNumber || item.id.toString()}
            />
          ) : (
            <View
              style={[
                {
                  gap: 10,
                  marginTop: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                {top: 0},
              ]}>
              {[...Array(5)].map((_, index) => (
                <Shimmer key={index} />
              ))}
            </View>
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
              width: 250,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <Icon
              name="alert-circle"
              size={120}
              color="red"
              style={{marginBottom: 10, alignSelf: 'center'}}
            />
            <Text style={{textAlign: 'center', marginBottom: 10}}>
              {message}
            </Text>
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
            queryClient={queryClient}
          />
        </BottomSheet>
      )}

      {showUploading && (
        <View
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}>
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={imagePath.length > 0 ? ['80%', '90%'] : ['25%', '50%']}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: 10,
                //gap:10
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
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
                  flex: 1,
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
                <Text style={{color: '#FFFFFF'}}>Browse Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowUploading(false);
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
                  style={
                    {
                      /* marginEnd: 10 */
                    }
                  }
                />
              </TouchableOpacity>
            </View>
            <View style={{padding: 5, paddingStart: 20}}>
              <Text style={{fontSize: 8, color: 'gray'}}>
                Please upload an image in JPG or PNG format.
              </Text>
            </View>

            {Array.isArray(imagePath) && imagePath.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  paddingVertical: 5,
                }}>
                {imagePath.map((image, index) => (
                  <View
                    key={index}
                    style={{
                      width: '48%',
                      marginBottom: 10,
                      position: 'relative',
                    }}>
                    <Image
                      source={{uri: image.uri}}
                      style={{
                        width: '100%',
                        height: 150,
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

                    <TouchableOpacity
                      onPress={() => handleDeleteImage(index)}
                      style={{
                        position: 'absolute',
                        top: -130,
                        right: 15,
                        backgroundColor: 'rgba(228, 50, 93, 1)',
                        borderRadius: 15,
                        padding: 10,
                        paddingVertical: 5,
                        zIndex: 2,
                      }}>
                      <Text style={{color: 'white', fontSize: 14}}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View
              style={{
                width: '60%',
                alignSelf: 'center',
                bottom: 120,
                position: 'absolute',
              }}>
              <Button
                title={uploading ? 'Uploading...' : 'Upload'}
                style={{padding: 20}}
                onPress={handleUpload}
                disabled={imagePath.length === 0}
                //color={imagePath.length === 0 ? '#A9A9A9' : '#007AFF'}
              />
              {uploading && (
                <ActivityIndicator
                  style={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: [{translateY: -10}],
                  }}
                  color="white"
                />
              )}
            </View>
          </BottomSheet>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    //backgroundColor: '#F6F4F4',
    //top: 37,
    //paddingTop: 20,
    //paddingHorizontal: 10,
    flexGrow: 1,
  },
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
    flex: 1,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderWidth:1,
    borderColor:'silver', 
    borderRadius:5
  },
  textContainer: {
    borderWidth: 1,
    width: '80%',
    borderColor: '#E9E9E9',
  },
  headerLabel: {
    fontFamily: 'Inter_28pt-Bold',
    color: '#252525',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  indexLabel: {
    width: 24,
    //backgroundColor:'red',
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Regular',
    color: '#004ab1',
    paddingStart: 10,
  },
  label: {
    flex: 1,
    paddingHorizontal: 10,
    //color: '#224E83',
    fontSize: 14,
    fontFamily: 'Inter_28pt-Light',
    //color: 'gray',
    textAlign: 'left',
  },
  value: {
    fontSize: 14,
    width: '60%',
    fontFamily: 'Inter_28pt-SemiBold',
    color: 'black',
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
  image: {
    width: '80%',
    height: 250,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10}, // Shadow offset
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});

export default InspectionDetails;
