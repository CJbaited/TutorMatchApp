import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import OnboardingProgress from '../components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../services/supabase';

type DurationSelectionScreenRouteProp = RouteProp<RootStackParamList, 'DurationSelection'>;

const durations = [
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
  { label: '2 hours', value: '120' },
];

const DurationSelectionScreen = () => {
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DurationSelectionScreenRouteProp>();
  const { role, name, subject, area, format, location, frequency } = route.params;

  const handleFinish = async () => {
    if (!selectedDuration) {
      Alert.alert('Error', 'Please select a session duration');
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      if (role === 'tutor') {
        // For tutors, save in tutors table
        const { error: tutorError } = await supabase
          .from('tutors')
          .upsert([{
            user_id: user.id,
            name: name,
            specialization: Array.isArray(subject) ? subject : [subject],
            subject_areas: Array.isArray(area) ? area : [area],
            teaching_format: format,
            city: location?.split(',')[0]?.trim() || '',
            latitude: route.params.latitude,
            longitude: route.params.longitude,
            frequency: frequency,
            duration: selectedDuration,
            availability: null,
            rating: 0,
            reviews: 0,
            price: 0,
            active: true,
            joined_date: new Date().toISOString()
          }])
          .select()
          .single();

        if (tutorError) throw tutorError;
      } else {
        // For students, save in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subjects: subject,
            role: 'student',
            name: name,
            subjects: Array.isArray(subject) ? subject : [subject],
            subject_areas: { [subject[0]]: [area] },
            teaching_format: format, // This should now be one of: 'online', 'face_to_face', or 'hybrid'
            city: location?.split(',')[0]?.trim() || '',
            location: location,
            frequency: frequency,
            duration: selectedDuration,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      navigation.navigate('RegistrationComplete', { role });
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <OnboardingProgress currentStep={7} totalSteps={8} />

      <View style={styles.header}>
        <Text style={styles.title}>Session Duration</Text>
        <Text style={styles.subtitle}>
          How long would you prefer each session to last?
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.durationContainer}>
          <Image 
            source={require('../assets/clock-icon.png')} 
            style={styles.clockIcon}
            resizeMode="contain"
          />
          
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration.value}
              style={[
                styles.durationCard,
                selectedDuration === duration.value && styles.selectedDurationCard
              ]}
              onPress={() => setSelectedDuration(duration.value)}
            >
              <View style={styles.durationTextContainer}>
                <Text style={styles.durationTitle}>{duration.label}</Text>
              </View>
              
              {selectedDuration === duration.value && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#084843" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.finishButton, !selectedDuration && styles.disabledButton, isLoading && styles.disabledButton]}
        onPress={handleFinish}
        disabled={!selectedDuration || isLoading}
      >
        <Text style={styles.finishButtonText}>
          {isLoading ? 'Saving...' : 'Finish'}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#084843',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  clockIcon: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedDurationCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  durationTextContainer: {
    flex: 1,
  },
  durationTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  checkmarkContainer: {
    marginLeft: 10,
  },
  finishButton: {
    backgroundColor: '#084843',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DurationSelectionScreen;