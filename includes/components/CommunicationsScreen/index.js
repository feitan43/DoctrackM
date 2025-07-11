import React, {useState} from 'react';
import {Text, TouchableOpacity, View, Modal, TouchableWithoutFeedback, ScrollView, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TabButton from './TabButton';
import AnnouncementTab from './AnnouncementTab';
import ForumsTab from './ForumsTab';
import MessageTab from './MessageTab';
import styles from './styles';

const CommunicationsScreen = ({ navigation }) => { // <--- Ensure navigation prop is received
  const [activeTab, setActiveTab] = useState('announcement');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const years = ['2025', '2024', '2023', '2022'];

  const renderContent = () => {
    switch (activeTab) {
      case 'announcement':
        return <AnnouncementTab selectedYear={selectedYear} />;
      case 'forums':
        return <ForumsTab selectedYear={selectedYear} />;
      case 'message':
        // Pass navigation prop to MessageTab
        return <MessageTab navigation={navigation} />; // <--- Pass navigation prop
      default:
        return <AnnouncementTab selectedYear={selectedYear} />;
    }
  };

  const handleYearSelect = year => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      console.warn("Navigation prop not available or goBack method not found.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={communicationsScreenStyles.headerMainRow}>
            <TouchableOpacity onPress={handleGoBack} style={communicationsScreenStyles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerText}>Communications</Text>

            <TouchableOpacity
              style={styles.yearSelector}
              onPress={() => setShowYearDropdown(true)}>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtext}>
            Stay connected with Doctrack Community
          </Text>
        </View>

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
          <TabButton
            title="Messages"
            isActive={activeTab === 'message'}
            onClick={() => setActiveTab('message')}
            iconName="email-outline"
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

const communicationsScreenStyles = StyleSheet.create({
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop:20
  },
  backButton: {
    paddingRight: 15,
  },
});

export default CommunicationsScreen;