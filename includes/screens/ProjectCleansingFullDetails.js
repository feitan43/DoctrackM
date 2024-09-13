import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
  Button,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Divider, FAB} from '@rneui/themed';
import MapComponent from '../utils/MapComponent';
import ImagePicker, {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions'; // Optional for permission handling
import Geolocation from 'react-native-geolocation-service';
import useFileUpload from '../api/useFileUpload';
import useUserInfo from '../api/useUserInfo';

const ProjectCleansingFullDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {fullName} = useUserInfo();
  const {item} = route.params || {};
  const [visible, setVisible] = React.useState(true);

  const baseUri = item.inspectionGSO
    ? `https://www.davaocityportal.com/tempUpload/${item.inspectionGSO.AccountId}~${item.inspectionGSO.InspectorOffice}~`
    : '';
  const ceoBaseUri = item.inspectionCEO
    ? `https://www.davaocityportal.com/tempUpload/${item.inspectionCEO.AccountId}~${item.inspectionCEO.InspectorOffice}~`
    : '';
  const extensions = ['png', 'jpeg', 'jpg'];

  const [imageUris, setImageUris] = React.useState([]);
  const [ceoImageUris, setCeoImageUris] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [addingModalVisible, setAddingModalVisible] = React.useState(false); // New state for the additional modal
  const [date, setDate] = useState('');
  const [inspector, setInspector] = useState('');
  const [remarks, setRemarks] = useState('');
  const [location, setLocation] = useState('');

  const [selectedImage, setSelectedImage] = React.useState(null);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const {uploading, uploadResult, error, uploadFile} = useFileUpload();

  const constructImageUris = async (baseUri, fileIdentifiers) => {
    const uris = [];
    for (let identifier of fileIdentifiers) {
      for (let ext of extensions) {
        const uri = `${baseUri}${identifier}.${ext}`;
        try {
          const response = await fetch(uri);
          if (response.ok) {
            uris.push(uri);
            break;
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      }
    }
    return uris;
  };

  useEffect(() => {
    const fetchImageUris = async () => {
      if (item.inspectionGSO) {
        const fileIdentifiers = item.inspectionGSO.UploadFiles.split('-');
        const uris = await constructImageUris(baseUri, fileIdentifiers);
        setImageUris(uris);
      }

      if (item.inspectionCEO) {
        const ceoFileIdentifiers = item.inspectionCEO.UploadFiles.split('-');
        const ceoUris = await constructImageUris(
          ceoBaseUri,
          ceoFileIdentifiers,
        );
        setCeoImageUris(ceoUris);
      }
    };

    fetchImageUris();
  }, [item.inspectionGSO, item.inspectionCEO]);

  const formatDate = text => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';

    // Format the text as YYYY-MM-DD
    if (cleaned.length > 4) {
      formatted += cleaned.slice(0, 4) + '-';
      formatted += cleaned.slice(4, 6) + '-';
      formatted += cleaned.slice(6, 8);
    } else if (cleaned.length > 2) {
      formatted += cleaned.slice(0, 4) + '-';
      formatted += cleaned.slice(4, 6);
    } else {
      formatted += cleaned;
    }

    return formatted;
  };

  const handleChange = text => {
    setDate(formatDate(text));
  };

  const handleImagePress = uri => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const showAddingModal = () => {
    setAddingModalVisible(true);
  };

  const hideAddingModal = () => {
    setAddingModalVisible(false);
  };

  const handleImagePick = () => {
    launchImageLibrary({selectionLimit: 0}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const images = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image${asset.fileSize}.jpg`,
        }));
        //console.log('Selected Images:', images);
        setSelectedImages(images);
      }
    });
  };

  const handleSave = async () => {
    if (!date) {
      Alert.alert('Please enter the date.');
      return;
    }
  
    try {
      // Call the upload function and wait for the result
      const result = await uploadFile(item.Id, date, remarks, selectedImages);
  
      // Check the result directly
      if (result?.status === 'success') {
        Alert.alert('Data saved successfully');
        hideAddingModal();
      } else {
        Alert.alert(
          'Failed to save data:',
          result?.message || 'An unexpected error occurred'
        );
      }
    } catch (err) {
      Alert.alert(
        'Failed to save data:',
        err.message || 'An unexpected error occurred'
      );
    }
  };

  /*   const handleCamera = () => {
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
      if (result === RESULTS.GRANTED) {
        request(PERMISSIONS.ANDROID.CAMERA).then(cameraResult => {
          if (cameraResult === RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              position => {
                const {latitude, longitude} = position.coords;
                setLocation({latitude, longitude});

                launchCamera({}, response => {
                  if (response.assets && response.assets[0]) {
                    const uri = response.assets[0].uri;
                    setSelectedImage(uri);

                    console.log('Image URI:', uri);
                    console.log('Location:', {latitude, longitude});
                  }
                });
              },
              error => {
                console.error('Error getting location:', error);
              },
              {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
          } else {
            console.warn('Camera permission not granted');
          }
        });
      } else {
        console.warn('Location permission not granted');
      }
    });
  }; */

  const handleCamera = () => {
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
      if (result === RESULTS.GRANTED) {
        request(PERMISSIONS.ANDROID.CAMERA).then(cameraResult => {
          if (cameraResult === RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              position => {
                const {latitude, longitude} = position.coords;
                setLocation({latitude, longitude});

                launchCamera({}, response => {
                  if (response.assets && response.assets[0]) {
                    const uri = response.assets[0].uri;

                    // Update the selectedImages array
                    setSelectedImages(prevImages => [
                      ...prevImages,
                      {uri: uri, latitude: latitude, longitude: longitude},
                    ]);

                    console.log('Image URI:', uri);
                    console.log('Location:', {latitude, longitude});
                  }
                });
              },
              error => {
                console.error('Error getting location:', error);
              },
              {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
          } else {
            console.warn('Camera permission not granted');
          }
        });
      } else {
        console.warn('Location permission not granted');
      }
    });
  };

  const handleRemoveImage = indexToRemove => {
    setSelectedImages(prevImages =>
      prevImages.filter((_, index) => index !== indexToRemove),
    );
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No item details available.</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/docmobileBG.png')}
      style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Icon
            name="chevron-back-outline"
            size={26}
            color="white"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View
            style={{
              backgroundColor: 'white',
              height: '100%',
              paddingHorizontal: 10,
            }}>
            <View style={{paddingTop: 10}}>
              <Text
                style={{
                  fontFamily: 'Oswald-Regular',
                  paddingStart: 10,
                  fontSize: 16,
                }}>
                Account Details
              </Text>
              <View
                style={{
                  width: '100%',
                  borderWidth: 0.2,
                  borderColor: 'lightgrey',
                }}></View>

              <View style={{}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Project Id</Text>
                  <Text style={styles.labelValue}>{item.Id}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Track Year</Text>
                  <Text style={styles.labelValue}>{item.TrackYear}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>TN</Text>
                  <Text style={styles.labelValue}>{item.TrackingNumber}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Fund</Text>
                  <Text style={styles.labelValue}>{item.Fund}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Barangay</Text>
                  <Text style={styles.labelValue}>{item.BarangayName}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.labelValue}>{item.SpecificLocation}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Respo. Center</Text>
                  <Text style={styles.labelValue}>{item.RespoCenter}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Office</Text>
                  <Text style={styles.labelValue}>{item.Office}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Account</Text>
                  <Text style={styles.labelValue}>
                    {item.AccountCode}
                    {'\n'}
                    {item.AccountTitle}
                  </Text>
                </View>

                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Sub Code</Text>
                  <Text style={styles.labelValue}>{item.SubCode}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Property Number</Text>
                  <Text style={styles.labelValue}>{item.PropertyNumber}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Property Number(Accounting)</Text>
                  <Text style={styles.labelValue}>
                    {item.PropertyNumberAccounting}
                  </Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.labelValue}>{item.Description}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.labelValue}>{item.Date}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Est. Use Life</Text>
                  <Text style={styles.labelValue}>{item.EstimatedUseLife}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Accumulated Depreciation</Text>
                  <Text style={styles.labelValue}>{item.AcquisitionCost}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Accumulated Impairment</Text>
                  <Text style={styles.labelValue}>
                    {item.AccumulatedImpairment}
                  </Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Carrying Amount</Text>
                  <Text style={styles.labelValue}>{item.CarryingAmount}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Adjusted Cost</Text>
                  <Text style={styles.labelValue}>{item.AdjustedCost}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Net Book Value</Text>
                  <Text style={styles.labelValue}>{item.NetBookValue}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Disposal</Text>
                  <Text style={styles.labelValue}>{item.Disposal}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Nature of Maintenance</Text>
                  <Text style={styles.labelValue}>
                    {item.NatureOfMaintenance}
                  </Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Nature of Repair</Text>
                  <Text style={styles.labelValue}>{item.NatureOfRepair}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Repair Maintenance Amount</Text>
                  <Text style={styles.labelValue}>
                    {item.RepairMaintenanceAmount}
                  </Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.labelValue}>{item.Status}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>For Improvement Project Id</Text>
                  <Text style={styles.labelValue}>{item.ProjectID}</Text>
                </View>
                <Divider
                  width={0.8}
                  color={'silver'}
                  borderStyle={'dashed'}
                  marginStart={'43%'}
                  marginBottom={5}
                  style={{bottom: 0}}
                />
              </View>
            </View>

            <View style={{paddingTop: 10, paddingBottom: 10}}>
              {/*  <Text style={{fontFamily: 'Oswald-Regular', paddingStart: 10, fontSize: 16}}>Location</Text>
              <View
                style={{
                  width: '100%',
                  borderWidth: 0.5,
                  borderColor: 'silver',
                }}></View> */}

              <MapComponent mapLocation={item.MapsLocation} />
            </View>

            <View style={{paddingTop: 10}}>
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  paddingBottom: 5,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Oswald-Regular',
                    paddingStart: 10,
                    fontSize: 16,
                  }}>
                  GSO Inspection
                </Text>
                <TouchableOpacity
                  onPress={showAddingModal}
                  style={{
                    backgroundColor: '#044ba4',
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Icon name="add-circle-outline" size={20} color="white" />
                  <Text style={{color: 'white'}}>Add</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: '100%',
                  borderWidth: 0.5,
                  borderColor: 'silver',
                }}></View>

              <View
                style={{
                  backgroundColor: 'rgba(246, 248, 250, 1)',
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  paddingTop: 10,
                  marginTop: 10,
                }}>
                {item.inspectionGSO ? (
                  <>
                    <View style={{paddingStart: 10, paddingBottom: 20}}>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Light',
                            fontSize: 14,
                            width: '30%',
                            textAlign: 'left',
                          }}>
                          Date:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 14,
                            width: '70%',
                            color: '#252525',
                            textAlign: 'left',
                          }}>
                          {item.inspectionGSO.DateInspected}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Light',
                            fontSize: 14,
                            width: '30%',
                            textAlign: 'left',
                          }}>
                          Inspector:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 14,
                            width: '70%',
                            color: '#252525',
                            textAlign: 'left',
                          }}>
                          {item.inspectionGSO.Inspector}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Light',
                            fontSize: 14,
                            width: '30%',
                            textAlign: 'left',
                          }}>
                          Remarks:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 14,
                            width: '70%',
                            color: '#252525',
                            textAlign: 'left',
                          }}>
                          {item.inspectionGSO.Remarks}
                        </Text>
                      </View>
                    </View>
                    {imageUris.length > 0 ? (
                      imageUris.map((uri, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleImagePress(uri)}>
                          <Image
                            key={index}
                            source={{uri}}
                            style={{
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
                            }}
                          />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          justifyContent: 'center',
                          marginHorizontal: 10,
                        }}>
                        <Text
                          style={{
                            alignSelf: 'center',
                            color: 'white',
                            fontFamily: 'Oswald-Regular',
                            fontSize: 16,
                            padding: 10,
                          }}>
                          NO IMAGES FOUND
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      <Icon name="create-outline" size={24} color="lightgrey" />
                      <Text>Edit</Text>
                    </View>
                  </>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      justifyContent: 'center',
                      marginHorizontal: 10,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        alignSelf: 'center',
                        color: 'white',
                        fontFamily: 'Oswald-Regular',
                        fontSize: 16,
                        padding: 10,
                      }}>
                      NO RESULT FOUND
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{paddingTop: 10}}>
              <Text
                style={{
                  fontFamily: 'Oswald-Regular',
                  paddingStart: 10,
                  fontSize: 16,
                }}>
                CEO Inspection
              </Text>
              <View
                style={{
                  width: '100%',
                  borderWidth: 0.5,
                  borderColor: 'silver',
                }}></View>
              <View
                style={{
                  backgroundColor: 'rgba(246, 248, 250, 1)',
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  paddingTop: 10,
                  marginTop: 10,
                }}>
                {item.inspectionCEO ? (
                  <>
                    <View style={{paddingStart: 10, paddingBottom: 20}}>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Light',
                            fontSize: 14,
                            width: '30%',
                            textAlign: 'left',
                          }}>
                          Date:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 14,
                            width: '70%',
                            color: '#252525',
                            textAlign: 'left',
                          }}>
                          {item.inspectionCEO.DateInspected}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Light',
                            fontSize: 14,
                            width: '30%',
                            textAlign: 'left',
                          }}>
                          Inspector:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 14,
                            width: '70%',
                            color: '#252525',
                            textAlign: 'left',
                          }}>
                          {item.inspectionCEO.Inspector}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Light',
                            fontSize: 14,
                            width: '30%',
                            textAlign: 'left',
                          }}>
                          Remarks:
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Oswald-Regular',
                            fontSize: 14,
                            width: '70%',
                            color: '#252525',
                            textAlign: 'left',
                          }}>
                          {item.inspectionCEO.Remarks}
                        </Text>
                      </View>
                    </View>

                    {ceoImageUris.length > 0 ? (
                      ceoImageUris.map((uri, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleImagePress(uri)}>
                          <Image
                            key={index}
                            source={{uri}}
                            style={{
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
                            }}
                          />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View>
                        <View
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            justifyContent: 'center',
                            marginHorizontal: 10,
                          }}>
                          <Text
                            style={{
                              alignSelf: 'center',
                              color: 'white',
                              fontFamily: 'Oswald-Regular',
                              fontSize: 16,
                              padding: 10,
                            }}>
                            NO IMAGES FOUND
                          </Text>
                        </View>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      <Icon name="create-outline" size={24} color="lightgrey" />
                      <Text>Edit</Text>
                    </View>
                  </>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      justifyContent: 'center',
                      marginHorizontal: 10,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        alignSelf: 'center',
                        color: 'white',
                        fontFamily: 'Oswald-Regular',
                        fontSize: 16,
                        padding: 10,
                      }}>
                      NO RESULT FOUND
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        {/* Image Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Image source={{uri: selectedImage}} style={styles.modalImage} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          visible={addingModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={hideAddingModal}>
          <View style={styles.modalContainer}>
            <View style={styles.addingModalContent}>
              <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Text style={styles.addingModalText}>Upload Inspection</Text>
                  <TouchableOpacity
                    onPress={hideAddingModal}
                    style={styles.modalCloseButton}>
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>

                <View style={{marginBottom: 10}}>
                  <Text style={{fontSize: 14, marginRight: 10}}>Date:</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={handleChange}
                    style={{
                      borderWidth: 0.2,
                      paddingVertical: -10,
                      paddingHorizontal: 10,
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <Text style={{marginBottom: 10}}>Image/s</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: 10,
                    marginBottom: 10,
                  }}>
                  <TouchableOpacity
                    onPress={handleCamera}
                    style={{borderWidth: 0.2, borderColor: 'grey', padding: 5, flex: 1}}>
                    <Text style={styles.uploadButtonText}>
                      📸 Take a Picture
                    </Text>
                  </TouchableOpacity>
                  <Text style={{fontSize:12, fontFamily:'Oswald-Light'}}>
                    or
                  </Text>
                  <TouchableOpacity
                    onPress={handleImagePick}
                    style={{borderWidth: 0.2, borderColor: 'grey', padding: 5, flex: 1}}>
                    <Text style={styles.uploadButtonText}>
                      🖼️ Pick an Image
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    marginTop: 5,
                    marginBottom: 10,
                    borderWidth: 0.5,
                    borderStyle: 'dashed',
                  }}>
                  {selectedImages.length > 0 &&
                    selectedImages.map((image, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image
                          source={{uri: image.uri}}
                          style={styles.selectedImage}
                        />
                        <View style={styles.imageDetailsContainer}>
                          <Text
                            style={styles.filenameText}
                            numberOfLines={1}
                            ellipsizeMode="middle">
                            {image.uri || `Image ${index + 1}`}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveImage(index)}>
                            <Icon
                              name="close-outline"
                              size={24}
                              color="white"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </View>

                <Text>Remarks</Text>
                <TextInput
                  value={remarks}
                  onChangeText={setRemarks}
                  style={{
                    height: 60,
                    borderWidth: 0.2,
                    textAlignVertical: 'top',
                    marginBottom: 20,
                  }}
                />

                <View>
                  <Button title="Save" onPress={handleSave} />
                  {uploading && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingStart: 20,
    //padding: 10,
    //backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    marginRight: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Oswald-Medium',
    paddingBottom: 10,
  },
  contentContainer: {
    //padding: 15,
  },
  detailContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    width: '40%',
    textAlign: 'right',
    textAlignVertical: 'top',
    fontFamily: 'Oswald-Light',
    opacity: 0.6,
    color: 'grey',
  },
  labelValue: {
    fontSize: 14,
    width: '50%',
    marginStart: 10,
    fontFamily: 'Oswald-Light',
    color: '#252525',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCloseButton: {
    borderWidth: 0.2,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  modalImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#252525',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: 'white',
  },
  addingModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
  },
  addingModalText: {
    fontSize: 18,
  },
  imageContainer: {
  },
  selectedImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  imageDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'grey',
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: '100%',
  },
  filenameText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 15,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ProjectCleansingFullDetails;
