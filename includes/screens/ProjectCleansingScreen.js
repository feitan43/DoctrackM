import React, {useState, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Button
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import useProjectCleansing from '../api/ProjectCleansing/useProjectCleansing';
import {Chip} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

const ProjectCleansingScreen = () => {
  const [barangayValue, setBarangayValue] = useState([]);
  const [titleValue, setTitleValue] = useState([]);
  const [officeValue, setOfficeValue] = useState([]);
  const [statusValue, setStatusValue] = useState([]);

  const navigation = useNavigation();

  const [selectedChips, setSelectedChips] = useState({GSO: false, CEO: false});
  const [selectedFundsChips, setSelectedFundsChips] = useState({
    GF: false,
    TF: false,
    SEF: false,
  });

  const [barangaySearch, setBarangaySearch] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [officeSearch, setOfficeSearch] = useState('');
  const [statusSearch, setStatusSearch] = useState('');

  const barangaySheetRef = useRef(null);
  const titleSheetRef = useRef(null);
  const officeSheetRef = useRef(null);
  const statusSheetRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  /* const getSelectedValues = () => {
    const selectedBarangay = barangayValue;
    const selectedTitle = titleValue;
    const selectedOffice = officeValue;
    const selectedStatus = statusValue;

    const inspectedSelected = Object.keys(selectedChips).filter(
      key => selectedChips[key],
    );
    const fundSelected = Object.keys(selectedFundsChips).filter(
      key => selectedFundsChips[key],
    );

    return {
      selectedBarangay,
      selectedTitle,
      selectedOffice,
      selectedStatus,
      inspectedSelected,
      fundSelected,
    };
  };
  const selectedValues = getSelectedValues(); */

  /* const handleSearch = () => {
    setIsModalVisible(true);
  }; */

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleSearch = () => {
    const inspected = Object.keys(selectedChips)
      .filter(key => selectedChips[key])
      .join(', ');
    const fund = Object.keys(selectedFundsChips)
      .filter(key => selectedFundsChips[key])
      .join(', ');

    // Check if at least one of the required fields is selected
    const hasSelectedFilters =
      barangayValue.length > 0 ||
      titleValue.length > 0 ||
      officeValue.length > 0 ||
      statusValue.length > 0;

    if (hasSelectedFilters) {
      navigation.navigate('ProjectCleansingDetails', {
        barangay: barangayValue.join(', '),
        title: titleValue.join(', '),
        office: officeValue.join(', '),
        status: statusValue.join(', '),
        inspected,
        fund,
      });
    } else {
      // Optionally, you can show a message to the user
      alert(
        'Please select at least one filter (Barangay, Title, Office, or Status) before searching.',
      );
    }
  };

  const handleDetails = () => {
    // Fetch project cleansing details and navigate
    /*  if (selectedValues) {
      navigation.navigate('ProjectCleansingDetails', { projectCleansingDetails });
    } */
  };

  const handleBarangayBackdropPress = () => {
    barangaySheetRef.current?.dismiss();
  };

  const handleTitleBackdropPress = () => {
    titleSheetRef.current?.dismiss();
  };

  const handleOfficeBackdropPress = () => {
    officeSheetRef.current?.dismiss();
  };

  const handleStatusBackdropPress = () => {
    statusSheetRef.current?.dismiss();
  };

  const CustomBackdrop = ({style}) => <View style={[styles.backdrop, style]} />;

  const snapPoints = useMemo(() => [/* '25%', */ '50%', '75%'], []);

  const toggleChip = chip => {
    setSelectedChips(prevState => ({
      ...prevState,
      [chip]: !prevState[chip],
    }));
  };

  const toggleFundsChip = chip => {
    setSelectedFundsChips(prevState => ({
      ...prevState,
      [chip]: !prevState[chip],
    }));
  };

  const {projectCleansingData} = useProjectCleansing();

  const barangayData =
    projectCleansingData?.BarangayNames?.map(name => ({
      id: name,
      name: name,
    })) || [];

  const titleData =
    projectCleansingData?.Accounts?.map(account => ({
      id: account.AccountTitle,
      name: account.AccountTitle,
    })) || [];

  const officeData =
    projectCleansingData?.Offices?.map(offices => ({
      id: offices,
      name: offices,
    })) || [];

  const statusData =
    projectCleansingData?.Status?.map(status => ({
      id: status,
      name: status,
    })) || [];

  const renderBottomSheetContent = (
    data,
    selectedValues,
    setSelectedValues,
    searchValue,
    setSearchValue,
  ) => {
    const filteredData = data.filter(item =>
      item.name.toLowerCase().includes(searchValue.toLowerCase()),
    );

    return (
      <>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchValue}
          onChangeText={setSearchValue}
        />
        <BottomSheetFlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setSelectedValues(prev =>
                  prev.includes(item.id)
                    ? prev.filter(value => value !== item.id)
                    : [...prev, item.id],
                );
              }}>
              <Text style={styles.sheetItemText}>{item.name}</Text>
              {selectedValues.includes(item.id) && (
                <Text style={styles.checkmark}>✔</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </>
    );
  };

  return (
    <BottomSheetModalProvider>
      <ImageBackground
        source={require('../../assets/images/docmobileBG.png')}
        style={{flex: 1}}>
        <SafeAreaView>
          <View
            style={{
              //backgroundColor: 'rgba(20, 16, 25, 0.2)',
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
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontFamily: 'Oswald-Medium',
                  lineHeight: 22,
                }}>
                PROJECT CLEANSING{' '}
                <Text style={{fontSize: 12, fontStyle: 'italic'}}>
                  for Inspection
                </Text>
              </Text>
            </View>
          </View>

          <View style={{height:'100%', backgroundColor:'rgba(246, 248, 250, 1)',paddingTop: 10}}>

          <ScrollView>
            <View style={{flex: 1}}>
              <View style={styles.dropdownContainer}>
                {/* <Text style={styles.label}>Barangay</Text> */}
                <TouchableOpacity
                  onPress={() => barangaySheetRef.current?.present()}
                  style={styles.dropdownButton}>
                  <Text style={styles.dropdownButtonText}>
                    {barangayValue.length > 0 ? (
                      barangayValue.join(', ')
                    ) : (
                      <Text style={{color: 'black'}}>Select Barangay</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                  {barangayValue.length > 0 && (
                    <View style={styles.selectedChipsContainer}>
                      {barangayValue.map(barangay => (
                        <Chip
                          key={barangay}
                          title={barangay}
                          buttonStyle={styles.selectedChip}
                          iconPosition="right"
                          icon={{
                            name: 'close',
                            type: 'material',
                            color: 'white',
                            size: 14,
                          }}
                          titleStyle={{
                            fontSize: 12,
                          }}
                          onPress={() =>
                            setBarangayValue(
                              barangayValue.filter(item => item !== barangay),
                            )
                          }
                        />
                      ))}
                    </View>
                  )}
                </ScrollView>
              </View>

              <View style={styles.dropdownContainer}>
                {/*  <Text style={styles.label}>Title</Text> */}
                <TouchableOpacity
                  onPress={() => titleSheetRef.current?.present()}
                  style={styles.dropdownButton}>
                  <Text style={styles.dropdownButtonText}>
                    {titleValue.length > 0 ? (
                      titleValue.join(', ')
                    ) : (
                      <Text style={{color: 'black'}}>Select Title</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                  {titleValue.length > 0 && (
                    <View style={styles.selectedChipsContainer}>
                      {titleValue.map(title => (
                        <Chip
                          key={title}
                          title={title}
                          buttonStyle={styles.selectedChip}
                          iconPosition="right"
                          icon={{
                            name: 'close',
                            type: 'material',
                            color: 'white',
                            size: 14,
                          }}
                          titleStyle={{
                            fontSize: 12,
                          }}
                          onPress={() =>
                            setTitleValue(
                              titleValue.filter(item => item !== title),
                            )
                          }
                        />
                      ))}
                    </View>
                  )}
                </ScrollView>
              </View>

              <View style={styles.dropdownContainer}>
                {/* <Text style={styles.label}>Office</Text> */}
                <TouchableOpacity
                  onPress={() => officeSheetRef.current?.present()}
                  style={styles.dropdownButton}>
                  <Text style={styles.dropdownButtonText}>
                    {officeValue.length > 0 ? (
                      officeValue.join(', ')
                    ) : (
                      <Text style={{color: 'black'}}>Select Office</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                  {officeValue.length > 0 && (
                    <View style={styles.selectedChipsContainer}>
                      {officeValue.map(office => (
                        <Chip
                          key={office}
                          title={office}
                          buttonStyle={styles.selectedChip}
                          iconPosition="right"
                          icon={{
                            name: 'close',
                            type: 'material',
                            color: 'white',
                            size: 14,
                          }}
                          titleStyle={{
                            fontSize: 12,
                          }}
                          onPress={() =>
                            setOfficeValue(
                              officeValue.filter(item => item !== office),
                            )
                          }
                        />
                      ))}
                    </View>
                  )}
                </ScrollView>
              </View>

              <View style={styles.dropdownContainer}>
                {/* <Text style={styles.label}>Status</Text> */}
                <TouchableOpacity
                  onPress={() => statusSheetRef.current?.present()}
                  style={styles.dropdownButton}>
                  <Text style={styles.dropdownButtonText}>
                    {statusValue.length > 0 ? (
                      statusValue.join(', ')
                    ) : (
                      <Text style={{color: 'black'}}>Select Status</Text>
                    )}
                  </Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                  {statusValue.length > 0 && (
                    <View style={styles.selectedChipsContainer}>
                      {statusValue.map(status => (
                        <Chip
                          key={status}
                          title={status}
                          buttonStyle={styles.selectedChip}
                          iconPosition="right"
                          icon={{
                            name: 'close',
                            type: 'material',
                            color: 'white',
                            size: 14,
                          }}
                          titleStyle={{
                            fontSize: 12,
                          }}
                          onPress={() =>
                            setStatusValue(
                              statusValue.filter(item => item !== status),
                            )
                          }
                        />
                      ))}
                    </View>
                  )}
                </ScrollView>
              </View>

              {/*     <View>
                <Text
                  style={{
                    paddingStart: 10,
                    fontFamily: 'Oswald-Regular',
                    fontSize: 14,
                    opacity: 1,
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}>
                  INSPECTED
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingStart: 20,
                  columnGap: -15,
                }}>
                <Chip
                  title="GSO"
                  icon={
                    selectedChips.GSO
                      ? {
                          name: 'check',
                          type: 'material',
                          color: 'white',
                          size: 12,
                        }
                      : undefined
                  }
                  onPress={() => toggleChip('GSO')}
                  buttonStyle={
                    selectedChips.GSO ? styles.selectedChip : styles.chip
                  }
                />
                <Chip
                  title="CEO"
                  icon={
                    selectedChips.CEO
                      ? {
                          name: 'check',
                          type: 'material',
                          color: 'white',
                          size: 12,
                        }
                      : undefined
                  }
                  onPress={() => toggleChip('CEO')}
                  buttonStyle={
                    selectedChips.CEO ? styles.selectedChip : styles.chip
                  }
                />
              </View> */}

              {/*    <View>
                <Text
                  style={{
                    paddingStart: 10,
                    fontFamily: 'Oswald-Regular',
                    fontSize: 14,
                    opacity: 1,
                    letterSpacing: 1,
                    marginTop: 10,
                    marginBottom: 10,
                  }}>
                  FUND
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingStart: 20,
                  columnGap: -15,
                }}>
                <Chip
                  title="GF"
                  icon={
                    selectedFundsChips.GF
                      ? {
                          name: 'check',
                          type: 'material',
                          color: 'white',
                          size: 12,
                        }
                      : undefined
                  }
                  onPress={() => toggleFundsChip('GF')}
                  buttonStyle={
                    selectedFundsChips.GF ? styles.selectedChip : styles.chip
                  }
                />
                <Chip
                  title="TF"
                  icon={
                    selectedFundsChips.TF
                      ? {
                          name: 'check',
                          type: 'material',
                          color: 'white',
                          size: 12,
                        }
                      : undefined
                  }
                  onPress={() => toggleFundsChip('TF')}
                  buttonStyle={
                    selectedFundsChips.TF ? styles.selectedChip : styles.chip
                  }
                />
                <Chip
                  title="SEF"
                  icon={
                    selectedFundsChips.SEF
                      ? {
                          name: 'check',
                          type: 'material',
                          color: 'white',
                          size: 12,
                        }
                      : undefined
                  }
                  onPress={() => toggleFundsChip('SEF')}
                  buttonStyle={
                    selectedFundsChips.SEF ? styles.selectedChip : styles.chip
                  }
                />
              </View> */}

              <View
                style={{
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: '100%',
                  paddingHorizontal: 10,
                  //paddingTop: 30,
                }}>
                  <Button title="Inspect" onPress={handleSearch} style={{padding: 10, backgroundColor: '#044ba4'}} labelStyle={{textAlign: 'center',
                      color: 'white',
                      fontFamily: 'Oswald-Regular',
                      fontSize: 15,}}
                  />
               {/*  <TouchableOpacity
                  style={{padding: 10, backgroundColor: '#044ba4'}}
                  onPress={handleSearch}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: 'white',
                      fontFamily: 'Oswald-Regular',
                      fontSize: 15,
                    }}>
                    INSPECT
                  </Text>
                </TouchableOpacity> */}
              </View>

              {/* <View style={{backgroundColor:'white', height: '100%'}}>

              </View> */}
            </View>

            {/*     <Modal
              visible={isModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={hideModal}>
              <View style={styles.modalContainer}>
             
                <View style={styles.modalContent}>
                <TouchableOpacity
                    onPress={hideModal}
                    style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Selected Values</Text>
                  <View>
                    <Text>Barangay: {barangayValue.join(', ')}</Text>
                    <Text>Title: {titleValue.join(', ')}</Text>
                    <Text>Office: {officeValue.join(', ')}</Text>
                    <Text>Status: {statusValue.join(', ')}</Text>
                    <Text>
                      Inspected By:{' '}
                      {Object.keys(selectedChips)
                        .filter(key => selectedChips[key])
                        .join(', ')}
                    </Text>
                    <Text>
                      Fund Source:{' '}
                      {Object.keys(selectedFundsChips)
                        .filter(key => selectedFundsChips[key])
                        .join(', ')}
                    </Text>
                  </View>
                  <View style={styles.containerDetails}>
                    {projectCleansingDetails && (
                      <ScrollView
                        contentContainerStyle={styles.scrollViewContent}>
                        {projectCleansingDetails.map((detail, index) => (
                          <View key={index} style={styles.detailItem}>
                            <Text style={styles.detailText}>
                              <Text style={styles.bold}>{detail.Id}</Text> -
                              <Text style={styles.bold}>
                                {' '}
                                {detail.TrackingNumber}
                              </Text>{' '}
                              -<Text style={styles.italic}> {detail.Fund}</Text>{' '}
                              -<Text> {detail.BarangayName}</Text> -
                              <Text style={styles.italic}>
                                {' '}
                                {detail.AccountTitle}
                              </Text>{' '}
                              -<Text> {detail.Description}</Text>
                              -<Text> {detail.AcquisitionCost}</Text>

                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  
                </View>
              </View>
            </Modal> */}

            <View style={{height: 100}}></View>
          </ScrollView>

          </View>

      

          <BottomSheetModal
            ref={barangaySheetRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={props => (
              <CustomBackdrop
                {...props}
                onPress={handleBarangayBackdropPress}
              />
            )}
            containerStyle={styles.bottomSheetContainer}>
            {renderBottomSheetContent(
              barangayData,
              barangayValue,
              setBarangayValue,
              barangaySearch,
              setBarangaySearch,
            )}
          </BottomSheetModal>

          <BottomSheetModal
            ref={titleSheetRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={props => (
              <CustomBackdrop {...props} onPress={handleTitleBackdropPress} />
            )}
            containerStyle={styles.bottomSheetContainer}>
            {renderBottomSheetContent(
              titleData,
              titleValue,
              setTitleValue,
              titleSearch,
              setTitleSearch,
            )}
          </BottomSheetModal>

          <BottomSheetModal
            ref={officeSheetRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={props => (
              <CustomBackdrop {...props} onPress={handleOfficeBackdropPress} />
            )}
            containerStyle={styles.bottomSheetContainer}>
            {renderBottomSheetContent(
              officeData,
              officeValue,
              setOfficeValue,
              officeSearch,
              setOfficeSearch,
            )}
          </BottomSheetModal>

          <BottomSheetModal
            ref={statusSheetRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={props => (
              <CustomBackdrop {...props} onPress={handleStatusBackdropPress} />
            )}
            containerStyle={styles.bottomSheetContainer}>
            {renderBottomSheetContent(
              statusData,
              statusValue,
              setStatusValue,
              statusSearch,
              setStatusSearch,
            )}
          </BottomSheetModal>
        </SafeAreaView>
      </ImageBackground>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    color: 'white',
    fontFamily: 'Oswald-Regular',
    fontSize: 18,
  },
  container: {
    //paddingTop: 10,
    //paddingHorizontal: 10,
  },
  dropdownContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    //gap: -5,
  },
  label: {
    fontFamily: 'Oswald-Regular',
    fontSize: 14,
  },
  dropdownButton: {
    borderColor: 'grey',
    //borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    color: 'black',
    letterSpacing: 1,
  },
  chip: {
    marginHorizontal: 15,
    backgroundColor: 'lightgrey',
    borderRadius: 0,
    width: 65,
  },
  selectedChip: {
    marginHorizontal: 0,
    backgroundColor: '#0068ff',
    width: 'auto',
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 5,
  },
  sheetItem: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  sheetItemText: {
    fontFamily: 'Oswald-Light',
    fontSize: 18,
    color: 'black',
  },
  checkmark: {
    color: '#0068ff',
    fontSize: 18,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
  },
  bottomSheetContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Customize the color and opacity
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
    //borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(7, 40, 86, 1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  containerDetails: {
    flex: 1,
    //padding: 16,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    paddingBottom: 16,
  },
  detailItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});

export default ProjectCleansingScreen;
