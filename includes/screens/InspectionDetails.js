import React, {
  useState,
  memo,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
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
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {CheckBox} from '@rneui/themed';
//import {TouchableOpacity} from 'react-native-gesture-handler';
import useInspection from '../api/useInspection';
import BottomSheet from '@gorhom/bottom-sheet';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';

import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import useFileUpload from '../api/useFileUpload';
import {request, PERMISSIONS} from 'react-native-permissions';
import useGetImage from '../api/useGetImage';
import {insertCommas} from '../utils/insertComma';
import {Shimmer} from '../utils/useShimmer';
import {useQueryClient} from '@tanstack/react-query';
import DatePicker from 'react-native-date-picker';
import {
  useAddSchedule,
  useInspectionDetails,
  useInspectionItems,
  useInspectItems,
  useInspectorImages,
  useUploadInspector,
  useRemoveInspectorImage,
} from '../hooks/useInspection';
import {BlurView} from '@react-native-community/blur';
import moment from 'moment';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {showMessage} from 'react-native-flash-message';
import Spinner from 'react-native-loading-spinner-overlay';

export const RenderInspection = memo(
  ({
    item,
    inspectorImages,
    inspectorImagesLoading,
    inspectorImagesError,
    selectedYear,
    dataItems,
    checkedItems,
    setCheckedItems,
    setShowUploading,
    removing,
    setRemoving,
    removeInspectorImage,
    fetchInspectorImage,
    setImagePath,
    queryClient,
  }) => {
    const handleCheck = index => {
      const updatedCheckedItems = [...checkedItems];
      updatedCheckedItems[index] = !updatedCheckedItems[index];
      setCheckedItems(updatedCheckedItems);
    };

    const [isEditMode, setIsEditMode] = useState(false);
    const [images, setImages] = useState(inspectorImages || []);
    const [expanded, setExpanded] = useState(false);

    const toggleEditMode = () => {
      setIsEditMode(!isEditMode);
    };

    const removeImage = uri => {
      removeInspectorImage(uri, {
        onSuccess: async results => {
          const year = dataItems?.vouchers?.[0]?.Year;
          const pxTN = dataItems?.vouchers?.[0]?.TrackingNumber;
          console.log('Remove successful:', results);

          if (results.success) {
            showMessage({
              message: 'Image removed successfully!',
              type: 'success',
              icon: 'success',
              floating: true,
              duration: 3000,
            });

            setImagePath(prev => prev.filter(item => item.uri !== uri));

            await FastImage.clearMemoryCache();
            await FastImage.clearDiskCache();

            queryClient.setQueryData(
              ['inspectorImages', year, pxTN],
              oldData => {
                return oldData?.filter(item => item.uri !== uri) || [];
              },
            );

            setTimeout(() => {
              fetchData();
              queryClient.invalidateQueries(['inspectorImages', year, pxTN]);
            }, 300);
          } else {
            console.log(
              'Image removal failed:',
              results.message || 'Unknown error',
            );
          }
        },
        onError: error => {
          console.error('Remove failed:', error.message || error);
          showMessage({
            message: 'Image removal failed!',
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 3000,
          });
        },
      });
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
              top: 10,
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

                    {/*   <View style={{flexDirection: 'row', paddingVertical: 2}}>
                      <Text style={styles.indexLabel}>12</Text>
                      <Text style={styles.label}>Date</Text>
                      <Text style={[styles.value, {flex: 3}]}>
                        {deliveryItem.DeliveryDate || ''}
                      </Text>
                    </View> */}

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        paddingVertical: 2,
                      }}>
                      <Text style={styles.indexLabel}>12</Text>
                      <Text style={styles.label}> Date</Text>
                      <View>
                        {deliveryItem.DeliveryDatesHistory
                          ? deliveryItem.DeliveryDatesHistory.split(', ').map(
                              (date, index, arr) => (
                                <View
                                  key={index}
                                  style={{
                                    flexDirection: 'row',
                                    marginBottom: 5,
                                  }}>
                                  <Text
                                    style={{
                                      backgroundColor:
                                        index === arr.length - 1
                                          ? 'rgb(94, 165, 245)'
                                          : 'silver',
                                      paddingHorizontal: 5,
                                      color: 'white',
                                    }}>
                                    {index + 1}
                                  </Text>
                                  <Text
                                    style={{
                                      width: '60%',
                                      fontSize: moderateScale(12),
                                      fontFamily: 'Inter_28pt-SemiBold',
                                      color: '#2C3E50',
                                      marginStart: scale(10),
                                    }}>
                                    {date}
                                  </Text>
                                </View>
                              ),
                            )
                          : null}
                      </View>
                    </View>
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
                      /* backgroundColor: checkedItems[index]
                        ? '#C5E6FE'
                        : 'rgba(0,0,0,0.02)', // Change color if checked */
                      borderWidth: checkedItems[index] ? 3 : 1,
                      borderColor: checkedItems[index]
                        ? 'rgb(23, 162, 255)'
                        : '#ffffff',
                      //marginTop: 10,
                      paddingVertical: 10,
                      borderRadius: 3,
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
  item,
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
  openBottomSheet,
  queryClient,
  setInvoiceBottomSheetVisible,
  setAddScheduleBottomSheetVisible,
  setRemarksBottomSheetVisible,
  isInspecting,
}) => {
  const selectedItems = checkedItems.filter(item => item).length;
  const totalItems = Array.isArray(dataItems.poRecord)
    ? dataItems.poRecord.length
    : 0;

  const handleInspectItems = async () => {
    if (!Array.isArray(checkedItems) || checkedItems.length === 0) {
      showMessage({
        message: 'Inspection Failed',
        description: 'No items found to inspect.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    const totalItems = Array.isArray(dataItems?.poRecord)
      ? dataItems.poRecord.length
      : 0;
    const selectedItems = checkedItems.filter(Boolean).length;
    const trackingNumber = dataItems.vouchers[0]?.TrackingNumber;

    if (selectedItems !== totalItems) {
      showMessage({
        message: 'Inspection Failed',
        description: 'Please check all items before tagging Inspected.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    if (voucherStatus.toLowerCase() === 'inspection on hold') {
      setInvoiceBottomSheetVisible(true);
      closeBottomSheet();
      return;
    }

    if (voucherStatus.toLowerCase() !== 'for inspection') {
      showMessage({
        message: 'Inspection Failed',
        description: `Status should be 'For Inspection'. Current status: '${voucherStatus}'`,
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    let inspectionStatus = 'Inspected';
    const deliveryId = item?.Id;

    try {
      const result = await inspectItems({
        year: selectedYear,
        deliveryId,
        trackingNumber: trackingNumber,
        inspectionStatus,
      });

      console.log('Inspection Response:', result);

      if (result.status === 'success') {
        showMessage({
          message: 'Inspection Successful',
          description: result.message,
          type: 'success',
          icon: 'success',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });

        refreshData();
        closeBottomSheet();
        setCheckedItems(Array(totalItems).fill(false));
      } else {
        showMessage({
          message: 'Inspection Failed',
          description: result.message || 'Something went wrong.',
          type: 'danger',
          icon: 'danger',
          backgroundColor: '#D32F2F',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Inspection Error:', error.message || error);
      showMessage({
        message: 'Inspection Failed',
        description: 'An error occurred while inspecting items.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
    }
  };

  const handleRevert = async () => {
    const selectedItems = checkedItems.filter(Boolean).length;
    const trackingNumber = dataItems.vouchers[0]?.TrackingNumber;
    if (selectedItems !== totalItems) {
      showMessage({
        message: 'Revert Failed',
        description: 'Please check all items before reverting.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
      return;
    }

    const inspectionStatus = 'Revert';
    const deliveryId = item?.Id;

    try {
      const result = await inspectItems({
        year: selectedYear,
        deliveryId,
        trackingNumber: trackingNumber,
        inspectionStatus,
      });

      console.log('Revert Response:', result);

      if (result.status === 'success') {
        showMessage({
          message: 'Revert Successful',
          description: result.message,
          type: 'success',
          icon: 'success',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });

        queryClient.invalidateQueries({queryKey: ['inspection']});
        refreshData();
        closeBottomSheet();
      } else {
        showMessage({
          message: 'Revert Failed',
          description: result.message || 'Something went wrong.',
          type: 'danger',
          icon: 'danger',
          backgroundColor: '#D32F2F',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Revert Error:', error.message || error);
      showMessage({
        message: 'Revert Failed',
        description: 'An error occurred while reverting items.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
    }
  };

  const handleAddSchedule = () => {
    setAddScheduleBottomSheetVisible(true);
    closeBottomSheet();
  };

  const handleOnHold = () => {
    if (!checkedItems.every(item => item)) {
      setMessage('Please check all items before tagging Inspection on hold.');
      setErrorModalVisible(true);
      return;
    }

    setRemarksBottomSheetVisible(true);
    closeBottomSheet();
  };

  const voucherStatus =
    dataItems && dataItems.vouchers && dataItems.vouchers.length > 0
      ? dataItems.vouchers[0].Status
      : null;

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <Text style={{paddingRight: 5}}>Selected Items:</Text>
        <Text
          style={{
            fontWeight: 'bold',
            color: '#224E83',
            paddingRight: 5,
            fontSize: 16,
          }}>
          {selectedItems}
        </Text>
        <Text>/{totalItems}</Text>
      </View>
      <View style={styles.footerButtons}>
        {voucherStatus === 'For Inspection' && (
          <>
            <TouchableOpacity
              onPress={handleOnHold}
              style={styles.onHoldButton}>
              <Icon
                name="hand-left-outline"
                size={20}
                color="white"
                style={{marginRight: 5}}
              />
              <Text style={styles.onHoldButtonText}>On Hold</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInspectItems}
              disabled={isInspecting}
              style={styles.inspectedButton}>
              <Icon
                name="checkmark-done-outline" // Icon for Inspected
                size={20}
                color="white"
                style={{marginRight: 5}}
              />
              <Text style={styles.inspectedButtonText}>Inspected</Text>
            </TouchableOpacity>
          </>
        )}

        {voucherStatus === 'Inspected' && (
          <TouchableOpacity
            onPress={handleRevert}
            style={{
              backgroundColor: '#ECAD0D',
              padding: 10,
              borderRadius: 5,
              marginLeft: 10,
            }}
            disabled={isInspecting}>
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              {isInspecting ? 'Reverting...' : 'Revert'}
            </Text>
          </TouchableOpacity>
        )}

        {voucherStatus.toLowerCase() === 'inspection on hold' && (
          <>
            <TouchableOpacity
              onPress={handleInspectItems}
              disabled={isInspecting}
              style={styles.inspectedButton}>
              <Icon
                name="checkmark-done-outline" // Icon for Inspected
                size={20}
                color="white"
                style={{marginRight: 5}}
              />
              <Text style={styles.inspectedButtonText}>Inspected</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
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
 */}
            <Pressable
              onPress={handleAddSchedule}
              style={({pressed}) => ({
                backgroundColor: pressed ? '#E0E0E0' : '#F5F5F5', // Darken on press
                padding: 10,
                borderRadius: 5,
                marginLeft: 10,
                flexDirection: 'row',
                elevation: 2,
                alignItems: 'center',
                transition: 'background-color 0.2s ease-in-out', // Smooth color transition
              })}>
              <Icon
                name="add-circle-outline"
                size={20}
                color="black"
                style={{marginRight: 5}}
              />
              <Text
                style={{
                  color: '#252525',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Add Schedule
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const RemarksBottomSheet = ({
  visible,
  onClose,
  remarks,
  setRemarks,
  selectedRemark,
  setSelectedRemark,
  submitRemarks,
}) => {
  const remarkOptions = [
    'Incomplete Delivery',
    'Incorrect Quantity',
    'Wrong Items Delivered',
    'Other',
  ];

  const handleRemarkSelect = remark => {
    setSelectedRemark(remark);
    setRemarks(remark !== 'Other' ? remark : '');
  };

  const handleClose = () => {
    setSelectedRemark('');
    setRemarks('');
    onClose();
  };

  if (!visible) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={['60%']}
      enablePanDownToClose={true}
      onChange={index => {
        if (index === -1) {
          onClose();
        }
      }}
      backdropComponent={({style}) => (
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={[style, {backgroundColor: 'rgba(0,0,0,0.5)'}]} />
        </TouchableWithoutFeedback>
      )}>
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
            color: '#333',
          }}>
          Select a remark for On Hold:
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingVertical: 5,
            gap: 10,
          }}>
          {remarkOptions.map((item, index) => (
            <TouchableOpacity
              key={item + index}
              style={{
                paddingVertical: 10,
                backgroundColor:
                  selectedRemark === item ? '#007AFF' : '#E5E7EB',
                borderRadius: 10,
                alignItems: 'center',
              }}
              onPress={() => handleRemarkSelect(item)}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  paddingHorizontal: 10,
                  color: selectedRemark === item ? 'white' : '#333',
                }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedRemark === 'Other' && (
          <TextInput
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 10,
              height: '30%',
              width: '100%',
              textAlignVertical: 'top',
              fontSize: 14,
              color: '#333',
              marginTop: 10,
              marginBottom: 10,
              elevation: 2,
            }}
            placeholder="Enter your remarks"
            placeholderTextColor="#A0A0A0"
            value={remarks}
            onChangeText={setRemarks}
            multiline
          />
        )}

        <View style={{flex: 1}} />

        <View style={{flexDirection: 'column', justifyContent: 'flex-end'}}>
          <TouchableOpacity
            onPress={submitRemarks}
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 10,
              alignItems: 'center',
              paddingVertical: 12,
              marginBottom: 5,
            }}>
            <Text style={{color: 'white', fontWeight: '600', fontSize: 14}}>
              Submit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#E5E7EB',
              borderRadius: 10,
              alignItems: 'center',
              paddingVertical: 12,
            }}>
            <Text style={{color: '#333', fontWeight: '600', fontSize: 14}}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const InvoiceBottomSheet = ({visible, setCheckedItems, onClose, onSubmit}) => {
  const [invoice, setInvoice] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDate, setOpenDate] = useState(false);

  const handleClose = () => {
    setInvoice('');
    setSelectedDate(null);
    onClose();
    setCheckedItems([]);
  };

  if (!visible) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={['50%']}
      onClose={onClose}
      backdropComponent={({style}) => (
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={[style, {backgroundColor: 'rgba(0,0,0,0.5)'}]} />
        </TouchableWithoutFeedback>
      )}>
      <View style={{paddingHorizontal: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{flex: 1, fontSize: 20, fontWeight: 'bold'}}>
            Enter Invoice
          </Text>
          <View style={{padding: 5}}>
            <Icon name="close" size={24} color="#000" onPress={handleClose} />
          </View>
        </View>

        <View style={{gap: -10}}>
          <Text style={{color: 'rgb(102, 102, 102)', marginBottom: 10}}>
            Invoice Number
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginTop: 10,
              borderRadius: 5,
              alignItems: 'center',
            }}
            placeholder="Enter Invoice Number"
            placeholderTextColor={'#ccc'}
            inputMode="numeric"
            value={invoice}
            onChangeText={setInvoice}
          />
        </View>

        <View style={{marginTop: 10}}>
          <Text style={{color: 'rgb(102, 102, 102)'}}>Invoice Date</Text>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginTop: 10,
              borderRadius: 5,
              alignItems: 'center',
            }}
            onPress={() => setOpenDate(true)}>
            <Text style={{color: selectedDate ? 'black' : '#ccc'}}>
              {selectedDate
                ? selectedDate.toISOString().split('T')[0]
                : 'YYYY-MM-DD'}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={openDate}
            date={selectedDate || new Date()}
            mode="date"
            onConfirm={date => {
              setOpenDate(false);
              setSelectedDate(date);
            }}
            onCancel={() => setOpenDate(false)}
          />
        </View>

        <Pressable
          style={({pressed}) => ({
            backgroundColor: pressed ? '#005ecb' : '#007aff',
            padding: 12,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 10,
            opacity: invoice && selectedDate ? 1 : 0.5,
          })}
          onPress={() => {
            if (!invoice || !selectedDate) {
              Alert.alert('Error', 'Please enter Invoice Number and Date');
              return;
            }
            onSubmit(invoice, selectedDate);
          }}
          disabled={!invoice || !selectedDate}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            Submit
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
};

const AddSchedule = ({item, visible, onClose, onSubmit, isAdding}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setDateError(false);
    setTimeError(false);
    onClose();
  };

  const formatDateTime = () => {
    if (!selectedDate || !selectedTime) return null;

    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
    );

    const year = combinedDateTime.getFullYear();
    const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(combinedDateTime.getDate()).padStart(2, '0');

    let hours = combinedDateTime.getHours();
    const minutes = String(combinedDateTime.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  if (!visible) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={['50%']}
      onClose={onClose}
      backdropComponent={({style}) => (
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={[style, {backgroundColor: 'rgba(0,0,0,0.5)'}]} />
        </TouchableWithoutFeedback>
      )}>
      <View style={{paddingHorizontal: 20, paddingVertical: 10}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{flex: 1, fontSize: 20, fontWeight: 'bold'}}>
            Add Schedule
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={{fontSize: 10}}>
          last delivery{'  '}
          <Text style={{fontSize: 12, paddingStart: 10}}>
            {item.DeliveryDate}
          </Text>
        </Text>

        <View style={{flexDirection: 'row', marginTop: 15}}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={{color: 'rgb(102, 102, 102)', marginBottom: 5}}>
              Date
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: dateError ? 'red' : '#ccc',
                padding: 10,
                borderRadius: 5,
              }}
              onPress={() => setOpenDate(true)}>
              <Text>
                {selectedDate
                  ? selectedDate.toISOString().split('T')[0]
                  : 'YYYY-MM-DD'}
              </Text>
            </TouchableOpacity>
            {dateError && (
              <Text style={{color: 'red', fontSize: 12, marginTop: 5}}>
                Please select a date
              </Text>
            )}
            <DatePicker
              modal
              open={openDate}
              date={selectedDate || new Date()}
              mode="date"
              onConfirm={date => {
                setOpenDate(false);
                setSelectedDate(date);
                setDateError(false);
              }}
              onCancel={() => setOpenDate(false)}
            />
          </View>

          {/* Time Picker */}
          <View style={{flex: 1}}>
            <Text style={{color: 'rgb(102, 102, 102)', marginBottom: 5}}>
              Time
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: timeError ? 'red' : '#ccc',
                padding: 10,
                borderRadius: 5,
              }}
              onPress={() => setOpenTime(true)}>
              <Text>
                {selectedTime
                  ? selectedTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : 'HH:MM AM/PM'}
              </Text>
            </TouchableOpacity>
            {timeError && (
              <Text style={{color: 'red', fontSize: 12, marginTop: 5}}>
                Please select a time
              </Text>
            )}
            <DatePicker
              modal
              open={openTime}
              date={selectedTime || new Date()}
              mode="time"
              onConfirm={time => {
                setOpenTime(false);

                const tempDate = new Date();
                tempDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
                setSelectedTime(tempDate);

                setTimeError(false);
              }}
              onCancel={() => setOpenTime(false)}
            />
          </View>
        </View>
        <Pressable
          style={({pressed}) => ({
            backgroundColor: pressed || isAdding ? '#005ecb' : '#007aff',
            padding: 12,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 20,
            flexDirection: 'row',
            justifyContent: 'center',
          })}
          onPress={() => {
            if (isAdding) return;

            let hasError = false;
            if (!selectedDate) {
              setDateError(true);
              hasError = true;
            }
            if (!selectedTime) {
              setTimeError(true);
              hasError = true;
            }
            if (!item.Id) {
              Alert.alert('Error', 'Delivery ID is required');
              hasError = true;
            }

            if (!hasError) {
              const formattedDateTime = formatDateTime();

              const selectedDateTime = new Date(selectedDate);
              selectedDateTime.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
              );

              const deliveryDateTime = moment(
                item.DeliveryDate,
                'YYYY-MM-DD hh:mm A',
              ).toDate();

              if (isNaN(deliveryDateTime)) {
                console.error(
                  'Invalid Date Conversion for item.DeliveryDate:',
                  item.DeliveryDate,
                );
                Alert.alert('Error', 'Invalid delivery date format');
                return;
              }

              if (selectedDateTime < deliveryDateTime) {
                Alert.alert(
                  'Invalid Date',
                  'Scheduled date and time must not be before the delivery date.',
                );
                return;
              }

              onSubmit({date: formattedDateTime, deliveryId: item.Id});
            }
          }}
          disabled={isAdding}>
          {isAdding ? (
            <>
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{marginRight: 8}}
              />
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                Submitting...
              </Text>
            </>
          ) : (
            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
              Submit
            </Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
};

const InspectionDetails = ({route, navigation}) => {
  const {item} = route.params;

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

  /* const {inspectorImages, fetchInspectorImage} = useGetImage(
    selectedYear,
    item.TrackingNumber,
  ); */

  const {
    data: inspectorImages,
    isLoading: inspectorImagesLoading,
    error: inspectorImagesError,
  } = useInspectorImages(selectedYear, item.TrackingNumber);
  const {
    data: data,
    isLoading: DetailsLoading,
    error: DetailsError,
  } = useInspectionDetails(selectedYear, item.TrackingPartner);
  const {
    data: dataItems,
    isLoading: ItemsLoading,
    error: ItemsError,
  } = useInspectionItems(selectedYear, item.TrackingPartner);
  const {mutate: addSchedule, isPending: isAdding} = useAddSchedule();
  const {mutateAsync: inspectItems, isPending: isInspecting} =
    useInspectItems();

  const queryClient = useQueryClient();

  /* const {uploadInspector, uploading, removing, setRemoving, removeThisUpload} =
    useFileUpload(); */

  const {
    mutate: uploadInspector,
    isPending: uploading,
    isLoading,
  } = useUploadInspector();
  const {
    mutate: removeInspectorImage,
    isPending: removing,
    isLoading: removingImage,
  } = useRemoveInspectorImage();

  const [invoiceBottomSheetVisible, setInvoiceBottomSheetVisible] =
    useState(false);
  const [addScheduleBottomSheetVisible, setAddScheduleBottomSheetVisible] =
    useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [remarksBottomSheetVisible, setRemarksBottomSheetVisible] =
    useState(false);
  const [selectedRemark, setSelectedRemark] = useState('');
  const [remarks, setRemarks] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    await queryClient.invalidateQueries({
      predicate: query =>
        query.queryKey[0] === 'inspectionDetails' ||
        (query.queryKey[0] === 'inspectionItems' &&
          query.queryKey[1] === selectedYear &&
          query.queryKey[2] === item.TrackingPartner),
    });
  };

  const closeBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  };

  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand(); // or .snapToIndex(0) if using snapPoints
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

  const handleUploadOld = async () => {
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

  const handleUpload = () => {
    const year = dataItems?.vouchers?.[0]?.Year;
    const pxTN = dataItems?.vouchers?.[0]?.TrackingNumber;

    if (!imagePath || imagePath.length === 0) {
      showMessage({
        message: 'No image selected for upload.',
        type: 'warning',
        icon: 'warning',
      });
      return;
    }

    uploadInspector(
      {imagePath, year, pxTN},
      {
        onSuccess: () => {
          showMessage({
            message: 'Upload successful!',
            type: 'success',
            icon: 'success',
            floating: true,
            duration: 3000,
          });

          queryClient.invalidateQueries(['inspectorImages', year, pxTN]);

          setImagePath([]);

          setShowUploading(false);
          bottomSheetRef.current?.close();

        },
        onError: error => {
          showMessage({
            message: 'Upload failed!',
            description: error.message || 'Something went wrong',
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 3000,
          });
        },
      },
    );
  };

  const handleInvoiceSubmit = (invoice, date) => {
    setInvoiceNumber(invoice);
    setInvoiceBottomSheetVisible(false);

    const formattedDate = date ? date.toISOString().split('T')[0] : 'No date';

    console.log('Invoice:', invoice);
    console.log('Date:', formattedDate);
  };

  const handleScheduleSubmit = ({date, deliveryId}) => {
    if (!date || !deliveryId) {
        console.error('Error: Date and Delivery ID are required.');
        showMessage({
            message: 'Error: Date and Delivery ID are required.',
            type: 'danger',
        });
        return;
    }

    addSchedule(
        {date, deliveryId},
        {
            onSuccess: () => {
                showMessage({
                    message: 'Schedule successfully added!',
                    type: 'success',
                    icon: 'success',
                    backgroundColor: '#2E7D32',
                    color: '#FFFFFF',
                    floating: true,
                    duration: 3000,
                });

                refreshData();
                setAddScheduleBottomSheetVisible(false);

                if (typeof closeBottomSheet === 'function') {
                    closeBottomSheet();
                }
            },
            onError: error => {
                console.error('Error adding schedule:', error);
                showMessage({
                    message: 'Error adding schedule!',
                    description: error.message || 'Something went wrong.',
                    type: 'danger',
                });
            },
        }
    );
  };


  /*  const submitRemarks = async () => {
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
      } else {
        setMessage(`Error: ${result.message}`);
        setErrorModalVisible(true);
        refreshData();
      }
    } catch (error) {
      console.error('Error submitting remarks:', error);
      setMessage('An error occurred while submitting remarks.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  }; */

  const sanitizeInput = input => {
    if (!input || typeof input !== 'string') return ''; // Handle null, undefined, or non-string values
    const sanitized = input.replace(/<\/?[^>]+(>|$)/g, '').trim(); // Remove HTML tags and trim spaces

    if (sanitized !== input.trim()) {
      ToastAndroid.show(
        'Invalid input detected. HTML tags are not allowed.',
        ToastAndroid.SHORT,
      );
    }

    return sanitized;
  };

  const submitRemarks = async () => {
    if (!selectedRemark) {
      ToastAndroid.show(
        'Please select a remark before submitting.',
        ToastAndroid.SHORT,
      );
      return;
    }

    if (selectedRemark === 'Other' && !remarks.trim()) {
      ToastAndroid.show(
        'Please enter remarks for "Other".',
        ToastAndroid.SHORT,
      );
      return;
    }

    const sanitizedRemarks = sanitizeInput(remarks);

    let inspectionStatus = 'OnHold';
    const deliveryId = item?.Id;
    const trackingNumber = dataItems?.vouchers?.[0]?.TrackingNumber;
    const totalItems = Array.isArray(dataItems?.poRecord)
      ? dataItems.poRecord.length
      : 0;

    try {
      const result = await inspectItems({
        year: selectedYear,
        deliveryId,
        trackingNumber: trackingNumber,
        inspectionStatus,
        remarks: sanitizedRemarks,
      });

      if (result.status === 'success') {
        showMessage({
          message: 'Inspection On Hold Successful',
          description: result.message,
          type: 'success',
          icon: 'success',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });

        refreshData();
        closeBottomSheet();
        setCheckedItems(Array(totalItems).fill(false));
      } else {
        showMessage({
          message: 'Inspection On Hold Failed',
          description: result.message || 'Something went wrong.',
          type: 'danger',
          icon: 'danger',
          backgroundColor: '#D32F2F',
          color: '#FFFFFF',
          floating: true,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Inspection Error:', error.message || error);
      showMessage({
        message: 'Inspection Failed',
        description: 'An error occurred while inspecting items.',
        type: 'danger',
        icon: 'danger',
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        floating: true,
        duration: 3000,
      });
    }

    setSelectedRemark('');
    setRemarks('');
    setRemarksBottomSheetVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData(); 
    setRefreshing(false);
  };

  /*  const handleOnHold = () => {
    if (!checkedItems.every(item => item)) {
      setMessage('Please check all items before tagging Inspection on hold.');
      setErrorModalVisible(true);
      return;
    }

    setRemarksBottomSheetVisible(true);
    closeBottomSheet();
  }; */

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
          {DetailsLoading || ItemsLoading ? (
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
          ) : DetailsError || ItemsError ? (
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
              showsVerticalScrollIndicator={false}
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
                  inspectorImagesLoading={inspectorImagesLoading}
                  inspectorImagesError={inspectorImagesError}
                  selectedYear={selectedYear}
                  removeInspectorImage={removeInspectorImage}
                  //removing={removing}
                  //setRemoving={setRemoving}
                  //fetchInspectorImage={fetchInspectorImage}
                  setImagePath={setImagePath}
                  routeItem={route.params.item}
                  queryClient={queryClient}
                />
              )}
              keyExtractor={item => item?.TrackingNumber || item.id.toString()}
              refreshing={refreshing}
              onRefresh={onRefresh}
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

      {/*  {!isInspecting && (
  <View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    }}>
    <BlurView
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
      blurType="light"
      blurAmount={5}
    />

    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
      }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  </View>
)} */}

      <Spinner
        visible={isInspecting}
        textContent={'Inspecting...'}
        textStyle={{
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
        }}
        overlayColor="rgba(0, 0, 0, 0.5)" // Dark translucent background
        animation="fade"
        color="#ffffff" // White spinner
      />

      <InvoiceBottomSheet
        visible={invoiceBottomSheetVisible}
        setCheckedItems={setCheckedItems}
        onClose={() => setInvoiceBottomSheetVisible(false)}
        onSubmit={handleInvoiceSubmit}
      />

      <AddSchedule
        item={item}
        visible={addScheduleBottomSheetVisible}
        setCheckedItems={setCheckedItems}
        onClose={() => setAddScheduleBottomSheetVisible(false)}
        onSubmit={data => handleScheduleSubmit(data, addSchedule)}
        isAdding={isAdding}
      />

      <RemarksBottomSheet
        visible={remarksBottomSheetVisible}
        onClose={() => setRemarksBottomSheetVisible(false)}
        remarks={remarks}
        setRemarks={setRemarks}
        selectedRemark={selectedRemark} // ✅ Ensure selectedRemark is passed
        setSelectedRemark={setSelectedRemark} // ✅ Ensure setSelectedRemark is passed
        submitRemarks={submitRemarks}
      />

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
          handleComponent={null} // Remove the top notch
          style={{
            backgroundColor: '#fff', // Ensure visibility of shadow
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -3}, // Adjust for shadow on top edge
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 1, // Android shadow
            borderWidth: 1,
            borderColor: '#ccc',
          }}
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
            item={item}
            inspectItems={inspectItems}
            data={data}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            dataItems={dataItems}
            selectedYear={selectedYear}
            setModalVisible={setModalVisible}
            setMessage={setMessage}
            search={search}
            closeBottomSheet={closeBottomSheet}
            openBottomSheet={openBottomSheet}
            refreshData={refreshData} // Pass refresh function to Footer
            setInvoiceBottomSheetVisible={setInvoiceBottomSheetVisible}
            setAddScheduleBottomSheetVisible={setAddScheduleBottomSheetVisible}
            setRemarksBottomSheetVisible={setRemarksBottomSheetVisible}
            isInspecting={isInspecting}
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
            snapPoints={imagePath.length > 0 ? ['80%'] : ['25%', '50%']}
            style={{flex: 1, paddingHorizontal: 10}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
                gap: 10,
              }}>
              {/* Take Photo Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#D6D6D6', // Dirtier white
                  paddingVertical: 10,
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleTakePhoto}>
                <Icon
                  name="camera"
                  size={20}
                  color="#222"
                  style={{marginRight: 5}}
                />
                <Text style={{color: '#222', fontSize: 14, fontWeight: '500'}}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              {/* Browse Image Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#D6D6D6', // Dirtier white
                  paddingVertical: 10,
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleImageUpload}>
                <Icon
                  name="cloud-upload"
                  size={20}
                  color="#222"
                  style={{marginRight: 5}}
                />
                <Text style={{color: '#222', fontSize: 14, fontWeight: '500'}}>
                  Browse Image
                </Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowUploading(false);
                  bottomSheetRef.current?.close();
                }}
                style={{
                  padding: 10,
                  borderRadius: 50,
                  backgroundColor: '#F5F5F5', // Dirtier white
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon name="close" size={22} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={{padding: 5, paddingStart: 20}}>
              <Text style={{fontSize: 8, color: 'gray'}}>
                Please upload an image in JPG or PNG format.
              </Text>
            </View>

            <BottomSheetScrollView contentContainerStyle={{paddingBottom: 20}}>
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
                        borderWidth: 1,
                        borderColor: '#ccc',
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
                          top: 20,
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
            </BottomSheetScrollView>

            {/* Upload Button at Bottom */}
            <View style={{justifyContent: 'flex-end', padding: 20, borderTopColor:'silver', borderTopWidth:1, paddingTop:10}}>
              <TouchableOpacity
                style={{
                  backgroundColor:
                    imagePath.length === 0 ? '#A9A9A9' : '#007AFF',
                  //padding: 15,
                  paddingVertical: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                onPress={handleUpload}
                disabled={imagePath.length === 0}>
                <Text
                  style={{color: '#FFFFFF', fontSize: 14, fontWeight: '500'}}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Text>
                {uploading && (
                  <ActivityIndicator style={{marginLeft: 10}} color="white" />
                )}
              </TouchableOpacity>
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
    //borderWidth: 1,
    //borderColor: 'silver',
    borderRadius: 5,
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
    //color: 'black',
    color: '#2C3E50',
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
    alignItems: 'baseline',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  onHoldButton: {
    flexDirection: 'row',
    borderWidth: 1,
    backgroundColor: '#F35454',
    borderColor: '#F35454',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  onHoldButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inspectedButton: {
    /*    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
 */
    flexDirection: 'row',
    //borderWidth: 1,
    backgroundColor: '#007BFF',
    //borderColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 2,
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
