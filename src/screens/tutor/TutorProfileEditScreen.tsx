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
  ActivityIndicator,
  Modal,
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X } from 'lucide-react-native';
import { colors } from '../../theme/Theme';
import supabase from '../../services/supabase';
import { subjects, subjectAreas } from '../../config/subjectsConfig';
import { Ionicons } from '@expo/vector-icons';

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
  
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showAreasModal, setShowAreasModal] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Add this useEffect to initialize selections from profile
  useEffect(() => {
    if (profile.specialization) {
      setSelectedSubjects(profile.specialization);
    }
    if (profile.subject_areas) {
      setSelectedAreas(profile.subject_areas);
    }
  }, [profile]);

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
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      if (!profile.price || profile.price <= 0) {
        Alert.alert('Error', 'Please enter a valid hourly rate');
        return;
      }

      // Create the updated profile data
      const updatedProfile = {
        ...profile,
        specialization: selectedSubjects,
        subject_areas: selectedAreas,
        price: parseInt(profile.price.toString()), 
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tutors')
        .upsert({
          user_id: user.id,
          ...updatedProfile,
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => {
      const newSubjects = prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject];
      
      // Update the profile state with new subjects
      setProfile(currentProfile => ({
        ...currentProfile,
        specialization: newSubjects
      }));
      
      return newSubjects;
    });
  };

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => {
      const newAreas = prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area];
      
      // Update the profile state with new areas
      setProfile(currentProfile => ({
        ...currentProfile,
        subject_areas: newAreas
      }));
      
      return newAreas;
    });
  };

  const renderSubjectsModal = () => (
    <Modal
      visible={showSubjectsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSubjectsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Subjects</Text>
            <TouchableOpacity onPress={() => setShowSubjectsModal(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={subjects}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.selectionItem,
                  selectedSubjects.includes(item) && styles.selectedItem
                ]}
                onPress={() => toggleSubject(item)}
              >
                <Text style={[
                  styles.selectionText,
                  selectedSubjects.includes(item) && styles.selectedText
                ]}>{item}</Text>
                {selectedSubjects.includes(item) && (
                  <Ionicons name="checkmark-circle" size={24} color="#084843" />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
          />
        </View>
      </View>
    </Modal>
  );

  const renderAreasModal = () => (
    <Modal
      visible={showAreasModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAreasModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Subject Areas</Text>
            <TouchableOpacity onPress={() => setShowAreasModal(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedSubjects.flatMap(subject => 
              (subjectAreas[subject] || []).map(area => ({
                subject,
                area
              }))
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.selectionItem,
                  selectedAreas.includes(item.area) && styles.selectedItem
                ]}
                onPress={() => toggleArea(item.area)}
              >
                <View>
                  <Text style={[
                    styles.selectionText,
                    selectedAreas.includes(item.area) && styles.selectedText
                  ]}>{item.area}</Text>
                  <Text style={styles.subjectLabel}>{item.subject}</Text>
                </View>
                {selectedAreas.includes(item.area) && (
                  <Ionicons name="checkmark-circle" size={24} color="#084843" />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={item => `${item.subject}-${item.area}`}
          />
        </View>
      </View>
    </Modal>
  );

  // Replace the existing Teaching Details section with this:
  const renderTeachingDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Teaching Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subjects</Text>
        <TouchableOpacity 
          style={styles.selectionButton}
          onPress={() => setShowSubjectsModal(true)}
        >
          {selectedSubjects.length > 0 ? (
            <Text style={styles.selectedValues}>
              {selectedSubjects.join(', ')}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>Select your subjects</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subject Areas</Text>
        <TouchableOpacity 
          style={styles.selectionButton}
          onPress={() => setShowAreasModal(true)}
          disabled={selectedSubjects.length === 0}
        >
          {selectedAreas.length > 0 ? (
            <Text style={styles.selectedValues}>
              {selectedAreas.join(', ')}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              {selectedSubjects.length === 0 
                ? 'Select subjects first' 
                : 'Select your subject areas'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Add Price Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hourly Rate (NT$)</Text>
        <TextInput
          style={[styles.input, styles.priceInput]}
          value={profile.price ? profile.price.toString() : ''}
          onChangeText={(text) => {
            // Only allow numbers
            const numericValue = text.replace(/[^0-9]/g, '');
            setProfile({...profile, price: parseInt(numericValue) || 0});
          }}
          placeholder="Enter your hourly rate"
          keyboardType="numeric"
        />
        <Text style={styles.priceHint}>
          Recommended range: NT$500 - NT$2000 per hour
        </Text>
      </View>
    </View>
  );

  // Add these styles
  const additionalStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333',
    },
    selectionButton: {
      backgroundColor: '#F8F9FA',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    selectedValues: {
      fontSize: 16,
      color: '#333',
    },
    placeholderText: {
      fontSize: 16,
      color: '#999',
    },
    selectionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    selectedItem: {
      backgroundColor: '#E8F5E9',
    },
    selectionText: {
      fontSize: 16,
      color: '#333',
    },
    selectedText: {
      color: '#084843',
      fontWeight: '500',
    },
    subjectLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
    }
  });

  // Merge the additional styles with existing styles
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333',
    },
    selectionButton: {
      backgroundColor: '#F8F9FA',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    selectedValues: {
      fontSize: 16,
      color: '#333',
    },
    placeholderText: {
      fontSize: 16,
      color: '#999',
    },
    selectionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    selectedItem: {
      backgroundColor: '#E8F5E9',
    },
    selectionText: {
      fontSize: 16,
      color: '#333',
    },
    selectedText: {
      color: '#084843',
      fontWeight: '500',
    },
    subjectLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
    },
    priceInput: {
      fontSize: 16,
      color: '#333',
    },
    priceHint: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      fontStyle: 'italic',
    }
  });

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
        {renderTeachingDetails()}

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
        {renderSubjectsModal()}
        {renderAreasModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TutorProfileEditScreen;