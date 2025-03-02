import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, CreditCard, HelpCircle, LogOut, Settings } from 'lucide-react-native';
import supabase from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/Theme';

interface TutorProfile {
  name: string;
  image_url: string;
}

const TutorSettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tutors')
        .select('name, image_url')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            {profile?.image_url ? (
              <Image 
                source={{ uri: profile.image_url }} 
                style={styles.profileImageStyle}
              />
            ) : (
              <User size={40} color={colors.primary} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}> Hello, {profile?.name || 'Loading...'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('TutorProfileEdit')}
          >
            <User size={20} color="#666" />
            <Text style={styles.settingText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <CreditCard size={20} color="#666" />
            <Text style={styles.settingText}>Payment Methods</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Settings size={20} color="#666" />
            <Text style={styles.settingText}>App Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('HelpCenter')}
            >
            <HelpCircle size={20} color="#666" />
            <Text style={styles.settingText}>Help Center</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#FF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImageStyle: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF4444',
    marginLeft: 12,
  },
});

export default TutorSettingsScreen;