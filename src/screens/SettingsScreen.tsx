import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, Globe, Clock, Shield, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/Theme';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailNotifications: true,
    autoMatchmaking: true,
    showOnlineStatus: true,
  });

  const SettingSwitch = ({ value, onValueChange, label, description }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D1D6', true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );

  const NavigationItem = ({ label, onPress }) => (
    <TouchableOpacity style={styles.navigationItem} onPress={onPress}>
      <Text style={styles.navigationLabel}>{label}</Text>
      <ChevronRight size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingSwitch
            value={settings.darkMode}
            onValueChange={(value) => setSettings({...settings, darkMode: value})}
            label="Dark Mode"
            description="Switch between light and dark themes"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingSwitch
            value={settings.notifications}
            onValueChange={(value) => setSettings({...settings, notifications: value})}
            label="Push Notifications"
            description="Receive notifications about new matches and messages"
          />
          <SettingSwitch
            value={settings.emailNotifications}
            onValueChange={(value) => setSettings({...settings, emailNotifications: value})}
            label="Email Notifications"
            description="Receive email updates about your account"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matchmaking</Text>
          <SettingSwitch
            value={settings.autoMatchmaking}
            onValueChange={(value) => setSettings({...settings, autoMatchmaking: value})}
            label="Auto-Matchmaking"
            description="Automatically match with compatible tutors/students"
          />
          <SettingSwitch
            value={settings.showOnlineStatus}
            onValueChange={(value) => setSettings({...settings, showOnlineStatus: value})}
            label="Show Online Status"
            description="Let others see when you're online"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <NavigationItem 
            label="Privacy Settings" 
            onPress={() => {/* Navigate to Privacy Settings */}}
          />
          <NavigationItem 
            label="Security Settings" 
            onPress={() => {/* Navigate to Security Settings */}}
          />
          <NavigationItem 
            label="Data & Storage" 
            onPress={() => {/* Navigate to Data Settings */}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  navigationLabel: {
    fontSize: 16,
    color: '#333',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen;