import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import supabase from '../services/supabase';
import Slider from '@react-native-community/slider';
import { subjects, subjectAreas } from '../config/subjectsConfig';


const teachingFormats = ['online', 'face_to_face', 'hybrid'];
const frequencies = [
  { label: '1x per week', value: '1' },
  { label: '2x per week', value: '2' },
  { label: '3x per week', value: '3' },
  { label: '4x per week', value: '4' },
  { label: 'Once every 2 weeks', value: '0.5' },
  { label: 'Once every 3 weeks', value: '0.33' },
  { label: 'Once per month', value: '0.25' },
];

const PreferencesScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<{
    subjects: string[];
    subject_areas: Record<string, string[]>;
    teaching_format: string;
    frequency: string;
    location: string;
  }>({
    subjects: [],
    subject_areas: {},
    teaching_format: '',
    frequency: '',
    location: '',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      let subjectsArray = [];
      let subjectAreasObj = {};

      if (profile.subjects) {
        subjectsArray = Array.isArray(profile.subjects) 
          ? profile.subjects 
          : typeof profile.subjects === 'string'
            ? JSON.parse(profile.subjects)
            : [];
      }

      if (profile.subject_areas) {
        subjectAreasObj = typeof profile.subject_areas === 'string'
          ? JSON.parse(profile.subject_areas)
          : profile.subject_areas || {};
      }

      setPreferences({
        subjects: subjectsArray,
        subject_areas: subjectAreasObj,
        teaching_format: profile.teaching_format || '',
        frequency: profile.frequency || '',
        location: profile.location || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setPreferences(prev => {
      const currentSubjects = Array.isArray(prev.subjects) ? prev.subjects : [];
      const currentAreas = { ...prev.subject_areas };
      
      if (currentSubjects.includes(subject)) {
        // Remove subject and its areas
        if (currentSubjects.length > 1) {
          delete currentAreas[subject];
          return {
            ...prev,
            subjects: currentSubjects.filter(s => s !== subject),
            subject_areas: currentAreas
          };
        }
        return prev;
      }
      
      // Add subject
      return {
        ...prev,
        subjects: [...currentSubjects, subject],
        subject_areas: {
          ...currentAreas,
          [subject]: [] // Initialize empty areas array for new subject
        }
      };
    });
  };

  const handleAreaToggle = (subject: string, area: string) => {
    setPreferences(prev => {
      const currentAreas = prev.subject_areas[subject] || [];
      const updatedAreas = currentAreas.includes(area)
        ? currentAreas.filter(a => a !== area)
        : [...currentAreas, area];

      return {
        ...prev,
        subject_areas: {
          ...prev.subject_areas,
          [subject]: updatedAreas
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Clean subjects array - remove any old/invalid data
      const cleanSubjects = [...new Set(preferences.subjects)].filter(Boolean);

      const { error } = await supabase
        .from('profiles')
        .update({
          ...preferences,
          subjects: cleanSubjects // Sending clean array to Supabase
        })
        .eq('user_id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Preferences updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects & Areas</Text>
          <View style={styles.subjectsGrid}>
            {Object.keys(subjectAreas).map((subject) => (
              <View key={subject} style={styles.subjectContainer}>
                <TouchableOpacity
                  style={[
                    styles.subjectButton,
                    preferences.subjects.includes(subject) && styles.selectedButton
                  ]}
                  onPress={() => handleSubjectToggle(subject)}
                >
                  <Text
                    style={[
                      styles.subjectButtonText,
                      preferences.subjects.includes(subject) && styles.selectedButtonText
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
                
                {preferences.subjects.includes(subject) && (
                  <View style={styles.areasContainer}>
                    {subjectAreas[subject].map((area) => (
                      <TouchableOpacity
                        key={area}
                        style={[
                          styles.areaButton,
                          (preferences.subject_areas[subject]?.includes(area)) && styles.selectedAreaButton
                        ]}
                        onPress={() => handleAreaToggle(subject, area)}
                      >
                        <Text
                          style={[
                            styles.areaButtonText,
                            (preferences.subject_areas[subject]?.includes(area)) && styles.selectedButtonText
                          ]}
                        >
                          {area}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Format</Text>
          <View style={styles.formatOptions}>
            {teachingFormats.map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.formatButton,
                  preferences.teaching_format === format && styles.selectedButton
                ]}
                onPress={() => setPreferences(prev => ({ ...prev, teaching_format: format }))}
              >
                {preferences.teaching_format === format && (
                  <Check size={16} color="#FFF" style={styles.checkIcon} />
                )}
                <Text
                  style={[
                    styles.formatButtonText,
                    preferences.teaching_format === format && styles.selectedButtonText
                  ]}
                >
                  {format.replace('_', ' ').charAt(0).toUpperCase() + format.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={6}
                step={1}
                value={frequencies.findIndex(f => f.value === preferences.frequency)}
                onValueChange={(value) => {
                  setPreferences(prev => ({
                    ...prev,
                    frequency: frequencies[value]?.value || '1'
                  }));
                }}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={colors.primary}
              />
              <Text style={styles.frequencyLabel}>
                {frequencies.find(f => f.value === preferences.frequency)?.label || '1x per week'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.flexibleButton,
                preferences.frequency === 'flexible' && styles.selectedButton
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                frequency: prev.frequency === 'flexible' ? '1' : 'flexible'
              }))}
            >
              <Text style={[
                styles.flexibleButtonText,
                preferences.frequency === 'flexible' && styles.selectedButtonText
              ]}>
                Flexible
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    minWidth: '30%',
    alignItems: 'center',
  },
  formatOptions: {
    gap: 8,
  },
  formatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  checkIcon: {
    marginRight: 8,
  },
  frequencyContainer: {
    marginTop: 8,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  frequencyLabel: {
    textAlign: 'center',
    marginTop: 8,
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  flexibleButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  flexibleButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  frequencyOptions: {
    gap: 8,
  },
  frequencyButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  subjectButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  formatButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  frequencyButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subjectContainer: {
    width: '100%',
    marginBottom: 16,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingLeft: 16,
  },
  areaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  selectedAreaButton: {
    backgroundColor: colors.primary,
  },
  areaButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default PreferencesScreen;