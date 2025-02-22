import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import 'tailwindcss/tailwind.css';
import { RootStackParamList } from '../navigation/types';
import supabase from '../services/supabase';

type DurationSelectionScreenRouteProp = RouteProp<RootStackParamList, 'DurationSelection'>;

const durations = [
  { label: '30 minutes', value: '30_minutes' },
  { label: '1 hour', value: '1_hour' },
  { label: '1.5 hours', value: '1.5_hours' },
  { label: '2 hours', value: '2_hours' },
];

const DurationSelectionScreen = () => {
  const [duration, setDuration] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(durations);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DurationSelectionScreenRouteProp>();
  const { role, subject, area, format, location, frequency } = route.params;

  const handleFinish = async () => {
    if (duration) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }
  
        if (role === 'tutor'|| role === '') {
          // Single insert for tutors with all data
          const { error: tutorError } = await supabase
            .from('tutors')
            .upsert([{
              user_id: user.id,
              name: route.params.name,
              specialization: subject,
              subject_areas: [area],
              teaching_format: format,
              city: location,
              frequency: frequency,
              duration: duration,
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
            area: area,
            location: location,
            frequency: frequency,
            duration: duration,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

          if (profileError) throw profileError;
        }

        navigation.navigate('RegistrationComplete', { role });
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please select a duration');
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.title}>Select Duration</Text>
      <DropDownPicker
        open={open}
        value={duration}
        items={items}
        setOpen={setOpen}
        setValue={setDuration}
        setItems={setItems}
        containerStyle={{ width: '80%', marginBottom: 20 }}
        style={{ borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
        dropDownContainerStyle={{ backgroundColor: '#E8F5E9' }}
      />
      <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
        <Text style={styles.nextButtonText}>Finish</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  nextButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DurationSelectionScreen;