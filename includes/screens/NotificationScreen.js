import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Pressable,
  StatusBar,
  ScrollView,
  //SafeAreaView,
  Switch, // Ensure Switch is imported as it's used within SettingItem
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

// --- Reusable SettingItem Components (defined within the same file as requested) ---
const statusBarContentStyle = 'dark-content';
const statusBarHeight =
  Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;

// A reusable component for individual settings with a switch
const SettingItem = ({
  iconName,
  title,
  description,
  switchValue,
  onToggle,
  showStatusBadge = false,
  statusText,
  statusColor,
  disabled = false, // Add a disabled prop for visual feedback
}) => {
  return (
    <View
      style={[
        settingItemStyles.settingItemContainer,
        disabled && settingItemStyles.disabledContainer,
      ]}>
      <View style={settingItemStyles.settingIconTextWrapper}>
        <Icon
          name={iconName}
          size={28}
          color={disabled ? '#BDBDBD' : '#424242'}
          style={settingItemStyles.settingIcon}
        />
        <View style={settingItemStyles.settingTextContent}>
          <View style={settingItemStyles.titleAndBadge}>
            <Text
              style={[
                settingItemStyles.settingTitle,
                disabled && settingItemStyles.disabledText,
              ]}>
              {title}
            </Text>
            {showStatusBadge && (
              <Text
                style={[
                  settingItemStyles.statusBadge,
                  {backgroundColor: statusColor},
                ]}>
                {statusText}
              </Text>
            )}
          </View>
          <Text
            style={[
              settingItemStyles.settingDescription,
              disabled && settingItemStyles.disabledText,
            ]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={switchValue}
        onValueChange={onToggle}
        trackColor={{false: '#9E9E9E', true: '#66BB6A'}} // Muted grey for false, vibrant green for true
        thumbColor={switchValue ? '#FFFFFF' : '#F4F3F4'}
        ios_backgroundColor="#E0E0E0"
        disabled={disabled} // Apply disabled state to switch
      />
    </View>
  );
};

// Styles for the SettingItem component
const settingItemStyles = StyleSheet.create({
  settingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18, // Increased padding for better touch targets
    paddingHorizontal: 18,
    borderRadius: 12, // More rounded corners
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, // Subtle shadow
    shadowRadius: 4,
    elevation: 3, // Android shadow
    borderBottomWidth: 0, // Removed this if not explicitly needed for internal spacing, the marginBottom handles it.
  },
  disabledContainer: {
    opacity: 0.7, // Reduce opacity for disabled items
  },
  disabledText: {
    color: '#9E9E9E', // Muted text color for disabled items
  },
  settingIconTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingIcon: {
    marginRight: 18, // Increased margin for icon
  },
  settingTextContent: {
    flex: 1,
  },
  titleAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Slightly more space for title/badge
  },
  settingTitle: {
    // fontFamily: 'Oswald-Medium', // Using your specified font
    fontSize: 17, // Slightly larger title
    fontWeight: '600', // Semibold
    color: '#212121',
  },
  statusBadge: {
    marginLeft: 12, // More space for badge
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20, // More rounded, pill-like badge
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    overflow: 'hidden',
    textTransform: 'uppercase', // Make badge text uppercase
  },
  settingDescription: {
    // fontFamily: 'Oswald-Light', // Using your specified font
    fontSize: 14, // Slightly larger description
    color: '#757575',
    lineHeight: 20, // Improved line height
  },
});

// A reusable component for settings that are actionable by tapping the whole row
// For cases where a switch might reflect status, but the action is a deeper dive
const ActionableSettingItem = ({
  iconName,
  title,
  description,
  onPress,
  showStatusBadge = false,
  statusText,
  statusColor,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        settingItemStyles.settingItemContainer, // Reusing base container styles
        pressed && settingItemStyles.actionableItemPressed,
      ]}
      android_ripple={{color: '#E0E0E0', borderless: false, radius: 25}} // Android ripple effect
    >
      <View style={settingItemStyles.settingIconTextWrapper}>
        <Icon
          name={iconName}
          size={28}
          color="#424242"
          style={settingItemStyles.settingIcon}
        />
        <View style={settingItemStyles.settingTextContent}>
          <View style={settingItemStyles.titleAndBadge}>
            <Text style={settingItemStyles.settingTitle}>{title}</Text>
            {showStatusBadge && (
              <Text
                style={[
                  settingItemStyles.statusBadge,
                  {backgroundColor: statusColor},
                ]}>
                {statusText}
              </Text>
            )}
          </View>
          <Text style={settingItemStyles.settingDescription}>
            {description}
          </Text>
        </View>
      </View>
      <Icon name="chevron-forward-outline" size={24} color="#BDBDBD" />{' '}
      {/* Chevron indicator */}
    </Pressable>
  );
};

// --- Main NotificationScreen Component ---

const NotificationScreen = ({navigation}) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false); // Default to false, then check
  const [isBatteryOptimizationDisabled, setIsBatteryOptimizationDisabled] =
    useState(true); // Default to true for iOS, check for Android

  // Logic for checking notification permissions
  const checkNotificationPermission = async () => {
    const settings = await notifee.getNotificationSettings();
    setIsNotificationsEnabled(
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED,
    );
  };

  // Logic for checking battery optimization status (Android only)
  const checkBatteryOptimizationStatus = async () => {
    if (Platform.OS === 'android') {
      const isBatteryOptimizationEnabled =
        await notifee.isBatteryOptimizationEnabled();
      setIsBatteryOptimizationDisabled(!isBatteryOptimizationEnabled); // State is true if disabled
    } else {
      setIsBatteryOptimizationDisabled(true); // Always true for iOS
    }
  };

  // Effect to run checks when screen is focused
  useFocusEffect(
    useCallback(() => {
      checkNotificationPermission();
      checkBatteryOptimizationStatus();
    }, []),
  );

  // Handlers for toggling settings
  const handleToggleNotifications = async () => {
    Alert.alert(
      'Notification Settings',
      'To manage app notifications, please open your device settings. Changes made there will reflect here.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Open Settings',
          onPress: async () => {
            await notifee.openNotificationSettings();
          },
        },
      ],
    );
  };

  const handleToggleBatteryOptimization = async () => {
    if (!isBatteryOptimizationDisabled) {
      // If it's currently enabled (i.e., !isBatteryOptimizationDisabled is true)
      Alert.alert(
        'Disable Battery Optimization',
        'For reliable real-time notifications, please disable battery optimization for this app in your device settings. Tap "Open Settings" to proceed.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: async () => {
              await notifee.openBatteryOptimizationSettings();
            },
          },
        ],
      );
    } else {
      // If it's already disabled, just inform them.
      Alert.alert(
        'Battery Optimization Status',
        'Battery optimization is already disabled for this app. Real-time notifications should function correctly.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={statusBarContentStyle}
      />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({pressed}) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          android_ripple={{color: '#E0E0E0', borderless: true, radius: 24}}>
          <Icon name="arrow-back" size={24} color="#424242" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.container}>
        <SettingItem
          iconName="notifications-outline"
          title="App Notifications"
          description="Control whether you receive alerts and updates from the app."
          switchValue={isNotificationsEnabled}
          onToggle={handleToggleNotifications} // This now primarily opens settings
          showStatusBadge={true}
          statusText={isNotificationsEnabled ? 'Allowed' : 'Blocked'}
          statusColor={isNotificationsEnabled ? '#4CAF50' : '#F44336'} // Green for allowed, Red for blocked
        />

        {Platform.OS === 'android' && (
          <>
            <SettingItem
              iconName="battery-charging-outline" // More appropriate icon for battery
              title="Battery Optimization"
              description="Disable for uninterrupted background operation and reliable notifications."
              switchValue={isBatteryOptimizationDisabled} // true if disabled, false if enabled
              onToggle={handleToggleBatteryOptimization}
              showStatusBadge={true}
              statusText={
                isBatteryOptimizationDisabled ? 'Disabled' : 'Enabled'
              }
              statusColor={
                isBatteryOptimizationDisabled ? '#4CAF50' : '#FF9800'
              } // Green for disabled, Orange for enabled (warning)
            />

            {/* Conditional "How to" guide for battery optimization */}
            {!isBatteryOptimizationDisabled && (
              <View style={styles.howToGuide}>
                <Text style={styles.howToTitle}>
                  How to Disable Battery Optimization:
                </Text>
                <Text style={styles.howToStep}>
                  1. Tap the switch above or "Open Settings" in the alert.
                </Text>
                <Text style={styles.howToStep}>
                  2. In App Info, find "Battery" or "Battery usage."
                </Text>
                <Text style={styles.howToStep}>
                  3. Select "Unrestricted" or "Don't optimize."
                </Text>
                <Text style={styles.howToStep}>
                  4. Return here; the status should update.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Add more notification-related settings here if applicable */}
        {/*
        <View style={styles.sectionDivider} />
        <SettingItem
          iconName="chatbox-outline"
          title="Push Notifications"
          description="Receive messages and alerts for new activities."
          switchValue={true} // Example: controlled by a different state
          onToggle={() => console.log('Toggle Push Notifications')}
        />
        <SettingItem
          iconName="mail-outline"
          title="Email Notifications"
          description="Get daily summary emails about your activity."
          switchValue={false}
          onToggle={() => console.log('Toggle Email Notifications')}
        />
        */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
     // Light grey background
     backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderBottomWidth:1,
    borderColor:'#ccc',
    height: 30 + statusBarHeight,
  },
  backButton: {
    padding: 10,
    borderRadius: 24,
    marginRight: 5,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)', // Slightly darker press state
  },
  headerTitle: {
    // fontFamily: 'Inter_28pt-Bold', // Use custom font if available
    fontSize: 20, // Larger title font size
    fontWeight: 'bold', // Ensure it's bold if custom font not loaded
    color: '#212121',
    marginLeft: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 5, // Slightly less top padding as items have their own padding
    backgroundColor: '#F5F8FA',
  },
  sectionDivider: {
    height: 4, // Thicker divider
    backgroundColor: '#E0E0E0', // Light grey
    marginVertical: 25, // More vertical space for clear section separation
    borderRadius: 2,
  },
  howToGuide: {
    backgroundColor: '#E8F5E9', // Light green background for informative guide
    padding: 18,
    borderRadius: 12,
    marginTop: -5, // Slightly overlap with the setting item for visual connection
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#A5D6A7', // Green border
  },
  howToTitle: {
    // fontFamily: 'Oswald-Medium',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#388E3C', // Darker green for title
    marginBottom: 8,
  },
  howToStep: {
    // fontFamily: 'Oswald-Light',
    fontSize: 13,
    color: '#4CAF50', // Medium green for steps
    marginBottom: 4,
  },
});

export default NotificationScreen;
