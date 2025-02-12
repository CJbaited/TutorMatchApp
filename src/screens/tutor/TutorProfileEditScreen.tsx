import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  Image, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/Theme';
import supabase from '../../services/supabase';

const TutorProfileEditScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    image_url: '',
    affiliation: '',
    specialization: [],
    subject_areas: [],
    price: '',
    about: '',
    teaching_style: '',
    experience: '',
    achievements: '',
    teaching_format: '',
    city: '',
    latitude: null,
    longitude: null,
    teaching_radius: '',
    active: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('tutors')
        .upsert({
          user_id: user.id,
          ...profile,
        });

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          <View style={styles.imageContainer}>
            {profile.image_url ? (
              <Image source={{ uri: profile.image_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Camera size={40} color="#666" />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({...profile, name: text})}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Affiliation</Text>
            <TextInput
              style={styles.input}
              value={profile.affiliation}
              onChangeText={(text) => setProfile({...profile, affiliation: text})}
              placeholder="e.g. University, Institution"
            />
          </View>
        </View>

        {/* Teaching Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specialization</Text>
            <TextInput
              style={styles.input}
              value={profile.specialization.join(', ')}
              onChangeText={(text) => setProfile({...profile, specialization: text.split(',')})}
              placeholder="e.g. Mathematics, Physics"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject Areas</Text>
            <TextInput
              style={styles.input}
              value={profile.subject_areas.join(', ')}
              onChangeText={(text) => setProfile({...profile, subject_areas: text.split(',')})}
              placeholder="e.g. Calculus, Algebra"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate ($)</Text>
            <TextInput
              style={styles.input}
              value={profile.price}
              onChangeText={(text) => setProfile({...profile, price: text})}
              keyboardType="numeric"
              placeholder="Enter your hourly rate"
            />
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.experience}
              onChangeText={(text) => setProfile({...profile, experience: text})}
              multiline
              numberOfLines={4}
              placeholder="Share your teaching experience and qualifications"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Achievements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.achievements}
              onChangeText={(text) => setProfile({...profile, achievements: text})}
              multiline
              numberOfLines={4}
              placeholder="List your notable achievements and certifications"
            />
          </View>
        </View>

        {/* Profile Status */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Profile Active</Text>
            <Switch
              value={profile.active}
              onValueChange={(value) => setProfile({...profile, active: value})}
              trackColor={{ false: '#D1D1D1', true: colors.primary }}
            />
          </View>
        </View>

        {/* Preview Button */}
        <TouchableOpacity 
          style={styles.previewButton}
          onPress={() => navigation.navigate('TutorProfile', { tutor: profile })}
        >
          <Text style={styles.previewButtonText}>Preview Profile</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    padding: 8,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  previewButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  previewButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TutorProfileEditScreen;