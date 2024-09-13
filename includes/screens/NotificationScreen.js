import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, Pressable, SafeAreaView , StatusBar} from 'react-native';
import RadialGradient from 'react-native-radial-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {Tab, TabView} from '@rneui/themed';

// Temporary data
const data = [
  {id: 1, title: 'Item 1', updatedAt: '2024-04-24'},
  {id: 2, title: 'Item 2', updatedAt: '2024-04-23'},
  {id: 3, title: 'Item 3', updatedAt: '2024-04-22'},
  // Add more data as needed
];

const NotificationsScreen = ({navigation}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [index, setIndex] = React.useState(0);

  return (
    
      <SafeAreaView style={{ flex: 1 }}>
      <RadialGradient
        style={{flex: 1}}
        colors={['#23597F', 'black']}
        stops={[2, 0.45, 0.35, 0.9]}
        radius={350}>
                    <StatusBar backgroundColor="black" barStyle="light-content" />

        <View style={styles.container}>
          <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{borderRadius: 100, overflow: 'hidden', margin: 5}}>
                <Pressable
                  style={({pressed}) => [
                    pressed && {backgroundColor: 'rgba(0, 0, 0, 0.1)'},
                    {
                      width: 40,
                      backgroundColor: 'transparent',
                      padding: 5,
                      flexDirection: 'row',
                      alignItems: 'center',
                    },
                  ]}
                  android_ripple={{color: 'gray'}}
                  onPress={() => navigation.goBack()}>
                  <Icon name="chevron-back-outline" size={26} color="white" />
                </Pressable>
              </View>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontFamily: 'Roboto-Medium',
                  lineHeight: 20,
                }}>
                Notifications
              </Text>
            </View>
            {/* <View style={{justifyContent: 'flex-end'}}>
            <Icon name="funnel-outline" size={20} color="white" />
          </View> */}
          </View>
          <Tab
            value={index}
            onChange={e => setIndex(e)}
            indicatorStyle={{
              backgroundColor: 'white',
              height: 3,
            }}
            variant="default"
            style={{backgroundColor: '#0277BD', marginHorizontal: 10}}>
            <Tab.Item
              title="Recent"
              titleStyle={{fontSize: 12, color: 'white'}}
             // icon={{name: 'timer', type: 'ionicon', color: 'white'}}
            />
            <Tab.Item
              title="favorite"
              titleStyle={{fontSize: 12, color: 'white'}}
              //icon={{name: 'heart', type: 'ionicon', color: 'white'}}
            />
            <Tab.Item
              title="cart"
              titleStyle={{fontSize: 12, color: 'white'}}
              //icon={{name: 'cart', type: 'ionicon', color: 'white'}}
            />
          </Tab>

          <TabView value={index} onChange={setIndex} animationType="spring">
            <TabView.Item
              style={{backgroundColor: 'transparent', width: '100%'}}>
              <Text h1 style={{color: 'white'}}>
                Recent
              </Text>
            </TabView.Item>
            <TabView.Item
              style={{backgroundColor: 'transparent', width: '100%'}}>
              <Text h1>Favorite</Text>
            </TabView.Item>
            <TabView.Item style={{width: '100%'}}>
              <Text h1>Cart</Text>
            </TabView.Item>
          </TabView>
        </View>
      </RadialGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    borderRadius: 100,
    overflow: 'hidden',
    margin: 5,
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Oswald-Medium',
    lineHeight: 20,
    marginLeft: 10,
  },
  moreButton: {
    justifyContent: 'flex-end',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  selectedTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: 'white',
  },
  tabText: {
    color: 'white',
    fontSize: 16,
  },
  selectedTabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#517fa4',
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default NotificationsScreen;
