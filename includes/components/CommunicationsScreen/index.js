import React, {useState} from 'react';
import {Text, TouchableOpacity, View, Modal, TouchableWithoutFeedback, ScrollView, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TabButton from './TabButton';
import AnnouncementTab from './AnnouncementTab';
import ForumsTab from './ForumsTab';
import MessageTab from './MessageTab';
import styles from './styles';
import FeedsTab from './FeedsTab'; // Importing the new Feeds tab component
import SurveysTab from './SurveysTab';
//import SurveysTab from '../../screens/SurveysScreen';

// Placeholder component for the new Surveys tab
// const SurveysTab = () => {
//   return (
//     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//       <Text>Surveys Tab Content</Text>
//     </View>
//   );
// };


const CommunicationsScreen = ({ navigation, onScroll }) => {
  const [activeTab, setActiveTab] = useState('announcement');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const years = ['2025', '2024', '2023', '2022'];

  const renderContent = () => {
    switch (activeTab) {
      case 'announcement':
        return <AnnouncementTab selectedYear={selectedYear} />;
      case 'forums':
        return <ForumsTab navigation={navigation} selectedYear={selectedYear} />;
      case 'message':
        return <MessageTab navigation={navigation} />;
      case 'surveys':
        return <SurveysTab navigation={navigation} selectedYear={selectedYear} />;
      // New case for Feeds
      case 'feeds':
        return <FeedsTab selectedYear={selectedYear} onScroll={onScroll} />;
      default:
        return <AnnouncementTab selectedYear={selectedYear}  />;
    }
  };

  const handleYearSelect = year => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Year Dropdown Modal */}
        <Modal
          visible={showYearDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearDropdown(false)}>
          <TouchableWithoutFeedback onPress={() => setShowYearDropdown(false)}>
            <View style={styles.dropdownOverlay}>
              <View style={styles.dropdownContainer}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dropdownItem,
                      year === selectedYear && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleYearSelect(year)}>
                    <Text style={styles.dropdownItemText}>{year}</Text>
                    {year === selectedYear && (
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="#4a6da7"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TabButton
            title="Announcements"
            isActive={activeTab === 'announcement'}
            onClick={() => setActiveTab('announcement')}
            iconName="bullhorn-outline"
            activeColor="#4a6da7"
            inactiveColor="#64748b"
          />
          <TabButton
            title="Forums"
            isActive={activeTab === 'forums'}
            onClick={() => setActiveTab('forums')}
            iconName="forum-outline"
            activeColor="#4a6da7"
            inactiveColor="#64748b"
          />
          {/* <TabButton
            title="Messages"
            isActive={activeTab === 'message'}
            onClick={() => setActiveTab('message')}
            iconName="email-outline"
            activeColor="#4a6da7"
            inactiveColor="#64748b"
          /> */}
          <TabButton
            title="Surveys"
            isActive={activeTab === 'surveys'}
            onClick={() => setActiveTab('surveys')}
            iconName="chart-box-outline"
            activeColor="#4a6da7"
            inactiveColor="#64748b"
          />
          {/* New Feeds Tab */}
          <TabButton
            title="Feeds"
            isActive={activeTab === 'feeds'}
            onClick={() => setActiveTab('feeds')}
            iconName="newspaper-variant-outline" // Using a feed-related icon
            activeColor="#4a6da7"
            inactiveColor="#64748b"
          />
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

export default CommunicationsScreen;
