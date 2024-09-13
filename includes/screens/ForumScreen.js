import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import {SearchBar, Icon} from '@rneui/themed';

const ForumScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All'); // State to manage selected category
  const navigation = useNavigation();

  const [search, setSearch] = useState('');

  const updateSearch = search => {
    setSearch(search);
  };

  // Dummy data for messages
  const messages = [
    {id: 1, text: 'Message 1', category: 'All'},
    {id: 2, text: 'Message 2', category: 'For You'},
    {id: 3, text: 'Message 3', category: 'Notice'},
    // Add more messages with different categories
  ];

  // Filter messages based on the selected category
  const filteredMessages =
    selectedCategory !== 'All'
      ? messages.filter(msg => msg.category === selectedCategory)
      : messages;

  const renderMessage = ({item}) => (
    <View>
      <View style={styles.messageBubble}>
        <View style={{padding: 10}}>
        <Image
          source={require('../../assets/images/davao.png')}
          style={{
            width: 60,
            height: 60,
            marginRight: 10, 
          }}
        />
        </View>
       
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  function Index() {
    const width = Dimensions.get('window').width;
    return (
      <View style={{flex: 1}}>
        <Carousel
          loop
          width={width}
          height={width / 3}
          autoPlay={true}
          data={[...new Array(6).keys()]}
          scrollAnimationDuration={2600}
          renderItem={({index}) => (
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRightWidth: 0.5,
                borderColor: 'silver',
                justifyContent: 'center',
              }}>
              <Text style={{textAlign: 'center', fontSize: 30}}>
                {'CHRISTIAN GWAPO'}
              </Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/docmobileBG.png')}
      style={styles.background}>
      <View>
        <SafeAreaView style={styles.header}>
          <View style={styles.backButtonContainer}>
            <Pressable
              style={({pressed}) => [
                pressed && styles.pressed,
                styles.backButton,
              ]}
              android_ripple={{color: 'gray'}}
              onPress={() => {
                console.log('Back button pressed');
                navigation.goBack();
              }}>
              <Icons name="chevron-back-outline" size={26} color="white" />
            </Pressable>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chats</Text>
          </View>
        </SafeAreaView>

        <View
          style={{
            backgroundColor: 'white',
            margin: 10,
            overflow: 'hidden',
            marginTop: 150,
          }}>
          <SearchBar
            placeholder="Search..."
            onChangeText={updateSearch}
            value={search}
            lightTheme={true}
            leftIconContainerStyle={{
              marginLeft: 10,
            }}
            leftIcon={
              <Icon
                name="search"
                size={26} // Increase this value to make the icon bigger
                color="#333"
              />
            }
            containerStyle={{
              backgroundColor: 'white',
              borderBottomColor: 'transparent',
              borderTopColor: 'transparent',
              padding: 0,
            }}
            inputContainerStyle={{
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              height: 40,
            }}
            inputStyle={{fontSize: 16, color: '#333'}}
            placeholderTextColor="#999"
          />
        </View>

        <FlatList
          data={filteredMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messageList}
        />
      </View>
    </ImageBackground>
  );
};

// Styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0, 0.1)',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 25,
    left: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    alignItems:'center',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  messageText: {
    color: '#333',
    fontSize: 16,
  },
});

export default ForumScreen;
