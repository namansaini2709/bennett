import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard } from '../../components/ui/AnimatedComponents';
import * as Animatable from 'react-native-animatable';

const NotificationSettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Notification settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    reportUpdates: true,
    communityReports: true,
    assignmentNotifications: true,
    systemAlerts: true,
    emailNotifications: false,
    smsNotifications: false,
    marketingEmails: false,
    weeklyDigest: true,
    soundEnabled: true,
    vibrationEnabled: true,
    badge: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = () => {
    // Here you would typically save to AsyncStorage or API
    Alert.alert('Success', 'Notification preferences saved successfully!');
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              pushNotifications: true,
              reportUpdates: true,
              communityReports: true,
              assignmentNotifications: true,
              systemAlerts: true,
              emailNotifications: false,
              smsNotifications: false,
              marketingEmails: false,
              weeklyDigest: true,
              soundEnabled: true,
              vibrationEnabled: true,
              badge: true
            });
            Alert.alert('Reset Complete', 'Settings have been reset to defaults.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, onToggle, disabled = false }) => (
    <View style={[
      styles.settingItem,
      {
        backgroundColor: theme.colors.surface.primary,
        borderBottomColor: theme.colors.border.primary
      }
    ]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary.main + '20' }]}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.primary.main}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.text.secondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.colors.border.primary,
          true: theme.colors.primary.main + '60'
        }}
        thumbColor={value ? theme.colors.primary.main : theme.colors.text.tertiary}
        disabled={disabled}
      />
    </View>
  );

  const SettingSection = ({ title, children }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <AnimatedCard style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {children}
      </AnimatedCard>
    </Animatable.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            onPress={saveSettings}
            style={styles.saveButton}
          >
            <MaterialCommunityIcons
              name="check"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Push Notifications */}
        <SettingSection title="Push Notifications">
          <SettingItem
            icon="bell"
            title="Enable Push Notifications"
            subtitle="Receive notifications on your device"
            value={settings.pushNotifications}
            onToggle={() => toggleSetting('pushNotifications')}
          />
          <SettingItem
            icon="update"
            title="Report Updates"
            subtitle="Get notified when your reports are updated"
            value={settings.reportUpdates}
            onToggle={() => toggleSetting('reportUpdates')}
            disabled={!settings.pushNotifications}
          />
          <SettingItem
            icon="map-marker-multiple"
            title="Community Reports"
            subtitle="New reports in your area"
            value={settings.communityReports}
            onToggle={() => toggleSetting('communityReports')}
            disabled={!settings.pushNotifications}
          />
          <SettingItem
            icon="account-group"
            title="Assignment Notifications"
            subtitle="When reports are assigned to staff"
            value={settings.assignmentNotifications}
            onToggle={() => toggleSetting('assignmentNotifications')}
            disabled={!settings.pushNotifications}
          />
          <SettingItem
            icon="alert"
            title="System Alerts"
            subtitle="Important system notifications"
            value={settings.systemAlerts}
            onToggle={() => toggleSetting('systemAlerts')}
            disabled={!settings.pushNotifications}
          />
        </SettingSection>

        {/* Email & SMS */}
        <SettingSection title="Email & SMS">
          <SettingItem
            icon="email"
            title="Email Notifications"
            subtitle="Receive updates via email"
            value={settings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
          />
          <SettingItem
            icon="message"
            title="SMS Notifications"
            subtitle="Receive updates via SMS"
            value={settings.smsNotifications}
            onToggle={() => toggleSetting('smsNotifications')}
          />
          <SettingItem
            icon="email-newsletter"
            title="Marketing Emails"
            subtitle="Product updates and tips"
            value={settings.marketingEmails}
            onToggle={() => toggleSetting('marketingEmails')}
          />
          <SettingItem
            icon="calendar-week"
            title="Weekly Digest"
            subtitle="Summary of your area's reports"
            value={settings.weeklyDigest}
            onToggle={() => toggleSetting('weeklyDigest')}
          />
        </SettingSection>

        {/* Sound & Vibration */}
        <SettingSection title="Sound & Vibration">
          <SettingItem
            icon="volume-high"
            title="Sound"
            subtitle="Play sound for notifications"
            value={settings.soundEnabled}
            onToggle={() => toggleSetting('soundEnabled')}
            disabled={!settings.pushNotifications}
          />
          <SettingItem
            icon="vibrate"
            title="Vibration"
            subtitle="Vibrate for notifications"
            value={settings.vibrationEnabled}
            onToggle={() => toggleSetting('vibrationEnabled')}
            disabled={!settings.pushNotifications}
          />
          <SettingItem
            icon="numeric"
            title="Badge Count"
            subtitle="Show unread count on app icon"
            value={settings.badge}
            onToggle={() => toggleSetting('badge')}
            disabled={!settings.pushNotifications}
          />
        </SettingSection>

        {/* Reset Button */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300}>
          <TouchableOpacity
            style={[styles.resetButton, {
              backgroundColor: theme.colors.surface.primary,
              borderColor: theme.colors.status.error + '30'
            }]}
            onPress={resetToDefaults}
          >
            <MaterialCommunityIcons
              name="restore"
              size={20}
              color={theme.colors.status.error}
            />
            <Text style={[styles.resetButtonText, { color: theme.colors.status.error }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NotificationSettingsScreen;