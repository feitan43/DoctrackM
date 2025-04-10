import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Linking
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import {pick} from '@react-native-documents/picker';
import * as DocumentViewer from '@react-native-documents/viewer';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';

const formOptions = [
  {label: 'OBR Form', value: 'OBR'},
  {label: 'PR Form', value: 'PR'},
  {label: 'RFQ Form', value: 'RFQ'},
];

const AttachmentsScreen = ({navigation}) => {
  const [attachments, setAttachments] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearchBar = () => {
    setShowSearch(!showSearch);
  };

  const handleFiltersPress = () => {
    alert('Filters button pressed');
  };

  const getFileType = fileName => {
    if (fileName.endsWith('.pdf')) return 'application/pdf';
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) return 'image/*';
    return 'unknown';
  };

  const pickFile = async () => {
    try {
      if (typeof pick !== 'function') {
        console.error('pick function is not available. Check your import.');
        return;
      }
  
      const res = await pick({ type: ['image/*', 'application/pdf'] });
  
      console.log('Raw Pick Result:', res); // Log the full result first
  
      if (!res || res.length === 0) {
        console.log('File picker cancelled or no file selected.');
        return;
      }
  
      const file = res[0];
  
      console.log('Picked File:', file);
  
      setAttachments(prevAttachments => [...prevAttachments, file]);
    } catch (err) {
      if (err?.message?.includes('User canceled') || err?.code === 'E_PICKER_CANCELLED') {
        console.log('File picker was cancelled.');
        return;
      }
      //console.error('Error picking document:', err);
    }
  };
  

  const openDocument = (uri) => {
    Linking.openURL(uri).catch((err) => console.error('Error opening file:', err));
  };

  const removeAttachment = index => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/CirclesBG.png')}
        style={styles.bgHeader}>
        <View style={styles.header}>
          {showSearch ? (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                onPress={toggleSearchBar}
                style={styles.searchIcon}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Attachments</Text>
              <TouchableOpacity
                onPress={handleFiltersPress}
                style={styles.searchIcon}>
                <Icon name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ImageBackground>
      <View style={{marginVertical: 10}} />
      <TextInput
        placeholder="Enter Tracking Number"
        value={trackingNumber}
        onChangeText={setTrackingNumber}
        style={styles.input}
      />

      <Dropdown
        data={formOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Form Type"
        value={selectedForm}
        onChange={item => setSelectedForm(item.value)}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
      />

      <View style={styles.attachmentContainer}>
        <FlatList
          data={attachments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <View style={styles.attachmentItem}>
              {item.type && item.type.includes('image') ? (
                <Image
                  source={{uri: item.uri}}
                  style={styles.attachmentImage}
                />
              ) : (
                <TouchableOpacity onPress={() => openDocument(item.uri)}>
                  <Text style={styles.attachmentText}>
                    {item.name || 'PDF File'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => removeAttachment(index)}>
                <Text style={{color: 'red'}}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <Pressable
          onPress={pickFile}
          style={({pressed}) => [
            styles.uploadButton,
            {backgroundColor: pressed ? '#ddd' : '#007AFF'},
          ]}>
          <Text style={styles.uploadButtonText}>Upload File</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
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
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  searchIcon: {marginRight: 10},
  searchInput: {
    height: 40,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginStart: 10,
    marginRight: 20,
    paddingStart: 20,
  },
  backButton: {padding: 8, borderRadius: 20},
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  dropdown: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  attachmentContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    marginHorizontal: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  attachmentImage: {width: 48, height: 48, borderRadius: 8},
  attachmentText: {color: '#333', flex: 1, marginLeft: 12},
  uploadButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {color: 'white', fontWeight: '600'},
});

export default AttachmentsScreen;
